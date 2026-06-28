import { Link } from "react-router-dom";

import PageShell from "../components/common/PageShell";

import { lessonRoadmaps } from "../data/lessonRoadmaps";

export default function RoadmapPage() {
  return (
    <PageShell
      eyebrow="Lộ trình học"
      title="7 bài N5"
      description="Lộ trình được chia theo 7 bài, bám theo các file PPTX trong thư mục dữ liệu."
      aside={
        <>
          <p className="aside-label">Tổng bài</p>
          <strong className="aside-value">{lessonRoadmaps.length}</strong>
          <p className="aside-note">
            Chọn một bài để vào trang học có tab riêng cho từ vựng và ngữ pháp.
          </p>
        </>
      }
    >
      <section className="roadmap-grid">
        {lessonRoadmaps.map((lesson) => (
          <article key={lesson.id} className="roadmap-card">
            <div className="roadmap-card-top">
              <span className="lesson-kicker">Bài {lesson.id}</span>
              <span className="roadmap-meta">{lesson.slideCount} slide</span>
            </div>

            <h3>{lesson.title}</h3>
            <p className="roadmap-subtitle">{lesson.subtitle}</p>
            <p>{lesson.focus}</p>

            <div className="roadmap-tags">
              <span>{lesson.vocabulary.length} từ vựng</span>
              <span>{lesson.grammarNotes.length} điểm ngữ pháp</span>
            </div>

            <Link to={`/lesson/${lesson.id}`} className="primary-button">
              Mở bài học
            </Link>
          </article>
        ))}
      </section>
    </PageShell>
  );
}
