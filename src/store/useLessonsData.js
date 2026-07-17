import { useEffect, useMemo, useState } from "react";

import { staticVocabularyData } from "../data/vocabulary";
import { staticLessonRoadmaps } from "../data/lessonRoadmaps";
import { enrichVocabularyList } from "../data/vocabularyEnrichment";
import { getCustomLessons, subscribeCustomLessons } from "../services/customLessonsService";
import { getAllLessonAdditions, subscribeLessonAdditions } from "../services/lessonAdditionsService";
import { getAllLessonOverrides, subscribeLessonOverrides } from "../services/lessonOverridesService";

// Áp các bản chỉnh sửa (override) người dùng lưu cho từ vựng/ngữ pháp GỐC của
// một bài (bài có sẵn trong code hoặc bài tự thêm) lên đúng từ/ngữ pháp đó.
// Từ vựng được khớp theo "id" (ổn định trong 1 bài), ngữ pháp khớp theo vị
// trí trong mảng gốc (staticIndex) vì không có id riêng.
const applyVocabOverrides = (words = [], overridesByWordId = {}) =>
  words.map((word) => {
    const override = overridesByWordId[word.id];
    return override ? { ...word, ...override, isOverridden: true } : word;
  });

const applyGrammarOverrides = (notes = [], overridesByIndex = {}) =>
  notes.map((note, index) => {
    const withIndex = { ...note, staticIndex: index };
    const override = overridesByIndex[index];
    return override ? { ...withIndex, ...override, isOverridden: true } : withIndex;
  });

// Từ vựng / ngữ pháp người dùng thêm vào một bài có sẵn (qua nút "+ Thêm từ vựng"
// / "+ Thêm ngữ pháp" trên trang chi tiết bài) được đánh dấu isAdded + additionIndex
// để trang có thể hiển thị nút xóa/sửa riêng cho từng mục vừa thêm.
const mergeVocabulary = (baseWords = [], addedWords = []) => {
  if (addedWords.length === 0) {
    return baseWords;
  }

  const maxId = Math.max(0, ...baseWords.map((word) => Number(word.id) || 0));

  const normalizedAdditions = addedWords.map((word, index) => ({
    ...word,
    id: maxId + index + 1,
    sourceSlide: word.sourceSlide ?? maxId + index + 1,
    isAdded: true,
    additionIndex: index
  }));

  return [...baseWords, ...normalizedAdditions];
};

const mergeGrammarNotes = (baseNotes = [], addedNotes = []) =>
  addedNotes.length === 0
    ? baseNotes
    : [
        ...baseNotes,
        ...addedNotes.map((note, index) => ({ ...note, isAdded: true, additionIndex: index }))
      ];

const buildCustomVocabularyData = (customLessons, lessonAdditions, lessonOverrides) =>
  Object.fromEntries(
    customLessons.map((lesson) => {
      const overriddenWords = applyVocabOverrides(lesson.vocabulary || [], lessonOverrides[lesson.id]?.vocab || {});
      const additions = lessonAdditions[lesson.id]?.vocabulary || [];
      return [lesson.id, enrichVocabularyList(mergeVocabulary(overriddenWords, additions))];
    })
  );

const buildStaticVocabularyData = (lessonAdditions, lessonOverrides) =>
  Object.fromEntries(
    Object.entries(staticVocabularyData).map(([lessonId, words]) => {
      const overriddenWords = applyVocabOverrides(words, lessonOverrides[lessonId]?.vocab || {});
      const additions = lessonAdditions[lessonId]?.vocabulary || [];
      return [lessonId, enrichVocabularyList(mergeVocabulary(overriddenWords, additions))];
    })
  );

// Gộp dữ liệu tĩnh (file trong src/data) với các bản chỉnh sửa, các mục từ
// vựng/ngữ pháp người dùng tự thêm, và các bài học tự tạo trên giao diện (tất
// cả lưu ở localStorage). Hook này lắng nghe thay đổi để trang cập nhật ngay
// sau khi lưu, không cần tải lại trang.
export const useLessonsData = () => {
  const [customLessons, setCustomLessons] = useState(() => getCustomLessons());
  const [lessonAdditions, setLessonAdditions] = useState(() => getAllLessonAdditions());
  const [lessonOverrides, setLessonOverrides] = useState(() => getAllLessonOverrides());

  useEffect(() => {
    const unsubCustom = subscribeCustomLessons(() => setCustomLessons(getCustomLessons()));
    const unsubAdditions = subscribeLessonAdditions(() => setLessonAdditions(getAllLessonAdditions()));
    const unsubOverrides = subscribeLessonOverrides(() => setLessonOverrides(getAllLessonOverrides()));

    return () => {
      unsubCustom();
      unsubAdditions();
      unsubOverrides();
    };
  }, []);

  const vocabularyData = useMemo(
    () => ({
      ...buildStaticVocabularyData(lessonAdditions, lessonOverrides),
      ...buildCustomVocabularyData(customLessons, lessonAdditions, lessonOverrides)
    }),
    [customLessons, lessonAdditions, lessonOverrides]
  );

  const lessonRoadmaps = useMemo(() => {
    const staticRoadmaps = staticLessonRoadmaps.map((lesson) => {
      const overriddenGrammar = applyGrammarOverrides(lesson.grammarNotes, lessonOverrides[lesson.id]?.grammar || {});
      return {
        ...lesson,
        vocabulary: vocabularyData[lesson.id] || [],
        vocabExamples: (vocabularyData[lesson.id] || []).slice(0, 6),
        grammarNotes: mergeGrammarNotes(overriddenGrammar, lessonAdditions[lesson.id]?.grammarNotes || [])
      };
    });

    const customRoadmaps = customLessons.map((lesson) => {
      const overriddenGrammar = applyGrammarOverrides(
        lesson.grammarNotes || [],
        lessonOverrides[lesson.id]?.grammar || {}
      );
      return {
        ...lesson,
        isCustom: true,
        vocabulary: vocabularyData[lesson.id] || [],
        vocabExamples: (vocabularyData[lesson.id] || []).slice(0, 6),
        grammarNotes: mergeGrammarNotes(overriddenGrammar, lessonAdditions[lesson.id]?.grammarNotes || [])
      };
    });

    return [...staticRoadmaps, ...customRoadmaps].sort((a, b) => a.id - b.id);
  }, [customLessons, lessonAdditions, lessonOverrides, vocabularyData]);

  return { vocabularyData, lessonRoadmaps };
};

export const findLessonRoadmap = (lessonRoadmaps, lessonId) =>
  lessonRoadmaps.find((lesson) => String(lesson.id) === String(lessonId)) || null;
