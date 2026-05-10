# Implementation Plan: Prefix Class Tokens

**Branch**: `002-prefix-class-tokens` | **Date**: 2026-05-10 | **Spec**: `specs/002-prefix-class-tokens/spec.md`
**Input**: Feature specification from `/specs/002-prefix-class-tokens/spec.md`

## Summary

Extend the packaged maintainer keyword configuration so entries ending in `*` act as class-token prefix matchers while existing plain entries continue to match substrings anywhere in the full class text. The content script remains a dependency-free Manifest V3 static content script, still removes only matching `div` elements, still restores body overflow from hidden to auto, and still uses the existing keyword normalization and `monetization` fallback behavior.

## Technical Context

**Language/Version**: JavaScript for Microsoft Edge/Chromium Manifest V3 content scripts; Node.js >=20 for local tests  
**Primary Dependencies**: Browser-native DOM APIs, `MutationObserver`, Node built-in test runner; no runtime dependencies  
**Storage**: N/A; packaged `extension/config.js` only  
**Testing**: `npm test`, `npm run lint`, unit tests in `tests/unit/content.test.js`, integration checks in `tests/integration/edge-extension.test.js`  
**Target Platform**: Microsoft Edge Manifest V3 extension on `http://*/*` and `https://*/*` pages  
**Project Type**: Browser extension with dependency-free content script and static config file  
**Performance Goals**: Matching div removal within 1 second after initial load or delayed insertion on validation pages  
**Constraints**: No new permissions, no background worker, no storage, no network requests, no remote code, no non-div removal  
**Scale/Scope**: One packaged extension, one config file, one content script, deterministic local fixture coverage

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Code Quality**: Pass. Implement prefix matching in the existing matching helpers without adding dependencies or broad abstractions. Preserve the existing public test API names and config resolution flow.
- **Testing Standards**: Pass. Add regression coverage for trailing-star entries, plain substring entries, normalization/fallback behavior, div-only cleanup, delayed DOM cleanup, body overflow restoration, and integration/config examples.
- **UX Consistency**: Pass. No visible UI is introduced. The extension continues to operate unobtrusively and preserves page content except matching cleanup divs and body overflow restoration.
- **Performance Budgets**: Pass. Matching must remain bounded to inspected divs and added mutation subtrees, with fixture validation proving removal within the existing 1 second budget.
- **Simplicity Review**: Pass. Treat trailing `*` as a small extension to keyword interpretation instead of creating a rule language, storage schema, or options UI.

## Project Structure

### Documentation (this feature)

```text
specs/002-prefix-class-tokens/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
extension/
├── config.js            # Maintainer keyword config; plain and trailing-* entries
├── content.js           # DOM cleanup, config normalization, matching, observer
└── manifest.json        # MV3 manifest; loads config.js before content.js

tests/
├── fixtures/            # HTML validation pages
├── integration/         # Manifest/config/fixture behavior checks
└── unit/                # Content script behavior tests
```

**Structure Decision**: Continue the existing single-extension layout. The wildcard-prefix behavior belongs in `extension/content.js` matching logic and is configured through `extension/config.js`; no new project, service, or runtime dependency is needed.

## Phase 0: Research

- No unresolved technical clarifications remain.
- `research.md` records the selected trailing-star config semantics and rejects broader wildcard syntax, regex matching, and changing plain keyword behavior.

## Phase 1: Design & Contracts

- `data-model.md` defines `CleanupConfigEntry` semantics for plain substring entries and trailing-star class-token prefix entries.
- `contracts/content-script-behavior.md` documents observable config and cleanup behavior.
- `quickstart.md` includes maintainer examples such as `ads*` and `ads-*`.
- `AGENTS.md` points to `specs/002-prefix-class-tokens/plan.md` for current feature planning context.

## Post-Design Constitution Check

- **Code Quality**: Pass. The plan keeps logic local to existing helpers and avoids new dependencies.
- **Testing Standards**: Pass. The design calls for focused regression tests covering old and new matching modes.
- **UX Consistency**: Pass. No user-visible controls or messages are added.
- **Performance Budgets**: Pass. Token-prefix matching is a bounded string operation over inspected class tokens.
- **Simplicity Review**: Pass. The design adds only one special suffix convention to maintainer config entries.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
