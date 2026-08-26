import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import KaiwaSection from "./KaiwaSection";
import SpeechController from "../../controllers/SpeechController";
import { getKaiwa, saveKaiwa } from "../../services/kaiwaService";
import { stubRandom } from "../../test/helpers/random";

vi.mock("../../controllers/SpeechController", () => ({
  default: { speak: vi.fn(), speakSequence: vi.fn() }
}));

const LESSON_ID = 1;

const sampleKaiwa = {
  speakers: [
    { id: 1, name: "Tanaka" },
    { id: 2, name: "Yamada" }
  ],
  lines: [
    { id: 1, speakerId: 1, text: "おはようございます。", translation: "Chào buổi sáng." },
    { id: 2, speakerId: 2, text: "こんにちは。", translation: "" },
    { id: 3, speakerId: 1, text: "こんばんは。", translation: "" }
  ]
};

let audioController;

beforeEach(() => {
  audioController = { pause: vi.fn(), resume: vi.fn(), stop: vi.fn() };
  SpeechController.speakSequence.mockImplementation(() => audioController);
});

const renderSection = () => render(<KaiwaSection lessonId={LESSON_ID} />);

const seedKaiwa = () => saveKaiwa(LESSON_ID, sampleKaiwa);

describe("KaiwaSection — bài chưa có hội thoại", () => {
  it("mở ở bước khai báo người tham gia", () => {
    renderSection();

    expect(screen.getByRole("heading", { name: "Tạo hội thoại" })).toBeInTheDocument();
    expect(screen.getByLabelText("Số người")).toHaveValue(2);
    expect(screen.getByPlaceholderText("Vd: Người 1")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Vd: Người 2")).toBeInTheDocument();
  });

  it("tăng số ô nhập tên khi tăng số người", async () => {
    const user = userEvent.setup();
    renderSection();

    await user.clear(screen.getByLabelText("Số người"));
    await user.type(screen.getByLabelText("Số người"), "4");

    expect(screen.getByPlaceholderText("Vd: Người 4")).toBeInTheDocument();
  });

  it("giới hạn số người trong khoảng 2 đến 6", async () => {
    const user = userEvent.setup();
    renderSection();

    await user.clear(screen.getByLabelText("Số người"));
    await user.type(screen.getByLabelText("Số người"), "9");

    expect(screen.getByLabelText("Số người")).toHaveValue(6);
    expect(screen.queryByPlaceholderText("Vd: Người 7")).not.toBeInTheDocument();
  });

  it("đặt tên mặc định cho người nói bỏ trống", async () => {
    const user = userEvent.setup();
    renderSection();

    await user.type(screen.getByPlaceholderText("Vd: Người 1"), "Tanaka");
    await user.click(screen.getByRole("button", { name: "Bắt đầu hội thoại" }));

    const speakerSelect = screen.getByRole("combobox");
    expect(within(speakerSelect).getByRole("option", { name: "Tanaka" })).toBeInTheDocument();
    expect(within(speakerSelect).getByRole("option", { name: "Người 2" })).toBeInTheDocument();
  });
});

describe("KaiwaSection — nhập nội dung hội thoại", () => {
  const startEditing = async (user) => {
    renderSection();
    await user.click(screen.getByRole("button", { name: "Bắt đầu hội thoại" }));
  };

  it("bắt đầu với đúng một câu thoại trống", async () => {
    const user = userEvent.setup();
    await startEditing(user);

    expect(screen.getByRole("heading", { name: "Nhập nội dung hội thoại" })).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText("Vd: わたしは ベトナムじんです。")).toHaveLength(1);
  });

  it("không cho xóa khi chỉ còn một câu", async () => {
    const user = userEvent.setup();
    await startEditing(user);

    expect(screen.queryByRole("button", { name: "Xóa" })).not.toBeInTheDocument();
  });

  it("thêm và xóa được câu thoại", async () => {
    const user = userEvent.setup();
    await startEditing(user);

    await user.click(screen.getByRole("button", { name: "+ Thêm câu" }));
    expect(screen.getAllByPlaceholderText("Vd: わたしは ベトナムじんです。")).toHaveLength(2);

    await user.click(screen.getAllByRole("button", { name: "Xóa" })[0]);
    expect(screen.getAllByPlaceholderText("Vd: わたしは ベトナムじんです。")).toHaveLength(1);
  });

  it("báo lỗi khi lưu mà chưa nhập câu nào", async () => {
    const user = userEvent.setup();
    await startEditing(user);

    await user.click(screen.getByRole("button", { name: "Lưu hội thoại" }));

    expect(screen.getByText("Vui lòng nhập ít nhất một câu thoại.")).toBeInTheDocument();
    expect(getKaiwa(LESSON_ID)).toBeNull();
  });

  it("lưu hội thoại và chuyển sang chế độ xem", async () => {
    const user = userEvent.setup();
    await startEditing(user);

    await user.type(
      screen.getByPlaceholderText("Vd: わたしは ベトナムじんです。"),
      "おはようございます。"
    );
    await user.type(screen.getByPlaceholderText("Vd: Tôi là người Việt Nam."), "Chào buổi sáng.");
    await user.click(screen.getByRole("button", { name: "Lưu hội thoại" }));

    expect(getKaiwa(LESSON_ID)).toEqual({
      speakers: [
        { id: 1, name: "Người 1" },
        { id: 2, name: "Người 2" }
      ],
      lines: [
        { id: 1, speakerId: 1, text: "おはようございます。", translation: "Chào buổi sáng." }
      ]
    });
    expect(screen.getByRole("heading", { name: "Hội thoại" })).toBeInTheDocument();
  });

  it("bỏ qua câu để trống khi lưu", async () => {
    const user = userEvent.setup();
    await startEditing(user);

    await user.click(screen.getByRole("button", { name: "+ Thêm câu" }));
    await user.type(
      screen.getAllByPlaceholderText("Vd: わたしは ベトナムじんです。")[1],
      "こんにちは。"
    );
    await user.click(screen.getByRole("button", { name: "Lưu hội thoại" }));

    expect(getKaiwa(LESSON_ID).lines).toEqual([
      { id: 1, speakerId: 1, text: "こんにちは。", translation: "" }
    ]);
  });

  it("bấm Hủy thì quay lại bước khai báo mà không lưu gì", async () => {
    const user = userEvent.setup();
    await startEditing(user);

    await user.click(screen.getByRole("button", { name: "Hủy" }));

    expect(screen.getByRole("heading", { name: "Tạo hội thoại" })).toBeInTheDocument();
    expect(getKaiwa(LESSON_ID)).toBeNull();
  });
});

