import { describe, expect, it } from "vitest";

import FlashcardController from "./FlashcardController";

describe("FlashcardController.nextCard", () => {
  it("chuyển sang thẻ kế tiếp", () => {
    expect(FlashcardController.nextCard(0, 3)).toBe(1);
    expect(FlashcardController.nextCard(1, 3)).toBe(2);
  });

  it("quay vòng về thẻ đầu khi đang ở thẻ cuối", () => {
    expect(FlashcardController.nextCard(2, 3)).toBe(0);
  });

  it("đứng yên khi bộ thẻ chỉ có một thẻ", () => {
    expect(FlashcardController.nextCard(0, 1)).toBe(0);
  });
});

describe("FlashcardController.prevCard", () => {
  it("lùi về thẻ trước", () => {
    expect(FlashcardController.prevCard(2, 3)).toBe(1);
  });

  it("quay vòng về thẻ cuối khi đang ở thẻ đầu", () => {
    expect(FlashcardController.prevCard(0, 3)).toBe(2);
  });

  it("đứng yên khi bộ thẻ chỉ có một thẻ", () => {
    expect(FlashcardController.prevCard(0, 1)).toBe(0);
  });
});

describe("đi tới rồi quay lại", () => {
  it("trở về đúng thẻ ban đầu", () => {
    const total = 5;

    expect(FlashcardController.prevCard(FlashcardController.nextCard(3, total), total)).toBe(3);
  });
});
