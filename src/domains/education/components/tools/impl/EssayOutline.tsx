import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function EssayOutline() {
  const [thesis, setThesis] = useState("");
  const [hook, setHook] = useState("");
  const [points, setPoints] = useState(["", "", ""]);
  const [conclusion, setConclusion] = useState("");
  return (
    <div className="space-y-5">
      <div><Label>Hook / Opening</Label><Input value={hook} onChange={(e) => setHook(e.target.value)} placeholder="A surprising fact, question, quote..." /></div>
      <div><Label>Thesis Statement</Label><Textarea rows={2} value={thesis} onChange={(e) => setThesis(e.target.value)} /></div>
      <div className="space-y-3">
        <Label>Body Paragraphs</Label>
        {points.map((p, i) => (
          <div key={i} className="rounded-lg border p-3">
            <div className="text-xs font-semibold text-primary mb-2">Point {i + 1}</div>
            <Textarea rows={2} value={p} onChange={(e) => { const c = [...points]; c[i] = e.target.value; setPoints(c); }} placeholder="Topic sentence + evidence + analysis" />
          </div>
        ))}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setPoints([...points, ""])}>+ Add Point</Button>
          {points.length > 1 && <Button variant="outline" size="sm" onClick={() => setPoints(points.slice(0, -1))}>− Remove</Button>}
        </div>
      </div>
      <div><Label>Conclusion</Label><Textarea rows={3} value={conclusion} onChange={(e) => setConclusion(e.target.value)} placeholder="Restate thesis, synthesize, end with impact" /></div>
      <Button onClick={() => window.print()}>Print Outline</Button>
    </div>
  );
}
