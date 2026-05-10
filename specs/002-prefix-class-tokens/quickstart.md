# Quickstart: Prefix Class Tokens

## Build

1. Review `extension/manifest.json`, a Manifest V3 extension manifest with a static content script.
2. Confirm `extension/manifest.json` loads `config.js` before `content.js` for `http://*/*` and `https://*/*` pages at `document_idle`.
3. Configure class-name match entries in `extension/config.js`:
   - Keep `monetization` as the default value.
   - Use plain values such as `paywall` or `subscription` when substring matching is desired.
   - Use a trailing `*` for class-token prefix matching, such as `ads*` for `adsbygoogle` or `ads-banner`, and `ads-*` for tokens that start with `ads-`.
   - Expect whitespace, empty entries, and duplicates to be normalized by the content script.
   - Use the packaged global object:

     ```js
     globalScope.EdgeMonetizationRemoverConfig = {
       classKeywords: ["monetization", "paywall", "subscription", "ads*"]
     };
     ```

4. Update `extension/content.js` matching logic so:
   - Plain entries without trailing `*` keep substring matching against the full class text.
   - Trailing-star entries match only when an individual class token starts with the prefix before `*`.
   - Entries that are exactly `*` or otherwise empty after trimming do not become broad match-all rules.
5. Preserve existing cleanup behavior:
   - Remove only matching `div` elements.
   - If `document.body` overflow is hidden, set body overflow to auto.
   - Inspect added nodes and matching descendants through mutation observation.

## Validate Locally

Run automated checks:

```sh
npm test
npm run lint
```

Open Microsoft Edge for manual validation:

1. Go to `edge://extensions`.
2. Enable developer mode.
3. Load the unpacked extension from the repository `extension/` directory.
4. Open fixture pages or test pages that cover:
   - A `div` with class `ads-banner` when config includes `ads*`.
   - A `div` with class `layout ads_modal` when config includes `ads*`.
   - A `div` with class `paidads` when only `ads*` is configured, confirming it is not removed by prefix-token matching.
   - A `div` with class `fc-monetization-dialog-container`, confirming plain substring matching still works.
   - A `div` with a configured alternate plain keyword such as `site-hardpaywall-modal`.
   - Matching non-div elements, confirming they remain.
   - A page with `body` overflow hidden.
   - A page that inserts a matching div after load.
   - Missing, empty, and invalid config behavior, confirming fallback to `monetization`.
5. Confirm matching divs are removed, body scrolling is restored, non-div matching elements remain, and non-matching content remains visible.

## Automated Test Expectations

- Unit tests cover trailing-star prefix-token matching, plain substring matching, config normalization, fallback behavior, div-only cleanup, scroll restoration, delayed mutations, duplicate observer prevention, and the 1 second cleanup budget.
- Integration checks cover the MV3 manifest, config-before-content script ordering, least necessary permissions, no remote-code or network behavior, fixture coverage, and targeted mutation observation.
- Any manual-only validation records the browser version, fixture used, expected result, and actual result.
