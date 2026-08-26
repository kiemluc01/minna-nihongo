import { describe, expect, it, vi } from "vitest";

import SpeechController from "./SpeechController";
import { speakJapanese, speakSequence } from "../services/speechService";

vi.mock("../services/speechService", () => ({
  speakJapanese: vi.fn(() => true),
  speakSequence: vi.fn(() => ({ pause: vi.fn(), resume: vi.fn(), stop: vi.fn() }))
}));

describe("SpeechController", () => {
  it("chuyển tiếp yêu cầu đọc một câu xuống speechService", () => {
    expect(SpeechController.speak("おはよう")).toBe(true);
    expect(speakJapanese).toHaveBeenCalledWith("おはよう");
  });

  it("chuyển tiếp yêu cầu đọc cả hội thoại kèm callback", () => {
    const callbacks = { onLineStart: vi.fn(), onEnd: vi.fn() };

    const controller = SpeechController.speakSequence(["いち", "に"], callbacks);

    expect(speakSequence).toHaveBeenCalledWith(["いち", "に"], callbacks);
    expect(controller).toHaveProperty("stop");
  });
});
