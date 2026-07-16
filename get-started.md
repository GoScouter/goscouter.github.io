# Get Started

GoScouter (`gs`) is a fast, no-nonsense toolkit for scouting, probing, and
analyzing the net. It runs as an interactive terminal application: you point it
at a target site, and it drops you into a shell where built-in
[commands](/commands) and [modules](/modules) gather information about that
target.

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

GoScouter always needs a `--target`:

```sh
./gs --target https://example.com
```

Without a target it prints usage and exits:

```
Usage: gs --target <example.com>
```

You can also run it straight from source without producing a binary:

```sh
go run ./cmd --target https://example.com
```

## How it works

When you launch `gs`, it walks through a short startup sequence:

1. **Prints the banner** with the build version and time.

2. **Enters the interactive shell.** GoScouter records the target, puts the
   terminal into raw mode, loads its [modules](/modules), and shows the prompt:

   ```
    ██████╗  ██████╗ ███████╗ ██████╗ ██████╗ ██╗   ██╗████████╗███████╗██████╗
   ██╔════╝ ██╔═══██╗██╔════╝██╔════╝██╔═══██╗██║   ██║╚══██╔══╝██╔════╝██╔══██╗
   ██║  ███╗██║   ██║███████╗██║     ██║   ██║██║   ██║   ██║   █████╗  ██████╔╝
   ██║   ██║██║   ██║╚════██║██║     ██║   ██║██║   ██║   ██║   ██╔══╝  ██╔══██╗
   ╚██████╔╝╚██████╔╝███████║╚██████╗╚██████╔╝╚██████╔╝   ██║   ███████╗██║  ██║
    ╚═════╝  ╚═════╝ ╚══════╝ ╚═════╝ ╚═════╝  ╚═════╝    ╚═╝   ╚══════╝╚═╝  ╚═╝

                        GS dev • unknown

   Target: https://example.com
   (gs) ❯
   ```

3. **Runs commands and modules.** At the `(gs) ❯` prompt you type commands to
   scout the target. GoScouter ships with a set of built-in
   [commands](/commands) and built-in [modules](/modules), and you can
   [install](/modules#installing-modules) more — each module contributes its own
   command that runs against the current target.

## Your first scout

Every module is invoked by name at the prompt. Try the built-ins against your
target:

```
(gs) ❯ http
(gs) ❯ dns
(gs) ❯ subdomains
(gs) ❯ scan
```

`http` fingerprints the response, `dns` pulls the domain's records,
`subdomains` enumerates subdomains from certificate transparency, and `scan`
crawls the whole domain and writes an HTML graph. See [Modules](/modules) for
the full list and their options.

Type `help` at any time to list every available command, or `info` to see the
build version, platform, and project links:

```
(gs) ❯ help
(gs) ❯ info
```

## Line editing and history

The prompt supports basic line editing while you type:

- **Backspace** deletes the character before the cursor.
- **↑ / ↓** arrows scroll through the commands you've already run this session,
  so you can re-run or tweak a previous command without retyping it.

## Leaving the shell

- Type `exit` to quit.
- **Ctrl-D** on an empty line exits the shell.
- **Ctrl-C** abandons the current line without quitting.

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

## Where to next

- **[Commands](/commands)** — the built-in shell commands, including installing
  and removing modules.
- **[Modules](/modules)** — the scouting capabilities that ship in the box and
  how to add more.
- **[SDK Reference](/sdk)** — build your own module in Go (or any language).
- **[Publishing a Module](/publishing)** — package and share a module from its
  Git repository.
