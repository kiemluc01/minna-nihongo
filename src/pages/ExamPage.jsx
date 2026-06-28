import { grammarData } from "../data/grammar";
import { vocabularyData } from "../data/vocabulary";
import PageShell from "../components/common/PageShell";
import { getFrontText, getReadingText } from "../utils/vocabulary";

const generateExam = (grammarItems, vocabItems) => {
  const allQuestions = [
    ...grammarItems,
    ...vocabItems
  ];

  return allQuestions
    .sort(() => Math.random() - 0.5)
    .slice(0, 50);
};

export default function ExamPage() {
  const vocabItems = Object.entries(vocabularyData).flatMap(([lessonId, lesson]) =>
    lesson.map((word) => ({
      id: `vocab-${lessonId}-${word.id}-${getFrontText(word)}`,
      question: getFrontText(word),
      answer: getReadingText(word),
      options: [getReadingText(word)]
    }))
  );

  const examItems = generateExam(grammarData, vocabItems);

  return (
    <PageShell
      eyebrow="Thi thử"
      title="Exam"
      description="Bài tổng hợp giữa ngữ pháp và từ vựng để kiểm tra mức độ ghi nhớ."
      aside={
        <>
          <p className="aside-label">Số câu</p>
          <strong className="aside-value">{examItems.length}</strong>
          <p className="aside-note">
            Nội dung được trộn ngẫu nhiên từ dữ liệu hiện có trong app.
          </p>
        </>
      }
    >
      <section className="exam-grid">
        {examItems.map((item) => (
          <article key={item.id} className="exam-card">
            <span className="lesson-kicker">Câu hỏi</span>
            <h3>{item.question}</h3>
            <p className="exam-answer">{item.answer}</p>
          </article>
        ))}
      </section>
    </PageShell>
  );
}
