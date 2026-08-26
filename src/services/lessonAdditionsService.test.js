import { describe, expect, it, vi } from "vitest";

import {
  addGrammarNote,
  addVocabularyWord,
  getAllLessonAdditions,
  getLessonAdditions,
  removeGrammarNote,
  removeVocabularyWord,
  subscribeLessonAdditions,
  updateGrammarNote,
  updateVocabularyWord
} from "./lessonAdditionsService";
import { expectEventFired } from "../test/helpers/events";

const KEY = "n5_lesson_additions";
const CHANGE_EVENT = "n5-lesson-additions-changed";

const seed = (additions) => localStorage.setItem(KEY, JSON.stringify(additions));

describe("getLessonAdditions", () => {
  it("trả về cấu trúc rỗng khi bài chưa có mục nào thêm vào", () => {
    expect(getLessonAdditions(1)).toEqual({ vocabulary: [], grammarNotes: [] });
  });

  it("khớp lessonId dù truyền vào là số hay chuỗi", () => {
    addVocabularyWord(3, { jp: "ねこ" });

    expect(getLessonAdditions("3").vocabulary).toEqual([{ jp: "ねこ" }]);
    expect(getLessonAdditions(3).vocabulary).toEqual([{ jp: "ねこ" }]);
  });

  it("trả về cấu trúc rỗng khi dữ liệu bị hỏng", () => {
    localStorage.setItem(KEY, "{ khong-phai-json");

    expect(getLessonAdditions(1)).toEqual({ vocabulary: [], grammarNotes: [] });
  });

  it("trả về cấu trúc rỗng khi dữ liệu đã lưu là mảng", () => {
    seed([1, 2, 3]);

    expect(getLessonAdditions(1)).toEqual({ vocabulary: [], grammarNotes: [] });
  });
});

describe("getAllLessonAdditions", () => {
  it("trả về object rỗng khi chưa có gì", () => {
    expect(getAllLessonAdditions()).toEqual({});
  });

  it("gom mục thêm của nhiều bài, khoá là lessonId dạng chuỗi", () => {
    addVocabularyWord(1, { jp: "ねこ" });
    addVocabularyWord(2, { jp: "いぬ" });

    expect(Object.keys(getAllLessonAdditions())).toEqual(["1", "2"]);
  });
});

describe("thêm từ vựng và ngữ pháp", () => {
  it("nối từ mới vào cuối danh sách của bài", () => {
    addVocabularyWord(1, { jp: "ねこ" });
    addVocabularyWord(1, { jp: "いぬ" });

    expect(getLessonAdditions(1).vocabulary).toEqual([{ jp: "ねこ" }, { jp: "いぬ" }]);
  });

  it("nối ngữ pháp mới mà không đụng tới từ vựng đã thêm", () => {
    addVocabularyWord(1, { jp: "ねこ" });
    addGrammarNote(1, { title: "は" });

    expect(getLessonAdditions(1)).toEqual({
      vocabulary: [{ jp: "ねこ" }],
      grammarNotes: [{ title: "は" }]
    });
  });

  it("mục thêm của bài này không lẫn sang bài khác", () => {
    addVocabularyWord(1, { jp: "ねこ" });

    expect(getLessonAdditions(2).vocabulary).toEqual([]);
  });

  it("bắn sự kiện sau mỗi lần thêm", () => {
    expectEventFired(CHANGE_EVENT, () => addVocabularyWord(1, { jp: "ねこ" }));
    expectEventFired(CHANGE_EVENT, () => addGrammarNote(1, { title: "は" }));
  });
});

describe("sửa từ vựng và ngữ pháp đã thêm", () => {
  it("gộp patch vào đúng mục theo vị trí", () => {
    addVocabularyWord(1, { jp: "ねこ", meaning: "" });
    addVocabularyWord(1, { jp: "いぬ" });

    updateVocabularyWord(1, 0, { meaning: "con mèo" });

    expect(getLessonAdditions(1).vocabulary).toEqual([
      { jp: "ねこ", meaning: "con mèo" },
      { jp: "いぬ" }
    ]);
  });

  it("gộp patch vào đúng ngữ pháp theo vị trí", () => {
    addGrammarNote(1, { title: "は", example: "" });

    updateGrammarNote(1, 0, { example: "わたしは がくせいです。" });

    expect(getLessonAdditions(1).grammarNotes[0]).toEqual({
      title: "は",
      example: "わたしは がくせいです。"
    });
  });

  it("không làm gì khi vị trí nằm ngoài danh sách", () => {
    addVocabularyWord(1, { jp: "ねこ" });

    updateVocabularyWord(1, 5, { meaning: "sai" });

    expect(getLessonAdditions(1).vocabulary).toEqual([{ jp: "ねこ" }]);
  });

  it("bắn sự kiện sau mỗi lần sửa", () => {
    addVocabularyWord(1, { jp: "ねこ" });

    expectEventFired(CHANGE_EVENT, () => updateVocabularyWord(1, 0, { meaning: "con mèo" }));
  });
});

describe("xoá từ vựng và ngữ pháp đã thêm", () => {
  it("xoá đúng mục theo vị trí", () => {
    addVocabularyWord(1, { jp: "ねこ" });
    addVocabularyWord(1, { jp: "いぬ" });
    addVocabularyWord(1, { jp: "とり" });

    removeVocabularyWord(1, 1);

    expect(getLessonAdditions(1).vocabulary).toEqual([{ jp: "ねこ" }, { jp: "とり" }]);
  });

  it("xoá đúng ngữ pháp theo vị trí", () => {
    addGrammarNote(1, { title: "は" });
    addGrammarNote(1, { title: "の" });

    removeGrammarNote(1, 0);

    expect(getLessonAdditions(1).grammarNotes).toEqual([{ title: "の" }]);
  });

  it("không làm gì khi vị trí nằm ngoài danh sách", () => {
    addVocabularyWord(1, { jp: "ねこ" });

    removeVocabularyWord(1, 9);

    expect(getLessonAdditions(1).vocabulary).toEqual([{ jp: "ねこ" }]);
  });

  it("bắn sự kiện sau mỗi lần xoá", () => {
    addVocabularyWord(1, { jp: "ねこ" });

    expectEventFired(CHANGE_EVENT, () => removeVocabularyWord(1, 0));
  });
});

describe("subscribeLessonAdditions", () => {
  it("gọi callback khi có thay đổi rồi ngừng sau khi huỷ đăng ký", () => {
    const callback = vi.fn();
    const unsubscribe = subscribeLessonAdditions(callback);

    addVocabularyWord(1, { jp: "ねこ" });
    expect(callback).toHaveBeenCalledTimes(1);

    unsubscribe();
    addVocabularyWord(1, { jp: "いぬ" });
    window.dispatchEvent(new Event("storage"));

    expect(callback).toHaveBeenCalledTimes(1);
  });
});
