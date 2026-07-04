import { useMemo, useState } from "react";
import { Textarea } from "@/components/ui/textarea";

function syllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!word) return 0;
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
  word = word.replace(/^y/, "");
  const m = word.match(/[aeiouy]{1,2}/g);
  return m ? m.length : 1;
}

export function ReadingLevel() {
  const [text, setText] = useState("");
  const stats = useMemo(() => {
    const words = text.match(/\b[\w']+\b/g) || [];
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const syls = words.reduce((a, w) => a + syllables(w), 0);
    const W = words.length, S = sentences.length || 1;
    const fkGrade = 0.39 * (W / S) + 11.8 * (syls / W) - 15.59;
    const fkEase = 206.835 - 1.015 * (W / S) - 84.6 * (syls / W);
    return { words: W, sentences: S, syllables: syls, grade: W ? fkGrade : 0, ease: W ? fkEase : 0 };
  }, [text]);
  const level = stats.grade < 6 ? "Easy" : stats.grade < 10 ? "Intermediate" : stats.grade < 13 ? "Advanced" : "College";
  return (
    <div className="space-y-4">
      <Textarea rows={10} placeholder="Paste text here..." value={text} onChange={(e) => setText(e.target.value)} />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          ["Words", stats.words],
          ["Sentences", stats.sentences],
          ["Grade Level", stats.grade.toFixed(1)],
          ["Reading Ease", stats.ease.toFixed(0)],
        ].map(([l, v]) => (
          <div key={l as string} className="rounded-lg border bg-card p-4 text-center">
            <div className="text-2xl font-bold text-primary">{v}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">{l}</div>
          </div>
        ))}
      </div>
      <div className="text-center text-sm">Estimated level: <b>{level}</b></div>
    </div>
  );
}
