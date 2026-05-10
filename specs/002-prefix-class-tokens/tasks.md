# Tasks: Prefix Class Tokens

**Input**: Design documents from `/specs/002-prefix-class-tokens/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are REQUIRED for this behavior change by QT-001 through QT-004. Write the specified tests first and confirm they fail before implementation unless the task explicitly validates existing behavior.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Extension source: `extension/`
- Unit tests: `tests/unit/content.test.js`
- Integration tests and fixture contract checks: `tests/integration/edge-extension.test.js`
- Fixture pages: `tests/fixtures/`
- Maintainer docs: `README.md`, `tests/manual-validation.md`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the existing baseline state and test commands before feature work begins.

- [X] T001 Run the existing automated baseline with `npm test` and record any pre-existing failures in `specs/002-prefix-class-tokens/tasks.md`
- [X] T002 Run the existing lint baseline with `npm run lint` and record any pre-existing failures in `specs/002-prefix-class-tokens/tasks.md`
- [X] T003 [P] Review existing config and content-script exports in `extension/config.js` and `extension/content.js` to preserve baseline API names such as `normalizeKeywords`, `resolveClassKeywords`, `findRemovableDivs`, and `isRemovableDiv`
- [X] T004 [P] Review existing unit and integration coverage in `tests/unit/content.test.js` and `tests/integration/edge-extension.test.js` to avoid reimplementing completed baseline tasks from `specs/001-edge-monetization-remover/tasks.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish shared matching semantics and fixtures that all user stories depend on.

**CRITICAL**: No user story implementation can begin until this phase is complete.

- [X] T005 Add a shared test fixture or helper data set for prefix-token examples including `ads-banner`, `ads_modal`, `paidads`, `ads-*`, and `*` in `tests/unit/content.test.js`
- [X] T006 Add fixture markup for prefix-token integration coverage in `tests/fixtures/prefix-class-tokens-page.html`
- [X] T007 Update integration fixture discovery expectations to include `tests/fixtures/prefix-class-tokens-page.html` in `tests/integration/edge-extension.test.js`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel.

---

## Phase 3: User Story 1 - Match Class Prefix Tokens (Priority: P1) MVP

**Goal**: Maintainer entries ending in `*` match only class tokens that start with the prefix before `*`.

**Independent Test**: Configure `ads*`, run cleanup on divs with `ads-banner`, `layout ads_modal`, and `paidads`, then confirm the first two divs are removed and `paidads` remains when no other entry matches.

### Tests for User Story 1

- [X] T008 [P] [US1] Add failing unit tests for `ads*` matching `ads-banner` and `layout ads_modal` divs in `tests/unit/content.test.js`
- [X] T009 [P] [US1] Add failing unit test proving `ads*` does not remove a `paidads` div when only prefix-token matching applies in `tests/unit/content.test.js`
- [X] T010 [P] [US1] Add failing unit test proving `ads-*` matches `ads-banner` but does not match `ads_modal` in `tests/unit/content.test.js`
- [X] T011 [P] [US1] Add failing integration fixture assertions for prefix-token examples in `tests/integration/edge-extension.test.js`

### Implementation for User Story 1

- [X] T012 [US1] Implement a helper that identifies trailing-star entries and rejects empty prefixes such as `*` in `extension/content.js`
- [X] T013 [US1] Implement class-token prefix matching by comparing trailing-star prefixes against individual element class tokens in `extension/content.js`
- [X] T014 [US1] Update `classContainsKeyword` or its replacement so plain entries use substring matching and trailing-star entries use token-prefix matching in `extension/content.js`
- [X] T015 [US1] Ensure `findRemovableDivs`, `isRemovableDiv`, `cleanup`, and `cleanupAddedNode` use the mixed-mode matcher without changing their exported API names in `extension/content.js`
- [X] T016 [US1] Update packaged maintainer examples to include at least one trailing-star prefix entry in `extension/config.js`

**Checkpoint**: User Story 1 is fully functional and testable independently.

---

## Phase 4: User Story 2 - Preserve Plain Keyword Behavior (Priority: P2)

**Goal**: Plain config entries without a trailing `*` continue substring matching anywhere in the full class text, including mixed configs with prefix entries.

