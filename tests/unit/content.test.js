const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const rootDir = path.resolve(__dirname, "../..");
const configScript = fs.readFileSync(path.join(rootDir, "extension/config.js"), "utf8");
const contentScript = fs.readFileSync(path.join(rootDir, "extension/content.js"), "utf8");

class FakeStyle {
  constructor(initial = {}) {
    Object.assign(this, initial);
  }
}

class FakeElement {
  constructor(tagName, className = "") {
    this.nodeType = 1;
    this.tagName = tagName.toUpperCase();
    this.className = className;
    this.children = [];
    this.parentNode = null;
    this.ownerDocument = null;
    this.style = new FakeStyle();
  }

  appendChild(child) {
    child.parentNode = this;
    child.ownerDocument = this.ownerDocument;
    this.children.push(child);
    return child;
  }

  getAttribute(name) {
    return name === "class" ? this.className : null;
  }

  remove() {
    if (this.parentNode) {
      this.parentNode.removeChild(this);
    }
  }

  removeChild(child) {
    const index = this.children.indexOf(child);
    if (index >= 0) {
      this.children.splice(index, 1);
      child.parentNode = null;
    }
    return child;
  }

  querySelectorAll(selector) {
    assert.equal(selector, "div[class]");
    const matches = [];

    function visit(node) {
      for (const child of node.children) {
        if (child.tagName.toLowerCase() === "div" && String(child.className)) {
          matches.push(child);
        }
        visit(child);
      }
    }

    visit(this);
    return matches;
  }
}

function createDocument() {
  const document = {
    documentElement: new FakeElement("html"),
    body: new FakeElement("body")
  };

  document.documentElement.ownerDocument = document;
  document.body.ownerDocument = document;
  document.documentElement.appendChild(document.body);

  return document;
}

function createApi(document = createDocument(), extraContext = {}) {
  const context = {
    document: extraContext.autoRunDocument ? document : undefined,
    module: { exports: {} },
    MutationObserver: extraContext.MutationObserver,
    ...extraContext
  };
  context.globalThis = context;
  if (extraContext.loadDefaultConfig) {
    vm.runInNewContext(configScript, context, { filename: "config.js" });
  }
  vm.runInNewContext(contentScript, context, { filename: "content.js" });
  return {
    api: context.module.exports,
    context,
    document
  };
}

function assertArrayEqual(actual, expected) {
  assert.deepEqual(Array.from(actual), expected);
}

test("loads default packaged config before content script when requested", () => {
  const { api, context } = createApi(createDocument(), { loadDefaultConfig: true });

  assertArrayEqual(context.EdgeMonetizationRemoverConfig.classKeywords, ["monetization"]);
  assertArrayEqual(api.resolveClassKeywords(), ["monetization"]);
});

test("removes a single matching monetization div with default config", () => {
  const document = createDocument();
  const overlay = document.body.appendChild(new FakeElement("div", "fc-monetization-dialog-container"));
  document.body.appendChild(new FakeElement("div", "plain-card"));
  const { api } = createApi(document);

  const result = api.cleanup(document.documentElement, "test");

  assert.equal(result.removedCount, 1);
  assert.equal(overlay.parentNode, null);
  assert.equal(document.body.children.length, 1);
});

test("removes multiple and nested matching monetization divs with default config", () => {
  const document = createDocument();
  const wrapper = document.body.appendChild(new FakeElement("section"));
  const nested = wrapper.appendChild(new FakeElement("div", "promo monetization-wall"));
  const topLevel = document.body.appendChild(new FakeElement("div", "site-monetization-backdrop"));
  const { api } = createApi(document);

  const result = api.cleanup(document.documentElement, "test");

  assert.equal(result.removedCount, 2);
  assertArrayEqual(result.keywordsUsed, ["monetization"]);
  assert.equal(nested.parentNode, null);
  assert.equal(topLevel.parentNode, null);
  assert.equal(wrapper.parentNode, document.body);
});

test("preserves non-div matching elements and no-match pages", () => {
  const document = createDocument();
  const label = document.body.appendChild(new FakeElement("span", "fc-monetization-dialog-container"));
  const card = document.body.appendChild(new FakeElement("div", "reader-card"));
  const { api } = createApi(document);

  const result = api.cleanup(document.documentElement, "test");

  assert.equal(result.removedCount, 0);
  assert.equal(label.parentNode, document.body);
  assert.equal(card.parentNode, document.body);
});

test("removes divs matching multiple configured keywords", () => {
  const document = createDocument();
  const paywall = document.body.appendChild(new FakeElement("div", "site-paywall-modal"));
  const subscription = document.body.appendChild(new FakeElement("div", "subscription curtain"));
  const monetization = document.body.appendChild(new FakeElement("div", "fc-monetization-dialog-container"));
  const article = document.body.appendChild(new FakeElement("div", "article-body"));
  const { api } = createApi(document, {
    EdgeMonetizationRemoverConfig: {
      classKeywords: ["paywall", "subscription", "monetization"]
    }
  });

  const result = api.cleanup(document.documentElement, "test");

  assert.equal(result.removedCount, 3);
  assertArrayEqual(result.keywordsUsed, ["paywall", "subscription", "monetization"]);
  assert.equal(paywall.parentNode, null);
  assert.equal(subscription.parentNode, null);
  assert.equal(monetization.parentNode, null);
  assert.equal(article.parentNode, document.body);
});

