import { expect, test } from "@playwright/test";

test("boots the browser smoke harness", async ({ browserName, page }) => {
  await page.setContent(`
    <!doctype html>
    <html>
      <body>
        <main id="status" data-browser="${browserName}">ready</main>
      </body>
    </html>
  `);

  await expect(page.locator("#status")).toHaveText("ready");
  await expect(page.locator("#status")).toHaveAttribute("data-browser", browserName);
});
