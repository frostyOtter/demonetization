# Implementation Plan: Edge Monetization Remover

**Branch**: `001-edge-monetization-remover` | **Date**: 2026-05-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-edge-monetization-remover/spec.md`

## Summary

Build a minimal Microsoft Edge Manifest V3 extension that runs a static content script on web pages, removes `div` elements whose class contains `monetization`, restores body overflow from hidden to auto, and observes later DOM additions so delayed monetization containers are also removed. The design avoids runtime dependencies, user settings, background workers, storage, and remote code for the initial release.

## Technical Context

**Language/Version**: JavaScript targeting Microsoft Edge Chromium extension runtime with Manifest V3  
**Primary Dependencies**: No runtime dependencies; test tooling may use a DOM-capable JavaScript test runner  
**Storage**: N/A; no persisted settings or user data in v1  
**Testing**: Unit tests for cleanup logic in a DOM-like environment, plus manual or automated browser journey validation with an unpacked Edge extension  
**Target Platform**: Microsoft Edge desktop, Chromium extension platform  
**Project Type**: Browser extension  
**Performance Goals**: Remove matching divs and restore scroll within 1 second of page load or delayed insertion  
**Constraints**: No user setup for v1; no visible page UI; no remote code; no network access; only body overflow may be changed  
**Scale/Scope**: Applies broadly to web pages where extension host access is allowed by the browser and user settings

## Constitution Check

*GATE: Passed before Phase 0 research and re-checked after Phase 1 design.*

- **Code Quality**: Use a small content-script module with named cleanup functions, clear selectors, defensive DOM checks, and no new runtime dependency. Any test-only dependency must be justified by deterministic coverage.
- **Testing Standards**: Cover selector matching, multiple removals, no-op pages, non-div preservation, body overflow restoration, non-hidden overflow preservation, and delayed insertion. Browser journey validation must prove unpacked extension behavior in Edge.
- **UX Consistency**: The extension is intentionally invisible: no prompts, success messages, settings screen, toolbar workflow, loading state, empty state, or error state for v1. The user-visible outcome is restored page reading and scrolling.
- **Performance Budgets**: Initial cleanup and delayed cleanup must complete within 1 second. Mutation handling must inspect added nodes and descendants instead of polling the whole document on a timer.
- **Simplicity Review**: A manifest plus content script is the simplest design that satisfies the spec. Background workers, options pages, storage, analytics, and framework build steps are excluded from v1.

## Project Structure

### Documentation (this feature)

```text
specs/001-edge-monetization-remover/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── content-script-behavior.md
└── tasks.md
```

### Source Code (repository root)

```text
extension/
├── manifest.json
└── content.js

tests/
├── fixtures/
│   ├── monetization-page.html
│   ├── no-match-page.html
│   └── delayed-monetization-page.html
├── integration/
│   └── edge-extension.test.js
└── unit/
    └── content.test.js
```

**Structure Decision**: Use one small browser-extension package in `extension/` and colocate validation assets under `tests/`. The repository currently has no application code, so this layout keeps implementation direct and avoids introducing an unnecessary app framework.

## Complexity Tracking

No constitution violations or added complexity are accepted for this plan.
