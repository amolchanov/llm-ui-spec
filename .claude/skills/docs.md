# /docs - Sync and Deploy Documentation

Syncs spec files to VitePress docs folder and optionally deploys.

## Usage

- `/docs` - Sync spec files to docs/ folder
- `/docs build` - Sync and build locally
- `/docs deploy` - Sync, commit, and push to trigger GitHub Pages deployment

## Steps

### Sync (always runs first)

1. Copy updated spec files from root to docs:
   - `SPEC.md` → `docs/spec/index.md`
   - `SPEC.webapp.md` → `docs/spec/webapp.md`
   - `SPEC.mobile.md` → `docs/spec/mobile.md`
   - `SPEC.desktop.md` → `docs/spec/desktop.md`
   - `docs/platform-mapping.md` → `docs/reference/platform-mapping.md`

2. Fix internal links for VitePress:
   - `./SPEC.md` → `./`
   - `./SPEC.webapp.md` → `./webapp`
   - `./SPEC.mobile.md` → `./mobile`
   - `./SPEC.desktop.md` → `./desktop`

### Build (if `build` arg)

Run `npm run docs:build` and report any errors.

### Deploy (if `deploy` arg)

1. Run sync steps above
2. Stage docs changes: `git add docs/`
3. Commit with message: "Update documentation"
4. Push to trigger GitHub Actions deployment
5. Report: "Pushed! GitHub Actions will deploy to https://llm-ui-spec.org/"
