export type Dir = "rtl" | "ltr";

// Hebrew/Arabic/Syriac/Thaana blocks + Arabic presentation forms
const RTL_CHAR = /[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/;
const LTR_CHAR = /[A-Za-z\u00C0-\u024F]/;

/**
 * Direction of the first strong character, like the Unicode bidi algorithm.
 * Digits and punctuation are neutral, so "15% من 240" resolves from the Arabic
 * word, and an option like "36" falls back to LTR.
 */
export function detectDir(text: string): Dir {
  for (const ch of text) {
    if (RTL_CHAR.test(ch)) return "rtl";
    if (LTR_CHAR.test(ch)) return "ltr";
  }
  return "ltr";
}

const LETTERS: Record<Dir, string[]> = {
  ltr: ["A", "B", "C", "D", "E"],
  rtl: ["أ", "ب", "ج", "د", "هـ"],
};

export function optionLetter(index: number, dir: Dir): string {
  return LETTERS[dir][index] ?? String(index + 1);
}
