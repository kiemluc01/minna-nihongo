// Sinh đề kiểm tra từ vựng + ngữ pháp trong phạm vi bài học được chọn. Câu hỏi
// từ vựng và câu hỏi ngữ pháp là hai loại TÁCH BIỆT (mỗi câu chỉ kiểm tra một
// thứ), một đề có thể có cả hai loại nhưng không gộp chung vào một câu. Vì
// lessonRoadmaps (bài có sẵn + bài tự thêm) đã gộp sẵn từ vựng/ngữ pháp của
// mọi bài, hàm này tự động áp dụng cho bài mới hoặc ngữ pháp mới thêm sau này
// mà không cần sửa code.
//
// Mỗi mẫu ngữ pháp và mỗi từ vựng chỉ xuất hiện tối đa 1 lần trong một đề, nên
// số câu tối đa của mỗi loại bị giới hạn bởi số mục khác nhau có trong phạm vi
// đã chọn.

import { hasKanji } from "../utils/vocabulary";

// Chuyển giá trị nhập tay (chuỗi, có thể chứa nhiều từ cách nhau bằng dấu
// phẩy) thành field "blank" đúng định dạng: rỗng, 1 chuỗi, hoặc mảng nhiều
// chuỗi. Dùng khi lưu ngữ pháp từ các form thêm bài / thêm ngữ pháp.
export const parseBlankField = (raw = "") => {
  const parts = raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return "";
  }

  return parts.length === 1 ? parts[0] : parts;
};

