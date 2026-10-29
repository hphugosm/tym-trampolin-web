import { test, expect, type Page } from "@playwright/test";

const chapters = ["hero", "about", "projects", "results", "team", "future"];
// Shader compilation can fail only when a later morph stage becomes visible.
// Observe every test, including full traversal and GPU-resource checks.
const browserErrors = new WeakMap<Page, string[]>();
test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  browserErrors.set(page, errors);
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
});
test.afterEach(async ({ page }) => {
  expect(browserErrors.get(page) || []).toEqual([]);
});

async function ready(page: Page) {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator("canvas")).toHaveAttribute(
    "data-geometry-id",
    /\d+/,
  );
}
async function lab(page: Page) {
  await page
    .locator(".developer-controls")
    .evaluate((el: HTMLDetailsElement) => {
      el.open = true;
    });
}
async function manual(page: Page, progress: number) {
  await lab(page);
  const previousFrame = Number(await page.locator("canvas").getAttribute("data-frame"));
  await page
    .getByRole("slider", { name: "Průběh evoluce" })
    .fill(String(progress));
  await expect(page.locator(".developer-controls output")).toHaveText(
    `${Math.round(progress * 100)} %`,
  );
  await expect.poll(async () => Number(await page.locator("canvas").getAttribute("data-frame"))).toBeGreaterThan(previousFrame);
  await page.waitForTimeout(90);
}
async function scrollTo(page: Page, y: number) {
  await page.evaluate(
    (y) => window.scrollTo({ top: y, behavior: "instant" }),
    y,
  );
  await page.waitForTimeout(160);
}
async function diagnostics(page: Page) {
  return page.locator("canvas").evaluate((el) => {
    const { meshId, geometryId, vertexCount, geometryCount, textureCount } =
      el.dataset;
    return { meshId, geometryId, vertexCount, geometryCount, textureCount };
  });
}

async function expectCompactResults(page: Page) {
  const gap = await page.locator("#results").evaluate((section) => {
    const description = section.querySelector(".lead-description")!;
    const result = section.querySelector(".result")!;
    return (
      result.getBoundingClientRect().top -
      description.getBoundingClientRect().bottom
    );
  });
  expect(gap).toBeGreaterThanOrEqual(0);
  expect(gap).toBeLessThanOrEqual(100);
}

test("native navigation, compact content, and project catalog keyboard lifecycle", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await ready(page);
  for (const id of chapters)
    await expect(page.locator(`#${id}`)).toHaveCount(1);
  await expect(page.locator("h1")).toContainText("HISTORIE");
  await expect(
    page.locator('a[href="mailto:team@tymtrampolin.cz"]'),
  ).toHaveCount(2);
  await page
    .getByRole("navigation", { name: "Hlavní navigace" })
    .getByRole("link", { name: "Projekty" })
    .click();
  await expect(page).toHaveURL(/#projects$/);
  await expect(page.locator("#projects h2")).toBeInViewport();
  await expect(page.locator("#about .principles")).toHaveCount(0);
  await expect(page.locator("#projects article")).toHaveCount(0);
  const exploreProjects = page.getByRole("button", {
    name: "Prozkoumejte projekty",
    exact: true,
  });
  await exploreProjects.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog
    .getByRole("button", { name: "ClearMessage", exact: true })
    .click();
  await expect(dialog).toContainText("ClearMessage");
  await expect(dialog.getByRole("link", { name: "Devpost" })).toHaveAttribute(
    "href",
    /devpost.com/,
  );
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(exploreProjects).toBeFocused();
  await expectCompactResults(page);
  await expect(page.locator("#results")).toContainText("EVOHACKS");
  await expect(page.locator("#team")).toContainText("Hugo Kubíček");
  expect(errors).toEqual([]);
});

for (const width of [375, 390])
  test(`mobile ${width}px keeps navigation, content and controls accessible`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: width === 375 ? 667 : 844 });
    await ready(page);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const menu = page.locator(".menu-toggle");
    await menu.click();
    await expect(menu).toHaveAttribute("aria-expanded", "true");
    await page
      .getByRole("navigation", { name: "Hlavní navigace" })
      .getByRole("link", { name: "Tým", exact: false })
      .click();
    await expect(menu).toHaveAttribute("aria-expanded", "false");
    await expect(page).toHaveURL(/#team$/);
    await expect(page.locator("#team h2")).toBeInViewport();
    await menu.click();
    await page.keyboard.press("Escape");
    await expect(menu).toBeFocused();
    await expectCompactResults(page);
    await expectCompactTeam(page);
    for (const id of chapters) {
      await page.locator(`#${id}`).scrollIntoViewIfNeeded();
      if (id === "projects") {
        const exploreProjects = page.getByRole("button", {
          name: "Prozkoumejte projekty",
          exact: true,
        });
        await expect(exploreProjects).toBeInViewport();
        await expect(exploreProjects).toHaveCSS(
          "background-color",
          "rgb(23, 61, 165)",
        );
      }
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
  });