**Independent Test**: Configure plain entries such as `monetization` and `paywall`, run cleanup on existing known matching divs, and confirm removal behavior matches the baseline even when `ads*` is also configured.

### Tests for User Story 2

- [X] T017 [P] [US2] Add or preserve unit regression tests for `monetization` removing `fc-monetization-dialog-container` via substring matching in `tests/unit/content.test.js`
- [X] T018 [P] [US2] Add failing unit test for mixed entries `ads*` and `paywall` removing both prefix-token and plain substring matching divs in `tests/unit/content.test.js`
- [X] T019 [P] [US2] Add integration assertion that configured plain keywords such as `paywall` and `subscription` still appear in fixture coverage in `tests/integration/edge-extension.test.js`

### Implementation for User Story 2

- [X] T020 [US2] Preserve plain keyword substring matching over the full class text while integrating prefix-token support in `extension/content.js`
- [X] T021 [US2] Preserve config normalization order, trimming, empty-entry removal, and duplicate removal for plain and trailing-star values in `extension/content.js`
- [X] T022 [US2] Update maintainer-facing README examples to explain mixed plain and trailing-star entries in `README.md`

**Checkpoint**: User Stories 1 and 2 both work independently.

---

## Phase 5: User Story 3 - Preserve Cleanup Boundaries (Priority: P3)

**Goal**: Prefix-token support preserves div-only cleanup, fallback behavior, delayed cleanup, body overflow restoration, and no-visible-UI constraints.

**Independent Test**: Use prefix and plain entries on pages with matching divs, matching non-div elements, missing or invalid config, hidden body overflow, and delayed inserted elements, then confirm baseline cleanup boundaries remain intact.

### Tests for User Story 3

- [X] T023 [P] [US3] Add failing unit test proving a non-div element with an `ads*` matching class token remains unchanged in `tests/unit/content.test.js`
- [X] T024 [P] [US3] Add failing unit tests proving missing, empty, invalid, duplicate, whitespace, and exactly `*` configs fall back or normalize correctly in `tests/unit/content.test.js`
- [X] T025 [P] [US3] Add failing unit test proving delayed insertion removes a prefix-token matching div through mutation handling in `tests/unit/content.test.js`
- [X] T026 [P] [US3] Add or preserve unit regression tests for body overflow restoration with prefix-token cleanup in `tests/unit/content.test.js`
- [X] T027 [P] [US3] Add integration assertions that the content script still uses targeted mutation observation, no polling, no storage, no network behavior, and no new permissions in `tests/integration/edge-extension.test.js`

### Implementation for User Story 3

- [X] T028 [US3] Ensure prefix-token matching is restricted to div removal by preserving the `isRemovableDiv` tag check in `extension/content.js`
- [X] T029 [US3] Ensure mutation cleanup uses the same mixed-mode matcher for added nodes and descendants in `extension/content.js`
- [X] T030 [US3] Ensure body overflow restoration remains unchanged and affects only `document.body.style.overflow` in `extension/content.js`
- [X] T031 [US3] Ensure the manifest keeps no background worker, no storage permission, and config-before-content ordering in `extension/manifest.json`
- [X] T032 [US3] Update manual validation steps for prefix-token, non-div, fallback, delayed cleanup, and scroll restoration cases in `tests/manual-validation.md`

**Checkpoint**: All user stories are independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and consistency checks across all stories.

