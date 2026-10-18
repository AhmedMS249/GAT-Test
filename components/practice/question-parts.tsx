"use client";

import { Check, Flag, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DIFFICULTY_LABELS, SECTION_LABELS } from "@/lib/constants";
import { detectDir, optionLetter } from "@/lib/direction";
import { explanationText, optionTexts, stemText, type QuestionLang } from "@/lib/i18n";
import { getTip } from "@/lib/tips";
import { cn } from "@/lib/utils";
import type { Question } from "@/types/question";

export type { QuestionLang } from "@/lib/i18n";
export { explanationText };

/** Renders text with its own auto-detected direction. */
export function Text({ children, className }: { children: string; className?: string }) {
  return (
    <p dir={detectDir(children)} className={cn("whitespace-pre-line text-start", className)}>
      {children}
    </p>
  );
}

export function QuestionMeta({ question }: { question: Question }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="secondary">
        {SECTION_LABELS[question.section].en} · {SECTION_LABELS[question.section].ar}
      </Badge>
      <Badge variant="outline">{question.category}</Badge>
      <Badge variant="outline">
        {DIFFICULTY_LABELS[question.difficulty].en} · {DIFFICULTY_LABELS[question.difficulty].ar}
      </Badge>
    </div>
  );
}

export function FlagButton({ flagged, onToggle, disabled }: { flagged: boolean; onToggle: () => void; disabled?: boolean }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      aria-pressed={flagged}
      disabled={disabled}
      onClick={onToggle}
      className={cn(flagged && "border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400")}
    >
      <Flag className={cn("size-4", flagged && "fill-current")} />
      <span className="hidden sm:inline">{flagged ? "Flagged · معلّم" : "Flag · تعليم"}</span>
      <span className="sr-only sm:hidden">{flagged ? "Flagged" : "Flag for review"}</span>
    </Button>
  );
}

/** A long passage + its question are stored together; the last paragraph is the question itself. */
function splitPassage(text: string): { passage: string; stem: string } | null {
  const parts = text.split("\n\n");
  if (parts.length < 3 || text.length < 350) return null;
  return { passage: parts.slice(0, -1).join("\n\n"), stem: parts[parts.length - 1] };
}

function Block({ text, className, collapse }: { text: string; className?: string; collapse?: boolean }) {
  const split = collapse ? splitPassage(text) : null;
  if (!split) return <Text className={className}>{text}</Text>;
  return (
    <div className="space-y-2">
      <details className="rounded-lg border bg-muted/40 p-3">
        <summary className="cursor-pointer text-sm text-muted-foreground">Show passage · عرض النص</summary>
        <Text className={cn("mt-3", className)}>{split.passage}</Text>
      </details>
      <Text className={className}>{split.stem}</Text>
    </div>
  );
}

export function QuestionBody({ question, lang, compact = false }: { question: Question; lang: QuestionLang; compact?: boolean }) {
  const primary = compact ? "text-base font-medium leading-loose sm:text-lg" : "text-lg font-medium leading-loose sm:text-xl lg:text-2xl";
  return <Block text={stemText(question, lang)} className={primary} collapse={compact} />;
}

export function QuestionFigure({ src }: { src?: string }) {
  if (!src) return null;
  return (
    <figure className="my-5 flex justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Figure for the question"
        loading="lazy"
        className="h-auto max-h-72 w-auto max-w-full rounded-lg border bg-white p-2"
      />
    </figure>
  );
}

interface OptionListProps {
  question: Question;
  lang: QuestionLang;
  selected: number | null;
  revealed: boolean;
  onSelect: (index: number) => void;
}

export function OptionList({ question, lang, selected, revealed, onSelect }: OptionListProps) {
  const texts = optionTexts(question, lang);
  const compact = texts.every((o) => o.length <= 28);
  return (
    <div role="radiogroup" aria-label="Answer options" className={cn("grid gap-2.5 sm:gap-3", compact && "sm:grid-cols-2")}>
      {texts.map((opt, i) => {
        const dir = detectDir(opt);
        const original = question.options[i];
        // In Arabic mode, English-test words stay visible underneath so you still learn the English word.
        const showOriginal = lang === "ar" && question.section === "verbal" && original !== opt;
        const isSelected = selected === i;
        const isAnswer = i === question.correctIndex;
        const showCorrect = revealed && isAnswer;
        const showWrong = revealed && isSelected && !isAnswer;
        return (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={revealed}
            dir={dir}
            onClick={() => onSelect(i)}
            className={cn(
              "flex min-h-14 w-full items-center gap-3 rounded-lg border bg-card p-3 text-start text-base transition-colors sm:p-4",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              !revealed && "hover:bg-accent",
              !revealed && isSelected && "border-primary bg-accent ring-1 ring-primary",
              showCorrect && "border-green-600 bg-green-50 dark:bg-green-950/40",
              showWrong && "border-destructive bg-red-50 dark:bg-red-950/40",
              revealed && !showCorrect && !showWrong && "opacity-60"
            )}
          >
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold",
                isSelected && !revealed && "border-primary bg-primary text-primary-foreground",
                showCorrect && "border-green-600 bg-green-600 text-white",
                showWrong && "border-destructive bg-destructive text-white"
              )}
            >
              {showCorrect ? <Check className="size-4" /> : showWrong ? <X className="size-4" /> : optionLetter(i, dir)}
            </span>
            <span className="min-w-0 flex-1 break-words">
              {opt}
              {showOriginal && (
                <span dir="ltr" className="mt-0.5 block text-start text-xs text-muted-foreground">
                  {original}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function TipBox({ question, lang }: { question: Question; lang: QuestionLang }) {
  const tip = getTip(question);
  const text = lang === "ar" && tip.ar ? tip.ar : tip.en;
  return (
    <aside className="mt-6 rounded-lg border border-amber-500/40 bg-amber-50 p-4 text-sm dark:bg-amber-950/30">
      <p className="mb-1.5 font-semibold">💡 Tip · نصيحة</p>
      <Text className="leading-relaxed">{text}</Text>
    </aside>
  );
}

export function SourceLine({ source }: { source?: Question["source"] }) {
  if (!source) return null;
  return (
    <p className="mt-5 break-words text-xs text-muted-foreground">
      <span className="font-medium">Source · المصدر:</span>{" "}
      <bdi dir={detectDir(source.name)}>
        {source.url ? (
          <a href={source.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-foreground">
            {source.name}
          </a>
        ) : (
          source.name
        )}
      </bdi>
      {source.license && <> · {source.license}</>}
    </p>
  );
}
