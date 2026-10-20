import { test, expect } from "@playwright/test";
import { config } from "../../src/game/config.js";
import { VENUE } from "../../src/game/quest.js";
import { theme } from "../../src/game/theme.js";

// WCAG contrast from two computed CSS colors. A translucent background is
// composited over white first: the worst case for a plate over a camera image.
function contrast(foreground, background) {
  const channels = (css) => css.match(/[\d.]+/g).map(Number);
  const [r, g, b, a = 1] = channels(background);
  const onWhite = [r, g, b].map((c) => c * a + 255 * (1 - a));
  const luminance = (rgb) => {
    const [lr, lg, lb] = rgb.map((c) => {
      c /= 255;
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
  };
  const [hi, lo] = [luminance(channels(foreground).slice(0, 3)), luminance(onWhite)]
    .sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

async function arrive(page, context) {
  await context.grantPermissions(["geolocation"]);
  await context.setGeolocation({
    latitude: VENUE.latitude,
    longitude: VENUE.longitude,
    accuracy: 5,
  });
  const clips = [];
  page.on("request", (request) => {
    const match = request.url().match(/instructions\/(\d-(?:rule|line))\.mp3/);
    if (match) clips.push(match[1]);
  });
  // Record every play() by clip name; observable regardless of HTTP cache.
  await page.addInitScript(() => {
    window.__plays = [];
    const play = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      const m = this.src.match(/instructions\/(\d-(?:rule|line))\.mp3/);
      if (m) window.__plays.push(m[1]);
      return play.call(this);
    };
  });
  await page.goto("./");
  await page.getByRole("button", { name: "Let’s find some elves" }).click();
  // Start primes all eight clips before the first picture is tapped.
  await expect
    .poll(() => [...new Set(clips)].sort())
    .toEqual(
      ["1", "2", "3", "4"].flatMap((n) => [`${n}-line`, `${n}-rule`]),
    );
  // An on-site fix skips the location card and opens the trail briefing.
  // Each step unlocks only after the child taps the named thing in the picture.
  const steps = [
    "Tap the grown-up.",
    "Tap the one who’s walking.",
    "Tap the Stop sign.",
    "Tap the secret code.",
  ];
  for (const [index, prompt] of steps.entries()) {
    await expect(page.getByText(`Step ${index + 1} of 4`)).toBeVisible();
    // Each step narrates itself, including those reached by the yes-beat timer.
    await expect
      .poll(() => page.evaluate(() => window.__plays))
      .toContain(`${index + 1}-rule`);
    const camera = page.getByRole("button", { name: "Open camera & begin" });
    if (index === 0) {
      // A miss keeps the words, rocks them, and replays the step's line.
      // Let the step's own narration reach its line first, as a child would.
      await expect
        .poll(() => page.evaluate(() => window.__plays), { timeout: 15000 })
        .toContain("1-line");
      // Hotspot is left 42% top 2%; (5,5) px is safely outside it.
      await page.locator(".briefing-scene img").click({ position: { x: 5, y: 5 } });
      await expect(page.getByText(prompt)).toBeVisible();
      await expect(page.getByText("Not quite")).toHaveCount(0);
      await expect(page.locator(".briefing-words")).toHaveClass(/is-quake/);
      await expect
        .poll(() =>
          page.evaluate(() => window.__plays.filter((c) => c === "1-line").length),
        )
        .toBeGreaterThanOrEqual(2);
      // A second miss replays again.
      await page.locator(".briefing-scene img").click({ position: { x: 5, y: 5 } });
      await expect(page.locator(".briefing-words")).toHaveClass(/is-quake/);
      await expect
        .poll(() =>
          page.evaluate(() => window.__plays.filter((c) => c === "1-line").length),
        )
        .toBeGreaterThanOrEqual(3);
    }
    if (index < steps.length - 1) {
      await expect(camera).toHaveCount(0);
      await page.getByRole("button", { name: prompt }).click();
      await expect(page.getByText("Yes! That’s it.")).toBeVisible();
    } else {
      await expect(camera).toBeDisabled();
      await page.getByRole("button", { name: prompt }).click();
      await expect(camera).toBeEnabled();
    }
  }
}

// Feed actual ARToolKit barcodes through a real MediaStream. This tests the
// detector, scene, dwell time, riddles and collection without production hooks.
async function installMarkerCamera(page) {
  await page.addInitScript(() => {
    window.__cameraStreams = [];
    window.__markerId = null;
    window.__cameraRequestCount = 0;
    const images = new Map();
    navigator.mediaDevices.getUserMedia = async () => {
      window.__cameraRequestCount++;
      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 480;
      const context = canvas.getContext("2d");
      for (let id = 1; id <= 7; id++) {
        const img = new Image();
        img.src = `/markers/${id}.png`;
        images.set(id, img);
      }
      const stream = canvas.captureStream(30);
      window.__cameraStreams.push(stream);
      const draw = () => {
        if (stream.getTracks().every((track) => track.readyState === "ended"))
          return;
        context.fillStyle = "#fff";
        context.fillRect(0, 0, 640, 480);
        const img = images.get(window.__markerId);
        if (img?.complete && img.naturalWidth)
          context.drawImage(img, 160, 80, 320, 320);
        requestAnimationFrame(draw);
      };
      draw();
      return stream;
    };
  });
}

test("landing is responsive, requests no sensors, and offers the field guide", async ({
  page,
}) => {
  const sensorCalls = [];
  page.on("request", (request) => {
    if (
      request.url().includes("camera_para") ||
      request.url().includes("ar-threex")
    )
      sensorCalls.push(request.url());
  });
  await page.goto("./");
  await expect(page).toHaveTitle(`Elf & Seek · ${config.tagline}`);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  // The two small lines that missed 4.5:1 on the solid forest green.
  const forest = await page
    .locator(".app")
    .evaluate((el) => getComputedStyle(el).backgroundColor);
  for (const text of [`v${config.version}`, "EST. IN YOUR IMAGINATION"]) {
    const color = await page
      .getByText(text)
      .evaluate((el) => getComputedStyle(el).color);
    expect(contrast(color, forest), text).toBeGreaterThanOrEqual(4.5);
  }
  // The brand link is named by the wordmark and subtitle a player can see.
  await expect(
    page.getByRole("banner").getByRole("link", { name: config.tagline }),
  ).toHaveAccessibleName(new RegExp(`${theme.brand}.*${config.tagline}`, "i"));
  // The first keyboard stop skips the header and lands on the main region.
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).not.toBeInViewport();
  await page.keyboard.press("Tab");
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();
  // The demo pauses and resumes from an icon button with no visible words.
  const runningAnimations = () =>
    page.evaluate(
      () =>
        document.getAnimations().filter((a) => a.playState === "running")
          .length,
    );
  const pause = page.getByRole("button", { name: "Pause preview" });
  const play = page.getByRole("button", { name: "Play preview" });
  await expect(pause).toHaveText("");
  const pauseBox = await pause.boundingBox();
  expect(Math.min(pauseBox.width, pauseBox.height)).toBeGreaterThanOrEqual(24);
  expect(await runningAnimations()).toBeGreaterThan(0);
  await pause.click();
  await expect(play).toHaveText("");
  expect(await runningAnimations()).toBe(0);
  await play.click();
  await expect(pause).toBeVisible();
  expect(await runningAnimations()).toBeGreaterThan(0);
  await page.getByRole("button", { name: "How to play", exact: true }).click();
  const rules = page.getByRole("dialog", { name: "Rules" });
  await expect(rules.locator(".eyebrow")).toHaveText("RULES");
  await expect(rules).toContainText("Keep it visible for a moment");
  // Nothing moves behind the dialog; closing it lets the demo run again.
  expect(await runningAnimations()).toBe(0);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(await runningAnimations()).toBeGreaterThan(0);
  await expect(
    page.getByRole("button", { name: "The field guide" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Hosting the hunt?" }),
  ).toHaveCount(0);
  expect(sensorCalls).toHaveLength(0);
  // Reduced motion: the demo holds still and offers nothing to pause.
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(await runningAnimations()).toBe(0);
  await expect(page.getByRole("button", { name: /preview/i })).toBeHidden();
});

test("offsite and approximate fixes do not unlock the camera", async ({
  page,
  context,
}) => {
  test.skip(
    config.features.locationOverride,
    "GPS fence e2e needs locationOverride off",
  );
  await context.grantPermissions(["geolocation"]);
  await context.setGeolocation({
    latitude: 35.1,
    longitude: -89.8,
    accuracy: 5,
  });
  await page.goto("./");
  await page.getByRole("button", { name: "Let’s find some elves" }).click();
  await expect(
    page.getByRole("heading", { name: "The store is a little farther away" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Open camera & begin" }),
  ).toHaveCount(0);
  await context.setGeolocation({
    latitude: VENUE.latitude,
    longitude: VENUE.longitude,
    accuracy: 100,
  });
  await expect(
    page.getByRole("heading", { name: "A clearer signal, please" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Open camera & begin" }),
  ).toHaveCount(0);
  await context.setGeolocation({
    latitude: VENUE.latitude + (VENUE.radiusMeters - 10) / 111_195,
    longitude: VENUE.longitude,
    accuracy: 15,
  });
  await expect(
    page.getByRole("heading", { name: "You’re near the edge" }),
  ).toBeVisible();
});

test("privacy note is a page footer on the check-in screen", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["geolocation"]);
  await context.setGeolocation({
    latitude: 35.1,
    longitude: -89.8,
    accuracy: 5,
  });
  await page.goto("./");
  await page.getByRole("button", { name: "Let’s find some elves" }).click();
  const note = page.getByText("Privacy assured", { exact: false });
  await expect(note).toBeVisible();
  const box = await note.boundingBox();
  const viewport = page.viewportSize();
  expect(box.y + box.height).toBeGreaterThan(viewport.height - 80);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollHeight <= innerHeight,
    ),
  ).toBe(true);
  await expect(
    page.getByRole("button", { name: "Check my location" }),
  ).toBeEnabled();
});

test("denied location is explained and never advances to camera", async ({
  page,
}) => {
  test.skip(
    config.features.locationOverride,
    "GPS fence e2e needs locationOverride off",
  );
  await page.addInitScript(() => {
    navigator.geolocation.watchPosition = (_success, error) => {
      error({ code: 1 });
      return 1;
    };
  });
  await page.goto("./");
  await page.getByRole("button", { name: "Let’s find some elves" }).click();
  await expect(
    page.getByRole("heading", { name: "Location access is off" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Open camera & begin" }),
  ).toHaveCount(0);
});

test("camera denial is recoverable without losing the location gate", async ({
  page,
  context,
}) => {
  await page.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = async () => {
      throw new DOMException("Denied", "NotAllowedError");
    };
  });
  await arrive(page, context);
  await page.getByRole("button", { name: "Open camera & begin" }).click();
  await expect(page.getByRole("alert")).toContainText("Camera access is off");
  await expect(
    page.getByRole("button", { name: "Try camera again" }),
  ).toBeVisible();
});

test("all seven real barcode markers complete the hunt; GPS exit pauses and stops camera", async ({
  page,
  context,
}) => {
  test.setTimeout(120000);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await installMarkerCamera(page);
  if (config.features.locationOverride) {
    // Emulated GPS reports once; a real one keeps reporting. Keep reporting so
    // the fix does not age out (maxFixAgeMs) during a 40 s hunt. Each re-report
    // also flaps a transient POSITION_UNAVAILABLE, as indoor GPS does.
    const gps = setInterval(() => {
      context
        .setGeolocation({ latitude: VENUE.latitude, longitude: VENUE.longitude, accuracy: 5 })
        .catch(() => {});
    }, 5000);
    page.once("close", () => clearInterval(gps));
  }
  await arrive(page, context);
  await page.getByRole("button", { name: "Open camera & begin" }).click();
  await expect(page.getByText("Frame a printed trail marker")).toBeVisible({
    timeout: 35000,
  });
  if (!config.features.locationOverride) {
    // Leaving the fence immediately stops every camera track and blocks progress.
    await context.setGeolocation({
      latitude: 35.1,
      longitude: -89.8,
      accuracy: 5,
    });
    await expect(page.getByText("ADVENTURE PAUSED")).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(() =>
          window.__cameraStreams.every((stream) =>
            stream.getTracks().every((track) => track.readyState === "ended"),
          ),
        ),
      )
      .toBe(true);
    await page.evaluate(() => {
      window.__markerId = 4;
    });
    await expect(page.getByTestId("elf-count")).toHaveText("0");
    await context.setGeolocation({
      latitude: VENUE.latitude,
      longitude: VENUE.longitude,
      accuracy: 5,
    });
  }
  await page.evaluate(() => {
    window.__markerId = 4;
  });
  await expect(page.getByRole("dialog", { name: "You found Pip" })).toBeVisible(
    { timeout: 35000 },
  );
  await page.getByRole("button", { name: "B A river" }).click();
  await expect(
    page.getByText("Almost! Have another little think."),
  ).toBeVisible();
  await page.getByRole("button", { name: "A A tree" }).click();
  await page.getByRole("button", { name: "Invite Pip along" }).click();
  await expect(page.getByTestId("elf-count")).toHaveText("1");
  // Rescanning a collected marker cannot score twice.
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Field journal" }).click();
  await page.getByRole("button", { name: "Clover, still hiding" }).click();
  await page.getByRole("button", { name: "Reveal hint" }).click();
  await expect(
    page.getByText("Clover is somewhere in the center aisles — look low, near the pasta and rice."),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  for (const [id, name, answer] of [
    [1, "Moon chip"],
    [5, "Clover", "B A hole"],
    [2, "Berry button"],
    [6, "Bramble", "C A clock"],
    [3, "Honey star"],
    [7, "Ember", "B A cold"],
  ]) {
    await page.evaluate((id) => {
      window.__markerId = id;
    }, id);
    await expect(
      page.getByRole("dialog", { name: `You found ${name}` }),
    ).toBeVisible({ timeout: 15000 });
    if (answer) await page.getByRole("button", { name: answer }).click();
    await page
      .getByRole("button", {
        name: answer ? `Invite ${name} along` : "Tuck it in my basket",
      })
      .click();
  }
  await expect(page.getByTestId("elf-count")).toHaveText("4");
  await expect(page.getByTestId("cookie-count")).toHaveText("3");
  await expect(
    page.getByRole("heading", { name: /WOW —\s*you found them all!/i }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Light the wishing tree" }).click();
  await expect(page.getByRole("heading", { name: "You win" })).toBeVisible();
  for (const gone of [
    "Seven little discoveries",
    "The friends are together",
    "You’ve earned the title",
    "Eagle-eyed elf whisperer",
    /Friend of the (grove|store)/,
  ]) {
    await expect(page.getByText(gone)).toHaveCount(0);
  }
  const share = page.getByRole("button", { name: "Share", exact: true });
  const copyResults = page.getByRole("button", { name: "Copy results" });
  const playAgain = page.getByRole("button", { name: "Play again" });
  await expect(share).toBeVisible();
  await expect(copyResults).toBeVisible();
  await expect(playAgain).toBeVisible();
  await expect(page.getByText("Friends reunited")).toBeVisible();
  await expect(page.getByText("Cookies rescued")).toBeVisible();
  const [shareBox, copyBox, againBox] = await Promise.all(
    [share, copyResults, playAgain].map((button) => button.boundingBox()),
  );
  expect(shareBox.width).toBeGreaterThan(copyBox.width);
  expect(shareBox.height).toBeGreaterThan(againBox.height);
  await expect
    .poll(() =>
      page.evaluate(() =>
        window.__cameraStreams.every((stream) =>
          stream.getTracks().every((track) => track.readyState === "ended"),
        ),
      ),
    )
    .toBe(true);
  await page.getByRole("button", { name: "Play again" }).click();
  await page.getByRole("button", { name: "Start a new adventure" }).click();
  await expect(
    page.getByRole("button", { name: "Let’s find some elves" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Four elves are hiding." }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
