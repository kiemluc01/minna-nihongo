import { speakJapanese } from "../services/speechService";

const SpeechController = {
  speak(text) {
    return speakJapanese(text);
  }
};

export default SpeechController;
