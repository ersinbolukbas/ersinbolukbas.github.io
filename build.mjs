// Generates the static site: the home page, plus one page and one privacy policy per app and per game.
// Usage: node build.mjs
// The TankCompass privacy text lives in content/tankcompass-privacy.html (see sync-tankcompass-privacy.mjs).
// After a game is published on Google Play, set its `live` to true and run this again:
// the "Coming soon" badge becomes a "Download on Google Play" link.
// A game on the App Store also gets an `appStoreUrl`, which adds a "Download on the App Store" link.
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
    appStoreUrl: "https://apps.apple.com/nl/app/tankcompass-fuel-prices/id6814000754",
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
    appStoreUrl: "https://apps.apple.com/app/dots-and-boxes-square-clash/id6820639833",
    color: "#F76C5E",
    live: false,
    tagline: "Connect the dots, claim the boxes.",
    about: [
      "The pen-and-paper classic, rebuilt for your phone. Draw a line between two dots; close a box and it is yours. Whoever owns the most boxes wins.",
      "Play against the computer through levels that grow from tiny boards to big ones and from easy to expert, or pass the phone and challenge a friend. Choose the classic turn mode, or dice mode, where a bouncing 3D die decides how many lines you draw.",
      "Or play a friend on two phones: on the same Wi-Fi, one phone creates a room and the other joins it. No internet connection and no account needed. Each player rolls the die on their own phone (Android).",
    ],
    features: ["Turn mode and dice mode", "Play a friend on two phones over Wi-Fi (Android)", "Play the computer or a friend on one phone", "Endless levels with star gates"],
    // A consent message for US state privacy laws, besides the EEA, UK and Switzerland.
    usStates: true,
    // "Friend on Wi-Fi": two phones connect directly over the local network (privacy policy section).
    localPlay: true,
    effective: "October 25, 2026",
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
    // A consent message for US state privacy laws, besides the EEA, UK and Switzerland.
    usStates: true,
    effective: "October 21, 2026",
  },
  {
    slug: "block-harbor",
    art: "blok",
    name: "Block Harbor",
    title: "Block Harbor: Puzzle Town",
    appId: "com.ebsoftware.blockharbor",
    color: "#137F6B",
    live: false,
    tagline: "Place blocks, build your seaside town.",
    about: [
      "A calm block puzzle with a town of your own at the end of it. Drag pieces onto the 8x8 board and fill rows and columns to clear them. Fill a line with a single color and it pays double.",
      "Every clear earns bricks. Spend them on the pier, the fisherman's hut, the tea garden: island by island, a seaside town grows on your map, with a lighthouse at the very end. Play Classic to chase your best score, or Adventure for 100 levels with goals: break stones, melt ice, collect gems.",
    ],
    features: ["Classic mode and 100 Adventure levels", "Five islands and 40 buildings, each in three looks", "No lives and no waiting", "Color-blind mode: every color has its own symbol", "English and Turkish"],
    // The game ships without Firebase, like the other games. If analytics and crash reports are added
    // later, set this to true: the policy then gains a Firebase section. Update the store's data-safety form too.
    analytics: false,
    saved: "your progress (best score, completed levels and their stars, the buildings of your town, your gold and bricks) and your settings (sound, music, vibration, color-blind mode, language)",
    // A consent message for US state privacy laws, besides the EEA, UK and Switzerland.
    usStates: true,
    effective: "October 21, 2026",
  },
  {
    slug: "arrowkeep",
    art: "arrowkeep",
    name: "Arrowkeep",
    title: "Arrowkeep: Archery & Puzzles",
    appId: "com.ebsoftware.arrowkeep",
    color: "#8A5A2E",
    live: false,
    tagline: "Free the arrows, hit the mark, build your keep.",
    about: [
      "Every arrow slides the way its head points. Tap them out in the right order to clear the board; send one into another and it crashes, costing a heart. Locked arrows wait for their keys, and portals send arrows across the board.",
      "Every fifth level brings an archery round on the meadow before your castle: set the height, set the power and loose at a straw target. What you earn builds a medieval keep, stone by stone, and then the journey goes on: a forest camp, a river town, a mountain pass, a harbor, a northern fort and a royal city.",
    ],
    features: [
      "Arrow puzzles with locks and portals",
      "Archery rounds, and an Archery Range for practice at straw targets",
      "Eight settlements to build, from a stone castle to a royal city",
      "An adventure map and a level path with gates",
      "Classic mode with endless boards",
      "English and Turkish",
    ],
    shots: [["game", "An arrow puzzle before the castle"], ["map", "A finished castle"]],
    // A consent message for US state privacy laws, besides the EEA, UK and Switzerland.
    usStates: true,
    // The game's settings button for Google's privacy options.
    privacyLabel: "Privacy options",
    effective: "October 21, 2026",
    saved: "your progress (levels and their stars, the settlements you have built, your gold, building materials and archery points, your archery upgrades and best score) and your settings (sound, music, vibration, language)",
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
    // A consent message for US state privacy laws, besides the EEA, UK and Switzerland.
    usStates: true,
    effective: "October 21, 2026",
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
    // A consent message for US state privacy laws, besides the EEA, UK and Switzerland.
    usStates: true,
    effective: "October 21, 2026",
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
  (g.live
    ? `<a class="store-btn" href="${playUrl(g)}">Download on Google Play</a>`
    : `<span class="store-btn soon">Coming soon to Google Play</span>`) +
  (g.appStoreUrl ? `<a class="store-btn" href="${g.appStoreUrl}">Download on the App Store</a>` : "");

const shots = (g, up) => {
  const [w, h] = g.shotSize || [1080, 1920];
  const list = g.shots || [["game", "screenshot"], ["map", "screenshot"]];
  return `<div class="shots">${list
    .map(([s, alt]) => `<img class="shot" src="${up}assets/screenshots/${g.art}-${s}.png" width="${w}" height="${h}" loading="lazy" alt="${esc(g.name)} ${esc(alt)}">`)
    .join("")}</div>`;
};

const appStoreButtons = (a) =>
  `<a class="store-btn" href="https://play.google.com/store/apps/details?id=${a.appId}">Download on Google Play</a>${
    a.appStoreUrl
      ? `<a class="store-btn" href="${a.appStoreUrl}">Download on the App Store</a>`
      : `<span class="store-btn soon">Coming soon to the App Store</span>`
  }`;

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
        <div class="card-actions">${storeButton(g)}</div>
        <div class="card-actions"><a class="text-link" href="${g.slug}/">More about the game</a><a class="text-link" href="${g.slug}/privacy/">Privacy policy</a></div>
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
        <div class="card-actions">${storeButton(g)}</div>
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
    <p class="muted">${esc(g.title)} · Effective date: ${g.effective || EFFECTIVE}</p>

    <p>This privacy policy applies to the mobile game <strong>${esc(g.title)}</strong> (the "Game", package name <code>${g.appId}</code>), developed and published by <strong>${esc(DEVELOPER)}</strong> (${esc(OWNER)}), referred to below as "we".</p>

    <h2>Summary</h2>
    <ul>
      <li>The Game has no accounts, no sign-in and no online profile.</li>
      <li>We do not collect, store or receive any personal data on our own servers. We do not operate any servers for the Game.</li>
      <li>Your game progress and settings are stored only on your device.</li>
      <li>The Game shows ads through Google AdMob. Google collects certain data to deliver and measure those ads, as described below.</li>${
        g.localPlay ? `
      <li>When you play a friend on Wi-Fi, the two phones connect directly over your local network. Your moves go only to your friend's phone, never to us or anyone else.</li>` : ""}${
        g.analytics ? `
      <li>The Game uses Google Firebase to count anonymous gameplay events and to report crashes, as described below.</li>` : ""}
    </ul>

    <h2>Data stored on your device</h2>
    <p>The Game saves ${g.saved || "your progress (levels, stars, the level you were playing) and your settings (sound, music, vibration, hints)"} in local storage on your device. This data never leaves your device and we cannot access it. It is deleted when you clear the Game's data or uninstall the Game.</p>

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

${g.analytics ? `    <h2>Analytics and crash reports (Google Firebase)</h2>
    <p>To understand how the Game is played and to fix errors, the Game uses Firebase Analytics, Firebase Crashlytics and Firebase Remote Config, services of Google LLC / Google Ireland Limited. They may automatically collect and process:</p>
    <ul>
      <li>gameplay events that do not identify you, such as a level being started, completed or failed, a booster being used, a building being built, or an ad being shown;</li>
      <li>an app-instance identifier created by Firebase for this installation of the Game;</li>
      <li>device and app information, such as device model, operating system version, language, country or region derived from your IP address, and app version;</li>
      <li>crash reports: what the Game was doing when an error occurred, and the state of the device at that moment.</li>
    </ul>
    <p>We see this information only as statistics and crash reports in the Firebase console. We do not combine it with your name, e-mail address or any other detail that identifies you, because the Game never asks for any. Firebase Remote Config lets us adjust game settings (for example how often ads appear) without an update; it sends the same kind of device and app information to fetch those settings. You can learn more here:</p>
    <ul>
      <li><a href="https://firebase.google.com/support/privacy">Privacy and security in Firebase</a></li>
      <li><a href="https://support.google.com/firebase/answer/6318039">Data collected by Google Analytics for Firebase</a></li>
    </ul>

` : ""}${g.localPlay ? `    <h2>Playing a friend on Wi-Fi</h2>
    <p>With "Friend on Wi-Fi" (currently on Android), two phones on the same Wi-Fi network play one game together. This works only inside your local network; nothing goes through the internet or through any server of ours.</p>
    <ul>
      <li><strong>Finding each other:</strong> while you have a room open, your phone announces it on the local network so your friend's phone can find it. The room name shows your phone's model name, the game mode and the board size (for example "Pixel 7 · Dice · 8 × 6"), and can be seen by other devices on the same network until the game starts. Your friend can also join with a code, which is your phone's address on the local network.</li>
      <li><strong>During the game:</strong> the two phones send each other only what the game needs: the lines drawn, the dice rolls, and short messages to check that the connection is still there. Nothing about the game is saved on our side or sent anywhere else.</li>
      <li><strong>Permissions:</strong> on Android the Game uses the Wi-Fi state and multicast permissions to find rooms on the local network. They do not give access to your location, contacts or files.</li>
    </ul>

` : ""}    <h2>Your choices</h2>
    <ul>
      <li><strong>Consent (EEA, UK and Switzerland):</strong> when you first open the Game in these regions, a consent message from Google lets you choose whether to allow personalized ads. You can change your choice at any time under Settings → ${g.privacyLabel || "Ad privacy settings"} in the Game.</li>${
        g.usStates ? `
      <li><strong>United States:</strong> in US states with consumer privacy laws (such as California), a message from Google lets you opt out of the sale or sharing of your personal information for personalized ads. You can change this at any time under Settings → ${g.privacyLabel || "Ad privacy settings"} in the Game.</li>` : ""}
      <li><strong>Advertising ID:</strong> on Android you can reset or delete your advertising ID under Settings → Privacy → Ads. On iOS you can turn off tracking under Settings → Privacy &amp; Security → Tracking.</li>
      <li><strong>Personalized ads:</strong> you can manage ad personalization for your Google account at <a href="https://adssettings.google.com">adssettings.google.com</a>.</li>
      <li><strong>Local data:</strong> you can delete your progress and settings by clearing the Game's data or uninstalling the Game.</li>
    </ul>

    <h2>Children</h2>
    <p>The Game is intended for a general audience and is not directed at children under 13. We do not knowingly collect personal information from children. If you believe a child has provided personal information through the Game, please contact us.</p>

    <h2>Data sharing and retention</h2>
    <p>We do not sell personal data, and we do not share personal data with anyone, because we do not collect any. Data processed by Google for advertising${g.analytics ? ", analytics and crash reporting" : ""} is retained according to Google's own policies, linked above.</p>

    <h2>Security</h2>
    <p>The Game does not transmit your progress or settings over the internet. Network connections are made only by the Google Mobile Ads SDK${g.analytics ? " and the Firebase SDKs" : ""}, over encrypted connections.${g.localPlay ? " When you play a friend on Wi-Fi, the two phones also connect directly to each other inside your local network; this connection carries only game moves and is not encrypted, so play on a Wi-Fi network you trust." : ""}</p>

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
