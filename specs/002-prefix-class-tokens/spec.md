# Feature Specification: Prefix Class Tokens

**Feature Branch**: `002-prefix-class-tokens`  
**Created**: 2026-05-10  
**Status**: Draft  
**Input**: User description: "Add support for maintainer config entries like ads* in extension/config.js, where a trailing * means 'class token starts with this prefix.' Keep all existing behavior intact: plain keywords remain substring matches, config normalization/fallback stays the same, and cleanup still only removes matching div elements."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Match Class Prefix Tokens (Priority: P1)

As an extension maintainer, I want a config entry ending in `*` to match class tokens that start with the entry's prefix so that concise entries such as `ads*` can cover related blocker classes without matching unrelated text inside a class token.

**Why this priority**: Prefix-token matching is the feature's primary value and gives maintainers a more precise matching mode while keeping the existing config surface.

**Independent Test**: Can be fully tested by configuring `ads*`, running cleanup on a page containing divs with classes such as `ads-banner` or `ads_modal`, and confirming those divs are removed while a div whose class merely contains `ads` later in a token is not removed by the prefix rule alone.

**Acceptance Scenarios**:

1. **Given** the maintainer config includes `ads*`, **When** a page contains `<div class="ads-banner">`, **Then** that div is removed.
2. **Given** the maintainer config includes `ads*`, **When** a page contains `<div class="layout ads_modal">`, **Then** that div is removed because one class token starts with `ads`.
3. **Given** the maintainer config includes `ads*`, **When** a page contains `<div class="paidads">`, **Then** that div is not removed by the prefix-token rule because the class token does not start with `ads`.

---

### User Story 2 - Preserve Plain Keyword Behavior (Priority: P2)

As an extension maintainer, I want existing plain keyword entries to keep substring matching so that current configs continue working without edits.

**Why this priority**: Backward compatibility is required because existing maintainer configs depend on plain keywords such as `monetization`, `paywall`, and `subscription` matching anywhere in a class name.

**Independent Test**: Can be fully tested by using plain keyword entries with known matching pages and confirming the same divs are removed as before the prefix-token feature.

**Acceptance Scenarios**:

1. **Given** the maintainer config includes `monetization`, **When** a page contains `<div class="fc-monetization-dialog-container">`, **Then** that div is removed.
2. **Given** the maintainer config includes `paywall`, **When** a page contains `<div class="site-hardpaywall-modal">`, **Then** that div is removed because plain keywords remain substring matches.
3. **Given** the maintainer config includes both `ads*` and `paywall`, **When** a page contains divs matching either entry, **Then** all matching divs are removed according to each entry's matching mode.

---

### User Story 3 - Preserve Cleanup Boundaries (Priority: P3)

As a Microsoft Edge user, I want the enhanced matching to keep the extension's existing cleanup boundaries so that non-div content, fallback behavior, and delayed cleanup remain reliable.

**Why this priority**: The prefix feature must not broaden page mutation beyond the current safe behavior or regress cleanup for invalid configs and late-added overlays.

**Independent Test**: Can be fully tested by using prefix and plain entries on pages with matching divs, matching non-div elements, missing or invalid config, and delayed inserted elements.

**Acceptance Scenarios**:

1. **Given** the maintainer config includes `ads*`, **When** a non-div element has a class token starting with `ads`, **Then** the non-div element is left unchanged.
2. **Given** the maintainer config is missing, empty, or invalid, **When** the extension runs, **Then** cleanup falls back to the default `monetization` behavior.
3. **Given** the maintainer config includes `ads*`, **When** a matching div is inserted after initial page load, **Then** the delayed div is removed without requiring a page reload.

### Edge Cases

