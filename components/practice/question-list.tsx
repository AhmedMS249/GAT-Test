"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Answer, Question } from "@/types/question";
import {
  FlagButton,
  OptionList,
  explanationText,
  QuestionBody,
  QuestionFigure,
  QuestionMeta,
  SourceLine,
  Text,
  type QuestionLang,
} from "./question-parts";

interface Props {
  questions: Question[];
  lang: QuestionLang;
  /** When set, the list is read-only and shows the correct answers and explanations. */
  review: Answer[] | null;
  flaggedIds: Set<string>;
  onToggleFlag: (id: string) => void;
  onFinish: (answers: Answer[]) => void;
  onBackToResults: () => void;
}

/** "All in one list" mode: every question on one page, answer in any order, then finish. */
export function QuestionList({ questions, lang, review, flaggedIds, onToggleFlag, onFinish, onBackToResults }: Props) {
  const reviewMap = useMemo(() => (review ? new Map(review.map((a) => [a.questionId, a])) : null), [review]);
  const isReview = reviewMap !== null;

  const [selected, setSelected] = useState<Record<string, number>>({});

  const answered = Object.keys(selected).length;
  const unanswered = questions.length - answered;

  const handleFinish = () => {
    onFinish(
      questions.map((q) => {
        const sel = selected[q.id] ?? null;
        return {
          questionId: q.id,
          section: q.section,
          category: q.category,
          selectedIndex: sel,
          correct: sel === q.correctIndex,
          timedOut: false,
          flagged: flaggedIds.has(q.id),
          timeSpent: 0,
        };
      })
    );
  };

  return (
    <div className="flex flex-1 flex-col">
      <p className="mb-4 text-sm text-muted-foreground" dir="ltr">
        {isReview ? "Review mode: correct answers are marked." : `${questions.length} questions · pick answers in any order, then finish.`}
      </p>

      <ol className="space-y-5">
        {questions.map((q, i) => {
          const a = reviewMap?.get(q.id);
          const sel = isReview ? (a?.selectedIndex ?? null) : (selected[q.id] ?? null);
          const flagged = flaggedIds.has(q.id);
          const correct = sel === q.correctIndex;
          return (
            <li key={q.id} id={`q-${q.id}`} className="scroll-mt-4 rounded-xl border bg-card p-4 sm:p-5">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                  <span className="font-semibold tabular-nums text-muted-foreground" dir="ltr">
                    #{i + 1}
                  </span>
                  <QuestionMeta question={q} />
                </div>
                <FlagButton
                  flagged={flagged}
                  onToggle={() => onToggleFlag(q.id)}
                />
              </div>

              <QuestionBody question={q} lang={lang} compact />
              <QuestionFigure src={q.image} />

              <div className="mt-4">
                <OptionList
                  question={q}
                  lang={lang}
                  selected={sel}
                  revealed={isReview}
                  onSelect={(idx) => setSelected((s) => ({ ...s, [q.id]: idx }))}
                />
              </div>

              {isReview && (
                <div
                  className={cn(
                    "mt-4 rounded-lg border p-3 text-sm",
                    correct ? "border-green-600/40 bg-green-50 dark:bg-green-950/30" : "bg-muted/50"
                  )}
                >
                  <p className="mb-1 font-semibold">
                    {correct ? "Correct · إجابة صحيحة" : sel === null ? "Unanswered · بدون إجابة" : "Incorrect · إجابة خاطئة"}
                  </p>
                  <Text className="leading-relaxed text-muted-foreground">{explanationText(q, lang)}</Text>
                </div>
              )}

              <SourceLine source={q.source} />
            </li>
          );
        })}
      </ol>

      <div className="sticky bottom-0 -mx-4 mt-6 border-t bg-background/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:mx-0 sm:rounded-lg sm:border sm:px-4">
        {isReview ? (
          <Button size="lg" className="w-full" onClick={onBackToResults}>
            Back to results · العودة للنتيجة
          </Button>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-center text-sm text-muted-foreground tabular-nums sm:text-start" dir="ltr">
              {answered} / {questions.length} answered{unanswered > 0 ? ` · ${unanswered} left` : ""}
            </span>
            <Button size="lg" className="w-full sm:w-auto sm:min-w-56" onClick={handleFinish}>
              Finish &amp; see results · إنهاء وعرض النتيجة
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
