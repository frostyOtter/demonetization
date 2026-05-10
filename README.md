# Edge Monetization Remover

Microsoft Edge Manifest V3 extension that removes monetization overlay `div` elements and restores page scrolling.

## Behavior

- Loads packaged cleanup keywords from `extension/config.js`, defaulting to `monetization`.
- Removes `div` elements whose class name contains any configured keyword, including `fc-monetization-dialog-container`.
- Leaves non-div elements and non-matching page content intact.
- Changes `document.body.style.overflow` from `hidden` to `auto`.
- Observes newly added DOM nodes so delayed monetization dialogs are removed without a page reload.
- Uses no runtime dependencies, background worker, storage, network requests, or remote code.

## Configure Keywords

Edit `extension/config.js` before loading or reloading the unpacked extension:

```js
globalScope.EdgeMonetizationRemoverConfig = {
  classKeywords: ["monetization", "paywall", "subscription", "ads*", "ads-*"]
};
```

Plain entries such as `monetization`, `paywall`, and `subscription` match substrings anywhere in a `div` class string. Entries ending in `*` match individual class tokens by prefix: `ads*` matches `ads-banner` and `ads_modal`, while `ads-*` matches `ads-banner` but not `ads_modal`. An entry that is exactly `*` is ignored so it cannot become a broad match-all rule.

Whitespace and duplicate entries are normalized at runtime. Empty, missing, or invalid keyword config falls back to `monetization`.

## Apply Guide

Use the extension as an unpacked Microsoft Edge extension:

1. Open Microsoft Edge and go to `edge://extensions`.
2. Enable **Developer mode**.
3. Select **Load unpacked**.
4. Choose the repository `extension/` directory.
5. Visit a page that shows a monetization, paywall, or subscription overlay.
6. Confirm the matching configured-keyword `div` is removed and page scrolling works normally.

After editing files in `extension/`, return to `edge://extensions` and select **Reload** for Edge Monetization Remover before testing the change on a page.

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
5. Open the fixture pages in `tests/fixtures/` and confirm default, configured-keyword, and prefix-token overlays are removed, scrolling is restored, non-div matching elements remain, and non-matching content remains.

## Project Layout

```text
extension/
├── config.js
├── manifest.json
└── content.js

tests/
├── fixtures/
├── integration/
└── unit/
```
