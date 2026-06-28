import { useState } from "react";
import { Link } from "react-router-dom";

import FlashCard from "../components/flashcard/Flashcard";
import PageShell from "../components/common/PageShell";

import { hiraganaData } from "../data/hiragana";

import SpeechController from "../controllers/SpeechController";

export default function HiraganaPage() {
  const [index, setIndex] = useState(0);

  const card = hiraganaData[index];

  return (
    <PageShell
      eyebrow="Bảng chữ cái"
      title="Hiragana"
      description="Luyện từng ký tự bằng flashcard, nghe phát âm và chuyển thẻ nhanh."
      aside={
        <>
          <p className="aside-label">Tiến độ hiện tại</p>
          <strong className="aside-value">
            {index + 1}/{hiraganaData.length}
          </strong>
          <p className="aside-note">
            Chạm vào thẻ để lật mặt sau, hoặc bấm nút nghe để luyện phát âm.
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
                  (current + 1) % hiraganaData.length
                )
              }
            >
              Thẻ tiếp theo
            </button>

            <Link to="/katakana" className="secondary-button">
              Sang Katakana
            </Link>
          </div>
        </div>

        <div className="study-panel">
          <h2>Gợi ý học nhanh</h2>
          <p>
            Hãy đọc to từng ký tự, chạm để xem romaji và lặp lại 2 đến 3 vòng
            cho đến khi nhớ mặt chữ.
          </p>
          <ul className="bullet-list">
            <li>Nhìn mặt chữ trong 2 giây.</li>
            <li>Đọc romaji ngay sau khi lật thẻ.</li>
            <li>Bấm nghe phát âm để chỉnh giọng.</li>
          </ul>
        </div>
      </section>
    </PageShell>
  );
}
