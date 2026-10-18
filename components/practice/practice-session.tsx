"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useFlagged } from "@/hooks/use-flagged";
import { usePersistentChoice } from "@/hooks/use-persistent-choice";
import { arabicFont, FONT_STACK } from "@/lib/fonts";
import { loadQuestions, shuffle } from "@/lib/questions";
import { cn } from "@/lib/utils";
import type { Answer, Question } from "@/types/question";
import { Segmented, Toggle } from "./controls";
import { QuestionList } from "./question-list";
import { QuestionView, type QuestionLang } from "./question-view";
import { ResultsScreen } from "./results-screen";

type Mode = "single" | "list";
type SectionFilter = "all" | "verbal" | "quantitative" | "flagged";

const MODE_OPTIONS: { value: Mode; label: string }[] = [
  { value: "single", label: "One by one · واحد واحد" },
  { value: "list", label: "All in a list · قائمة" },
];

const LANG_OPTIONS: { value: QuestionLang; label: string }[] = [
  { value: "ar", label: "عربي" },
  { value: "en", label: "English" },
];
const LANG_VALUES: readonly QuestionLang[] = ["ar", "en"];

export function PracticeSession() {
  const [bank, setBank] = useState<Question[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const [mode, setMode] = useState<Mode>("single");
  const [section, setSection] = useState<SectionFilter>("all");
  const [lang, setLang] = usePersistentChoice<QuestionLang>("gat-lang-v1", "en", LANG_VALUES);
  const flagged = useFlagged();
  const [timerEnabled, setTimerEnabled] = useState(false); // default off; set true to default on
  const [tipsEnabled, setTipsEnabled] = useState(false);

  const [deck, setDeck] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [finished, setFinished] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [runId, setRunId] = useState(0);

  /** Start a fresh run. One-by-one shuffles; the list keeps the bank order. */
  const rebuild = useCallback((source: Question[], m: Mode, s: SectionFilter, savedIds: Set<string>) => {
    const pool =
      s === "all" ? source : s === "flagged" ? source.filter((q) => savedIds.has(q.id)) : source.filter((q) => q.section === s);
    setDeck(m === "single" ? shuffle(pool) : pool);
    setIndex(0);
    setAnswers([]);
    setFinished(false);
    setReviewing(false);
    setRunId((r) => r + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setError(null);
    loadQuestions(controller.signal)
      .then((qs) => {
        setBank(qs);
        rebuild(qs, "single", "all", new Set());
      })
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setError(e instanceof Error ? e.message : "Something went wrong loading the questions.");
      });
    return () => controller.abort();
  }, [attempt, rebuild]);

  const changeMode = (m: Mode) => {
    setMode(m);
    if (bank) rebuild(bank, m, section, flagged.ids);
  };
  const changeSection = (s: SectionFilter) => {
    setSection(s);
    if (bank) rebuild(bank, mode, s, flagged.ids);
  };

  const handleComplete = useCallback(
    (answer: Answer) => {
      setAnswers((prev) => [...prev, answer]);
      if (index + 1 >= deck.length) setFinished(true);
      else setIndex((i) => i + 1);
    },
    [index, deck.length]
  );

  const sectionOptions: { value: SectionFilter; label: string }[] = [
    { value: "all", label: "All · الكل" },
    { value: "verbal", label: "Verbal · لفظي" },
    { value: "quantitative", label: "Quant · كمي" },
    { value: "flagged", label: `Flagged · المعلّمة (${flagged.ids.size})` },
  ];

  const score = answers.filter((a) => a.correct).length;
  const inRun = !finished && bank && deck.length > 0;

  return (
    <main
      style={{ fontFamily: FONT_STACK }}
      className={cn(arabicFont.variable, "mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-4 py-5 sm:px-6 sm:py-8 md:max-w-3xl")}
    >
      <header className="mb-5 space-y-3">
        <Link href="/" className="inline-block text-sm text-muted-foreground underline-offset-4 hover:underline">
          Exit · خروج
        </Link>

        {bank && !finished && (
          <div className="flex flex-col gap-3 rounded-xl border bg-card/50 p-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Segmented label="Display mode" value={mode} options={MODE_OPTIONS} onChange={changeMode} />
            <Segmented label="Section" value={section} options={sectionOptions} onChange={changeSection} />
            <Segmented label="Question language" value={lang} options={LANG_OPTIONS} onChange={setLang} />
            {section === "flagged" && flagged.ids.size > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Remove all saved flags? · مسح كل التعليمات المحفوظة؟")) flagged.clear();
                }}
                className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                Clear all flags · مسح التعليمات
              </button>
            )}
            {mode === "single" && (
              <>
                <Toggle checked={timerEnabled} onChange={setTimerEnabled} label="Timer · المؤقت" />
                <Toggle checked={tipsEnabled} onChange={setTipsEnabled} label="Tips · نصائح" />
              </>
            )}
          </div>
        )}

        {inRun && mode === "single" && (
          <>
            <div className="flex items-center justify-between text-sm" dir="ltr">
              <span className="font-medium tabular-nums">
                Question {index + 1} / {deck.length}
              </span>
              <span className="tabular-nums text-muted-foreground">
                Score: {score}/{answers.length}
              </span>
            </div>
            <Progress value={(index / deck.length) * 100} aria-label="Session progress" />
          </>
        )}
      </header>

      {error ? (
        <div className="rounded-lg border border-destructive/40 p-6 text-center">
          <p className="font-medium">Couldn&apos;t load questions</p>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          <Button className="mt-4" onClick={() => setAttempt((a) => a + 1)}>
            Try again · أعد المحاولة
          </Button>
        </div>
      ) : !bank ? (
        <p className="py-20 text-center text-muted-foreground" role="status">
          Loading questions… · جارٍ تحميل الأسئلة
        </p>
      ) : deck.length === 0 ? (
        <p className="mx-auto max-w-sm py-20 text-center text-muted-foreground">
          {section === "flagged"
            ? "No flagged questions yet. Tap “Flag” on any question while practicing and it will be saved here. · لا توجد أسئلة معلّمة بعد."
            : "No questions in this section yet."}
        </p>
      ) : finished && !reviewing ? (
        <ResultsScreen
          answers={answers}
          questions={deck}
          onRestart={() => rebuild(bank, mode, section, flagged.ids)}
          onReviewFlagged={() => changeSection("flagged")}
          onReview={mode === "list" ? () => setReviewing(true) : undefined}
        />
      ) : mode === "list" ? (
        <QuestionList
          key={runId}
          questions={deck}
          lang={lang}
          review={reviewing ? answers : null}
          flaggedIds={flagged.ids}
          onToggleFlag={flagged.toggle}
          onFinish={(a) => {
            setAnswers(a);
            setFinished(true);
            setReviewing(false);
          }}
          onBackToResults={() => setReviewing(false)}
        />
      ) : (
        <QuestionView
          key={deck[index].id}
          question={deck[index]}
          isLast={index + 1 === deck.length}
          lang={lang}
          timerEnabled={timerEnabled}
          tipsEnabled={tipsEnabled}
          flagged={flagged.ids.has(deck[index].id)}
          onToggleFlag={() => flagged.toggle(deck[index].id)}
          onComplete={handleComplete}
        />
      )}
    </main>
  );
}
