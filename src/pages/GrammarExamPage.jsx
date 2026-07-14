import { useMemo, useState } from "react";

import PageShell from "../components/common/PageShell";
import { useLessonsData } from "../store/useLessonsData";
import {
  generateGrammarExam,
  collectExamScope,
  isVocabAnswerCorrect,
  isGrammarAnswerCorrect
} from "../services/grammarExamService";

const FORMATS = [
  { key: "choice", label: "Trắc nghiệm" },
  { key: "fill", label: "Điền từ" }
];

const isAnswerCorrect = (question, given) =>
  question.kind === "vocab" ? isVocabAnswerCorrect(given, question.answer) : isGrammarAnswerCorrect(given, question.answer);

export default function GrammarExamPage() {
  const { lessonRoadmaps } = useLessonsData();

  const [selectedLessonIds, setSelectedLessonIds] = useState([]);
  const [format, setFormat] = useState("choice");
  const [vocabCount, setVocabCount] = useState(10);
  const [grammarCount, setGrammarCount] = useState(10);
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const scopePreview = useMemo(
    () => collectExamScope(lessonRoadmaps, selectedLessonIds),
    [lessonRoadmaps, selectedLessonIds]
  );

  // Mỗi từ / mỗi mẫu ngữ pháp chỉ dùng tối đa 1 lần/đề.
  const maxVocabQuestions = scopePreview.vocabulary.length;
  const maxGrammarQuestions = scopePreview.grammarNotes.length;
  const canGenerate = selectedLessonIds.length > 0 && (maxVocabQuestions > 0 || maxGrammarQuestions > 0);

  const toggleLesson = (lessonId) => {
    setSelectedLessonIds((current) =>
      current.includes(lessonId)
        ? current.filter((id) => id !== lessonId)
        : [...current, lessonId]
    );
  };

  const handleGenerate = () => {
    const result = generateGrammarExam({
      lessonRoadmaps,
      lessonIds: selectedLessonIds,
      format,
      vocabCount,
      grammarCount
    });

    setExam(result);
    setAnswers({});
    setSubmitted(false);
  };

  const setAnswer = (questionId, value) => {
    if (submitted) {
      return;
    }
    setAnswers((current) => ({ ...current, [questionId]: value }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const score = useMemo(() => {
    if (!submitted || !exam) {
      return null;
    }

    const correct = exam.questions.filter((question) => isAnswerCorrect(question, answers[question.id])).length;
    const total = exam.questions.length;

    return { correct, total, percent: total > 0 ? Math.round((correct / total) * 100) : 0 };
  }, [submitted, exam, answers]);

  return (
    <PageShell
      eyebrow="Kiểm tra"
      title="Kiểm tra ngữ pháp"
      description="Chọn phạm vi bài học, app sẽ tự tạo câu hỏi riêng cho từ vựng và riêng cho ngữ pháp. Một đề có thể có cả hai loại nhưng không gộp chung một câu. Mỗi lần tạo đề sẽ khác nhau."
      aside={
        <>
          <p className="aside-label">Trong phạm vi đã chọn</p>
          <strong className="aside-value">
            {scopePreview.vocabulary.length} từ · {scopePreview.grammarNotes.length} ngữ pháp
          </strong>
          <p className="aside-note">
            Tối đa {maxVocabQuestions} câu từ vựng và {maxGrammarQuestions} câu ngữ pháp (mỗi từ / mẫu ngữ pháp chỉ
            dùng 1 lần trong một đề).
          </p>
        </>
      }
    >
      <section className="form-section">
        <div className="form-section-heading">
          <h2>Phạm vi bài học</h2>
        </div>
        <p className="form-section-hint">Chọn một hoặc nhiều bài, ví dụ: bài 1, 2, 3 hoặc bài 2, 3, 4.</p>
        <div className="script-filter-bar">
          {lessonRoadmaps.map((lesson) => (
            <button
              key={lesson.id}
              type="button"
              className={`filter-chip ${selectedLessonIds.includes(lesson.id) ? "is-active" : ""}`}
              onClick={() => toggleLesson(lesson.id)}
            >
              Bài {lesson.id}
            </button>
          ))}
        </div>
      </section>

      <section className="form-section">
        <div className="form-section-heading">
          <h2>Hình thức &amp; số câu</h2>
        </div>
        <div className="script-filter-bar">
          {FORMATS.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`filter-chip ${format === item.key ? "is-active" : ""}`}
              onClick={() => setFormat(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="form-grid">
          <div className="form-field">
            <label htmlFor="vocab-count">Số câu từ vựng</label>
            <input
              id="vocab-count"
              type="number"
              min={0}
              max={Math.max(maxVocabQuestions, 0)}
              value={vocabCount}
              onChange={(event) => setVocabCount(Number(event.target.value) || 0)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="grammar-count">Số câu ngữ pháp</label>
            <input
              id="grammar-count"
              type="number"
              min={0}
              max={Math.max(maxGrammarQuestions, 0)}
              value={grammarCount}
              onChange={(event) => setGrammarCount(Number(event.target.value) || 0)}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="primary-button" onClick={handleGenerate} disabled={!canGenerate}>
            {exam ? "Tạo đề mới" : "Tạo đề"}
          </button>
        </div>

        {selectedLessonIds.length === 0 && (
          <p className="form-section-hint">Chọn ít nhất một bài để tạo đề.</p>
        )}
        {selectedLessonIds.length > 0 && !canGenerate && (
          <p className="form-error">Phạm vi đã chọn chưa có từ vựng hoặc ngữ pháp nào để tạo câu hỏi.</p>
        )}
        {exam && (vocabCount > exam.maxVocabQuestions || grammarCount > exam.maxGrammarQuestions) && (
          <p className="form-section-hint">
            Đã tạo {exam.questions.length} câu (giới hạn bởi phạm vi: tối đa {exam.maxVocabQuestions} câu từ vựng,{" "}
            {exam.maxGrammarQuestions} câu ngữ pháp vì mỗi từ/mẫu ngữ pháp chỉ dùng 1 lần/đề).
          </p>
        )}
      </section>

      {exam && exam.questions.length > 0 && (
        <>
          {score && (
            <section className="form-section">
              <div className="form-section-heading">
                <h2>Kết quả</h2>
              </div>
              <p className="aside-value">
                {score.correct}/{score.total} ({score.percent}%)
              </p>
            </section>
          )}

          <section className="quiz-grid exam-grid">
            {exam.questions.map((question, index) => {
              const given = answers[question.id];
              const isOk = submitted && isAnswerCorrect(question, given);

              return (
                <article key={question.id} className="quiz-card">
                  <span className="lesson-kicker">
                    Câu {index + 1} · {question.kind === "vocab" ? "Từ vựng" : "Ngữ pháp"} · Bài {question.lessonId}
                  </span>

                  <p className="form-section-hint">
                    {question.kind === "vocab" ? "Nghĩa của từ dưới đây là gì?" : "Điền vào chỗ trống."}
                  </p>
                  <h3>{question.prompt}</h3>

                  {question.type === "choice" ? (
                    <div className="quiz-options">
                      {question.options.map((option) => (
                        <button
                          type="button"
                          key={option}
                          className={`quiz-option ${given === option ? "is-selected" : ""} ${
                            submitted && option === question.answer ? "is-correct" : ""
                          } ${submitted && given === option && option !== question.answer ? "is-wrong" : ""}`}
                          onClick={() => setAnswer(question.id, option)}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <input
                      className="search-input"
                      value={given || ""}
                      onChange={(event) => setAnswer(question.id, event.target.value)}
                      placeholder={question.kind === "vocab" ? "Nhập nghĩa tiếng Việt" : "Nhập từ/mẫu ngữ pháp còn thiếu"}
                      disabled={submitted}
                    />
                  )}

                  {submitted && (
                    <p className={isOk ? "grammar-translation" : "form-error"}>
                      {isOk ? "✅ Đúng" : `❌ Đáp án: ${question.answer}`}
                    </p>
                  )}
                  {submitted && question.kind === "grammar" && question.detail && (
                    <p className="grammar-translation">{question.detail}</p>
                  )}
                </article>
              );
            })}
          </section>

          <div className="form-actions">
            {!submitted ? (
              <button type="button" className="primary-button" onClick={handleSubmit}>
                Nộp bài
              </button>
            ) : (
              <button type="button" className="secondary-button" onClick={handleGenerate}>
                Làm đề khác
              </button>
            )}
          </div>
        </>
      )}
    </PageShell>
  );
}
