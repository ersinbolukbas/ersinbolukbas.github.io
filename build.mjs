// Generates the static site: the home page, plus one page and one privacy policy per app and per game.
// Usage: node build.mjs
// The TankCompass privacy text lives in content/tankcompass-privacy.html (see sync-tankcompass-privacy.mjs).
// After a game is published on Google Play, set its `live` to true and run this again:
// the "Coming soon" badge becomes a "Get it on Google Play" link.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const DEVELOPER = "E&B Software";
const OWNER = "Ersin Bölükbaş";
const EMAIL = "ersin.bolukbas@hotmail.com";
const SITE = "https://ersinbolukbas.github.io";
const EFFECTIVE = "October 3, 2026";

const APPS = [
  {
    slug: "tankcompass",
    name: "TankCompass",
    title: "TankCompass",
    appId: "com.tankcompass.app",
    color: "#1B4A73",
    tagline: "The cheapest fuel near you.",
    about: [
      "TankCompass lists the fuel stations around you, sorted by distance or by price, so you can see at a glance where to fill up for less. Petrol, diesel, LPG and every other fuel a station actually sells.",
      "Prices come straight from official open data, refreshed through the day. Pick a station and your favorite navigation app takes you there.",
    ],
    countries: ["Spain", "Italy", "United Kingdom", "Denmark", "France"],
    features: [
      "Nearby stations sorted by distance or by price, with the cheapest one highlighted",
      "A map with a price tag on every station",
      "Station details: address, opening hours and the price of every fuel sold there",
      "Directions in Google Maps, Apple Maps, Waze or TomTom",
      "Favorites, and optional alerts when a favorite station lowers its price",
      "Search by brand or address",
      "Six languages: English, Turkish, Spanish, Italian, Danish and French",
      "No account and no sign-up. Free, supported by ads",
    ],
    shots: [
      ["list", "Station list sorted by price"],
      ["map", "Map with a price tag on every station"],
      ["station", "Station details with every fuel price"],
      ["alerts", "Price alerts for favorite stations"],
      ["search", "Searching stations by brand"],
      ["directions", "Choosing a navigation app"],
    ],
    sources: [
      ["Spain", "Geoportal Gasolineras, Ministry for the Ecological Transition (MITECO)", "https://geoportalgasolineras.es/geoportal-instalaciones/Inicio"],
      ["Spain", "MITECO fuel-price web service", "https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/help"],
      ["Italy", "Osservaprezzi Carburanti, Ministry of Enterprises and Made in Italy (MIMIT)", "https://www.mimit.gov.it/it/open-data/elenco-dataset/carburanti-prezzi-praticati-e-anagrafica-degli-impianti"],
      ["United Kingdom", "Fuel Finder, Department for Energy Security and Net Zero (DESNZ)", "https://www.gov.uk/government/collections/fuel-finder"],
      ["Denmark", "Fuel retailers' public price APIs, required by the Konkurrence- og Forbrugerstyrelsen (KFST)", "https://kfst.dk/vejledninger/kfst/dansk/2025/20251216-vejledning-om-api-til-offentliggoerelse-af-prisoplysninger-for-motorbraendstof"],
      ["France", "prix-carburants, French government open data", "https://data.economie.gouv.fr/explore/dataset/prix-des-carburants-en-france-flux-instantane-v2/"],
    ],
  },
];

