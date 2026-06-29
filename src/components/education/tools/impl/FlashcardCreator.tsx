import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, ChevronLeft, ChevronRight, Eye } from "lucide-react";

type Card = { front: string; back: string };

export function FlashcardCreator() {
  const [cards, setCards] = useState<Card[]>([
    { front: "Photosynthesis", back: "Process by which plants convert sunlight into energy" },
  ]);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [mode, setMode] = useState<"edit" | "study">("edit");
  const [i, setI] = useState(0);
  const [show, setShow] = useState(false);

  const add = () => {
    if (!front.trim() || !back.trim()) return;
    setCards([...cards, { front, back }]);
    setFront(""); setBack("");
  };

  if (mode === "study" && cards.length) {
    const c = cards[i];
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => setMode("edit")}>← Back to editor</Button>
        <div className="text-sm text-muted-foreground text-center">Card {i + 1} of {cards.length}</div>
        <div
          onClick={() => setShow(!show)}
          className="min-h-[300px] rounded-xl border-2 border-primary/30 bg-card grid place-items-center p-8 cursor-pointer hover:bg-accent/30"
        >
          <div className="text-center">
            <div className="text-2xl font-medium">{show ? c.back : c.front}</div>
            <div className="mt-4 text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Eye className="h-3 w-3" /> Click to flip
            </div>
          </div>
        </div>
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => { setI((i - 1 + cards.length) % cards.length); setShow(false); }}>
            <ChevronLeft className="h-4 w-4" /> Prev
          </Button>
          <Button onClick={() => { setI((i + 1) % cards.length); setShow(false); }}>
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <Input placeholder="Front (question)" value={front} onChange={(e) => setFront(e.target.value)} />
        <Input placeholder="Back (answer)" value={back} onChange={(e) => setBack(e.target.value)} />
      </div>
      <div className="flex gap-2">
        <Button onClick={add}>Add Card</Button>
        {cards.length > 0 && <Button variant="outline" onClick={() => { setMode("study"); setI(0); setShow(false); }}>Study ({cards.length})</Button>}
      </div>
      <div className="space-y-2">
        {cards.map((c, idx) => (
          <div key={idx} className="flex items-center gap-3 border rounded-lg p-3">
            <div className="flex-1 grid sm:grid-cols-2 gap-2 text-sm">
              <div><b>Q:</b> {c.front}</div>
              <div><b>A:</b> {c.back}</div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setCards(cards.filter((_, j) => j !== idx))}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
