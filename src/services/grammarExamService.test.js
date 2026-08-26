import { describe, expect, it } from "vitest";

import {
  collectExamScope,
  generateGrammarExam,
  isGrammarAnswerCorrect,
  isVocabAnswerCorrect,
  parseBlankField,
  shuffle
} from "./grammarExamService";
import { stubRandomZero } from "../test/helpers/random";
import { makeLesson, makeNote, makeRoadmaps, makeWord } from "../test/helpers/roadmaps";

describe("parseBlankField", () => {
  it("trả về chuỗi rỗng khi không có nội dung", () => {
    expect(parseBlankField()).toBe("");
    expect(parseBlankField("")).toBe("");
    expect(parseBlankField(" , , ")).toBe("");
  });

  it("trả về chuỗi khi chỉ có một mẫu", () => {
    expect(parseBlankField("から")).toBe("から");
    expect(parseBlankField("  から  ")).toBe("から");
  });

  it("trả về mảng đã trim khi có nhiều mẫu cách nhau bằng dấu phẩy", () => {
    expect(parseBlankField(" から , まで ")).toEqual(["から", "まで"]);
  });

  it("bỏ qua phần tử rỗng giữa các dấu phẩy", () => {
    expect(parseBlankField("から,,まで")).toEqual(["から", "まで"]);
  });
});

describe("shuffle", () => {
  it("trả về mảng mới và không làm thay đổi mảng gốc", () => {
    const input = ["a", "b", "c"];
    const result = shuffle(input);

    expect(result).not.toBe(input);
    expect(input).toEqual(["a", "b", "c"]);
  });

  it("giữ nguyên tập phần tử, chỉ đổi thứ tự", () => {
    const input = ["a", "b", "c", "d"];

    expect([...shuffle(input)].sort()).toEqual([...input].sort());
  });

  it("cho kết quả tất định khi Math.random bị cố định", () => {
    stubRandomZero();

    expect(shuffle(["a", "b", "c"])).toEqual(["b", "c", "a"]);
  });

  it("xử lý được mảng rỗng và mảng một phần tử", () => {
    expect(shuffle([])).toEqual([]);
    expect(shuffle(["a"])).toEqual(["a"]);
  });
});

describe("isVocabAnswerCorrect", () => {
  it("chấp nhận đáp án trùng khớp hoàn toàn", () => {
    expect(isVocabAnswerCorrect("giáo viên", "giáo viên")).toBe(true);
  });

  it("không phân biệt hoa thường", () => {
    expect(isVocabAnswerCorrect("GIÁO VIÊN", "giáo viên")).toBe(true);
  });

  it("bỏ qua khoảng trắng thừa ở hai đầu và ở giữa", () => {
    expect(isVocabAnswerCorrect("  giáo    viên  ", "giáo viên")).toBe(true);
  });

  it("chuẩn hoá NFKC nên chữ toàn rộng vẫn khớp", () => {
    expect(isVocabAnswerCorrect("ｂａｃ", "bac")).toBe(true);
  });

  it("chấp nhận bất kỳ đồng nghĩa nào trong đáp án", () => {
    expect(isVocabAnswerCorrect("học sinh", "học sinh, sinh viên")).toBe(true);
    expect(isVocabAnswerCorrect("sinh viên", "học sinh, sinh viên")).toBe(true);
  });

  it("tách đồng nghĩa theo cả / ; và 、", () => {
    expect(isVocabAnswerCorrect("xe", "xe/ô tô")).toBe(true);
    expect(isVocabAnswerCorrect("ô tô", "xe;ô tô")).toBe(true);
    expect(isVocabAnswerCorrect("ô tô", "xe、ô tô")).toBe(true);
  });

  it("từ chối đáp án bỏ trống", () => {
    expect(isVocabAnswerCorrect("", "giáo viên")).toBe(false);
    expect(isVocabAnswerCorrect("   ", "giáo viên")).toBe(false);
    expect(isVocabAnswerCorrect(undefined, "giáo viên")).toBe(false);
  });

  it("từ chối đáp án hoàn toàn khác", () => {
    expect(isVocabAnswerCorrect("bệnh viện", "giáo viên")).toBe(false);
  });

  // BUG: so khớp hai chiều bằng includes (grammarExamService.js:60) khiến một
  // ký tự bất kỳ có trong đáp án cũng được chấm ĐÚNG. Test này CỐ Ý đỏ để làm
  // bằng chứng; xoá it.fails sau khi sửa hàm.
  it.fails("KHÔNG được chấm đúng cho đáp án chỉ là một mẩu vô nghĩa", () => {
    expect(isVocabAnswerCorrect("a", "bác sĩ")).toBe(false);
    expect(isVocabAnswerCorrect("n", "bệnh viện")).toBe(false);
  });
});

