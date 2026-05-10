(function configureEdgeMonetizationRemover(globalScope) {
  "use strict";

  globalScope.EdgeMonetizationRemoverConfig = {
    // Plain entries match substrings; trailing-star entries match class-token prefixes.
    classKeywords: ["monetization", "adsby*", "googleads", "adblock*"]
  };
})(typeof globalThis !== "undefined" ? globalThis : window);
