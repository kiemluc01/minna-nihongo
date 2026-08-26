import { describe, expect, it } from "vitest";

import { generateKaiwaExercise, isKaiwaAnswerCorrect } from "./kaiwaExamService";
import { stubRandom, stubRandomZero } from "../test/helpers/random";

const makeKaiwa = (lines, speakers = [{ id: "a", name: "Aさん" }, { id: "b", name: "Bさん" }]) => ({
  speakers,
  lines
});

// Hội thoại có dấu cách nên tokenize được thành nhiều từ → có thể đục lỗ theo TỪ.
const spacedKaiwa = () =>
  makeKaiwa([
    { id: "l1", speakerId: "a", text: "おはよう ございます" },
    { id: "l2", speakerId: "b", text: "はい、 そうです。" }
  ]);

// Hội thoại không có dấu cách → mỗi câu chỉ 1 token → luôn đục CẢ CÂU.
const soloTokenKaiwa = () =>
  makeKaiwa([
    { id: "l1", speakerId: "a", text: "おはようございます。" },
    { id: "l2", speakerId: "b", text: "こんにちは。" }
  ]);

describe("isKaiwaAnswerCorrect", () => {
  it("chấp nhận đáp án trùng khớp", () => {
    expect(isKaiwaAnswerCorrect("そうです", "そうです")).toBe(true);
  });

  it("bỏ qua khoảng trắng thừa và không phân biệt hoa thường", () => {
    expect(isKaiwaAnswerCorrect("  Hai   desu  ", "hai desu")).toBe(true);
  });

  it("chuẩn hoá NFKC nên chữ toàn rộng vẫn khớp", () => {
    expect(isKaiwaAnswerCorrect("ｈａｉ", "hai")).toBe(true);
  });

  it("từ chối đáp án khác và đáp án bỏ trống", () => {
    expect(isKaiwaAnswerCorrect("いいえ", "はい")).toBe(false);
    expect(isKaiwaAnswerCorrect("", "はい")).toBe(false);
    expect(isKaiwaAnswerCorrect(undefined, "はい")).toBe(false);
  });

  it("khớp trọn vẹn, không chấp nhận một phần", () => {
    expect(isKaiwaAnswerCorrect("はい", "はいそうです")).toBe(false);
  });
});

describe("generateKaiwaExercise — trường hợp không tạo được bài", () => {
  it("trả về null khi không có hội thoại", () => {
    expect(generateKaiwaExercise({ kaiwa: null })).toBeNull();
    expect(generateKaiwaExercise({ kaiwa: {} })).toBeNull();
    expect(generateKaiwaExercise({ kaiwa: makeKaiwa([]) })).toBeNull();
  });

  it("trả về null khi mọi câu thoại đều trống", () => {
    const kaiwa = makeKaiwa([
      { id: "l1", speakerId: "a", text: "" },
      { id: "l2", speakerId: "b", text: "   " }
    ]);

    expect(generateKaiwaExercise({ kaiwa })).toBeNull();
  });
});

describe("generateKaiwaExercise — cấu trúc bài tập", () => {
  it("giữ nguyên toàn bộ hội thoại và chỉ đục lỗ đúng một câu", () => {
    const exercise = generateKaiwaExercise({ kaiwa: spacedKaiwa() });

    expect(exercise.lines).toHaveLength(2);
    expect(exercise.lines.filter((line) => line.isBlank)).toHaveLength(1);
  });

  it("bỏ qua câu trống nhưng vẫn giữ các câu còn lại", () => {
    const kaiwa = makeKaiwa([
      { id: "l1", speakerId: "a", text: "おはよう" },
      { id: "l2", speakerId: "b", text: "   " },
      { id: "l3", speakerId: "a", text: "こんにちは" }
    ]);

    const exercise = generateKaiwaExercise({ kaiwa });

    expect(exercise.lines.map((line) => line.id)).toEqual(["l1", "l3"]);
  });

  it("tra đúng tên người nói theo speakerId", () => {
    const exercise = generateKaiwaExercise({ kaiwa: spacedKaiwa() });

    expect(exercise.lines.map((line) => line.speakerName)).toEqual(["Aさん", "Bさん"]);
  });

  it('hiển thị "?" khi speakerId không có trong danh sách người nói', () => {
    const kaiwa = makeKaiwa([{ id: "l1", speakerId: "zzz", text: "おはよう" }]);

    expect(generateKaiwaExercise({ kaiwa }).lines[0].speakerName).toBe("?");
  });

  it("audioTexts là văn bản GỐC chưa đục lỗ để nghe được trọn hội thoại", () => {
    const exercise = generateKaiwaExercise({ kaiwa: spacedKaiwa() });

    expect(exercise.audioTexts).toEqual(["おはよう ございます", "はい、 そうです。"]);
    expect(exercise.audioTexts.join("")).not.toContain("_____");
  });

  it("gắn tên người nói của câu bị đục lỗ ở cấp bài tập", () => {
    stubRandomZero();

    const exercise = generateKaiwaExercise({ kaiwa: spacedKaiwa() });

    expect(exercise.speakerName).toBe("Aさん");
  });
});

