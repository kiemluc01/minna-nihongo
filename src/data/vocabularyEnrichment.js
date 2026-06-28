import grammarWords from "./grammar/words";

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

  return {
    ...word,
    meaning: word.meaning || meanings.join(" / "),
    reading: word.reading || readings.join(" / ")
  };
};

export const enrichVocabularyList = (list = []) => list.map(enrichVocabularyWord);
