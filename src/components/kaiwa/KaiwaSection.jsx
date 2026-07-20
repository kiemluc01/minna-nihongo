import { useEffect, useRef, useState } from "react";

import SpeechController from "../../controllers/SpeechController";
import { getKaiwa, saveKaiwa, deleteKaiwa, subscribeKaiwa } from "../../services/kaiwaService";
import { generateKaiwaExercise, isKaiwaAnswerCorrect } from "../../services/kaiwaExamService";

let uid = 0;
const nextKey = () => `kaiwa-${Date.now()}-${uid++}`;

const FORMATS = [
  { key: "choice", label: "Trắc nghiệm" },
  { key: "fill", label: "Điền từ" }
];

const buildDraftLine = (speakerId) => ({ key: nextKey(), speakerId, text: "", translation: "" });

export default function KaiwaSection({ lessonId }) {
  const [kaiwa, setKaiwa] = useState(() => getKaiwa(lessonId));
  const [mode, setMode] = useState(() => (getKaiwa(lessonId) ? "view" : "setup"));

  const [speakerCount, setSpeakerCount] = useState(2);
  const [speakerNames, setSpeakerNames] = useState(["", ""]);

  const [draftSpeakers, setDraftSpeakers] = useState([]);
  const [draftLines, setDraftLines] = useState([]);
  const [editError, setEditError] = useState("");

  const [exerciseFormat, setExerciseFormat] = useState("choice");
  const [exercise, setExercise] = useState(null);
  const [exerciseAnswer, setExerciseAnswer] = useState("");
  const [exerciseSubmitted, setExerciseSubmitted] = useState(false);

  const audioControllerRef = useRef(null);
  const [audioState, setAudioState] = useState("idle");
  const [activeLineIndex, setActiveLineIndex] = useState(-1);

  useEffect(() => subscribeKaiwa(() => setKaiwa(getKaiwa(lessonId))), [lessonId]);

  useEffect(() => () => audioControllerRef.current?.stop(), []);

  const stopAudio = () => {
    audioControllerRef.current?.stop();
    setAudioState("idle");
    setActiveLineIndex(-1);
  };

  const playAudio = (texts) => {
    audioControllerRef.current = SpeechController.speakSequence(texts, {
      onLineStart: (index) => setActiveLineIndex(index),
      onEnd: () => {
        setAudioState("idle");
        setActiveLineIndex(-1);
      }
    });
    setAudioState("playing");
  };

  const pauseAudio = () => {
    audioControllerRef.current?.pause();
    setAudioState("paused");
  };

  const resumeAudio = () => {
    audioControllerRef.current?.resume();
    setAudioState("playing");
  };

  const handleSpeakerCountChange = (value) => {
    const count = Math.min(Math.max(Number(value) || 2, 2), 6);
    setSpeakerCount(count);
    setSpeakerNames((current) => {
      const next = [...current];
      while (next.length < count) next.push("");
      return next.slice(0, count);
    });
  };

  const handleStartKaiwa = () => {
    const speakers = speakerNames
      .slice(0, speakerCount)
      .map((name, index) => ({ id: index + 1, name: name.trim() || `Người ${index + 1}` }));

    setDraftSpeakers(speakers);
    setDraftLines([buildDraftLine(speakers[0].id)]);
    setEditError("");
    setMode("edit");
  };

  const handleEditExisting = () => {
    setDraftSpeakers(kaiwa.speakers);
    setDraftLines(
      kaiwa.lines.map((line) => ({
        key: nextKey(),
        speakerId: line.speakerId,
        text: line.text,
        translation: line.translation || ""
      }))
    );
    setEditError("");
    setMode("edit");
  };

  const handleCancelEdit = () => {
    stopAudio();
    setMode(kaiwa ? "view" : "setup");
  };

  const updateDraftLine = (key, field, value) =>
    setDraftLines((lines) => lines.map((line) => (line.key === key ? { ...line, [field]: value } : line)));
  const addDraftLine = () =>
    setDraftLines((lines) => [...lines, buildDraftLine(draftSpeakers[0]?.id)]);
  const removeDraftLine = (key) => setDraftLines((lines) => lines.filter((line) => line.key !== key));

  const handleSaveKaiwa = () => {
    const cleanLines = draftLines
      .map((line) => ({
        speakerId: line.speakerId,
        text: line.text.trim(),
        translation: line.translation.trim()
      }))
      .filter((line) => line.text)
      .map((line, index) => ({ id: index + 1, ...line }));

    if (cleanLines.length === 0) {
      setEditError("Vui lòng nhập ít nhất một câu thoại.");
      return;
    }

    saveKaiwa(lessonId, { speakers: draftSpeakers, lines: cleanLines });
    setExercise(null);
    setMode("view");
  };

  const handleDeleteKaiwa = () => {
    const confirmed = window.confirm("Xóa hội thoại này? Không thể hoàn tác.");
    if (confirmed) {
      stopAudio();
      deleteKaiwa(lessonId);
      setExercise(null);
      setMode("setup");
    }
  };

  const handleGenerateExercise = () => {
    stopAudio();
    const next = generateKaiwaExercise({ kaiwa, format: exerciseFormat });
    setExercise(next);
    setExerciseAnswer("");
    setExerciseSubmitted(false);
  };

  const handleSubmitExercise = () => setExerciseSubmitted(true);

  const handleCloseExercise = () => {
    stopAudio();
    setExercise(null);
    setExerciseAnswer("");
    setExerciseSubmitted(false);
  };

  const exerciseIsCorrect = exerciseSubmitted && exercise && isKaiwaAnswerCorrect(exerciseAnswer, exercise.answer);

  if (mode === "setup") {
    return (
      <section className="form-section">
        <div className="form-section-heading">
          <h2>Tạo hội thoại</h2>
        </div>
        <p className="form-section-hint">Trước tiên, chọn số người tham gia cuộc hội thoại.</p>
        <div className="form-field" style={{ maxWidth: 200 }}>
          <label htmlFor="speaker-count">Số người</label>
          <input
            id="speaker-count"
            type="number"
            min={2}
            max={6}
            value={speakerCount}
            onChange={(event) => handleSpeakerCountChange(event.target.value)}
          />
        </div>
        <div className="dynamic-list">
          {speakerNames.map((name, index) => (
            <div className="form-field" key={index}>
              <label>Tên người {index + 1}</label>
              <input
                value={name}
                onChange={(event) =>
                  setSpeakerNames((current) => current.map((n, i) => (i === index ? event.target.value : n)))
                }
                placeholder={`Vd: Người ${index + 1}`}
              />
            </div>
          ))}
        </div>
        <div className="form-actions">
          <button type="button" className="primary-button" onClick={handleStartKaiwa}>
            Bắt đầu hội thoại
          </button>
        </div>
      </section>
    );
  }

  if (mode === "edit") {
    return (
      <section className="form-section">
        <div className="form-section-heading">
          <h2>Nhập nội dung hội thoại</h2>
          <button type="button" className="secondary-button add-item-button" onClick={addDraftLine}>
            + Thêm câu
          </button>
        </div>
        <p className="form-section-hint">Mỗi câu chọn người nói và nhập lời thoại. Có thể thêm dịch nghĩa.</p>
        <div className="dynamic-list">
          {draftLines.map((line, index) => (
            <div key={line.key} className="dynamic-list-item">
              <div className="dynamic-list-item-top">
                <span>Câu {index + 1}</span>
                {draftLines.length > 1 && (
                  <button type="button" className="remove-item-button" onClick={() => removeDraftLine(line.key)}>
                    Xóa
                  </button>
                )}
              </div>
              <div className="form-grid">
                <div className="form-field">
                  <label>Người nói</label>
                  <select
                    value={line.speakerId}
                    onChange={(event) => updateDraftLine(line.key, "speakerId", Number(event.target.value))}
                  >
                    {draftSpeakers.map((speaker) => (
                      <option key={speaker.id} value={speaker.id}>
                        {speaker.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-field span-2">
                  <label>Lời thoại (tiếng Nhật)</label>
                  <input
                    value={line.text}
                    onChange={(event) => updateDraftLine(line.key, "text", event.target.value)}
                    placeholder="Vd: わたしは ベトナムじんです。"
                  />
                </div>
                <div className="form-field span-2">
                  <label>Dịch nghĩa (không bắt buộc)</label>
                  <input
                    value={line.translation}
                    onChange={(event) => updateDraftLine(line.key, "translation", event.target.value)}
                    placeholder="Vd: Tôi là người Việt Nam."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {editError && <p className="form-error">{editError}</p>}

        <div className="form-actions">
          <button type="button" className="primary-button" onClick={handleSaveKaiwa}>
            Lưu hội thoại
          </button>
          <button type="button" className="secondary-button" onClick={handleCancelEdit}>
            Hủy
          </button>
        </div>
      </section>
    );
  }

  // mode === "view"
  return (
    <>
      {!exercise && (
        <section className="form-section">
          <div className="form-section-heading">
            <h2>Hội thoại</h2>
            <div className="form-actions">
              <button type="button" className="secondary-button" onClick={handleEditExisting}>
                Sửa hội thoại
              </button>
              <button type="button" className="remove-item-button" onClick={handleDeleteKaiwa}>
                Xóa
              </button>
            </div>
          </div>

          <div className="script-filter-bar">
            {kaiwa.speakers.map((speaker) => (
              <span key={speaker.id} className="filter-chip">
                {speaker.name}
              </span>
            ))}
          </div>

          <div className="kaiwa-lines">
            {kaiwa.lines.map((line, index) => (
              <div key={line.id} className={`kaiwa-line ${activeLineIndex === index ? "is-active" : ""}`}>
                <span className="kaiwa-speaker">{kaiwa.speakers.find((s) => s.id === line.speakerId)?.name}：</span>
                <span>{line.text}</span>
                {line.translation && <p className="grammar-translation">{line.translation}</p>}
              </div>
            ))}
          </div>

          <div className="form-actions">
            {audioState === "idle" && (
              <button
                type="button"
                className="icon-button"
                onClick={() => playAudio(kaiwa.lines.map((line) => line.text))}
              >
                🔊 Nghe hội thoại
              </button>
            )}
            {audioState === "playing" && (
              <button type="button" className="secondary-button" onClick={pauseAudio}>
                ⏸ Tạm dừng
              </button>
            )}
            {audioState === "paused" && (
              <button type="button" className="primary-button" onClick={resumeAudio}>
                ▶ Tiếp tục
              </button>
            )}
            {audioState !== "idle" && (
              <button type="button" className="secondary-button" onClick={stopAudio}>
                ⏹ Dừng
              </button>
            )}
          </div>
        </section>
      )}

      <section className="form-section">
        <div className="form-section-heading">
          <h2>Bài tập đục lỗ</h2>
        </div>
        <p className="form-section-hint">
          Mỗi lần tạo, hệ thống chọn ngẫu nhiên một từ hoặc một câu trong hội thoại để đục lỗ.
        </p>
        <div className="script-filter-bar">
          {FORMATS.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`filter-chip ${exerciseFormat === item.key ? "is-active" : ""}`}
              onClick={() => setExerciseFormat(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="form-actions">
          <button type="button" className="primary-button" onClick={handleGenerateExercise}>
            {exercise ? "Bài tập khác" : "Tạo bài tập"}
          </button>
          {exercise && (
            <button type="button" className="secondary-button" onClick={handleCloseExercise}>
              Đóng bài tập
            </button>
          )}
        </div>

        {exercise && (
          <>
            <p className="form-section-hint">Đoạn hội thoại mẫu đang được ẩn để tránh lộ đáp án khi làm bài.</p>
            <div className="kaiwa-lines">
              {exercise.lines.map((line) => (
                <div key={line.id} className={`kaiwa-line ${line.isBlank ? "is-blank" : ""}`}>
                  <span className="kaiwa-speaker">{line.speakerName}：</span>
                  <span>{line.text}</span>
                </div>
              ))}
            </div>

            <div className="form-actions">
              {audioState === "idle" && (
                <button type="button" className="icon-button" onClick={() => playAudio(exercise.audioTexts)}>
                  🔊 Nghe cả đoạn
                </button>
              )}
              {audioState === "playing" && (
                <button type="button" className="secondary-button" onClick={pauseAudio}>
                  ⏸ Tạm dừng
                </button>
              )}
              {audioState === "paused" && (
                <button type="button" className="primary-button" onClick={resumeAudio}>
                  ▶ Tiếp tục
                </button>
              )}
              {audioState !== "idle" && (
                <button type="button" className="secondary-button" onClick={stopAudio}>
                  ⏹ Dừng
                </button>
              )}
            </div>

            {exercise.type === "choice" ? (
              <div className="quiz-options">
                {exercise.options.map((option) => (
                  <button
                    type="button"
                    key={option}
                    className={`quiz-option ${exerciseAnswer === option ? "is-selected" : ""} ${
                      exerciseSubmitted && option === exercise.answer ? "is-correct" : ""
                    } ${
                      exerciseSubmitted && exerciseAnswer === option && option !== exercise.answer ? "is-wrong" : ""
                    }`}
                    onClick={() => !exerciseSubmitted && setExerciseAnswer(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : (
              <input
                className="search-input"
                value={exerciseAnswer}
                onChange={(event) => setExerciseAnswer(event.target.value)}
                placeholder={exercise.kind === "word" ? "Nhập từ còn thiếu" : "Nhập cả câu còn thiếu"}
                disabled={exerciseSubmitted}
              />
            )}

            {exerciseSubmitted && (
              <p className={exerciseIsCorrect ? "grammar-translation" : "form-error"}>
                {exerciseIsCorrect ? "✅ Đúng" : `❌ Đáp án: ${exercise.answer}`}
              </p>
            )}

            <div className="form-actions">
              {!exerciseSubmitted ? (
                <button type="button" className="primary-button" onClick={handleSubmitExercise}>
                  Nộp bài
                </button>
              ) : (
                <button type="button" className="secondary-button" onClick={handleGenerateExercise}>
                  Bài tập khác
                </button>
              )}
            </div>
          </>
        )}
      </section>
    </>
  );
}
