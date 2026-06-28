import { useState } from "react";

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

  return (
    <article className="quiz-card">
      <h3>{question}</h3>

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
