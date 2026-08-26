import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import GrammarExamPage from "./GrammarExamPage";

// Dùng một bài tự thêm với đúng 1 từ và 1 mẫu ngữ pháp để đề sinh ra là tất định,
// không phụ thuộc nội dung các bài có sẵn trong src/data.
const CUSTOM_LESSON = {
  id: 99,
  title: "Bài kiểm thử",
  subtitle: "Mô tả",
  focus: "Trọng tâm",
  roadmapSteps: [],
  vocabulary: [{ id: 1, jp: "ねこ", meaning: "con mèo" }],
  grammarNotes: [{ title: "は", detail: "Trợ từ chủ đề", example: "これは ねこです。" }]
};

const seedLesson = () =>
  localStorage.setItem("n5_custom_lessons", JSON.stringify([CUSTOM_LESSON]));

const renderPage = () =>
  render(
    <MemoryRouter>
      <GrammarExamPage />
    </MemoryRouter>
  );

const selectTestLesson = async (user) => {
  seedLesson();
  renderPage();
  await user.click(screen.getByRole("button", { name: "Bài 99" }));
};

describe("GrammarExamPage — chọn phạm vi", () => {
  it("chưa chọn bài thì không cho tạo đề", () => {
    renderPage();

    expect(screen.getByRole("button", { name: "Tạo đề" })).toBeDisabled();
    expect(screen.getByText("Chọn ít nhất một bài để tạo đề.")).toBeInTheDocument();
  });

  it("liệt kê mọi bài học, gồm cả bài tự thêm", () => {
    seedLesson();
    renderPage();

    expect(screen.getByRole("button", { name: "Bài 1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Bài 99" })).toBeInTheDocument();
  });

  it("hiện số từ vựng và ngữ pháp có trong phạm vi đã chọn", async () => {
    const user = userEvent.setup();
    await selectTestLesson(user);

    expect(screen.getByText("1 từ · 1 ngữ pháp")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tạo đề" })).toBeEnabled();
  });

  it("bỏ chọn bài thì quay lại trạng thái chưa tạo được đề", async () => {
    const user = userEvent.setup();
    await selectTestLesson(user);

    await user.click(screen.getByRole("button", { name: "Bài 99" }));

    expect(screen.getByRole("button", { name: "Tạo đề" })).toBeDisabled();
  });
});

describe("GrammarExamPage — làm đề trắc nghiệm", () => {
  const generateExam = async (user) => {
    await selectTestLesson(user);
    await user.click(screen.getByRole("button", { name: "Tạo đề" }));
  };

  it("tạo đủ một câu từ vựng và một câu ngữ pháp, mỗi câu ghi rõ loại", async () => {
    const user = userEvent.setup();
    await generateExam(user);

    expect(screen.getByText(/Từ vựng · Bài 99/)).toBeInTheDocument();
    expect(screen.getByText(/Ngữ pháp · Bài 99/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "ねこ" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "これ_____ ねこです。" })).toBeInTheDocument();
  });

  it("chưa nộp bài thì chưa hiện kết quả", async () => {
    const user = userEvent.setup();
    await generateExam(user);

    expect(screen.queryByRole("heading", { name: "Kết quả" })).not.toBeInTheDocument();
  });

  it("chấm đủ điểm khi trả lời đúng hết", async () => {
    const user = userEvent.setup();
    await generateExam(user);

    await user.click(screen.getByRole("button", { name: "con mèo" }));
    await user.click(screen.getByRole("button", { name: "は" }));
    await user.click(screen.getByRole("button", { name: "Nộp bài" }));

    expect(screen.getByRole("heading", { name: "Kết quả" })).toBeInTheDocument();
    expect(screen.getByText("2/2 (100%)")).toBeInTheDocument();
    expect(screen.getAllByText("✅ Đúng")).toHaveLength(2);
  });

  it("hiện đáp án đúng cho câu trả lời sai", async () => {
    const user = userEvent.setup();
    await generateExam(user);

    await user.click(screen.getByRole("button", { name: "con mèo" }));
    await user.click(screen.getByRole("button", { name: "Nộp bài" }));

    expect(screen.getByText("1/2 (50%)")).toBeInTheDocument();
    expect(screen.getByText("❌ Đáp án: は")).toBeInTheDocument();
  });

  it("hiện giải thích ngữ pháp sau khi nộp bài", async () => {
    const user = userEvent.setup();
    await generateExam(user);

    await user.click(screen.getByRole("button", { name: "Nộp bài" }));

    expect(screen.getByText("Trợ từ chủ đề")).toBeInTheDocument();
  });

  it("không cho đổi đáp án sau khi đã nộp bài", async () => {
    const user = userEvent.setup();
    await generateExam(user);

    await user.click(screen.getByRole("button", { name: "Nộp bài" }));
    await user.click(screen.getByRole("button", { name: "con mèo" }));

    expect(screen.getByText("0/2 (0%)")).toBeInTheDocument();
  });

  it("cho làm đề khác sau khi nộp bài", async () => {
    const user = userEvent.setup();
    await generateExam(user);

    await user.click(screen.getByRole("button", { name: "Nộp bài" }));
    await user.click(screen.getByRole("button", { name: "Làm đề khác" }));

    expect(screen.queryByRole("heading", { name: "Kết quả" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Nộp bài" })).toBeInTheDocument();
  });
});

describe("GrammarExamPage — làm đề điền từ", () => {
  it("hiện ô nhập thay cho nút chọn", async () => {
    const user = userEvent.setup();
    await selectTestLesson(user);

    await user.click(screen.getByRole("button", { name: "Điền từ" }));
    await user.click(screen.getByRole("button", { name: "Tạo đề" }));

    expect(screen.getByPlaceholderText("Nhập nghĩa tiếng Việt")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Nhập từ/mẫu ngữ pháp còn thiếu")).toBeInTheDocument();
  });

  it("chấm đúng đáp án gõ tay", async () => {
    const user = userEvent.setup();
    await selectTestLesson(user);

    await user.click(screen.getByRole("button", { name: "Điền từ" }));
    await user.click(screen.getByRole("button", { name: "Tạo đề" }));

    await user.type(screen.getByPlaceholderText("Nhập nghĩa tiếng Việt"), "con mèo");
    await user.type(screen.getByPlaceholderText("Nhập từ/mẫu ngữ pháp còn thiếu"), "は");
    await user.click(screen.getByRole("button", { name: "Nộp bài" }));

    expect(screen.getByText("2/2 (100%)")).toBeInTheDocument();
  });

  it("khoá ô nhập sau khi nộp bài", async () => {
    const user = userEvent.setup();
    await selectTestLesson(user);

    await user.click(screen.getByRole("button", { name: "Điền từ" }));
    await user.click(screen.getByRole("button", { name: "Tạo đề" }));
    await user.click(screen.getByRole("button", { name: "Nộp bài" }));

    expect(screen.getByPlaceholderText("Nhập nghĩa tiếng Việt")).toBeDisabled();
  });
});

describe("GrammarExamPage — giới hạn số câu", () => {
  it("báo rõ khi số câu yêu cầu vượt quá số mục có trong phạm vi", async () => {
    const user = userEvent.setup();
    await selectTestLesson(user);

    await user.click(screen.getByRole("button", { name: "Tạo đề" }));

    expect(screen.getByText(/giới hạn bởi phạm vi/)).toBeInTheDocument();
  });

  it("tôn trọng số câu người dùng nhập", async () => {
    const user = userEvent.setup();
    await selectTestLesson(user);

    await user.clear(screen.getByLabelText("Số câu ngữ pháp"));
    await user.type(screen.getByLabelText("Số câu ngữ pháp"), "0");
    await user.click(screen.getByRole("button", { name: "Tạo đề" }));

    expect(screen.getByText(/Từ vựng · Bài 99/)).toBeInTheDocument();
    expect(screen.queryByText(/Ngữ pháp · Bài 99/)).not.toBeInTheDocument();
  });
});
