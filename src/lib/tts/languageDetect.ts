/**
 * Lightweight client-side language detection using Unicode block heuristics
 * plus stopword frequency for Latin-script languages.
 * Returns a BCP-47 language tag.
 */
const RANGES: Array<{ lang: string; test: (s: string) => boolean }> = [
  { lang: "hi-IN", test: (s) => /[\u0900-\u097F]/.test(s) },        // Devanagari → Hindi/Marathi
  { lang: "ar-SA", test: (s) => /[\u0600-\u06FF]/.test(s) },        // Arabic / Urdu
  { lang: "bn-IN", test: (s) => /[\u0980-\u09FF]/.test(s) },        // Bengali
  { lang: "ta-IN", test: (s) => /[\u0B80-\u0BFF]/.test(s) },        // Tamil
  { lang: "te-IN", test: (s) => /[\u0C00-\u0C7F]/.test(s) },        // Telugu
  { lang: "ja-JP", test: (s) => /[\u3040-\u30FF]/.test(s) },        // Hiragana/Katakana
  { lang: "ko-KR", test: (s) => /[\uAC00-\uD7AF]/.test(s) },        // Hangul
  { lang: "zh-CN", test: (s) => /[\u4E00-\u9FFF]/.test(s) },        // CJK ideographs
  { lang: "ru-RU", test: (s) => /[\u0400-\u04FF]/.test(s) },        // Cyrillic
];

const LATIN_STOPWORDS: Record<string, string[]> = {
  "es-ES": ["el", "la", "los", "las", "que", "de", "y", "es", "en", "por", "con", "para", "una", "un"],
  "fr-FR": ["le", "la", "les", "des", "et", "est", "que", "qui", "pour", "avec", "dans", "une", "un"],
  "de-DE": ["der", "die", "das", "und", "ist", "nicht", "ein", "eine", "mit", "für", "auf", "von", "den"],
  "pt-PT": ["o", "a", "os", "as", "que", "de", "e", "para", "com", "uma", "um", "não"],
  "it-IT": ["il", "la", "le", "che", "di", "e", "è", "per", "con", "una", "un"],
  "en-US": ["the", "and", "is", "of", "to", "in", "a", "that", "it", "for", "on", "with", "this"],
};

export function detectLanguage(text: string): string {
  const sample = text.slice(0, 500);
  if (!sample.trim()) return "en-US";
  for (const r of RANGES) if (r.test(sample)) return r.lang;

  const tokens: string[] = sample.toLowerCase().match(/[a-zàâäéèêëïîôöùûüçñáéíóúü]+/g) ?? [];
  if (tokens.length === 0) return "en-US";
  let best = "en-US";
  let bestScore = 0;
  for (const [lang, words] of Object.entries(LATIN_STOPWORDS)) {
    const set = new Set<string>(words);
    const score: number = tokens.reduce((acc: number, t: string) => acc + (set.has(t) ? 1 : 0), 0);
    if (score > bestScore) { bestScore = score; best = lang; }
  }
  return best;
}

export function languageLabel(lang: string): string {
  const map: Record<string, string> = {
    "en-US": "English", "en-GB": "English", "hi-IN": "Hindi", "ar-SA": "Arabic",
    "bn-IN": "Bengali", "ta-IN": "Tamil", "te-IN": "Telugu", "ja-JP": "Japanese",
    "ko-KR": "Korean", "zh-CN": "Chinese", "ru-RU": "Russian", "es-ES": "Spanish",
    "fr-FR": "French", "de-DE": "German", "pt-PT": "Portuguese", "it-IT": "Italian",
  };
  return map[lang] ?? lang;
}
