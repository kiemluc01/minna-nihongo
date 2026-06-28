import { enrichVocabularyList } from "./vocabularyEnrichment";

// Mỗi bài học nằm trong file riêng ở "./vocabulary/lessonN.js" (N là số bài).
// Muốn thêm bài mới chỉ cần tạo file mới theo đúng format, không cần sửa file này.
const lessonModules = import.meta.glob("./vocabulary/lesson*.js", { eager: true });

const parseLessonId = (path) => {
  const match = path.match(/lesson(\d+)\.js$/);
  return match ? Number(match[1]) : null;
};

export const staticVocabularyData = Object.fromEntries(
  Object.entries(lessonModules)
    .map(([path, module]) => [parseLessonId(path), module.default])
    .filter(([lessonId, words]) => lessonId !== null && Array.isArray(words))
    .sort(([a], [b]) => a - b)
    .map(([lessonId, words]) => [lessonId, enrichVocabularyList(words)])
);
