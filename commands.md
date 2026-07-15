# Commands

Inside the `gs` shell you interact with the target by typing **commands** at the
`(gs) ❯` prompt. There are two kinds:

- **Built-in commands** — shell controls that ship with `gs` (listed below).
- **Module commands** — every loaded [module](/modules) contributes a command of
  the same name that runs it against the current target.

List everything available in the current session at any time with
[`help`](#help).

## Built-in commands

| Command | Description |
| --- | --- |
| [`help`](#help) | List the available commands and flags. |
| [`clear`](#clear) | Clear the terminal buffer. |
| [`install`](#install) | Install a module. |
| [`uninstall`](#uninstall) | Remove an installed module. |
| [`exit`](#exit) | Exit the `gs` shell. |

### `help`

Prints every command registered in the current session — built-ins **and**
module commands — each with its one-line description, followed by the global
flags.

```
(gs) ❯ help
```

### `clear`

Clears the current terminal buffer, like `clear`/`cls` in a normal shell.

```
(gs) ❯ clear
```

### `install`

Installs a module and registers it as a new command for the rest of the
session. It takes a single module reference:

```
(gs) ❯ install <module-ref>
```

The reference is either a **registry reference** or a **direct manifest URL**:

```
(gs) ❯ install idank/nginx@1.0.0
(gs) ❯ install https://example.com/my-module/manifest.json
```

A registry reference has the form `author/module@version` and is resolved
against the [GoScouter registry](https://github.com/GoScouter/registry).
GoScouter downloads the binary for your platform, verifies its SHA-256 checksum,
caches it, and makes the new command available immediately:

```
» Resolving module idank/nginx@1.0.0
Installing nginx@1.0.0
Downloading https://github.com/GoScouter/nginx-module/releases/download/1.0.0/nginx
Installed nginx (…bytes) to ~/.cache/gs/nginx
✓ Command nginx is now available
```

Once installed, invoke it like any other module:

```
(gs) ❯ nginx
```

Installed binaries are cached under your user cache directory (for example
`~/.cache/gs` on Linux) and reload automatically the next time you start `gs`.
See [Installing modules](/modules#installing-modules) for the full flow and
[Publishing a Module](/publishing) for how references and manifests are built.

::: tip
The command name for an installed module comes from its **binary file name**,
not its display name — a binary named `nginx` is invoked as `nginx`.
:::

### `uninstall`

Removes a previously installed module by name and unregisters its command:

```
(gs) ❯ uninstall <module-name>
```

```
(gs) ❯ uninstall nginx
Uninstalled nginx from ~/.cache/gs/nginx
✓ Command nginx is no longer available
```

Only [installed](#install) modules can be removed; the built-in modules that
ship with `gs` are always present.

### `exit`

Exits the `gs` shell.

```
(gs) ❯ exit
```

You can also press **Ctrl-D** on an empty line to exit, or **Ctrl-C** to abandon
the line you're currently typing without quitting.

## Global flags

Flags are passed to the `gs` binary on the command line, not at the prompt.

| Flag | Description |
| --- | --- |
| `--target` | The site GoScouter targets. Required. |

```sh
./gs --target https://example.com
```
