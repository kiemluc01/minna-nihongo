const STORAGE_KEY = "n5_custom_lessons";
const CHANGE_EVENT = "n5-custom-lessons-changed";

const readAll = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeAll = (lessons) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lessons));
  window.dispatchEvent(new Event(CHANGE_EVENT));
};

export const getCustomLessons = () => readAll();

export const getNextCustomLessonId = (staticMaxId = 0) => {
  const customIds = readAll().map((lesson) => lesson.id);
  return Math.max(staticMaxId, 0, ...customIds) + 1;
};

export const addCustomLesson = (lesson) => {
  const lessons = readAll();
  lessons.push(lesson);
  writeAll(lessons);
  return lesson;
};

export const deleteCustomLesson = (id) => {
  writeAll(readAll().filter((lesson) => String(lesson.id) !== String(id)));
};

export const subscribeCustomLessons = (callback) => {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
};
