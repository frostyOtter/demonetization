(function configureEdgeMonetizationRemover(globalScope) {
  "use strict";

  globalScope.EdgeMonetizationRemoverConfig = {
    // Maintainers can add class-name substrings such as "paywall" or "subscription".
    classKeywords: ["monetization"]
  };
})(typeof globalThis !== "undefined" ? globalThis : window);
