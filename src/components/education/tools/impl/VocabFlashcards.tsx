import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

type V = { term: string; translation: string; example: string };

export function VocabFlashcards() {
  const [cards, setCards] = useState<V[]>([{ term: "Hola", translation: "Hello", example: "¡Hola, amigo!" }]);
  const [d, setD] = useState<V>({ term: "", translation: "", example: "" });
  const [i, setI] = useState(0);
  const [flip, setFlip] = useState(false);

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-3">
        <Input placeholder="Word / Phrase" value={d.term} onChange={(e) => setD({ ...d, term: e.target.value })} />
        <Input placeholder="Translation" value={d.translation} onChange={(e) => setD({ ...d, translation: e.target.value })} />
        <Input placeholder="Example sentence" value={d.example} onChange={(e) => setD({ ...d, example: e.target.value })} />
        <Button onClick={() => { if (d.term && d.translation) { setCards([...cards, d]); setD({ term: "", translation: "", example: "" }); } }}>Add</Button>
        <div className="space-y-1 mt-4 max-h-64 overflow-auto">
          {cards.map((c, k) => (
            <div key={k} className="flex items-center gap-2 border rounded p-2 text-sm">
              <span className="flex-1"><b>{c.term}</b> → {c.translation}</span>
              <Button variant="ghost" size="icon" onClick={() => setCards(cards.filter((_, j) => j !== k))}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col items-center justify-center">
        {cards.length > 0 && (
          <>
            <div onClick={() => setFlip(!flip)} className="cursor-pointer rounded-xl border-2 border-primary/30 w-full min-h-[240px] grid place-items-center p-6 text-center">
              {flip ? (
                <div>
                  <div className="text-2xl font-bold">{cards[i].translation}</div>
                  <div className="text-sm text-muted-foreground italic mt-2">{cards[i].example}</div>
                </div>
              ) : (
                <div className="text-3xl font-bold text-primary">{cards[i].term}</div>
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-2">{i + 1} / {cards.length} · click to flip</div>
            <div className="flex gap-2 mt-3">
              <Button variant="outline" onClick={() => { setI((i - 1 + cards.length) % cards.length); setFlip(false); }}>Prev</Button>
              <Button onClick={() => { setI((i + 1) % cards.length); setFlip(false); }}>Next</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
