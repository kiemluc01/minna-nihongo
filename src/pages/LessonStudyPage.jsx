import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import FlashCard from "../components/flashcard/Flashcard";
import PageShell from "../components/common/PageShell";
import KaiwaSection from "../components/kaiwa/KaiwaSection";

import { useLessonsData, findLessonRoadmap } from "../store/useLessonsData";
import { deleteCustomLesson } from "../services/customLessonsService";
import {
  addVocabularyWord,
  addGrammarNote,
  updateVocabularyWord,
  updateGrammarNote,
  removeVocabularyWord,
  removeGrammarNote
} from "../services/lessonAdditionsService";
import {
  setVocabOverride,
  clearVocabOverride,
  setGrammarOverride,
  clearGrammarOverride
} from "../services/lessonOverridesService";
import SpeechController from "../controllers/SpeechController";
import { getFrontText, getReadingText } from "../utils/vocabulary";
import { parseBlankField } from "../services/grammarExamService";

const tabs = [
  { key: "roadmap", label: "Lộ trình" },
  { key: "vocabulary", label: "Từ vựng" },
  { key: "grammar", label: "Ngữ pháp" },
  { key: "kaiwa", label: "Hội thoại" }
];

const emptyVocabForm = { jp: "", reading: "", katakana: "", meaning: "" };
const emptyGrammarForm = { title: "", detail: "", example: "", translation: "", blank: "" };

const blankToInputValue = (blank) => (Array.isArray(blank) ? blank.join(", ") : blank || "");

const grammarKeyOf = (item) => (item.isAdded ? `a-${item.additionIndex}` : `s-${item.staticIndex}`);

