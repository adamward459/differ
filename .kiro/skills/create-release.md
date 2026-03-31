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

### 5. Build for macOS and Windows

Run electron-builder for both platforms:

```bash
npx electron-builder --mac --config
npx electron-builder --win --config
```

Build artifacts will be in the `dist/` directory. Common outputs:

- macOS: `.dmg`, `.zip`
- Windows: `.exe`, `.msi`

If the user only wants one platform, build for that platform only.

If a build fails (e.g., cross-compilation not available), skip that platform's artifacts and note it in the release body.

### 6. Create the GitHub Release

```bash
gh release create "v<version>" \
  --title "v<version>" \
  --generate-notes \
  dist/*
```

This uploads all build artifacts from `dist/` and auto-generates release notes from commits since the last tag.

If the user wants a custom title or body, use `--title` and `--notes` flags instead of `--generate-notes`.

For a pre-release (alpha, beta, rc), add the `--prerelease` flag.

For a draft release, add the `--draft` flag.

### 7. Confirm

After the release is created, print the release URL:

```bash
gh release view "v<version>" --json url -q ".url"
```

## Options the User May Request

- `--draft`: Create as a draft release (not published).
- `--prerelease`: Mark as a pre-release.
- `--mac-only` or `--win-only`: Build and attach artifacts for a single platform.
- `--skip-build`: Skip the build step and only create the tag + release (no artifacts).
- `--notes "..."`: Custom release notes instead of auto-generated ones.
- Custom version: Override the version from `package.json`.

## Error Handling

- If `gh` is not installed, tell the user to install it: `brew install gh` (macOS) or `winget install GitHub.cli` (Windows).
- If `git push` fails, check if the remote is configured and the user has push access.
- If `electron-builder` fails, show the error output and suggest checking the build config.
- If `gh release create` fails because the release already exists, ask the user whether to delete and recreate it using `gh release delete "v<version>" --yes` then retry.
