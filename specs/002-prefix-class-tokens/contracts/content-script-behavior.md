# Contract: Content Script Behavior

This contract defines the externally observable behavior of the extension config file and content script. The extension exposes no HTTP API, command-line interface, storage schema, or user-facing settings for this feature.

## Configuration

- The manifest loads `config.js` before `content.js`.
- The config file defines a maintainer-editable list of class-name match entries.
- The default entry list includes `monetization`.
- Configured entries are trimmed, empty values are ignored, and duplicates are removed.
- If the config is missing, empty, or invalid, the content script uses `monetization`.
- The config is packaged with the extension; it is not fetched from a remote service and does not require browser storage permissions.
- Plain config entries match by substring against the element class text.
- Config entries ending in `*` match when an individual class token starts with the entry prefix before `*`; for example, `ads*` matches `adsbygoogle` and `ads-banner`, while `ads-*` matches `ads-banner`.
- The trailing-star suffix is not a general glob or regular-expression language.

## Execution

- Runs automatically on web pages where the extension is allowed to inject a content script.
- Requires no per-page user interaction.
- Adds no visible controls, prompts, success messages, or onboarding to the page.

## Element Cleanup

- Given a page contains one or more `div` elements whose class name contains any plain configured entry, all matching divs are removed.
- Given a page contains one or more `div` elements with a class token starting with a configured trailing-star prefix, all matching divs are removed.
- Given a page contains a matching div inside a newly added DOM subtree, that matching div is removed after insertion.
- Given a page contains a non-div element whose class name matches a plain or trailing-star entry, that element is not removed.
- Given a page contains no matching div elements, visible page content is not removed.
- Given a page contains a class token such as `paidads` and the only relevant configured entry is `ads*`, that div is not removed by the prefix-token rule.

## Body Scroll Restoration

- Given body overflow is hidden, body overflow is changed to auto.
- Given body overflow is auto or another non-hidden value, body overflow is not unnecessarily changed.
- No body style property other than overflow is changed.

## Performance and Safety

- Matching divs are removed within 1 second of page load or delayed insertion on validation pages.
- Mutation handling inspects added nodes and descendants and does not rely on repeated full-document polling.
- The script performs no network requests and stores no user data.
