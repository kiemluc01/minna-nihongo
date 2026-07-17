// Lưu các bản chỉnh sửa cho từ vựng / ngữ pháp GỐC của một bài (bài có sẵn
// trong code hoặc bài tự thêm) — vì dữ liệu gốc không thể ghi đè trực tiếp từ
// trình duyệt, mọi chỉnh sửa được lưu dưới dạng "override" (bản vá) theo
// lessonId, rồi áp vào từ/ngữ pháp gốc tương ứng khi hiển thị (xem
// store/useLessonsData.js). Điều này giúp sửa lỗi dữ liệu (nghĩa sai, ví dụ
// ngữ pháp không khớp từ đục lỗ...) để đề kiểm tra được tạo đúng.
const STORAGE_KEY = "n5_lesson_overrides";
const CHANGE_EVENT = "n5-lesson-overrides-changed";

const EMPTY = { vocab: {}, grammar: {} };

const readAll = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
};

const writeAll = (overrides) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  window.dispatchEvent(new Event(CHANGE_EVENT));
};

export const getAllLessonOverrides = () => readAll();

export const getLessonOverrides = (lessonId) => {
  const all = readAll();
  return all[String(lessonId)] || EMPTY;
};

export const setVocabOverride = (lessonId, wordId, patch) => {
  const all = readAll();
  const key = String(lessonId);
  const current = all[key] || EMPTY;
  all[key] = {
    ...current,
    vocab: { ...current.vocab, [wordId]: { ...current.vocab[wordId], ...patch } }
  };
  writeAll(all);
};

export const setGrammarOverride = (lessonId, index, patch) => {
  const all = readAll();
  const key = String(lessonId);
  const current = all[key] || EMPTY;
  all[key] = {
    ...current,
    grammar: { ...current.grammar, [index]: { ...current.grammar[index], ...patch } }
  };
  writeAll(all);
};

export const clearVocabOverride = (lessonId, wordId) => {
  const all = readAll();
  const key = String(lessonId);
  const current = all[key] || EMPTY;
  const nextVocab = { ...current.vocab };
  delete nextVocab[wordId];
  all[key] = { ...current, vocab: nextVocab };
  writeAll(all);
};

export const clearGrammarOverride = (lessonId, index) => {
  const all = readAll();
  const key = String(lessonId);
  const current = all[key] || EMPTY;
  const nextGrammar = { ...current.grammar };
  delete nextGrammar[index];
  all[key] = { ...current, grammar: nextGrammar };
  writeAll(all);
};

export const subscribeLessonOverrides = (callback) => {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
};
