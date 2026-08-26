import JSZip from "jszip";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  extractPdfVocabulary,
  extractPptxVocabulary,
  parseLessonFile,
  suggestLessonMeta
} from "./lessonImportService";

// pdfjs-dist tải worker thật và cần môi trường trình duyệt, nên được thay bằng
// đôi giả để test tập trung vào logic gom dòng của lessonImportService.
vi.mock("pdfjs-dist/build/pdf.worker.min.mjs?url", () => ({ default: "worker-url" }));
vi.mock("pdfjs-dist", () => ({
  GlobalWorkerOptions: { workerSrc: "" },
  getDocument: vi.fn()
}));

const buildPptx = (files) => {
  const zip = new JSZip();

  Object.entries(files).forEach(([path, content]) => zip.file(path, content));

  return zip.generateAsync({ type: "arraybuffer" });
};

const slideXml = (...texts) =>
  `<?xml version="1.0"?><p:sld><p:cSld><p:spTree>${texts
    .map((text) => `<a:p><a:r><a:t>${text}</a:t></a:r></a:p>`)
    .join("")}</p:spTree></p:cSld></p:sld>`;

const textItem = (str, x, y) => ({ str, transform: [1, 0, 0, 1, x, y] });

const mockPdfPages = async (pages) => {
  const pdfjsLib = await import("pdfjs-dist");

  pdfjsLib.getDocument.mockReturnValue({
    promise: Promise.resolve({
      numPages: pages.length,
      getPage: (pageNumber) =>
        Promise.resolve({
          getTextContent: () => Promise.resolve({ items: pages[pageNumber - 1] })
        })
    })
  });

  return pdfjsLib;
};

describe("extractPptxVocabulary", () => {
  it("lấy mỗi slide thành một từ, kèm số thứ tự slide", async () => {
    const buffer = await buildPptx({
      "ppt/slides/slide1.xml": slideXml("せんせい"),
      "ppt/slides/slide2.xml": slideXml("がくせい")
    });

    expect(await extractPptxVocabulary(buffer)).toEqual([
      { jp: "せんせい", sourceSlide: 1 },
      { jp: "がくせい", sourceSlide: 2 }
    ]);
  });

  it("sắp slide theo SỐ chứ không theo thứ tự chuỗi", async () => {
    const buffer = await buildPptx({
      "ppt/slides/slide10.xml": slideXml("mười"),
      "ppt/slides/slide2.xml": slideXml("hai"),
      "ppt/slides/slide1.xml": slideXml("một")
    });

    expect((await extractPptxVocabulary(buffer)).map((word) => word.sourceSlide)).toEqual([1, 2, 10]);
  });

  it("nối mọi đoạn chữ trong cùng một slide thành một từ", async () => {
    const buffer = await buildPptx({
      "ppt/slides/slide1.xml": slideXml("せん", "せい")
    });

    expect((await extractPptxVocabulary(buffer))[0].jp).toBe("せんせい");
  });

  it("giải mã các thực thể XML", async () => {
    const buffer = await buildPptx({
      "ppt/slides/slide1.xml": slideXml("A&amp;B"),
      "ppt/slides/slide2.xml": slideXml("&#12354;"),
      "ppt/slides/slide3.xml": slideXml("&#x3042;"),
      "ppt/slides/slide4.xml": slideXml("&lt;x&gt;")
    });

    expect((await extractPptxVocabulary(buffer)).map((word) => word.jp)).toEqual([
      "A&B",
      "あ",
      "あ",
      "<x>"
    ]);
  });

  it("chuẩn hoá dấu cách toàn rộng và cắt khoảng trắng thừa", async () => {
    const buffer = await buildPptx({
      "ppt/slides/slide1.xml": slideXml("  あの　　ひと  ")
    });

    expect((await extractPptxVocabulary(buffer))[0].jp).toBe("あの ひと");
  });

  it("bỏ qua slide không có chữ nào", async () => {
    const buffer = await buildPptx({
      "ppt/slides/slide1.xml": slideXml("せんせい"),
      "ppt/slides/slide2.xml": slideXml("   "),
      "ppt/slides/slide3.xml": "<?xml version=\"1.0\"?><p:sld/>",
      "ppt/slides/slide4.xml": slideXml("がくせい")
    });

    expect(await extractPptxVocabulary(buffer)).toEqual([
      { jp: "せんせい", sourceSlide: 1 },
      { jp: "がくせい", sourceSlide: 4 }
    ]);
  });

  it("chỉ đọc file slide thật, bỏ qua file phụ trong gói pptx", async () => {
    const buffer = await buildPptx({
      "ppt/slides/slide1.xml": slideXml("せんせい"),
      "ppt/slides/_rels/slide1.xml.rels": slideXml("khong-phai-tu-vung"),
      "ppt/slideMasters/slideMaster1.xml": slideXml("khong-phai-tu-vung"),
      "ppt/notesSlides/notesSlide1.xml": slideXml("khong-phai-tu-vung"),
      "docProps/app.xml": slideXml("khong-phai-tu-vung")
    });

    expect(await extractPptxVocabulary(buffer)).toEqual([{ jp: "せんせい", sourceSlide: 1 }]);
  });

  it("báo lỗi rõ ràng khi file không chứa slide nào", async () => {
    const buffer = await buildPptx({ "docProps/app.xml": "<x/>" });

    await expect(extractPptxVocabulary(buffer)).rejects.toThrow(
      "Không tìm thấy slide nào trong file PowerPoint này."
    );
  });
});

