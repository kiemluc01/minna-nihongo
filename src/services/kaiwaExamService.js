// Sinh bài tập đục lỗ ngẫu nhiên từ một cuộc hội thoại (kaiwa): mỗi lần tạo,
// chọn ngẫu nhiên MỘT câu thoại rồi đục lỗ hoặc một TỪ trong câu đó, hoặc CẢ
// CÂU, còn lại nguyên văn để giữ ngữ cảnh hội thoại. Người học vừa nghe cả
// đoạn (có thể tạm dừng/tiếp tục) vừa điền/chọn đáp án.
import { shuffle } from "./grammarExamService";

const TRAILING_PUNCT_RE = /[。！？、,.!?]+$/;

const tokenizeLine = (text = "") =>
  text
    .split(/[\s\u3000]+/)
    .map((token) => token.replace(TRAILING_PUNCT_RE, ""))
    .filter(Boolean);

const blankOutSubstring = (text, token) => {
  const index = text.lastIndexOf(token);
  if (index === -1) {
    return null;
  }
  return `${text.slice(0, index)}_____${text.slice(index + token.length)}`;
};

const normalizeAnswer = (text = "") =>
  text
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

export const isKaiwaAnswerCorrect = (userInput, correctAnswer) =>
  normalizeAnswer(userInput) === normalizeAnswer(correctAnswer);

const pickDistractors = (pool, exclude, count) => {
  const unique = [...new Set(pool.filter((value) => value && value !== exclude))];
  return shuffle(unique).slice(0, count);
};

const speakerNameOf = (kaiwa, speakerId) =>
  kaiwa.speakers.find((speaker) => speaker.id === speakerId)?.name || "?";

// Trả về một bài tập (không phải danh sách) gồm toàn bộ hội thoại, trong đó
// đúng một câu (hoặc một từ trong câu đó) bị đục lỗ. Gọi lại hàm này để random
// ra bài tập khác (mỗi lần một câu/từ khác nhau).
export const generateKaiwaExercise = ({ kaiwa, format = "choice" }) => {
  const validLines = (kaiwa?.lines || []).filter((line) => line.text && line.text.trim());

  if (validLines.length === 0) {
    return null;
  }

  const targetPos = Math.floor(Math.random() * validLines.length);
  const targetLine = validLines[targetPos];
  const tokens = tokenizeLine(targetLine.text);
  const canBlankWord = tokens.length > 1;
  const blankKind = canBlankWord && Math.random() < 0.5 ? "word" : "sentence";

  const allTokens = validLines.flatMap((line) => tokenizeLine(line.text));
  const allLineTexts = validLines.map((line) => line.text);

  let answer;
  let blankedText;

  if (blankKind === "word") {
    const token = tokens[Math.floor(Math.random() * tokens.length)];
    blankedText = blankOutSubstring(targetLine.text, token);
    answer = token;
  } else {
    blankedText = "_____";
    answer = targetLine.text;
  }

  // Nếu vì lý do gì đó không đục lỗ được (vd token không tìm thấy), rơi về
  // đục cả câu để luôn có bài tập hợp lệ.
  if (!blankedText) {
    blankedText = "_____";
    answer = targetLine.text;
  }

  const displayLines = validLines.map((line, index) => ({
    id: line.id,
    speakerName: speakerNameOf(kaiwa, line.speakerId),
    text: index === targetPos ? blankedText : line.text,
    isBlank: index === targetPos
  }));

  const audioTexts = validLines.map((line) => line.text);

  const base = {
    lines: displayLines,
    audioTexts,
    kind: blankKind,
    answer,
    speakerName: speakerNameOf(kaiwa, targetLine.speakerId)
  };

  if (format === "fill") {
    return { ...base, type: "fill" };
  }

  const distractorPool = blankKind === "word" ? allTokens : allLineTexts;
  const distractors = pickDistractors(distractorPool, answer, 3);

  return { ...base, type: "choice", options: shuffle([answer, ...distractors]) };
};
