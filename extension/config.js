(function configureEdgeMonetizationRemover(globalScope) {
  "use strict";

  globalScope.EdgeMonetizationRemoverConfig = {
    // Plain entries match substrings; trailing-star entries match class-token prefixes.
    classKeywords: ["monetization", "adsby*", "googleads", "adblock*", "banner-preload*", "banner-catfish*", "ad_position_box"]
  };
})(typeof globalThis !== "undefined" ? globalThis : window);
