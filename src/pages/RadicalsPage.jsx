import { useMemo, useState } from "react";

import FlashCard from "../components/flashcard/Flashcard";
import PageShell from "../components/common/PageShell";

import { radicals75 } from "../data/radicals75";

const strokeFilters = [
  { key: "all", label: "Tất cả" },
  { key: "1-2", label: "1-2 nét" },
  { key: "3", label: "3 nét" },
  { key: "4", label: "4 nét" }
];

export default function RadicalsPage() {
  const [strokeFilter, setStrokeFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [radicalIndex, setRadicalIndex] = useState(0);

  const filteredRadicals = useMemo(() => {
    return radicals75.filter((item) => {
      const matchesStroke =
        strokeFilter === "all"
          ? true
          : strokeFilter === "1-2"
            ? item.strokes <= 2
            : Number(strokeFilter) === item.strokes;

      const normalizedQuery = query.trim().toLowerCase();
      const matchesQuery =
        normalizedQuery.length === 0 ||
        item.radical.includes(normalizedQuery) ||
        item.reading.includes(normalizedQuery) ||
        item.meaning.toLowerCase().includes(normalizedQuery) ||
        item.note.toLowerCase().includes(normalizedQuery);

      return matchesStroke && matchesQuery;
    });
  }, [query, strokeFilter]);

  const radicalCount = filteredRadicals.length;
  const currentRadicalIndex = radicalCount > 0 ? radicalIndex % radicalCount : 0;
  const currentRadical = filteredRadicals[currentRadicalIndex];

  const goToPrevious = () => {
    setRadicalIndex((current) => (current - 1 + radicalCount) % radicalCount);
  };

  const goToNext = () => {
    setRadicalIndex((current) => (current + 1) % radicalCount);
  };

  return (
    <PageShell
      eyebrow="Bộ thủ"
      title="75 bộ thủ N5"
      description="Trang học bộ thủ theo dạng flashcard để nhìn hình, nhớ tên bộ và ghi nhớ theo nhóm nét."
      aside={
        <>
          <p className="aside-label">Số thẻ</p>
          <strong className="aside-value">{filteredRadicals.length}</strong>
          <p className="aside-note">
            Dùng tìm kiếm và bộ lọc nét để học theo tốc độ phù hợp.
          </p>
        </>
      }
    >
      <div className="filter-row">
        <input
          className="search-input"
          type="search"
          placeholder="Tìm radical hoặc tên bộ..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />

        <div className="script-filter-bar">
          {strokeFilters.map((filter) => (
            <button
              key={filter.key}
              type="button"
              className={`filter-chip ${strokeFilter === filter.key ? "is-active" : ""}`}
              onClick={() => setStrokeFilter(filter.key)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {currentRadical ? (
        <section className="study-stage">
          <FlashCard
            key={currentRadical.radical}
            jp={currentRadical.radical}
            backLabel="Tên bộ"
            backText={currentRadical.reading}
          />

          <div className="study-controls">
            <button
              type="button"
              className="secondary-button"
              onClick={goToPrevious}
              disabled={radicalCount <= 1}
            >
              Previous
            </button>

            <button
              type="button"
              className="primary-button"
              onClick={goToNext}
              disabled={radicalCount <= 1}
            >
              Next
            </button>
          </div>

          <div className="vocab-meta-grid">
            <div>
              <span className="aside-label">Current</span>
              <strong>{currentRadicalIndex + 1}</strong>
            </div>
            <div>
              <span className="aside-label">Total</span>
              <strong>{radicalCount}</strong>
            </div>
            <div>
              <span className="aside-label">Strokes</span>
              <strong>{currentRadical.strokes}</strong>
            </div>
            <div>
              <span className="aside-label">Tên bộ</span>
              <strong>{currentRadical.reading}</strong>
            </div>
          </div>
        </section>
      ) : (
        <article className="empty-state">
          <h3>Không có bộ thủ phù hợp</h3>
          <p>Hãy đổi bộ lọc hoặc xóa tìm kiếm để xem danh sách bộ thủ.</p>
        </article>
      )}
    </PageShell>
  );
}
