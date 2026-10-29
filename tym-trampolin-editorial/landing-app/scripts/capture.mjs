import { chromium, expect } from "@playwright/test";
import { mkdir, rename } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
const output = fileURLToPath(new URL("../docs/preview/", import.meta.url));
const baseURL = process.env.EVOLUTION_BASE_URL || "http://127.0.0.1:5200";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
async function ready(page, ambient = false) {
  await page.goto(baseURL);
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator("canvas")).toHaveAttribute(
    "data-geometry-id",
    /\d+/,
  );
  await page.locator(".developer-controls").evaluate((el) => {
    el.open = true;
  });
  await page.getByLabel("Ambient motion").setChecked(ambient);
  await page.locator(".developer-controls").evaluate((el) => {
    el.open = false;
  });
}
async function scroll(page, y) {
  await page.evaluate(
    (y) => window.scrollTo({ top: y, behavior: "instant" }),
    y,
  );
  await page.waitForTimeout(1100);
}
async function chapter(page, id) {
  await scroll(
    page,
    (await page
      .locator(`#${id}`)
      .evaluate((el) => el.getBoundingClientRect().top + scrollY)) +
      (id === "hero" ? 0 : 2),
  );
}
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await ready(page);
  for (const id of ["hero", "about", "projects", "results", "team", "future"]) {
    await chapter(page, id);
    await page.screenshot({ path: `${output}/${id}.png` });
    console.log(`Captured ${id}.png`);
  }
  await scroll(page, await page.locator('.team-photo').evaluate(el => el.getBoundingClientRect().top + scrollY) - 48);
  const membersClip = await page.evaluate(() => {
    const photo = document.querySelector('.team-photo').getBoundingClientRect();
    const members = document.querySelector('.member-list').getBoundingClientRect();
    return { x: photo.left, y: photo.top, width: photo.width, height: members.bottom - photo.top };
  });
  await page.screenshot({ path: `${output}/team-members.png`, clip: membersClip });
  const anchors = await page.evaluate(() =>
    [
      document.querySelector("[data-launch-runway]"),
      document.getElementById("future"),
    ].map((element) => element.getBoundingClientRect().top + scrollY),
  );
  await scroll(
    page,
    anchors[0] + (anchors[1] - anchors[0]) * ((0.84 - 0.77) / (0.96 - 0.77)),
  );
  await page.screenshot({ path: `${output}/rocket.png` });
  for (const progress of [0.86, 0.875]) {
    await scroll(page, anchors[0] + (anchors[1] - anchors[0]) * ((progress - 0.77) / (0.96 - 0.77)));
    await page.screenshot({ path: `${output}/launch-${String(progress).slice(2)}.png` });
  }

  await page.locator(".finale").scrollIntoViewIfNeeded();
  await page.waitForTimeout(1100);
  await page.screenshot({ path: `${output}/finale.png` });
  await scroll(
    page,
    await page.evaluate(
      () => document.documentElement.scrollHeight - innerHeight,
    ),
  );
  await page.screenshot({ path: `${output}/footer.png` });
  await context.close();
  // Keep captures within normal viewport dimensions. Very tall full-page
  // screenshots can exceed the software renderer's surface-size limit.
  const staticContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });
  const staticPage = await staticContext.newPage();
  await staticPage.goto(baseURL);
  await staticPage.evaluate(() => document.fonts.ready);
  await expect(staticPage.locator(".static-mode")).toBeVisible();
  await expect(staticPage.locator("canvas")).toHaveCount(0);
  await staticPage.screenshot({ path: `${output}/static-experience.png` });
  await staticContext.close();
  for (const [width, height] of [
    [390, 844],
    [375, 667],
    [820, 1180],
    [773, 827],
  ]) {
    const compact = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: 1,
    });
    const mobile = await compact.newPage();
    await ready(mobile);
    const deviceName = width > 760 ? `tablet-${width}` : `mobile-${width}`;
    await mobile.screenshot({ path: `${output}/${deviceName}.png` });
    await chapter(mobile, "projects");
    await mobile.screenshot({ path: `${output}/${deviceName}-projects.png` });
    await chapter(mobile, "team");
    await mobile.screenshot({ path: `${output}/${deviceName}-team.png` });
    const launchAnchors = await mobile.evaluate(() => [document.querySelector('[data-launch-runway]'), document.getElementById('future')].map(el => el.getBoundingClientRect().top + scrollY));
    await scroll(mobile, launchAnchors[0] + (launchAnchors[1] - launchAnchors[0]) * ((.875 - .77) / (.96 - .77)));
    await mobile.screenshot({ path: `${output}/${deviceName}-launch.png` });
    await compact.close();
  }
  if (!process.argv.includes("--screenshots-only")) {
    const videoContext = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      deviceScaleFactor: 1,
      recordVideo: { dir: output, size: { width: 1280, height: 800 } },
    });
    const videoPage = await videoContext.newPage();
    await ready(videoPage, true);
    await videoPage.waitForTimeout(900);
    const max = await videoPage.evaluate(
      () => document.documentElement.scrollHeight - innerHeight,
    );
    const dwellStops = await videoPage.evaluate(() => {
      const top = selector => document.querySelector(selector).getBoundingClientRect().top + scrollY;
      const runway = top('[data-launch-runway]');
      return [top('#projects') + 2, runway + (top('#future') - runway) * ((.84 - .77) / (.96 - .77))];
    });
    let nextDwell = 0;
    // Real document scrolling traverses the GSAP chapter controller in both directions.
    for (let i = 0; i <= 160; i++) {
      await videoPage.evaluate(
        (y) => window.scrollTo({ top: y, behavior: "instant" }),
        (max * i) / 160,
      );
      if (nextDwell < dwellStops.length && max * i / 160 >= dwellStops[nextDwell]) {
        await videoPage.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), dwellStops[nextDwell++]);
        await videoPage.waitForTimeout(1100);
      }
      await videoPage.waitForTimeout(80);
    }
    await videoPage.waitForTimeout(900);
    for (let i = 100; i >= 0; i--) {
      await videoPage.evaluate(
        (y) => window.scrollTo({ top: y, behavior: "instant" }),
        (max * i) / 100,
      );
      await videoPage.waitForTimeout(70);
    }
    await videoPage.waitForTimeout(900);
    const video = videoPage.video();
    await videoContext.close();
    await rename(await video.path(), `${output}/website-tour.webm`);
    const ffmpeg = process.env.FFMPEG_PATH || "/opt/homebrew/bin/ffmpeg";
    const result = spawnSync(
      ffmpeg,
      [
        "-hide_banner",
        "-loglevel",
        "error",
        "-y",
        "-i",
        `${output}/website-tour.webm`,
        "-an",
        "-c:v",
        "libx264",
        "-preset",
        "fast",
        "-crf",
        "22",
        "-pix_fmt",
        "yuv420p",
        "-movflags",
        "+faststart",
        `${output}/website-tour.mp4`,
      ],
      { encoding: "utf8" },
    );
    console.log(
      result.status === 0
        ? "Captured website-tour.mp4 and .webm"
        : `WebM saved; MP4 unavailable: ${result.error?.message || result.stderr}`,
    );
  }
} finally {
  await browser.close();
}
