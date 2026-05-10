const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const rootDir = path.resolve(__dirname, "../..");
const manifest = JSON.parse(fs.readFileSync(path.join(rootDir, "extension/manifest.json"), "utf8"));
const configScript = fs.readFileSync(path.join(rootDir, "extension/config.js"), "utf8");
const contentScript = fs.readFileSync(path.join(rootDir, "extension/content.js"), "utf8");

test("manifest declares least-privilege static MV3 content scripts with config first", () => {
  assert.equal(manifest.manifest_version, 3);
  assert.deepEqual(Object.keys(manifest).sort(), [
    "content_scripts",
    "description",
    "manifest_version",
    "name",
    "version"
  ]);
  assert.equal(manifest.content_scripts.length, 1);
  assert.deepEqual(manifest.content_scripts[0].matches, ["http://*/*", "https://*/*"]);
  assert.deepEqual(manifest.content_scripts[0].js, ["config.js", "content.js"]);
  assert.equal(manifest.content_scripts[0].run_at, "document_idle");
});

test("extension scripts have no remote-code or network behavior", () => {
  for (const script of [configScript, contentScript]) {
    assert.doesNotMatch(script, /\bfetch\s*\(/);
    assert.doesNotMatch(script, /\bXMLHttpRequest\b/);
    assert.doesNotMatch(script, /\beval\s*\(/);
    assert.doesNotMatch(script, /new\s+Function\s*\(/);
  }
});

test("packaged config defines default monetization keyword", () => {
  assert.match(configScript, /EdgeMonetizationRemoverConfig/);
  assert.match(configScript, /classKeywords:\s*\["monetization",\s*"paywall",\s*"subscription",\s*"ads\*",\s*"ads-\*"\]/);
});

test("fixtures cover initial overlay, no-match, scroll lock, delayed insertion, and prefix-token journeys", () => {
  const fixtures = {
    configured: fs.readFileSync(path.join(rootDir, "tests/fixtures/configured-keywords-page.html"), "utf8"),
    monetization: fs.readFileSync(path.join(rootDir, "tests/fixtures/monetization-page.html"), "utf8"),
    noMatch: fs.readFileSync(path.join(rootDir, "tests/fixtures/no-match-page.html"), "utf8"),
    scrollLocked: fs.readFileSync(path.join(rootDir, "tests/fixtures/scroll-locked-page.html"), "utf8"),
    delayed: fs.readFileSync(path.join(rootDir, "tests/fixtures/delayed-monetization-page.html"), "utf8"),
    prefixTokens: fs.readFileSync(path.join(rootDir, "tests/fixtures/prefix-class-tokens-page.html"), "utf8")
  };

  assert.match(fixtures.monetization, /fc-monetization-dialog-container/);
  assert.match(fixtures.monetization, /monetization-wall/);
  assert.match(fixtures.configured, /site-paywall-modal/);
  assert.match(fixtures.configured, /subscription curtain/);
  assert.match(fixtures.noMatch, /<span class="fc-monetization-dialog-container"/);
  assert.match(fixtures.scrollLocked, /overflow:\s*hidden/);
  assert.match(fixtures.delayed, /setTimeout/);
  assert.match(fixtures.delayed, /site-paywall-modal/);
  assert.match(fixtures.delayed, /document\.body\.style\.overflow = "hidden"/);
  assert.match(fixtures.prefixTokens, /ads-banner/);
  assert.match(fixtures.prefixTokens, /layout ads_modal/);
  assert.match(fixtures.prefixTokens, /paidads/);
  assert.match(fixtures.prefixTokens, /site-hardpaywall-modal/);
  assert.match(fixtures.prefixTokens, /<span class="ads-banner"/);
  assert.match(fixtures.prefixTokens, /setTimeout/);
});

test("content script uses targeted mutation observation instead of polling", () => {
  assert.match(contentScript, /new globalScope\.MutationObserver\(handleMutations\)/);
  assert.match(contentScript, /addedNodes/);
  assert.doesNotMatch(contentScript, /\bsetInterval\s*\(/);
});

test("content script resolves configured keywords without browser permissions", () => {
  assert.match(contentScript, /EdgeMonetizationRemoverConfig/);
  assert.match(contentScript, /normalizeKeywords/);
  assert.doesNotMatch(contentScript, /\bchrome\.storage\b/);
  assert.doesNotMatch(contentScript, /\bchrome\.runtime\.getURL\b/);
});

test("manifest and scripts preserve cleanup boundaries for prefix-token support", () => {
  assert.equal(manifest.background, undefined);
  assert.equal(manifest.permissions, undefined);
  assert.deepEqual(manifest.content_scripts[0].js, ["config.js", "content.js"]);
  assert.match(contentScript, /querySelectorAll\("div\[class\]"\)/);
  assert.match(contentScript, /restoreBodyOverflow/);
  assert.doesNotMatch(contentScript, /\bsetTimeout\s*\(/);
});