- A prefix entry contains surrounding whitespace before or after the trailing `*`; normalization still trims the entry before matching.
- A config includes duplicate entries, including prefix entries; duplicate handling remains consistent with existing normalization.
- A config includes both a plain keyword and a prefix entry that match the same div; the div is removed once.
- A config entry is exactly `*` or becomes empty after trimming; it is ignored as an empty or invalid matching entry.
- A class attribute contains multiple tokens; prefix entries match when any individual class token starts with the configured prefix.
- A class token contains the prefix in the middle rather than at the start; prefix entries do not match that token.
- Plain keyword entries still match across the class-name text as they did before.
- Missing, empty, or invalid config still falls back to the default `monetization` behavior.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The extension MUST treat a maintainer config entry with a trailing `*` as a prefix-token entry.
- **FR-002**: A prefix-token entry MUST match a page element only when at least one of the element's class tokens starts with the configured prefix before the `*`.
- **FR-003**: Prefix-token entries MUST remove matching `div` elements using the same cleanup flow as existing keyword matches.
- **FR-004**: Plain config entries without a trailing `*` MUST continue to match substrings in class names.
- **FR-005**: The extension MUST support a mix of prefix-token entries and plain keyword entries in the same maintainer config.
- **FR-006**: Config normalization MUST continue trimming whitespace, ignoring empty entries, and de-duplicating configured values consistently with existing behavior.
- **FR-007**: Missing, empty, or invalid config MUST continue to fall back to the default `monetization` keyword behavior.
- **FR-008**: Cleanup MUST continue to remove only matching `div` elements and MUST leave matching non-div elements unchanged.
- **FR-009**: Prefix-token matching MUST apply to both initial page cleanup and cleanup of matching divs added after initial page load.
- **FR-010**: Existing body scrolling restoration behavior MUST remain unchanged when prefix-token matching is added.
- **FR-011**: Documentation for maintainer configuration MUST explain the difference between plain substring entries and trailing-asterisk prefix-token entries.

### Key Entities *(include if feature involves data)*

- **Maintainer Config Entry**: A configured class-matching value. Entries without a trailing `*` are plain substring keywords; entries with a trailing `*` are prefix-token entries.
- **Class Token**: One individual class name on a page element. Prefix-token entries compare against the beginning of each token, not arbitrary text elsewhere in a token.
- **Matching Div**: A `div` element whose class information satisfies at least one configured entry after normalization and fallback rules are applied.

### UX Consistency Requirements *(include for user-facing changes)*

- **UX-001**: The extension MUST remain unobtrusive and MUST NOT add visible page controls, prompts, or success messages for this feature.
- **UX-002**: Cleaned pages MUST preserve normal reading and scrolling behavior after matching div removal.
- **UX-003**: Documentation MUST use maintainer-facing terminology that clearly distinguishes substring matching from class-token prefix matching.

### Quality & Test Requirements

- **QT-001**: Behavior changes MUST include automated tests at the lowest useful level.
- **QT-002**: Browser cleanup behavior MUST include an integration, end-to-end, or equivalent journey test when supported by the stack.
- **QT-003**: Prefix-token behavior MUST include regression coverage proving trailing `*` entries match token starts and do not act like plain substring entries.
- **QT-004**: Backward compatibility MUST include regression coverage for existing plain keyword matching, normalization, fallback, div-only cleanup, delayed cleanup, and body overflow restoration.
- **QT-005**: Any unautomated validation MUST be documented with the reason and manual verification steps.

### Performance Requirements

- **PR-001**: On validation pages containing matching divs, cleanup MUST complete within the existing 1 second user-visible cleanup target after page load or delayed insertion.
- **PR-002**: On pages without matching divs, the enhanced matching MUST NOT noticeably slow reading, scrolling, or interaction compared with the existing cleanup behavior.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In validation pages configured with `ads*`, 100% of divs with at least one class token starting with `ads` are removed within 1 second.
- **SC-002**: In validation pages configured with `ads*`, 100% of divs whose class tokens only contain `ads` after the token start remain unless another configured entry matches them.
- **SC-003**: In regression validation, 100% of existing plain keyword cases continue to remove the same matching divs as before.
- **SC-004**: In regression validation, 100% of matching non-div elements remain present after cleanup.
- **SC-005**: In fallback validation, missing, empty, and invalid maintainer configs all continue to remove default `monetization` divs.

## Assumptions

- The `*` marker is meaningful only when it appears at the end of a maintainer config entry after trimming whitespace.
- Prefix-token entries compare against class tokens split according to normal class-list behavior.
- Plain keyword entries remain substring matches across the element's class-name text to preserve existing behavior.
- The feature does not add a user-facing options page, site allowlist, analytics, network behavior, or arbitrary non-div removal.
- The existing default keyword, normalization, fallback, delayed cleanup, and body overflow restoration behavior remain in scope as regression guarantees.
