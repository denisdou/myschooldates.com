# IndexNow Content URL Submission

This project submits public URLs by scanning the structured district, calendar, and
state content files. For a requested date, it includes:

- each matching school-year URL;
- its district hub URL;
- its state-level URL;
- state pages whose own content record matches the date.

Calendar and district records are selected only by `lastVerifiedAt`; their
`dateCreated`, `datePublished`, and `dateModified` values do not place them in a
date-filtered submission. A matching calendar automatically includes its district
hub and state page. A district record can also match directly when it has its own
`lastVerifiedAt` value. State records continue to use `dateCreated` or
`datePublished` when present, then fall back to `lastVerifiedAt`. The content
roadmap is not read by this script.

## One-time setup

1. Generate an IndexNow key containing 8-128 letters, numbers, or dashes.
2. Add the value to the project root `.env` file:

   ```dotenv
   INDEXNOW_KEY=your-indexnow-key
   ```

3. Generate the UTF-8 verification file from `.env`:

   ```bash
   pnpm indexnow:prepare
   ```

4. Commit and deploy the generated file under `public/` so it is available at
   `https://myschooldates.com/{key}.txt` with HTTP 200.

The script automatically loads the project root `.env`. The file is ignored by Git;
`.env.example` documents the available settings without containing a real key.

The verification file must be at the site root. A key file in a subdirectory only
authorizes URLs below that subdirectory and cannot verify district hub URLs.
The live submission performs a preflight request and stops before contacting
IndexNow when the deployed key file is missing or does not match `.env`.

`pnpm build` and `pnpm generate` also prepare the key file automatically when
`INDEXNOW_KEY` is available. For a remote CI deployment, configure `INDEXNOW_KEY`
in the hosting provider's build environment because the local `.env` is not pushed.

## Usage

Preview today's matching content URLs without sending a request:

```bash
pnpm indexnow -- --dry-run
```

Submit today's URLs:

```bash
pnpm indexnow
```

Preview or submit an explicit review date:

```bash
pnpm indexnow -- --date 2026-08-06 --dry-run
pnpm indexnow -- --date 2026-08-06
```

`2026-08-06` can also be passed as a positional argument. The date defaults to the
machine's local calendar date, not UTC. A date with no matching content records
exits successfully without contacting IndexNow. Use `--all` to include every state,
district hub, and school-year URL.

## Configuration

| Environment variable | Required | Default | Purpose |
|---|---:|---|---|
| `INDEXNOW_KEY` | Live submissions only | None | IndexNow ownership key |
| `INDEXNOW_SITE_URL` | No | `https://myschooldates.com` | Canonical origin used to build URLs |
| `INDEXNOW_KEY_LOCATION` | No | `https://myschooldates.com/{key}.txt` | Public root-level key file |
| `INDEXNOW_ENDPOINT` | No | `https://api.indexnow.org/indexnow` | IndexNow POST endpoint |

Equivalent command options are available for the site URL, key location, and
endpoint. Run `pnpm indexnow -- --help` for the complete list.

## Validation and responses

Before submission, the script validates the date, reads the structured content
records, resolves district and state slugs, deduplicates URLs, and accepts IndexNow
HTTP 200 and 202 responses. It prints specific guidance for HTTP 400, 403, 422, and
429 errors.

An accepted IndexNow request means participating search engines received the URLs;
it does not guarantee that Bing will crawl or index every page.

## Troubleshooting Bing ownership errors

If the key URL returns HTTP 200 with the exact key but Bing still responds with
`UserForbiddedToAccessSite`, the local file and request payload have already passed
the checks available to this script. Verify the exact `https://myschooldates.com`
property directly in Bing Webmaster Tools using DNS, XML, or meta-tag verification,
then allow time for the verification state to propagate before retrying.

If Bing continues rejecting the same host/key binding after site verification,
generate a new IndexNow key, update `.env`, run `pnpm indexnow:prepare`, deploy the
new root key file, and retry with a small URL batch.
