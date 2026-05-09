(function initEdgeMonetizationRemover(globalScope) {
  "use strict";

  var API_KEY = "EdgeMonetizationRemover";
  var CONFIG_KEY = "EdgeMonetizationRemoverConfig";
  var DEFAULT_CLASS_KEYWORD = "monetization";
  var observer = null;

  function normalizeKeywords(value) {
    if (!Array.isArray(value)) {
      return [DEFAULT_CLASS_KEYWORD];
    }

    var normalized = [];

    for (var index = 0; index < value.length; index += 1) {
      if (typeof value[index] !== "string") {
        continue;
      }

      var keyword = value[index].trim();
      if (keyword && normalized.indexOf(keyword) === -1) {
        normalized.push(keyword);
      }
    }

    return normalized.length > 0 ? normalized : [DEFAULT_CLASS_KEYWORD];
  }

  function resolveClassKeywords(config) {
    var targetConfig = config || globalScope[CONFIG_KEY];
    return normalizeKeywords(targetConfig && targetConfig.classKeywords);
  }

  function getClassText(element) {
    if (!element) {
      return "";
    }

    if (typeof element.className === "string") {
      return element.className;
    }

    if (element.className && typeof element.className.baseVal === "string") {
      return element.className.baseVal;
    }

    if (typeof element.getAttribute === "function") {
      return element.getAttribute("class") || "";
    }

    return "";
  }

  function classContainsKeyword(classText, keywords) {
    for (var index = 0; index < keywords.length; index += 1) {
      if (classText.indexOf(keywords[index]) !== -1) {
        return true;
      }
    }

    return false;
  }

  function isRemovableDiv(node, keywords) {
    var targetKeywords = keywords || resolveClassKeywords();

    return Boolean(
      node &&
        node.nodeType === 1 &&
        String(node.tagName || "").toLowerCase() === "div" &&
        classContainsKeyword(getClassText(node), targetKeywords)
    );
  }

  function findRemovableDivs(root, keywords) {
    if (!root) {
      return [];
    }

    var targetKeywords = keywords || resolveClassKeywords();
    var matches = [];

    if (isRemovableDiv(root, targetKeywords)) {
      matches.push(root);
    }

    if (typeof root.querySelectorAll === "function") {
      var descendants = root.querySelectorAll("div[class]");
      for (var index = 0; index < descendants.length; index += 1) {
        if (isRemovableDiv(descendants[index], targetKeywords) && matches.indexOf(descendants[index]) === -1) {
          matches.push(descendants[index]);
        }
      }
    }

    return matches;
  }

  function removeRemovableDivs(root, keywords) {
    var matches = findRemovableDivs(root, keywords);

    for (var index = 0; index < matches.length; index += 1) {
      if (matches[index].parentNode && typeof matches[index].parentNode.removeChild === "function") {
        matches[index].parentNode.removeChild(matches[index]);
      } else if (typeof matches[index].remove === "function") {
        matches[index].remove();
      }
    }

    return matches.length;
  }

  function restoreBodyOverflow(doc) {
    var targetDocument = doc || globalScope.document;

    if (!targetDocument || !targetDocument.body || !targetDocument.body.style) {
      return false;
    }

    if (targetDocument.body.style.overflow === "hidden") {
      targetDocument.body.style.overflow = "auto";
      return true;
    }

    return false;
  }

  function cleanup(root, source) {
    var cleanupRoot = root || (globalScope.document && globalScope.document.documentElement);
    var targetDocument =
      cleanupRoot && cleanupRoot.ownerDocument
        ? cleanupRoot.ownerDocument
        : globalScope.document;
    var keywords = resolveClassKeywords();

    return {
      removedCount: removeRemovableDivs(cleanupRoot, keywords),
      scrollRestored: restoreBodyOverflow(targetDocument),
      keywordsUsed: keywords.slice(),
      source: source || "initial"
    };
  }

  function cleanupAddedNode(node) {
    var targetDocument = node && node.ownerDocument ? node.ownerDocument : globalScope.document;
    var keywords = resolveClassKeywords();

    return {
      removedCount: removeRemovableDivs(node, keywords),
      scrollRestored: restoreBodyOverflow(targetDocument),
      keywordsUsed: keywords.slice(),
      source: "mutation"
    };
  }

  function handleMutations(mutations) {
    var removedCount = 0;
    var scrollRestored = false;

    for (var mutationIndex = 0; mutationIndex < mutations.length; mutationIndex += 1) {
      var mutation = mutations[mutationIndex];
      for (var nodeIndex = 0; nodeIndex < mutation.addedNodes.length; nodeIndex += 1) {
        var result = cleanupAddedNode(mutation.addedNodes[nodeIndex]);
        removedCount += result.removedCount;
        scrollRestored = scrollRestored || result.scrollRestored;
      }
    }

    return {
      removedCount: removedCount,
      scrollRestored: scrollRestored,
      keywordsUsed: resolveClassKeywords(),
      source: "mutation"
    };
  }

  function observe(doc) {
    var targetDocument = doc || globalScope.document;

    if (observer || !targetDocument || !targetDocument.documentElement || typeof globalScope.MutationObserver !== "function") {
      return observer;
    }

    observer = new globalScope.MutationObserver(handleMutations);
    observer.observe(targetDocument.documentElement, {
      childList: true,
      subtree: true
    });

    return observer;
  }

  function disconnectObserver() {
    if (observer && typeof observer.disconnect === "function") {
      observer.disconnect();
    }

    observer = null;
  }

  function run(doc) {
    var targetDocument = doc || globalScope.document;

    if (!targetDocument || !targetDocument.documentElement) {
      return {
        removedCount: 0,
        scrollRestored: false,
        keywordsUsed: resolveClassKeywords(),
        source: "initial"
      };
    }

    var result = cleanup(targetDocument.documentElement, "initial");
    observe(targetDocument);
    return result;
  }

  var api = {
    cleanup: cleanup,
    cleanupAddedNode: cleanupAddedNode,
    disconnectObserver: disconnectObserver,
    findMonetizationDivs: findRemovableDivs,
    findRemovableDivs: findRemovableDivs,
    handleMutations: handleMutations,
    isMonetizationDiv: isRemovableDiv,
    isRemovableDiv: isRemovableDiv,
    normalizeKeywords: normalizeKeywords,
    observe: observe,
    resolveClassKeywords: resolveClassKeywords,
    restoreBodyOverflow: restoreBodyOverflow,
    run: run
  };

  globalScope[API_KEY] = api;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  run();
})(typeof globalThis !== "undefined" ? globalThis : window);
