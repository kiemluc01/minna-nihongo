import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { findLessonRoadmap, useLessonsData } from "./useLessonsData";
import { addCustomLesson } from "../services/customLessonsService";
import { addGrammarNote, addVocabularyWord } from "../services/lessonAdditionsService";
import { setGrammarOverride, setVocabOverride } from "../services/lessonOverridesService";

const CUSTOM_KEY = "n5_custom_lessons";

const customLesson = (overrides = {}) => ({
  id: 99,
  title: "Bài tự thêm",
  subtitle: "Mô tả",
  focus: "Trọng tâm",
  roadmapSteps: [],
  vocabulary: [{ id: 1, jp: "ねこ", meaning: "con mèo" }],
  grammarNotes: [{ title: "は", detail: "Trợ từ chủ đề", example: "これは ねこです。" }],
  ...overrides
});

const seedCustomLessons = (lessons) => localStorage.setItem(CUSTOM_KEY, JSON.stringify(lessons));

const render = () => renderHook(() => useLessonsData());

describe("useLessonsData — dữ liệu tĩnh", () => {
  it("trả về các bài có sẵn trong code, sắp theo id tăng dần", () => {
    const { result } = render();
    const ids = result.current.lessonRoadmaps.map((lesson) => lesson.id);

    expect(ids.length).toBeGreaterThan(0);
    expect(ids).toEqual([...ids].sort((a, b) => a - b));
    expect(ids).toContain(1);
  });

  it("gắn từ vựng đã tra nghĩa vào từng bài", () => {
    const { result } = render();
    const lesson = findLessonRoadmap(result.current.lessonRoadmaps, 1);

    expect(lesson.vocabulary.length).toBeGreaterThan(0);
    expect(lesson.vocabulary[0]).toHaveProperty("meaning");
  });

  it("vocabExamples là 6 từ đầu tiên của bài", () => {
    const { result } = render();
    const lesson = findLessonRoadmap(result.current.lessonRoadmaps, 1);

    expect(lesson.vocabExamples).toEqual(lesson.vocabulary.slice(0, 6));
    expect(lesson.vocabExamples.length).toBeLessThanOrEqual(6);
  });

  it("đánh staticIndex cho ngữ pháp gốc vì ngữ pháp không có id riêng", () => {
    const { result } = render();
    const lesson = findLessonRoadmap(result.current.lessonRoadmaps, 1);

    expect(lesson.grammarNotes.map((note) => note.staticIndex)).toEqual(
      lesson.grammarNotes.map((_, index) => index)
    );
  });

  it("vocabularyData dùng lessonId làm khoá", () => {
    const { result } = render();

    expect(result.current.vocabularyData[1]).toEqual(
      findLessonRoadmap(result.current.lessonRoadmaps, 1).vocabulary
    );
  });
});

describe("useLessonsData — bài tự thêm", () => {
  it("gộp bài tự thêm vào chung danh sách và đánh dấu isCustom", () => {
    seedCustomLessons([customLesson()]);

    const { result } = render();
    const lesson = findLessonRoadmap(result.current.lessonRoadmaps, 99);

    expect(lesson.isCustom).toBe(true);
    expect(lesson.title).toBe("Bài tự thêm");
  });

  it("sắp bài tự thêm chung với bài tĩnh theo id", () => {
    seedCustomLessons([customLesson({ id: 0 }), customLesson({ id: 99 })]);

    const { result } = render();
    const ids = result.current.lessonRoadmaps.map((lesson) => lesson.id);

    expect(ids[0]).toBe(0);
    expect(ids[ids.length - 1]).toBe(99);
  });

  it("tra nghĩa cho cả từ vựng của bài tự thêm", () => {
    seedCustomLessons([customLesson({ vocabulary: [{ id: 1, jp: "いぬ" }] })]);

    const { result } = render();
    const lesson = findLessonRoadmap(result.current.lessonRoadmaps, 99);

    expect(lesson.vocabulary[0].meaning).toBe("con chó");
  });
});

describe("useLessonsData — mục người dùng thêm vào một bài", () => {
  it("nối từ mới vào cuối bài, đánh dấu isAdded và cấp id tiếp theo", () => {
    addVocabularyWord(1, { jp: "ねこ", meaning: "con mèo" });

    const { result } = render();
    const lesson = findLessonRoadmap(result.current.lessonRoadmaps, 1);
    const added = lesson.vocabulary[lesson.vocabulary.length - 1];
    const baseMaxId = Math.max(
      ...lesson.vocabulary.filter((word) => !word.isAdded).map((word) => Number(word.id))
    );

    expect(added).toMatchObject({ jp: "ねこ", isAdded: true, additionIndex: 0 });
    expect(added.id).toBe(baseMaxId + 1);
    expect(added.sourceSlide).toBe(baseMaxId + 1);
  });

  it("cấp id tăng dần cho nhiều từ thêm liên tiếp", () => {
    addVocabularyWord(1, { jp: "ねこ" });
    addVocabularyWord(1, { jp: "いぬ" });

    const { result } = render();
    const added = findLessonRoadmap(result.current.lessonRoadmaps, 1).vocabulary.filter(
      (word) => word.isAdded
    );

    expect(added.map((word) => word.additionIndex)).toEqual([0, 1]);
    expect(added[1].id).toBe(added[0].id + 1);
  });

  it("nối ngữ pháp mới vào cuối bài và đánh dấu isAdded", () => {
    addGrammarNote(1, { title: "を", example: "ほんを よみます。" });

    const { result } = render();
    const notes = findLessonRoadmap(result.current.lessonRoadmaps, 1).grammarNotes;
    const added = notes[notes.length - 1];

    expect(added).toMatchObject({ title: "を", isAdded: true, additionIndex: 0 });
  });

  it("mục thêm cho bài này không lẫn sang bài khác", () => {
    addVocabularyWord(1, { jp: "ねこ" });

    const { result } = render();
    const lesson2 = findLessonRoadmap(result.current.lessonRoadmaps, 2);

    expect(lesson2.vocabulary.some((word) => word.isAdded)).toBe(false);
  });
});

