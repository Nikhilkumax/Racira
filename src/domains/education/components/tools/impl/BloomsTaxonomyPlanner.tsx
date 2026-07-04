import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const LEVELS = [
  { name: "Remember", verbs: "define, list, recall, identify, name", color: "bg-blue-50 border-blue-200" },
  { name: "Understand", verbs: "explain, summarize, describe, interpret", color: "bg-cyan-50 border-cyan-200" },
  { name: "Apply", verbs: "use, solve, demonstrate, implement", color: "bg-teal-50 border-teal-200" },
  { name: "Analyze", verbs: "compare, contrast, examine, differentiate", color: "bg-emerald-50 border-emerald-200" },
  { name: "Evaluate", verbs: "judge, critique, justify, defend", color: "bg-amber-50 border-amber-200" },
  { name: "Create", verbs: "design, build, compose, invent", color: "bg-rose-50 border-rose-200" },
];

export function BloomsTaxonomyPlanner() {
  const [tasks, setTasks] = useState<Record<string, string>>({});
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {LEVELS.map((l) => (
        <div key={l.name} className={`rounded-lg border p-4 ${l.color}`}>
          <h3 className="font-semibold text-foreground">{l.name}</h3>
          <p className="text-xs text-muted-foreground mt-1">Verbs: {l.verbs}</p>
          <Label className="mt-3 block text-xs">Task</Label>
          <Textarea
            rows={3}
            className="bg-white"
            value={tasks[l.name] || ""}
            onChange={(e) => setTasks({ ...tasks, [l.name]: e.target.value })}
            placeholder={`Write a task that asks students to ${l.verbs.split(",")[0]}...`}
          />
        </div>
      ))}
    </div>
  );
}
