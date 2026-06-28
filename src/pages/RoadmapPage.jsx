import { Link } from "react-router-dom";

import PageShell from "../components/common/PageShell";

import { useLessonsData } from "../store/useLessonsData";
import { deleteCustomLesson } from "../services/customLessonsService";

export default function RoadmapPage() {
  const { lessonRoadmaps } = useLessonsData();

  const handleDelete = (lesson) => {
    const confirmed = window.confirm(`Xóa bài "${lesson.title}"? Không thể hoàn tác.`);
    if (confirmed) {
      deleteCustomLesson(lesson.id);
    }
  };

  return (
    <PageShell
      eyebrow="Lộ trình học"
      title={`${lessonRoadmaps.length} bài N5`}
      description={`Lộ trình được chia theo ${lessonRoadmaps.length} bài, bám theo các file PPTX trong thư mục dữ liệu.`}
      actions={
        <Link to="/lessons/new" className="primary-button">
          + Thêm bài mới
        </Link>
      }
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
              <span className="roadmap-meta">
                {lesson.isCustom ? "Tự thêm" : `${lesson.slideCount} slide`}
              </span>
            </div>

            <h3>{lesson.title}</h3>
            <p className="roadmap-subtitle">{lesson.subtitle}</p>
            <p>{lesson.focus}</p>

            <div className="roadmap-tags">
              <span>{lesson.vocabulary.length} từ vựng</span>
              <span>{lesson.grammarNotes.length} điểm ngữ pháp</span>
            </div>

            <div className="roadmap-card-actions">
              <Link to={`/lesson/${lesson.id}`} className="primary-button">
                Mở bài học
              </Link>

              {lesson.isCustom && (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => handleDelete(lesson)}
                >
                  Xóa
                </button>
              )}
            </div>
          </article>
        ))}
      </section>
    </PageShell>
  );
}