- [X] T033 [P] Update quickstart-aligned maintainer examples for `ads*` and `ads-*` in `README.md`
- [X] T034 [P] Review code comments and remove any obsolete substring-only terminology in `extension/content.js`
- [X] T035 Run `npm test` and fix any failing unit or integration coverage in `tests/unit/content.test.js` and `tests/integration/edge-extension.test.js`
- [X] T036 Run `npm run lint` and fix lint violations in `extension/content.js`, `extension/config.js`, `tests/unit/content.test.js`, and `tests/integration/edge-extension.test.js`
- [X] T037 Validate the quickstart scenarios from `specs/002-prefix-class-tokens/quickstart.md` and record any manual-only validation result in `tests/manual-validation.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion - blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational completion and is the MVP.
- **User Story 2 (Phase 4)**: Depends on Foundational completion; can be implemented independently but should be verified after US1 for mixed-mode behavior.
- **User Story 3 (Phase 5)**: Depends on Foundational completion; can be implemented independently but should be verified after the mixed-mode matcher exists.
- **Polish (Phase 6)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - no dependencies on other stories.
- **User Story 2 (P2)**: Can start after Foundational - validates compatibility with the matcher introduced by US1.
- **User Story 3 (P3)**: Can start after Foundational - validates cleanup boundaries around the matcher introduced by US1.

### Within Each User Story

- Tests should be written first and fail before implementation for new behavior.
- Matching helper changes precede cleanup integration changes.
- Fixture and integration assertions should align with the same behavior covered by unit tests.
- Story is complete only when its independent test passes.

### Parallel Opportunities

- T003 and T004 can run in parallel after baseline commands are started.
- T008 through T011 can be written in parallel because they target separate assertions.
- T017 through T019 can be written in parallel because they cover independent compatibility assertions.
- T023 through T027 can be written in parallel because they cover independent cleanup boundaries.
- T033 and T034 can run in parallel during polish.

---

## Parallel Example: User Story 1

```bash
# Prefix-token tests that can be assigned together:
Task: "Add failing unit tests for ads* matching ads-banner and layout ads_modal divs in tests/unit/content.test.js"
Task: "Add failing unit test proving ads* does not remove a paidads div in tests/unit/content.test.js"
Task: "Add failing unit test proving ads-* matches ads-banner but not ads_modal in tests/unit/content.test.js"
Task: "Add failing integration fixture assertions for prefix-token examples in tests/integration/edge-extension.test.js"
```

## Parallel Example: User Story 2

```bash
# Backward-compatibility tests that can be assigned together:
Task: "Add or preserve unit regression tests for monetization substring matching in tests/unit/content.test.js"
Task: "Add failing unit test for mixed entries ads* and paywall in tests/unit/content.test.js"
Task: "Add integration assertion for configured plain keyword fixture coverage in tests/integration/edge-extension.test.js"
```

## Parallel Example: User Story 3

```bash
# Cleanup-boundary tests that can be assigned together:
Task: "Add failing unit test proving a non-div element with an ads* matching class token remains unchanged in tests/unit/content.test.js"
Task: "Add failing unit tests for missing, empty, invalid, duplicate, whitespace, and exactly * config behavior in tests/unit/content.test.js"
Task: "Add failing unit test proving delayed insertion removes a prefix-token matching div in tests/unit/content.test.js"
Task: "Add integration assertions for targeted mutation observation and least-privilege behavior in tests/integration/edge-extension.test.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. Stop and validate the independent `ads*` and `ads-*` prefix-token scenarios.
5. Run `npm test` before extending compatibility and boundary coverage.

### Incremental Delivery

1. Setup + Foundational establish baseline and prefix fixtures.
2. Add User Story 1 for trailing-star prefix-token matching.
3. Add User Story 2 to prove existing plain keyword configs still work.
4. Add User Story 3 to prove cleanup boundaries, fallback, delayed cleanup, and scroll restoration remain intact.
5. Complete polish with full `npm test`, `npm run lint`, and quickstart validation.

### Parallel Team Strategy

1. One developer completes baseline setup while another prepares prefix fixture coverage.
2. After Foundational, assign US1, US2, and US3 test tasks in parallel.
3. Merge around the shared matcher in `extension/content.js`, then run the full validation suite.

---

## Notes

- [P] tasks use separate files or independent assertions and do not depend on incomplete implementation tasks.
- [Story] labels map to user stories in `specs/002-prefix-class-tokens/spec.md`.
- Do not reimplement completed baseline tasks from `specs/001-edge-monetization-remover/tasks.md`; preserve existing behavior and extend only for prefix-token support.
- Baseline on 2026-05-10 before implementation: `npm test` failed 2 tests because packaged config already contained extra keyword examples while baseline assertions expected only `["monetization"]`; `npm run lint` passed.
- Final validation on 2026-05-10 after implementation: `npm test` passed 27 tests and `npm run lint` passed.
