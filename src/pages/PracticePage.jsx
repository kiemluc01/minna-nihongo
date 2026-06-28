import { Link } from "react-router-dom";

import PageShell from "../components/common/PageShell";

import { grammarData } from "../data/grammar";
import { hiraganaData } from "../data/hiragana";
import { katakanaData } from "../data/katakana";
import { vocabularyData } from "../data/vocabulary";

export default function PracticePage() {
  const vocabularyCount = Object.values(vocabularyData).reduce(
    (total, lesson) => total + lesson.length,
    0
  );

  const drills = [
    {
      title: "Bảng chữ cái",
      description: "Ôn Hiragana và Katakana bằng flashcard từng ký tự.",
      to: "/hiragana",
      meta: `${hiraganaData.length + katakanaData.length} ký tự`
    },
    {
      title: "Từ vựng",
      description: "Chọn một bài từ vựng để luyện nhớ nghĩa nhanh hơn.",
      to: "/vocabulary",
      meta: `${vocabularyCount} từ`
    },
    {
      title: "Ngữ pháp",
      description: "Làm câu hỏi trắc nghiệm để củng cố mẫu câu N5.",
      to: "/grammar",
      meta: `${grammarData.length} câu`
    }
  ];

  return (
    <PageShell
      eyebrow="Luyện tập"
      title="Practice"
      description="Chọn chế độ bạn muốn luyện hôm nay. Trang này đóng vai trò trung tâm để đi nhanh đến phần cần ôn."
      aside={
        <>
          <p className="aside-label">Gợi ý</p>
          <strong className="aside-value">15 phút</strong>
          <p className="aside-note">
            Một phiên ngắn mỗi ngày sẽ dễ duy trì hơn là học dồn nhiều giờ.
          </p>
        </>
      }
    >
      <section className="practice-grid">
        <div className="practice-card practice-card-highlight">
          <span className="lesson-kicker">Lộ trình nhanh</span>
          <h2>Học theo nhịp nhẹ, rõ mục tiêu</h2>
          <p>
            Bắt đầu từ bảng chữ cái, chuyển qua từ vựng rồi sang ngữ pháp. Khi
            đã quen, vào bài thi thử để kiểm tra tổng hợp.
          </p>

          <div className="practice-actions">
            <Link to="/exam" className="primary-button">
              Vào thi thử
            </Link>
            <Link to="/vocabulary" className="secondary-button">
              Chọn bài từ vựng
            </Link>
          </div>
        </div>

        <div className="practice-list">
          {drills.map((item) => (
            <Link key={item.to} to={item.to} className="practice-card">
              <span className="lesson-kicker">{item.meta}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <span className="lesson-link">Bắt đầu luyện</span>
            </Link>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
