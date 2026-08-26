import { describe, expect, it } from "vitest";

import {
  getFrontText,
  getPrimaryScript,
  getReadingText,
  getWordScripts,
  hasHiragana,
  hasKanji,
  hasKatakana,
  matchesScriptFilter,
  toRomaji
} from "./vocabulary";

describe("hasHiragana / hasKatakana / hasKanji", () => {
  it("nhận ra hiragana và loại trừ hệ chữ khác", () => {
    expect(hasHiragana("ねこ")).toBe(true);
    expect(hasHiragana("ネコ")).toBe(false);
    expect(hasHiragana("猫")).toBe(false);
  });

  it("nhận ra katakana và loại trừ hệ chữ khác", () => {
    expect(hasKatakana("コーヒー")).toBe(true);
    expect(hasKatakana("こおひい")).toBe(false);
    expect(hasKatakana("猫")).toBe(false);
  });

  it("nhận ra kanji và loại trừ hệ chữ khác", () => {
    expect(hasKanji("先生")).toBe(true);
    expect(hasKanji("せんせい")).toBe(false);
    expect(hasKanji("センセイ")).toBe(false);
  });

  it("trả về false cho chuỗi rỗng và khi không truyền tham số", () => {
    expect(hasHiragana("")).toBe(false);
    expect(hasKatakana("")).toBe(false);
    expect(hasKanji("")).toBe(false);
    expect(hasHiragana()).toBe(false);
    expect(hasKatakana()).toBe(false);
    expect(hasKanji()).toBe(false);
  });

  it("nhận ra hệ chữ trong chuỗi hỗn hợp", () => {
    expect(hasKanji("わたしは 日本人です")).toBe(true);
    expect(hasHiragana("わたしは 日本人です")).toBe(true);
    expect(hasKatakana("わたしは 日本人です")).toBe(false);
  });
});

describe("toRomaji", () => {
  it("chuyển tự gojūon cơ bản", () => {
    expect(toRomaji("ねこ")).toBe("neko");
    expect(toRomaji("さくら")).toBe("sakura");
  });

  it("chuyển tự âm ghép (yōon) thành một âm tiết", () => {
    expect(toRomaji("きょう")).toBe("kyou");
    expect(toRomaji("しゃしん")).toBe("shashin");
    expect(toRomaji("りょこう")).toBe("ryokou");
  });

  it("nhân đôi phụ âm ở xúc âm っ", () => {
    expect(toRomaji("がっこう")).toBe("gakkou");
    expect(toRomaji("きって")).toBe("kitte");
  });

  it("kéo dài nguyên âm trước ー", () => {
    expect(toRomaji("コーヒー")).toBe("koohii");
    expect(toRomaji("ケーキ")).toBe("keeki");
  });

  it("quy katakana về cùng kết quả với hiragana", () => {
    expect(toRomaji("カタカナ")).toBe("katakana");
    expect(toRomaji("カタカナ")).toBe(toRomaji("かたかな"));
  });

  it("xử lý được xúc âm katakana ッ", () => {
    expect(toRomaji("キップ")).toBe("kippu");
  });

  it("giữ nguyên ký tự không nằm trong bảng chuyển tự", () => {
    expect(toRomaji("日本")).toBe("日本");
    expect(toRomaji("N5")).toBe("N5");
  });

  it("đổi dấu cách toàn rộng U+3000 thành dấu cách thường", () => {
    expect(toRomaji("あの　ひと")).toBe("ano hito");
  });

  it("trả về chuỗi rỗng khi không có đầu vào", () => {
    expect(toRomaji()).toBe("");
    expect(toRomaji("")).toBe("");
  });
});

describe("getWordScripts", () => {
  it("gom hệ chữ từ mọi trường của từ", () => {
    expect(getWordScripts({ jp: "せんせい" })).toEqual(["hiragana"]);
    expect(getWordScripts({ jp: "コーヒー" })).toEqual(["katakana"]);
    expect(getWordScripts({ kanji: "先生" })).toEqual(["kanji"]);
    expect(getWordScripts({ jp: "先生", reading: "せんせい" })).toEqual(["kanji", "hiragana"]);
  });

  it("trả về mảng rỗng khi từ không có chữ Nhật nào", () => {
    expect(getWordScripts({ jp: "abc" })).toEqual([]);
    expect(getWordScripts({})).toEqual([]);
    expect(getWordScripts()).toEqual([]);
  });

  it("không lặp lại hệ chữ khi nhiều trường cùng một hệ", () => {
    expect(getWordScripts({ jp: "ねこ", hiragana: "ねこ", reading: "ねこ" })).toEqual(["hiragana"]);
  });
});

