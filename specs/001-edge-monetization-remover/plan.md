# Implementation Plan: Edge Monetization Remover

**Branch**: `main` | **Date**: 2026-05-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-edge-monetization-remover/spec.md`

**Note**: This plan was filled in by the `/speckit-plan` workflow.

## Summary

Extend the Microsoft Edge Manifest V3 extension so the DOM cleanup keyword list is defined in a packaged config file instead of being hard-coded to only `monetization`. The default config preserves the existing `monetization` behavior, while maintainers can add values such as `paywall` or `subscription`; the content script normalizes configured keywords, removes only `div` elements whose class contains any configured value, restores body overflow from hidden to auto, and continues observing delayed DOM insertions.

## Technical Context

**Language/Version**: JavaScript targeting Chromium Manifest V3 content scripts; Node.js >=20 for tests  
**Primary Dependencies**: Browser DOM APIs, MutationObserver, Microsoft Edge/Chromium extension runtime; no runtime npm dependencies  
**Storage**: Packaged extension config file, planned as `extension/config.js`; no user data persistence  
**Testing**: Node built-in test runner via `npm test`, with static manifest/content-script integration checks  
**Target Platform**: Microsoft Edge on Chromium-compatible `http://*/*` and `https://*/*` pages  
**Project Type**: Browser extension content-script project  
**Performance Goals**: Remove 100% of matching configured-keyword divs within 1 second of page load or delayed insertion on validation fixtures  
**Constraints**: No visible page controls, no per-page user interaction, no remote code, no network requests, no new extension permissions for the config file, only body `overflow` may be changed  
**Scale/Scope**: Single extension package with one config file, one content script, unit tests, integration tests, and manual Edge validation fixtures

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Code Quality**: Pass. Keep the implementation dependency-free and local to `extension/config.js`, `extension/content.js`, and tests. Add small helper functions for keyword normalization and matching instead of duplicating selector logic. Avoid new abstractions beyond the config boundary.
- **Testing Standards**: Pass. Add unit coverage for multiple configured keywords, whitespace/duplicate normalization, fallback behavior, non-div preservation, delayed mutation cleanup, and scroll restoration. Add integration coverage that the manifest loads `config.js` before `content.js` and that no network or remote-code behavior is introduced.
- **UX Consistency**: Pass. The extension remains unobtrusive and adds no page UI, prompts, onboarding, success states, or options page for this change. The config is maintainer-edited in the packaged extension.
- **Performance Budgets**: Pass. Initial cleanup and mutation cleanup must remain under 1 second in deterministic fixtures. Matching should inspect added DOM subtrees and avoid polling or repeated whole-document scans for mutations.
- **Simplicity Review**: Pass. A packaged JavaScript config file loaded before the content script is the simplest config mechanism that avoids async fetching, storage permissions, an options page, or a background worker.

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
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
extension/
├── manifest.json       # MV3 manifest, loads config before content script
├── config.js           # Packaged class-keyword config
└── content.js          # DOM cleanup and mutation observer logic

tests/
├── fixtures/
│   ├── delayed-monetization-page.html
│   ├── monetization-page.html
│   ├── no-match-page.html
│   └── scroll-locked-page.html
├── integration/
│   └── edge-extension.test.js
├── manual-validation.md
└── unit/
    └── content.test.js
```

**Structure Decision**: Keep the existing single-extension structure. Add `extension/config.js` next to the manifest and content script so maintainers have one obvious packaged file to edit and tests can load it without browser storage or network mocking.

## Complexity Tracking

No constitution violations or justified complexity exceptions.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
