import type { Question } from "@/types/question";

function isQuestion(q: unknown): q is Question {
  if (typeof q !== "object" || q === null) return false;
  const o = q as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    (o.section === "verbal" || o.section === "quantitative") &&
    typeof o.category === "string" &&
    typeof o.question === "string" &&
    typeof o.questionAr === "string" &&
    Array.isArray(o.options) &&
    o.options.length >= 2 &&
    o.options.every((x) => typeof x === "string") &&
    Number.isInteger(o.correctIndex) &&
    (o.correctIndex as number) >= 0 &&
    (o.correctIndex as number) < o.options.length &&
    typeof o.explanation === "string" &&
    (o.image === undefined || typeof o.image === "string") &&
    (o.explanationAr === undefined || typeof o.explanationAr === "string") &&
    (o.optionsAr === undefined ||
      (Array.isArray(o.optionsAr) && o.optionsAr.length === o.options.length && o.optionsAr.every((x) => typeof x === "string"))) &&
    (o.tip === undefined || typeof o.tip === "string") &&
    (o.difficulty === "easy" || o.difficulty === "medium" || o.difficulty === "hard") &&
    (o.source === undefined ||
      (typeof o.source === "object" &&
        o.source !== null &&
        typeof (o.source as Record<string, unknown>).name === "string"))
  );
}

export async function loadQuestions(signal?: AbortSignal): Promise<Question[]> {
  const res = await fetch("/data/questions.json", { signal, cache: "no-store" });
  if (!res.ok) throw new Error(`Could not load questions (HTTP ${res.status}).`);

  const data: unknown = await res.json();
  if (!Array.isArray(data)) throw new Error("questions.json must contain an array.");

  const valid = data.filter((q, i) => {
    const ok = isQuestion(q);
    if (!ok) console.warn(`Skipping malformed question at index ${i}`, q);
    return ok;
  });
  if (valid.length === 0) throw new Error("No valid questions found in questions.json.");
  return valid;
}

/** Fisher–Yates, returns a new array. */
export function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
