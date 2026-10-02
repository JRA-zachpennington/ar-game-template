import { test, expect } from "@playwright/test";
import { VENUE } from "../../src/game/quest.js";

async function arrive(page, context) {
  await context.grantPermissions(["geolocation"]);
  await context.setGeolocation({
    latitude: VENUE.latitude,
    longitude: VENUE.longitude,
    accuracy: 5,
  });
  await page.goto("./");
  await page.getByRole("button", { name: "Let’s find some elves" }).click();
  await page.getByRole("button", { name: "Check my location" }).click();
  await expect(
    page.getByRole("heading", { name: "You’re in the grove" }),
  ).toBeVisible();
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
        img.src = `/ar-game-template/markers/${id}.png`;
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

test("landing is responsive, requests no sensors, and offers useful guide and host cards", async ({
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
  await expect(page).toHaveTitle("Elf & Seek · A Brierbrook Adventure");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "How to play", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "Keep it visible for a moment",
  );
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Hosting the hunt?" }).click();
  await expect(page.getByRole("dialog").locator(".print-card")).toHaveCount(7);
  expect(
    await page
      .locator(".print-card img")
      .evaluateAll((imgs) =>
        imgs.every((img) => img.complete && img.naturalWidth > 0),
      ),
  ).toBe(true);
  expect(sensorCalls).toHaveLength(0);
});

test("offsite and approximate fixes do not unlock the camera", async ({
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
  await page.getByRole("button", { name: "Check my location" }).click();
  await expect(
    page.getByRole("heading", { name: "The grove is a little farther away" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Open camera & begin" }),
  ).toBeDisabled();
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
  ).toBeDisabled();
  await context.setGeolocation({
    latitude: VENUE.latitude + 0.00048,
    longitude: VENUE.longitude,
    accuracy: 15,
  });
  await expect(
    page.getByRole("heading", { name: "You’re near the edge" }),
  ).toBeVisible();
});

test("denied location is explained and never advances to camera", async ({
  page,
}) => {
  await page.addInitScript(() => {
    navigator.geolocation.watchPosition = (_success, error) => {
      error({ code: 1 });
      return 1;
    };
  });
  await page.goto("./");
  await page.getByRole("button", { name: "Let’s find some elves" }).click();
  await page.getByRole("button", { name: "Check my location" }).click();
  await expect(
    page.getByRole("heading", { name: "Location access is off" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Open camera & begin" }),
  ).toBeDisabled();
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
  await arrive(page, context);
  await page.getByRole("button", { name: "Open camera & begin" }).click();
  await expect(page.getByText("Frame a printed trail marker")).toBeVisible({
    timeout: 35000,
  });
  // Leaving the fence immediately stops every camera track and blocks progress.
  await context.setGeolocation({
    latitude: 35.1,
    longitude: -89.8,
    accuracy: 5,
  });
  await expect(
    page.getByText("ADVENTURE PAUSED · PROGRESS SAVED"),
  ).toBeVisible();
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
  await page.getByRole("button", { name: "Reveal a gentle hint" }).click();
  await expect(
    page.getByText("Clover feels at home near a pot or a garden bed."),
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
  await page.getByRole("button", { name: "Light the wishing tree" }).click();
  await expect(
    page.getByRole("heading", { name: "You brought the magic." }),
  ).toBeVisible();
  await expect(page.getByText("Friend of the grove")).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() =>
        window.__cameraStreams.every((stream) =>
          stream.getTracks().every((track) => track.readyState === "ended"),
        ),
      ),
    )
    .toBe(true);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "You brought the magic." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Play again" }).click();
  await page.getByRole("button", { name: "Start a new adventure" }).click();
  await expect(
    page.getByRole("button", { name: "Let’s find some elves" }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
