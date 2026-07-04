import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Trash2, Check, X } from "lucide-react";

type Q = { question: string; choices: string[]; answer: number };

export function QuizMaker() {
  const [qs, setQs] = useState<Q[]>([]);
  const [draft, setDraft] = useState<Q>({ question: "", choices: ["", "", "", ""], answer: 0 });
  const [mode, setMode] = useState<"edit" | "take">("edit");
  const [picks, setPicks] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  if (mode === "take") {
    const score = qs.reduce((a, q, i) => a + (picks[i] === q.answer ? 1 : 0), 0);
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => { setMode("edit"); setSubmitted(false); setPicks({}); }}>← Back to editor</Button>
        {qs.map((q, i) => (
          <div key={i} className="rounded-lg border p-4">
            <div className="font-medium mb-3">{i + 1}. {q.question}</div>
            <div className="space-y-2">
              {q.choices.map((c, j) => {
                const chosen = picks[i] === j;
                const correct = submitted && j === q.answer;
                const wrong = submitted && chosen && j !== q.answer;
                return (
                  <button
                    key={j}
                    onClick={() => !submitted && setPicks({ ...picks, [i]: j })}
                    className={`w-full text-left rounded-md border p-2 text-sm flex items-center gap-2 ${
                      correct ? "border-emerald-500 bg-emerald-50" : wrong ? "border-rose-500 bg-rose-50" : chosen ? "border-primary bg-primary/5" : ""
                    }`}
                  >
                    {correct && <Check className="h-4 w-4 text-emerald-600" />}
                    {wrong && <X className="h-4 w-4 text-rose-600" />}
                    {c}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {!submitted ? (
          <Button onClick={() => setSubmitted(true)}>Submit Quiz</Button>
        ) : (
          <div className="text-center text-xl font-semibold text-primary">Score: {score} / {qs.length}</div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-4 space-y-3">
        <div><Label>Question</Label><Input value={draft.question} onChange={(e) => setDraft({ ...draft, question: e.target.value })} /></div>
        {draft.choices.map((c, j) => (
          <div key={j} className="flex gap-2 items-center">
            <input type="radio" checked={draft.answer === j} onChange={() => setDraft({ ...draft, answer: j })} />
            <Input value={c} onChange={(e) => { const cc = [...draft.choices]; cc[j] = e.target.value; setDraft({ ...draft, choices: cc }); }} placeholder={`Choice ${j + 1}`} />
          </div>
        ))}
        <Button onClick={() => { if (draft.question && draft.choices.every((x) => x)) { setQs([...qs, draft]); setDraft({ question: "", choices: ["", "", "", ""], answer: 0 }); } }}>Add Question</Button>
      </div>
      <div className="space-y-2">
        {qs.map((q, i) => (
          <div key={i} className="flex items-center gap-2 border rounded p-3">
            <div className="flex-1 text-sm"><b>{i + 1}.</b> {q.question}</div>
            <Button variant="ghost" size="icon" onClick={() => setQs(qs.filter((_, k) => k !== i))}><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
      </div>
      {qs.length > 0 && <Button onClick={() => setMode("take")}>Take Quiz ({qs.length} questions)</Button>}
    </div>
  );
}
