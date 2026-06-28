const HIRAGANA_RE = /[\u3041-\u3096\u309D-\u309F]/;
const KATAKANA_RE = /[\u30A1-\u30FA\u30FC\u30FD-\u30FF]/;
const KANJI_RE = /[\u4E00-\u9FFF]/;

const ROMAJI_MAP = new Map([
  ["きゃ", "kya"],
  ["きゅ", "kyu"],
  ["きょ", "kyo"],
  ["ぎゃ", "gya"],
  ["ぎゅ", "gyu"],
  ["ぎょ", "gyo"],
  ["しゃ", "sha"],
  ["しゅ", "shu"],
  ["しょ", "sho"],
  ["じゃ", "ja"],
  ["じゅ", "ju"],
  ["じょ", "jo"],
  ["ちゃ", "cha"],
  ["ちゅ", "chu"],
  ["ちょ", "cho"],
  ["にゃ", "nya"],
  ["にゅ", "nyu"],
  ["にょ", "nyo"],
  ["ひゃ", "hya"],
  ["ひゅ", "hyu"],
  ["ひょ", "hyo"],
  ["びゃ", "bya"],
  ["びゅ", "byu"],
  ["びょ", "byo"],
  ["ぴゃ", "pya"],
  ["ぴゅ", "pyu"],
  ["ぴょ", "pyo"],
  ["みゃ", "mya"],
  ["みゅ", "myu"],
  ["みょ", "myo"],
  ["りゃ", "rya"],
  ["りゅ", "ryu"],
  ["りょ", "ryo"],
  ["あ", "a"],
  ["い", "i"],
  ["う", "u"],
  ["え", "e"],
  ["お", "o"],
  ["か", "ka"],
  ["き", "ki"],
  ["く", "ku"],
  ["け", "ke"],
  ["こ", "ko"],
  ["さ", "sa"],
  ["し", "shi"],
  ["す", "su"],
  ["せ", "se"],
  ["そ", "so"],
  ["た", "ta"],
  ["ち", "chi"],
  ["つ", "tsu"],
  ["て", "te"],
  ["と", "to"],
  ["な", "na"],
  ["に", "ni"],
  ["ぬ", "nu"],
  ["ね", "ne"],
  ["の", "no"],
  ["は", "ha"],
  ["ひ", "hi"],
  ["ふ", "fu"],
  ["へ", "he"],
  ["ほ", "ho"],
  ["ま", "ma"],
  ["み", "mi"],
  ["む", "mu"],
  ["め", "me"],
  ["も", "mo"],
  ["や", "ya"],
  ["ゆ", "yu"],
  ["よ", "yo"],
  ["ら", "ra"],
  ["り", "ri"],
  ["る", "ru"],
  ["れ", "re"],
  ["ろ", "ro"],
  ["わ", "wa"],
  ["を", "wo"],
  ["ん", "n"],
  ["が", "ga"],
  ["ぎ", "gi"],
  ["ぐ", "gu"],
  ["げ", "ge"],
  ["ご", "go"],
  ["ざ", "za"],
  ["じ", "ji"],
  ["ず", "zu"],
  ["ぜ", "ze"],
  ["ぞ", "zo"],
  ["だ", "da"],
  ["ぢ", "ji"],
  ["づ", "zu"],
  ["で", "de"],
  ["ど", "do"],
  ["ば", "ba"],
  ["び", "bi"],
  ["ぶ", "bu"],
  ["べ", "be"],
  ["ぼ", "bo"],
  ["ぱ", "pa"],
  ["ぴ", "pi"],
  ["ぷ", "pu"],
  ["ぺ", "pe"],
  ["ぽ", "po"],
  ["ぁ", "a"],
  ["ぃ", "i"],
  ["ぅ", "u"],
  ["ぇ", "e"],
  ["ぉ", "o"],
  ["ゔ", "vu"],
  ["ア", "a"],
  ["イ", "i"],
  ["ウ", "u"],
  ["エ", "e"],
  ["オ", "o"],
  ["カ", "ka"],
  ["キ", "ki"],
  ["ク", "ku"],
  ["ケ", "ke"],
  ["コ", "ko"],
  ["サ", "sa"],
  ["シ", "shi"],
  ["ス", "su"],
  ["セ", "se"],
  ["ソ", "so"],
  ["タ", "ta"],
  ["チ", "chi"],
  ["ツ", "tsu"],
  ["テ", "te"],
  ["ト", "to"],
  ["ナ", "na"],
  ["ニ", "ni"],
  ["ヌ", "nu"],
  ["ネ", "ne"],
  ["ノ", "no"],
  ["ハ", "ha"],
  ["ヒ", "hi"],
  ["フ", "fu"],
  ["ヘ", "he"],
  ["ホ", "ho"],
  ["マ", "ma"],
  ["ミ", "mi"],
  ["ム", "mu"],
  ["メ", "me"],
  ["モ", "mo"],
  ["ヤ", "ya"],
  ["ユ", "yu"],
  ["ヨ", "yo"],
  ["ラ", "ra"],
  ["リ", "ri"],
  ["ル", "ru"],
  ["レ", "re"],
  ["ロ", "ro"],
  ["ワ", "wa"],
  ["ヲ", "wo"],
  ["ン", "n"],
  ["ガ", "ga"],
  ["ギ", "gi"],
  ["グ", "gu"],
  ["ゲ", "ge"],
  ["ゴ", "go"],
  ["ザ", "za"],
  ["ジ", "ji"],
  ["ズ", "zu"],
  ["ゼ", "ze"],
  ["ゾ", "zo"],
  ["ダ", "da"],
  ["ヂ", "ji"],
  ["ヅ", "zu"],
  ["デ", "de"],
  ["ド", "do"],
  ["バ", "ba"],
  ["ビ", "bi"],
  ["ブ", "bu"],
  ["ベ", "be"],
  ["ボ", "bo"],
  ["パ", "pa"],
  ["ピ", "pi"],
  ["プ", "pu"],
  ["ペ", "pe"],
  ["ポ", "po"],
  ["ァ", "a"],
  ["ィ", "i"],
  ["ゥ", "u"],
  ["ェ", "e"],
  ["ォ", "o"],
  ["ヴ", "vu"]
]);

