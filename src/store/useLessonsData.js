import { useEffect, useMemo, useState } from "react";

import { staticVocabularyData } from "../data/vocabulary";
import { staticLessonRoadmaps } from "../data/lessonRoadmaps";
import { enrichVocabularyList } from "../data/vocabularyEnrichment";
import { getCustomLessons, subscribeCustomLessons } from "../services/customLessonsService";
import { getAllLessonAdditions, subscribeLessonAdditions } from "../services/lessonAdditionsService";

// Từ vựng / ngữ pháp người dùng thêm vào một bài có sẵn (qua nút "+ Thêm từ vựng"
// / "+ Thêm ngữ pháp" trên trang chi tiết bài) được đánh dấu isAdded + additionIndex
// để trang có thể hiển thị nút xóa riêng cho từng mục vừa thêm.
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

const buildCustomVocabularyData = (customLessons, lessonAdditions) =>
  Object.fromEntries(
    customLessons.map((lesson) => {
      const additions = lessonAdditions[lesson.id]?.vocabulary || [];
      return [lesson.id, enrichVocabularyList(mergeVocabulary(lesson.vocabulary || [], additions))];
    })
  );

const buildStaticVocabularyData = (lessonAdditions) =>
  Object.fromEntries(
    Object.entries(staticVocabularyData).map(([lessonId, words]) => {
      const additions = lessonAdditions[lessonId]?.vocabulary || [];
      return [lessonId, additions.length === 0 ? words : enrichVocabularyList(mergeVocabulary(words, additions))];
    })
  );

// Gộp dữ liệu tĩnh (file trong src/data) với các bài học và các mục từ
// vựng/ngữ pháp người dùng tự thêm trên giao diện (lưu ở localStorage).
// Hook này lắng nghe thay đổi để trang cập nhật ngay sau khi lưu, không
// cần tải lại trang.
export const useLessonsData = () => {
  const [customLessons, setCustomLessons] = useState(() => getCustomLessons());
  const [lessonAdditions, setLessonAdditions] = useState(() => getAllLessonAdditions());

  useEffect(() => {
    const unsubCustom = subscribeCustomLessons(() => setCustomLessons(getCustomLessons()));
    const unsubAdditions = subscribeLessonAdditions(() => setLessonAdditions(getAllLessonAdditions()));

    return () => {
      unsubCustom();
      unsubAdditions();
    };
  }, []);

  const vocabularyData = useMemo(
    () => ({
      ...buildStaticVocabularyData(lessonAdditions),
      ...buildCustomVocabularyData(customLessons, lessonAdditions)
    }),
    [customLessons, lessonAdditions]
  );

  const lessonRoadmaps = useMemo(() => {
    const staticRoadmaps = staticLessonRoadmaps.map((lesson) => ({
      ...lesson,
      vocabulary: vocabularyData[lesson.id] || [],
      vocabExamples: (vocabularyData[lesson.id] || []).slice(0, 6),
      grammarNotes: mergeGrammarNotes(lesson.grammarNotes, lessonAdditions[lesson.id]?.grammarNotes || [])
    }));

    const customRoadmaps = customLessons.map((lesson) => ({
      ...lesson,
      isCustom: true,
      vocabulary: vocabularyData[lesson.id] || [],
      vocabExamples: (vocabularyData[lesson.id] || []).slice(0, 6),
      grammarNotes: mergeGrammarNotes(lesson.grammarNotes || [], lessonAdditions[lesson.id]?.grammarNotes || [])
    }));

    return [...staticRoadmaps, ...customRoadmaps].sort((a, b) => a.id - b.id);
  }, [customLessons, lessonAdditions, vocabularyData]);

  return { vocabularyData, lessonRoadmaps };
};

export const findLessonRoadmap = (lessonRoadmaps, lessonId) =>
  lessonRoadmaps.find((lesson) => String(lesson.id) === String(lessonId)) || null;
