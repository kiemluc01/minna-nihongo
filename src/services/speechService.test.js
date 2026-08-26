import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { speakJapanese, speakSequence } from "./speechService";
import { installFakeSpeech, makeVoice, removeSpeechApi } from "../test/helpers/speech";

const GAP_MS = 600;

describe("speakJapanese", () => {
  it("không đọc và trả về false khi không có nội dung", () => {
    const speech = installFakeSpeech();

    expect(speakJapanese("")).toBe(false);
    expect(speakJapanese(undefined)).toBe(false);
    expect(speech.synthesis.speak).not.toHaveBeenCalled();
  });

  it("trả về false khi trình duyệt không hỗ trợ đọc tiếng Nhật", () => {
    removeSpeechApi();

    expect(speakJapanese("おはよう")).toBe(false);
  });

  it("đọc câu với cấu hình tiếng Nhật", () => {
    const speech = installFakeSpeech();

    expect(speakJapanese("おはよう")).toBe(true);
    expect(speech.spoken).toHaveLength(1);
    expect(speech.spoken[0]).toMatchObject({
      text: "おはよう",
      lang: "ja-JP",
      rate: 0.9,
      pitch: 1,
      volume: 1
    });
  });

  it("huỷ phần đang đọc trước khi đọc câu mới", () => {
    const speech = installFakeSpeech();

    speakJapanese("おはよう");

    expect(speech.synthesis.cancel).toHaveBeenCalled();
    expect(speech.synthesis.cancel.mock.invocationCallOrder[0]).toBeLessThan(
      speech.synthesis.speak.mock.invocationCallOrder[0]
    );
  });

  it("chọn giọng tiếng Nhật khi máy có sẵn", () => {
    const japanese = makeVoice("ja-JP");
    const speech = installFakeSpeech({ voices: [makeVoice("en-US"), japanese] });

    speakJapanese("おはよう");

    expect(speech.spoken[0].voice).toBe(japanese);
  });

  it("vẫn đọc được khi máy không có giọng tiếng Nhật", () => {
    const speech = installFakeSpeech({ voices: [makeVoice("en-US")] });

    expect(speakJapanese("おはよう")).toBe(true);
    expect(speech.spoken[0].voice).toBeUndefined();
  });
});