test("reduced motion retains all content and illustrations without loading the 3D chunk", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const requests: string[] = [];
  page.on("request", (r) => requests.push(r.url()));
  await page.goto("/");
  await expect(page.locator(".static-mode")).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(
    page.getByRole("img", { name: /Statická ilustrace/ }),
  ).toHaveCount(6);
  for (const id of chapters)
    await expect(page.locator(`#${id} h1, #${id} h2`).first()).toBeVisible();
  expect(requests.some((url) => /WebsiteCanvas|three.*\.js/i.test(url))).toBe(
    false,
  );
});

test("unavailable WebGL retains the complete static experience", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      ...args: Parameters<typeof original>
    ) {
      if (String(args[0]).includes("webgl")) return null;
      return original.apply(this, args);
    } as typeof original;
  });
  await page.goto("/");
  await expect(page.locator(".static-mode")).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(
    page.getByRole("img", { name: /Statická ilustrace/ }),
  ).toHaveCount(6);
  await expect(page.locator("#contact")).toContainText("team@tymtrampolin.cz");
});

test("native scroll runs the full evolution and restores identical pixels backwards", async ({
  page,
}) => {
  await ready(page);
  await lab(page);
  await page.getByLabel("Ambient motion").uncheck();
  await page
    .locator(".developer-controls")
    .evaluate((el: HTMLDetailsElement) => {
      el.open = false;
    });
  const stops = await page.evaluate(() =>
    ["hero", "about", "projects", "results", "team", "future"].map(
      (id) =>
        document.getElementById(id)!.getBoundingClientRect().top + scrollY,
    ),
  );
  const expected = ["stone", "gear", "bulb", "chip", "rocket", "finale"];
  for (let i = 0; i < stops.length; i++) {
    await scrollTo(page, stops[i] + (i ? 2 : 0));
    await expect(page.locator("canvas")).toHaveAttribute(
      "data-stage",
      expected[i],
    );
  }
  const mid = Math.round((stops[1] + stops[2]) / 2);
  await scrollTo(page, mid);
  const before = await page.locator("canvas").screenshot();
  await scrollTo(page, stops[4]);
  await scrollTo(page, mid);
  expect(await page.locator("canvas").screenshot()).toEqual(before);
});

test("ambient motion animates without mutating geometry and sleeps when disabled", async ({
  page,
}) => {
  await ready(page);
  const canvas = page.locator("canvas");
  const version = await canvas.getAttribute("data-position-version");
  const frame = Number(await canvas.getAttribute("data-frame"));
  await expect
    .poll(async () => Number(await canvas.getAttribute("data-frame")))
    .toBeGreaterThan(frame + 2);
  await expect(canvas).toHaveAttribute("data-position-version", version!);
  await lab(page);
  await page.getByLabel("Ambient motion").uncheck();
  await page.waitForTimeout(200);
  const idle = await canvas.getAttribute("data-frame");
  await page.waitForTimeout(400);
  await expect(canvas).toHaveAttribute("data-frame", idle!);
});

test("all morph phases reuse GPU resources and rocket launch is reversible", async ({
  page,
}) => {
  await ready(page);
  await lab(page);
  await page.getByLabel("Ambient motion").uncheck();
  // Warm the renderer through every state before comparing GPU counts.
  for (const p of [
    0, 0.04, 0.12, 0.18, 0.29, 0.38, 0.45, 0.56, 0.67, 0.77, 0.8, 0.84, 0.9,
    0.94, 1,
  ])
    await manual(page, p);
  const initial = await diagnostics(page);
  for (const p of [
    0.04, 0.12, 0.29, 0.45, 0.67, 0.84, 0.94, 1, 0.8, 0.63, 0.5, 0.31, 0.1, 0,
  ]) {
    await manual(page, p);
    expect(await diagnostics(page)).toEqual(initial);
  }
  await manual(page, 0.82);
  const grounded = Number(
    await page.locator("canvas").getAttribute("data-object-y"),
  );
  await manual(page, 0.93);
  const launched = Number(
    await page.locator("canvas").getAttribute("data-object-y"),
  );
  expect(launched).toBeGreaterThan(grounded + 1);
  await manual(page, 0.82);
  expect(
    Number(await page.locator("canvas").getAttribute("data-object-y")),
  ).toBe(grounded);
  await page.getByLabel("Wireframe").check();
  await expect(page.locator("canvas")).toHaveAttribute(
    "data-wireframe",
    "true",
  );
  expect(await diagnostics(page)).toEqual(initial);
});

