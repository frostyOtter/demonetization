# Data Model: Prefix Class Tokens

The feature does not persist user data. These entities describe runtime concepts used by the content script and tests.

## CleanupConfig

**Represents**: The packaged maintainer-editable keyword configuration loaded before the content script.

**Fields**:
- `classKeywords`: Array of class-name match entries to remove when found on div elements.
- `defaultKeyword`: `monetization`, used when no valid configured entries are available.
- `normalizedKeywords`: Runtime entry list after validation.

**Validation Rules**:
- Trim leading and trailing whitespace from each configured entry.
- Remove empty entries.
- Remove duplicate entries while preserving first occurrence order.
- If the config object is missing, malformed, empty, or has no valid entries, use `["monetization"]`.
- Preserve trailing `*` entries during normalization; the suffix changes matching semantics but does not change fallback rules.
- Do not load entries from remote URLs or browser storage for this feature.

## CleanupConfigEntry

**Represents**: One normalized maintainer entry in `classKeywords`.

**Fields**:
- `rawValue`: Original string value before trimming.
- `normalizedValue`: Trimmed value used for de-duplication and matching.
- `matchMode`: `substring` for plain entries, `tokenPrefix` for entries ending in `*`.
- `prefix`: For `tokenPrefix` entries, the normalized value without the trailing `*`.

**Validation Rules**:
- Plain entries retain the existing substring semantics over full class text.
- Trailing-star entries use prefix matching against individual class tokens only.
- An entry that is exactly `*` has an empty prefix and is ignored as an invalid matching entry.
- Matching remains case-sensitive to preserve existing behavior.
- Entries are never interpreted as regular expressions or full glob patterns.

## ClassToken

**Represents**: One individual class name on a page element.

**Fields**:
- `value`: A class token from the element class list.
- `sourceClassName`: The full element class text used by plain substring entries.

**Validation Rules**:
- Prefix-token entries match only when a token starts with the configured prefix.
- Prefix-token entries do not match when the prefix appears only in the middle or end of a token.
- Plain entries continue to match against the full class text, not only individual tokens.

## PageCleanupTarget

**Represents**: A removable page element that blocks content through a matching configured class.

**Fields**:
- `element`: A DOM element present on the current page.
- `tagName`: Must be `DIV`.
- `className`: Class text used for matching.
- `classTokens`: Individual class tokens available for prefix matching.
- `matchedEntry`: The configured entry that matched the element class text or one of its class tokens.

**Validation Rules**:
- Only div elements qualify.
- Plain configured entries match by substring and must keep examples such as `fc-monetization-dialog-container` and `site-hardpaywall-modal` working.
- Configured entries ending in `*` match when any individual class token starts with the entry prefix before the trailing `*`.
- Non-div elements with matching class names are not cleanup targets.

## BodyScrollState

**Represents**: The current scroll-lock state of the page body.

**Fields**:
- `bodyExists`: Whether `document.body` is available.
- `overflowValue`: The current body overflow value.
- `requiresRestore`: True only when body overflow is hidden.

**Validation Rules**:
- If body overflow is hidden, set it to auto.
- If body overflow is already auto or another non-hidden value, leave it unchanged.
- Do not alter body style properties other than overflow.

## CleanupResult

**Represents**: The observable result of one cleanup pass.

**Fields**:
- `removedCount`: Number of matching div elements removed.
- `scrollRestored`: Whether body overflow was changed from hidden to auto.
- `source`: One of initial page cleanup or delayed DOM insertion cleanup.
- `entriesUsed`: Normalized config entries used by the cleanup pass when exposed for tests.

**State Transitions**:
- `pending` -> `cleaned`: Initial page scan completed.
- `cleaned` -> `cleaned`: Later mutations are inspected and any new matching divs are removed.
- `scrollLocked` -> `scrollRestored`: Body overflow changes from hidden to auto.