const ROMAJI_KEYS = Array.from(ROMAJI_MAP.keys()).sort((a, b) => b.length - a.length);

export const hasHiragana = (text = "") => HIRAGANA_RE.test(text);

export const hasKatakana = (text = "") => KATAKANA_RE.test(text);

export const hasKanji = (text = "") => KANJI_RE.test(text);

const toHiraganaChar = (char) => {
  const code = char.codePointAt(0);

  if (code >= 0x30a1 && code <= 0x30f6) {
    return String.fromCodePoint(code - 0x60);
  }

  if (code === 0x30fc) {
    return "ー";
  }

  return char;
};

const lastVowel = (text) => {
  const match = text.match(/[aiueo]$/);
  return match ? match[0] : "";
};

export const toRomaji = (text = "") => {
  const normalized = text.replace(/\u3000/g, " ");
  let result = "";
  let i = 0;
  let geminateNext = false;

  while (i < normalized.length) {
    const current = normalized[i];

    if (current === "っ" || current === "ッ") {
      geminateNext = true;
      i += 1;
      continue;
    }

    if (current === "ー") {
      const vowel = lastVowel(result);
      result += vowel;
      i += 1;
      continue;
    }

    const currentHiragana = toHiraganaChar(current);
    const next = normalized[i + 1] ? toHiraganaChar(normalized[i + 1]) : "";
    const pair = `${currentHiragana}${next}`;

    let match = "";
    for (const key of ROMAJI_KEYS) {
      if (pair.startsWith(key)) {
        match = key;
        break;
      }
      if (currentHiragana === key) {
        match = key;
        break;
      }
    }

    if (match) {
      let romaji = ROMAJI_MAP.get(match);
      if (geminateNext && romaji) {
        romaji = `${romaji[0]}${romaji}`;
        geminateNext = false;
      }
      result += romaji;
      i += match.length === 2 && pair.startsWith(match) ? 2 : 1;
      continue;
    }

    result += current;
    geminateNext = false;
    i += 1;
  }

  return result;
};

export const getWordScripts = (word = {}) => {
  const scripts = new Set();
  const fields = [word.jp, word.kanji, word.hiragana, word.katakana, word.reading];

  if (fields.some(hasKanji)) {
    scripts.add("kanji");
  }

  if (fields.some(hasHiragana)) {
    scripts.add("hiragana");
  }

  if (fields.some(hasKatakana)) {
    scripts.add("katakana");
  }

  return Array.from(scripts);
};

export const getPrimaryScript = (word = {}) => {
  const scripts = getWordScripts(word);

  if (scripts.length === 0) {
    return "roman";
  }

  if (scripts.length > 1) {
    return "mixed";
  }

  return scripts[0];
};

export const getFrontText = (word = {}, preferredScript = "all") => {
  if (word.jp) {
    return word.jp;
  }

  if (preferredScript === "hiragana" && word.hiragana) {
    return word.hiragana;
  }

  if (preferredScript === "katakana" && word.katakana) {
    return word.katakana;
  }

  if (preferredScript === "kanji" && word.kanji) {
    return word.kanji;
  }

  return word.kanji || word.katakana || word.hiragana || word.romaji || "";
};

export const getReadingText = (word = {}) => {
  if (word.reading) {
    return word.reading;
  }

  if (word.romaji) {
    return word.romaji;
  }

  return toRomaji(word.jp || getFrontText(word));
};

export const matchesScriptFilter = (word = {}, filter = "all") => {
  if (filter === "all") {
    return true;
  }

  if (filter === "mixed") {
    return getPrimaryScript(word) === "mixed";
  }

  return getWordScripts(word).includes(filter);
};
