# E&B Software

The website of E&B Software (Ersin Bölükbaş): https://ersinbolukbas.github.io

It introduces the apps and games and hosts their privacy policies.

Apps:

- TankCompass (fuel prices): `/tankcompass/`, privacy policy in six languages at `/tankcompass/privacy/`

Games:

- Dots and Boxes: Square Clash
- Arrow Escape: Tap Unblock
- Water Sort: Color Tube Puzzle
- Nut Sort: Bolt Color Puzzle

The pages are generated: edit `build.mjs` (texts, app and game lists) and run `node build.mjs`.
When a game goes live on Google Play, set its `live` flag to `true` in `build.mjs` and rebuild.

## Updating the TankCompass privacy policy

The text is maintained in the TankCompass app repository (`docs/privacy-policy.html`). To publish a new version here:

```
node sync-tankcompass-privacy.mjs "<app repo>/docs/privacy-policy.html"
node build.mjs
```

Add `?lang=tr` (or `es`, `it`, `da`, `fr`) to the privacy page address to open it in that language.