export default function LessonStudyPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { lessonRoadmaps } = useLessonsData();
  const lesson = findLessonRoadmap(lessonRoadmaps, lessonId);
  const [activeTab, setActiveTab] = useState("roadmap");
  const [vocabIndex, setVocabIndex] = useState(0);

  const [showAddVocab, setShowAddVocab] = useState(false);
  const [vocabForm, setVocabForm] = useState(emptyVocabForm);
  const [showAddGrammar, setShowAddGrammar] = useState(false);
  const [grammarForm, setGrammarForm] = useState(emptyGrammarForm);

  const [showEditVocab, setShowEditVocab] = useState(false);
  const [editVocabForm, setEditVocabForm] = useState(emptyVocabForm);
  const [editingGrammarKey, setEditingGrammarKey] = useState(null);
  const [editGrammarForm, setEditGrammarForm] = useState(emptyGrammarForm);

  const lessonNumber = useMemo(
    () => Number.parseInt(lessonId, 10),
    [lessonId]
  );

  if (!lesson) {
    const firstId = lessonRoadmaps[0]?.id;
    const lastId = lessonRoadmaps[lessonRoadmaps.length - 1]?.id;

    return (
      <PageShell
        eyebrow="Lộ trình"
        title="Không tìm thấy bài học"
        description={`Bài học bạn mở chưa có trong bộ dữ liệu ${lessonRoadmaps.length} bài.`}
      >
        <article className="empty-state">
          <h3>Lesson không tồn tại</h3>
          <p>Vui lòng quay lại trang lộ trình để chọn bài {firstId} đến bài {lastId}.</p>
        </article>
      </PageShell>
    );
  }

  const vocabCount = lesson.vocabulary.length;
  const currentVocabIndex = vocabCount > 0 ? vocabIndex % vocabCount : 0;
  const currentWord = lesson.vocabulary[currentVocabIndex];

  const goToPreviousVocab = () => {
    setShowEditVocab(false);
    setVocabIndex((current) => (current - 1 + vocabCount) % vocabCount);
  };

  const goToNextVocab = () => {
    setShowEditVocab(false);
    setVocabIndex((current) => (current + 1) % vocabCount);
  };

  const handleDelete = () => {
    const confirmed = window.confirm(`Xóa bài "${lesson.title}"? Không thể hoàn tác.`);
    if (confirmed) {
      deleteCustomLesson(lesson.id);
      navigate("/roadmap");
    }
  };

  const handleAddVocabSubmit = (event) => {
    event.preventDefault();
    const jp = vocabForm.jp.trim();

    if (!jp) {
      return;
    }

    addVocabularyWord(lesson.id, {
      jp,
      reading: vocabForm.reading.trim(),
      katakana: vocabForm.katakana.trim(),
      meaning: vocabForm.meaning.trim()
    });
    setVocabForm(emptyVocabForm);
  };

  const handleRemoveCurrentWord = () => {
    if (!currentWord?.isAdded) {
      return;
    }
    removeVocabularyWord(lesson.id, currentWord.additionIndex);
    setVocabIndex(0);
  };

  const openEditVocab = () => {
    setEditVocabForm({
      jp: currentWord.jp || "",
      reading: currentWord.reading || "",
      katakana: currentWord.katakana || "",
      meaning: currentWord.meaning || ""
    });
    setShowEditVocab(true);
  };

  const handleEditVocabSubmit = (event) => {
    event.preventDefault();
    const jp = editVocabForm.jp.trim();

    if (!jp) {
      return;
    }

    const patch = {
      jp,
      reading: editVocabForm.reading.trim(),
      katakana: editVocabForm.katakana.trim(),
      meaning: editVocabForm.meaning.trim()
    };

    if (currentWord.isAdded) {
      updateVocabularyWord(lesson.id, currentWord.additionIndex, patch);
    } else {
      setVocabOverride(lesson.id, currentWord.id, patch);
    }
    setShowEditVocab(false);
  };

  const handleResetVocab = () => {
    clearVocabOverride(lesson.id, currentWord.id);
    setShowEditVocab(false);
  };

  const handleAddGrammarSubmit = (event) => {
    event.preventDefault();
    const title = grammarForm.title.trim();
    const detail = grammarForm.detail.trim();
    const example = grammarForm.example.trim();

    if (!title && !detail && !example) {
      return;
    }

    addGrammarNote(lesson.id, {
      title,
      detail,
      example,
      translation: grammarForm.translation.trim(),
      blank: parseBlankField(grammarForm.blank)
    });
    setGrammarForm(emptyGrammarForm);
  };

  const handleRemoveGrammarNote = (note) => {
    removeGrammarNote(lesson.id, note.additionIndex);
  };

  const openEditGrammar = (item) => {
    setEditGrammarForm({
      title: item.title || "",
      detail: item.detail || "",
      example: item.example || "",
      translation: item.translation || "",
      blank: blankToInputValue(item.blank)
    });
    setEditingGrammarKey(grammarKeyOf(item));
  };

  const handleEditGrammarSubmit = (item) => (event) => {
    event.preventDefault();
    const title = editGrammarForm.title.trim();
    const detail = editGrammarForm.detail.trim();
    const example = editGrammarForm.example.trim();

    if (!title && !detail && !example) {
      return;
    }

    const patch = {
      title,
      detail,
      example,
      translation: editGrammarForm.translation.trim(),
      blank: parseBlankField(editGrammarForm.blank)
    };

    if (item.isAdded) {
      updateGrammarNote(lesson.id, item.additionIndex, patch);
    } else {
      setGrammarOverride(lesson.id, item.staticIndex, patch);
    }
    setEditingGrammarKey(null);
  };

  const handleResetGrammar = (item) => {
    clearGrammarOverride(lesson.id, item.staticIndex);
    setEditingGrammarKey(null);
  };

  return (
    <PageShell
      eyebrow={`Bài ${lesson.id}`}
      title={lesson.title}
      description={lesson.focus}
      actions={
        lesson.isCustom && (
          <button type="button" className="secondary-button" onClick={handleDelete}>
            Xóa bài này
          </button>
        )
      }
      aside={
        <>
          <p className="aside-label">Nguồn</p>
          <strong className="aside-value">
            {lesson.pptxFile ?? "Tự thêm"}
          </strong>
          <p className="aside-note">
            {lesson.isCustom
              ? "Bài này do bạn tự thêm trên giao diện."
              : `Dựa trên file ${lesson.pptxFile}.`}{" "}
            Lộ trình chia thành 3 tab để dễ học.
          </p>
        </>
      }
    >
      <div className="tab-bar">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`tab-chip ${activeTab === tab.key ? "is-active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "roadmap" && (
        <section className="lesson-panel-grid">
          <article className="lesson-panel">
            <h2>Tổng quan bài {lessonNumber}</h2>
            <p>{lesson.subtitle}</p>
            <div className="info-grid">
              <div>
                <span className="aside-label">Slide</span>
                <strong>{lesson.slideCount ?? "-"}</strong>
              </div>
              <div>
                <span className="aside-label">Từ mẫu</span>
                <strong>{lesson.vocabulary.length}</strong>
              </div>
              <div>
                <span className="aside-label">Ngữ pháp</span>
                <strong>{lesson.grammarNotes.length}</strong>
              </div>
            </div>
          </article>

          <article className="lesson-panel">
            <h2>Các bước học</h2>
            <ol className="roadmap-list">
              {lesson.roadmapSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </article>
        </section>
      )}

      {activeTab === "vocabulary" && (
        <section className="study-stage">
          <div className="section-toolbar">
            <button
              type="button"
              className="secondary-button"
              onClick={() => setShowAddVocab((current) => !current)}
            >
              {showAddVocab ? "Đóng" : "+ Thêm từ vựng"}
            </button>
          </div>

          {showAddVocab && (
            <form className="inline-add-form" onSubmit={handleAddVocabSubmit}>
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="add-vocab-jp">Tiếng Nhật *</label>
                  <input
                    id="add-vocab-jp"
                    value={vocabForm.jp}
                    onChange={(event) => setVocabForm((current) => ({ ...current, jp: event.target.value }))}
                    placeholder="Vd: やさい"
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="add-vocab-reading">Cách đọc</label>
                  <input
                    id="add-vocab-reading"
                    value={vocabForm.reading}
                    onChange={(event) => setVocabForm((current) => ({ ...current, reading: event.target.value }))}
                    placeholder="Vd: yasai"
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="add-vocab-katakana">Katakana (nếu có)</label>
                  <input
                    id="add-vocab-katakana"
                    value={vocabForm.katakana}
                    onChange={(event) => setVocabForm((current) => ({ ...current, katakana: event.target.value }))}
                    placeholder="Vd: ヤサイ (để trống nếu từ không phải từ mượn)"
                  />
                </div>
                <div className="form-field span-2">
                  <label htmlFor="add-vocab-meaning">Nghĩa tiếng Việt</label>
                  <input
                    id="add-vocab-meaning"
                    value={vocabForm.meaning}
                    onChange={(event) => setVocabForm((current) => ({ ...current, meaning: event.target.value }))}
                    placeholder="Vd: rau"
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="primary-button">
                  Lưu từ vựng
                </button>
              </div>
            </form>
          )}

          {currentWord && (
            <>
              {!showEditVocab ? (
                <FlashCard
                  key={`${lesson.id}-${currentWord.jp}`}
                  jp={getFrontText(currentWord)}
                  // backLabel="Nghĩa + Romaji"
                  backText={[currentWord.meaning, getReadingText(currentWord)].filter(Boolean).join("\n")}
                  speak={() => SpeechController.speak(currentWord.jp)}
                />
              ) : (
                <form className="inline-add-form" onSubmit={handleEditVocabSubmit}>
                  <div className="form-grid">
                    <div className="form-field">
                      <label htmlFor="edit-vocab-jp">Tiếng Nhật *</label>
                      <input
                        id="edit-vocab-jp"
                        value={editVocabForm.jp}
                        onChange={(event) => setEditVocabForm((current) => ({ ...current, jp: event.target.value }))}
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="edit-vocab-reading">Cách đọc</label>
                      <input
                        id="edit-vocab-reading"
                        value={editVocabForm.reading}
                        onChange={(event) =>
                          setEditVocabForm((current) => ({ ...current, reading: event.target.value }))
                        }
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="edit-vocab-katakana">Katakana (nếu có)</label>
                      <input
                        id="edit-vocab-katakana"
                        value={editVocabForm.katakana}
                        onChange={(event) =>
                          setEditVocabForm((current) => ({ ...current, katakana: event.target.value }))
                        }
                      />
                    </div>
                    <div className="form-field span-2">
                      <label htmlFor="edit-vocab-meaning">Nghĩa tiếng Việt</label>
                      <input
                        id="edit-vocab-meaning"
                        value={editVocabForm.meaning}
                        onChange={(event) =>
                          setEditVocabForm((current) => ({ ...current, meaning: event.target.value }))
                        }
                      />
                    </div>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="primary-button">
                      Lưu chỉnh sửa
                    </button>
                    <button type="button" className="secondary-button" onClick={() => setShowEditVocab(false)}>
                      Hủy
                    </button>
                    {currentWord.isOverridden && (
                      <button type="button" className="remove-item-button" onClick={handleResetVocab}>
                        Khôi phục mặc định
                      </button>
                    )}
                  </div>
                </form>
              )}

              <div className="study-controls">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={goToPreviousVocab}
                  disabled={vocabCount <= 1}
                >
                  Previous
                </button>

                <button
                  type="button"
                  className="primary-button"
                  onClick={goToNextVocab}
                  disabled={vocabCount <= 1}
                >
                  Next
                </button>

                <button type="button" className="secondary-button" onClick={openEditVocab}>
                  Sửa từ này
                </button>

                {currentWord.isAdded && (
                  <button type="button" className="remove-item-button" onClick={handleRemoveCurrentWord}>
                    Xóa từ này
                  </button>
                )}
              </div>

              <div className="vocab-meta-grid">
                <div>
                  <span className="aside-label">Current</span>
                  <strong>{currentVocabIndex + 1}</strong>
                </div>
                <div>
                  <span className="aside-label">Total</span>
                  <strong>{vocabCount}</strong>
                </div>
                {currentWord.isOverridden && (
                  <div>
                    <span className="aside-label">Trạng thái</span>
                    <strong>Đã chỉnh sửa</strong>
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      )}

      {activeTab === "grammar" && (
        <section className="study-stage">
          <div className="section-toolbar">
            <button
              type="button"
              className="secondary-button"
              onClick={() => setShowAddGrammar((current) => !current)}
            >
              {showAddGrammar ? "Đóng" : "+ Thêm ngữ pháp"}
            </button>
          </div>

          {showAddGrammar && (
            <form className="inline-add-form" onSubmit={handleAddGrammarSubmit}>
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="add-grammar-title">Mẫu ngữ pháp</label>
                  <input
                    id="add-grammar-title"
                    value={grammarForm.title}
                    onChange={(event) => setGrammarForm((current) => ({ ...current, title: event.target.value }))}
                    placeholder="Vd: を"
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="add-grammar-detail">Giải thích</label>
                  <input
                    id="add-grammar-detail"
                    value={grammarForm.detail}
                    onChange={(event) => setGrammarForm((current) => ({ ...current, detail: event.target.value }))}
                    placeholder="Vd: Đánh dấu đối tượng của động từ"
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="add-grammar-example">Câu ví dụ (tiếng Nhật)</label>
                  <input
                    id="add-grammar-example"
                    value={grammarForm.example}
                    onChange={(event) => setGrammarForm((current) => ({ ...current, example: event.target.value }))}
                    placeholder="Vd: やさいを かいます。"
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="add-grammar-translation">Dịch nghĩa</label>
                  <input
                    id="add-grammar-translation"
                    value={grammarForm.translation}
                    onChange={(event) =>
                      setGrammarForm((current) => ({ ...current, translation: event.target.value }))
                    }
                    placeholder="Vd: Tôi mua rau."
                  />
                </div>
                <div className="form-field span-2">
                  <label htmlFor="add-grammar-blank">Từ cần điền khi kiểm tra (không bắt buộc)</label>
                  <input
                    id="add-grammar-blank"
                    value={grammarForm.blank}
                    onChange={(event) => setGrammarForm((current) => ({ ...current, blank: event.target.value }))}
                    placeholder="Để trống nếu giống 'Mẫu ngữ pháp'. Nhiều từ thì cách nhau bằng dấu phẩy, vd: から, まで."
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="primary-button">
                  Lưu mẫu ngữ pháp
                </button>
              </div>
            </form>
          )}

          <div className="grammar-grid">
            {lesson.grammarNotes.length === 0 && (
              <article className="empty-state">
                <h3>Chưa có ghi chú ngữ pháp</h3>
                <p>Bài này chưa có điểm ngữ pháp nào được thêm.</p>
              </article>
            )}

            {lesson.grammarNotes.map((item, index) => {
              const key = grammarKeyOf(item);
              const isEditing = editingGrammarKey === key;

              return (
                <article key={`${item.title}-${index}`} className="grammar-note-card">
                  {!isEditing ? (
                    <>
                      <span className="lesson-kicker">
                        Mẫu câu{item.isOverridden ? " · Đã chỉnh sửa" : ""}
                      </span>
                      <h3>{item.title}</h3>
                      <p>{item.detail}</p>
                      <div className="grammar-example-row">
                        <div className="grammar-example">
                          {item.example}
                        </div>
                        {item.example && (
                          <button
                            type="button"
                            className="icon-button icon-button-compact"
                            onClick={() => SpeechController.speak(item.example)}
                            aria-label="Nghe câu ví dụ"
                          >
                            🔊
                          </button>
                        )}
                      </div>
                      {item.translation && (
                        <p className="grammar-translation">{item.translation}</p>
                      )}
                      <div className="dynamic-list-item-top">
                        <button type="button" className="secondary-button" onClick={() => openEditGrammar(item)}>
                          Sửa
                        </button>
                        {item.isAdded && (
                          <button
                            type="button"
                            className="remove-item-button"
                            onClick={() => handleRemoveGrammarNote(item)}
                          >
                            Xóa
                          </button>
                        )}
                      </div>
                    </>
                  ) : (
                    <form onSubmit={handleEditGrammarSubmit(item)}>
                      <div className="form-field">
                        <label>Mẫu ngữ pháp</label>
                        <input
                          value={editGrammarForm.title}
                          onChange={(event) =>
                            setEditGrammarForm((current) => ({ ...current, title: event.target.value }))
                          }
                        />
                      </div>
                      <div className="form-field">
                        <label>Giải thích</label>
                        <input
                          value={editGrammarForm.detail}
                          onChange={(event) =>
                            setEditGrammarForm((current) => ({ ...current, detail: event.target.value }))
                          }
                        />
                      </div>
                      <div className="form-field">
                        <label>Câu ví dụ (tiếng Nhật)</label>
                        <input
                          value={editGrammarForm.example}
                          onChange={(event) =>
                            setEditGrammarForm((current) => ({ ...current, example: event.target.value }))
                          }
                        />
                      </div>
                      <div className="form-field">
                        <label>Dịch nghĩa</label>
                        <input
                          value={editGrammarForm.translation}
                          onChange={(event) =>
                            setEditGrammarForm((current) => ({ ...current, translation: event.target.value }))
                          }
                        />
                      </div>
                      <div className="form-field">
                        <label>Từ cần điền khi kiểm tra</label>
                        <input
                          value={editGrammarForm.blank}
                          onChange={(event) =>
                            setEditGrammarForm((current) => ({ ...current, blank: event.target.value }))
                          }
                          placeholder="Nhiều từ cách nhau bằng dấu phẩy, vd: から, まで."
                        />
                      </div>
                      <div className="form-actions">
                        <button type="submit" className="primary-button">
                          Lưu chỉnh sửa
                        </button>
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => setEditingGrammarKey(null)}
                        >
                          Hủy
                        </button>
                        {item.isOverridden && (
                          <button
                            type="button"
                            className="remove-item-button"
                            onClick={() => handleResetGrammar(item)}
                          >
                            Khôi phục mặc định
                          </button>
                        )}
                      </div>
                    </form>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      )}

      {activeTab === "kaiwa" && <KaiwaSection key={lesson.id} lessonId={lesson.id} />}
    </PageShell>
  );
}
