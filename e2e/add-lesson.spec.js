import { Buffer } from "node:buffer";

import { expect, test } from "./fixtures";

const PPTX = "src/data/Bai 1.pptx";

test.describe("Thêm bài học mới", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/lessons/new");
  });

  test("bắt buộc nhập tên bài học", async ({ page }) => {
    await page.getByRole("button", { name: "Lưu bài học" }).click();

    await expect(page.getByText("Vui lòng nhập tên bài học.")).toBeVisible();
  });

  test("bắt buộc có ít nhất một từ vựng", async ({ page }) => {
    await page.getByLabel("Tên bài học *").fill("Bài kiểm thử");
    await page.getByRole("button", { name: "Lưu bài học" }).click();

    await expect(
      page.getByText("Vui lòng thêm ít nhất một từ vựng (điền tiếng Nhật).")
    ).toBeVisible();
  });

  test("từ chối file không phải pptx/pdf", async ({ page }) => {
    await page.locator('input[type="file"]').setInputFiles({
      name: "tu-vung.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("khong phai pptx")
    });

    await expect(page.getByText("Chỉ hỗ trợ file .pptx hoặc .pdf.")).toBeVisible();
  });

  test("quét file pptx thật thì điền sẵn từ vựng và gợi ý tên bài", async ({ page }) => {
    await page.locator('input[type="file"]').setInputFiles(PPTX);

    await expect(page.getByText(/Đã quét được \d+ từ từ file "Bai 1\.pptx"/)).toBeVisible();

    const japaneseInputs = page.getByPlaceholder("Vd: やさい");
    expect(await japaneseInputs.count()).toBeGreaterThan(1);
    await expect(japaneseInputs.first()).not.toHaveValue("");
    await expect(page.getByLabel("Tên bài học *")).not.toHaveValue("");
  });

  test("lưu bài mới xong thì mở luôn trang bài học và bài có trong lộ trình", async ({ page }) => {
    await page.getByLabel("Tên bài học *").fill("Bài kiểm thử E2E");
    await page.getByLabel("Mô tả ngắn").fill("Mô tả kiểm thử");

    await page.getByPlaceholder("Vd: やさい").first().fill("ねこ");
    await page.getByPlaceholder("Vd: rau").first().fill("con mèo");

    await page.getByRole("button", { name: "Lưu bài học" }).click();

    await expect(page).toHaveURL(/\/lesson\/\d+$/);
    await expect(page.getByRole("heading", { name: "Bài kiểm thử E2E", level: 1 })).toBeVisible();

    await page.goto("/roadmap");
    await expect(page.getByRole("heading", { name: "Bài kiểm thử E2E" })).toBeVisible();
    await expect(page.getByText("Tự thêm")).toBeVisible();
  });

  test("bài tự thêm dùng được ngay trong đề kiểm tra", async ({ page }) => {
    await page.getByLabel("Tên bài học *").fill("Bài kiểm thử E2E");
    await page.getByPlaceholder("Vd: やさい").first().fill("ねこ");
    await page.getByPlaceholder("Vd: rau").first().fill("con mèo");
    await page.getByRole("button", { name: "Lưu bài học" }).click();

    const lessonId = new URL(page.url()).pathname.split("/").pop();

    await page.goto("/grammar-exam");
    await page.getByRole("button", { name: `Bài ${lessonId}`, exact: true }).click();
    await page.getByRole("button", { name: "Tạo đề", exact: true }).click();

    await expect(page.getByRole("heading", { name: "ねこ" })).toBeVisible();
  });

  test("xoá được bài tự thêm khỏi lộ trình", async ({ page }) => {
    await page.getByLabel("Tên bài học *").fill("Bài kiểm thử E2E");
    await page.getByPlaceholder("Vd: やさい").first().fill("ねこ");
    await page.getByRole("button", { name: "Lưu bài học" }).click();

    await page.goto("/roadmap");
    page.once("dialog", (dialog) => dialog.accept());
    await page
      .locator(".roadmap-card", { hasText: "Bài kiểm thử E2E" })
      .getByRole("button", { name: "Xóa" })
      .click();

    await expect(page.getByRole("heading", { name: "Bài kiểm thử E2E" })).toBeHidden();
  });
});
