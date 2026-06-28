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