test("rocket waits for the team content and launches in an unobstructed viewport", async ({
  page,
}) => {
  await ready(page);
  await lab(page);
  await page.getByLabel("Ambient motion").uncheck();
  const anchors = await page.evaluate(() => {
    const top = (selector: string) =>
      document.querySelector(selector)!.getBoundingClientRect().top + scrollY;
    return {
      team: top("#team"),
      runway: top("[data-launch-runway]"),
      future: top("#future"),
    };
  });
  await scrollTo(page, anchors.team + 2);
  const x = await page.locator("canvas").getAttribute("data-object-x");
  await scrollTo(page, anchors.team + (anchors.runway - anchors.team) * 0.7);
  await expect(page.locator("canvas")).toHaveAttribute("data-object-x", x!);
  await expect(page.locator("canvas")).toHaveAttribute("data-stage", "rocket");
  await scrollTo(
    page,
    anchors.runway +
      (anchors.future - anchors.runway) * ((0.84 - 0.77) / (0.96 - 0.77)),
  );
  expect(
    await page
      .locator(".team-content")
      .evaluate((el) => el.getBoundingClientRect().bottom),
  ).toBeLessThan(0);
  expect(
    Math.abs(
      Number(await page.locator("canvas").getAttribute("data-object-x")),
    ),
  ).toBeLessThan(0.3);
  await expect(page.locator("canvas")).toHaveAttribute("data-stage", "rocket");
});

test('bulb light drives the page and reverses with the deterministic glass state', async ({ page }) => {
  await ready(page);
  await settleHero(page);
  await scrollTo(page, await page.locator('#projects').evaluate(el => el.getBoundingClientRect().top + scrollY + 2));
  await lab(page);
  await page.getByLabel('Ambient motion').uncheck();
  const light = () => page.locator('.website').evaluate(el => Number(getComputedStyle(el).getPropertyValue('--bulb-light')));
  const shadow = () => page.locator('#projects h2').evaluate(el => getComputedStyle(el).textShadow);
  await manual(page, .18);
  await expect.poll(light).toBe(0);
  const darkShadow = await shadow();
  await manual(page, .4);
  await expect.poll(light).toBeGreaterThan(.9);
  await expect.poll(async () => Number(await page.locator('canvas').getAttribute('data-bulb-light'))).toBeGreaterThan(.9);
  await expect.poll(async () => Number(await page.locator('.scene-light').evaluate(el => getComputedStyle(el).opacity))).toBeCloseTo(await light(), 3);
  const litShadow = await shadow();
  expect(litShadow).not.toBe(darkShadow);
  const pixels = await effectPixels(page);
  await manual(page, .56);
  await expect.poll(light).toBe(0);
  expect(await shadow()).toBe(darkShadow);
  await manual(page, .4);
  expect(await shadow()).toBe(litShadow);
  const afterPixels = await effectPixels(page);
  // Transmission and DOM compositing can round a single edge channel by 1/255.
  // Compare decoded pixels with a tightly bounded rasterization allowance.
  const difference = await pixelDifference(page, pixels, afterPixels);
  await test.info().attach("bulb-before", { body: pixels, contentType: "image/png" });
  await test.info().attach("bulb-after", { body: afterPixels, contentType: "image/png" });
  console.log("Bulb raster comparison", difference);
  expect(difference.maxChannelError).toBeLessThanOrEqual(1);
  expect(difference.changedPixels).toBeLessThanOrEqual(8);
});

test('launch flame and bounded smoke follow scroll in both directions', async ({ page }) => {
  await ready(page);
  await settleHero(page);
  await lab(page);
  await page.getByLabel('Ambient motion').uncheck();
  await manual(page, .77);
  await expect(page.locator('canvas')).toHaveAttribute('data-launch-effects', 'false');
  await manual(page, .84);
  await expect(page.locator('canvas')).toHaveAttribute('data-launch-effects', 'true');
  const count = Number(await page.locator('canvas').getAttribute('data-smoke-count'));
  expect(count).toBeGreaterThan(0);
  expect(count).toBeLessThanOrEqual(24);
  const position = await page.locator('canvas').getAttribute('data-object-y');
  const pixels = await effectPixels(page);
  await manual(page, .9);
  await expect(page.locator('canvas')).toHaveAttribute('data-launch-effects', 'true');
  await manual(page, .84);
  await expect(page.locator('canvas')).toHaveAttribute('data-object-y', position!);
  const afterPixels = await effectPixels(page);
  expect(afterPixels.equals(pixels)).toBe(true);
  await manual(page, .77);
  await expect(page.locator('canvas')).toHaveAttribute('data-launch-effects', 'false');
});

