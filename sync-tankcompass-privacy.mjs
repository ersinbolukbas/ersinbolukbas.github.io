// Copies the TankCompass privacy policy (six languages) out of the app repository
// into content/tankcompass-privacy.html, which build.mjs turns into /tankcompass/privacy/.
// Usage: node sync-tankcompass-privacy.mjs "<app repo>/docs/privacy-policy.html" && node build.mjs
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const LANGS = ["en", "tr", "es", "it", "da", "fr"];
const source = process.argv[2];
if (!source) {
  console.error('Usage: node sync-tankcompass-privacy.mjs "<app repo>/docs/privacy-policy.html"');
  process.exit(1);
}

const html = readFileSync(source, "utf8").replace(/\r\n/g, "\n");
const articles = [...html.matchAll(/<article data-lang="(\w+)"[^>]*>([\s\S]*?)<\/article>/g)];
const found = articles.map((a) => a[1]);
if (found.join() !== LANGS.join()) {
  console.error(`Expected the languages ${LANGS.join(", ")} but found ${found.join(", ") || "none"}.`);
  process.exit(1);
}
const updated = html.match(/Last updated: ([^·<]+)/)?.[1].trim();
if (!updated) {
  console.error('No "Last updated: …" line found in the source file.');
  process.exit(1);
}

const blocks = articles.map(([, lang, body]) => {
  const text = body
    .replace(/^\n+|\s+$/g, "")
    .split("\n")
    .map((line) => (line.startsWith("    ") ? line.slice(4) : line))
    .join("\n")
    .replaceAll('class="draft"', 'class="notice warn"')
    .replaceAll('class="disclaimer"', 'class="notice"');
  return `<article data-lang="${lang}" lang="${lang}">\n${text}\n</article>`;
});

const header = `<!-- TankCompass privacy policy, six languages. Source of truth: docs/privacy-policy.html in the TankCompass app repo.
     Refresh with: node sync-tankcompass-privacy.mjs <path to that file>, then node build.mjs.
     last-updated: ${updated} -->`;
const out = join(ROOT, "content", "tankcompass-privacy.html");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, [header, ...blocks].join("\n\n") + "\n");
console.log(`Synced ${blocks.length} languages, last updated ${updated}.`);
