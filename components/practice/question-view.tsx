"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCountdown } from "@/hooks/use-countdown";
import { QUESTION_SECONDS } from "@/lib/constants";
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
  TipBox,
  Text,
  type QuestionLang,
} from "./question-parts";

export type { QuestionLang } from "./question-parts";

interface Props {
  question: Question;
  isLast: boolean;
  lang: QuestionLang;
  timerEnabled: boolean;
  tipsEnabled: boolean;
  flagged: boolean;
  onToggleFlag: () => void;
  onComplete: (answer: Answer) => void;
}

interface Result {
  selectedIndex: number | null;
  timedOut: boolean;
  timeSpent: number;
}

function formatTime(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** Mount with `key={question.id}` so timer and selection reset per question. */
export function QuestionView({ question, isLast, lang, timerEnabled, tipsEnabled, flagged, onToggleFlag, onComplete }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [startedAt] = useState(() => Date.now());

  const revealed = result !== null;

  const finish = (timedOut: boolean) => {
    if (result) return;
    setResult({ selectedIndex: selected, timedOut, timeSpent: Math.round((Date.now() - startedAt) / 1000) });
  };

  const remaining = useCountdown(QUESTION_SECONDS, timerEnabled && !revealed, () => finish(true));
  const urgent = timerEnabled && remaining <= 10 && !revealed;
  const isCorrect = result?.selectedIndex === question.correctIndex;

  const handleNext = () => {
    if (!result) return;
    onComplete({
      questionId: question.id,
      section: question.section,
      category: question.category,
      selectedIndex: result.selectedIndex,
      correct: result.selectedIndex === question.correctIndex,
      timedOut: result.timedOut,
      flagged,
      timeSpent: result.timeSpent,
    });
  };

  return (
    <div className="flex flex-1 flex-col">
      {/* Meta + flag + timer */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <QuestionMeta question={question} />
        <div className="flex shrink-0 items-center gap-2">
          <FlagButton flagged={flagged} onToggle={onToggleFlag} />
          {timerEnabled && (
            <div
              role="timer"
              aria-label={`${remaining} seconds remaining`}
              className={cn(
                "rounded-md border px-3 py-1 font-mono text-base font-semibold tabular-nums sm:text-lg",
                urgent && "border-destructive text-destructive",
                revealed && "text-muted-foreground"
              )}
              dir="ltr"
            >
              {formatTime(remaining)}
            </div>
          )}
        </div>
      </div>

      {timerEnabled && (
        <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-muted" dir="ltr">
          <div
            className={cn(
              "h-full rounded-full transition-[width] duration-300 ease-linear motion-reduce:transition-none",
              urgent ? "bg-destructive" : "bg-primary"
            )}
            style={{ width: `${(remaining / QUESTION_SECONDS) * 100}%` }}
          />
        </div>
      )}

      <div className={cn(!timerEnabled && "mt-2")}>
        <QuestionBody question={question} lang={lang} />
        <QuestionFigure src={question.image} />
      </div>

      <div className="mt-6">
        <OptionList question={question} lang={lang} selected={selected} revealed={revealed} onSelect={setSelected} />
      </div>

      {revealed && (
        <div
          aria-live="polite"
          className={cn(
            "mt-6 rounded-lg border p-4",
            isCorrect ? "border-green-600/40 bg-green-50 dark:bg-green-950/30" : "border-border bg-muted/50"
          )}
        >
          <p className="mb-2 font-semibold">
            {isCorrect
              ? "Correct · إجابة صحيحة"
              : result.timedOut && result.selectedIndex === null
                ? "Time's up · انتهى الوقت"
                : "Incorrect · إجابة خاطئة"}
          </p>
          <Text className="leading-relaxed text-muted-foreground">{explanationText(question, lang)}</Text>
        </div>
      )}

      {tipsEnabled && <TipBox question={question} lang={lang} />}
      <SourceLine source={question.source} />

      {/* Sticky action bar (thumb-reachable on mobile) */}
      <div className="sticky bottom-0 -mx-4 mt-auto border-t bg-background/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:static sm:mx-0 sm:mt-6 sm:flex sm:justify-end sm:border-0 sm:bg-transparent sm:px-0 sm:pb-0">
        {revealed ? (
          <Button size="lg" className="w-full sm:w-auto sm:min-w-56" onClick={handleNext}>
            {isLast ? "See results · النتيجة" : "Next question · السؤال التالي"}
          </Button>
        ) : (
          <Button size="lg" className="w-full sm:w-auto sm:min-w-56" disabled={selected === null} onClick={() => finish(false)}>
            Submit answer · تأكيد الإجابة
          </Button>
        )}
      </div>
    </div>
  );
}
