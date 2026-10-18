import type { Metadata } from "next";
import { PracticeSession } from "@/components/practice/practice-session";

export const metadata: Metadata = {
  title: "Practice · GAT",
  description: "Timed General Aptitude Test practice questions in Arabic and English.",
};

export default function PracticePage() {
  return <PracticeSession />;
}