describe("KaiwaSection — xem hội thoại đã lưu", () => {
  it("hiện người nói, lời thoại và dịch nghĩa", () => {
    seedKaiwa();
    renderSection();

    expect(screen.getAllByText("Tanaka：")).toHaveLength(2);
    expect(screen.getByText("Yamada：")).toBeInTheDocument();
    expect(screen.getByText("おはようございます。")).toBeInTheDocument();
    expect(screen.getByText("Chào buổi sáng.")).toBeInTheDocument();
  });

  it("mở thẳng chế độ xem chứ không hỏi lại số người", () => {
    seedKaiwa();
    renderSection();

    expect(screen.queryByRole("heading", { name: "Tạo hội thoại" })).not.toBeInTheDocument();
  });

  it("sửa hội thoại thì điền sẵn nội dung cũ", async () => {
    const user = userEvent.setup();
    seedKaiwa();
    renderSection();

    await user.click(screen.getByRole("button", { name: "Sửa hội thoại" }));

    const inputs = screen.getAllByPlaceholderText("Vd: わたしは ベトナムじんです。");
    expect(inputs).toHaveLength(3);
    expect(inputs[0]).toHaveValue("おはようございます。");
  });

  it("xóa hội thoại sau khi người dùng xác nhận", async () => {
    const user = userEvent.setup();
    vi.spyOn(window, "confirm").mockReturnValue(true);
    seedKaiwa();
    renderSection();

    await user.click(screen.getByRole("button", { name: "Xóa" }));

    expect(getKaiwa(LESSON_ID)).toBeNull();
    expect(screen.getByRole("heading", { name: "Tạo hội thoại" })).toBeInTheDocument();
  });

  it("không xóa khi người dùng bấm hủy ở hộp xác nhận", async () => {
    const user = userEvent.setup();
    vi.spyOn(window, "confirm").mockReturnValue(false);
    seedKaiwa();
    renderSection();

    await user.click(screen.getByRole("button", { name: "Xóa" }));

    expect(getKaiwa(LESSON_ID)).toEqual(sampleKaiwa);
  });
});

describe("KaiwaSection — nghe hội thoại", () => {
  it("đọc lần lượt đúng các câu thoại", async () => {
    const user = userEvent.setup();
    seedKaiwa();
    renderSection();

    await user.click(screen.getByRole("button", { name: "🔊 Nghe hội thoại" }));

    expect(SpeechController.speakSequence).toHaveBeenCalledWith(
      ["おはようございます。", "こんにちは。", "こんばんは。"],
      expect.objectContaining({ onLineStart: expect.any(Function), onEnd: expect.any(Function) })
    );
  });

  it("chuyển nút sang Tạm dừng khi đang đọc", async () => {
    const user = userEvent.setup();
    seedKaiwa();
    renderSection();

    await user.click(screen.getByRole("button", { name: "🔊 Nghe hội thoại" }));

    expect(screen.getByRole("button", { name: "⏸ Tạm dừng" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "⏹ Dừng" })).toBeInTheDocument();
  });

  it("tạm dừng rồi tiếp tục gọi đúng bộ điều khiển", async () => {
    const user = userEvent.setup();
    seedKaiwa();
    renderSection();

    await user.click(screen.getByRole("button", { name: "🔊 Nghe hội thoại" }));
    await user.click(screen.getByRole("button", { name: "⏸ Tạm dừng" }));
    expect(audioController.pause).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "▶ Tiếp tục" }));
    expect(audioController.resume).toHaveBeenCalledTimes(1);
  });

  it("dừng hẳn thì quay lại nút nghe ban đầu", async () => {
    const user = userEvent.setup();
    seedKaiwa();
    renderSection();

    await user.click(screen.getByRole("button", { name: "🔊 Nghe hội thoại" }));
    await user.click(screen.getByRole("button", { name: "⏹ Dừng" }));

    expect(audioController.stop).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "🔊 Nghe hội thoại" })).toBeInTheDocument();
  });
});

