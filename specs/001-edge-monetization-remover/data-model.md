# Data Model: Edge Monetization Remover

The feature does not persist user data. These entities describe runtime concepts used by the content script and tests.

## PageCleanupTarget

**Represents**: A removable page element that blocks content through a monetization overlay.

**Fields**:
- `element`: A DOM element present on the current page.
- `tagName`: Must be `DIV`.
- `className`: Contains the substring `monetization`.

**Validation Rules**:
- Only div elements qualify.
- Class matching is substring-based and must include examples such as `fc-monetization-dialog-container`.
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

**State Transitions**:
- `pending` -> `cleaned`: Initial page scan completed.
- `cleaned` -> `cleaned`: Later mutations are inspected and any new matching divs are removed.
- `scrollLocked` -> `scrollRestored`: Body overflow changes from hidden to auto.
