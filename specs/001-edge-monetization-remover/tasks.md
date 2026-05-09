# Tasks: Edge Monetization Remover

**Input**: Design documents from `/specs/001-edge-monetization-remover/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/content-script-behavior.md, quickstart.md

**Tests**: Tests are required by the feature specification and constitution. Write tests before implementation and ensure they fail for the missing behavior before making them pass.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it changes different files and does not depend on incomplete tasks
- **[Story]**: Maps to the user story phase, using `[US1]`, `[US2]`, or `[US3]`
- Every task includes an exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize the minimal browser-extension project and deterministic test structure.

- [X] T001 Create extension source directory and test directories in extension/, tests/unit/, tests/integration/, and tests/fixtures/
- [X] T002 Create JavaScript project metadata and test scripts in package.json
- [X] T003 [P] Configure ignore rules for dependencies, coverage, and local browser artifacts in .gitignore
- [X] T004 [P] Create base fixture page shell in tests/fixtures/no-match-page.html
- [X] T005 [P] Create manual validation notes template in tests/manual-validation.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the extension package and reusable content-script surface that all user stories build on.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T006 Create Manifest V3 extension metadata with static content script registration in extension/manifest.json
- [X] T007 Create dependency-free content script module shell with exported cleanup helpers in extension/content.js
- [X] T008 Create unit test harness bootstrap for DOM-based tests in tests/unit/content.test.js
- [X] T009 Create integration test harness placeholder for unpacked-extension browser validation in tests/integration/edge-extension.test.js
- [X] T010 Document the current implementation commands and prerequisites in README.md

**Checkpoint**: Foundation ready; user story implementation can now begin.

---

## Phase 3: User Story 1 - Remove monetization overlays (Priority: P1) MVP

**Goal**: Remove every `div` whose class name contains `monetization` while preserving non-matching content.

**Independent Test**: Open or simulate a page with `div class="fc-monetization-dialog-container"` and confirm the matching div is removed while pages without matching divs remain unchanged.

### Tests for User Story 1

- [X] T011 [P] [US1] Create fixture with single, multiple, and nested matching monetization divs in tests/fixtures/monetization-page.html
- [X] T012 [P] [US1] Add failing unit tests for matching div removal and multiple removals in tests/unit/content.test.js
- [X] T013 [P] [US1] Add failing unit tests proving non-div matching elements and no-match pages are preserved in tests/unit/content.test.js
- [X] T014 [P] [US1] Add contract coverage for element cleanup behavior in tests/integration/edge-extension.test.js

### Implementation for User Story 1

- [X] T015 [US1] Implement monetization div detection using substring class matching in extension/content.js
- [X] T016 [US1] Implement removal of all matching monetization divs during initial cleanup in extension/content.js
- [X] T017 [US1] Ensure non-div matching elements and pages without matching divs are left unchanged in extension/content.js
- [X] T018 [US1] Run and record passing User Story 1 unit and integration validation in tests/manual-validation.md

**Checkpoint**: User Story 1 is fully functional and testable independently.

---

## Phase 4: User Story 2 - Restore body scrolling (Priority: P2)

**Goal**: Restore page scrolling when the body overflow is hidden, without changing other body style properties.

**Independent Test**: Open or simulate a page with `body` overflow hidden and confirm overflow becomes auto; confirm non-hidden overflow values are not unnecessarily changed.

### Tests for User Story 2

- [X] T019 [P] [US2] Create fixture with hidden body overflow in tests/fixtures/scroll-locked-page.html
- [X] T020 [P] [US2] Add failing unit tests for hidden-to-auto body overflow restoration in tests/unit/content.test.js
- [X] T021 [P] [US2] Add failing unit tests proving non-hidden body overflow and other body styles are preserved in tests/unit/content.test.js
- [X] T022 [P] [US2] Add integration coverage for scroll restoration behavior in tests/integration/edge-extension.test.js

### Implementation for User Story 2

- [X] T023 [US2] Implement body overflow hidden detection and restoration to auto in extension/content.js
- [X] T024 [US2] Guard scroll restoration so only body overflow changes and only when overflow is hidden in extension/content.js
- [X] T025 [US2] Run and record passing User Story 2 unit and integration validation in tests/manual-validation.md

**Checkpoint**: User Stories 1 and 2 both work independently.

---

## Phase 5: User Story 3 - Handle late monetization dialogs (Priority: P3)

**Goal**: Remove monetization divs and restore scrolling when matching elements appear after initial page load.

**Independent Test**: Open or simulate a page that inserts a matching monetization div after load and confirm it is removed without requiring a reload.

### Tests for User Story 3

- [X] T026 [P] [US3] Create delayed insertion fixture in tests/fixtures/delayed-monetization-page.html
- [X] T027 [P] [US3] Add failing unit tests for delayed matching div removal through DOM mutation handling in tests/unit/content.test.js
- [X] T028 [P] [US3] Add failing unit tests for delayed insertion that also sets body overflow hidden in tests/unit/content.test.js
- [X] T029 [P] [US3] Add journey coverage for delayed cleanup within 1 second in tests/integration/edge-extension.test.js

### Implementation for User Story 3

- [X] T030 [US3] Implement targeted MutationObserver setup that inspects added nodes and descendants in extension/content.js
- [X] T031 [US3] Connect mutation handling to monetization div cleanup and body overflow restoration in extension/content.js
- [X] T032 [US3] Prevent repeated full-document polling and duplicate observer setup in extension/content.js
- [X] T033 [US3] Run and record passing User Story 3 unit and integration validation in tests/manual-validation.md

**Checkpoint**: All user stories are independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final quality, documentation, and release validation across all user stories.

- [X] T034 [P] Update quickstart implementation details and Edge loading notes in specs/001-edge-monetization-remover/quickstart.md
- [X] T035 [P] Update README usage, install, and test instructions in README.md
- [X] T036 Measure and document cleanup timing against the 1 second budget in tests/manual-validation.md
- [X] T037 Run formatting, linting if configured, and the complete test suite via package.json scripts
- [ ] T038 Validate the unpacked extension manually in Microsoft Edge and record browser version and results in tests/manual-validation.md
- [X] T039 Review extension/manifest.json for least necessary permissions and no remote-code behavior

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion; blocks all user stories.
- **User Stories (Phase 3+)**: Depend on Foundational completion.
- **Polish (Phase 6)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Foundational; no dependency on other stories. This is the MVP.
- **User Story 2 (P2)**: Starts after Foundational; can be implemented independently, then validated with US1 for combined page usability.
- **User Story 3 (P3)**: Starts after Foundational; depends conceptually on the cleanup helpers from US1 and scroll helper from US2, but remains testable through its own delayed-insertion fixtures.

### Within Each User Story

- Tests for that story must be written first and fail before implementation.
- Fixture tasks can run in parallel with test-authoring tasks when they touch separate files.
- Implementation tasks follow tests and should complete before story validation.
- Story validation records passing results before moving to the next priority story.

## Parallel Opportunities

- T003, T004, and T005 can run in parallel after T001.
- T011, T012, T013, and T014 can run in parallel after Foundational completion.
- T019, T020, T021, and T022 can run in parallel after Foundational completion.
- T026, T027, T028, and T029 can run in parallel after Foundational completion.
- T034 and T035 can run in parallel during Polish.

## Parallel Example: User Story 1

```text
Task: "T011 [P] [US1] Create fixture with single, multiple, and nested matching monetization divs in tests/fixtures/monetization-page.html"
Task: "T012 [P] [US1] Add failing unit tests for matching div removal and multiple removals in tests/unit/content.test.js"
Task: "T013 [P] [US1] Add failing unit tests proving non-div matching elements and no-match pages are preserved in tests/unit/content.test.js"
Task: "T014 [P] [US1] Add contract coverage for element cleanup behavior in tests/integration/edge-extension.test.js"
```

## Parallel Example: User Story 2

```text
Task: "T019 [P] [US2] Create fixture with hidden body overflow in tests/fixtures/scroll-locked-page.html"
Task: "T020 [P] [US2] Add failing unit tests for hidden-to-auto body overflow restoration in tests/unit/content.test.js"
Task: "T021 [P] [US2] Add failing unit tests proving non-hidden body overflow and other body styles are preserved in tests/unit/content.test.js"
Task: "T022 [P] [US2] Add integration coverage for scroll restoration behavior in tests/integration/edge-extension.test.js"
```

## Parallel Example: User Story 3

```text
Task: "T026 [P] [US3] Create delayed insertion fixture in tests/fixtures/delayed-monetization-page.html"
Task: "T027 [P] [US3] Add failing unit tests for delayed matching div removal through DOM mutation handling in tests/unit/content.test.js"
Task: "T028 [P] [US3] Add failing unit tests for delayed insertion that also sets body overflow hidden in tests/unit/content.test.js"
Task: "T029 [P] [US3] Add journey coverage for delayed cleanup within 1 second in tests/integration/edge-extension.test.js"
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 setup.
2. Complete Phase 2 foundation.
3. Complete Phase 3 User Story 1.
4. Stop and validate matching div removal independently.
5. Demo the MVP by loading the unpacked extension and visiting a page with `fc-monetization-dialog-container`.

### Incremental Delivery

1. Add User Story 1 to remove monetization overlays.
2. Add User Story 2 to restore body scrolling.
3. Add User Story 3 to handle delayed monetization dialogs.
4. Run full validation after each story so earlier behavior remains intact.

### Parallel Team Strategy

1. Complete Setup and Foundational phases together.
2. Assign User Story 1, User Story 2, and User Story 3 to separate developers after shared helpers exist.
3. Merge by story priority, validating each story independently before integration.

## Notes

- `[P]` tasks touch separate files or can be done without depending on incomplete implementation.
- `[US1]`, `[US2]`, and `[US3]` map directly to the prioritized user stories in spec.md.
- The suggested MVP scope is Phase 1, Phase 2, and Phase 3 only.