async function effectPixels(page: Page) {
  // The native range control's antialiasing/focus can change a handful of
  // compositor pixels. Remove the diagnostic overlay from effect comparisons.
  await page.locator('.developer-controls').evaluate((el: HTMLDetailsElement) => { el.open = false; });
  await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
  await page.waitForTimeout(1100);
  return page.locator('canvas').screenshot();
}

async function pixelDifference(page: Page, before: Buffer, after: Buffer) {
  return page.evaluate(async ([before, after]) => {
    const decode = async (value: string) => {
      const bytes = Uint8Array.from(atob(value), character => character.charCodeAt(0));
      const image = await createImageBitmap(new Blob([bytes], { type: 'image/png' }));
      const canvas = new OffscreenCanvas(image.width, image.height);
      const context = canvas.getContext('2d')!;
      context.drawImage(image, 0, 0);
      const pixels = context.getImageData(0, 0, image.width, image.height).data;
      image.close();
      return pixels;
    };
    const [a, b] = await Promise.all([decode(before), decode(after)]);
    let maxChannelError = 0, changedPixels = 0;
    for (let i = 0; i < a.length; i += 4) {
      let changed = false;
      for (let channel = 0; channel < 4; channel++) {
        const error = Math.abs(a[i + channel] - b[i + channel]);
        maxChannelError = Math.max(maxChannelError, error);
        changed ||= error > 0;
      }
      if (changed) changedPixels++;
    }
    return { maxChannelError, changedPixels };
  }, [before.toString('base64'), after.toString('base64')]);
}

async function settleHero(page: Page) {
  await expect.poll(() => page.evaluate(() => {
    const elements = [...document.querySelectorAll('#hero .motion-word, .header > *')];
    return elements.length > 0 && elements.every(element => {
      const style = getComputedStyle(element);
      return Math.abs(new DOMMatrixReadOnly(style.transform).m42) < .01 && Number(style.opacity) > .999;
    });
  }), { timeout: 15_000 }).toBe(true);
  await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
}

async function expectCompactTeam(page: Page) {
  await page.evaluate(() => window.scrollTo({ top: document.getElementById('team')!.getBoundingClientRect().top + scrollY, behavior: 'instant' }));
  await expect.poll(() => page.locator('#team').evaluate(section => ['.lead-description', '.team-photo'].every(selector => Math.abs(new DOMMatrixReadOnly(getComputedStyle(section.querySelector(selector)!).transform).m42) < .01)), { timeout: 15_000 }).toBe(true);
  await expect.poll(() => page.locator('#team').evaluate(section => {
    const description = section.querySelector('.lead-description')!.getBoundingClientRect();
    const photograph = section.querySelector('.team-photo')!.getBoundingClientRect();
    return photograph.top - description.bottom;
  })).toBeGreaterThanOrEqual(24);
  await expect.poll(() => page.locator('#team').evaluate(section => {
    const description = section.querySelector('.lead-description')!.getBoundingClientRect();
    const photograph = section.querySelector('.team-photo')!.getBoundingClientRect();
    return photograph.top - description.bottom;
  })).toBeLessThanOrEqual(60);
}

test('content cleanup preserves result evidence and completes the team profile', async ({ page }) => {
  await ready(page);
  await expect(page.locator('.chapter-lead > .eyebrow, #hero .chapter-bottom, .portrait-index, #results .list-footnote')).toHaveCount(0);
  expect(await page.locator('body').innerText()).not.toMatch(/[↗↓→←]/u);
  const honza = page.locator('.person').filter({ has: page.getByRole('heading', { name: 'Honza Smrz', exact: true }) });
  await expect(honza).toContainText('Člen týmu');
  await expect(honza).not.toContainText(/doplnění|připravujeme|Nový člen/);
  await expect(page.locator('#results h3').getByRole('link', { name: 'EVOHACKS' })).toHaveAttribute('href', /devpost\.com/);
  await expect(page.locator('#results h3').getByRole('link', { name: 'DemocraTICon' })).toHaveAttribute('href', /democraticon\.org/);
  await page.getByRole('button', { name: 'Prozkoumejte projekty', exact: true }).click();
  expect(await page.getByRole('dialog').innerText()).not.toMatch(/[↗↓→←]/u);
});

test('773px tablet keeps the team photograph close to its introduction', async ({ page }) => {
  await page.setViewportSize({ width: 773, height: 827 });
  await ready(page);
  await lab(page);
  await page.getByLabel('Ambient motion').uncheck();
  await page.locator('.developer-controls').evaluate((el: HTMLDetailsElement) => { el.open = false; });
  await expectCompactTeam(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