describe("extractPdfVocabulary", () => {
  beforeEach(async () => {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.getDocument.mockReset();
  });

  it("gom các mẩu chữ cùng một dòng và sắp theo hoành độ", async () => {
    await mockPdfPages([[textItem("は", 30, 100), textItem("こんにち", 10, 101)]]);

    expect(await extractPdfVocabulary(new ArrayBuffer(8))).toEqual([
      { jp: "こんにちは", sourceSlide: 1 }
    ]);
  });

  it("đọc dòng từ trên xuống dưới", async () => {
    await mockPdfPages([
      [textItem("ね", 10, 200), textItem("こ", 20, 200), textItem("いぬ", 10, 50)]
    ]);

    expect((await extractPdfVocabulary(new ArrayBuffer(8))).map((word) => word.jp)).toEqual([
      "ねこ",
      "いぬ"
    ]);
  });

  it("coi lệch tung độ trong khoảng 2 là cùng một dòng", async () => {
    await mockPdfPages([
      [textItem("あ", 10, 100), textItem("い", 20, 102), textItem("う", 10, 103)]
    ]);

    expect((await extractPdfVocabulary(new ArrayBuffer(8))).map((word) => word.jp)).toEqual([
      "う",
      "あい"
    ]);
  });

  it("đánh số thứ tự liên tục qua nhiều trang", async () => {
    await mockPdfPages([
      [textItem("いち", 0, 100)],
      [textItem("に", 0, 100), textItem("さん", 0, 50)]
    ]);

    expect(await extractPdfVocabulary(new ArrayBuffer(8))).toEqual([
      { jp: "いち", sourceSlide: 1 },
      { jp: "に", sourceSlide: 2 },
      { jp: "さん", sourceSlide: 3 }
    ]);
  });

  it("bỏ qua dòng trắng và chuẩn hoá dấu cách toàn rộng", async () => {
    await mockPdfPages([[textItem("   ", 0, 200), textItem("あの　ひと", 0, 100)]]);

    expect((await extractPdfVocabulary(new ArrayBuffer(8))).map((word) => word.jp)).toEqual([
      "あの ひと"
    ]);
  });

  it("báo lỗi khi PDF không đọc được chữ nào (file ảnh scan)", async () => {
    await mockPdfPages([[]]);

    await expect(extractPdfVocabulary(new ArrayBuffer(8))).rejects.toThrow(
      "Không đọc được chữ nào trong file PDF này (có thể là file ảnh scan)."
    );
  });
});

