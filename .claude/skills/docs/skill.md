---
name: docs
user-invocable: true
description: Sync spec files to VitePress docs folder and deploy to GitHub Pages. Use when the user wants to update or deploy documentation.
---

# docs

Sync spec files to VitePress docs folder and optionally deploy to GitHub Pages.

## When to use

Use this skill when the user wants to:
- Sync documentation
- Update the docs site
- Deploy documentation
- Build the docs locally

Examples: "/docs", "/docs build", "/docs deploy", "sync docs", "update documentation", "deploy docs"

## Arguments

- No args: Sync only
- `build`: Sync and build locally
- `deploy`: Sync, commit, and push to trigger GitHub Pages

## Instructions

### Step 1: Sync spec files

Copy and transform spec files from root to docs/:

1. Copy `SPEC.md` to `docs/spec/index.md`
2. Copy `SPEC.webapp.md` to `docs/spec/webapp.md`
3. Copy `SPEC.mobile.md` to `docs/spec/mobile.md`
4. Copy `SPEC.desktop.md` to `docs/spec/desktop.md`
5. Copy `docs/platform-mapping.md` to `docs/reference/platform-mapping.md`

After copying, fix internal links in `docs/spec/index.md`:
- Replace `./SPEC.webapp.md` with `./webapp`
- Replace `./SPEC.mobile.md` with `./mobile`
- Replace `./SPEC.desktop.md` with `./desktop`

And fix links in the platform files (webapp.md, mobile.md, desktop.md):
- Replace `./SPEC.md` with `./`

### Step 2: Build (if `build` argument)

Run `npm run docs:build` and report success or errors.

### Step 3: Deploy (if `deploy` argument)

1. Complete sync steps above
2. Stage changes: `git add docs/`
3. Commit: `git commit -m "Update documentation"`
4. Push: `git push`
5. Report: "Pushed! GitHub Actions will deploy to https://llm-ui-spec.org/"
