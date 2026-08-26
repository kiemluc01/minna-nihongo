import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import FlashCard from "./Flashcard";

const props = {
  jp: "せんせい",
  backLabel: "Nghĩa",
  backText: "giáo viên"
};

describe("FlashCard — mặt trước", () => {
  it("hiện chữ Nhật và gợi ý thao tác", () => {
    render(<FlashCard {...props} />);

    expect(screen.getByRole("heading", { name: "せんせい" })).toBeInTheDocument();
    expect(screen.getByText("Chạm để lật thẻ")).toBeInTheDocument();
    expect(screen.queryByText("giáo viên")).not.toBeInTheDocument();
  });

  it("là một vùng bấm được và focus được bằng bàn phím", () => {
    render(<FlashCard {...props} />);

    expect(screen.getByRole("button", { name: /せんせい/ })).toHaveAttribute("tabindex", "0");
  });
});

describe("FlashCard — lật thẻ", () => {
  it("bấm vào thẻ thì hiện nhãn và nghĩa ở mặt sau", async () => {
    const user = userEvent.setup();
    render(<FlashCard {...props} />);

    await user.click(screen.getByRole("button", { name: /せんせい/ }));

    expect(screen.getByText("Nghĩa")).toBeInTheDocument();
    expect(screen.getByText("giáo viên")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "せんせい" })).not.toBeInTheDocument();
  });

  it("bấm lần nữa thì lật về mặt trước", async () => {
    const user = userEvent.setup();
    render(<FlashCard {...props} />);
    const card = screen.getByRole("button", { name: /せんせい/ });

    await user.click(card);
    await user.click(screen.getByText("giáo viên"));

    expect(screen.getByRole("heading", { name: "せんせい" })).toBeInTheDocument();
  });

  it("lật được bằng phím Enter", async () => {
    const user = userEvent.setup();
    render(<FlashCard {...props} />);

    screen.getByRole("button", { name: /せんせい/ }).focus();
    await user.keyboard("{Enter}");

    expect(screen.getByText("giáo viên")).toBeInTheDocument();
  });

  it("lật được bằng phím Space", async () => {
    const user = userEvent.setup();
    render(<FlashCard {...props} />);

    screen.getByRole("button", { name: /せんせい/ }).focus();
    await user.keyboard("[Space]");

    expect(screen.getByText("giáo viên")).toBeInTheDocument();
  });

  it("không lật khi bấm phím khác", async () => {
    const user = userEvent.setup();
    render(<FlashCard {...props} />);

    screen.getByRole("button", { name: /せんせい/ }).focus();
    await user.keyboard("a");

    expect(screen.queryByText("giáo viên")).not.toBeInTheDocument();
  });
});

describe("FlashCard — nút nghe phát âm", () => {
  it("không hiện nút khi không truyền hàm đọc", () => {
    render(<FlashCard {...props} />);

    expect(screen.queryByRole("button", { name: "🔊 Nghe phát âm" })).not.toBeInTheDocument();
  });

  it("gọi hàm đọc khi bấm nút", async () => {
    const user = userEvent.setup();
    const speak = vi.fn();
    render(<FlashCard {...props} speak={speak} />);

    await user.click(screen.getByRole("button", { name: "🔊 Nghe phát âm" }));

    expect(speak).toHaveBeenCalledTimes(1);
  });

  it("bấm nút nghe KHÔNG được lật thẻ", async () => {
    const user = userEvent.setup();
    render(<FlashCard {...props} speak={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "🔊 Nghe phát âm" }));

    expect(screen.getByRole("heading", { name: "せんせい" })).toBeInTheDocument();
    expect(screen.queryByText("giáo viên")).not.toBeInTheDocument();
  });
});