describe("getPrimaryScript", () => {
  it('trả về "roman" khi không có hệ chữ Nhật nào', () => {
    expect(getPrimaryScript({ jp: "abc" })).toBe("roman");
    expect(getPrimaryScript({})).toBe("roman");
  });

  it('trả về "mixed" khi từ có nhiều hơn một hệ chữ', () => {
    expect(getPrimaryScript({ jp: "先生", reading: "せんせい" })).toBe("mixed");
  });

  it("trả về đúng tên hệ chữ khi chỉ có một", () => {
    expect(getPrimaryScript({ jp: "ねこ" })).toBe("hiragana");
    expect(getPrimaryScript({ jp: "コーヒー" })).toBe("katakana");
    expect(getPrimaryScript({ jp: "先生" })).toBe("kanji");
  });
});

describe("getFrontText", () => {
  it("ưu tiên tuyệt đối trường jp", () => {
    expect(getFrontText({ jp: "ねこ", kanji: "猫", katakana: "ネコ" })).toBe("ねこ");
    expect(getFrontText({ jp: "ねこ", kanji: "猫" }, "kanji")).toBe("ねこ");
  });

  it("chọn đúng trường theo preferredScript khi không có jp", () => {
    const word = { hiragana: "ねこ", katakana: "ネコ", kanji: "猫" };

    expect(getFrontText(word, "hiragana")).toBe("ねこ");
    expect(getFrontText(word, "katakana")).toBe("ネコ");
    expect(getFrontText(word, "kanji")).toBe("猫");
  });

  it("rơi về chuỗi kanji → katakana → hiragana → romaji khi không khớp preferredScript", () => {
    expect(getFrontText({ kanji: "猫", katakana: "ネコ", hiragana: "ねこ" })).toBe("猫");
    expect(getFrontText({ katakana: "ネコ", hiragana: "ねこ" })).toBe("ネコ");
    expect(getFrontText({ hiragana: "ねこ", romaji: "neko" })).toBe("ねこ");
    expect(getFrontText({ romaji: "neko" })).toBe("neko");
  });

  it("trả về chuỗi rỗng khi từ trống", () => {
    expect(getFrontText({})).toBe("");
    expect(getFrontText()).toBe("");
  });
});

describe("getReadingText", () => {
  it("ưu tiên reading, rồi romaji", () => {
    expect(getReadingText({ jp: "先生", reading: "せんせい", romaji: "sensei" })).toBe("せんせい");
    expect(getReadingText({ jp: "ねこ", romaji: "neko-custom" })).toBe("neko-custom");
  });

  it("tự chuyển tự jp khi không có reading lẫn romaji", () => {
    expect(getReadingText({ jp: "ねこ" })).toBe("neko");
  });

  it("tự chuyển tự mặt trước khi cũng không có jp", () => {
    expect(getReadingText({ katakana: "ネコ" })).toBe("neko");
  });

  it("trả về chuỗi rỗng khi từ trống", () => {
    expect(getReadingText({})).toBe("");
  });
});

describe("matchesScriptFilter", () => {
  const kanjiWord = { jp: "先生", reading: "せんせい" };
  const hiraganaWord = { jp: "ねこ" };
  const katakanaWord = { jp: "コーヒー" };

  it('bộ lọc "all" luôn khớp', () => {
    expect(matchesScriptFilter(hiraganaWord, "all")).toBe(true);
    expect(matchesScriptFilter({}, "all")).toBe(true);
    expect(matchesScriptFilter(hiraganaWord)).toBe(true);
  });

  it('bộ lọc "mixed" chỉ khớp từ có nhiều hệ chữ', () => {
    expect(matchesScriptFilter(kanjiWord, "mixed")).toBe(true);
    expect(matchesScriptFilter(hiraganaWord, "mixed")).toBe(false);
  });

  it("bộ lọc theo một hệ chữ khớp khi từ CHỨA hệ chữ đó", () => {
    expect(matchesScriptFilter(kanjiWord, "kanji")).toBe(true);
    expect(matchesScriptFilter(kanjiWord, "hiragana")).toBe(true);
    expect(matchesScriptFilter(katakanaWord, "katakana")).toBe(true);
  });

  it("không khớp khi từ không chứa hệ chữ đang lọc", () => {
    expect(matchesScriptFilter(hiraganaWord, "katakana")).toBe(false);
    expect(matchesScriptFilter(katakanaWord, "kanji")).toBe(false);
  });
});
