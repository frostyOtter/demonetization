# Tasks: Edge Monetization Remover

**Input**: Design documents from `/specs/001-edge-monetization-remover/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/content-script-behavior.md, quickstart.md

**Tests**: Tests are required by the feature specification and constitution. Write or update tests before implementation and ensure they fail for missing behavior before making them pass.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it changes different files and does not depend on incomplete tasks
- **[Story]**: Maps to the user story phase, using `[US1]`, `[US2]`, `[US3]`, or `[US4]`
- Every task includes an exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the existing extension/test structure and prepare the packaged config surface.

- [X] T001 Verify existing Microsoft Edge MV3 extension baseline files in extension/manifest.json and extension/content.js
- [X] T002 Verify existing Node test scripts and Node >=20 requirement in package.json
- [X] T003 [P] Verify existing unit and integration test harness files in tests/unit/content.test.js and tests/integration/edge-extension.test.js
- [X] T004 [P] Verify existing manual validation document in tests/manual-validation.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add shared config loading and test helpers needed by all user stories.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T005 Create packaged keyword config with default `monetization` value in extension/config.js
- [X] T006 Update MV3 content script ordering to load config.js before content.js in extension/manifest.json
- [X] T007 Update unit test bootstrap to optionally load extension/config.js before extension/content.js in tests/unit/content.test.js
- [X] T008 Update integration checks to recognize config.js as packaged extension code in tests/integration/edge-extension.test.js

**Checkpoint**: Foundation ready; user story implementation can now begin.

---

## Phase 3: User Story 1 - Remove monetization overlays (Priority: P1) MVP

**Goal**: Remove every `div` whose class name contains the default `monetization` keyword while preserving non-matching content.

**Independent Test**: Simulate or open a page with `<div class="fc-monetization-dialog-container">` and confirm the matching div is removed while no-match pages remain unchanged.

### Tests for User Story 1

- [X] T009 [P] [US1] Update default monetization fixture coverage in tests/fixtures/monetization-page.html
- [X] T010 [P] [US1] Add unit tests for default-config monetization div removal in tests/unit/content.test.js
- [X] T011 [P] [US1] Add unit tests proving non-div monetization elements and no-match pages are preserved in tests/unit/content.test.js
- [X] T012 [P] [US1] Add integration coverage for default config cleanup behavior in tests/integration/edge-extension.test.js

### Implementation for User Story 1

- [X] T013 [US1] Refactor matching logic to read normalized default keywords instead of a hard-coded selector in extension/content.js
- [X] T014 [US1] Ensure initial cleanup removes all default monetization divs and returns accurate removedCount in extension/content.js
- [X] T015 [US1] Ensure non-div matching elements and pages without matching divs are left unchanged in extension/content.js

**Checkpoint**: User Story 1 is fully functional and testable independently.

---

## Phase 4: User Story 2 - Restore body scrolling (Priority: P2)

**Goal**: Restore page scrolling when body overflow is hidden, without changing other body style properties.

**Independent Test**: Simulate or open a page with body overflow hidden and confirm overflow becomes auto; confirm non-hidden overflow values are not unnecessarily changed.

### Tests for User Story 2

- [X] T016 [P] [US2] Verify hidden-overflow fixture coverage in tests/fixtures/scroll-locked-page.html
- [X] T017 [P] [US2] Add or update unit tests for hidden-to-auto body overflow restoration in tests/unit/content.test.js
- [X] T018 [P] [US2] Add or update unit tests proving non-hidden body overflow and other body styles are preserved in tests/unit/content.test.js
- [X] T019 [P] [US2] Add integration coverage for scroll restoration behavior in tests/integration/edge-extension.test.js

### Implementation for User Story 2

- [X] T020 [US2] Verify body overflow hidden detection and restoration to auto remain intact after keyword config refactor in extension/content.js
- [X] T021 [US2] Guard scroll restoration so only body overflow changes and only when overflow is hidden in extension/content.js

**Checkpoint**: User Stories 1 and 2 both work independently.

---

## Phase 5: User Story 4 - Configure removable class keywords (Priority: P2)

**Goal**: Allow maintainers to add class-name keywords such as `paywall` or `subscription` in a packaged config file without editing cleanup logic.

**Independent Test**: Configure keywords such as `paywall` and `subscription`, run cleanup on pages with matching div classes, and confirm only matching div elements are removed; invalid or empty config falls back to `monetization`.

### Tests for User Story 4

- [X] T022 [P] [US4] Add fixture coverage for configured alternate keywords in tests/fixtures/configured-keywords-page.html
- [X] T023 [P] [US4] Add unit tests for multiple configured keyword removal in tests/unit/content.test.js
- [X] T024 [P] [US4] Add unit tests for trimming, empty-entry removal, and duplicate keyword de-duplication in tests/unit/content.test.js
- [X] T025 [P] [US4] Add unit tests for missing, empty, and invalid config fallback to `monetization` in tests/unit/content.test.js
- [X] T026 [P] [US4] Add integration checks for config.js before content.js ordering and no new permissions in tests/integration/edge-extension.test.js

### Implementation for User Story 4

- [X] T027 [US4] Implement keyword config resolution from the packaged global config object in extension/content.js
- [X] T028 [US4] Implement keyword normalization with trimming, empty-entry filtering, and duplicate removal in extension/content.js
- [X] T029 [US4] Implement fallback to `monetization` when config is missing, empty, or invalid in extension/content.js
- [X] T030 [US4] Replace selector-only descendant matching with configured keyword filtering for div elements in extension/content.js
- [X] T031 [US4] Document how to edit classKeywords in extension/config.js

**Checkpoint**: User Story 4 is fully functional and testable independently.

---

## Phase 6: User Story 3 - Handle late monetization dialogs (Priority: P3)

**Goal**: Remove matching divs and restore scrolling when matching elements appear after initial page load.

**Independent Test**: Simulate or open a page that inserts a matching div after load and confirm it is removed without requiring a reload.

### Tests for User Story 3

- [X] T032 [P] [US3] Update delayed insertion fixture to include default and configured keyword examples in tests/fixtures/delayed-monetization-page.html
- [X] T033 [P] [US3] Add unit tests for delayed default-keyword div removal through mutation handling in tests/unit/content.test.js
- [X] T034 [P] [US3] Add unit tests for delayed configured-keyword div removal through mutation handling in tests/unit/content.test.js
- [X] T035 [P] [US3] Add unit tests for delayed insertion that also sets body overflow hidden in tests/unit/content.test.js
- [X] T036 [P] [US3] Add integration coverage for delayed cleanup within 1 second in tests/integration/edge-extension.test.js

### Implementation for User Story 3

- [X] T037 [US3] Verify MutationObserver setup inspects added nodes and descendants with configured keyword matching in extension/content.js
- [X] T038 [US3] Connect mutation handling to configured-keyword cleanup and body overflow restoration in extension/content.js
- [X] T039 [US3] Prevent repeated full-document polling and duplicate observer setup after config refactor in extension/content.js

**Checkpoint**: All user stories are independently functional.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final quality, documentation, and release validation across all user stories.

- [X] T040 [P] Update README config, install, usage, and test instructions in README.md
- [X] T041 [P] Update quickstart implementation details for extension/config.js in specs/001-edge-monetization-remover/quickstart.md
- [X] T042 [P] Update manual validation steps for configured keywords and fallback behavior in tests/manual-validation.md
- [X] T043 Measure and document cleanup timing against the 1 second budget in tests/manual-validation.md
- [X] T044 Run syntax checks and full test suite through package.json scripts
- [ ] T045 Validate the unpacked extension manually in Microsoft Edge and record browser version and results in tests/manual-validation.md
- [X] T046 Review extension/manifest.json and extension/content.js for least necessary permissions, no remote-code behavior, and no network requests

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion; blocks all user stories.
- **User Stories (Phase 3+)**: Depend on Foundational completion.
- **Polish (Phase 7)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Foundational; no dependency on other stories. This is the MVP.
- **User Story 2 (P2)**: Starts after Foundational; can be implemented independently, then validated with US1 for combined page usability.
- **User Story 4 (P2)**: Starts after Foundational; can be implemented independently because config behavior is isolated to keyword matching.
- **User Story 3 (P3)**: Starts after Foundational; should be validated after US1 and US4 when configured keyword matching is complete.

### Within Each User Story

- Tests for that story must be written first and fail before implementation.
- Fixture tasks can run in parallel with test-authoring tasks when they touch separate files.
- Implementation tasks follow tests and should complete before story validation.
- Story validation records passing results before moving to the next priority story.

## Parallel Opportunities

- T003 and T004 can run in parallel during Setup.
- T007 and T008 can run in parallel after T005 and T006 are clear.
- T009, T010, T011, and T012 can run in parallel after Foundational completion.
- T016, T017, T018, and T019 can run in parallel after Foundational completion.
- T022, T023, T024, T025, and T026 can run in parallel after Foundational completion.
- T032, T033, T034, T035, and T036 can run in parallel after Foundational completion.
- T040, T041, and T042 can run in parallel during Polish.

## Parallel Example: User Story 1

```text
Task: "T009 [P] [US1] Update default monetization fixture coverage in tests/fixtures/monetization-page.html"
Task: "T010 [P] [US1] Add unit tests for default-config monetization div removal in tests/unit/content.test.js"
Task: "T011 [P] [US1] Add unit tests proving non-div monetization elements and no-match pages are preserved in tests/unit/content.test.js"
Task: "T012 [P] [US1] Add integration coverage for default config cleanup behavior in tests/integration/edge-extension.test.js"
```

## Parallel Example: User Story 2

```text
Task: "T016 [P] [US2] Verify hidden-overflow fixture coverage in tests/fixtures/scroll-locked-page.html"
Task: "T017 [P] [US2] Add or update unit tests for hidden-to-auto body overflow restoration in tests/unit/content.test.js"
Task: "T018 [P] [US2] Add or update unit tests proving non-hidden body overflow and other body styles are preserved in tests/unit/content.test.js"
Task: "T019 [P] [US2] Add integration coverage for scroll restoration behavior in tests/integration/edge-extension.test.js"
```

## Parallel Example: User Story 4

```text
Task: "T022 [P] [US4] Add fixture coverage for configured alternate keywords in tests/fixtures/configured-keywords-page.html"
Task: "T023 [P] [US4] Add unit tests for multiple configured keyword removal in tests/unit/content.test.js"
Task: "T024 [P] [US4] Add unit tests for trimming, empty-entry removal, and duplicate keyword de-duplication in tests/unit/content.test.js"
Task: "T025 [P] [US4] Add unit tests for missing, empty, and invalid config fallback to monetization in tests/unit/content.test.js"
Task: "T026 [P] [US4] Add integration checks for config.js before content.js ordering and no new permissions in tests/integration/edge-extension.test.js"
```

## Parallel Example: User Story 3

```text
Task: "T032 [P] [US3] Update delayed insertion fixture to include default and configured keyword examples in tests/fixtures/delayed-monetization-page.html"
Task: "T033 [P] [US3] Add unit tests for delayed default-keyword div removal through mutation handling in tests/unit/content.test.js"
Task: "T034 [P] [US3] Add unit tests for delayed configured-keyword div removal through mutation handling in tests/unit/content.test.js"
Task: "T035 [P] [US3] Add unit tests for delayed insertion that also sets body overflow hidden in tests/unit/content.test.js"
Task: "T036 [P] [US3] Add integration coverage for delayed cleanup within 1 second in tests/integration/edge-extension.test.js"
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 setup verification.
2. Complete Phase 2 config foundation.
3. Complete Phase 3 User Story 1.
4. Stop and validate default monetization div removal independently.
5. Demo the MVP by loading the unpacked extension and visiting a page with `fc-monetization-dialog-container`.

### Incremental Delivery

1. Add User Story 1 to preserve default monetization overlay removal.
2. Add User Story 2 to preserve body scroll restoration.
3. Add User Story 4 to enable configured alternate keywords.
4. Add User Story 3 to apply configured matching to delayed DOM insertions.
5. Run full validation after each story so earlier behavior remains intact.

### Parallel Team Strategy

1. Complete Setup and Foundational phases together.
2. Assign User Story 1, User Story 2, and User Story 4 to separate developers after shared config loading exists.
3. Implement User Story 3 after configured matching behavior is stable enough to reuse in mutation handling.
4. Merge by story priority, validating each story independently before integration.

## Notes

- `[P]` tasks touch separate files or can be done without depending on incomplete implementation.
- `[US1]`, `[US2]`, `[US3]`, and `[US4]` map directly to the prioritized user stories in spec.md.
- The suggested MVP scope is Phase 1, Phase 2, and Phase 3 only.
