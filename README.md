# Elf & Seek — a Brierbrook adventure

A complete, mobile-first AR hide-and-seek game, evolved from the `main` branch's four-elves/three-cookies prototype. The original **3×3 barcode IDs are unchanged**.

Players check in at the grove, allow the camera, scan printed trail cards, answer each elf’s riddle, collect picnic cookies, and light the wishing tree. The journal records discoveries and optional clues. There is no countdown or speed reward. Progress survives reloads in the same browser. Replay explicitly resets the previous round.

## Run and check

Use **Node 22 LTS** (also used by CI).

```sh
npm ci
npm run dev
# Open http://localhost:3000/ar-game-template/
npm run lint
npm test
npm run build
npx playwright install --with-deps chromium
npm run test:e2e
```

The GitHub Pages base path remains `/ar-game-template/`. Old `/Game/index.html` links lead to the gated entry screen. Serve `dist` over HTTPS for real phones. HTTP `localhost` works for development; a plain HTTP LAN address does not unlock phone GPS/camera permissions. For desktop browser testing, emulate the venue coordinates and a realistic accuracy value using browser developer tools. There is **no production demo URL, query parameter, or manual location bypass**.

The site has no external fonts, image hosts, CDN scripts, analytics, or map/geocoding API calls at runtime. The AR runtime is pinned and lazy-loaded only after the location gate and camera action. The landing page does not load the tracking bundle or request any sensor permission.

## Set up a hunt

1. On the home page, choose **Hosting the hunt? → Print trail cards**. Print at 100% scale, one card per letter-size sheet; keep a white border around each black marker. Existing 3×3 markers 1–7 also work.
2. Place all seven cards on flat, well-lit surfaces within the host’s permitted play area, at a reachable height. Keep cards away from roads, vehicles, water, and climbing hazards. The host, not GPS, determines which areas guests can safely explore.
3. The supplied clues suggest shade (Pip), a pot/garden (Clover), seating (Bramble), and a doorway (Ember). Match the placements to those clues or edit `src/game/quest.js`.
4. Test the location check and all seven physical cards using an actual phone before the event. The automated tests exercise actual barcode detection using a synthetic camera feed; they do not replace outdoor phone testing.

| Barcode | Discovery | Interaction |
| --- | --- | --- |
| 1 | Moon chip | Collect cookie |
| 2 | Berry button | Collect cookie |
| 3 | Honey star | Collect cookie |
| 4 | Pip, trail keeper | Tree riddle |
| 5 | Clover, garden dreamer | Hole riddle |
| 6 | Bramble, cookie keeper | Clock riddle |
| 7 | Ember, lantern lighter | Cold riddle |

Hold the complete marker in the camera view for about 1.1 seconds. A 3D character appears on it and opens an encounter. A repeated marker never scores twice. A dismissed encounter can be rediscovered by moving the card out of frame and scanning it again.

## GPS geofence

Configuration lives in `src/game/quest.js`:

- Venue: **1860 Brierbrook Rd, Germantown, TN 38138**.
- Property-map center: **35.0982848, -89.7970858**.
- Starting radius: **60 m**; maximum reported accuracy: **35 m**; maximum location age: **30 seconds**.
- Unlock requires `distance to center + reported accuracy <= radius`. Poor accuracy does not enlarge the fence.
- `watchPosition` follows movement; a periodic `getCurrentPosition` refreshes stationary fixes. Denial, timeouts, stale fixes, uncertainty at the boundary, and leaving the fence all pause collection. Collection and completion recheck freshness at the instant of the action.
- Leaving the area, pausing, leaving the hunt, finishing, or hiding the tab stops the camera tracks and disposes the renderer. Returning to a visible tab obtains a fresh location before resuming.
- GPS samples and camera frames stay in memory on the device. Browser storage contains only progress, elapsed play time, hint IDs, and riddle mistakes. Blocked/full storage shows a notice instead of breaking play.

The center comes from the address's [property map](https://www.redfin.com/TN/Germantown/1860-Brierbrook-Rd-38138/home/60824318). It was cross-checked against the [US Census address geocoder](https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?address=1860%20Brierbrook%20Rd%2C%20Germantown%20TN%2038138&benchmark=Public_AR_Current&format=json), which returned the matching street address at 35.098354656285, -89.79735627996. These differ by about 26 m because the Census coordinate is a street-address estimate. The 60 m radius is an initial design choice, **not a surveyed property boundary**. Calibrate the center/radius on site, and place cards comfortably inside the accepted area. Phone GPS can be unreliable indoors.

This is a client-side proximity gate, not proof of identity or a tamper-resistant security boundary. A determined user can spoof browser GPS or edit local code/storage. Prizes, accounts, or access control would require a server-side design as a separate feature. Browser GPS cannot establish who the player is.

References: [MDN geolocation](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API), [reported accuracy](https://developer.mozilla.org/en-US/docs/Web/API/GeolocationCoordinates/accuracy), [AR.js marker API](https://ar-js-org.github.io/AR.js-Docs/marker-based/).

## Art and implementation

- `src/art/Illustrations.jsx`: original, editable vector elves, cookies, grove, fireflies, wishing tree and lanterns.
- `src/game/models.js`: matching procedural Three.js characters and cookies, with waving/bobbing/sparkle animations. No model downloads required.
- `src/game/tracker.js`: pinned AR.js + Three.js tracking, camera projection, responsive framing and resource cleanup.
- `src/game/state.js`, `geofence.js`: independently tested progress and location logic.
- `src/components/CameraView.jsx`: sensor permission flow and camera lifecycle.
- `src/App.css`: responsive layouts, safe-area handling, print styles and reduced-motion behavior.

The prototype's roughly 40 MB of GIF/PNG assets and unused dashboard scaffold have been replaced. The initial HTML/CSS/JS is about 220 KB uncompressed; tracking adds roughly 2.1 MB only when the camera begins. Original prototype assets remain in Git history. Sound is optional and synthesized locally; reduced-motion preferences disable decorative animation.

The old service worker is retired by `public/sw.js`; this release intentionally does not register a new worker or advertise offline play. Camera and GPS support, consent, HTTPS, and a real phone still matter.

## Third-party notices

AR.js 3.4.7 (MIT), Three.js 0.164.1 (MIT), and ARToolKit's license are included in `public/licenses`. The calibration file is from [AR.js 3.4.7](https://github.com/AR-js-org/AR.js/blob/3.4.7/data/data/camera_para.dat). The seven numeric marker images come from the [ARToolKit 3×3 barcode collection](https://github.com/nicolocarpignoli/artoolkit-barcode-markers-collection/tree/master/3x3), linked by the official AR.js documentation. The new character art, procedural models, and synthesized sound are authored in this repository.
