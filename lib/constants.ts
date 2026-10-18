import type { Difficulty, Section } from "@/types/question";

export const QUESTION_SECONDS = 60;

export const SECTION_LABELS: Record<Section, { en: string; ar: string }> = {
  verbal: { en: "Verbal", ar: "اللفظي" },
  quantitative: { en: "Quantitative", ar: "الكمي" },
};

export const DIFFICULTY_LABELS: Record<Difficulty, { en: string; ar: string }> = {
  easy: { en: "Easy", ar: "سهل" },
  medium: { en: "Medium", ar: "متوسط" },
  hard: { en: "Hard", ar: "صعب" },
};
