export const speakJapanese =
(text) => {
  if (
    !text ||
    typeof window === "undefined" ||
    !window.speechSynthesis ||
    typeof SpeechSynthesisUtterance === "undefined"
  ) {
    return false;
  }

  const speech = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();
  const japaneseVoice = voices.find((voice) => voice.lang?.startsWith("ja"));

  window.speechSynthesis.cancel();

  speech.lang = "ja-JP";
  speech.rate = 0.9;
  speech.pitch = 1;
  speech.volume = 1;

  if (japaneseVoice) {
    speech.voice = japaneseVoice;
  }

  window.speechSynthesis.speak(speech);

  return true;
};

// Đọc lần lượt nhiều câu (dùng cho hội thoại) mà không cắt ngang câu trước —
// SpeechSynthesis tự xếp hàng các utterance được speak() liên tiếp mà không
// gọi cancel() ở giữa, nên cả đoạn hội thoại phát tuần tự đúng thứ tự. Trả về
// bộ điều khiển pause/resume/stop, và bắn onLineStart(index) khi từng câu bắt
// đầu để UI có thể tô sáng câu đang đọc.
export const speakSequence = (texts = [], { onLineStart, onEnd } = {}) => {
  const noop = () => {};

  if (
    typeof window === "undefined" ||
    !window.speechSynthesis ||
    typeof SpeechSynthesisUtterance === "undefined" ||
    texts.length === 0
  ) {
    return { pause: noop, resume: noop, stop: noop };
  }

  window.speechSynthesis.cancel();
  const voices = window.speechSynthesis.getVoices();
  const japaneseVoice = voices.find((voice) => voice.lang?.startsWith("ja"));

  texts.forEach((text, index) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP";
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    if (japaneseVoice) {
      utterance.voice = japaneseVoice;
    }

    utterance.onstart = () => onLineStart?.(index);

    if (index === texts.length - 1) {
      utterance.onend = () => onEnd?.();
    }

    window.speechSynthesis.speak(utterance);
  });

  return {
    pause: () => window.speechSynthesis.pause(),
    resume: () => window.speechSynthesis.resume(),
    stop: () => window.speechSynthesis.cancel()
  };
};
