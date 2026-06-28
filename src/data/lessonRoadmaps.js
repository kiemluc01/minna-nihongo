import { staticVocabularyData } from "./vocabulary";

// Mỗi bài học nằm trong file riêng ở "./roadmaps/lessonN.js" (N là số bài).
// Muốn thêm bài mới chỉ cần tạo file mới theo đúng format, không cần sửa file này
// (hoặc dùng trang "Thêm bài mới" trên giao diện để lưu trực tiếp vào trình duyệt).
const roadmapModules = import.meta.glob("./roadmaps/lesson*.js", { eager: true });

const parseLessonId = (path) => {
  const match = path.match(/lesson(\d+)\.js$/);
  return match ? Number(match[1]) : null;
};

export const staticLessonRoadmaps = Object.entries(roadmapModules)
  .map(([path, module]) => ({ id: parseLessonId(path), ...module.default }))
  .filter((lesson) => lesson.id !== null && staticVocabularyData[lesson.id])
  .sort((a, b) => a.id - b.id)
  .map((lesson) => ({
    ...lesson,
    vocabExamples: staticVocabularyData[lesson.id].slice(0, 6),
    vocabulary: staticVocabularyData[lesson.id]
  }));
