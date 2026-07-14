import { useState } from "react";
import { useNavigate } from "react-router-dom";

import PageShell from "../components/common/PageShell";
import { useLessonsData } from "../store/useLessonsData";
import { addCustomLesson, getNextCustomLessonId } from "../services/customLessonsService";
import { parseBlankField } from "../services/grammarExamService";

let uid = 0;
const nextKey = () => `item-${Date.now()}-${uid++}`;

const emptyStep = () => ({ key: nextKey(), value: "" });
const emptyGrammarNote = () => ({ key: nextKey(), title: "", detail: "", example: "", translation: "", blank: "" });
const emptyVocabWord = () => ({ key: nextKey(), jp: "", reading: "", meaning: "" });

export default function AddLessonPage() {
  const navigate = useNavigate();
  const { lessonRoadmaps } = useLessonsData();

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [focus, setFocus] = useState("");
  const [roadmapSteps, setRoadmapSteps] = useState([emptyStep()]);
  const [grammarNotes, setGrammarNotes] = useState([emptyGrammarNote()]);
  const [vocabulary, setVocabulary] = useState([emptyVocabWord(), emptyVocabWord()]);
  const [error, setError] = useState("");

  const maxStaticId = Math.max(
    0,
    ...lessonRoadmaps.filter((lesson) => !lesson.isCustom).map((lesson) => lesson.id)
  );

  const updateStep = (key, value) =>
    setRoadmapSteps((steps) => steps.map((step) => (step.key === key ? { ...step, value } : step)));
  const addStep = () => setRoadmapSteps((steps) => [...steps, emptyStep()]);
  const removeStep = (key) => setRoadmapSteps((steps) => steps.filter((step) => step.key !== key));

  const updateGrammar = (key, field, value) =>
    setGrammarNotes((notes) => notes.map((note) => (note.key === key ? { ...note, [field]: value } : note)));
  const addGrammar = () => setGrammarNotes((notes) => [...notes, emptyGrammarNote()]);
  const removeGrammar = (key) => setGrammarNotes((notes) => notes.filter((note) => note.key !== key));

  const updateVocab = (key, field, value) =>
    setVocabulary((words) => words.map((word) => (word.key === key ? { ...word, [field]: value } : word)));
  const addVocab = () => setVocabulary((words) => [...words, emptyVocabWord()]);
  const removeVocab = (key) => setVocabulary((words) => words.filter((word) => word.key !== key));

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    const trimmedTitle = title.trim();

    const cleanVocab = vocabulary
      .map((word) => ({
        jp: word.jp.trim(),
        reading: word.reading.trim(),
        meaning: word.meaning.trim()
      }))
      .filter((word) => word.jp)
      .map((word, index) => ({ id: index + 1, sourceSlide: index + 1, ...word }));

    const cleanSteps = roadmapSteps.map((step) => step.value.trim()).filter(Boolean);

    const cleanGrammar = grammarNotes
      .map((note) => ({
        title: note.title.trim(),
        detail: note.detail.trim(),
        example: note.example.trim(),
        translation: note.translation.trim(),
        blank: parseBlankField(note.blank)
      }))
      .filter((note) => note.title || note.detail || note.example);

    if (!trimmedTitle) {
      setError("Vui lòng nhập tên bài học.");
      return;
    }

    if (cleanVocab.length === 0) {
      setError("Vui lòng thêm ít nhất một từ vựng (điền tiếng Nhật).");
      return;
    }

    const lesson = {
      id: getNextCustomLessonId(maxStaticId),
      title: trimmedTitle,
      subtitle: subtitle.trim(),
      focus: focus.trim(),
      slideCount: cleanVocab.length,
      roadmapSteps: cleanSteps.length > 0 ? cleanSteps : ["Học từ vựng và ngữ pháp của bài."],
      grammarNotes: cleanGrammar,
      vocabulary: cleanVocab
    };

    addCustomLesson(lesson);
    navigate(`/lesson/${lesson.id}`);
  };

  return (
    <PageShell
      eyebrow="Thêm bài mới"
      title="Tạo bài học mới"
      description="Nhập từ vựng và ngữ pháp theo đúng format hiện tại. Bài học được lưu ngay trong trình duyệt này và xuất hiện trong lộ trình."
    >
      <form className="lesson-form" onSubmit={handleSubmit}>
        <section className="form-section">
          <div className="form-section-heading">
            <h2>Thông tin chung</h2>
          </div>
          <div className="form-grid">
            <div className="form-field span-2">
              <label htmlFor="lesson-title">Tên bài học *</label>
              <input
                id="lesson-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Vd: Mua sắm"
              />
            </div>
            <div className="form-field span-2">
              <label htmlFor="lesson-subtitle">Mô tả ngắn</label>
              <input
                id="lesson-subtitle"
                value={subtitle}
                onChange={(event) => setSubtitle(event.target.value)}
                placeholder="Vd: Từ vựng và mẫu câu khi đi mua sắm"
              />
            </div>
            <div className="form-field span-2">
              <label htmlFor="lesson-focus">Trọng tâm bài học</label>
              <textarea
                id="lesson-focus"
                value={focus}
                onChange={(event) => setFocus(event.target.value)}
                placeholder="Vd: Luyện hỏi giá và trả giá khi mua đồ"
              />
            </div>
          </div>
        </section>

        <section className="form-section">
          <div className="form-section-heading">
            <h2>Các bước học</h2>
            <button type="button" className="secondary-button add-item-button" onClick={addStep}>
              + Thêm bước
            </button>
          </div>
          <div className="dynamic-list">
            {roadmapSteps.map((step, index) => (
              <div key={step.key} className="dynamic-list-item">
                <div className="dynamic-list-item-top">
                  <span>Bước {index + 1}</span>
                  {roadmapSteps.length > 1 && (
                    <button type="button" className="remove-item-button" onClick={() => removeStep(step.key)}>
                      Xóa
                    </button>
                  )}
                </div>
                <input
                  value={step.value}
                  onChange={(event) => updateStep(step.key, event.target.value)}
                  placeholder="Vd: Học từ vựng chỉ đồ vật trong bếp"
                />
              </div>
            ))}
          </div>
        </section>

        <section className="form-section">
          <div className="form-section-heading">
            <h2>Từ vựng *</h2>
            <button type="button" className="secondary-button add-item-button" onClick={addVocab}>
              + Thêm từ
            </button>
          </div>
          <p className="form-section-hint">
            Điền tiếng Nhật và nghĩa tiếng Việt cho từng từ. Cách đọc (romaji/hiragana) không bắt buộc.
          </p>
          <div className="dynamic-list">
            {vocabulary.map((word, index) => (
              <div key={word.key} className="dynamic-list-item">
                <div className="dynamic-list-item-top">
                  <span>Từ {index + 1}</span>
                  {vocabulary.length > 1 && (
                    <button type="button" className="remove-item-button" onClick={() => removeVocab(word.key)}>
                      Xóa
                    </button>
                  )}
                </div>
                <div className="form-grid">
                  <div className="form-field">
                    <label>Tiếng Nhật *</label>
                    <input
                      value={word.jp}
                      onChange={(event) => updateVocab(word.key, "jp", event.target.value)}
                      placeholder="Vd: やさい"
                    />
                  </div>
                  <div className="form-field">
                    <label>Cách đọc</label>
                    <input
                      value={word.reading}
                      onChange={(event) => updateVocab(word.key, "reading", event.target.value)}
                      placeholder="Vd: yasai"
                    />
                  </div>
                  <div className="form-field span-2">
                    <label>Nghĩa tiếng Việt</label>
                    <input
                      value={word.meaning}
                      onChange={(event) => updateVocab(word.key, "meaning", event.target.value)}
                      placeholder="Vd: rau"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="form-section">
          <div className="form-section-heading">
            <h2>Ngữ pháp</h2>
            <button type="button" className="secondary-button add-item-button" onClick={addGrammar}>
              + Thêm mẫu câu
            </button>
          </div>
          <p className="form-section-hint">
            Thêm mẫu câu kèm ví dụ và dịch nghĩa tiếng Việt để dễ ôn lại.
          </p>
          <div className="dynamic-list">
            {grammarNotes.map((note, index) => (
              <div key={note.key} className="dynamic-list-item">
                <div className="dynamic-list-item-top">
                  <span>Mẫu câu {index + 1}</span>
                  {grammarNotes.length > 1 && (
                    <button type="button" className="remove-item-button" onClick={() => removeGrammar(note.key)}>
                      Xóa
                    </button>
                  )}
                </div>
                <div className="form-grid">
                  <div className="form-field">
                    <label>Mẫu ngữ pháp</label>
                    <input
                      value={note.title}
                      onChange={(event) => updateGrammar(note.key, "title", event.target.value)}
                      placeholder="Vd: を"
                    />
                  </div>
                  <div className="form-field">
                    <label>Giải thích</label>
                    <input
                      value={note.detail}
                      onChange={(event) => updateGrammar(note.key, "detail", event.target.value)}
                      placeholder="Vd: Đánh dấu đối tượng của động từ"
                    />
                  </div>
                  <div className="form-field">
                    <label>Câu ví dụ (tiếng Nhật)</label>
                    <input
                      value={note.example}
                      onChange={(event) => updateGrammar(note.key, "example", event.target.value)}
                      placeholder="Vd: やさいを かいます。"
                    />
                  </div>
                  <div className="form-field">
                    <label>Dịch nghĩa</label>
                    <input
                      value={note.translation}
                      onChange={(event) => updateGrammar(note.key, "translation", event.target.value)}
                      placeholder="Vd: Tôi mua rau."
                    />
                  </div>
                  <div className="form-field span-2">
                    <label>Từ cần điền khi kiểm tra (không bắt buộc)</label>
                    <input
                      value={note.blank}
                      onChange={(event) => updateGrammar(note.key, "blank", event.target.value)}
                      placeholder="Để trống nếu giống 'Mẫu ngữ pháp'. Nếu câu có nhiều từ có thể đục lỗ, nhập cách nhau bằng dấu phẩy, vd: から, まで — mỗi lần ra đề sẽ random 1 từ."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <button type="submit" className="primary-button">
            Lưu bài học
          </button>
          <button type="button" className="secondary-button" onClick={() => navigate(-1)}>
            Hủy
          </button>
        </div>
      </form>
    </PageShell>
  );
}
