import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import FlashCard from "../components/flashcard/Flashcard";
import PageShell from "../components/common/PageShell";

import { getLessonRoadmap } from "../data/lessonRoadmaps";
import SpeechController from "../controllers/SpeechController";
import { getFrontText, getReadingText } from "../utils/vocabulary";

const tabs = [
  { key: "roadmap", label: "Lộ trình" },
  { key: "vocabulary", label: "Từ vựng" },
  { key: "grammar", label: "Ngữ pháp" }
];

export default function LessonStudyPage() {
  const { lessonId } = useParams();
  const lesson = getLessonRoadmap(lessonId);
  const [activeTab, setActiveTab] = useState("roadmap");
  const [vocabIndex, setVocabIndex] = useState(0);

  const lessonNumber = useMemo(
    () => Number.parseInt(lessonId, 10),
    [lessonId]
  );

  if (!lesson) {
    return (
      <PageShell
        eyebrow="Lộ trình"
        title="Không tìm thấy bài học"
        description="Bài học bạn mở chưa có trong bộ dữ liệu 7 bài."
      >
        <article className="empty-state">
          <h3>Lesson không tồn tại</h3>
          <p>Vui lòng quay lại trang lộ trình để chọn bài 1 đến bài 7.</p>
        </article>
      </PageShell>
    );
  }

  const vocabCount = lesson.vocabulary.length;
  const currentVocabIndex = vocabCount > 0 ? vocabIndex % vocabCount : 0;
  const currentWord = lesson.vocabulary[currentVocabIndex];

  const goToPreviousVocab = () => {
    setVocabIndex((current) => (current - 1 + vocabCount) % vocabCount);
  };

  const goToNextVocab = () => {
    setVocabIndex((current) => (current + 1) % vocabCount);
  };

  return (
    <PageShell
      eyebrow={`Bài ${lesson.id}`}
      title={lesson.title}
      description={lesson.focus}
      aside={
        <>
          <p className="aside-label">Nguồn</p>
          <strong className="aside-value">{lesson.slideCount}</strong>
          <p className="aside-note">
            Dựa trên file {lesson.pptxFile}. Lộ trình chia thành 3 tab để dễ học.
          </p>
        </>
      }
    >
      <div className="tab-bar">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`tab-chip ${activeTab === tab.key ? "is-active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "roadmap" && (
        <section className="lesson-panel-grid">
          <article className="lesson-panel">
            <h2>Tổng quan bài {lessonNumber}</h2>
            <p>{lesson.subtitle}</p>
            <div className="info-grid">
              <div>
                <span className="aside-label">Slide</span>
                <strong>{lesson.slideCount}</strong>
              </div>
              <div>
                <span className="aside-label">Từ mẫu</span>
                <strong>{lesson.vocabulary.length}</strong>
              </div>
              <div>
                <span className="aside-label">Ngữ pháp</span>
                <strong>{lesson.grammarNotes.length}</strong>
              </div>
            </div>
          </article>

          <article className="lesson-panel">
            <h2>Các bước học</h2>
            <ol className="roadmap-list">
              {lesson.roadmapSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </article>
        </section>
      )}

      {activeTab === "vocabulary" && (
        <section className="study-stage">
          {currentWord && (
            <>
              <FlashCard
                key={`${lesson.id}-${currentWord.jp}`}
                jp={getFrontText(currentWord)}
                // backLabel="Nghĩa + Romaji"
                backText={[currentWord.meaning, getReadingText(currentWord)].filter(Boolean).join("\n")}
                speak={() => SpeechController.speak(currentWord.jp)}
              />

              <div className="study-controls">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={goToPreviousVocab}
                  disabled={vocabCount <= 1}
                >
                  Previous
                </button>

                <button
                  type="button"
                  className="primary-button"
                  onClick={goToNextVocab}
                  disabled={vocabCount <= 1}
                >
                  Next
                </button>
              </div>

              <div className="vocab-meta-grid">
                <div>
                  <span className="aside-label">Current</span>
                  <strong>{currentVocabIndex + 1}</strong>
                </div>
                <div>
                  <span className="aside-label">Total</span>
                  <strong>{vocabCount}</strong>
                </div>
              </div>
            </>
          )}
        </section>
      )}

      {activeTab === "grammar" && (
        <section className="grammar-grid">
          {lesson.grammarNotes.map((item) => (
            <article key={item.title} className="grammar-note-card">
              <span className="lesson-kicker">Mẫu câu</span>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
              <div className="grammar-example">
                {item.example}
              </div>
            </article>
          ))}
        </section>
      )}
    </PageShell>
  );
}
