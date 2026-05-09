# Feature Specification: Edge Monetization Remover

**Feature Branch**: `001-edge-monetization-remover`  
**Created**: 2026-05-09  
**Status**: Draft  
**Input**: User description: "Build a Microsoft Edge browser plugin that removes div elements whose class contains monetization and restores body overflow from hidden to auto. Add a config file where I can input names other than the 'monetization' keyword so the plugin scans and removes divs whose classes contain configured values."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Remove monetization overlays (Priority: P1)

As a Microsoft Edge user, I want monetization overlay containers removed from pages I visit so that blocked content becomes visible and usable without manual page editing.

**Why this priority**: Removing the monetization container is the primary value of the extension and delivers the minimum useful experience.

**Independent Test**: Can be fully tested by opening a page that contains a `div` with a class containing `monetization` and confirming that the monetization container is no longer present or visible.

**Acceptance Scenarios**:

1. **Given** a web page contains `<div class="fc-monetization-dialog-container">`, **When** the extension runs on the page, **Then** that div is removed from the visible page.
2. **Given** a web page contains multiple div elements whose class names contain `monetization`, **When** the extension runs on the page, **Then** all matching div elements are removed.
3. **Given** a web page does not contain any div element whose class contains `monetization`, **When** the extension runs on the page, **Then** page content remains unchanged.

---

### User Story 2 - Restore body scrolling (Priority: P2)

As a Microsoft Edge user, I want page scrolling restored when a monetization experience has disabled it so that I can continue reading and navigating the page.

**Why this priority**: Many blocking dialogs also prevent scrolling; restoring body scrolling makes the cleaned page usable after the overlay is removed.

**Independent Test**: Can be fully tested by opening a page where body scrolling is disabled with overflow hidden and confirming the page can scroll after the extension runs.

**Acceptance Scenarios**:

1. **Given** a web page body has scrolling disabled through overflow hidden, **When** the extension runs on the page, **Then** body scrolling is restored by using auto overflow.
2. **Given** a web page body does not have overflow hidden, **When** the extension runs on the page, **Then** the body overflow value is not unnecessarily changed.

---

### User Story 3 - Handle late monetization dialogs (Priority: P3)

As a Microsoft Edge user, I want monetization containers removed even if they appear after the initial page load so that delayed dialogs do not interrupt reading.

**Why this priority**: Some pages add monetization prompts after content loads; handling delayed containers improves reliability beyond the initial page state.

**Independent Test**: Can be fully tested by opening a page that adds a matching monetization div after load and confirming that the delayed container is removed.

**Acceptance Scenarios**:

1. **Given** a web page adds a div whose class contains `monetization` after the page has loaded, **When** the div appears, **Then** it is removed without requiring the user to reload the page.
2. **Given** a delayed monetization div also causes body overflow hidden, **When** the extension handles the delayed div, **Then** body scrolling is restored.

---

### User Story 4 - Configure removable class keywords (Priority: P2)

As an extension maintainer, I want a packaged config file listing class-name keywords so that I can remove blocker divs whose class names contain terms other than `monetization` without editing the cleanup logic.

**Why this priority**: The original hard-coded keyword solves one site pattern only. A config file keeps the extension useful for equivalent overlay class names while preserving the same unobtrusive page behavior.

**Independent Test**: Can be fully tested by setting configured keywords such as `paywall` or `subscription`, running the extension on pages containing matching div classes, and confirming only matching div elements are removed.

**Acceptance Scenarios**:

1. **Given** the config includes `paywall`, **When** the extension runs on a page containing `<div class="site-paywall-modal">`, **Then** that div is removed.
2. **Given** the config includes `monetization` and `subscription`, **When** the extension runs on a page containing div classes with either keyword, **Then** all matching divs are removed.
3. **Given** a configured keyword appears on a non-div element, **When** the extension runs, **Then** the non-div element is left unchanged.
4. **Given** the config is missing, empty, or invalid, **When** the extension runs, **Then** it falls back to the default `monetization` keyword.

### Edge Cases

- A matching monetization div appears more than once on the same page.
- A matching monetization div is added after initial page load.
- The page contains a non-div element with a class containing `monetization`; it is left unchanged.
- A configured keyword contains extra whitespace or duplicate values.
- The config file is missing, empty, or invalid.
- The page has no matching monetization div and no hidden body overflow.
- Body overflow is already auto or another non-hidden value before the extension runs.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The extension MUST run on Microsoft Edge web pages without requiring the user to configure sites for the initial release.
- **FR-002**: The extension MUST remove every `div` element whose class name contains any configured class keyword.
- **FR-003**: The extension MUST include `monetization` as the default configured keyword and recognize class-name matches such as `fc-monetization-dialog-container`.
- **FR-004**: The extension MUST leave non-div elements unchanged, even when their class names contain a configured keyword.
- **FR-005**: The extension MUST leave pages without matching div elements visually unchanged, except for body scroll restoration when the body overflow is hidden.
- **FR-006**: The extension MUST restore body scrolling when body overflow is hidden by changing that overflow behavior to auto.
- **FR-007**: The extension MUST avoid changing body style properties other than overflow.
- **FR-008**: The extension MUST handle matching monetization divs that appear after the initial page load.
- **FR-009**: The extension MUST perform its page cleanup without requiring user interaction on each page.
- **FR-010**: The extension MUST provide a packaged config file where maintainers can define additional class-name keywords.
- **FR-011**: The extension MUST normalize configured keywords by trimming whitespace, removing empty entries, and de-duplicating values.
- **FR-012**: The extension MUST fall back to the default `monetization` keyword when the config file is missing, empty, or invalid.

### UX Consistency Requirements

- **UX-001**: The extension MUST operate unobtrusively without adding visible page controls for the initial release.
- **UX-002**: The extension MUST not display success messages, prompts, or onboarding on every page.
- **UX-003**: The extension MUST preserve normal page reading and scrolling behavior after cleanup.

### Quality & Test Requirements

- **QT-001**: Behavior changes MUST include automated tests at the lowest useful level.
- **QT-002**: User-facing browser workflows MUST include an integration, end-to-end, or equivalent journey test when supported by the stack.
- **QT-003**: Cleanup behavior MUST include regression coverage for matching monetization div removal and body overflow restoration.
- **QT-004**: Any unautomated validation MUST be documented with the reason and manual verification steps.

### Performance Requirements

- **PR-001**: On a typical content page, the cleanup MUST complete quickly enough that users do not see the monetization container remain for more than 1 second after page load or after delayed insertion.
- **PR-002**: The cleanup MUST not noticeably slow page reading, scrolling, or interaction on pages without matching monetization divs.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In validation pages containing one or more divs matching configured keywords, 100% of matching divs are removed within 1 second of page load or delayed insertion.
- **SC-002**: In validation pages with body overflow hidden, 100% of tested pages become scrollable after the extension runs.
- **SC-003**: In validation pages without matching monetization divs, no visible content is removed.
- **SC-004**: A user can install the extension, visit a page with a matching monetization container, and see the page cleaned without any per-page action.

## Assumptions

- "Matching cleanup div" means a `div` element whose class name contains one of the configured class-name keywords.
- The default packaged keyword list contains `monetization` to preserve current behavior.
- The extension should apply broadly across webpages and avoid requiring user setup for the initial release.
- Only the body overflow style is changed from hidden to auto; other body style properties are not altered.
- User-facing options pages, site allowlists, domain-specific rules, analytics, account systems, and arbitrary non-div removal are out of scope for the initial release.
