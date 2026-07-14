import { useState } from "react";

import SpeechController from "../controllers/SpeechController";

export default function GrammarQuiz({
  question,
  answer,
  options
}) {
  const [result, setResult] = useState("");
  const [picked, setPicked] = useState("");

  const check = (option) => {
    setPicked(option);

    if (option === answer) {
      setResult("✅ Chính xác");
    } else {
      setResult("❌ Sai");
    }
  };

  const speakQuestion = () => {
    const filledSentence = question.replace("_____", picked || answer);
    SpeechController.speak(filledSentence);
  };

  return (
    <article className="quiz-card">
      <div className="quiz-question-row">
        <h3>{question}</h3>
        <button
          type="button"
          className="icon-button icon-button-compact"
          onClick={speakQuestion}
          aria-label="Nghe câu hỏi"
        >
          🔊
        </button>
      </div>

      <div className="quiz-options">
        {options.map((item) => (
          <button
            type="button"
            className={`quiz-option ${picked === item ? "is-selected" : ""}`}
            key={item}
            onClick={() => check(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <p className="quiz-result">{result}</p>
    </article>
  );
}
