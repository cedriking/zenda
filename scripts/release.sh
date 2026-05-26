#!/usr/bin/env bash
set -euo pipefail

# Zenda Release Script
# Usage: npm run release [patch|minor|major]
# Default: patch (0.1.0 -> 0.1.1)
#
# This script:
# 1. Reads current version from root package.json
# 2. Bumps version (patch/minor/major) across ALL package.json files
# 3. Commits the version bump
# 4. Creates a git tag (v{version})
# 5. Pushes commit + tag to origin
# 6. The publish workflow auto-triggers on the tag

BUMP_TYPE="${1:-patch}"

# Validate bump type
if [[ "$BUMP_TYPE" != "patch" && "$BUMP_TYPE" != "minor" && "$BUMP_TYPE" != "major" ]]; then
  echo "Usage: npm run release [patch|minor|major]"
  echo "  patch: 0.1.0 -> 0.1.1 (bug fixes)"
  echo "  minor: 0.1.0 -> 0.2.0 (new features)"
  echo "  major: 0.1.0 -> 1.0.0 (breaking changes)"
  exit 1
fi

# Check working tree is clean
if [[ -n "$(git status --porcelain)" ]]; then
  echo "Error: Working tree is not clean. Commit or stash changes first."
  git status --short
  exit 1
fi

# Get current version
CURRENT_VERSION=$(jq -r .version package.json)
echo "Current version: $CURRENT_VERSION"

# Calculate new version
IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT_VERSION"
case "$BUMP_TYPE" in
  patch) PATCH=$((PATCH + 1)) ;;
  minor) MINOR=$((MINOR + 1)); PATCH=0 ;;
  major) MAJOR=$((MAJOR + 1)); MINOR=0; PATCH=0 ;;
esac
NEW_VERSION="${MAJOR}.${MINOR}.${PATCH}"
echo "New version: $NEW_VERSION ($BUMP_TYPE bump)"

# Bump version in all package.json files
echo "Bumping version in all packages..."
for pkgfile in package.json web/package.json api/package.json app/package.json packages/shared/package.json packages/db/package.json; do
  if [[ -f "$pkgfile" ]]; then
    jq --arg v "$NEW_VERSION" '.version = $v' "$pkgfile" > "${pkgfile}.tmp" && mv "${pkgfile}.tmp" "$pkgfile"
    echo "  Updated $pkgfile"
  fi
done

# Commit
echo "Committing version bump..."
git add package.json web/package.json api/package.json app/package.json packages/shared/package.json packages/db/package.json
git commit -m "chore: bump version to $NEW_VERSION"

# Tag
TAG="v${NEW_VERSION}"
echo "Creating tag $TAG..."
git tag "$TAG"

# Push
echo "Pushing commit and tag to origin..."
git push origin HEAD
git push origin "$TAG"

echo ""
echo "Release $NEW_VERSION published!"
echo "  Tag: $TAG"
echo "  The publish workflow will now:"
echo "    1. Build macOS + Windows installers"
echo "    2. Upload to Cloudflare R2"
echo "    3. Update latest.json on R2"
echo "    4. Download page will serve the new version"
echo "    5. Desktop app will auto-update on next launch"
