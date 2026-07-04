import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function LessonPlanTemplate() {
  const [d, setD] = useState({
    title: "", subject: "", grade: "", duration: "45 min",
    objectives: "", materials: "", warmup: "", activity: "", closure: "", assessment: "",
  });
  const set = (k: keyof typeof d) => (e: any) => setD({ ...d, [k]: e.target.value });
  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <div><Label>Lesson Title</Label><Input value={d.title} onChange={set("title")} /></div>
        <div><Label>Subject</Label><Input value={d.subject} onChange={set("subject")} /></div>
        <div><Label>Grade Level</Label><Input value={d.grade} onChange={set("grade")} /></div>
        <div><Label>Duration</Label><Input value={d.duration} onChange={set("duration")} /></div>
      </div>
      {[
        ["objectives", "Learning Objectives"],
        ["materials", "Materials Needed"],
        ["warmup", "Warm-Up / Bell Ringer"],
        ["activity", "Main Activity"],
        ["closure", "Closure / Wrap-Up"],
        ["assessment", "Assessment"],
      ].map(([k, label]) => (
        <div key={k}><Label>{label}</Label><Textarea rows={3} value={(d as any)[k]} onChange={set(k as any)} /></div>
      ))}
      <Button onClick={() => window.print()}>Print Lesson Plan</Button>
    </div>
  );
}
