# Quickstart: Edge Monetization Remover

## Build v1

1. Review `extension/manifest.json`, a Manifest V3 extension manifest with a static content script.
2. Confirm `extension/content.js` is registered for `http://*/*` and `https://*/*` pages at `document_idle`.
3. Initial cleanup:
   - Remove every `div` whose class name contains `monetization`.
   - If `document.body` overflow is hidden, set body overflow to auto.
4. Delayed cleanup uses mutation observation:
   - Inspect added nodes and matching descendants.
   - Remove matching divs.
   - Restore body overflow when it becomes hidden.

## Validate Locally

1. Open Microsoft Edge.
2. Go to `edge://extensions`.
3. Enable developer mode.
4. Load the unpacked extension from the repository `extension/` directory.
5. Open fixture pages or test pages that cover:
   - A `div` with class `fc-monetization-dialog-container`.
   - Multiple matching monetization divs.
   - A page with `body` overflow hidden.
   - A page without matching divs.
   - A page that inserts a matching div after load.
6. Confirm matching divs are removed, body scrolling is restored, and non-matching content remains visible.

## Automated Test Expectations

- `npm test` runs dependency-free unit and integration checks.
- Unit tests cover cleanup logic, scroll restoration, delayed mutations, duplicate observer prevention, and the 1 second cleanup budget.
- Integration checks cover the MV3 manifest, least necessary permissions, no remote-code or network behavior, fixture coverage, and targeted mutation observation.
- Any manual-only validation records the browser version, fixture used, expected result, and actual result.