describe("useLessonsData — bản chỉnh sửa dữ liệu gốc", () => {
  it("áp bản sửa từ vựng theo id của từ và đánh dấu isOverridden", () => {
    setVocabOverride(1, 1, { meaning: "nghĩa đã sửa" });

    const { result } = render();
    const word = findLessonRoadmap(result.current.lessonRoadmaps, 1).vocabulary.find(
      (item) => item.id === 1
    );

    expect(word.meaning).toBe("nghĩa đã sửa");
    expect(word.isOverridden).toBe(true);
  });

  it("không đụng tới các từ không được sửa", () => {
    setVocabOverride(1, 1, { meaning: "nghĩa đã sửa" });

    const { result } = render();
    const others = findLessonRoadmap(result.current.lessonRoadmaps, 1).vocabulary.filter(
      (item) => item.id !== 1
    );

    expect(others.every((word) => word.isOverridden === undefined)).toBe(true);
  });

  it("áp bản sửa ngữ pháp theo vị trí trong mảng gốc", () => {
    setGrammarOverride(1, 0, { detail: "giải thích đã sửa" });

    const { result } = render();
    const note = findLessonRoadmap(result.current.lessonRoadmaps, 1).grammarNotes[0];

    expect(note.detail).toBe("giải thích đã sửa");
    expect(note.isOverridden).toBe(true);
    expect(note.staticIndex).toBe(0);
  });

  it("áp được bản sửa cho cả bài tự thêm", () => {
    seedCustomLessons([customLesson()]);
    setVocabOverride(99, 1, { meaning: "nghĩa đã sửa" });

    const { result } = render();
    const lesson = findLessonRoadmap(result.current.lessonRoadmaps, 99);

    expect(lesson.vocabulary[0]).toMatchObject({ meaning: "nghĩa đã sửa", isOverridden: true });
  });
});

describe("useLessonsData — đồng bộ khi dữ liệu đổi", () => {
  it("cập nhật ngay khi có bài mới được lưu, không cần tải lại trang", () => {
    const { result } = render();
    const before = result.current.lessonRoadmaps.length;

    act(() => {
      addCustomLesson(customLesson());
    });

    expect(result.current.lessonRoadmaps).toHaveLength(before + 1);
    expect(findLessonRoadmap(result.current.lessonRoadmaps, 99)).not.toBeNull();
  });

  it("cập nhật ngay khi có từ vựng được thêm vào bài có sẵn", () => {
    const { result } = render();
    const before = findLessonRoadmap(result.current.lessonRoadmaps, 1).vocabulary.length;

    act(() => {
      addVocabularyWord(1, { jp: "ねこ" });
    });

    expect(findLessonRoadmap(result.current.lessonRoadmaps, 1).vocabulary).toHaveLength(before + 1);
  });

  it("cập nhật ngay khi có bản sửa mới", () => {
    const { result } = render();

    act(() => {
      setVocabOverride(1, 1, { meaning: "nghĩa đã sửa" });
    });

    expect(
      findLessonRoadmap(result.current.lessonRoadmaps, 1).vocabulary.find((word) => word.id === 1)
        .meaning
    ).toBe("nghĩa đã sửa");
  });

  it("gỡ mọi listener khi component bị tháo", () => {
    const { result, unmount } = render();
    const before = result.current.lessonRoadmaps.length;

    unmount();

    expect(() => addCustomLesson(customLesson())).not.toThrow();
    expect(result.current.lessonRoadmaps).toHaveLength(before);
  });
});

describe("findLessonRoadmap", () => {
  const roadmaps = [{ id: 1 }, { id: 2 }];

  it("khớp id dù truyền vào là số hay chuỗi", () => {
    expect(findLessonRoadmap(roadmaps, 2)).toEqual({ id: 2 });
    expect(findLessonRoadmap(roadmaps, "2")).toEqual({ id: 2 });
  });

  it("trả về null khi không tìm thấy bài", () => {
    expect(findLessonRoadmap(roadmaps, 99)).toBeNull();
    expect(findLessonRoadmap(roadmaps, undefined)).toBeNull();
    expect(findLessonRoadmap([], 1)).toBeNull();
  });
});
