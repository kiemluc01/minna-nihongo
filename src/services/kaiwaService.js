// Lưu hội thoại (kaiwa) của từng bài học trong localStorage. Mỗi bài có tối
// đa một hội thoại, gồm danh sách người nói (speakers) và các câu thoại
// (lines), mỗi câu gắn với một speakerId.
const STORAGE_KEY = "n5_lesson_kaiwa";
const CHANGE_EVENT = "n5-lesson-kaiwa-changed";

const readAll = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
};

const writeAll = (all) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  window.dispatchEvent(new Event(CHANGE_EVENT));
};

export const getKaiwa = (lessonId) => {
  const all = readAll();
  return all[String(lessonId)] || null;
};

export const saveKaiwa = (lessonId, kaiwa) => {
  const all = readAll();
  all[String(lessonId)] = kaiwa;
  writeAll(all);
};

export const deleteKaiwa = (lessonId) => {
  const all = readAll();
  delete all[String(lessonId)];
  writeAll(all);
};

export const subscribeKaiwa = (callback) => {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
};
