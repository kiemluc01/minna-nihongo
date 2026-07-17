const STORAGE_KEY = "n5_lesson_additions";
const CHANGE_EVENT = "n5-lesson-additions-changed";

const EMPTY = { vocabulary: [], grammarNotes: [] };

const readAll = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
};

const writeAll = (additions) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(additions));
  window.dispatchEvent(new Event(CHANGE_EVENT));
};

export const getAllLessonAdditions = () => readAll();

export const getLessonAdditions = (lessonId) => {
  const all = readAll();
  return all[String(lessonId)] || EMPTY;
};

export const addVocabularyWord = (lessonId, word) => {
  const all = readAll();
  const key = String(lessonId);
  const current = all[key] || EMPTY;
  all[key] = { ...current, vocabulary: [...current.vocabulary, word] };
  writeAll(all);
};

export const addGrammarNote = (lessonId, note) => {
  const all = readAll();
  const key = String(lessonId);
  const current = all[key] || EMPTY;
  all[key] = { ...current, grammarNotes: [...current.grammarNotes, note] };
  writeAll(all);
};

export const updateVocabularyWord = (lessonId, index, patch) => {
  const all = readAll();
  const key = String(lessonId);
  const current = all[key] || EMPTY;
  all[key] = {
    ...current,
    vocabulary: current.vocabulary.map((word, i) => (i === index ? { ...word, ...patch } : word))
  };
  writeAll(all);
};

export const updateGrammarNote = (lessonId, index, patch) => {
  const all = readAll();
  const key = String(lessonId);
  const current = all[key] || EMPTY;
  all[key] = {
    ...current,
    grammarNotes: current.grammarNotes.map((note, i) => (i === index ? { ...note, ...patch } : note))
  };
  writeAll(all);
};

export const removeVocabularyWord = (lessonId, index) => {
  const all = readAll();
  const key = String(lessonId);
  const current = all[key] || EMPTY;
  all[key] = { ...current, vocabulary: current.vocabulary.filter((_, i) => i !== index) };
  writeAll(all);
};

export const removeGrammarNote = (lessonId, index) => {
  const all = readAll();
  const key = String(lessonId);
  const current = all[key] || EMPTY;
  all[key] = { ...current, grammarNotes: current.grammarNotes.filter((_, i) => i !== index) };
  writeAll(all);
};

export const subscribeLessonAdditions = (callback) => {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
};
