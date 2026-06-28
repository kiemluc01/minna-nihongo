import { useEffect, useMemo, useState } from "react";

import { staticVocabularyData } from "../data/vocabulary";
import { staticLessonRoadmaps } from "../data/lessonRoadmaps";
import { enrichVocabularyList } from "../data/vocabularyEnrichment";
import { getCustomLessons, subscribeCustomLessons } from "../services/customLessonsService";

const buildCustomVocabularyData = (customLessons) =>
  Object.fromEntries(
    customLessons.map((lesson) => [lesson.id, enrichVocabularyList(lesson.vocabulary || [])])
  );

// Gộp dữ liệu tĩnh (file trong src/data) với các bài học người dùng tự thêm
// trên giao diện (lưu ở localStorage). Hook này lắng nghe thay đổi để trang
// hiển thị bài mới ngay sau khi lưu, không cần tải lại trang.
export const useLessonsData = () => {
  const [customLessons, setCustomLessons] = useState(() => getCustomLessons());

  useEffect(() => {
    const refresh = () => setCustomLessons(getCustomLessons());
    return subscribeCustomLessons(refresh);
  }, []);

  const vocabularyData = useMemo(
    () => ({
      ...staticVocabularyData,
      ...buildCustomVocabularyData(customLessons)
    }),
    [customLessons]
  );

  const lessonRoadmaps = useMemo(() => {
    const customRoadmaps = customLessons.map((lesson) => ({
      ...lesson,
      isCustom: true,
      vocabExamples: (vocabularyData[lesson.id] || []).slice(0, 6),
      vocabulary: vocabularyData[lesson.id] || []
    }));

    return [...staticLessonRoadmaps, ...customRoadmaps].sort((a, b) => a.id - b.id);
  }, [customLessons, vocabularyData]);

  return { vocabularyData, lessonRoadmaps };
};

export const findLessonRoadmap = (lessonRoadmaps, lessonId) =>
  lessonRoadmaps.find((lesson) => String(lesson.id) === String(lessonId)) || null;
