import { expect, test } from "./fixtures";

const openKaiwaTab = async (page) => {
  await page.goto("/lesson/1");
  await page.getByRole("button", { name: "Hội thoại" }).click();
};

const createKaiwa = async (page) => {
  await openKaiwaTab(page);

  await page.getByPlaceholder("Vd: Người 1").fill("Tanaka");
  await page.getByPlaceholder("Vd: Người 2").fill("Yamada");
  await page.getByRole("button", { name: "Bắt đầu hội thoại" }).click();

  const lineInputs = page.getByPlaceholder("Vd: わたしは ベトナムじんです。");
  await lineInputs.first().fill("おはようございます。");

  await page.getByRole("button", { name: "+ Thêm câu" }).click();
  await lineInputs.nth(1).fill("こんにちは。");

  await page.getByRole("button", { name: "Lưu hội thoại" }).click();
};

test.describe("Hội thoại của một bài học", () => {
  test("tạo hội thoại rồi xem lại đúng nội dung đã nhập", async ({ page }) => {
    await createKaiwa(page);

    await expect(page.getByRole("heading", { name: "Hội thoại" })).toBeVisible();
    // Cả hai câu mặc định gán cho người nói đầu tiên.
    await expect(page.getByText("Tanaka：")).toHaveCount(2);
    await expect(page.getByText("おはようございます。")).toBeVisible();
    await expect(page.getByText("こんにちは。")).toBeVisible();
  });

  test("hội thoại được giữ lại sau khi tải lại trang", async ({ page }) => {
    await createKaiwa(page);

    await page.reload();
    await page.getByRole("button", { name: "Hội thoại" }).click();

    await expect(page.getByText("おはようございます。")).toBeVisible();
  });

  test("báo lỗi khi lưu mà chưa nhập câu thoại nào", async ({ page }) => {
    await openKaiwaTab(page);
    await page.getByRole("button", { name: "Bắt đầu hội thoại" }).click();
    await page.getByRole("button", { name: "Lưu hội thoại" }).click();

    await expect(page.getByText("Vui lòng nhập ít nhất một câu thoại.")).toBeVisible();
  });

  test("nghe hội thoại đọc lần lượt từng câu", async ({ page }) => {
    await createKaiwa(page);

    await page.getByRole("button", { name: /Nghe hội thoại/ }).click();

    await expect(page.getByRole("button", { name: /Tạm dừng/ })).toBeVisible();
    await expect
      .poll(() => page.evaluate(() => window.__spokenTexts))
      .toEqual(["おはようございます。", "こんにちは。"]);
  });

  test("tạo bài tập đục lỗ và nộp bài", async ({ page }) => {
    await createKaiwa(page);

    await page.getByRole("button", { name: "Tạo bài tập" }).click();

    const blankLine = page.locator(".kaiwa-line.is-blank");
    await expect(blankLine).toHaveCount(1);
    await expect(
      page.getByText("Đoạn hội thoại mẫu đang được ẩn để tránh lộ đáp án khi làm bài.")
    ).toBeVisible();

    await page.locator(".quiz-option").first().click();
    await page.getByRole("button", { name: "Nộp bài" }).click();

    await expect(page.locator(".grammar-translation, .form-error").last()).toContainText(
      /✅ Đúng|❌ Đáp án:/
    );
  });

  test("sửa lại hội thoại đã lưu", async ({ page }) => {
    await createKaiwa(page);

    await page.getByRole("button", { name: "Sửa hội thoại" }).click();
    await page.getByPlaceholder("Vd: わたしは ベトナムじんです。").first().fill("こんばんは。");
    await page.getByRole("button", { name: "Lưu hội thoại" }).click();

    await expect(page.getByText("こんばんは。")).toBeVisible();
    await expect(page.getByText("おはようございます。")).toBeHidden();
  });

  test("xoá hội thoại thì quay lại bước tạo mới", async ({ page }) => {
    await createKaiwa(page);

    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Xóa", exact: true }).click();

    await expect(page.getByRole("heading", { name: "Tạo hội thoại" })).toBeVisible();
  });
});