const GAMES = [
  {
    slug: "dots-and-boxes",
    art: "kareler",
    name: "Dots and Boxes",
    title: "Dots and Boxes: Square Clash",
    appId: "com.ebsoftware.dotsandboxes",
    color: "#F76C5E",
    live: false,
    tagline: "Connect the dots, claim the boxes.",
    about: [
      "The pen-and-paper classic, rebuilt for your phone. Draw a line between two dots; close a box and it is yours. Whoever owns the most boxes wins.",
      "Play against the computer through levels that grow from tiny boards to big ones and from easy to expert, or pass the phone and challenge a friend. Choose the classic turn mode, or dice mode, where a bouncing 3D die decides how many lines you draw.",
    ],
    features: ["Turn mode and dice mode", "Play the computer or a friend on one phone", "Step-by-step tutorial levels", "Endless levels with star gates"],
  },
  {
    slug: "arrow-escape",
    art: "ok",
    name: "Arrow Escape",
    title: "Arrow Escape: Tap Unblock",
    appId: "com.ebsoftware.arrowescape",
    color: "#14B8A6",
    live: false,
    tagline: "Tap the arrows out in the right order.",
    about: [
      "Every arrow slides the way it points. Tap one with a clear path and it glides off the board; tap one that is blocked and it crashes, costing you a life.",
      "Boards come in hearts, diamonds, rings and more, packed edge to edge with colorful 3D arrows. The further you go, the more arrows there are, and every third level is extra hard.",
    ],
    features: ["Colorful 3D arrows", "Three lives per level", "Boards in many shapes", "An extra-hard level every third stage"],
  },
  {
    slug: "water-sort",
    art: "su",
    name: "Water Sort",
    title: "Water Sort: Color Tube Puzzle",
    appId: "com.ebsoftware.watersort",
    color: "#EC4899",
    live: false,
    tagline: "Sort the colors into tubes.",
    about: [
      "Pour colored water from tube to tube until every tube holds a single color. You can only pour onto the same color, and only if there is room.",
      "It starts with two colors and grows to twelve. Stuck? Undo a move, ask for a hint, or add an extra tube.",
    ],
    features: ["Smooth pouring animations", "Undo, hints and an extra tube", "From 2 colors up to 12", "Timed levels for an extra challenge"],
  },
  {
    slug: "nut-sort",
    art: "somun",
    name: "Nut Sort",
    title: "Nut Sort: Bolt Color Puzzle",
    appId: "com.ebsoftware.nutsort",
    color: "#22A559",
    live: false,
    tagline: "Stack the nuts by color.",
    about: [
      "Move colorful nuts from bolt to bolt until every bolt carries one color. A nut can only land on a nut of the same color, or on an empty bolt.",
      "Glossy 3D nuts spin down the threads as you sort. Levels add more colors and taller bolts as you go.",
    ],
    features: ["Real 3D nuts and bolts", "Undo, hints and an extra bolt", "More colors and taller bolts as you progress", "Timed levels for an extra challenge"],
  },
];

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const playUrl = (g) => `https://play.google.com/store/apps/details?id=${g.appId}`;

