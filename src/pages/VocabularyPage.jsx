import { Link } from "react-router-dom";

import PageShell from "../components/common/PageShell";

import { lessonRoadmaps } from "../data/lessonRoadmaps";

export default function VocabularyPage() {
  return (
    <PageShell
      eyebrow="Từ vựng"
      title="Vocabulary"
      description="Chọn một bài để học toàn bộ từ vựng trích trực tiếp từ file PPTX."
      aside={
        <>
          <p className="aside-label">Tổng bài</p>
          <strong className="aside-value">{lessonRoadmaps.length}</strong>
          <p className="aside-note">
            Mỗi bài mở ra một deck thẻ có nút Previous / Next để học tuần tự.
          </p>
        </>
      }
    >
      <section className="lesson-grid">
        {lessonRoadmaps.map((lesson) => (
          <Link key={lesson.id} to={`/lesson/${lesson.id}`} className="lesson-link-card">
            <span className="lesson-kicker">{lesson.vocabulary.length} từ</span>
            <h3>{lesson.title}</h3>
            <p>{lesson.subtitle}</p>
            <p className="lesson-scripts">
              Từ slide {lesson.slideCount}
            </p>
            <span className="lesson-link">Mở bài học</span>
          </Link>
        ))}
      </section>
    </PageShell>
  );
}
