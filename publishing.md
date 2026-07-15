# Publishing a Module

Once you've built a module with the [SDK](/sdk), publishing it lets other people
install and run it against their own targets. Every published module — no matter
who ships it — is described by the same **manifest** and verified by the same
**SHA-256 checksum**. What differs is *where the manifest lives* and *how it is
installed*.

## Two kinds of modules

GoScouter recognises two kinds of modules, and the difference is entirely about
distribution:

| | Official | Non-official |
| --- | --- | --- |
| **Where the manifest lives** | The [GoScouter registry](https://github.com/GoScouter/registry) | Anywhere you can host a file |
| **Who manages it** | The GoScouter authors curate and gate what lands in the registry | You — no review, no gatekeeper |
| **How you install it** | By reference: `install author/module@version` | By manifest URL: `install https://…/manifest.json` |
| **Discoverable** | Yes — listed in the registry | Only if you share the link |

Both use the **exact same manifest format** and the same checksum verification.
An official module is just a non-official module whose manifest has been accepted
into the registry, which is what makes the short `author/module@version`
reference resolve.

::: tip
Start non-official. Host a manifest, share the link, iterate. When the module is
stable and you want it discoverable under a short reference, submit it to the
registry to make it official.
:::

## The manifest

A manifest is a small JSON document describing one version of your module. It is
identical for official and non-official modules:

```json
{
  "name": "nginx",
  "version": "1.0.0",
  "platforms": {
    "linux": {
      "sha256": "e7f1d1b839780b44f17f25adb0c6956645f431b3028299cf32805088c258f9be",
      "binary": "https://github.com/GoScouter/nginx-module/releases/download/1.0.0/nginx"
    }
  }
}
```

| Field | Description |
| --- | --- |
| `name` | The module name. For an official install it must match the `module` part of the reference. |
| `version` | The module version. For an official install it must match the `@version` in the reference. |
| `platforms` | A map from platform key to the binary for that platform. |

Each platform entry has:

| Field | Description |
| --- | --- |
| `binary` | A URL GoScouter downloads the executable from. |
| `sha256` | The lowercase hex SHA-256 of that binary. The download is rejected on mismatch. |

### Platform keys

Platform keys are Go's `GOOS` values for the operating systems you support:

| Key | OS |
| --- | --- |
| `linux` | Linux |
| `darwin` | macOS |
| `windows` | Windows |

Add an entry for every platform you ship. If an operator's OS has no entry, the
install fails with a "cannot find binary matching your platform" error, so
provide as many as you can build.

::: warning
The install command name comes from the **binary's file name**, not the
manifest `name`. Name your Windows asset `<module>.exe` and your other assets
`<module>` so the module is invoked by a consistent name on every platform.
:::

## Building and hosting the binaries

This step is the same regardless of which kind of module you're publishing.

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

Put each URL and checksum into the matching `platforms` entry.

## How installation resolves

When an operator installs a module, GoScouter always ends up doing the same
thing — the only difference is how it *finds* the manifest.

1. **Get the manifest.**
   - *Official:* from `install author/module@version`, GoScouter fetches
     `.../registry/main/<author>/<module>/<version>/manifest.json` and checks the
     manifest's `name` and `version` match the reference.
   - *Non-official:* from `install <url>`, GoScouter fetches the manifest at that
     URL directly.
2. Pick the entry under `platforms` matching the operator's OS.
3. Download that binary, verify its **SHA-256 checksum**, mark it executable, and
   cache it under the user cache directory (e.g. `~/.cache/gs`).
4. Register it as a command named after the **downloaded binary's file name**.

From here both paths are identical: the module is cached, reloads automatically
on the next `gs` start, and can be removed with
[`uninstall`](/commands#uninstall).

## Official modules

Official modules live in the [GoScouter registry](https://github.com/GoScouter/registry)
and are curated by the GoScouter authors — only manifests accepted into that
repository become installable by short reference. This is what lets an operator
write:

```
(gs) ❯ install idank/nginx@1.0.0
```

Each published version is a manifest at a path built from the reference:

```
<author>/<module>/<version>/manifest.json
```

So `install idank/nginx@1.0.0` resolves to:

```
idank/nginx/1.0.0/manifest.json
```

To make a module official, add your manifest at that path and open a pull
request against the registry; the authors review and merge it. Because each new
version is its own directory, `1.0.0`, `1.1.0`, and so on live side by side and
older references keep working.

## Non-official modules

You don't have to go through the registry at all. `install` also accepts a
direct URL to a manifest, so anyone can publish and manage a module themselves,
without review:

```
(gs) ❯ install https://example.com/nginx/manifest.json
```

Host the manifest anywhere downloadable — a GitHub raw URL, a release asset, your
own server — and share the link. The manifest format and checksum verification
are exactly the same as for official modules; you are simply responsible for
hosting it and telling people the URL.

This is the right choice for:

- **Testing** a module before submitting it to the registry.
- **Private or internal** modules you don't want publicly listed.
- **Anything** you'd rather manage yourself instead of through the registry.

## Checklist

- [ ] Module built with the [SDK](/sdk) and tested locally.
- [ ] Binaries built for each platform, with consistent file names.
- [ ] Binaries hosted at stable, downloadable URLs.
- [ ] SHA-256 checksums computed for every binary.
- [ ] Manifest written with matching `name`, `version`, and `platforms`.
- [ ] **Official:** manifest submitted to the registry at
      `<author>/<module>/<version>/manifest.json` and merged.
- [ ] **Non-official:** manifest hosted at a stable URL and the link shared.
- [ ] Install verified end to end — `install author/module@version` (official) or
      `install <manifest-url>` (non-official).