function page({ path, title, description, accent = "#2B2A33", body }) {
  const up = path ? "../".repeat(path.split("/").length) : "";
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${SITE}/${path ? path + "/" : ""}">
  <link rel="icon" href="${up}assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="${up}styles.css">
</head>
<body style="--accent: ${accent}">
  <header class="site-header">
    <a class="brand" href="${up || "./"}"><span class="brand-mark">E&amp;B</span><span>${esc(DEVELOPER)}</span></a>
    <nav><a href="${up || "./"}#apps">Apps</a><a href="${up || "./"}#games">Games</a><a href="${up || "./"}#contact">Contact</a></nav>
  </header>
${body(up)}
  <footer class="site-footer" id="contact">
    <p><strong>${esc(DEVELOPER)}</strong> is the app and game studio of ${esc(OWNER)}.</p>
    <p>Questions or feedback? <a href="mailto:${EMAIL}">${EMAIL}</a></p>
    <p class="muted">© 2026 ${esc(DEVELOPER)} · ${esc(OWNER)}</p>
  </footer>
</body>
</html>
`;
  const file = join(ROOT, path, "index.html");
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}

const storeButton = (g) =>
  g.live
    ? `<a class="store-btn" href="${playUrl(g)}">Get it on Google Play</a>`
    : `<span class="store-btn soon">Coming soon to Google Play</span>`;

const shots = (g, up) =>
  `<div class="shots">${["game", "map"]
    .map((s) => `<img class="shot" src="${up}assets/screenshots/${g.art}-${s}.png" width="1080" height="1920" loading="lazy" alt="${esc(g.name)} screenshot">`)
    .join("")}</div>`;

const appStoreButtons = (a) =>
  `<a class="store-btn" href="https://play.google.com/store/apps/details?id=${a.appId}">Get it on Google Play</a><span class="store-btn soon">Coming soon to the App Store</span>`;

const countryChips = (a) => `<ul class="chips" aria-label="Countries covered">${a.countries.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>`;

const appShots = (a, up, count = a.shots.length) =>
  `<div class="shots app-shots">${a.shots
    .slice(0, count)
    .map(([file, alt]) => `<img class="shot" src="${up}assets/screenshots/${a.slug}-${file}.jpg" width="736" height="1600" loading="lazy" alt="${esc(a.name)}: ${esc(alt)}">`)
    .join("")}</div>`;

// ---------- Home ----------
page({
  path: "",
  title: `${DEVELOPER} · Apps and relaxing games by ${OWNER}`,
  description: `${DEVELOPER} makes ${APPS.map((a) => a.name).join(", ")}, the app that finds the cheapest fuel near you, and relaxing mobile puzzle games: ${GAMES.map((g) => g.name).join(", ")}.`,
  body: (up) => `  <main>
    <section class="hero">
      <h1>Apps and games, <span>made with care.</span></h1>
      <p>${esc(DEVELOPER)} is the small studio of ${esc(OWNER)}. We make an app that finds the cheapest fuel near you, and calm, colorful puzzle games you can play anywhere.</p>
    </section>
    <div class="section-head" id="apps">
      <h2>Apps</h2>
      <p>Useful on the road.</p>
    </div>
    <section class="apps">
${APPS.map(
  (a) => `      <article class="app-card" style="--accent: ${a.color}">
        <div class="app-info">
          <a class="game-head" href="${a.slug}/">
            <img class="logo" src="assets/logos/${a.slug}.png" width="96" height="96" alt="${esc(a.name)} logo">
            <div><h2>${esc(a.title)}</h2><p>${esc(a.tagline)}</p></div>
          </a>
          <p>${esc(a.about[0])}</p>
          ${countryChips(a)}
          <div class="card-actions">${appStoreButtons(a)}</div>
          <div class="card-actions"><a class="text-link" href="${a.slug}/">More about the app</a><a class="text-link" href="${a.slug}/privacy/">Privacy policy</a></div>
        </div>
        ${appShots(a, up, 3)}
      </article>`,
).join("\n")}
    </section>
    <div class="section-head" id="games">
      <h2>Relaxing games</h2>
      <p>Calm, colorful puzzles that also work offline.</p>
    </div>
    <section class="games">
${GAMES.map(
  (g) => `      <article class="game-card" style="--accent: ${g.color}">
        <a class="game-head" href="${g.slug}/">
          <img class="logo" src="assets/logos/${g.art}.svg" width="96" height="96" alt="${esc(g.name)} logo">
          <div><h2>${esc(g.title)}</h2><p>${esc(g.tagline)}</p></div>
        </a>
        <p>${esc(g.about[0])}</p>
        ${shots(g, up)}
        <div class="card-actions">${storeButton(g)}<a class="text-link" href="${g.slug}/">More about the game</a><a class="text-link" href="${g.slug}/privacy/">Privacy policy</a></div>
      </article>`,
).join("\n")}
    </section>
  </main>`,
});

// ---------- Game pages ----------
for (const g of GAMES) {
  page({
    path: g.slug,
    title: `${g.title} · ${DEVELOPER}`,
    description: `${g.title}: ${g.tagline} A free, relaxing puzzle game by ${DEVELOPER}.`,
    accent: g.color,
    body: (up) => `  <main class="game-page">
    <section class="game-hero">
      <img class="logo big" src="${up}assets/logos/${g.art}.svg" width="140" height="140" alt="${esc(g.name)} logo">
      <div>
        <h1>${esc(g.title)}</h1>
        <p class="tagline">${esc(g.tagline)}</p>
        ${storeButton(g)}
      </div>
    </section>
    <section class="prose">
${g.about.map((p) => `      <p>${esc(p)}</p>`).join("\n")}
      <ul class="features">
${[...g.features, "Calm background music, with separate switches for sound, music and vibration", "Works offline; your progress is saved on your device", "Free to play, supported by ads"].map((f) => `        <li>${esc(f)}</li>`).join("\n")}
      </ul>
    </section>
    ${shots(g, up)}
    <p class="center"><a class="text-link" href="privacy/">Privacy policy for ${esc(g.title)}</a></p>
  </main>`,
  });

  // ---------- Privacy policy ----------
  page({
    path: `${g.slug}/privacy`,
    title: `Privacy Policy · ${g.title}`,
    description: `Privacy policy for the mobile game ${g.title} by ${DEVELOPER}.`,
    accent: g.color,
    body: (up) => `  <main class="prose policy">
    <p class="crumb"><a href="${up}${g.slug}/">← ${esc(g.title)}</a></p>
    <h1>Privacy Policy</h1>
    <p class="muted">${esc(g.title)} · Effective date: ${EFFECTIVE}</p>

    <p>This privacy policy applies to the mobile game <strong>${esc(g.title)}</strong> (the "Game", package name <code>${g.appId}</code>), developed and published by <strong>${esc(DEVELOPER)}</strong> (${esc(OWNER)}), referred to below as "we".</p>

    <h2>Summary</h2>
    <ul>
      <li>The Game has no accounts, no sign-in and no online profile.</li>
      <li>We do not collect, store or receive any personal data on our own servers. We do not operate any servers for the Game.</li>
      <li>Your game progress and settings are stored only on your device.</li>
      <li>The Game shows ads through Google AdMob. Google collects certain data to deliver and measure those ads, as described below.</li>
    </ul>

    <h2>Data stored on your device</h2>
    <p>The Game saves your progress (levels, stars, the level you were playing) and your settings (sound, music, vibration, hints) in local storage on your device. This data never leaves your device and we cannot access it. It is deleted when you clear the Game's data or uninstall the Game.</p>

    <h2>Advertising (Google AdMob)</h2>
    <p>The Game is free and supported by ads provided by Google AdMob, a service of Google LLC / Google Ireland Limited. To show ads, measure them and prevent fraud, the Google Mobile Ads SDK included in the Game may automatically collect and process:</p>
    <ul>
      <li>device identifiers, such as the advertising ID of your device;</li>
      <li>your IP address, which may be used to estimate your general location;</li>
      <li>device and app information, such as device model, operating system version, language and app version;</li>
      <li>ad interaction and diagnostic data, such as which ads were shown or tapped, and crash or performance information of the ads SDK.</li>
    </ul>
    <p>This data is collected and processed by Google, not by us. Google may use it to show personalized or non-personalized ads, depending on your choices and your region. You can learn more here:</p>
    <ul>
      <li><a href="https://policies.google.com/technologies/partner-sites">How Google uses information from apps that use its services</a></li>
      <li><a href="https://policies.google.com/privacy">Google Privacy Policy</a></li>
      <li><a href="https://support.google.com/admob/answer/6128543">Google AdMob and AdSense program policies</a></li>
    </ul>
    <p>Rewarded ads are shown only when you ask for them (for example, to get an extra hint). Other ads may appear between levels.</p>

    <h2>Your choices</h2>
    <ul>
      <li><strong>Consent (EEA, UK and Switzerland):</strong> when you first open the Game in these regions, a consent message from Google lets you choose whether to allow personalized ads. You can change your choice at any time under Settings → Ad privacy settings in the Game.</li>
      <li><strong>Advertising ID:</strong> on Android you can reset or delete your advertising ID under Settings → Privacy → Ads. On iOS you can turn off tracking under Settings → Privacy &amp; Security → Tracking.</li>
      <li><strong>Personalized ads:</strong> you can manage ad personalization for your Google account at <a href="https://adssettings.google.com">adssettings.google.com</a>.</li>
      <li><strong>Local data:</strong> you can delete your progress and settings by clearing the Game's data or uninstalling the Game.</li>
    </ul>

    <h2>Children</h2>
    <p>The Game is intended for a general audience and is not directed at children under 13. We do not knowingly collect personal information from children. If you believe a child has provided personal information through the Game, please contact us.</p>

    <h2>Data sharing and retention</h2>
    <p>We do not sell personal data, and we do not share personal data with anyone, because we do not collect any. Data processed by Google for advertising is retained according to Google's own policies, linked above.</p>

    <h2>Security</h2>
    <p>The Game does not transmit your progress or settings over the internet. Network connections are made only by the Google Mobile Ads SDK, over encrypted connections.</p>

    <h2>Changes to this policy</h2>
    <p>We may update this policy, for example when the Game gains new features. The current version is always available on this page, with its effective date at the top.</p>

    <h2>Contact</h2>
    <p>If you have any questions about this policy, contact ${esc(DEVELOPER)} (${esc(OWNER)}) at <a href="mailto:${EMAIL}">${EMAIL}</a>.</p>
  </main>`,
  });
}

// ---------- App pages ----------
for (const a of APPS) {
  page({
    path: a.slug,
    title: `${a.title} · ${a.tagline} · ${DEVELOPER}`,
    description: `${a.title}: ${a.tagline} Compare fuel prices at nearby stations in ${a.countries.join(", ")}. A free app by ${DEVELOPER}.`,
    accent: a.color,
    body: (up) => `  <main class="game-page">
    <section class="game-hero">
      <img class="logo big" src="${up}assets/logos/${a.slug}.png" width="140" height="140" alt="${esc(a.name)} logo">
      <div>
        <h1>${esc(a.title)}</h1>
        <p class="tagline">${esc(a.tagline)}</p>
        <div class="card-actions">${appStoreButtons(a)}</div>
      </div>
    </section>
    <section class="prose">
${a.about.map((p) => `      <p>${esc(p)}</p>`).join("\n")}
      ${countryChips(a)}
      <ul class="features">
${a.features.map((f) => `        <li>${esc(f)}</li>`).join("\n")}
      </ul>
    </section>
    ${appShots(a, up)}
    <section class="prose">
      <h2>Where the prices come from</h2>
      <p>Every price in ${esc(a.name)} comes from an official open-data source, published under each country's price-reporting rules:</p>
      <ul>
${a.sources.map(([country, label, url]) => `        <li><strong>${esc(country)}:</strong> <a href="${url}">${esc(label)}</a></li>`).join("\n")}
      </ul>
      <p class="notice">${esc(a.name)} is an independent app. It is not affiliated with, endorsed by, or operated by any government entity, ministry or public authority.</p>
    </section>
    <p class="center"><a class="text-link" href="privacy/">Privacy policy for ${esc(a.title)}</a></p>
  </main>`,
  });
}

// ---------- TankCompass privacy policy (six languages, synced from the app repository) ----------
{
  const a = APPS.find((x) => x.slug === "tankcompass");
  const source = readFileSync(join(ROOT, "content", "tankcompass-privacy.html"), "utf8").replace(/\r\n/g, "\n");
  const updated = source.match(/last-updated: (.+?) -->/)[1];
  const articles = source
    .slice(source.indexOf("<article"))
    .trim()
    .replace(/<article data-lang="(?!en")/g, '<article hidden data-lang="')
    .replace(/^(?=.)/gm, "    ");
  const languages = [["en", "English"], ["tr", "Türkçe"], ["es", "Español"], ["it", "Italiano"], ["da", "Dansk"], ["fr", "Français"]];
  page({
    path: `${a.slug}/privacy`,
    title: `Privacy Policy · ${a.title}`,
    description: `Privacy policy for the mobile app ${a.title} by ${DEVELOPER}, in English, Turkish, Spanish, Italian, Danish and French.`,
    accent: a.color,
    body: (up) => `  <main class="prose policy">
    <p class="crumb"><a href="${up}${a.slug}/">← ${esc(a.title)}</a></p>
    <h1>Privacy Policy</h1>
    <p class="muted">${esc(a.title)} · Last updated: ${esc(updated)}</p>
    <div class="langbar" role="group" aria-label="Language">
${languages.map(([code, label]) => `      <button type="button" data-lang="${code}" lang="${code}" aria-pressed="${code === "en"}">${label}</button>`).join("\n")}
    </div>
    <noscript><style>.langbar { display: none; } .policy article[hidden] { display: block; margin-top: 56px; }</style></noscript>

${articles}
  </main>
  <script>
    (function () {
      var buttons = document.querySelectorAll(".langbar button");
      var articles = document.querySelectorAll(".policy article[data-lang]");
      var known = Array.prototype.map.call(buttons, function (b) { return b.dataset.lang; });
      function show(lang) {
        buttons.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.lang === lang)); });
        articles.forEach(function (el) { el.hidden = el.dataset.lang !== lang; });
        document.documentElement.lang = lang;
      }
      var wanted = new URLSearchParams(location.search).get("lang") || (navigator.language || "en").slice(0, 2).toLowerCase();
      if (known.indexOf(wanted) !== -1) show(wanted);
      buttons.forEach(function (b) {
        b.addEventListener("click", function () {
          show(b.dataset.lang);
          history.replaceState(null, "", "?lang=" + b.dataset.lang);
        });
      });
    })();
  </script>`,
  });
}

console.log(`Built: home, ${APPS.length} app page, ${GAMES.length} game pages, ${APPS.length + GAMES.length} privacy policies.`);
