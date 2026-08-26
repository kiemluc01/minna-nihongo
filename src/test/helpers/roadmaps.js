// Builder cho lessonRoadmaps dùng trong test sinh đề. Cố ý KHÔNG import dữ liệu
// thật (src/data/grammar/words.js nặng 11k dòng) để suite chạy nhanh và assertion
// không phụ thuộc nội dung bài học có thể thay đổi.

export const makeWord = (jp, meaning, extra = {}) => ({ jp, meaning, ...extra });

export const makeNote = (title, example, extra = {}) => ({
  title,
  detail: `Giải thích ${title}`,
  example,
  translation: `Dịch ${title}`,
  ...extra
});

export const makeLesson = ({ id, vocabulary = [], grammarNotes = [], ...rest }) => ({
  id,
  title: `Bài ${id}`,
  subtitle: `Mô tả bài ${id}`,
  focus: `Trọng tâm bài ${id}`,
  roadmapSteps: [],
  vocabulary,
  grammarNotes,
  ...rest
});

// Bộ dữ liệu mặc định: 2 bài, mỗi bài đủ từ vựng để pool distractor không rỗng.
export const makeRoadmaps = () => [
  makeLesson({
    id: 1,
    vocabulary: [
      makeWord("せんせい", "giáo viên"),
      makeWord("がくせい", "học sinh"),
      makeWord("いしゃ", "bác sĩ"),
      makeWord("だいがく", "đại học"),
      makeWord("びょういん", "bệnh viện")
    ],
    grammarNotes: [
      makeNote("は", "わたしは がくせいです。"),
      makeNote("の", "わたしの ほんです。"),
      makeNote("か", "がくせいですか。"),
      makeNote("も", "わたしも いきます。")
    ]
  }),
  makeLesson({
    id: 2,
    vocabulary: [
      makeWord("これ", "cái này"),
      makeWord("それ", "cái đó"),
      makeWord("あれ", "cái kia"),
      makeWord("ほん", "quyển sách")
    ],
    grammarNotes: [
      makeNote("を", "ほんを よみます。"),
      makeNote("で", "でんしゃで いきます。"),
      makeNote("に", "がっこうに いきます。")
    ]
  })
];
