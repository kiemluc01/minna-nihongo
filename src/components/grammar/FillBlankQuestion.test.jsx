import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import FillBlankQuestion from "./FillBlankQuestion";

const item = {
  sentence: "わたし_____ がくせいです。",
  answer: "は",
  options: ["は", "を", "に"]
};

describe("FillBlankQuestion — hiển thị", () => {
  it("hiện câu hỏi và đủ phương án trong ô chọn", () => {
    render(<FillBlankQuestion item={item} />);

    expect(screen.getByRole("heading", { name: item.sentence })).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveValue("");
    item.options.forEach((option) => {
      expect(screen.getByRole("option", { name: option })).toBeInTheDocument();
    });
  });

  it("chưa chấm gì trước khi bấm Kiểm tra", () => {
    render(<FillBlankQuestion item={item} />);

    expect(screen.queryByText("Đúng")).not.toBeInTheDocument();
    expect(screen.queryByText("Sai")).not.toBeInTheDocument();
  });
});

describe("FillBlankQuestion — chấm điểm", () => {
  it("báo Đúng khi chọn trúng đáp án", async () => {
    const user = userEvent.setup();
    render(<FillBlankQuestion item={item} />);

    await user.selectOptions(screen.getByRole("combobox"), "は");
    await user.click(screen.getByRole("button", { name: "Kiểm tra" }));

    expect(screen.getByText("Đúng")).toBeInTheDocument();
  });

  it("báo Sai khi chọn nhầm", async () => {
    const user = userEvent.setup();
    render(<FillBlankQuestion item={item} />);

    await user.selectOptions(screen.getByRole("combobox"), "を");
    await user.click(screen.getByRole("button", { name: "Kiểm tra" }));

    expect(screen.getByText("Sai")).toBeInTheDocument();
  });

  it("cho chọn lại và chấm lại", async () => {
    const user = userEvent.setup();
    render(<FillBlankQuestion item={item} />);

    await user.selectOptions(screen.getByRole("combobox"), "を");
    await user.click(screen.getByRole("button", { name: "Kiểm tra" }));

    await user.selectOptions(screen.getByRole("combobox"), "は");
    await user.click(screen.getByRole("button", { name: "Kiểm tra" }));

    expect(screen.getByText("Đúng")).toBeInTheDocument();
    expect(screen.queryByText("Sai")).not.toBeInTheDocument();
  });

  // BUG: submit (FillBlankQuestion.jsx:14) so sánh thẳng selected === item.answer,
  // nên chưa chọn gì cũng bị chấm là "Sai" thay vì nhắc người học chọn đáp án.
  it.fails("KHÔNG được chấm Sai khi người học chưa chọn gì", async () => {
    const user = userEvent.setup();
    render(<FillBlankQuestion item={item} />);

    await user.click(screen.getByRole("button", { name: "Kiểm tra" }));

    expect(screen.queryByText("Sai")).not.toBeInTheDocument();
  });
});
