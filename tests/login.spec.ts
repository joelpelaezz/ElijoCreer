import { expect, test } from "@playwright/test";

const BASE_URL = "http://localhost:3000";

test("should login with valid credentials", async ({ page }) => {
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState("domcontentloaded");
  
  await page.locator('input[type="email"]').fill('vicky@gmail.com');
  await page.locator('input[type="password"]').fill('123456789');
  await page.locator('button[type="submit"]').click();
  
  await page.waitForURL("**/dashboard", { timeout: 10000 });
  
  expect(page.url()).toContain("/dashboard");
});