export const shuffle = (list) => {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const normalizeAnswer = (text = "") =>
  text
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

const splitSynonyms = (meaning = "") =>
  meaning
    .split(/[/,;、]/)
    .map((part) => normalizeAnswer(part))
    .filter(Boolean);

export const isVocabAnswerCorrect = (userInput, correctMeaning) => {
  const normalizedInput = normalizeAnswer(userInput);
  if (!normalizedInput) {
    return false;
  }
  return splitSynonyms(correctMeaning).some(
    (synonym) => synonym === normalizedInput || synonym.includes(normalizedInput) || normalizedInput.includes(synonym)
  );
};

export const isGrammarAnswerCorrect = (userInput, correctBlank) =>
  normalizeAnswer(userInput) === normalizeAnswer(correctBlank);

// note.blank có thể là một chuỗi (một từ cố định) hoặc một mảng nhiều từ, vd
// ["から", "まで"]. Khi là mảng, mỗi lần tạo đề sẽ random chọn 1 từ trong đó để
// đục lỗ; các từ còn lại trong câu ví dụ vẫn giữ nguyên (điền sẵn) như bình
// thường vì chúng vốn đã có mặt trong câu.
const resolveBlank = (note) => {
  const candidates = Array.isArray(note.blank)
    ? note.blank
    : [note.blank || note.title];

  const validCandidates = candidates.filter(
    (candidate) => candidate && note.example && note.example.includes(candidate)
  );

  if (validCandidates.length === 0) {
    return null;
  }

  return validCandidates[Math.floor(Math.random() * validCandidates.length)];
};

export const collectExamScope = (lessonRoadmaps, lessonIds) => {
  const idSet = new Set(lessonIds.map(String));
  const scopedLessons = lessonRoadmaps.filter((lesson) => idSet.has(String(lesson.id)));

  const vocabulary = scopedLessons.flatMap((lesson) =>
    (lesson.vocabulary || [])
      .filter((word) => word.jp && word.meaning)
      .map((word) => ({
        jp: word.jp,
        meaning: word.meaning,
        reading: word.reading,
        katakana: word.katakana,
        lessonId: lesson.id
      }))
  );

  const grammarNotes = scopedLessons.flatMap((lesson) =>
    (lesson.grammarNotes || [])
      .map((note) => ({ ...note, blankToken: resolveBlank(note), lessonId: lesson.id }))
      .filter((note) => note.blankToken)
  );

  return { vocabulary, grammarNotes };
};

const pickDistractors = (primaryPool, fallbackPool, exclude, count) => {
  const dedupe = (list) => [...new Set(list.filter((value) => value && value !== exclude))];

  const picked = shuffle(dedupe(primaryPool)).slice(0, count);

  if (picked.length < count) {
    const more = shuffle(dedupe(fallbackPool).filter((value) => !picked.includes(value)));
    picked.push(...more.slice(0, count - picked.length));
  }

  return picked;
};

// Nếu từ có chữ Hán (kanji), ghi chú thêm cách đọc trong ngoặc, vd "先生 (せんせい)",
// vì câu hỏi này kiểm tra nghĩa của từ chứ không kiểm tra cách đọc kanji. Nếu
// từ có dạng katakana riêng (vd từ mượn được nhập bằng hiragana きゃんぷ nhưng
// có ghi chú katakana キャンプ) thì cũng ghi chú thêm trong ngoặc tương tự.
const formatVocabPrompt = (word) => {
  if (hasKanji(word.jp) && word.reading && word.reading !== word.jp && !hasKanji(word.reading)) {
    return `${word.jp} (${word.reading})`;
  }
  if (word.katakana && word.katakana !== word.jp) {
    return `${word.jp} (${word.katakana})`;
  }
  return word.jp;
};

const buildVocabQuestion = (word, format, scopeMeanings, globalMeanings) => {
  const prompt = formatVocabPrompt(word);

  const base = { kind: "vocab", lessonId: word.lessonId, prompt, speakText: word.jp };

  if (format === "fill") {
    return { ...base, type: "fill", answer: word.meaning };
  }

  const distractors = pickDistractors(scopeMeanings, globalMeanings, word.meaning, 3);
  return {
    ...base,
    type: "choice",
    answer: word.meaning,
    options: shuffle([word.meaning, ...distractors])
  };
};

// Trợ từ ngắn (で, に, は...) có thể trùng với ký tự đầu của một từ đứng trước
// trong câu (vd "で" trong "でんしゃで"), nên đục lỗ ở lần xuất hiện CUỐI cùng
// thay vì đầu tiên để luôn trúng đúng trợ từ, không cắt nhầm vào giữa từ khác.
const blankOutToken = (example, token) => {
  const index = example.lastIndexOf(token);
  if (index === -1) {
    return example;
  }
  return `${example.slice(0, index)}_____${example.slice(index + token.length)}`;
};

const buildGrammarQuestion = (note, format, scopeTitles, globalTitles) => {
  const blankedExample = blankOutToken(note.example, note.blankToken);
  const base = { kind: "grammar", lessonId: note.lessonId, prompt: blankedExample, detail: note.detail };

  if (format === "fill") {
    return { ...base, type: "fill", answer: note.blankToken };
  }

  const distractors = pickDistractors(scopeTitles, globalTitles, note.blankToken, 3);
  return {
    ...base,
    type: "choice",
    answer: note.blankToken,
    options: shuffle([note.blankToken, ...distractors])
  };
};

export const generateGrammarExam = ({ lessonRoadmaps, lessonIds, format = "choice", vocabCount, grammarCount }) => {
  const { vocabulary, grammarNotes } = collectExamScope(lessonRoadmaps, lessonIds);

  // Mỗi từ / mỗi mẫu ngữ pháp chỉ dùng tối đa 1 lần/đề.
  const maxVocabQuestions = vocabulary.length;
  const maxGrammarQuestions = grammarNotes.length;

  if (vocabulary.length === 0 && grammarNotes.length === 0) {
    return {
      questions: [],
      vocabularyCount: 0,
      grammarCount: 0,
      maxVocabQuestions: 0,
      maxGrammarQuestions: 0
    };
  }

  const { vocabulary: allVocabulary, grammarNotes: allGrammarNotes } = collectExamScope(
    lessonRoadmaps,
    lessonRoadmaps.map((lesson) => lesson.id)
  );
  const globalMeanings = allVocabulary.map((word) => word.meaning);
  const globalBlanks = allGrammarNotes.map((note) => note.blankToken);
  const scopeMeanings = vocabulary.map((word) => word.meaning);
  const scopeBlanks = grammarNotes.map((note) => note.blankToken);

  const vocabLimit = Math.min(vocabCount ?? maxVocabQuestions, maxVocabQuestions);
  const grammarLimit = Math.min(grammarCount ?? maxGrammarQuestions, maxGrammarQuestions);

  const selectedVocab = shuffle(vocabulary).slice(0, vocabLimit);
  const selectedGrammar = shuffle(grammarNotes).slice(0, grammarLimit);

  const vocabQuestions = selectedVocab.map((word, index) => ({
    id: `v${index}-${word.jp}`,
    ...buildVocabQuestion(word, format, scopeMeanings, globalMeanings)
  }));

  const grammarQuestions = selectedGrammar.map((note, index) => ({
    id: `g${index}-${note.blankToken}`,
    ...buildGrammarQuestion(note, format, scopeBlanks, globalBlanks)
  }));

  // Trộn ngẫu nhiên hai loại câu hỏi vào chung một đề, nhưng mỗi câu vẫn chỉ
  // thuộc đúng một loại (kind: "vocab" hoặc "grammar"), không gộp chung.
  const questions = shuffle([...vocabQuestions, ...grammarQuestions]);

  return {
    questions,
    vocabularyCount: vocabulary.length,
    grammarCount: grammarNotes.length,
    maxVocabQuestions,
    maxGrammarQuestions
  };
};
