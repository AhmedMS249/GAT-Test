"use client";

import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { SECTION_LABELS } from "@/lib/constants";
import { detectDir } from "@/lib/direction";
import { cn } from "@/lib/utils";
import type { Answer, Question, Section } from "@/types/question";

interface Props {
  answers: Answer[];
  questions: Question[];
  onRestart: () => void;
  onReviewFlagged: () => void;
  /** Only passed in list mode: opens the full list again with answers marked. */
  onReview?: () => void;
}

interface Tally {
  correct: number;
  total: number;
}

const pct = (t: Tally) => (t.total === 0 ? 0 : Math.round((t.correct / t.total) * 100));

function tally(items: Answer[]): Tally {
  return { correct: items.filter((a) => a.correct).length, total: items.length };
}

function Bar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted" dir="ltr">
      <div className="h-full rounded-full bg-primary" style={{ width: `${value}%` }} />
    </div>
  );
}

function verdict(p: number) {
  if (p >= 85) return { en: "Excellent", ar: "ممتاز" };
  if (p >= 70) return { en: "Good", ar: "جيد" };
  if (p >= 50) return { en: "Keep practicing", ar: "واصل التدرّب" };
  return { en: "Needs work", ar: "تحتاج إلى مراجعة" };
}

export function ResultsScreen({ answers, questions, onRestart, onReviewFlagged, onReview }: Props) {
  const overall = tally(answers);
  const overallPct = pct(overall);
  const v = verdict(overallPct);
  const totalTime = answers.reduce((s, a) => s + a.timeSpent, 0);
  const flagged = answers.filter((a) => a.flagged);
  const byId = new Map(questions.map((q) => [q.id, q]));
  const avgTime = answers.length ? Math.round(totalTime / answers.length) : 0;

  const sections = (Object.keys(SECTION_LABELS) as Section[])
    .map((s) => ({ section: s, items: answers.filter((a) => a.section === s) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">Your score · نتيجتك</p>
        <p className="mt-2 text-5xl font-bold tabular-nums sm:text-6xl" dir="ltr">
          {overall.correct}
          <span className="text-3xl font-medium text-muted-foreground"> / {overall.total}</span>
        </p>
        <p className="mt-2 text-xl font-semibold tabular-nums" dir="ltr">
          {overallPct}%
        </p>
        <p className="mt-1 text-muted-foreground">
          {v.en} · {v.ar}
        </p>
      </div>

      <dl className="grid grid-cols-3 gap-3 text-center">
        {[
          { label: "Total time · الوقت", value: totalTime === 0 ? "—" : `${Math.floor(totalTime / 60)}m ${totalTime % 60}s` },
          { label: "Avg / question · المعدل", value: totalTime === 0 ? "—" : `${avgTime}s` },
          { label: "Flagged · معلّمة", value: String(flagged.length) },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border bg-card p-3">
            <dd className="text-lg font-semibold tabular-nums sm:text-xl" dir="ltr">
              {s.value}
            </dd>
            <dt className="mt-1 text-xs text-muted-foreground">{s.label}</dt>
          </div>
        ))}
      </dl>

      <section aria-labelledby="breakdown-heading" className="grid gap-4 md:grid-cols-2">
        <h2 id="breakdown-heading" className="text-lg font-semibold md:col-span-2">
          Breakdown by section · النتيجة حسب القسم
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
        {sections.map(({ section, items }) => {
          const t = tally(items);
          const categories = Array.from(new Set(items.map((a) => a.category))).map((c) => ({
            name: c,
            ...tally(items.filter((a) => a.category === c)),
          }));

          return (
            <div key={section} className="rounded-lg border bg-card p-4">
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <h3 className="font-semibold">
                  {SECTION_LABELS[section].en} · {SECTION_LABELS[section].ar}
                </h3>
                <span className="tabular-nums text-sm" dir="ltr">
                  {t.correct}/{t.total} · {pct(t)}%
                </span>
              </div>
              <Bar value={pct(t)} />

              <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                {categories.map((c) => (
                  <li key={c.name} className="flex justify-between gap-3">
                    <span>{c.name}</span>
                    <span className="tabular-nums" dir="ltr">
                      {c.correct}/{c.total}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
        </div>
      </section>

      {flagged.length > 0 && (
        <section aria-labelledby="flagged-heading" className="space-y-3">
          <h2 id="flagged-heading" className="text-lg font-semibold">
            Flagged for review · أسئلة معلّمة ({flagged.length})
          </h2>
          <ul className="space-y-2">
            {flagged.map((a) => {
              const q = byId.get(a.questionId);
              if (!q) return null;
              const useAr = q.questionAr.trim() !== "";
              const text = useAr ? q.questionAr : q.question;
              const answer = (useAr && q.optionsAr ? q.optionsAr : q.options)[q.correctIndex];
              const status = a.correct ? "Correct" : a.selectedIndex === null ? "Unanswered" : "Incorrect";
              return (
                <li key={a.questionId} className="rounded-lg border bg-card p-3 text-sm">
                  <p dir={detectDir(text)} className="line-clamp-2 text-start">
                    {text}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {status} · Answer:{" "}
                    <span dir={detectDir(answer)} className="font-medium text-foreground">
                      {answer}
                    </span>
                  </p>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        {onReview && (
          <Button size="lg" variant="secondary" className="flex-1" onClick={onReview}>
            Review all answers · مراجعة الإجابات
          </Button>
        )}
        <Button size="lg" className="flex-1" onClick={onRestart}>
          Practice again · إعادة التدريب
        </Button>
        {flagged.length > 0 && (
          <Button size="lg" variant="secondary" className="flex-1" onClick={onReviewFlagged}>
            Practice flagged · تدرّب على المعلّمة
          </Button>
        )}
        <Link
          href="/"
          className={cn(buttonVariants({ size: "lg", variant: "outline" }), "flex-1")}
        >
          Home · الرئيسية
        </Link>
      </div>
    </div>
  );
}
