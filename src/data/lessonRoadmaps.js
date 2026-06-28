import { vocabularyData } from "./vocabulary";

export const lessonRoadmaps = [
  {
    id: 1,
    title: "Giới thiệu bản thân",
    subtitle: "Đại từ, nghề nghiệp, quốc gia và câu chào cơ bản",
    pptxFile: "Bai 1.pptx",
    slideCount: 23,
    focus: "Làm quen cách tự giới thiệu, hỏi nghề nghiệp và quốc tịch.",
    roadmapSteps: [
      "Xem lại các từ chỉ người và nghề nghiệp.",
      "Luyện câu mẫu với は và です.",
      "Học cách hỏi ai, bao nhiêu tuổi và đến từ đâu.",
      "Làm flashcard để nhớ nhanh tên nước và nghề."
    ],
    vocabExamples: [
      ...vocabularyData[1].slice(0, 6)
    ],
    vocabulary: vocabularyData[1],
    grammarNotes: [
      {
        title: "は",
        detail: "Dùng để đánh dấu chủ đề trong câu giới thiệu.",
        example: "わたしは ベトナムじんです。"
      },
      {
        title: "です",
        detail: "Mẫu câu khẳng định cơ bản, rất quan trọng ở bài mở đầu.",
        example: "わたしは がくせいです。"
      },
      {
        title: "どなた / だれ",
        detail: "Cách hỏi người nào, ai, trong tình huống lịch sự và thông thường.",
        example: "あの方は どなたですか。"
      }
    ]
  },
  {
    id: 2,
    title: "Đồ vật và chỉ định",
    subtitle: "Cách nói về đồ vật, sách, bút, máy tính và quà",
    pptxFile: "Bai 2.pptx",
    slideCount: 31,
    focus: "Học cách chỉ đồ vật gần xa và gọi tên những vật dụng quen thuộc.",
    roadmapSteps: [
      "Nhìn và đọc nhóm từ chỉ đồ vật quanh bạn.",
      "Luyện phân biệt これ / それ / あれ.",
      "Tập nói tên các đồ dùng học tập và thiết bị.",
      "Lặp lại bằng flashcard để nhớ từ katakana nhanh hơn."
    ],
    vocabExamples: [
      ...vocabularyData[2].slice(0, 6)
    ],
    vocabulary: vocabularyData[2],
    grammarNotes: [
      {
        title: "これ / それ / あれ",
        detail: "Chỉ đồ vật gần mình, gần người nghe hoặc ở xa cả hai.",
        example: "これは ほんです。"
      },
      {
        title: "の",
        detail: "Nối danh từ để nói về sở hữu hoặc loại của vật.",
        example: "わたしの かばん。"
      },
      {
        title: "ですか",
        detail: "Dùng để đặt câu hỏi ngắn, lịch sự và rất thường gặp.",
        example: "これは なんですか。"
      }
    ]
  },
  {
    id: 3,
    title: "Nơi chốn và địa điểm",
    subtitle: "Cách hỏi vị trí, chỉ nơi chốn và các địa điểm trong thành phố",
    pptxFile: "Bai 3.pptx",
    slideCount: 25,
    focus: "Học cách hỏi nơi chốn, vị trí và đọc tên các địa điểm quen thuộc.",
    roadmapSteps: [
      "Nhớ bộ từ chỉ vị trí: đây, kia, đâu.",
      "Luyện từ chỉ phòng, nhà vệ sinh, quầy lễ tân, hành lang.",
      "Tập trả lời địa điểm bằng câu ngắn và rõ.",
      "Ôn nhanh bằng cách ghép từ với bản đồ nhỏ."
    ],
    vocabExamples: [
      ...vocabularyData[3].slice(0, 6)
    ],
    vocabulary: vocabularyData[3],
    grammarNotes: [
      {
        title: "ここ / そこ / あそこ / どこ",
        detail: "Từ chỉ vị trí là trọng tâm của bài địa điểm.",
        example: "トイレは どこですか。"
      },
      {
        title: "あります / います",
        detail: "Phân biệt vật vô tri và người/động vật khi nói vị trí.",
        example: "本が あります。"
      },
      {
        title: "に",
        detail: "Dùng để chỉ nơi tồn tại hoặc điểm đến trong câu cơ bản.",
        example: "へやに あります。"
      }
    ]
  },
  {
    id: 4,
    title: "Sinh hoạt hằng ngày",
    subtitle: "Thức dậy, ngủ, học, làm việc và thời gian trong ngày",
    pptxFile: "Bai 4.pptx",
    slideCount: 22,
    focus: "Nói về nhịp sinh hoạt, thói quen và mốc thời gian quen thuộc.",
    roadmapSteps: [
      "Luyện các động từ chỉ hoạt động mỗi ngày.",
      "Học từ thời gian như sáng, trưa, tối, hôm nay.",
      "Tạo câu về lịch sinh hoạt của bản thân.",
      "Ghép hành động với thời gian để nhớ lâu hơn."
    ],
    vocabExamples: [
      ...vocabularyData[4].slice(0, 6)
    ],
    vocabulary: vocabularyData[4],
    grammarNotes: [
      {
        title: "ます",
        detail: "Dạng lịch sự cơ bản của động từ trong đời sống hằng ngày.",
        example: "あさ 6じに おきます。"
      },
      {
        title: "thời gian + に",
        detail: "Dùng để chỉ thời điểm cụ thể của một hành động.",
        example: "7じに はたらきます。"
      },
      {
        title: "まいにち / きょう",
        detail: "Từ chỉ tần suất và mốc thời gian giúp câu tự nhiên hơn.",
        example: "まいにち べんきょうします。"
      }
    ]
  },
  {
    id: 5,
    title: "Di chuyển và phương tiện",
    subtitle: "Đi, đến, về và các phương tiện giao thông",
    pptxFile: "Bai 5.pptx",
    slideCount: 20,
    focus: "Học các động từ di chuyển và cách nói phương tiện đi lại.",
    roadmapSteps: [
      "Nắm các động từ đi, đến, về.",
      "Nhận biết tên phương tiện giao thông và địa điểm.",
      "Tập nói cách di chuyển của bản thân.",
      "Luyện câu có điểm đến và cách thức đi lại."
    ],
    vocabExamples: [
      ...vocabularyData[5].slice(0, 6)
    ],
    vocabulary: vocabularyData[5],
    grammarNotes: [
      {
        title: "へ",
        detail: "Chỉ hướng đi đến một nơi.",
        example: "がっこうへ いきます。"
      },
      {
        title: "から / まで",
        detail: "Chỉ điểm bắt đầu và điểm kết thúc của hành trình.",
        example: "うちから えきまで いきます。"
      },
      {
        title: "で",
        detail: "Dùng để chỉ phương tiện di chuyển.",
        example: "でんしゃで いきます。"
      }
    ]
  },
  {
    id: 6,
    title: "Hành động với đồ vật",
    subtitle: "Ăn uống, đọc, xem, mua và các vật dụng thường gặp",
    pptxFile: "Bai 6.pptx",
    slideCount: 38,
    focus: "Luyện các động từ tác động trực tiếp lên đồ vật và món ăn.",
    roadmapSteps: [
      "Học nhóm động từ có tân ngữ.",
      "Nhớ tên đồ ăn, đồ uống và vật dụng quen thuộc.",
      "Tạo câu mẫu với を.",
      "Ôn nhanh bằng flashcard và đổi câu theo thực tế."
    ],
    vocabExamples: [
      ...vocabularyData[6].slice(0, 6)
    ],
    vocabulary: vocabularyData[6],
    grammarNotes: [
      {
        title: "を",
        detail: "Đánh dấu đối tượng chịu tác động của động từ.",
        example: "ごはんを たべます。"
      },
      {
        title: "động từ + ます",
        detail: "Mẫu câu lịch sự để nói hành động đang làm.",
        example: "みずを のみます。"
      },
      {
        title: "đối tượng + を + động từ",
        detail: "Cấu trúc nền tảng để nói ăn, uống, xem, mua.",
        example: "ほんを よみます。"
      }
    ]
  },
  {
    id: 7,
    title: "Cho - nhận - mượn",
    subtitle: "Trao đổi đồ vật, vay mượn và nhờ giúp đỡ",
    pptxFile: "Bai 7.pptx",
    slideCount: 31,
    focus: "Luyện các động từ cho, nhận, mượn và những đồ dùng gần gũi.",
    roadmapSteps: [
      "Nhận biết các động từ trao đổi giữa người với người.",
      "Học tên đồ dùng học tập và vật dụng hằng ngày.",
      "Tập nói câu nhờ vả, cho và nhận.",
      "Ôn bằng cặp câu ngắn để nhớ nhanh ngữ cảnh."
    ],
    vocabExamples: [
      ...vocabularyData[7].slice(0, 6)
    ],
    vocabulary: vocabularyData[7],
    grammarNotes: [
      {
        title: "あげます / もらいます",
        detail: "Hai động từ rất quan trọng trong ngữ cảnh trao đổi đồ vật.",
        example: "ともだちに プレゼントを あげます。"
      },
      {
        title: "かります",
        detail: "Dùng khi mượn đồ từ ai đó.",
        example: "けしゴムを かります。"
      },
      {
        title: "てください",
        detail: "Mẫu nhờ vả lịch sự, rất hay gặp trong giao tiếp.",
        example: "もういちど おしえてください。"
      }
    ]
  }
];

export const getLessonRoadmap = (lessonId) =>
  lessonRoadmaps.find((lesson) => String(lesson.id) === String(lessonId)) || null;
