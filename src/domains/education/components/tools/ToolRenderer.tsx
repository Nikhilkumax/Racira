"use client";

import type * as React from "react";
import { LessonPlanTemplate } from "./impl/LessonPlanTemplate";
import { BloomsTaxonomyPlanner } from "./impl/BloomsTaxonomyPlanner";
import { SyllabusGenerator } from "./impl/SyllabusGenerator";
import { FlashcardCreator } from "./impl/FlashcardCreator";
import { CornellNotes } from "./impl/CornellNotes";
import { PomodoroTimer } from "./impl/PomodoroTimer";
import { ExamCountdown } from "./impl/ExamCountdown";
import { PeriodicTable } from "./impl/PeriodicTable";
import { EquationBalancer } from "./impl/EquationBalancer";
import { PunnettSquare } from "./impl/PunnettSquare";
import { FunctionGrapher } from "./impl/FunctionGrapher";
import { TimesTable } from "./impl/TimesTable";
import { LongDivision } from "./impl/LongDivision";
import { PrimeFactorTree } from "./impl/PrimeFactorTree";
import { ReadingLevel } from "./impl/ReadingLevel";
import { EssayOutline } from "./impl/EssayOutline";
import { TimelineBuilder } from "./impl/TimelineBuilder";
import { QuizMaker } from "./impl/QuizMaker";
import { GradingScale } from "./impl/GradingScale";
import { RandomStudentPicker } from "./impl/RandomStudentPicker";
import { VocabFlashcards } from "./impl/VocabFlashcards";

const map: Record<string, React.ComponentType> = {
  "lesson-plan-template": LessonPlanTemplate,
  "bloom-s-taxonomy-planner": BloomsTaxonomyPlanner,
  "syllabus-generator": SyllabusGenerator,
  "flashcard-creator": FlashcardCreator,
  "cornell-notes-template": CornellNotes,
  "pomodoro-study-timer": PomodoroTimer,
  "exam-countdown-timer": ExamCountdown,
  "periodic-table-explorer": PeriodicTable,
  "chemical-equation-balancer": EquationBalancer,
  "genetics-punnett-square-tool": PunnettSquare,
  "function-grapher": FunctionGrapher,
  "times-table-visualizer": TimesTable,
  "long-division-tool": LongDivision,
  "prime-factor-tree-builder": PrimeFactorTree,
  "reading-level-analyzer": ReadingLevel,
  "essay-outline-builder": EssayOutline,
  "historical-timeline-builder": TimelineBuilder,
  "quiz-maker": QuizMaker,
  "grading-scale-calculator": GradingScale,
  "random-student-picker": RandomStudentPicker,
  "vocabulary-flashcard-builder": VocabFlashcards,
};

export function ToolRenderer({ slug }: { slug: string }) {
  const Cmp = map[slug];
  if (!Cmp) return <p className="text-muted-foreground">Tool implementation missing.</p>;
  return <Cmp />;
}