describe("isGrammarAnswerCorrect", () => {
  it("chấp nhận đáp án trùng khớp sau khi chuẩn hoá", () => {
    expect(isGrammarAnswerCorrect("は", "は")).toBe(true);
    expect(isGrammarAnswerCorrect("  は  ", "は")).toBe(true);
  });

  it("từ chối trợ từ khác", () => {
    expect(isGrammarAnswerCorrect("を", "は")).toBe(false);
  });

  it("từ chối đáp án bỏ trống", () => {
    expect(isGrammarAnswerCorrect("", "は")).toBe(false);
    expect(isGrammarAnswerCorrect(undefined, "は")).toBe(false);
  });

  it("khác với chấm từ vựng: không chấp nhận khớp một phần", () => {
    expect(isGrammarAnswerCorrect("は", "はい")).toBe(false);
  });
});

describe("collectExamScope", () => {
  it("chỉ lấy dữ liệu của các bài trong phạm vi", () => {
    const scope = collectExamScope(makeRoadmaps(), [1]);

    expect(scope.vocabulary).toHaveLength(5);
    expect(scope.vocabulary.every((word) => word.lessonId === 1)).toBe(true);
    expect(scope.grammarNotes.every((note) => note.lessonId === 1)).toBe(true);
  });

  it("khớp lessonId dù truyền vào là số hay chuỗi", () => {
    const scope = collectExamScope(makeRoadmaps(), ["1", 2]);

    expect(scope.vocabulary).toHaveLength(9);
  });

  it("trả về phạm vi rỗng khi không chọn bài nào", () => {
    expect(collectExamScope(makeRoadmaps(), [])).toEqual({ vocabulary: [], grammarNotes: [] });
  });

  it("loại bỏ từ thiếu jp hoặc thiếu nghĩa", () => {
    const roadmaps = [
      makeLesson({
        id: 1,
        vocabulary: [
          makeWord("ねこ", "con mèo"),
          makeWord("いぬ", ""),
          makeWord("", "con chim"),
          { jp: "とり" }
        ]
      })
    ];

    const scope = collectExamScope(roadmaps, [1]);

    expect(scope.vocabulary.map((word) => word.jp)).toEqual(["ねこ"]);
  });

  it("giữ lại reading và katakana của từ", () => {
    const roadmaps = [
      makeLesson({
        id: 1,
        vocabulary: [makeWord("先生", "giáo viên", { reading: "せんせい", katakana: "センセイ" })]
      })
    ];

    const [word] = collectExamScope(roadmaps, [1]).vocabulary;

    expect(word).toMatchObject({ reading: "せんせい", katakana: "センセイ", lessonId: 1 });
  });

  it("dùng title làm chỗ đục lỗ khi ngữ pháp không khai báo blank", () => {
    const roadmaps = [makeLesson({ id: 1, grammarNotes: [makeNote("は", "わたしは がくせいです。")] })];

    expect(collectExamScope(roadmaps, [1]).grammarNotes[0].blankToken).toBe("は");
  });

  it("chọn một ứng viên CÓ trong câu ví dụ khi blank là mảng", () => {
    stubRandomZero();

    const roadmaps = [
      makeLesson({
        id: 1,
        grammarNotes: [
          makeNote("から〜まで", "9じから 5じまで はたらきます。", { blank: ["から", "まで"] })
        ]
      })
    ];

    expect(collectExamScope(roadmaps, [1]).grammarNotes[0].blankToken).toBe("から");
  });

  it("bỏ qua ứng viên không xuất hiện trong câu ví dụ", () => {
    const roadmaps = [
      makeLesson({
        id: 1,
        grammarNotes: [makeNote("まで", "9じから はたらきます。", { blank: ["ませんか", "から"] })]
      })
    ];

    expect(collectExamScope(roadmaps, [1]).grammarNotes[0].blankToken).toBe("から");
  });

  it("loại hẳn ngữ pháp khi không ứng viên nào nằm trong câu ví dụ", () => {
    const roadmaps = [
      makeLesson({ id: 1, grammarNotes: [makeNote("ましょう", "わたしは がくせいです。")] })
    ];

    expect(collectExamScope(roadmaps, [1]).grammarNotes).toEqual([]);
  });

  it("loại ngữ pháp không có câu ví dụ", () => {
    const roadmaps = [
      makeLesson({ id: 1, grammarNotes: [{ title: "は", detail: "Trợ từ chủ đề" }] })
    ];

    expect(collectExamScope(roadmaps, [1]).grammarNotes).toEqual([]);
  });
});

