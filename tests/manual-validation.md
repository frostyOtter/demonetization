# Manual Validation Notes

## Automated Validation

| Date | Command | Result | Notes |
|------|---------|--------|-------|
| 2026-05-09 | `npm test` | Pass | 13 tests passed: unit cleanup, delayed mutation handling, timing budget, manifest, fixture, and no remote-code checks. |
| 2026-05-09 | `npm run lint` | Pass | Syntax checks passed for extension and test scripts. |

## Microsoft Edge Validation

| Date | Edge Version | Fixture | Expected | Actual | Result |
|------|--------------|---------|----------|--------|--------|
| 2026-05-09 | Not run | `tests/fixtures/monetization-page.html` | Matching monetization divs removed within 1 second; non-matching content remains. | Not run in local browser. | Pending |
| 2026-05-09 | Not run | `tests/fixtures/scroll-locked-page.html` | Body overflow changes from hidden to auto without other body style changes. | Not run in local browser. | Pending |
| 2026-05-09 | Not run | `tests/fixtures/delayed-monetization-page.html` | Delayed monetization div removed within 1 second after insertion and scroll restored. | Not run in local browser. | Pending |

## Performance Budget

- Target: initial cleanup and delayed cleanup complete within 1 second.
- Automated coverage verifies targeted MutationObserver behavior, no polling, and cleanup under the 1 second budget for 250 matching divs plus a delayed inserted matching div.
- Browser timing measurement remains pending until manual Microsoft Edge validation is run.
