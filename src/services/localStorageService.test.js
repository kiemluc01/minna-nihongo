import { describe, expect, it } from "vitest";

import { getProgress, saveProgress } from "./localStorageService";

const KEY = "n5_progress";

describe("getProgress", () => {
  it("trả về tiến độ rỗng mặc định khi chưa từng lưu", () => {
    expect(getProgress()).toEqual({ vocabulary: [], grammar: [], alphabet: [] });
  });

  it("đọc lại đúng dữ liệu đã lưu", () => {
    saveProgress({ vocabulary: [1, 2], grammar: ["は"], alphabet: [] });

    expect(getProgress()).toEqual({ vocabulary: [1, 2], grammar: ["は"], alphabet: [] });
  });

  // BUG: getProgress (localStorageService.js:11) không có try/catch như 4 service
  // localStorage còn lại, nên dữ liệu hỏng làm hàm ném lỗi và vỡ trang.
  it.fails("KHÔNG được ném lỗi khi dữ liệu trong localStorage bị hỏng", () => {
    localStorage.setItem(KEY, "{ khong-phai-json");

    expect(() => getProgress()).not.toThrow();
    expect(getProgress()).toEqual({ vocabulary: [], grammar: [], alphabet: [] });
  });
});

describe("saveProgress", () => {
  it("ghi dữ liệu dưới dạng JSON vào đúng khoá n5_progress", () => {
    saveProgress({ vocabulary: [7], grammar: [], alphabet: ["あ"] });

    expect(JSON.parse(localStorage.getItem(KEY))).toEqual({
      vocabulary: [7],
      grammar: [],
      alphabet: ["あ"]
    });
  });

  it("ghi đè tiến độ cũ thay vì gộp thêm", () => {
    saveProgress({ vocabulary: [1], grammar: [], alphabet: [] });
    saveProgress({ vocabulary: [2], grammar: [], alphabet: [] });

    expect(getProgress().vocabulary).toEqual([2]);
  });
});
