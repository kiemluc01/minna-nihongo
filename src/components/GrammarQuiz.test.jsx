import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import GrammarQuiz from "./GrammarQuiz";
import SpeechController from "../controllers/SpeechController";

vi.mock("../controllers/SpeechController", () => ({
  default: { speak: vi.fn(), speakSequence: vi.fn() }
}));

const props = {
  question: "わたし_____ がくせいです。",
  answer: "は",
  options: ["は", "を", "に", "の"]
};

describe("GrammarQuiz — hiển thị", () => {
  it("hiện câu hỏi và đủ các phương án", () => {
    render(<GrammarQuiz {...props} />);

    expect(screen.getByRole("heading", { name: props.question })).toBeInTheDocument();
    props.options.forEach((option) => {
      expect(screen.getByRole("button", { name: option })).toBeInTheDocument();
    });
  });

  it("chưa chấm gì khi người học chưa chọn", () => {
    render(<GrammarQuiz {...props} />);

    expect(screen.queryByText("✅ Chính xác")).not.toBeInTheDocument();
    expect(screen.queryByText("❌ Sai")).not.toBeInTheDocument();
  });
});

describe("GrammarQuiz — chấm điểm", () => {
  it("báo đúng khi chọn trúng đáp án", async () => {
    const user = userEvent.setup();
    render(<GrammarQuiz {...props} />);

    await user.click(screen.getByRole("button", { name: "は" }));

    expect(screen.getByText("✅ Chính xác")).toBeInTheDocument();
  });

  it("báo sai khi chọn nhầm", async () => {
    const user = userEvent.setup();
    render(<GrammarQuiz {...props} />);

    await user.click(screen.getByRole("button", { name: "を" }));

    expect(screen.getByText("❌ Sai")).toBeInTheDocument();
  });

  it("cho chọn lại và cập nhật kết quả", async () => {
    const user = userEvent.setup();
    render(<GrammarQuiz {...props} />);

    await user.click(screen.getByRole("button", { name: "を" }));
    await user.click(screen.getByRole("button", { name: "は" }));

    expect(screen.getByText("✅ Chính xác")).toBeInTheDocument();
    expect(screen.queryByText("❌ Sai")).not.toBeInTheDocument();
  });

  it("đánh dấu phương án đang chọn", async () => {
    const user = userEvent.setup();
    render(<GrammarQuiz {...props} />);

    await user.click(screen.getByRole("button", { name: "を" }));

    expect(screen.getByRole("button", { name: "を" })).toHaveClass("is-selected");
    expect(screen.getByRole("button", { name: "は" })).not.toHaveClass("is-selected");
  });
});

describe("GrammarQuiz — nghe câu hỏi", () => {
  it("đọc câu đã điền lựa chọn của người học", async () => {
    const user = userEvent.setup();
    render(<GrammarQuiz {...props} />);

    await user.click(screen.getByRole("button", { name: "を" }));
    await user.click(screen.getByRole("button", { name: "Nghe câu hỏi" }));

    expect(SpeechController.speak).toHaveBeenCalledWith("わたしを がくせいです。");
  });

  // BUG: speakQuestion (GrammarQuiz.jsx:26) dùng `picked || answer`, nên khi chưa
  // chọn gì mà bấm nút loa thì app ĐỌC TO đáp án đúng — lộ đáp án trước khi trả lời.
  it.fails("KHÔNG được đọc đáp án khi người học chưa chọn", async () => {
    const user = userEvent.setup();
    render(<GrammarQuiz {...props} />);

    await user.click(screen.getByRole("button", { name: "Nghe câu hỏi" }));

    expect(SpeechController.speak).not.toHaveBeenCalledWith("わたしは がくせいです。");
  });
});
