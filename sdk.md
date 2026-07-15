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

A module is distributed as a **standalone executable**. The host spawns that
binary once and talks to it over a small line-based JSON protocol on stdin and
stdout, reusing the same process for every scout until it is closed. Because the
contract is a wire protocol rather than a Go API, a module can be written in any
language — the Go [`Module`](#type-module) and [`Result`](#type-result)
interfaces simply describe the same contract in Go terms.

If you write your module in Go, you never touch the wire format directly:
[`Serve`](#func-serve) implements the whole module side, and
[`Open`](#func-open) implements the host side.

## Protocol version

```go
const ProtocolVersion = 3
```

`ProtocolVersion` is the version of the host↔module wire protocol implemented by
this SDK. A module reports it in its [`Descriptor`](#type-descriptor) during the
handshake so the host can refuse binaries built against an incompatible
protocol.

## The module protocol

The host and module communicate over the module's **stdin and stdout**, one JSON
message per line. The process is long-lived: the host spawns it once, performs a
`describe` handshake, then issues any number of `scout` requests before closing
the session by shutting stdin.

Every request carries an `id` so many requests can be in flight at once; the
matching response echoes that `id`.

**Requests** (host → module), one per line on stdin:

```json
{"id":1,"method":"describe"}
{"id":2,"method":"scout","target":"https://example.com","args":["--ssl"]}
```

**Responses** (module → host), one per line on stdout:

```json
{"id":1,"descriptor":{"protocol":3,"name":"headers","description":"…","version":"1.0.0"}}
{"id":2,"result":"…rendered text…"}
{"id":2,"error":"could not reach target"}
```

A response carries exactly one of `descriptor`, `result`, or `error`. Any
executable that honours this protocol is a valid module, regardless of the
language it is written in.

::: tip
In Go you don't implement any of this by hand — [`Serve`](#func-serve) reads the
requests, dispatches them concurrently, and writes the responses for you.
:::

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
    // args carries any module-specific flags the operator passed after the
    // module name (e.g. []string{"--ssl"}); modules that take no options
    // ignore it.
    Scout(target string, args []string) (Result, error)
}
```

`Module` is a scouting capability that GoScouter can run against a target.

Implementations must be **safe to call concurrently**: [`Serve`](#func-serve)
dispatches each request in its own goroutine, so the host may invoke `Scout` on
the same `Module` value from multiple goroutines at once.

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

`Descriptor` is the metadata a module reports in response to a `describe`
request. [`Serve`](#func-serve) fills it in from your [`Module`](#type-module),
and [`Open`](#func-open) reads it during the handshake and rejects a binary
whose `Protocol` does not match the host's [`ProtocolVersion`](#protocol-version)
or whose `Name` is empty.

## Serving a module

### func Serve

```go
func Serve(m Module) error
```

`Serve` runs `m` as a module binary, speaking the stdio protocol on the
process's stdin and stdout. It is the entire body a module author needs in
`main`:

```go
func main() {
    if err := sdk.Serve(myModule{}); err != nil {
        log.Fatal(err)
    }
}
```

`Serve` reads one JSON request per line from stdin and writes one JSON response
per line to stdout, dispatching each request in its own goroutine so a single
process can service many targets concurrently. Because requests run
concurrently, `m` must be safe for concurrent use, as [`Module`](#type-module)
requires. `Serve` returns when stdin reaches EOF, which the host triggers by
closing the session.

## Loading a module (host side)

The host side is what GoScouter itself uses to run a module binary. You only need
these APIs if you are embedding module-loading in your own program; module
authors use [`Serve`](#func-serve).

### type Binary

```go
type Binary struct {
    // unexported fields
}
```

`Binary` is a handle to a **running** module binary. It implements
[`Module`](#type-module) by speaking the stdio protocol to a single long-lived
subprocess: the process is spawned once by [`Open`](#func-open) and reused for
every [`Scout`](#func-binary-scout) call until [`Close`](#func-binary-close).
This keeps a scan of many targets to one subprocess per module instead of one
per target.

A `Binary` is safe for concurrent use — `Scout` may be called from many
goroutines at once. Downloading, verifying, and caching the binary on disk is the
host's responsibility; `Binary` only manages the process and the protocol once
the executable is present at its path.

### func Open

```go
func Open(path string) (*Binary, error)
```

`Open` spawns the module binary at `path` and completes a `describe` handshake.
It starts the process, reads the module's [`Descriptor`](#type-descriptor), and
rejects binaries built against an incompatible
[`ProtocolVersion`](#protocol-version), that report an empty name, or that
otherwise fail to describe themselves. The process stays running until
[`Close`](#func-binary-close) — **callers must `Close` every `Binary` they
`Open`.**

```go
b, err := sdk.Open("/path/to/module-binary")
if err != nil {
    log.Fatal(err)
}
defer b.Close()

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

### func (\*Binary) Scout {#func-binary-scout}

```go
func (b *Binary) Scout(target string, args []string) (Result, error)
```

`Scout` asks the module to run against `target`, forwarding any module-specific
`args` verbatim, and returns its rendered output as a [`Result`](#type-result).
It is safe to call concurrently from multiple goroutines on the same `Binary`.
If the module exits or the request fails, `Scout` returns an error carrying the
message the module wrote to stderr.

```go
res, err := b.Scout("https://example.com", []string{"--ssl"})
if err != nil {
    log.Fatal(err)
}
fmt.Print(res.Render())
```

### func (\*Binary) Close {#func-binary-close}

```go
func (b *Binary) Close() error
```

`Close` shuts the session down: it signals the module to exit by closing its
stdin, waits for the read loop to drain, and reaps the process. It is safe to
call more than once. Any `Scout` call made after `Close` fails.

## Example: a minimal module

A module only needs to implement [`Module`](#type-module) and hand it to
[`Serve`](#func-serve). Here is a complete `headers` module that reports a
target's HTTP response headers, written with the standard library:

```go
package main

import (
    "fmt"
    "log"
    "net/http"
    "strings"

    "github.com/GoScouter/sdk"
)

type headers struct{}

func (headers) Name() string        { return "headers" }
func (headers) Description() string  { return "inspect a target's HTTP response headers" }
func (headers) Version() string      { return "1.0.0" }

func (headers) Scout(target string, args []string) (sdk.Result, error) {
    resp, err := http.Get(target)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    var b strings.Builder
    for k, v := range resp.Header {
        // Raw mode: use \r\n line endings.
        fmt.Fprintf(&b, "%s: %s\r\n", k, strings.Join(v, ", "))
    }
    return result(b.String()), nil
}

// result is a Result whose rendering is the text we built.
type result string

func (r result) Render() string { return string(r) }

func main() {
    if err := sdk.Serve(headers{}); err != nil {
        log.Fatal(err)
    }
}
```

Build it, and the host can load and run it:

```go
b, _ := sdk.Open("./headers")
defer b.Close()

res, _ := b.Scout("https://example.com", nil)
fmt.Print(res.Render())
```

Ready to share it? Package a manifest and publish it so anyone can `install` it —
see [Publishing a Module](/publishing).
