import { Link } from "react-router-dom";

import { grammarData } from "../data/grammar";
import { hiraganaData } from "../data/hiragana";
import { katakanaData } from "../data/katakana";
import { lessonRoadmaps } from "../data/lessonRoadmaps";
import { radicals75 } from "../data/radicals75";
import { vocabularyData } from "../data/vocabulary";

export default function Dashboard() {
  const vocabularyCount = Object.values(vocabularyData).reduce(
    (total, lesson) => total + lesson.length,
    0
  );

  const lessons = [
    {
      title: "Lộ trình 7 bài",
      description: "Đi theo thứ tự bài 1 đến bài 7 với tab riêng cho từng phần.",
      to: "/roadmap",
      meta: `${lessonRoadmaps.length} bài học`
    },
    {
      title: "Hiragana",
      description: "Làm quen 46 chữ cái cơ bản với flashcard và phát âm.",
      to: "/hiragana",
      meta: `${hiraganaData.length} ký tự`
    },
    {
      title: "Katakana",
      description: "Ôn bảng chữ cái dùng cho từ mượn và tên riêng.",
      to: "/katakana",
      meta: `${katakanaData.length} ký tự`
    },
    {
      title: "Từ vựng",
      description: "Học theo bài, mỗi bài là một nhóm từ ngắn và dễ nhớ.",
      to: "/vocabulary",
      meta: `${Object.keys(vocabularyData).length} bài học`
    },
    {
      title: "Ngữ pháp",
      description: "Củng cố mẫu câu N5 bằng câu hỏi trắc nghiệm ngắn.",
      to: "/grammar",
      meta: `${grammarData.length} mẫu câu`
    },
    {
      title: "Luyện tập",
      description: "Vào chế độ practice để luyện nhanh và kiểm tra lại kiến thức.",
      to: "/practice",
      meta: "Ôn tập tập trung"
    },
    {
      title: "Thi thử",
      description: "Làm bài test tổng hợp để xem mình đang ở mức nào.",
      to: "/exam",
      meta: "Bài kiểm tra tổng hợp"
    },
    {
      title: "75 bộ thủ",
      description: "Học bộ thủ bằng flashcard để nhìn cấu trúc chữ Hán nhanh hơn.",
      to: "/radicals",
      meta: `${radicals75.length} bộ thủ`
    }
  ];

  return (
    <main className="dashboard">
      <section className="dashboard-hero">
        <div className="dashboard-badge">JLPT N5 Learning App</div>
        <h1>Học tiếng Nhật mỗi ngày, gọn, đẹp và dễ theo dõi.</h1>
        <p className="dashboard-intro">
          Từ bảng chữ cái đến ngữ pháp, từ vựng và thi thử. Mọi thứ được xếp
          thành một lộ trình rõ ràng để bạn học nhanh hơn mà không bị rối.
        </p>

        <div className="dashboard-actions">
          <Link to="/hiragana" className="primary-action">
            Bắt đầu học
          </Link>
          <Link to="/exam" className="secondary-action">
            Làm bài thi thử
          </Link>
        </div>

        <div className="dashboard-stats">
          <article>
            <strong>{hiraganaData.length}</strong>
            <span>Hiragana</span>
          </article>
          <article>
            <strong>{katakanaData.length}</strong>
            <span>Katakana</span>
          </article>
          <article>
            <strong>{vocabularyCount}</strong>
            <span>Từ vựng</span>
          </article>
          <article>
            <strong>{grammarData.length}</strong>
            <span>Mẫu ngữ pháp</span>
          </article>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <h2>Lộ trình học nhanh</h2>
          <p>
            Chọn đúng chủ đề bạn muốn luyện hôm nay, app sẽ đưa bạn vào phần phù
            hợp ngay lập tức.
          </p>
        </div>

        <div className="lesson-grid">
          {lessons.map((lesson) => (
            <Link key={lesson.to} to={lesson.to} className="lesson-card">
              <span className="lesson-kicker">{lesson.meta}</span>
              <h3>{lesson.title}</h3>
              <p>{lesson.description}</p>
              <span className="lesson-link">Mở bài học</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="dashboard-section dashboard-focus">
        <div>
          <div className="section-heading">
            <h2>Học có nhịp, không bị ngợp</h2>
            <p>
              Mỗi lần mở app bạn chỉ cần chọn một khối nội dung. Layout này cũng
              tự co giãn đẹp trên mobile, tablet và màn hình lớn.
            </p>
          </div>

          <div className="focus-points">
            <div>
              <strong>01</strong>
              <span>Vào bài nhanh, ít thao tác.</span>
            </div>
            <div>
              <strong>02</strong>
              <span>Card, nút và khoảng thở rõ ràng.</span>
            </div>
            <div>
              <strong>03</strong>
              <span>Grid tự đổi cột theo kích thước màn hình.</span>
            </div>
          </div>
        </div>

        <div className="dashboard-note">
          <h3>Gợi ý hôm nay</h3>
          <p>
            Nếu bạn đang học N5, hãy đi theo thứ tự: lộ trình 7 bài, bảng chữ cái,
            từ vựng, ngữ pháp, rồi làm thi thử ngắn và học bộ thủ.
          </p>
          <Link to="/practice" className="note-button">
            Vào luyện tập
          </Link>
        </div>
      </section>
    </main>
  );
}
