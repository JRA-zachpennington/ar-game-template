import { test, expect } from "@playwright/test";

// 1.4.10 is a 320 CSS-pixel width. 1.4.4 is text at 200%, which has to stay
// on the page without a second scrollbar. Routes are the screens a player
// can open without the camera.
const PATHS = ["/", "/instructions", "/win", "/journal", "/accessibility", "/game"];

async function pageOverflowX(page) {
  return page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
}

async function enlargeText(page) {
  await page.evaluate(() => {
    const els = [...document.querySelectorAll("body *")];
    const sizes = els.map((el) => parseFloat(getComputedStyle(el).fontSize));
    els.forEach((el, i) => {
      if (sizes[i]) el.style.setProperty("font-size", `${sizes[i] * 2}px`, "important");
    });
  });
}

test("320 CSS-pixel viewport does not scroll sideways", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  for (const path of PATHS) {
    await page.goto(path);
    expect(await pageOverflowX(page), path).toBeLessThanOrEqual(1);
  }
});

test("text at 200% keeps home, journal, and hunt controls reachable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await enlargeText(page);
  expect(await pageOverflowX(page)).toBeLessThanOrEqual(1);
  const start = page.getByRole("button", { name: "Let’s find some elves" });
  await start.scrollIntoViewIfNeeded();
  await expect(start).toBeVisible();

  await page.goto("/journal");
  await enlargeText(page);
  expect(await pageOverflowX(page)).toBeLessThanOrEqual(1);
  const entry = page.getByRole("button", { name: "Still hiding" }).first();
  await entry.scrollIntoViewIfNeeded();
  await expect(entry).toBeVisible();
  const clipped = await entry.evaluate(
    (el) => el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1,
  );
  expect(clipped).toBe(false);

  await page.goto("/game");
  await enlargeText(page);
  expect(await pageOverflowX(page)).toBeLessThanOrEqual(1);
  const journal = page.getByRole("button", { name: "Field journal" }).last();
  await journal.scrollIntoViewIfNeeded();
  await expect(journal).toBeInViewport();
});