describe("generateKaiwaExercise — đục lỗ cả câu", () => {
  it('luôn đục cả câu khi câu chỉ có một "từ" (tiếng Nhật không có dấu cách)', () => {
    const exercise = generateKaiwaExercise({ kaiwa: soloTokenKaiwa() });

    expect(exercise.kind).toBe("sentence");
    expect(exercise.answer).toMatch(/^(おはようございます。|こんにちは。)$/);

    const blanked = exercise.lines.find((line) => line.isBlank);
    expect(blanked.text).toBe("_____");
  });

  it("đục cả câu khi random rơi vào nửa sau", () => {
    // targetPos = 0, rồi Math.random() = 0.9 (>= 0.5) → chọn đục cả câu.
    stubRandom([0, 0.9]);

    const exercise = generateKaiwaExercise({ kaiwa: spacedKaiwa() });

    expect(exercise.kind).toBe("sentence");
    expect(exercise.answer).toBe("おはよう ございます");
    expect(exercise.lines[0].text).toBe("_____");
    expect(exercise.lines[1].text).toBe("はい、 そうです。");
  });
});

describe("generateKaiwaExercise — đục lỗ theo từ", () => {
  it("thay đúng một từ trong câu bằng chỗ trống", () => {
    // targetPos = 0, 0.2 < 0.5 → đục theo từ, token đầu tiên.
    stubRandom([0, 0.2, 0]);

    const exercise = generateKaiwaExercise({ kaiwa: spacedKaiwa() });

    expect(exercise.kind).toBe("word");
    expect(exercise.answer).toBe("おはよう");
    expect(exercise.lines[0].text).toBe("_____ ございます");
  });

  it("bỏ dấu câu ở cuối token nên đáp án không dính 。、！？", () => {
    stubRandom([0.9, 0.2, 0.9]);

    const exercise = generateKaiwaExercise({ kaiwa: spacedKaiwa() });

    expect(exercise.kind).toBe("word");
    expect(exercise.answer).toBe("そうです");
    expect(exercise.lines[1].text).toBe("はい、 _____。");
  });

  it("đục ở lần xuất hiện CUỐI khi từ lặp lại trong câu", () => {
    stubRandom([0, 0.2, 0]);

    const kaiwa = makeKaiwa([{ id: "l1", speakerId: "a", text: "また あした また" }]);
    const exercise = generateKaiwaExercise({ kaiwa });

    expect(exercise.answer).toBe("また");
    expect(exercise.lines[0].text).toBe("また あした _____");
  });
});

describe("generateKaiwaExercise — định dạng câu trả lời", () => {
  it('dạng "fill" không kèm phương án chọn', () => {
    const exercise = generateKaiwaExercise({ kaiwa: spacedKaiwa(), format: "fill" });

    expect(exercise.type).toBe("fill");
    expect(exercise.options).toBeUndefined();
    expect(exercise.answer).toBeTruthy();
  });

  it('dạng "choice" mặc định, luôn chứa đáp án và không trùng phương án', () => {
    const exercise = generateKaiwaExercise({ kaiwa: spacedKaiwa() });

    expect(exercise.type).toBe("choice");
    expect(exercise.options).toContain(exercise.answer);
    expect(new Set(exercise.options).size).toBe(exercise.options.length);
    expect(exercise.options.length).toBeLessThanOrEqual(4);
  });

  it("lấy phương án nhiễu từ các câu thoại khác khi đục cả câu", () => {
    stubRandom([0, 0.9]);

    const kaiwa = makeKaiwa([
      { id: "l1", speakerId: "a", text: "おはようございます。" },
      { id: "l2", speakerId: "b", text: "こんにちは。" },
      { id: "l3", speakerId: "a", text: "こんばんは。" }
    ]);

    const exercise = generateKaiwaExercise({ kaiwa });

    expect(exercise.answer).toBe("おはようございます。");
    expect(exercise.options).toHaveLength(3);
    expect(exercise.options).toEqual(
      expect.arrayContaining(["おはようございます。", "こんにちは。", "こんばんは。"])
    );
  });

  it("vẫn tạo được bài khi hội thoại chỉ có một câu (không có phương án nhiễu)", () => {
    const kaiwa = makeKaiwa([{ id: "l1", speakerId: "a", text: "こんにちは。" }]);

    const exercise = generateKaiwaExercise({ kaiwa });

    expect(exercise.options).toEqual(["こんにちは。"]);
  });
});
