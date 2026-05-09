# Contract: Content Script Behavior

This contract defines the externally observable behavior of the extension content script. The extension exposes no HTTP API, command-line interface, storage schema, or user-facing settings in v1.

## Execution

- Runs automatically on web pages where the extension is allowed to inject a content script.
- Requires no per-page user interaction.
- Adds no visible controls, prompts, success messages, or onboarding to the page.

## Element Cleanup

- Given a page contains one or more `div` elements whose class name contains `monetization`, all matching divs are removed.
- Given a page contains a matching div inside a newly added DOM subtree, that matching div is removed after insertion.
- Given a page contains a non-div element whose class name contains `monetization`, that element is not removed.
- Given a page contains no matching div elements, visible page content is not removed.

## Body Scroll Restoration

- Given body overflow is hidden, body overflow is changed to auto.
- Given body overflow is auto or another non-hidden value, body overflow is not unnecessarily changed.
- No body style property other than overflow is changed.

## Performance and Safety

- Matching divs are removed within 1 second of page load or delayed insertion on validation pages.
- Mutation handling inspects added nodes and descendants and does not rely on repeated full-document polling.
- The script performs no network requests and stores no user data.
