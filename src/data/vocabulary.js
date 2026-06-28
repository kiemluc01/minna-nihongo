import lesson1 from "./vocabulary/lesson1";
import lesson2 from "./vocabulary/lesson2";
import lesson3 from "./vocabulary/lesson3";
import lesson4 from "./vocabulary/lesson4";
import lesson5 from "./vocabulary/lesson5";
import lesson6 from "./vocabulary/lesson6";
import lesson7 from "./vocabulary/lesson7";
import { enrichVocabularyList } from "./vocabularyEnrichment";

export const vocabularyData = {
  1: enrichVocabularyList(lesson1),
  2: enrichVocabularyList(lesson2),
  3: enrichVocabularyList(lesson3),
  4: enrichVocabularyList(lesson4),
  5: enrichVocabularyList(lesson5),
  6: enrichVocabularyList(lesson6),
  7: enrichVocabularyList(lesson7)
};
