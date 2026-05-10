# Quickstart: Edge Monetization Remover

## Build v1

1. Review `extension/manifest.json`, a Manifest V3 extension manifest with a static content script.
2. Add or review `extension/config.js`, the packaged maintainer-editable config file.
3. Confirm `extension/manifest.json` loads `config.js` before `content.js` for `http://*/*` and `https://*/*` pages at `document_idle`.
4. Configure class-name keywords:
   - Keep `monetization` as the default value.
   - Add additional values such as `paywall` or `subscription` when equivalent overlay div classes should be removed.
   - Use a trailing `*` for class-token prefix matching, such as `ads*` for `adsbygoogle` or `ads-banner`, and `ads-*` for tokens that start with `ads-`.
   - Leave plain values without `*` when substring matching is desired.
   - Expect whitespace, empty entries, and duplicates to be normalized by the content script.
   - Use the packaged global object:

     ```js
     globalScope.EdgeMonetizationRemoverConfig = {
       classKeywords: ["monetization", "paywall", "subscription", "ads*"]
     };
     ```
5. Initial cleanup:
   - Remove every `div` whose class name contains any configured keyword.
   - If `document.body` overflow is hidden, set body overflow to auto.
6. Delayed cleanup uses mutation observation:
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
   - A `div` with a configured alternate class keyword such as `site-paywall-modal`.
   - A `div` with a class token that starts with a trailing-star prefix, such as `adsbygoogle` for `ads*`.
   - A plain keyword that still matches by substring, proving old behavior remains intact.
   - Multiple matching monetization divs.
   - A page with `body` overflow hidden.
   - A page without matching divs.
   - A page that inserts a matching div after load.
   - A config file with duplicate, empty, or whitespace-padded keyword entries.
   - Missing or invalid config behavior, which should fall back to `monetization`.
6. Confirm matching divs are removed, body scrolling is restored, non-div matching elements remain, and non-matching content remains visible.

## Automated Test Expectations

- `npm test` runs dependency-free unit and integration checks.
- `npm run lint` syntax-checks `extension/config.js`, `extension/content.js`, and test files.
- Unit tests cover cleanup logic, configured keyword matching, config normalization, fallback behavior, scroll restoration, delayed mutations, duplicate observer prevention, and the 1 second cleanup budget.
- Integration checks cover the MV3 manifest, config-before-content script ordering, least necessary permissions, no remote-code or network behavior, fixture coverage, and targeted mutation observation.
- Any manual-only validation records the browser version, fixture used, expected result, and actual result.
