import type { Question } from "@/types/question";

export interface Tip {
  en: string;
  ar: string;
}

const RULES: { test: RegExp; tip: Tip }[] = [
  {
    test: /analogy/i,
    tip: {
      en: "Turn the pair into a sentence (“X is a part of / used for / a kind of Y”), then test every option with the same sentence. Drop pairs that are in the reverse order.",
      ar: "حوّل العلاقة إلى جملة (مثل: «س جزء من ص» أو «س تُستخدم لـ ص») ثم جرّب الجملة نفسها على كل خيار، واستبعد الأزواج المعكوسة الترتيب.",
    },
  },
  {
    test: /sentence/i,
    tip: {
      en: "Read the whole sentence first. Look for contrast words (although, but) or cause words (so, because), then try each pair in both blanks.",
      ar: "اقرأ الجملة كاملة أولاً، وابحث عن كلمات التضاد (لكن، مع أن) أو السببية (لذلك، لأن)، ثم جرّب كل زوج في الفراغين معاً.",
    },
  },
  {
    test: /contextual/i,
    tip: {
      en: "Read the passage once for its main idea, then check each highlighted word: does it match the direction and tone of its sentence? The wrong word usually says the opposite.",
      ar: "اقرأ النص مرة لفهم فكرته العامة، ثم افحص كل كلمة مظللة: هل تناسب اتجاه الجملة ونبرتها؟ الكلمة الخاطئة غالباً تعني عكس المطلوب.",
    },
  },
  {
    test: /odd/i,
    tip: {
      en: "Find what three of the words share (a category, a function or a relationship). The odd one differs in type, degree or role.",
      ar: "ابحث عمّا تشترك فيه ثلاث كلمات (فئة أو وظيفة أو علاقة)، والكلمة الشاذة تختلف في النوع أو الدرجة أو الدور.",
    },
  },
  {
    test: /reading/i,
    tip: {
      en: "Skim the question first, then scan the passage for its key words. Choose what the text states or clearly implies, not what you already know.",
      ar: "اقرأ السؤال أولاً ثم ابحث في النص عن كلماته المفتاحية، واختر ما يذكره النص أو يلمّح إليه بوضوح لا ما تعرفه من خارجه.",
    },
  },
  {
    test: /vocab|synonym|antonym/i,
    tip: {
      en: "Use the word’s roots and the sentence around it. For opposites, find the meaning first, then flip it.",
      ar: "استعن بجذر الكلمة وسياق الجملة. وفي الأضداد، حدّد المعنى أولاً ثم اعكسه.",
    },
  },
  {
    test: /compar/i,
    tip: {
      en: "Don’t solve everything. Simplify both columns, or try simple numbers (0, negatives, fractions) to see whether the relationship can change. If it can, the answer is “not enough info”.",
      ar: "لا تحلّ كل شيء؛ بسّط العمودين أو جرّب أعداداً بسيطة (صفر، سالب، كسر) لترى هل تتغير العلاقة. إن تغيّرت فالإجابة «المعطيات غير كافية».",
    },
  },
  {
    test: /data|statistic|probab/i,
    tip: {
      en: "Read the title, axes and units first, then pull only the numbers the question needs. For percentages, divide by the original (base) value.",
      ar: "اقرأ العنوان والمحاور والوحدات أولاً، ثم خذ الأرقام التي يطلبها السؤال فقط. وفي النسب المئوية اقسم على القيمة الأصلية.",
    },
  },
  {
    test: /geometry|area|volume|circle|triangle|angle|polygon|quadrilateral/i,
    tip: {
      en: "Mark every known length and angle on the figure. For shaded regions, try whole shape − unshaded part, or split it into simple shapes.",
      ar: "ضع كل الأطوال والزوايا المعلومة على الشكل. وللمناطق المظللة جرّب: الشكل كاملاً − الجزء غير المظلل، أو قسّمها إلى أشكال بسيطة.",
    },
  },
  {
    test: /algebra|equation/i,
    tip: {
      en: "Isolate the variable step by step, or plug the answer options back into the equation. Look for factoring tricks like (x + y)(x − y).",
      ar: "اعزل المجهول خطوة بخطوة، أو عوّض الخيارات في المعادلة. وانتبه لحيل التحليل مثل (س + ص)(س − ص).",
    },
  },
  {
    test: /speed|word problem/i,
    tip: {
      en: "Say what each number means, write the relation (speed = distance ÷ time; total = rate × time), then solve. Check that units match.",
      ar: "حدّد معنى كل رقم، واكتب العلاقة (السرعة = المسافة ÷ الزمن)، ثم احسب، وتأكد من توافق الوحدات.",
    },
  },
  {
    test: /ratio|percent|proportion|fraction|decimal|arithmetic/i,
    tip: {
      en: "Turn percentages and ratios into simple fractions, estimate first, and cross out options that are clearly too big or too small.",
      ar: "حوّل النسب المئوية والنسب إلى كسور بسيطة، وقدّر الناتج أولاً، واستبعد الخيارات الأكبر أو الأصغر بكثير.",
    },
  },
  {
    test: /expon|root/i,
    tip: {
      en: "Rewrite everything with the same base and use the exponent rules. Remember: x⁰ = 1, x⁻ⁿ = 1/xⁿ, and an odd power keeps the sign.",
      ar: "اكتب الأطراف بالأساس نفسه واستخدم قوانين الأسس. تذكّر: س⁰ = 1، وس⁻ⁿ = 1/سⁿ، والأس الفردي يحافظ على الإشارة.",
    },
  },
  {
    test: /sequence|pattern/i,
    tip: {
      en: "Check the differences first, then the ratios, then alternating patterns. Second differences that grow by 1 usually mean a quadratic pattern.",
      ar: "افحص الفروق أولاً ثم النسب ثم الأنماط المتبادلة. وإذا زادت الفروق بمقدار ثابت فالنمط غالباً تربيعي.",
    },
  },
  {
    test: /number|division/i,
    tip: {
      en: "Use divisibility rules and remainders: number = divisor × quotient + remainder. Test small values when a statement says “could be” or “must be”.",
      ar: "استخدم قواعد القسمة والباقي: العدد = القاسم × الناتج + الباقي. وجرّب قيماً صغيرة عند عبارات «يمكن أن» و«يجب أن».",
    },
  },
];

const FALLBACK: Record<Question["section"], Tip> = {
  verbal: {
    en: "Eliminate clearly wrong options first, then compare the remaining ones against the exact wording of the question.",
    ar: "استبعد الخيارات الخاطئة بوضوح أولاً، ثم قارن المتبقي بصياغة السؤال بدقة.",
  },
  quantitative: {
    en: "Write down what is given and what is asked, estimate the answer, and check which options are plausible before calculating.",
    ar: "اكتب المعطيات والمطلوب، وقدّر الناتج أولاً، وانظر أي الخيارات معقول قبل الحساب.",
  },
};

/** A custom `tip` on the question wins; otherwise a tip is chosen from its category. */
export function getTip(q: Question): Tip {
  if (q.tip) return { en: q.tip, ar: "" };
  const hit = RULES.find((r) => r.test.test(q.category));
  return hit ? hit.tip : FALLBACK[q.section];
}