describe("parseLessonFile", () => {
  it("từ chối định dạng ngoài .pptx và .pdf", async () => {
    const file = new File(["noi dung"], "tu-vung.txt");

    await expect(parseLessonFile(file)).rejects.toThrow("Chỉ hỗ trợ file .pptx hoặc .pdf.");
  });

  it("đọc được file .pptx", async () => {
    const buffer = await buildPptx({ "ppt/slides/slide1.xml": slideXml("せんせい") });
    const file = new File([buffer], "Bai 1.pptx");

    expect(await parseLessonFile(file)).toEqual([{ jp: "せんせい", sourceSlide: 1 }]);
  });

  it("nhận cả phần mở rộng viết hoa", async () => {
    const buffer = await buildPptx({ "ppt/slides/slide1.xml": slideXml("せんせい") });
    const file = new File([buffer], "BAI 1.PPTX");

    expect(await parseLessonFile(file)).toHaveLength(1);
  });

  it("định tuyến file .pdf sang bộ đọc PDF", async () => {
    await mockPdfPages([[textItem("ねこ", 0, 100)]]);
    const file = new File(["%PDF-"], "tu-vung.pdf");

    expect(await parseLessonFile(file)).toEqual([{ jp: "ねこ", sourceSlide: 1 }]);
  });
});

describe("suggestLessonMeta", () => {
  const words = [
    { meaning: "giáo viên" },
    { meaning: "học sinh, sinh viên" },
    { meaning: "bác sĩ" },
    { meaning: "bệnh viện" }
  ];

  it("trả về gợi ý rỗng khi chưa tra được nghĩa nào", () => {
    expect(suggestLessonMeta([])).toEqual({ title: "", subtitle: "", focus: "" });
    expect(suggestLessonMeta()).toEqual({ title: "", subtitle: "", focus: "" });
    expect(suggestLessonMeta([{ jp: "ねこ" }])).toEqual({ title: "", subtitle: "", focus: "" });
  });

  it("chỉ lấy nghĩa đầu tiên trước dấu / hoặc dấu phẩy", () => {
    expect(suggestLessonMeta([{ meaning: "học sinh, sinh viên" }]).title).toBe("Học sinh");
    expect(suggestLessonMeta([{ meaning: "xe/ô tô" }]).title).toBe("Xe");
  });

  it("đặt tiêu đề từ 3 nghĩa đầu, viết hoa chữ cái đầu", () => {
    expect(suggestLessonMeta(words).title).toBe("Giáo viên, Học sinh, Bác sĩ");
  });

  it("mô tả ngắn liệt kê tối đa 6 nghĩa", () => {
    expect(suggestLessonMeta(words).subtitle).toBe(
      "Từ vựng về: giáo viên, học sinh, bác sĩ, bệnh viện"
    );
  });

  it("trọng tâm liệt kê tối đa 5 nghĩa và kết thúc bằng dấu chấm", () => {
    expect(suggestLessonMeta(words).focus).toBe(
      "Học cách dùng các từ: giáo viên, học sinh, bác sĩ, bệnh viện."
    );
  });

  it("khử trùng lặp không phân biệt hoa thường", () => {
    const meta = suggestLessonMeta([
      { meaning: "giáo viên" },
      { meaning: "Giáo Viên" },
      { meaning: "bác sĩ" }
    ]);

    expect(meta.title).toBe("Giáo viên, Bác sĩ");
  });

  it("bỏ qua từ chưa có nghĩa", () => {
    expect(suggestLessonMeta([{ jp: "ねこ" }, { meaning: "con mèo" }]).title).toBe("Con mèo");
  });
});
