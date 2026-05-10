# Manual Validation Notes

## Automated Validation

| Date | Command | Result | Notes |
|------|---------|--------|-------|
| 2026-05-09 | `npm test` | Pass | 20 tests passed: default config, configured keywords, fallback behavior, unit cleanup, delayed mutation handling, timing budget, manifest ordering, fixture, and no remote-code checks. |
| 2026-05-09 | `npm run lint` | Pass | Syntax checks passed for config, extension, and test scripts. |
| 2026-05-10 | `npm test` | Pass | 27 tests passed: prefix-token `ads*` and `ads-*`, mixed plain keywords, fallback, delayed cleanup, scroll restoration, and fixture contracts. |
| 2026-05-10 | `npm run lint` | Pass | Syntax checks passed for config, extension, and test scripts after prefix-token implementation. |

## Microsoft Edge Validation

| Date | Edge Version | Fixture | Expected | Actual | Result |
|------|--------------|---------|----------|--------|--------|
| 2026-05-09 | Not run | `tests/fixtures/monetization-page.html` | Matching monetization divs removed within 1 second; non-matching content remains. | Not run in local browser. | Pending |
| 2026-05-09 | Not run | `tests/fixtures/configured-keywords-page.html` | Matching configured paywall and subscription divs removed; matching non-div remains. | Not run in local browser. | Pending |
| 2026-05-09 | Not run | `tests/fixtures/scroll-locked-page.html` | Body overflow changes from hidden to auto without other body style changes. | Not run in local browser. | Pending |
| 2026-05-09 | Not run | `tests/fixtures/delayed-monetization-page.html` | Delayed monetization and configured-keyword divs removed within 1 second after insertion and scroll restored. | Not run in local browser. | Pending |
| 2026-05-10 | Not run | `tests/fixtures/prefix-class-tokens-page.html` | `ads-banner`, `layout ads_modal`, `site-hardpaywall-modal`, and delayed `ads-late-modal` divs removed; `paidads` and matching non-div content remain; scroll restored. | Not run in local browser. | Pending |

## Performance Budget

- Target: initial cleanup and delayed cleanup complete within 1 second.
- Automated coverage verifies targeted MutationObserver behavior, no polling, prefix-token cleanup, and cleanup under the 1 second budget for 250 matching divs plus a delayed inserted matching div.
- Browser version available for future manual validation: Microsoft Edge 148.0.3967.54.
- Browser timing measurement remains pending until manual Microsoft Edge validation is run.
