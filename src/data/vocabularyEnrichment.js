import grammarWords from "./grammar/words";

const MANUAL_MEANING_OVERRIDES = {
  "せんせい/きょうし": "giáo viên",
  "あのひと": "người kia, người đó",
  "あのかた": "vị kia (lịch sự)",
  "わたし": "tôi",
  "だれ": "ai",
  "どなた": "ai ạ / vị nào",
  "がくせい": "học sinh, sinh viên",
  "かいしゃいん": "nhân viên công ty",
  "ぎんこういん": "nhân viên ngân hàng",
  "いしゃ": "bác sĩ",
  "けんきゅうしゃ": "nhà nghiên cứu",
  "だいがく": "đại học",
  "びょういん": "bệnh viện",
  "あめりか": "Mỹ",
  "いぎりす": "Anh",
  "いんど": "Ấn Độ",
  "いんどねしあ": "Indonesia",
  "たい": "Thái Lan",
  "どいつ": "Đức",
  "ふらんす": "Pháp",
  "ぶらじる": "Brazil",
  "かんこく": "Hàn Quốc",
  "ちゅうごく": "Trung Quốc",
  "にほん": "Nhật Bản",
  "べとなむ": "Việt Nam",
  "てちょう": "sổ tay",
  "cd": "đĩa CD",
  "くるま": "xe, ô tô",
  "おみやげ": "quà (lưu niệm)",
  "じどうはんばいき": "máy bán hàng tự động",
  "「お」くに": "quê hương, đất nước (cách nói lịch sự)",
  "あさひるよる": "sáng, trưa, tối",
  "「かいしゃを」やすみます": "nghỉ (làm ở công ty)",
  "えいが": "phim",
  "「うちへ」かえります": "về nhà",
  "かれかのじょ": "anh ấy, bạn trai / cô ấy, bạn gái",
  "タバコをすいます": "hút thuốc",
  "「しゃしんを」とります": "chụp ảnh",
  "ビデオ": "video, băng video",
  "でんわをかけます": "gọi điện thoại",
  "ねんがじょう": "thiệp chúc mừng năm mới",
  "パンチ": "cái bấm lỗ (giấy)",
  "ホッチキス": "cái bấm kim (dập ghim)",
  "セロテープ": "băng dính, băng keo trong"
};

const normalizeLookupText = (text = "") =>
  text
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\s。、・,.!?！？:;'"“”‘’〜~]/g, "")
    .replace(/[(){}]/g, "")
    .replace(/\[/g, "")
    .replace(/\]/g, "");

const splitLookupVariants = (text = "") => {
  const cleaned = text.normalize("NFKC").trim();

  if (!cleaned) {
    return [];
  }

  return cleaned
    .split(/[／/]/g)
    .flatMap((segment) =>
      segment
        .split(/[()（）]/g)
        .map((part) => part.trim())
        .filter(Boolean)
    )
    .map((segment) =>
      segment
        .replace(/[、,，]/g, "")
        .replace(/\s+/g, " ")
        .trim()
    )
    .filter(Boolean);
};

const toKatakana = (text = "") =>
  text.replace(/[ぁ-ゖ]/g, (char) => String.fromCharCode(char.charCodeAt(0) + 0x60));

const toHiragana = (text = "") =>
  text.replace(/[ァ-ヶ]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0x60));

const grammarLookup = new Map();

for (const entry of grammarWords) {
  for (const key of [entry.reading, entry.written]) {
    if (!key) {
      continue;
    }

    const normalized = normalizeLookupText(key);

    if (!normalized) {
      continue;
    }

    if (!grammarLookup.has(normalized)) {
      grammarLookup.set(normalized, []);
    }

    grammarLookup.get(normalized).push(entry);
  }
}

const uniqueValues = (items) => Array.from(new Set(items.filter(Boolean)));

export const lookupVocabularyEntry = (word = {}) => {
  const baseTerms = splitLookupVariants(word.jp)
    .concat(splitLookupVariants(word.reading))
    .concat(splitLookupVariants(word.kanji))
    .concat(splitLookupVariants(word.hiragana))
    .concat(splitLookupVariants(word.katakana));

  const searchTerms = uniqueValues(
    baseTerms
      .concat(baseTerms.map(toKatakana))
      .concat(baseTerms.map(toHiragana))
  );

  const matches = [];

  for (const term of searchTerms) {
    const normalized = normalizeLookupText(term);
    const found = grammarLookup.get(normalized) ?? [];
    matches.push(...found);
  }

  const deduped = [];
  const seen = new Set();

  for (const entry of matches) {
    const key = `${entry.lesson}:${entry.reading}:${entry.written}`;
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    deduped.push(entry);
  }

  return deduped;
};

export const enrichVocabularyWord = (word = {}) => {
  const matchedEntries = lookupVocabularyEntry(word);
  const meanings = uniqueValues(matchedEntries.map((entry) => entry.meaning));
  const readings = uniqueValues(matchedEntries.map((entry) => entry.reading));
  const manualMeaning = MANUAL_MEANING_OVERRIDES[normalizeLookupText(word.jp || "")] || "";

  return {
    ...word,
    meaning: word.meaning || manualMeaning || meanings.join(" / "),
    reading: word.reading || readings.join(" / ")
  };
};

export const enrichVocabularyList = (list = []) => list.map(enrichVocabularyWord);
