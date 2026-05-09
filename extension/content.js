(function initEdgeMonetizationRemover(globalScope) {
  "use strict";

  var API_KEY = "EdgeMonetizationRemover";
  var observer = null;

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

  function isMonetizationDiv(node) {
    return Boolean(
      node &&
        node.nodeType === 1 &&
        String(node.tagName || "").toLowerCase() === "div" &&
        getClassText(node).indexOf("monetization") !== -1
    );
  }

  function findMonetizationDivs(root) {
    if (!root) {
      return [];
    }

    var matches = [];

    if (isMonetizationDiv(root)) {
      matches.push(root);
    }

    if (typeof root.querySelectorAll === "function") {
      var descendants = root.querySelectorAll('div[class*="monetization"]');
      for (var index = 0; index < descendants.length; index += 1) {
        if (isMonetizationDiv(descendants[index]) && matches.indexOf(descendants[index]) === -1) {
          matches.push(descendants[index]);
        }
      }
    }

    return matches;
  }

  function removeMonetizationDivs(root) {
    var matches = findMonetizationDivs(root);

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

    return {
      removedCount: removeMonetizationDivs(cleanupRoot),
      scrollRestored: restoreBodyOverflow(targetDocument),
      source: source || "initial"
    };
  }

  function cleanupAddedNode(node) {
    var targetDocument = node && node.ownerDocument ? node.ownerDocument : globalScope.document;

    return {
      removedCount: removeMonetizationDivs(node),
      scrollRestored: restoreBodyOverflow(targetDocument),
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
    findMonetizationDivs: findMonetizationDivs,
    handleMutations: handleMutations,
    isMonetizationDiv: isMonetizationDiv,
    observe: observe,
    restoreBodyOverflow: restoreBodyOverflow,
    run: run
  };

  globalScope[API_KEY] = api;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  run();
})(typeof globalThis !== "undefined" ? globalThis : window);
