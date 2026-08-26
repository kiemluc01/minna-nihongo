import { expect, test } from "./fixtures";

test.describe("Tạo và làm đề kiểm tra", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/grammar-exam");
  });

  test("chưa chọn bài thì chưa cho tạo đề", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Tạo đề", exact: true })).toBeDisabled();
    await expect(page.getByText("Chọn ít nhất một bài để tạo đề.")).toBeVisible();
  });

  test("chọn phạm vi thì hiện số từ và số mẫu ngữ pháp", async ({ page }) => {
    await page.getByRole("button", { name: "Bài 1", exact: true }).click();

    await expect(page.locator(".aside-value")).toContainText("từ ·");
    await expect(page.getByRole("button", { name: "Tạo đề", exact: true })).toBeEnabled();
  });

  test("làm trọn một đề trắc nghiệm và nhận điểm", async ({ page }) => {
    await page.getByRole("button", { name: "Bài 1", exact: true }).click();
    await page.getByRole("button", { name: "Tạo đề", exact: true }).click();

    const cards = page.locator(".exam-grid .quiz-card");
    await expect(cards.first()).toBeVisible();

    const total = await cards.count();
    for (let index = 0; index < total; index += 1) {
      await cards.nth(index).locator(".quiz-option").first().click();
    }

    await page.getByRole("button", { name: "Nộp bài" }).click();

    await expect(page.getByRole("heading", { name: "Kết quả" })).toBeVisible();
    await expect(page.locator("section.form-section .aside-value").last()).toContainText(
      new RegExp(`/${total} \\(\\d+%\\)`)
    );
  });

  test("mỗi câu ghi rõ thuộc loại từ vựng hay ngữ pháp", async ({ page }) => {
    await page.getByRole("button", { name: "Bài 1", exact: true }).click();
    await page.getByRole("button", { name: "Tạo đề", exact: true }).click();

    const kickers = page.locator(".exam-grid .lesson-kicker");
    const labels = await kickers.allTextContents();

    expect(labels.length).toBeGreaterThan(0);
    labels.forEach((label) => expect(label).toMatch(/(Từ vựng|Ngữ pháp) · Bài 1$/));
  });

  test("chọn nhiều bài thì phạm vi rộng hơn", async ({ page }) => {
    await page.getByRole("button", { name: "Bài 1", exact: true }).click();
    const oneLesson = await page.locator(".aside-value").textContent();

    await page.getByRole("button", { name: "Bài 2", exact: true }).click();

    await expect(page.locator(".aside-value")).not.toHaveText(oneLesson);
  });

  test("dạng điền từ cho ô nhập thay vì nút chọn", async ({ page }) => {
    await page.getByRole("button", { name: "Bài 1", exact: true }).click();
    await page.getByRole("button", { name: "Điền từ" }).click();
    await page.getByRole("button", { name: "Tạo đề", exact: true }).click();

    await expect(page.locator(".exam-grid input.search-input").first()).toBeVisible();
    await expect(page.locator(".exam-grid .quiz-option")).toHaveCount(0);
  });

  test("tạo đề mới sau khi nộp bài thì xoá kết quả cũ", async ({ page }) => {
    await page.getByRole("button", { name: "Bài 1", exact: true }).click();
    await page.getByRole("button", { name: "Tạo đề", exact: true }).click();
    await page.getByRole("button", { name: "Nộp bài" }).click();

    await expect(page.getByRole("heading", { name: "Kết quả" })).toBeVisible();

    await page.getByRole("button", { name: "Làm đề khác" }).click();

    await expect(page.getByRole("heading", { name: "Kết quả" })).toBeHidden();
    await expect(page.getByRole("button", { name: "Nộp bài" })).toBeVisible();
  });
});
