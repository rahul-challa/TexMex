# Publishing TexMex

Steps for cutting a new release. For prior release-specific walkthroughs, see [archive/](archive/).

## Prerequisites

- Push access to [github.com/rahul-challa/TexMex](https://github.com/rahul-challa/TexMex)
- A VS Code Marketplace publisher token for `RahulChalla`, with "Publish" scope, from https://marketplace.visualstudio.com/manage
- `@vscode/vsce` installed (`npm run install-vsce`)

## 1. Bump the version and build

```bash
# update "version" in package.json, then:
npm run package
```

This produces `texmex-<version>.vsix`. Install it locally first (Extensions view -> ... -> Install from VSIX...) and sanity-check the preview, PDF download, and peer collaboration before publishing.

## 2. Tag and push

```bash
git add -A
git commit -m "Bump version to v<version>"
git tag v<version>
git push origin main --tags
```

## 3. Create a GitHub release

```bash
gh release create v<version> \
  --title "v<version>" \
  --notes-file <(sed -n '/^## \[<version>\]/,/^## \[/p' CHANGELOG.md) \
  texmex-<version>.vsix
```

Or use the GitHub web UI at https://github.com/rahul-challa/TexMex/releases/new, attaching the `.vsix`.

## 4. Publish to the VS Code Marketplace

```bash
vsce login RahulChalla   # first time only
vsce publish
```

`vsce publish` reads the version from `package.json`, so make sure step 1 already bumped it.

## 5. Verify

- https://marketplace.visualstudio.com/items?itemName=RahulChalla.texmex shows the new version
- The README renders correctly on the marketplace page (images load, links resolve) - if not, check that `package.json`'s `repository.url` still matches the actual GitHub repo
- Install from the Marketplace in a clean profile and confirm the extension activates and compiles a document
