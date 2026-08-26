import { expect, test } from "./fixtures";

test.describe("Điều hướng giữa các trang", () => {
  test("Dashboard hiển thị lời mời học và lối tắt", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "Học tiếng Nhật mỗi ngày, gọn, đẹp và dễ theo dõi." })
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Lộ trình học nhanh" })).toBeVisible();
  });

  const pages = [
    { path: "/hiragana", heading: "Hiragana" },
    { path: "/katakana", heading: "Katakana" },
    { path: "/vocabulary", heading: "Vocabulary" },
    { path: "/grammar", heading: "Grammar" },
    { path: "/grammar-exam", heading: "Kiểm tra ngữ pháp" },
    { path: "/roadmap", heading: /bài N5$/ },
    { path: "/radicals", heading: "75 bộ thủ N5" },
    { path: "/practice", heading: "Practice" }
  ];

  for (const { path, heading } of pages) {
    test(`mở được trang ${path}`, async ({ page }) => {
      await page.goto(path);

      await expect(page.getByRole("heading", { name: heading, level: 1 })).toBeVisible();
    });
  }

  test("mọi trang con đều quay lại được Dashboard", async ({ page }) => {
    await page.goto("/hiragana");

    await page.getByRole("link", { name: "← Trở về Dashboard" }).click();

    await expect(page).toHaveURL("/");
    await expect(page.getByRole("heading", { name: "Lộ trình học nhanh" })).toBeVisible();
  });

  test("từ lộ trình mở được trang chi tiết bài học", async ({ page }) => {
    await page.goto("/roadmap");

    await page.getByRole("link", { name: "Mở bài học" }).first().click();

    await expect(page).toHaveURL(/\/lesson\/\d+$/);
    await expect(page.getByText("Bài 1", { exact: true }).first()).toBeVisible();
  });
});
