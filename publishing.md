# Publishing a Module

Once you've built a module with the [SDK](/sdk), publishing it lets other people
install and run it against their own targets. A module is published straight
from its **Git repository**: you commit a `manifest.json` describing your
releases, host the built binaries at downloadable URLs, and share the repo. An
operator then installs it by reference:

```
(gs) ❯ install github.com/GoScouter/nginx-module@1.0.0
```

There is no central gatekeeper — anyone who can host a Git repository and a set
of binaries can publish a module, and every install is verified by a **SHA-256
checksum**.

## How installation resolves

When an operator runs `install <repo>@<version>`, GoScouter always does the same
thing:

1. **Clone the repository.** GoScouter clones `<repo>` and reads the
   `manifest.json` at its root. If the reference has no scheme, GoScouter tries
   `https://` first and falls back to `http://`.
2. **Pick the release.** It looks up the `releases` entry keyed by
   `<version>/<GOOS>-<GOARCH>` for the operator's platform — for example
   `1.0.0/linux-amd64`. If there's no matching entry the install fails with a
   "cannot find matching release" error.
3. **Download and verify.** It downloads that entry's `binary`, verifies the
   download against its `sha256`, marks it executable, and caches it under the
   user cache directory (e.g. `~/.cache/gs`). A checksum mismatch aborts the
   install and removes the partial file.
4. **Register the command.** The module is registered as a command named after
   the **downloaded binary's file name**.

From there the module is cached, reloads automatically on the next `gs` start,
and can be removed with [`uninstall`](/commands#uninstall).

## The manifest

A manifest is a small JSON document, committed to the **root of your module's
Git repository**, that lists every release you publish:

```json
{
  "name": "nginx",
  "releases": {
    "1.0.0/linux-amd64": {
      "sha256": "e7f1d1b839780b44f17f25adb0c6956645f431b3028299cf32805088c258f9be",
      "binary": "https://github.com/GoScouter/nginx-module/releases/download/1.0.0/nginx"
    },
    "1.0.0/darwin-arm64": {
      "sha256": "…",
      "binary": "https://github.com/GoScouter/nginx-module/releases/download/1.0.0/nginx-darwin"
    },
    "1.0.0/windows-amd64": {
      "sha256": "…",
      "binary": "https://github.com/GoScouter/nginx-module/releases/download/1.0.0/nginx.exe"
    }
  }
}
```

| Field | Description |
| --- | --- |
| `name` | The module name, shown while installing. |
| `releases` | A map from a **release key** to the binary for that key. |

Each release entry has:

| Field | Description |
| --- | --- |
| `binary` | A URL GoScouter downloads the executable from. |
| `sha256` | The lowercase hex SHA-256 of that binary. The download is rejected on mismatch. |

### Release keys

Each key combines the **version** with the target platform, written as Go's
`GOOS-GOARCH`:

```
<version>/<GOOS>-<GOARCH>
```

So `1.0.0/linux-amd64` is version `1.0.0` for 64-bit Linux, and
`1.0.0/darwin-arm64` is the same version for Apple-silicon macOS. Common
platform values:

| `GOOS` | OS |     | `GOARCH` | CPU |
| --- | --- | --- | --- | --- |
| `linux` | Linux |   | `amd64` | 64-bit x86 |
| `darwin` | macOS |  | `arm64` | 64-bit ARM |
| `windows` | Windows | | | |

Add an entry for every version-and-platform combination you ship. If an
operator's platform has no entry for the requested version, the install fails
with a "cannot find matching release" error, so provide as many as you can
build.

::: warning
The install command name comes from the **binary's file name**, not the manifest
`name`. Name your Windows asset `<module>.exe` and your other assets `<module>`
so the module is invoked by a consistent name on every platform.
:::

## Building and hosting the binaries

Build a static binary for each platform you want to support. Because a module is
a normal Go program, cross-compiling is just `GOOS`/`GOARCH`:

```sh
# Linux
CGO_ENABLED=0 GOOS=linux   GOARCH=amd64 go build -o nginx      .
# macOS
CGO_ENABLED=0 GOOS=darwin  GOARCH=amd64 go build -o nginx      .
# Windows
CGO_ENABLED=0 GOOS=windows GOARCH=amd64 go build -o nginx.exe  .
```

Host each binary at a stable, publicly downloadable URL — a **GitHub Release**
asset is the convention used by the existing modules. Then compute the checksum
of each file for the manifest:

```sh
sha256sum nginx
# e7f1d1b839780b44f17f25adb0c6956645f431b3028299cf32805088c258f9be  nginx
```

On macOS use `shasum -a 256`; on Windows,
`Get-FileHash nginx.exe -Algorithm SHA256`.

Put each URL and checksum into the matching `releases` entry, then commit the
manifest to your repository's root.

## Versioning

Because a release key carries its version, several versions can live in the same
`manifest.json` side by side — keep `1.0.0/linux-amd64` while you add
`1.1.0/linux-amd64`, and older references keep resolving. An operator picks the
version they want at install time:

```
(gs) ❯ install github.com/GoScouter/nginx-module@1.1.0
```

## Checklist

- [ ] Module built with the [SDK](/sdk) and tested locally.
- [ ] Binaries built for each platform, with consistent file names.
- [ ] Binaries hosted at stable, downloadable URLs.
- [ ] SHA-256 checksums computed for every binary.
- [ ] `manifest.json` written with a `name` and a `releases` entry
      (`<version>/<GOOS>-<GOARCH>`) for each binary.
- [ ] Manifest committed to the **root** of a publicly cloneable Git repository.
- [ ] Install verified end to end — `install <repo>@<version>`.
