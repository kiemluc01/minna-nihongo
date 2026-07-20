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

// Đọc lần lượt nhiều câu (dùng cho hội thoại), mỗi câu cách nhau một khoảng
// nghỉ ngắn (GAP_MS) cho dễ nghe. Các utterance được xếp hàng và phát từng câu
// một (không speak() hết một lượt) để có thể chèn khoảng nghỉ giữa chừng bằng
// setTimeout. Trả về bộ điều khiển pause/resume/stop, và bắn onLineStart(index)
// khi từng câu bắt đầu để UI có thể tô sáng câu đang đọc.
const GAP_MS = 600;

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

  let index = 0;
  let stopped = false;
  let paused = false;
  let inGap = false;
  let gapTimeoutId = null;

  const clearGapTimer = () => {
    if (gapTimeoutId !== null) {
      clearTimeout(gapTimeoutId);
      gapTimeoutId = null;
    }
  };

  const speakNext = () => {
    if (stopped) {
      return;
    }

    if (index >= texts.length) {
      onEnd?.();
      return;
    }

    inGap = false;
    const currentIndex = index;
    const utterance = new SpeechSynthesisUtterance(texts[currentIndex]);
    utterance.lang = "ja-JP";
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    if (japaneseVoice) {
      utterance.voice = japaneseVoice;
    }

    utterance.onstart = () => onLineStart?.(currentIndex);

    utterance.onend = () => {
      if (stopped) {
        return;
      }

      index += 1;

      if (index >= texts.length) {
        onEnd?.();
        return;
      }

      inGap = true;

      if (paused) {
        return;
      }

      gapTimeoutId = setTimeout(() => {
        gapTimeoutId = null;
        if (!stopped && !paused) {
          speakNext();
        }
      }, GAP_MS);
    };

    window.speechSynthesis.speak(utterance);
  };

  speakNext();

  return {
    pause: () => {
      paused = true;
      if (inGap) {
        clearGapTimer();
      } else {
        window.speechSynthesis.pause();
      }
    },
    resume: () => {
      if (!paused) {
        return;
      }

      paused = false;

      if (inGap) {
        speakNext();
      } else {
        window.speechSynthesis.resume();
      }
    },
    stop: () => {
      stopped = true;
      clearGapTimer();
      window.speechSynthesis.cancel();
    }
  };
};
