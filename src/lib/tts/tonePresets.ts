export interface ToneSettings {
  rate: number;   // 0.1–10 (we keep 0.6–1.6)
  pitch: number;  // 0–2
  volume: number; // 0–1
}

export interface TonePreset {
  id: string;
  name: string;
  description: string;
  settings: ToneSettings;
}

export const TONE_PRESETS: TonePreset[] = [
  { id: "voiceover", name: "Voiceover", description: "Clear, polished, neutral",
    settings: { rate: 0.95, pitch: 0.85, volume: 1 } },
  { id: "podcast", name: "Podcast Host", description: "Natural, conversational, slight energy",
    settings: { rate: 1.1, pitch: 1.05, volume: 1 } },
  { id: "narrate", name: "Narrate a story", description: "Slower, warm, immersive",
    settings: { rate: 0.88, pitch: 0.92, volume: 1 } },
  { id: "news", name: "News Anchor", description: "Authoritative, clear, measured",
    settings: { rate: 1.0, pitch: 0.8, volume: 1 } },
  { id: "meditation", name: "Meditation Guide", description: "Slow, calm, gentle",
    settings: { rate: 0.65, pitch: 1.1, volume: 1 } },
  { id: "support", name: "Customer Support", description: "Friendly and reassuring",
    settings: { rate: 0.95, pitch: 1.0, volume: 1 } },
  { id: "kids", name: "Kids Story", description: "Warm, clear, slightly higher",
    settings: { rate: 0.9, pitch: 1.3, volume: 1 } },
  { id: "none", name: "None", description: "No specific style",
    settings: { rate: 1.0, pitch: 1.0, volume: 1 } },
];


export function getPreset(id: string): TonePreset {
  return TONE_PRESETS.find((p) => p.id === id) ?? TONE_PRESETS[0];
}

/** Parse free-text custom tone keywords and return delta adjustments. */
export function parseCustomTone(input: string): Partial<ToneSettings> {
  const t = input.toLowerCase();
  const out: ToneSettings = { rate: 1, pitch: 1, volume: 1 };
  if (!t.trim()) return {};

  const apply = (rule: RegExp, dRate = 0, dPitch = 0) => {
    if (rule.test(t)) { out.rate += dRate; out.pitch += dPitch; }
  };
  apply(/nostalgic|wistful|melanchol/i, -0.08, -0.05);
  apply(/cinematic|epic|trailer/i,      -0.05, -0.10);
  apply(/motivational|coach|inspir/i,    0.05,  0.05);
  apply(/calm|teacher|gentle|soothing/i,-0.10,  0.00);
  apply(/podcast|host|conversational/i,  0.02,  0.05);
  apply(/news|anchor|serious|formal/i,   0.00, -0.05);
  apply(/emotional|heartfelt/i,         -0.05,  0.10);
  apply(/cheerful|happy|upbeat|energetic/i, 0.10,  0.10);
  apply(/sad|somber|low/i,              -0.10, -0.10);
  apply(/whisper|soft|quiet/i,          -0.10, -0.05);
  apply(/fast|quick|rapid/i,             0.20,  0.00);
  apply(/slow|deliberate/i,             -0.20,  0.00);
  apply(/deep|low pitch/i,               0.00, -0.20);
  apply(/high pitch|bright/i,            0.00,  0.15);

  // Clamp
  out.rate = Math.max(0.6, Math.min(1.6, out.rate));
  out.pitch = Math.max(0.5, Math.min(1.6, out.pitch));
  return { rate: out.rate, pitch: out.pitch };
}
