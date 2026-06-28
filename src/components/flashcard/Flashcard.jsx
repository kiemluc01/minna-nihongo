import { useState } from "react";

export default function FlashCard({
  jp,
  backLabel = "Mặt sau",
  backText = "",
  speak
}) {

  const [flip, setFlip] =
    useState(false);

  return (
    <article
      className={`flashcard ${flip ? "is-flipped" : ""}`}
      onClick={() => setFlip(!flip)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setFlip(!flip);
        }
      }}
    >
      <span className="flashcard-hint">
        Chạm để lật thẻ
      </span>

      {!flip ? (
        <h2 className="flashcard-front">{jp}</h2>
      ) : (
        <div className="flashcard-back">
          <span className="flashcard-back-label">{backLabel}</span>
          <p>{backText}</p>
        </div>
      )}

      {speak && (
        <button
          type="button"
          className="icon-button"
          onPointerDown={(event) => {
            event.stopPropagation();
          }}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            speak();
          }}
        >
          🔊 Nghe phát âm
        </button>
      )}
    </article>
  );
}