describe("generateGrammarExam", () => {
  const generate = (options) => generateGrammarExam({ lessonRoadmaps: makeRoadmaps(), ...options });

  it("trả về đề rỗng khi phạm vi không có dữ liệu", () => {
    expect(generate({ lessonIds: [] })).toEqual({
      questions: [],
      vocabularyCount: 0,
      grammarCount: 0,
      maxVocabQuestions: 0,
      maxGrammarQuestions: 0
    });
  });

  it("báo đúng số lượng tối đa của từng loại trong phạm vi", () => {
    const exam = generate({ lessonIds: [1] });

    expect(exam.maxVocabQuestions).toBe(5);
    expect(exam.maxGrammarQuestions).toBe(4);
    expect(exam.vocabularyCount).toBe(5);
    expect(exam.grammarCount).toBe(4);
  });

  it("tôn trọng số câu được yêu cầu cho từng loại", () => {
    const exam = generate({ lessonIds: [1], vocabCount: 2, grammarCount: 1 });
    const kinds = exam.questions.map((question) => question.kind);

    expect(kinds.filter((kind) => kind === "vocab")).toHaveLength(2);
    expect(kinds.filter((kind) => kind === "grammar")).toHaveLength(1);
  });

  it("cắt trần số câu ở số mục thật sự có trong phạm vi", () => {
    const exam = generate({ lessonIds: [1], vocabCount: 99, grammarCount: 99 });

    expect(exam.questions).toHaveLength(9);
  });

  it("không dùng lại cùng một từ hoặc cùng một mẫu ngữ pháp trong một đề", () => {
    const exam = generate({ lessonIds: [1, 2] });
    const prompts = exam.questions.map((question) => question.prompt);

    expect(new Set(prompts).size).toBe(prompts.length);
  });

  it("mỗi câu chỉ thuộc đúng một loại và có gắn lessonId", () => {
    const exam = generate({ lessonIds: [1, 2] });

    exam.questions.forEach((question) => {
      expect(["vocab", "grammar"]).toContain(question.kind);
      expect([1, 2]).toContain(question.lessonId);
    });
  });

  it('dạng "fill" không kèm phương án chọn', () => {
    const exam = generate({ lessonIds: [1], format: "fill" });

    exam.questions.forEach((question) => {
      expect(question.type).toBe("fill");
      expect(question.answer).toBeTruthy();
      expect(question.options).toBeUndefined();
    });
  });

  it('dạng "choice" cho 4 phương án khác nhau và luôn chứa đáp án', () => {
    const exam = generate({ lessonIds: [1, 2], format: "choice" });

    exam.questions.forEach((question) => {
      expect(question.type).toBe("choice");
      expect(question.options).toHaveLength(4);
      expect(question.options).toContain(question.answer);
      expect(new Set(question.options).size).toBe(4);
    });
  });

  it("lấy phương án nhiễu từ toàn bộ dữ liệu khi phạm vi quá nhỏ", () => {
    const roadmaps = [
      makeLesson({ id: 1, vocabulary: [makeWord("ねこ", "con mèo")] }),
      makeLesson({
        id: 2,
        vocabulary: [
          makeWord("いぬ", "con chó"),
          makeWord("とり", "con chim"),
          makeWord("さかな", "con cá")
        ]
      })
    ];

    const exam = generateGrammarExam({ lessonRoadmaps: roadmaps, lessonIds: [1], format: "choice" });

    expect(exam.questions[0].options).toHaveLength(4);
    expect(exam.questions[0].options).toContain("con mèo");
  });

  it("câu ngữ pháp đục lỗ ngay trong câu ví dụ", () => {
    const exam = generate({ lessonIds: [1], vocabCount: 0, format: "fill" });

    exam.questions.forEach((question) => {
      expect(question.prompt).toContain("_____");
      expect(question.prompt).not.toContain(question.answer);
      expect(question.detail).toBeTruthy();
    });
  });

  it("đục lỗ ở lần xuất hiện CUỐI để không cắt nhầm vào giữa từ khác", () => {
    const roadmaps = [makeLesson({ id: 1, grammarNotes: [makeNote("で", "でんしゃで いきます。")] })];

    const exam = generateGrammarExam({
      lessonRoadmaps: roadmaps,
      lessonIds: [1],
      format: "fill"
    });

    expect(exam.questions[0].prompt).toBe("でんしゃ_____ いきます。");
  });

  it("chú thích cách đọc cho từ có kanji vì câu hỏi kiểm tra nghĩa chứ không kiểm tra cách đọc", () => {
    const roadmaps = [
      makeLesson({
        id: 1,
        vocabulary: [makeWord("先生", "giáo viên", { reading: "せんせい" })]
      })
    ];

    const exam = generateGrammarExam({ lessonRoadmaps: roadmaps, lessonIds: [1], format: "fill" });

    expect(exam.questions[0].prompt).toBe("先生 (せんせい)");
    expect(exam.questions[0].speakText).toBe("せんせい");
  });

  it("chú thích dạng katakana cho từ mượn nhập bằng hiragana", () => {
    const roadmaps = [
      makeLesson({
        id: 1,
        vocabulary: [makeWord("きゃんぷ", "cắm trại", { katakana: "キャンプ" })]
      })
    ];

    const exam = generateGrammarExam({ lessonRoadmaps: roadmaps, lessonIds: [1], format: "fill" });

    expect(exam.questions[0].prompt).toBe("きゃんぷ (キャンプ)");
  });

  it("không chú thích gì với từ thuần hiragana", () => {
    const roadmaps = [makeLesson({ id: 1, vocabulary: [makeWord("ねこ", "con mèo")] })];

    const exam = generateGrammarExam({ lessonRoadmaps: roadmaps, lessonIds: [1], format: "fill" });

    expect(exam.questions[0].prompt).toBe("ねこ");
    expect(exam.questions[0].speakText).toBe("ねこ");
  });

  it("mỗi câu hỏi có id riêng biệt", () => {
    const exam = generate({ lessonIds: [1, 2] });
    const ids = exam.questions.map((question) => question.id);

    expect(new Set(ids).size).toBe(ids.length);
  });
});
