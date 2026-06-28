import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import HiraganaPage from "../pages/HiraganaPage";
import KatakanaPage from "../pages/KatakanaPage"
import VocabularyPage from "../pages/VocabularyPage";
import GrammarPage from "../pages/GrammarPage";
import Dashboard from "../pages/Dashboard";
import LessonVocabulary from "../pages/LessonVocabularyPage"
import PracticePage from "../pages/PracticePage"
import ExamPage from "../pages/ExamPage"
import RoadmapPage from "../pages/RoadmapPage";
import LessonStudyPage from "../pages/LessonStudyPage";
import RadicalsPage from "../pages/RadicalsPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Dashboard />}
        />

        <Route
          path="/hiragana"
          element={<HiraganaPage />}
        />

        <Route
          path="/katakana"
          element={<KatakanaPage />}
        />

        <Route
          path="/vocabulary"
          element={<VocabularyPage />}
        />

        <Route
          path="/roadmap"
          element={<RoadmapPage />}
        />

        <Route
          path="/lesson/:lessonId"
          element={<LessonStudyPage />}
        />

        <Route
          path="/vocabulary/:lessonId"
          element={<LessonVocabulary />}
        />

        <Route
          path="/grammar"
          element={<GrammarPage />}
        />

        <Route
          path="/practice"
          element={<PracticePage />}
        />

        <Route
          path="/exam"
          element={<ExamPage />}
        />

        <Route
          path="/radicals"
          element={<RadicalsPage />}
        />

      </Routes>
    </BrowserRouter>
  );
}
