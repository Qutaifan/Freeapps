
## CI Quality Gates

Two GitHub Actions jobs validate every pull request against `main`:

- **content-quality** — lifecycle-aware quality gate for `reviews/*.html`
  (`.github/scripts/content_quality.py`).
- **compliance** — 8 sitewide technical/policy checks
  (`.github/scripts/compliance.py`).

Both are non-deploying: checkout + run script, no secrets, no Cloudflare
access. `deploy` also reports on pull requests (skipping its production
steps on anything but a push to `main`), so all three checks are visible
before merge.
