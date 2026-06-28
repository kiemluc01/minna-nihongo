import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import PageShell from "../components/common/PageShell";
import FlashCard from "../components/flashcard/Flashcard";

import { vocabularyData } from "../data/vocabulary";
import SpeechController from "../controllers/SpeechController";
import {
  getFrontText,
  getPrimaryScript,
  getWordScripts,
  getReadingText,
  matchesScriptFilter
} from "../utils/vocabulary";

const SCRIPT_FILTERS = [
  { key: "all", label: "Tất cả" },
  { key: "hiragana", label: "Hiragana" },
  { key: "katakana", label: "Katakana" },
  { key: "kanji", label: "Kanji" },
  { key: "mixed", label: "Hỗn hợp" }
];

const EMPTY_WORDS = [];

export default function LessonVocabulary() {
  const { lessonId } = useParams();
  const data = vocabularyData[lessonId] ?? EMPTY_WORDS;
  const [index, setIndex] = useState(0);
  const [scriptFilter, setScriptFilter] = useState("all");

  const filteredWords = useMemo(() => {
    return data.filter((word) => matchesScriptFilter(word, scriptFilter));
  }, [data, scriptFilter]);

  const activeIndex = filteredWords.length > 0 ? index % filteredWords.length : 0;
  const currentWord = filteredWords[activeIndex];

  const lessonTitle = useMemo(() => {
    return lessonId ? `Bài ${lessonId}` : "Bài học";
  }, [lessonId]);

  const goToPrevious = () => {
    setIndex((current) => (current - 1 + filteredWords.length) % filteredWords.length);
  };

  const goToNext = () => {
    setIndex((current) => (current + 1) % filteredWords.length);
  };

  return (
    <PageShell
      eyebrow="Chi tiết bài học"
      title={lessonTitle}
      description="Học từng từ theo kiểu flashcard: xem mặt trước, lật nghĩa và nghe phát âm."
      aside={
        <>
          <p className="aside-label">Tiến độ</p>
          <strong className="aside-value">
            {filteredWords.length > 0 ? `${activeIndex + 1}/${filteredWords.length}` : "0/0"}
          </strong>
          <p className="aside-note">
            Chạm vào thẻ để lật mặt sau. Dùng nút trái/phải để chuyển từ.
          </p>
        </>
      }
    >
      <div className="script-filter-bar">
        {SCRIPT_FILTERS.map((filter) => (
          <button
            key={filter.key}
            type="button"
            className={`filter-chip ${scriptFilter === filter.key ? "is-active" : ""}`}
            onClick={() => setScriptFilter(filter.key)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <section className="vocab-flashcard-layout">
        {filteredWords.length > 0 && currentWord ? (
          <>
            <div className="vocab-flashcard-stage">
              <FlashCard
                key={`${lessonId}-${currentWord.id}`}
                jp={getFrontText(currentWord, scriptFilter)}
                backLabel="Nghĩa + Romaji"
                backText={[currentWord.meaning, getReadingText(currentWord)].filter(Boolean).join("\n")}
                speak={() => SpeechController.speak(currentWord.jp)}
              />

              <div className="study-controls">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={goToPrevious}
                  disabled={filteredWords.length <= 1}
                >
                  Trước
                </button>

                <button
                  type="button"
                  className="primary-button"
                  onClick={goToNext}
                  disabled={filteredWords.length <= 1}
                >
                  Từ tiếp theo
                </button>
              </div>
            </div>

            <div className="study-panel">
              <span className="lesson-kicker">
                {getPrimaryScript(currentWord)}
              </span>
              <h2>{currentWord.jp}</h2>
              <p>{getReadingText(currentWord)}</p>

              <div className="vocab-meta-grid">
                <div>
                  <span className="aside-label">Từ hiện tại</span>
                  <strong>{activeIndex + 1}</strong>
                </div>
                <div>
                  <span className="aside-label">Tổng số</span>
                  <strong>{filteredWords.length}</strong>
                </div>
                <div>
                  <span className="aside-label">Hiragana</span>
                  <strong>{getWordScripts(currentWord).includes("hiragana") ? "Có" : "Không"}</strong>
                </div>
                <div>
                  <span className="aside-label">Kanji/Kata</span>
                  <strong>{getWordScripts(currentWord).filter((item) => item !== "hiragana").join(" + ") || "Không"}</strong>
                </div>
              </div>
            </div>
          </>
        ) : (
          <article className="empty-state">
            <h3>Không có từ phù hợp</h3>
            <p>
              Bộ lọc hiện tại không có từ nào khớp. Hãy chuyển sang “Tất cả”
              hoặc đổi sang loại ký tự khác.
            </p>
          </article>
        )}
      </section>
    </PageShell>
  );
}
