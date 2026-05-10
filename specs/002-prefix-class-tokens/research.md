# Research: Prefix Class Tokens

## Decision: Keep the existing Manifest V3 static content script architecture

**Rationale**: Prefix-token matching is an extension of the current class matching behavior. Browser-native DOM APIs and the existing static content script are sufficient, and keeping the feature in `extension/content.js` preserves the no-background-worker, no-storage, no-network, no-remote-code design.

**Alternatives considered**: A background service worker, options page, remote rules service, or extra dependency were rejected because the feature only changes how packaged config entries are interpreted.

## Decision: Interpret trailing-star config entries as class-token prefix matches

**Rationale**: Maintainers need entries such as `ads*` to match class tokens that start with a prefix, while preserving existing substring behavior for plain entries. A trailing `*` is therefore interpreted only as a suffix marker on a configured entry: `ads*` matches tokens such as `adsbygoogle`, `ads-banner`, or `ads_rail`; `ads-*` matches tokens that start with `ads-`. Plain entries such as `monetization`, `paywall`, and `subscription` continue to match substrings anywhere in the full class text.

**Alternatives considered**: Treating every keyword as a prefix was rejected because it would break existing substring matching. Supporting full glob or regular-expression syntax was rejected because the maintainer config only needs one explicit suffix convention and broader pattern languages would increase false-positive and escaping risk. Matching a trailing-star prefix against the full class string was rejected because the requested behavior is class-token prefix matching.

## Decision: Preserve existing normalization and fallback behavior

**Rationale**: Maintainer-edited config can contain duplicate values, whitespace, empty entries, or invalid structures. The content script should continue to trim entries, remove empty entries, de-duplicate values, and fall back to `monetization` when no valid entries remain. Trailing-star entries should survive normalization so matching can interpret their suffix later.

**Alternatives considered**: Stripping the `*` during normalization was rejected because it would erase the matching mode. Failing closed with no removals was rejected because a minor config error would silently disable default cleanup. Throwing errors was rejected because content scripts should not disrupt pages.

## Decision: Preserve plain substring matching exactly

**Rationale**: Existing configs rely on entries such as `monetization`, `paywall`, and `subscription` matching anywhere in the element class text. The new prefix-token mode must be opt-in through the trailing `*` suffix to avoid compatibility breaks.

**Alternatives considered**: Changing plain entries to token-only matching was rejected because it would break cases such as `fc-monetization-dialog-container` and `site-hardpaywall-modal`. Making all entries case-insensitive was rejected because it is outside the request and would change current matching semantics.

## Decision: Apply prefix-token matching through the same cleanup boundaries

**Rationale**: Prefix-token entries should remove matching `div` elements using the same initial cleanup and mutation handling paths as plain entries. This keeps the feature consistent with existing div-only cleanup, delayed overlay removal, and body overflow restoration.

**Alternatives considered**: Adding a separate cleanup pass for prefix entries was rejected because it duplicates DOM traversal and increases regression risk. Removing non-div elements was rejected because the existing specification and this feature require div-only cleanup.
