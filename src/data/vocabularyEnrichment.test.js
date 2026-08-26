import { describe, expect, it } from "vitest";

import { enrichVocabularyList, enrichVocabularyWord, lookupVocabularyEntry } from "./vocabularyEnrichment";

describe("lookupVocabularyEntry", () => {
  it("tra được theo cách đọc hiragana", () => {
    const entries = lookupVocabularyEntry({ jp: "ねこ" });

    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({ written: "猫", reading: "ねこ", meaning: "con mèo" });
  });

  it("tra được theo dạng chữ Hán", () => {
    expect(lookupVocabularyEntry({ jp: "猫" })[0].reading).toBe("ねこ");
  });

  it("tra được theo trường reading khi jp không khớp", () => {
    expect(lookupVocabularyEntry({ jp: "", reading: "ねこ" })[0].meaning).toBe("con mèo");
  });

  it("khớp chéo hiragana ↔ katakana", () => {
    expect(lookupVocabularyEntry({ jp: "あめりか" })[0].reading).toBe("アメリカ");
  });

  it("tách được nhiều biến thể trong dấu ngoặc và gạch chéo", () => {
    const readings = lookupVocabularyEntry({ jp: "あのひと （あのかた）" }).map((entry) => entry.reading);

    expect(readings).toEqual(["あのひと", "あのかた"]);
  });

  it("không trả về mục trùng lặp", () => {
    const entries = lookupVocabularyEntry({ jp: "猫", reading: "ねこ", hiragana: "ねこ" });

    expect(entries).toHaveLength(1);
  });

  it("trả về mảng rỗng cho từ không có trong dữ liệu", () => {
    expect(lookupVocabularyEntry({ jp: "zzzz-khong-ton-tai" })).toEqual([]);
    expect(lookupVocabularyEntry({})).toEqual([]);
    expect(lookupVocabularyEntry()).toEqual([]);
  });
});

describe("enrichVocabularyWord", () => {
  it("điền nghĩa và cách đọc cho từ chỉ có mỗi chữ Nhật", () => {
    expect(enrichVocabularyWord({ jp: "ねこ" })).toEqual({
      jp: "ねこ",
      meaning: "con mèo",
      reading: "ねこ"
    });
  });

  it("KHÔNG ghi đè nghĩa và cách đọc đã có sẵn", () => {
    const word = { jp: "ねこ", meaning: "nghĩa tự nhập", reading: "cách đọc tự nhập" };

    expect(enrichVocabularyWord(word)).toEqual(word);
  });

  it("giữ nguyên các trường khác của từ", () => {
    expect(enrichVocabularyWord({ id: 3, jp: "ねこ", sourceSlide: 12 })).toMatchObject({
      id: 3,
      sourceSlide: 12
    });
  });

  it("ưu tiên bản sửa nghĩa thủ công hơn nghĩa tra được từ dữ liệu", () => {
    // "あめりか" có trong MANUAL_MEANING_OVERRIDES, dữ liệu gốc ghi "nước Mỹ".
    expect(enrichVocabularyWord({ jp: "あめりか" }).meaning).toBe("Mỹ");
    expect(enrichVocabularyWord({ jp: "アメリカ" }).meaning).toBe("nước Mỹ");
  });

  it("áp bản sửa thủ công cho mục ghép nhiều cách nói", () => {
    expect(enrichVocabularyWord({ jp: "せんせい/きょうし" })).toEqual({
      jp: "せんせい/きょうし",
      meaning: "giáo viên",
      reading: "せんせい / きょうし"
    });
  });

  it("khoá tra bản sửa thủ công không phân biệt hoa thường", () => {
    expect(enrichVocabularyWord({ jp: "CD" }).meaning).toBe("đĩa CD");
  });

  it("vẫn điền được nghĩa thủ công cho từ không có trong dữ liệu tra cứu", () => {
    expect(enrichVocabularyWord({ jp: "てちょう" })).toEqual({
      jp: "てちょう",
      meaning: "sổ tay",
      reading: ""
    });
  });

  it("nối nhiều nghĩa bằng dấu / khi từ khớp nhiều mục", () => {
    expect(enrichVocabularyWord({ jp: "あのひと （あのかた）" })).toMatchObject({
      meaning: "người kia, người đó / vị kia (lịch sự)",
      reading: "あのひと / あのかた"
    });
  });

  it("để trống nghĩa và cách đọc khi không tra được gì", () => {
    expect(enrichVocabularyWord({ jp: "zzzz-khong-ton-tai" })).toEqual({
      jp: "zzzz-khong-ton-tai",
      meaning: "",
      reading: ""
    });
  });
});

describe("enrichVocabularyList", () => {
  it("bổ sung nghĩa cho mọi từ trong danh sách", () => {
    const list = enrichVocabularyList([{ jp: "ねこ" }, { jp: "猫" }]);

    expect(list.map((word) => word.meaning)).toEqual(["con mèo", "con mèo"]);
  });

  it("không làm thay đổi danh sách gốc", () => {
    const input = [{ jp: "ねこ" }];

    enrichVocabularyList(input);

    expect(input).toEqual([{ jp: "ねこ" }]);
  });

  it("trả về mảng rỗng khi không có từ nào", () => {
    expect(enrichVocabularyList([])).toEqual([]);
    expect(enrichVocabularyList()).toEqual([]);
  });
});
