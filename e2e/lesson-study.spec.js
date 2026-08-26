import { expect, test } from "./fixtures";

test.describe("Học một bài có sẵn", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/lesson/1");
  });

  test("mở ở tab Lộ trình với tổng quan bài học", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Tổng quan bài 1" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Các bước học" })).toBeVisible();
  });

  test("chuyển sang tab Từ vựng và lật được flashcard", async ({ page }) => {
    await page.getByRole("button", { name: "Từ vựng" }).click();

    const card = page.locator(".flashcard");
    await expect(card).toBeVisible();
    await expect(page.getByText("Chạm để lật thẻ")).toBeVisible();

    await card.click();

    await expect(card).toHaveClass(/is-flipped/);
    await expect(card.locator(".flashcard-back")).toBeVisible();
  });

  test("chuyển được sang từ kế tiếp", async ({ page }) => {
    await page.getByRole("button", { name: "Từ vựng" }).click();

    const front = page.locator(".flashcard-front");
    const firstWord = await front.textContent();

    await page.getByRole("button", { name: "Next", exact: true }).click();

    await expect(front).not.toHaveText(firstWord);
  });

  test("nghe được phát âm mà không lật thẻ", async ({ page }) => {
    await page.getByRole("button", { name: "Từ vựng" }).click();

    const card = page.locator(".flashcard");
    await card.getByRole("button", { name: /Nghe phát âm/ }).click();

    await expect(card).not.toHaveClass(/is-flipped/);
  });

  test("tab Ngữ pháp hiện các mẫu câu của bài", async ({ page }) => {
    await page.getByRole("button", { name: "Ngữ pháp" }).click();

    const notes = page.locator(".grammar-note-card");
    await expect(notes.first()).toBeVisible();
    await expect(notes.first().locator(".grammar-example")).toBeVisible();
  });

  test("tab Hội thoại mời tạo hội thoại khi bài chưa có", async ({ page }) => {
    await page.getByRole("button", { name: "Hội thoại" }).click();

    await expect(page.getByRole("heading", { name: "Tạo hội thoại" })).toBeVisible();
  });

  test("bài không tồn tại thì báo rõ ràng", async ({ page }) => {
    await page.goto("/lesson/9999");

    await expect(page.getByRole("heading", { name: "Không tìm thấy bài học" })).toBeVisible();
  });
});
