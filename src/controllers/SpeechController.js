import { speakJapanese, speakSequence } from "../services/speechService";

const SpeechController = {
  speak(text) {
    return speakJapanese(text);
  },
  speakSequence(texts, callbacks) {
    return speakSequence(texts, callbacks);
  }
};

export default SpeechController;
