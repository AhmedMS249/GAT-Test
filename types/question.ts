export type Section = "verbal" | "quantitative";
export type Difficulty = "easy" | "medium" | "hard";

export interface QuestionSource {
  name: string;
  url?: string;
  license?: string;
}

export interface Question {
  id: string;
  section: Section;
  category: string;
  question: string;
  questionAr: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  /** Arabic version of `options` (same length and order). Falls back to `options` when missing. */
  optionsAr?: string[];
  /** Arabic version of `explanation`. Falls back to `explanation` when missing. */
  explanationAr?: string;
  difficulty: Difficulty;
  source?: QuestionSource;
  /** Optional figure for the question, e.g. "/images/questions/leen-q-t1-q01.png". */
  image?: string;
  /** Optional custom tip (English). If omitted, a category tip is used. */
  tip?: string;
}

/** One recorded result per question in a session. */
export interface Answer {
  questionId: string;
  section: Section;
  category: string;
  selectedIndex: number | null; // null = nothing selected when time ran out
  correct: boolean;
  timedOut: boolean;
  flagged: boolean;
  timeSpent: number; // seconds (always tracked, even with the timer off)
}
