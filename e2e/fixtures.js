import { test as base, expect } from "@playwright/test";

// Mỗi test chạy trong một browser context mới nên localStorage đã sạch sẵn —
// KHÔNG được clear() trong addInitScript vì script đó chạy lại ở MỌI lần điều
// hướng, sẽ xoá mất bài học vừa lưu giữa chừng kịch bản.
// Web Speech API được thay bằng đôi giả để test không phụ thuộc giọng đọc cài
// trên máy chạy CI. speechSynthesis là thuộc tính chỉ-đọc của window nên phải
// dùng defineProperty, gán thẳng sẽ không ăn.
export const test = base.extend({
  page: async ({ page }, runTest) => {
    await page.addInitScript(() => {
      const noop = () => {};
      const spoken = [];

      Object.defineProperty(window, "speechSynthesis", {
        configurable: true,
        value: {
          speak: (utterance) => {
            spoken.push(utterance.text);
            setTimeout(() => utterance.onstart?.(), 0);
            setTimeout(() => utterance.onend?.(), 10);
          },
          cancel: noop,
          pause: noop,
          resume: noop,
          getVoices: () => []
        }
      });

      Object.defineProperty(window, "SpeechSynthesisUtterance", {
        configurable: true,
        value: class {
          constructor(text) {
            this.text = text;
          }
        }
      });

      // Cho test đọc lại những gì app đã phát ra.
      window.__spokenTexts = spoken;
    });

    await runTest(page);
  }
});

export { expect };
