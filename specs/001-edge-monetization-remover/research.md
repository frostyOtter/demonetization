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

## Decision: Use targeted mutation handling for delayed overlays

**Rationale**: The spec requires removing monetization divs that appear after page load. A MutationObserver that inspects added nodes and their descendants handles delayed insertion without repeated full-document polling.

**Alternatives considered**: Timer-based rescans were rejected due to unnecessary repeated work. Initial-load-only cleanup was rejected because it fails User Story 3 and FR-008.

## Decision: Match only `div` elements with class names containing `monetization`

**Rationale**: The spec explicitly defines the target as a div whose class name contains the substring `monetization`, including examples such as `fc-monetization-dialog-container`. Limiting removal to divs reduces false positives and preserves non-div elements.

**Alternatives considered**: Removing any element with a matching class was rejected because the spec excludes arbitrary non-div removal. Matching only `div.monetization` was rejected because it would miss substring examples.
