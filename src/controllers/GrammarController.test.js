import { describe, expect, it } from "vitest";

import GrammarController from "./GrammarController";

describe("GrammarController.checkAnswer", () => {
  it("đúng khi lựa chọn trùng đáp án", () => {
    expect(GrammarController.checkAnswer("は", "は")).toBe(true);
  });

  it("sai khi lựa chọn khác đáp án", () => {
    expect(GrammarController.checkAnswer("を", "は")).toBe(false);
  });

  it("sai khi chưa chọn gì", () => {
    expect(GrammarController.checkAnswer("", "は")).toBe(false);
    expect(GrammarController.checkAnswer(undefined, "は")).toBe(false);
  });

  it("so khớp nghiêm ngặt, không bỏ qua khoảng trắng", () => {
    expect(GrammarController.checkAnswer(" は", "は")).toBe(false);
  });
});
