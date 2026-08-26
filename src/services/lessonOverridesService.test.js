import { describe, expect, it, vi } from "vitest";

import {
  clearGrammarOverride,
  clearVocabOverride,
  getAllLessonOverrides,
  getLessonOverrides,
  setGrammarOverride,
  setVocabOverride,
  subscribeLessonOverrides
} from "./lessonOverridesService";
import { expectEventFired } from "../test/helpers/events";

const KEY = "n5_lesson_overrides";
const CHANGE_EVENT = "n5-lesson-overrides-changed";

describe("getLessonOverrides", () => {
  it("trả về cấu trúc rỗng khi bài chưa có bản chỉnh sửa nào", () => {
    expect(getLessonOverrides(1)).toEqual({ vocab: {}, grammar: {} });
  });

  it("khớp lessonId dù truyền vào là số hay chuỗi", () => {
    setVocabOverride(3, 12, { meaning: "con mèo" });

    expect(getLessonOverrides("3").vocab[12]).toEqual({ meaning: "con mèo" });
    expect(getLessonOverrides(3).vocab[12]).toEqual({ meaning: "con mèo" });
  });

  it("trả về cấu trúc rỗng khi dữ liệu bị hỏng hoặc là mảng", () => {
    localStorage.setItem(KEY, "{ khong-phai-json");
    expect(getLessonOverrides(1)).toEqual({ vocab: {}, grammar: {} });

    localStorage.setItem(KEY, JSON.stringify([1, 2]));
    expect(getLessonOverrides(1)).toEqual({ vocab: {}, grammar: {} });
  });
});

describe("setVocabOverride", () => {
  it("lưu bản chỉnh sửa theo id của từ", () => {
    setVocabOverride(1, 5, { meaning: "giáo viên" });

    expect(getLessonOverrides(1).vocab).toEqual({ 5: { meaning: "giáo viên" } });
  });

  it("gộp patch mới vào bản chỉnh sửa cũ của cùng một từ", () => {
    setVocabOverride(1, 5, { meaning: "giáo viên" });
    setVocabOverride(1, 5, { reading: "せんせい" });

    expect(getLessonOverrides(1).vocab[5]).toEqual({
      meaning: "giáo viên",
      reading: "せんせい"
    });
  });

  it("không đụng tới bản chỉnh sửa của từ khác hay bài khác", () => {
    setVocabOverride(1, 5, { meaning: "giáo viên" });
    setVocabOverride(1, 6, { meaning: "học sinh" });
    setVocabOverride(2, 5, { meaning: "cái này" });

    expect(getLessonOverrides(1).vocab[5]).toEqual({ meaning: "giáo viên" });
    expect(getLessonOverrides(1).vocab[6]).toEqual({ meaning: "học sinh" });
    expect(getLessonOverrides(2).vocab[5]).toEqual({ meaning: "cái này" });
  });

  it("không làm mất phần ngữ pháp đã chỉnh sửa của cùng bài", () => {
    setGrammarOverride(1, 0, { example: "わたしは がくせいです。" });
    setVocabOverride(1, 5, { meaning: "giáo viên" });

    expect(getLessonOverrides(1).grammar[0]).toEqual({ example: "わたしは がくせいです。" });
  });

  it("bắn sự kiện để giao diện cập nhật ngay", () => {
    expectEventFired(CHANGE_EVENT, () => setVocabOverride(1, 5, { meaning: "x" }));
  });
});

describe("setGrammarOverride", () => {
  it("lưu bản chỉnh sửa theo vị trí của ngữ pháp trong mảng gốc", () => {
    setGrammarOverride(1, 2, { blank: "は" });

    expect(getLessonOverrides(1).grammar).toEqual({ 2: { blank: "は" } });
  });

  it("gộp patch mới vào bản chỉnh sửa cũ của cùng vị trí", () => {
    setGrammarOverride(1, 2, { blank: "は" });
    setGrammarOverride(1, 2, { detail: "Trợ từ chủ đề" });

    expect(getLessonOverrides(1).grammar[2]).toEqual({
      blank: "は",
      detail: "Trợ từ chủ đề"
    });
  });

  it("bắn sự kiện để giao diện cập nhật ngay", () => {
    expectEventFired(CHANGE_EVENT, () => setGrammarOverride(1, 0, { blank: "は" }));
  });
});

describe("clearVocabOverride / clearGrammarOverride", () => {
  it("chỉ xoá đúng mục được chỉ định", () => {
    setVocabOverride(1, 5, { meaning: "a" });
    setVocabOverride(1, 6, { meaning: "b" });

    clearVocabOverride(1, 5);

    expect(getLessonOverrides(1).vocab).toEqual({ 6: { meaning: "b" } });
  });

  it("xoá ngữ pháp mà không đụng tới từ vựng", () => {
    setVocabOverride(1, 5, { meaning: "a" });
    setGrammarOverride(1, 0, { blank: "は" });

    clearGrammarOverride(1, 0);

    expect(getLessonOverrides(1)).toEqual({ vocab: { 5: { meaning: "a" } }, grammar: {} });
  });

  it("không làm gì khi mục cần xoá không tồn tại", () => {
    setVocabOverride(1, 5, { meaning: "a" });

    clearVocabOverride(1, 99);

    expect(getLessonOverrides(1).vocab).toEqual({ 5: { meaning: "a" } });
  });

  it("bắn sự kiện sau khi xoá", () => {
    setVocabOverride(1, 5, { meaning: "a" });

    expectEventFired(CHANGE_EVENT, () => clearVocabOverride(1, 5));
  });
});

describe("getAllLessonOverrides", () => {
  it("gom bản chỉnh sửa của mọi bài", () => {
    setVocabOverride(1, 5, { meaning: "a" });
    setGrammarOverride(2, 0, { blank: "を" });

    expect(getAllLessonOverrides()).toEqual({
      1: { vocab: { 5: { meaning: "a" } }, grammar: {} },
      2: { vocab: {}, grammar: { 0: { blank: "を" } } }
    });
  });
});

describe("subscribeLessonOverrides", () => {
  it("gọi callback khi có thay đổi rồi ngừng sau khi huỷ đăng ký", () => {
    const callback = vi.fn();
    const unsubscribe = subscribeLessonOverrides(callback);

    setVocabOverride(1, 5, { meaning: "a" });
    expect(callback).toHaveBeenCalledTimes(1);

    unsubscribe();
    setVocabOverride(1, 6, { meaning: "b" });
    window.dispatchEvent(new Event("storage"));

    expect(callback).toHaveBeenCalledTimes(1);
  });
});
