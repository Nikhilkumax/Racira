import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Shuffle } from "lucide-react";

export function RandomStudentPicker() {
  const [names, setNames] = useState("Alice\nBob\nCarol\nDavid\nEva\nFrank");
  const [picked, setPicked] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const list = names.split(/\n/).map((n) => n.trim()).filter(Boolean);
  const pick = () => {
    if (!list.length) return;
    setSpinning(true);
    let count = 0;
    const id = setInterval(() => {
      setPicked(list[Math.floor(Math.random() * list.length)]);
      if (++count > 15) { clearInterval(id); setSpinning(false); }
    }, 80);
  };
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <Label>Student Names (one per line)</Label>
        <Textarea rows={12} value={names} onChange={(e) => setNames(e.target.value)} />
        <p className="text-xs text-muted-foreground mt-1">{list.length} students</p>
      </div>
      <div className="flex flex-col items-center justify-center">
        <div className="rounded-2xl border-4 border-primary bg-primary/5 w-full p-12 min-h-[200px] grid place-items-center mb-4">
          <div className={`text-3xl font-bold text-primary ${spinning ? "animate-pulse" : ""}`}>
            {picked || "Press Pick"}
          </div>
        </div>
        <Button size="lg" onClick={pick} disabled={spinning}>
          <Shuffle className="h-4 w-4 mr-2" /> Pick a Student
        </Button>
      </div>
    </div>
  );
}
