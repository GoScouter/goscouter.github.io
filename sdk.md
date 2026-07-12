# SDK Reference

The GoScouter SDK defines the contract for building **modules** — self-contained
scouting capabilities that the GoScouter host discovers, loads, and runs against
a target.

```
go get github.com/GoScouter/sdk
```

```go
import "github.com/GoScouter/sdk"
```

## Overview

A module is a single scouting capability: given a `target`, it gathers
information and returns a renderable result. You implement the behaviour; the
GoScouter host is responsible for discovering, downloading, caching, and running
your module.

A module is distributed as a **standalone executable**. The host loads that
binary with [`Open`](#func-open), which returns a [`Binary`](#type-binary) that
runs the executable as a subprocess. Because the contract is a command-line
protocol, a module can be written in any language — the Go [`Module`](#type-module)
and [`Result`](#type-result) interfaces simply describe the same contract in Go
terms.

## The module protocol

Every module binary must implement two subcommands:

| Command | Behaviour |
| --- | --- |
| `<binary> describe` | Write a JSON [`Descriptor`](#type-descriptor) to stdout and exit `0`. |
| `<binary> scout -target <target>` | Run against `target`, write the rendered result to stdout, and exit `0`. On failure, write a message to stderr and exit non-zero. |

Any executable that honours this protocol is a valid module, regardless of the
language it is written in.

## Protocol version

```go
const ProtocolVersion = 1
```

`ProtocolVersion` is the version of the host↔module wire protocol implemented by
this SDK. A module binary reports it in its [`Descriptor`](#type-descriptor) so
the host can refuse binaries built against an incompatible protocol.

## Interfaces

### type Module

```go
type Module interface {
    // Name is the unique identifier the module is invoked by. It must be
    // stable, lower-case, and contain no spaces.
    Name() string

    // Description is a one-line human-readable summary shown in help output.
    Description() string

    // Version is the module's own version, independent of the SDK version.
    // Semantic versioning (e.g. "1.2.0") is recommended.
    Version() string

    // Scout gathers information about target and returns a renderable result.
    // target is the raw string supplied by the operator (typically a URL).
    Scout(target string) (Result, error)
}
```

`Module` is a scouting capability that GoScouter can run against a target.

Implementations must be **safe to call concurrently**: the host may invoke
`Scout` on the same `Module` value from multiple goroutines.

### type Result

```go
type Result interface {
    // Render returns the result formatted for display in the GoScouter
    // terminal. Use "\r\n" line endings, as the host runs in raw mode.
    Render() string
}
```

`Result` is the outcome of a [`Module.Scout`](#type-module) call. It knows how to
present itself as terminal-ready text.

::: tip
The host runs its terminal in raw mode, so `Render` should use `"\r\n"` line
endings rather than a bare `"\n"`.
:::

## Descriptor

### type Descriptor

```go
type Descriptor struct {
    // Protocol is the wire-protocol version the binary was built against.
    Protocol int `json:"protocol"`
    // Name is the unique identifier the module is invoked by.
    Name string `json:"name"`
    // Description is a one-line human-readable summary.
    Description string `json:"description"`
    // Version is the module's own version.
    Version string `json:"version"`
}
```

`Descriptor` is the metadata a module binary reports in response to the
`describe` command. It is the JSON contract a module binary writes and
[`Open`](#func-open) reads.

A `describe` implementation writes it as JSON:

```json
{
  "protocol": 1,
  "name": "headers",
  "description": "inspect a target's HTTP response headers",
  "version": "1.0.0"
}
```

## Loading a module

### type Binary

```go
type Binary struct {
    // unexported fields
}
```

`Binary` is a handle to a downloaded module binary. It implements
[`Module`](#type-module) by invoking the binary as a subprocess, so the host can
treat a downloaded module exactly like an in-process one.

Downloading, verifying, and caching the binary on disk is the host's
responsibility; `Binary` only speaks the protocol to an already-present
executable at its path.

### func Open

```go
func Open(path string) (*Binary, error)
```

`Open` loads the module binary at `path`. It runs the binary's `describe`
command to read its metadata and rejects binaries built against an incompatible
[`ProtocolVersion`](#protocol-version), reporting an empty module name, or that
otherwise fail to describe themselves.

```go
b, err := sdk.Open("/path/to/module-binary")
if err != nil {
    log.Fatal(err)
}

fmt.Println(b.Name(), b.Version())
```

### func (\*Binary) Path

```go
func (b *Binary) Path() string
```

`Path` returns the filesystem path of the underlying binary.

### func (\*Binary) Name

```go
func (b *Binary) Name() string
```

`Name` returns the module's unique identifier, as reported by `describe`.

### func (\*Binary) Description

```go
func (b *Binary) Description() string
```

`Description` returns the module's one-line summary, as reported by `describe`.

### func (\*Binary) Version

```go
func (b *Binary) Version() string
```

`Version` returns the module's own version, as reported by `describe`.

### func (\*Binary) Scout

```go
func (b *Binary) Scout(target string) (Result, error)
```

`Scout` runs the binary's `scout` command against `target` and returns its
rendered output as a [`Result`](#type-result). If the binary exits non-zero,
`Scout` returns an error carrying the message the binary wrote to stderr.

```go
res, err := b.Scout("example.com")
if err != nil {
    log.Fatal(err)
}
fmt.Print(res.Render())
```

## Example: a minimal module

A module binary just needs to answer the two protocol subcommands. Here is a
complete `headers` module written with the standard library:

```go
package main

import (
    "encoding/json"
    "flag"
    "fmt"
    "net/http"
    "os"
    "strings"
)

const (
    name        = "headers"
    description = "inspect a target's HTTP response headers"
    version     = "1.0.0"
)

func main() {
    if len(os.Args) < 2 {
        os.Exit(2)
    }

    switch os.Args[1] {
    case "describe":
        json.NewEncoder(os.Stdout).Encode(map[string]any{
            "protocol":    1,
            "name":        name,
            "description": description,
            "version":     version,
        })
    case "scout":
        fs := flag.NewFlagSet("scout", flag.ExitOnError)
        target := fs.String("target", "", "target to scout")
        fs.Parse(os.Args[2:])

        resp, err := http.Get(*target)
        if err != nil {
            fmt.Fprintln(os.Stderr, err)
            os.Exit(1)
        }
        defer resp.Body.Close()

        var b strings.Builder
        for k, v := range resp.Header {
            fmt.Fprintf(&b, "%s: %s\r\n", k, strings.Join(v, ", "))
        }
        fmt.Print(b.String())
    default:
        os.Exit(2)
    }
}
```

Build it, and the host can load and run it:

```go
b, _ := sdk.Open("./headers")
res, _ := b.Scout("https://example.com")
fmt.Print(res.Render())
```
