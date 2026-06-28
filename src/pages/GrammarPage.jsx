import { grammarData } from "../data/grammar";

import GrammarQuiz from "../components/GrammarQuiz";
import PageShell from "../components/common/PageShell";

export default function GrammarPage() {
  return (
    <PageShell
      eyebrow="Ngữ pháp"
      title="Grammar"
      description="Làm các câu hỏi ngắn để ôn mẫu ngữ pháp N5 theo từng bài."
      aside={
        <>
          <p className="aside-label">Số câu</p>
          <strong className="aside-value">{grammarData.length}</strong>
          <p className="aside-note">
            Chọn đáp án, xem phản hồi ngay và luyện lại cho đến khi quen tay.
          </p>
        </>
      }
    >
      <section className="quiz-grid">
        {grammarData.map((item) => (
          <GrammarQuiz
            key={item.id}
            question={item.question}
            answer={item.answer}
            options={item.options}
          />
        ))}
      </section>
    </PageShell>
  );
}
