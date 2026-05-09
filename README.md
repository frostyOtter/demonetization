# Edge Monetization Remover

Microsoft Edge Manifest V3 extension that removes monetization overlay `div` elements and restores page scrolling.

## Behavior

- Removes `div` elements whose class name contains `monetization`, including `fc-monetization-dialog-container`.
- Leaves non-div elements and non-matching page content intact.
- Changes `document.body.style.overflow` from `hidden` to `auto`.
- Observes newly added DOM nodes so delayed monetization dialogs are removed without a page reload.
- Uses no runtime dependencies, background worker, storage, network requests, or remote code.

## Local Validation

Run automated checks:

```sh
npm test
npm run lint
```

Load the extension manually in Microsoft Edge:

1. Open `edge://extensions`.
2. Enable developer mode.
3. Select **Load unpacked**.
4. Choose the repository `extension/` directory.
5. Open the fixture pages in `tests/fixtures/` and confirm overlays are removed, scrolling is restored, and non-matching content remains.

## Project Layout

```text
extension/
├── manifest.json
└── content.js

tests/
├── fixtures/
├── integration/
└── unit/
```
