import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function CornellNotes() {
  const [topic, setTopic] = useState("");
  const [date, setDate] = useState("");
  const [cues, setCues] = useState("");
  const [notes, setNotes] = useState("");
  const [summary, setSummary] = useState("");
  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <Input placeholder="Topic" value={topic} onChange={(e) => setTopic(e.target.value)} />
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div className="grid grid-cols-3 gap-0 border rounded-lg overflow-hidden">
        <div className="border-r p-3 bg-accent/20">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Cues / Questions</div>
          <Textarea rows={14} className="border-0 bg-transparent resize-none" value={cues} onChange={(e) => setCues(e.target.value)} placeholder="Key terms, questions..." />
        </div>
        <div className="col-span-2 p-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Notes</div>
          <Textarea rows={14} className="border-0 bg-transparent resize-none" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Main lecture notes..." />
        </div>
        <div className="col-span-3 border-t p-3 bg-accent/20">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Summary</div>
          <Textarea rows={3} className="border-0 bg-transparent resize-none" value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="2-3 sentence summary..." />
        </div>
      </div>
      <Button onClick={() => window.print()}>Print Notes</Button>
    </div>
  );
}
