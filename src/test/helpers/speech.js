import { vi } from "vitest";

// jsdom KHÔNG có window.speechSynthesis / SpeechSynthesisUtterance, nên
// speechService không thể test nếu không dựng đôi giả. Đôi giả này giữ lại mọi
// utterance đã speak() để test tự bắn onstart/onend, mô phỏng trình duyệt.
export const installFakeSpeech = ({ voices = [] } = {}) => {
  const spoken = [];

  class FakeUtterance {
    constructor(text) {
      this.text = text;
      this.onstart = null;
      this.onend = null;
    }
  }

  const synthesis = {
    speak: vi.fn((utterance) => {
      spoken.push(utterance);
    }),
    cancel: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    getVoices: vi.fn(() => voices)
  };

  vi.stubGlobal("speechSynthesis", synthesis);
  vi.stubGlobal("SpeechSynthesisUtterance", FakeUtterance);

  return {
    synthesis,
    spoken,
    // Mô phỏng trình duyệt bắt đầu rồi kết thúc đọc utterance thứ `index`.
    start: (index) => spoken[index]?.onstart?.(),
    finish: (index) => spoken[index]?.onend?.(),
    // Đọc trọn một câu: onstart rồi onend.
    play: (index) => {
      spoken[index]?.onstart?.();
      spoken[index]?.onend?.();
    }
  };
};

// Gỡ hẳn API để test nhánh "trình duyệt không hỗ trợ".
export const removeSpeechApi = () => {
  vi.stubGlobal("SpeechSynthesisUtterance", undefined);
  vi.stubGlobal("speechSynthesis", undefined);
};

export const makeVoice = (lang) => ({ lang, name: `voice-${lang}` });
