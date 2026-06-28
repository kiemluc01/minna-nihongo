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
  "べとなむ": "Việt Nam"
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
  const searchTerms = uniqueValues(
    splitLookupVariants(word.jp)
      .concat(splitLookupVariants(word.reading))
      .concat(splitLookupVariants(word.kanji))
      .concat(splitLookupVariants(word.hiragana))
      .concat(splitLookupVariants(word.katakana))
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
