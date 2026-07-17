// Quét file PPT/PDF (như các file "Bai 1.pptx" .. "Bai 7.pptx" đang dùng) để tự
// động rút trích danh sách từ vựng thô, giúp tạo bài học mới nhanh hơn thay vì
// gõ tay từng từ. Mỗi slide (pptx) hoặc mỗi dòng văn bản (pdf) tương ứng với
// một từ, đúng theo cách dữ liệu src/data/vocabulary/lessonN.js hiện có được
// xây dựng thủ công từ các file pptx gốc.

const XML_ENTITIES = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'"
};

const decodeXmlEntities = (text) =>
  text
    .replace(/&(amp|lt|gt|quot|apos);/g, (_, name) => XML_ENTITIES[name])
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)));

const normalizeExtractedText = (text) =>
  text
    .replace(/\u3000/g, " ")
    .replace(/[ \t]+/g, " ")
    .trim();

const slideNumberOf = (path) => {
  const match = path.match(/slide(\d+)\.xml$/);
  return match ? Number(match[1]) : null;
};

export const extractPptxVocabulary = async (arrayBuffer) => {
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(arrayBuffer);

  const slideEntries = Object.keys(zip.files)
    .map((path) => ({ path, number: slideNumberOf(path) }))
    .filter((entry) => entry.number !== null && /^ppt\/slides\/slide\d+\.xml$/.test(entry.path))
    .sort((a, b) => a.number - b.number);

  if (slideEntries.length === 0) {
    throw new Error("Không tìm thấy slide nào trong file PowerPoint này.");
  }

  const vocabulary = [];

  for (const entry of slideEntries) {
    const xml = await zip.files[entry.path].async("string");
    const runs = [...xml.matchAll(/<a:t>(.*?)<\/a:t>/gs)].map((match) => decodeXmlEntities(match[1]));
    const jp = normalizeExtractedText(runs.join(""));

    if (jp) {
      vocabulary.push({ jp, sourceSlide: entry.number });
    }
  }

  return vocabulary;
};

const groupTextItemsIntoLines = (items) => {
  const lines = [];

  items.forEach((item) => {
    const y = Math.round(item.transform[5]);
    let line = lines.find((candidate) => Math.abs(candidate.y - y) <= 2);

    if (!line) {
      line = { y, parts: [] };
      lines.push(line);
    }

    line.parts.push({ x: item.transform[4], text: item.str });
  });

  return lines
    .sort((a, b) => b.y - a.y)
    .map((line) =>
      normalizeExtractedText(
        line.parts
          .sort((a, b) => a.x - b.x)
          .map((part) => part.text)
          .join("")
      )
    )
    .filter(Boolean);
};

export const extractPdfVocabulary = async (arrayBuffer) => {
  const pdfjsLib = await import("pdfjs-dist");
  const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const vocabulary = [];
  let counter = 0;

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const lines = groupTextItemsIntoLines(textContent.items);

    lines.forEach((jp) => {
      counter += 1;
      vocabulary.push({ jp, sourceSlide: counter });
    });
  }

  if (vocabulary.length === 0) {
    throw new Error("Không đọc được chữ nào trong file PDF này (có thể là file ảnh scan).");
  }

  return vocabulary;
};

// File pptx/pdf gốc không hề chứa tiêu đề, mô tả hay ngữ pháp (đã kiểm chứng: chỉ
// có danh sách từ vựng thô) nên không thể "quét" ra các trường này thật sự. Hàm
// này chỉ GỢI Ý tiêu đề/mô tả/trọng tâm dựa trên nghĩa tiếng Việt đã tra được của
// các từ vừa quét (word.meaning từ enrichVocabularyList) — là một suy đoán để
// người dùng chỉnh sửa lại, không phải dữ liệu trích xuất chính xác.
const firstMeaning = (meaning = "") => meaning.split(/[/,]/)[0].trim();

const capitalize = (text) => (text ? text.charAt(0).toUpperCase() + text.slice(1) : text);

export const suggestLessonMeta = (enrichedVocabulary = []) => {
  const seen = new Set();
  const uniqueMeanings = [];

  enrichedVocabulary.forEach((word) => {
    const meaning = firstMeaning(word.meaning);
    const key = meaning.toLowerCase();

    if (meaning && !seen.has(key)) {
      seen.add(key);
      uniqueMeanings.push(meaning);
    }
  });

  if (uniqueMeanings.length === 0) {
    return { title: "", subtitle: "", focus: "" };
  }

  const title = uniqueMeanings.slice(0, 3).map(capitalize).join(", ");
  const subtitle = `Từ vựng về: ${uniqueMeanings.slice(0, 6).join(", ")}`;
  const focus = `Học cách dùng các từ: ${uniqueMeanings.slice(0, 5).join(", ")}.`;

  return { title, subtitle, focus };
};

export const parseLessonFile = async (file) => {
  const name = file.name.toLowerCase();
  const arrayBuffer = await file.arrayBuffer();

  if (name.endsWith(".pptx")) {
    return extractPptxVocabulary(arrayBuffer);
  }

  if (name.endsWith(".pdf")) {
    return extractPdfVocabulary(arrayBuffer);
  }

  throw new Error("Chỉ hỗ trợ file .pptx hoặc .pdf.");
};
