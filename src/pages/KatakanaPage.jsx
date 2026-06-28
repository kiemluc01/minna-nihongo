import { useState } from "react";
import { Link } from "react-router-dom";

import FlashCard from "../components/flashcard/Flashcard";
import PageShell from "../components/common/PageShell";

import { katakanaData } from "../data/katakana";

import SpeechController from "../controllers/SpeechController";

export default function Katakana() {
  const [index, setIndex] = useState(0);

  const card = katakanaData[index];

  return (
    <PageShell
      eyebrow="Bảng chữ cái"
      title="Katakana"
      description="Ôn luyện bảng Katakana theo kiểu flashcard, trực quan và dễ nhớ."
      aside={
        <>
          <p className="aside-label">Tiến độ hiện tại</p>
          <strong className="aside-value">
            {index + 1}/{katakanaData.length}
          </strong>
          <p className="aside-note">
            Dành vài vòng để làm quen các ký tự dùng cho từ mượn và tên riêng.
          </p>
        </>
      }
    >
      <section className="study-grid">
        <div className="study-stage">
          <FlashCard
            jp={card.kana}
            backLabel="Romaji"
            backText={card.romaji}
            speak={() => SpeechController.speak(card.kana)}
          />

          <div className="study-controls">
            <button
              type="button"
              className="primary-button"
              onClick={() =>
                setIndex((current) =>
                  (current + 1) % katakanaData.length
                )
              }
            >
              Thẻ tiếp theo
            </button>

            <Link to="/hiragana" className="secondary-button">
              Quay lại Hiragana
            </Link>
          </div>
        </div>

        <div className="study-panel">
          <h2>Mẹo ghi nhớ</h2>
          <p>
            Katakana thường xuất hiện trong tên nước ngoài, âm mượn và biển
            hiệu. Hãy luyện nhận diện bằng mắt trước khi đọc to.
          </p>
          <ul className="bullet-list">
            <li>Nhìn hình dáng ký tự tổng thể.</li>
            <li>Đọc chậm, rõ từng âm.</li>
            <li>Đổi qua lại với Hiragana để nhớ lâu hơn.</li>
          </ul>
        </div>
      </section>
    </PageShell>
  );
}