test("normalizes configured keywords by trimming empty entries and duplicates", () => {
  const { api } = createApi();

  assertArrayEqual(api.normalizeKeywords([" paywall ", "", "subscription", "paywall", "  "]), [
    "paywall",
    "subscription"
  ]);
});

test("falls back to monetization for missing empty or invalid config", () => {
  assertArrayEqual(createApi().api.resolveClassKeywords(), ["monetization"]);
  assertArrayEqual(
    createApi(createDocument(), { EdgeMonetizationRemoverConfig: { classKeywords: [] } }).api.resolveClassKeywords(),
    ["monetization"]
  );
  assertArrayEqual(
    createApi(createDocument(), { EdgeMonetizationRemoverConfig: { classKeywords: "paywall" } }).api.resolveClassKeywords(),
    ["monetization"]
  );
  assertArrayEqual(
    createApi(createDocument(), { EdgeMonetizationRemoverConfig: { classKeywords: [null, " "] } }).api.resolveClassKeywords(),
    ["monetization"]
  );
});

test("restores hidden body overflow to auto", () => {
  const document = createDocument();
  document.body.style.overflow = "hidden";
  const { api } = createApi(document);

  assert.equal(api.restoreBodyOverflow(document), true);
  assert.equal(document.body.style.overflow, "auto");
});

test("preserves non-hidden overflow and other body styles", () => {
  const document = createDocument();
  document.body.style.overflow = "scroll";
  document.body.style.color = "red";
  const { api } = createApi(document);

  assert.equal(api.restoreBodyOverflow(document), false);
  assert.equal(document.body.style.overflow, "scroll");
  assert.equal(document.body.style.color, "red");
});

test("removes delayed matching nodes through mutation handling", () => {
  const document = createDocument();
  const added = new FakeElement("div", "fc-monetization-dialog-container");
  added.ownerDocument = document;
  document.body.appendChild(added);
  const { api } = createApi(document);

  const result = api.handleMutations([{ addedNodes: [added] }]);

  assert.equal(result.removedCount, 1);
  assert.equal(added.parentNode, null);
});

test("removes delayed descendants and restores scroll lock", () => {
  const document = createDocument();
  document.body.style.overflow = "hidden";
  const wrapper = new FakeElement("section");
  wrapper.ownerDocument = document;
  const nested = wrapper.appendChild(new FakeElement("div", "late monetization-offer"));
  document.body.appendChild(wrapper);
  const { api } = createApi(document);

  const result = api.handleMutations([{ addedNodes: [wrapper] }]);

  assert.equal(result.removedCount, 1);
  assert.equal(result.scrollRestored, true);
  assert.equal(nested.parentNode, null);
  assert.equal(document.body.style.overflow, "auto");
});

test("sets up at most one mutation observer", () => {
  const document = createDocument();
  let observed = 0;

  class FakeMutationObserver {
    constructor(callback) {
      this.callback = callback;
    }

    observe() {
      observed += 1;
    }

    disconnect() {}
  }

  const { api } = createApi(document, { MutationObserver: FakeMutationObserver });

  const first = api.observe(document);
  const second = api.observe(document);

  assert.equal(first, second);
  assert.equal(observed, 1);
});

test("removes delayed matching nodes through configured keyword mutation handling", () => {
  const document = createDocument();
  const added = new FakeElement("div", "site-paywall-modal");
  added.ownerDocument = document;
  document.body.appendChild(added);
  const { api } = createApi(document, {
    EdgeMonetizationRemoverConfig: {
      classKeywords: ["paywall"]
    }
  });

  const result = api.handleMutations([{ addedNodes: [added] }]);

  assert.equal(result.removedCount, 1);
  assertArrayEqual(result.keywordsUsed, ["paywall"]);
  assert.equal(added.parentNode, null);
});

test("completes cleanup work inside the 1 second budget", () => {
  const document = createDocument();

  for (let index = 0; index < 250; index += 1) {
    document.body.appendChild(new FakeElement("div", `fc-monetization-dialog-container-${index}`));
  }

  const { api } = createApi(document);
  const startedAt = performance.now();
  const initialResult = api.cleanup(document.documentElement, "initial");
  const initialDuration = performance.now() - startedAt;

  const wrapper = new FakeElement("section");
  wrapper.ownerDocument = document;
  wrapper.appendChild(new FakeElement("div", "late monetization-offer"));
  document.body.appendChild(wrapper);

  const mutationStartedAt = performance.now();
  const mutationResult = api.handleMutations([{ addedNodes: [wrapper] }]);
  const mutationDuration = performance.now() - mutationStartedAt;

  assert.equal(initialResult.removedCount, 250);
  assert.equal(mutationResult.removedCount, 1);
  assert.ok(initialDuration < 1000, `initial cleanup took ${initialDuration}ms`);
  assert.ok(mutationDuration < 1000, `mutation cleanup took ${mutationDuration}ms`);
});
