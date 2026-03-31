---
inclusion: manual
---

# Create Tag & Release (macOS + Windows)

This skill uses the `gh` CLI to create a Git tag and GitHub release for the **differ** Electron app, targeting macOS and Windows.

## Prerequisites

- `gh` CLI installed and authenticated (`gh auth status`)
- `electron-builder` configured in the project
- A clean working tree (no uncommitted changes)

## Steps

### 1. Validate Environment

Before anything, confirm the environment is ready:

```bash
gh auth status
git status --porcelain
```

- If `gh` is not authenticated, instruct the user to run `gh auth login`.
- If the working tree is dirty, warn the user and ask whether to proceed.

### 2. Determine Version

Read the version from `package.json` (`version` field). Use it as the tag name with a `v` prefix (e.g., `v0.0.1`).

If the user provides a custom version, use that instead. Ensure it follows semver (e.g., `1.2.3`).

### 3. Check for Existing Tag

```bash
git tag -l "v<version>"
```

If the tag already exists, ask the user whether to overwrite (delete + recreate) or abort.

### 4. Create the Git Tag

```bash
git tag -a "v<version>" -m "Release v<version>"
git push origin "v<version>"
```

### 5. Create the GitHub Release (without artifacts)

```bash
gh release create "v<version>" \
  --title "v<version>" \
  --generate-notes
```

For a pre-release (alpha, beta, rc), add the `--prerelease` flag.
For a draft release, add the `--draft` flag.
If the user wants custom notes, use `--notes "..."` instead of `--generate-notes`.

### 6. CI Builds & Uploads

Pushing the tag triggers `.github/workflows/release.yml`, which:

- Builds on `macos-latest` (mac) and `windows-latest` (win) in parallel
- Uploads `.dmg`, `.zip`, and `.exe` artifacts to the release automatically

Monitor the workflow:

```bash
gh run list --workflow=release.yml --limit=1
gh run watch
```

### 7. Confirm

After CI completes, verify the release:

```bash
gh release view "v<version>" --json url,assets -q "{url: .url, assets: [.assets[].name]}"
```

## Options the User May Request

- `--draft`: Create as a draft release (not published).
- `--prerelease`: Mark as a pre-release.
- `--notes "..."`: Custom release notes instead of auto-generated ones.
- Custom version: Override the version from `package.json`.

## Error Handling

- If `gh` is not installed, tell the user to install it: `brew install gh` (macOS) or `winget install GitHub.cli` (Windows).
- If `git push` fails, check if the remote is configured and the user has push access.
- If `gh release create` fails because the release already exists, ask the user whether to delete and recreate it using `gh release delete "v<version>" --yes` then retry.
- If CI fails, check the workflow run: `gh run list --workflow=release.yml --limit=1` then `gh run view <run-id> --log-failed`.
