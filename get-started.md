# Get Started

GoScouter (`gs`) is a fast, no-nonsense toolkit for scouting, probing, and
analyzing the net. It runs as an interactive terminal application: you point it
at a target site, and it drops you into a shell where built-in commands and
[modules](/sdk) gather information about that target.

GoScouter is written in Go and runs on **Linux, macOS, and Windows**.

## Prerequisites

- [Go 1.26+](https://go.dev/dl/) to build from source.
- `make` (optional, but the repository ships a `Makefile` with the common
  targets).

## Install

Clone the repository and build the `gs` binary:

```sh
git clone https://github.com/GoScouter/goscouter.git
cd goscouter
make build
```

This produces a `gs` executable in the project root. Without `make`, the
equivalent build is:

```sh
go build -o gs ./cmd
```

On Windows the binary is `gs.exe`; substitute it for `./gs` in the commands
below.

## Run

GoScouter always needs a `--target`. The target must include an `http://` or
`https://` prefix:

```sh
./gs --target https://example.com
```

You can also run it straight from source without producing a binary:

```sh
make run
# or
go run ./cmd --target https://example.com
```

## How it works

When you launch `gs`, it walks through a short startup sequence:

1. **Validates the target.** GoScouter sends a request to the site and checks
   that it responds successfully (an HTTP `2xx` status) within a 5-second
   timeout. If the site can't be reached, it stops before doing anything else:

   ```
   Cannot reach targeted website!
   ```

2. **Connects and enters the shell.** On success you'll see the banner and a
   confirmation, then GoScouter puts the terminal into raw mode and starts its
   interactive prompt:

   ```
   Targeting site: https://example.com
   Successfully connected to the target website!
   (gs) >
   ```

3. **Runs commands and modules.** At the `(gs) >` prompt you type commands to
   scout the target. GoScouter ships with a set of built-in commands, and
   [modules](/sdk) add new capabilities on top — each module contributes its own
   command that runs against the current target.

### Built-in commands

| Command | Description |
| --- | --- |
| `help` | List the available built-in commands and flags. |
| `clear` | Clear the current terminal buffer. |
| `exit` | Exit the `gs` shell. |

You can also leave the shell at any time with **Ctrl-D**, and **Ctrl-C**
abandons the current line without quitting.

### Modules

Everything beyond the built-ins comes from **modules** — self-contained scouting
capabilities that GoScouter discovers, loads, and runs against your target. A
module is just a standalone executable that speaks GoScouter's protocol, so it
can be written in any language.

Want to build your own? Head to the [SDK Reference](/sdk).

## Platform support

GoScouter is pure Go and its terminal handling works across platforms, so the
same `gs` binary behaves the same on:

- **Linux**
- **macOS**
- **Windows**

Build on the platform you want to run on, or cross-compile with Go's built-in
`GOOS`/`GOARCH` support:

```sh
# Example: build a Windows binary from any platform
GOOS=windows GOARCH=amd64 go build -o gs.exe ./cmd
```