describe("speakSequence", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("trả về bộ điều khiển rỗng khi không có câu nào", () => {
    const speech = installFakeSpeech();
    const controller = speakSequence([]);

    expect(() => {
      controller.pause();
      controller.resume();
      controller.stop();
    }).not.toThrow();
    expect(speech.synthesis.speak).not.toHaveBeenCalled();
    expect(speech.synthesis.cancel).not.toHaveBeenCalled();
  });

  it("trả về bộ điều khiển rỗng khi trình duyệt không hỗ trợ", () => {
    removeSpeechApi();

    const controller = speakSequence(["おはよう"]);

    expect(() => controller.stop()).not.toThrow();
  });

  it("đọc câu đầu tiên ngay lập tức, chưa đọc câu sau", () => {
    const speech = installFakeSpeech();

    speakSequence(["いち", "に"]);

    expect(speech.spoken.map((utterance) => utterance.text)).toEqual(["いち"]);
  });

  it("báo chỉ số câu đang đọc để giao diện tô sáng", () => {
    const speech = installFakeSpeech();
    const onLineStart = vi.fn();

    speakSequence(["いち", "に"], { onLineStart });
    speech.start(0);

    expect(onLineStart).toHaveBeenCalledWith(0);
  });

  it("chờ đúng 600ms rồi mới đọc câu tiếp theo", () => {
    const speech = installFakeSpeech();

    speakSequence(["いち", "に"]);
    speech.play(0);

    vi.advanceTimersByTime(GAP_MS - 1);
    expect(speech.spoken).toHaveLength(1);

    vi.advanceTimersByTime(1);
    expect(speech.spoken.map((utterance) => utterance.text)).toEqual(["いち", "に"]);
  });

  it("đọc hết cả hội thoại theo đúng thứ tự rồi báo kết thúc", () => {
    const speech = installFakeSpeech();
    const onEnd = vi.fn();

    speakSequence(["いち", "に", "さん"], { onEnd });

    speech.play(0);
    vi.advanceTimersByTime(GAP_MS);
    speech.play(1);
    vi.advanceTimersByTime(GAP_MS);
    expect(onEnd).not.toHaveBeenCalled();

    speech.play(2);

    expect(speech.spoken.map((utterance) => utterance.text)).toEqual(["いち", "に", "さん"]);
    expect(onEnd).toHaveBeenCalledTimes(1);
  });

  it("tạm dừng giữa lúc đang đọc thì gọi pause của trình duyệt", () => {
    const speech = installFakeSpeech();

    const controller = speakSequence(["いち", "に"]);
    speech.start(0);
    controller.pause();

    expect(speech.synthesis.pause).toHaveBeenCalledTimes(1);
  });

  it("tạm dừng trong lúc nghỉ giữa hai câu thì không tự đọc tiếp", () => {
    const speech = installFakeSpeech();

    const controller = speakSequence(["いち", "に"]);
    speech.play(0);
    controller.pause();

    vi.advanceTimersByTime(GAP_MS * 5);

    expect(speech.spoken).toHaveLength(1);
    expect(speech.synthesis.pause).not.toHaveBeenCalled();
  });

  it("tiếp tục sau khi tạm dừng trong lúc nghỉ thì đọc ngay câu kế", () => {
    const speech = installFakeSpeech();

    const controller = speakSequence(["いち", "に"]);
    speech.play(0);
    controller.pause();
    controller.resume();

    expect(speech.spoken.map((utterance) => utterance.text)).toEqual(["いち", "に"]);
  });

  it("tiếp tục sau khi tạm dừng giữa câu thì gọi resume của trình duyệt", () => {
    const speech = installFakeSpeech();

    const controller = speakSequence(["いち", "に"]);
    speech.start(0);
    controller.pause();
    controller.resume();

    expect(speech.synthesis.resume).toHaveBeenCalledTimes(1);
  });

  it("gọi resume khi chưa tạm dừng thì không có tác dụng gì", () => {
    const speech = installFakeSpeech();

    const controller = speakSequence(["いち", "に"]);
    controller.resume();

    expect(speech.synthesis.resume).not.toHaveBeenCalled();
    expect(speech.spoken).toHaveLength(1);
  });

  it("dừng hẳn thì huỷ phần đang đọc và không đọc tiếp câu nào", () => {
    const speech = installFakeSpeech();
    const onEnd = vi.fn();

    const controller = speakSequence(["いち", "に"], { onEnd });
    controller.stop();

    speech.finish(0);
    vi.advanceTimersByTime(GAP_MS * 5);

    expect(speech.synthesis.cancel).toHaveBeenCalled();
    expect(speech.spoken).toHaveLength(1);
    expect(onEnd).not.toHaveBeenCalled();
  });

  it("dừng trong lúc nghỉ thì huỷ luôn hẹn giờ đọc câu kế", () => {
    const speech = installFakeSpeech();

    const controller = speakSequence(["いち", "に"]);
    speech.play(0);
    controller.stop();

    vi.advanceTimersByTime(GAP_MS * 5);

    expect(speech.spoken).toHaveLength(1);
  });

  it("chọn giọng tiếng Nhật cho mọi câu trong hội thoại", () => {
    const japanese = makeVoice("ja-JP");
    const speech = installFakeSpeech({ voices: [makeVoice("en-US"), japanese] });

    speakSequence(["いち", "に"]);
    speech.play(0);
    vi.advanceTimersByTime(GAP_MS);

    expect(speech.spoken.every((utterance) => utterance.voice === japanese)).toBe(true);
    expect(speech.spoken.every((utterance) => utterance.lang === "ja-JP")).toBe(true);
  });
});
