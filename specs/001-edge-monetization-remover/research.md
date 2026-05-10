# Research: Edge Monetization Remover

## Decision: Use Manifest V3 for the extension

**Rationale**: Microsoft Edge documentation describes Manifest V3 as the current Chromium Extensions platform, and Chrome extension documentation lists Manifest V3 as the supported manifest version. This aligns Edge with the active Chromium extension model and avoids planning around deprecated Manifest V2 behavior.

**Alternatives considered**: Manifest V2 was rejected because it is deprecated for Chromium extensions and not appropriate for new Edge extension work.

**Sources**:
- https://learn.microsoft.com/en-us/microsoft-edge/extensions/developer-guide/migrate-your-extension-from-manifest-v2-to-v3
- https://developer.chrome.com/docs/extensions/mv3/manifest

## Decision: Use a statically declared content script

**Rationale**: The feature must run automatically on matching web pages without per-page user action. Official content script guidance supports static declarations in the manifest for scripts that should automatically run on known URL patterns, and the script can use the DOM to inspect and change visited pages.

**Alternatives considered**: Programmatic injection and toolbar-click execution were rejected because they add unnecessary background logic or user interaction. A page script injected into the main world was rejected because the isolated content-script world is safer and sufficient for DOM cleanup.

**Sources**:
- https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts
- https://developer.chrome.com/docs/extensions/reference/manifest/content-scripts

## Decision: Keep v1 dependency-free at runtime

**Rationale**: The required behavior is limited to DOM selection, removal, style inspection, and mutation observation. Browser-native APIs are sufficient, and Microsoft Edge Add-ons validation requires packaged extension code rather than remotely hosted code.

**Alternatives considered**: A frontend framework, background service worker, remote rule service, or packaged DOM utility library were rejected because they increase bundle size, review surface, and maintenance without improving v1 behavior.

**Source**:
- https://learn.microsoft.com/en-us/microsoft-edge/extensions/developer-guide/migrate-your-extension-from-manifest-v2-to-v3

## Decision: Use a packaged JavaScript config file loaded before the content script

**Rationale**: The new requirement needs a maintainable file where class-name keywords can be edited without changing cleanup logic. A packaged `extension/config.js` loaded before `extension/content.js` can expose a simple global configuration object to the content script, preserves synchronous startup, requires no new permissions, and avoids using `fetch` or extension storage for a static maintainer-controlled list. The manifest ordering becomes the contract: config first, cleanup script second.

**Alternatives considered**: A packaged JSON file fetched through `chrome.runtime.getURL()` was rejected because it adds async loading and would require changing the current no-network/static-script test posture. `chrome.storage` and an options page were rejected because the requested scope is a config file, not end-user settings. Keeping the keyword hard-coded was rejected because it fails the new configurable keyword requirement.

## Decision: Use targeted mutation handling for delayed overlays

**Rationale**: The spec requires removing monetization divs that appear after page load. A MutationObserver that inspects added nodes and their descendants handles delayed insertion without repeated full-document polling.

**Alternatives considered**: Timer-based rescans were rejected due to unnecessary repeated work. Initial-load-only cleanup was rejected because it fails User Story 3 and FR-008.

## Decision: Match only `div` elements with class names containing configured keywords

**Rationale**: The spec defines the default target as a div whose class name contains `monetization`, including examples such as `fc-monetization-dialog-container`, and now requires additional configured keyword values. Limiting removal to divs reduces false positives and preserves non-div elements while allowing the keyword list to expand.

**Alternatives considered**: Removing any element with a matching class was rejected because the spec excludes arbitrary non-div removal. Matching only `div.monetization` was rejected because it would miss substring examples and configured alternatives such as `site-paywall-modal`.

## Decision: Interpret trailing-star config entries as class-token prefix matches

**Rationale**: Maintainers need entries such as `ads*` to match class tokens that start with a prefix, while preserving existing substring behavior for plain entries. A trailing `*` is therefore interpreted only as a suffix marker on a configured entry: `ads*` matches tokens such as `adsbygoogle`, `ads-banner`, or `ads_rail`; `ads-*` matches tokens that start with `ads-`. Plain entries such as `monetization`, `paywall`, and `subscription` continue to match substrings anywhere in the full class text.

**Alternatives considered**: Treating every keyword as a prefix was rejected because it would break existing substring matching. Supporting full glob or regular-expression syntax was rejected because the maintainer config only needs one explicit suffix convention and broader pattern languages would increase false-positive and escaping risk. Matching a trailing-star prefix against the full class string was rejected because the requested behavior is class-token prefix matching.

## Decision: Normalize config keywords with a default fallback

**Rationale**: Maintainer-edited config can contain duplicate values, whitespace, empty entries, or invalid structures. The content script should trim keywords, remove empty entries, de-duplicate values, and fall back to `monetization` when no valid keywords remain. This keeps the extension functional after config mistakes and preserves the original behavior.

**Alternatives considered**: Failing closed with no removals was rejected because a minor config error would silently disable the extension. Throwing errors was rejected because content scripts should not disrupt pages. Case-insensitive matching was deferred because the existing behavior is case-sensitive and the user requested additional names, not a change in matching semantics. Stripping the `*` during normalization was rejected because normalization/fallback behavior should stay the same and interpretation belongs to matching.
