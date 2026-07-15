# Modules

Everything GoScouter does to a target beyond the built-in shell controls comes
from **modules** — self-contained scouting capabilities. Each loaded module
contributes a [command](/commands) of the same name; running it scouts the
current target and prints the result.

GoScouter ships with four modules and can [install](#installing-modules) more
from the registry. To build your own, see the [SDK Reference](/sdk).

## Built-in modules

| Module | What it does |
| --- | --- |
| [`dns`](#dns) | Gather the target domain's DNS records. |
| [`http`](#http) | Gather the target's HTTP response information. |
| [`subdomains`](#subdomains) | Enumerate subdomains from certificate transparency. |
| [`scan`](#scan) | Crawl the target and its subdomains into an HTML graph. |

Invoke any of them by name, and pass module-specific flags after the name:

```
(gs) ❯ dns
(gs) ❯ http --ssl
(gs) ❯ scan --out report.html
```

### `dns`

Resolves the target's domain and reports the DNS records it finds — `A`,
`AAAA`, `CNAME`, `MX`, `NS`, and `TXT`. Lookups run against the system resolver
with a 5-second timeout.

```
(gs) ❯ dns

[DNS]
  A      93.184.216.34
  AAAA   2606:2800:220:1:248:1893:25c8:1946
  NS     a.iana-servers.net.
  NS     b.iana-servers.net.
```

Only record types that resolve are shown.

### `http`

Sends a request to the target and reports the response: status, protocol, any
redirect chain, and the full set of response headers.

```
(gs) ❯ http

[HTTP]
  Status   : 200 OK
  Protocol : HTTP/2.0
  Headers  :
    Content-Type: text/html; charset=UTF-8
    Server: ECS (dcb/7F84)
    ...
```

| Flag | Description |
| --- | --- |
| `--ssl` | Force the `https://` scheme on the target (default is `http://`). |

```
(gs) ❯ http --ssl
```

When a request is redirected, the final URL is reported alongside the original.

### `subdomains`

Enumerates subdomains of the target domain by querying certificate-transparency
sources — [crt.sh](https://crt.sh) and
[Cert Spotter](https://sslmate.com/certspotter/) — concurrently, then merging
and de-duplicating the results. Each entry shows the name and the most recent
time it was seen in a certificate.

```
(gs) ❯ subdomains

[+] Found: api.example.com (2024-03-11T00:00:00Z)
[+] Found: mail.example.com (2023-09-02T00:00:00Z)
[+] Found: www.example.com (2024-05-20T00:00:00Z)
```

The whole enumeration is bounded by a 5-second timeout. If one source fails but
another succeeds, you still get results; only when every source fails does the
module report an error.

### `scan`

The most thorough built-in. `scan` enumerates the target's subdomains, then
probes the target **and every subdomain** by running all the other loaded
modules (the built-ins plus anything you have installed) against each host. It
renders the findings as an interactive **spider-web HTML graph** and writes it to
disk, printing a summary in the terminal.

```
(gs) ❯ scan

[SCAN]
  Target      : example.com
  Subdomains  : 12 discovered
  Reachable   : 5
  Graph       : gs-scan-example.com.html
```

| Flag | Description |
| --- | --- |
| `--out` | Path for the generated HTML graph. Defaults to `gs-scan-<host>.html`. |

```
(gs) ❯ scan --out report.html
```

Open the generated file in a browser to explore the graph — the root node is
the target and each reachable subdomain hangs off it, with the per-module output
attached to each host.

::: tip
`scan` runs every module except `subdomains` and `scan` themselves against each
host, so installing more modules automatically makes your scans richer.
:::

## Installing modules

Add a module to your session with the [`install`](/commands#install) command.
It accepts either a **registry reference** (`author/module@version`) or a direct
URL to a module manifest:

```
(gs) ❯ install idank/nginx@1.0.0
```

GoScouter resolves the module's manifest, downloads the binary built for your
platform, verifies its SHA-256 checksum, and caches it under your user cache
directory (for example `~/.cache/gs`). The new command is available right away:

```
(gs) ❯ nginx
```

Cached modules reload automatically every time you start `gs`, so you only
install once. Remove one with [`uninstall`](/commands#uninstall):

```
(gs) ❯ uninstall nginx
```

For the manifest format, platform keys, and how the registry is laid out, see
[Publishing a Module](/publishing).

## Writing your own

A module is just a standalone executable that speaks GoScouter's protocol, so it
can be written in any language. The [SDK](/sdk) gives you the Go interfaces and a
single-call `Serve` helper to build one in a few lines. Head to the
[SDK Reference](/sdk) to get started, then [publish it](/publishing) so others
can `install` it.
