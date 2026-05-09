# Data Model: Edge Monetization Remover

The feature does not persist user data. These entities describe runtime concepts used by the content script and tests.

## PageCleanupTarget

**Represents**: A removable page element that blocks content through a monetization, paywall, subscription, or equivalent overlay class configured for cleanup.

**Fields**:
- `element`: A DOM element present on the current page.
- `tagName`: Must be `DIV`.
- `className`: Contains at least one normalized configured keyword.
- `matchedKeyword`: The configured keyword found in the element class text.

**Validation Rules**:
- Only div elements qualify.
- Class matching is substring-based and must include examples such as `fc-monetization-dialog-container` and configured alternatives such as `site-paywall-modal`.
- Non-div elements with matching class names are not cleanup targets.

## CleanupConfig

**Represents**: The packaged maintainer-editable keyword configuration loaded before the content script.

**Fields**:
- `classKeywords`: Array of class-name substring values to remove when found on div elements.
- `defaultKeyword`: `monetization`, used when no valid configured keywords are available.
- `normalizedKeywords`: Runtime keyword list after validation.

**Validation Rules**:
- Trim leading and trailing whitespace from each configured keyword.
- Remove empty entries.
- Remove duplicate entries while preserving first occurrence order.
- If the config object is missing, malformed, empty, or has no valid keywords, use `["monetization"]`.
- Do not load keywords from remote URLs or browser storage for this feature.

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
- `keywordsUsed`: Normalized keyword list used by the cleanup pass when exposed for tests.

**State Transitions**:
- `pending` -> `cleaned`: Initial page scan completed.
- `cleaned` -> `cleaned`: Later mutations are inspected and any new matching divs are removed.
- `scrollLocked` -> `scrollRestored`: Body overflow changes from hidden to auto.
