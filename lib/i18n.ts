import type { Question } from "@/types/question";

export type QuestionLang = "ar" | "en";

/** Stem text in the chosen language; falls back to the other language if one is missing. */
export function stemText(q: Question, lang: QuestionLang): string {
  const ar = q.questionAr.trim();
  const en = q.question.trim();
  return lang === "ar" ? ar || en : en || ar;
}

export function optionTexts(q: Question, lang: QuestionLang): string[] {
  return lang === "ar" && q.optionsAr && q.optionsAr.length === q.options.length ? q.optionsAr : q.options;
}

export function explanationText(q: Question, lang: QuestionLang): string {
  return lang === "ar" ? q.explanationAr?.trim() || q.explanation : q.explanation;
}
