export type QuestionNumber = 1 | 2 | 3 | 4 | 5;

export function isQuestionNumber(value: number): value is QuestionNumber {
  return Number.isInteger(value) && value >= 1 && value <= 5;
}

type QuestionData = {
  question: string;
  tips: string[];
};

const commonTips = [
  "Jelaskan alasan pemilihan teknologi.",
  "Sebutkan kelebihan arsitektur.",
  "Hubungkan dengan kebutuhan projek.",
  "Gunakan contoh konkret dari projek Anda.",
];

export const questions: Record<QuestionNumber, QuestionData> = {
  1: {
    question:
      "Jelaskan arsitektur sistem yang Anda gunakan dalam project ini. Mengapa Anda memilih arsitektur tersebut?",
    tips: commonTips,
  },

  2: {
    question:
      "Apa peran dan tanggung jawab Anda dalam proyek ini? Jelaskan bagian yang Anda kerjakan sendiri.",
    tips: commonTips,
  },

  3: {
    question:
      "Teknologi atau tools apa yang Anda gunakan dalam proyek ini? Jelaskan alasan Anda memilihnya.",
    tips: commonTips,
  },

  4: {
    question:
      "Apa kendala terbesar yang Anda hadapi selama mengerjakan proyek ini? Jelaskan langkah yang Anda lakukan untuk mengatasinya.",
    tips: commonTips,
  },

  5: {
    question:
      "Apa hasil dari proyek yang Anda kerjakan dan bagaimana Anda memastikan hasilnya sesuai tujuan? Berikan contoh pengujian atau umpan balik yang Anda terima.",
    tips: [
      "Jelaskan hasil akhir proyek Anda.",
      "Hubungkan hasil tersebut dengan tujuan awal proyek.",
      "Sebutkan pengujian yang Anda lakukan.",
      "Berikan contoh umpan balik yang Anda terima.",
    ],
  },
};