describe("KaiwaSection — bài tập đục lỗ", () => {
  it("ẩn đoạn hội thoại mẫu khi đang làm bài để không lộ đáp án", async () => {
    const user = userEvent.setup();
    seedKaiwa();
    renderSection();

    await user.click(screen.getByRole("button", { name: "Tạo bài tập" }));

    expect(screen.queryByRole("heading", { name: "Hội thoại" })).not.toBeInTheDocument();
    expect(
      screen.getByText("Đoạn hội thoại mẫu đang được ẩn để tránh lộ đáp án khi làm bài.")
    ).toBeInTheDocument();
  });

  it("chấm đúng khi chọn trúng đáp án", async () => {
    const user = userEvent.setup();
    stubRandom([0, 0.9]);
    seedKaiwa();
    renderSection();

    await user.click(screen.getByRole("button", { name: "Tạo bài tập" }));
    await user.click(screen.getByRole("button", { name: "おはようございます。" }));
    await user.click(screen.getByRole("button", { name: "Nộp bài" }));

    expect(screen.getByText("✅ Đúng")).toBeInTheDocument();
  });

  it("hiện đáp án đúng khi chọn nhầm", async () => {
    const user = userEvent.setup();
    stubRandom([0, 0.9]);
    seedKaiwa();
    renderSection();

    await user.click(screen.getByRole("button", { name: "Tạo bài tập" }));
    await user.click(screen.getByRole("button", { name: "こんにちは。" }));
    await user.click(screen.getByRole("button", { name: "Nộp bài" }));

    expect(screen.getByText("❌ Đáp án: おはようございます。")).toBeInTheDocument();
  });

  it("không cho đổi lựa chọn sau khi đã nộp bài", async () => {
    const user = userEvent.setup();
    stubRandom([0, 0.9]);
    seedKaiwa();
    renderSection();

    await user.click(screen.getByRole("button", { name: "Tạo bài tập" }));
    await user.click(screen.getByRole("button", { name: "こんにちは。" }));
    await user.click(screen.getByRole("button", { name: "Nộp bài" }));
    await user.click(screen.getByRole("button", { name: "おはようございます。" }));

    expect(screen.getByText("❌ Đáp án: おはようございます。")).toBeInTheDocument();
  });

  it('dạng "Điền từ" cho ô nhập thay vì nút chọn', async () => {
    const user = userEvent.setup();
    stubRandom([0, 0.9]);
    seedKaiwa();
    renderSection();

    await user.click(screen.getByRole("button", { name: "Điền từ" }));
    await user.click(screen.getByRole("button", { name: "Tạo bài tập" }));

    expect(screen.getByPlaceholderText("Nhập cả câu còn thiếu")).toBeInTheDocument();
  });

  it("chấm đúng đáp án gõ tay ở dạng điền từ", async () => {
    const user = userEvent.setup();
    stubRandom([0, 0.9]);
    seedKaiwa();
    renderSection();

    await user.click(screen.getByRole("button", { name: "Điền từ" }));
    await user.click(screen.getByRole("button", { name: "Tạo bài tập" }));
    await user.type(screen.getByPlaceholderText("Nhập cả câu còn thiếu"), "おはようございます。");
    await user.click(screen.getByRole("button", { name: "Nộp bài" }));

    expect(screen.getByText("✅ Đúng")).toBeInTheDocument();
  });

  it("nghe cả đoạn dùng văn bản gốc chưa đục lỗ", async () => {
    const user = userEvent.setup();
    stubRandom([0, 0.9]);
    seedKaiwa();
    renderSection();

    await user.click(screen.getByRole("button", { name: "Tạo bài tập" }));
    await user.click(screen.getByRole("button", { name: "🔊 Nghe cả đoạn" }));

    expect(SpeechController.speakSequence).toHaveBeenCalledWith(
      ["おはようございます。", "こんにちは。", "こんばんは。"],
      expect.anything()
    );
  });

  it("đóng bài tập thì hiện lại đoạn hội thoại", async () => {
    const user = userEvent.setup();
    seedKaiwa();
    renderSection();

    await user.click(screen.getByRole("button", { name: "Tạo bài tập" }));
    await user.click(screen.getByRole("button", { name: "Đóng bài tập" }));

    expect(screen.getByRole("heading", { name: "Hội thoại" })).toBeInTheDocument();
  });
});
