export interface KokoroVoice {
  id: string;
  name: string;
  language: string;
  languageLabel: string;
  gender: string;
  traits?: string;
  targetQuality: string;
  overallGrade: string;
}

export const KOKORO_VOICES: KokoroVoice[] = [
  { id: "af_heart", name: "Heart", language: "en-us", languageLabel: "American English", gender: "Female", traits: "❤️", targetQuality: "A", overallGrade: "A" },
  { id: "af_alloy", name: "Alloy", language: "en-us", languageLabel: "American English", gender: "Female", targetQuality: "B", overallGrade: "C" },
  { id: "af_aoede", name: "Aoede", language: "en-us", languageLabel: "American English", gender: "Female", targetQuality: "B", overallGrade: "C+" },
  { id: "af_bella", name: "Bella", language: "en-us", languageLabel: "American English", gender: "Female", traits: "🔥", targetQuality: "A", overallGrade: "A-" },
  { id: "af_jessica", name: "Jessica", language: "en-us", languageLabel: "American English", gender: "Female", targetQuality: "C", overallGrade: "D" },
  { id: "af_kore", name: "Kore", language: "en-us", languageLabel: "American English", gender: "Female", targetQuality: "B", overallGrade: "C+" },
  { id: "af_nicole", name: "Nicole", language: "en-us", languageLabel: "American English", gender: "Female", traits: "🎧", targetQuality: "B", overallGrade: "B-" },
  { id: "af_nova", name: "Nova", language: "en-us", languageLabel: "American English", gender: "Female", targetQuality: "B", overallGrade: "C" },
  { id: "af_river", name: "River", language: "en-us", languageLabel: "American English", gender: "Female", targetQuality: "C", overallGrade: "D" },
  { id: "af_sarah", name: "Sarah", language: "en-us", languageLabel: "American English", gender: "Female", targetQuality: "B", overallGrade: "C+" },
  { id: "af_sky", name: "Sky", language: "en-us", languageLabel: "American English", gender: "Female", targetQuality: "B", overallGrade: "C-" },
  { id: "am_adam", name: "Adam", language: "en-us", languageLabel: "American English", gender: "Male", targetQuality: "D", overallGrade: "F+" },
  { id: "am_echo", name: "Echo", language: "en-us", languageLabel: "American English", gender: "Male", targetQuality: "C", overallGrade: "D" },
  { id: "am_eric", name: "Eric", language: "en-us", languageLabel: "American English", gender: "Male", targetQuality: "C", overallGrade: "D" },
  { id: "am_fenrir", name: "Fenrir", language: "en-us", languageLabel: "American English", gender: "Male", targetQuality: "B", overallGrade: "C+" },
  { id: "am_liam", name: "Liam", language: "en-us", languageLabel: "American English", gender: "Male", targetQuality: "C", overallGrade: "D" },
  { id: "am_michael", name: "Michael", language: "en-us", languageLabel: "American English", gender: "Male", targetQuality: "B", overallGrade: "C+" },
  { id: "am_onyx", name: "Onyx", language: "en-us", languageLabel: "American English", gender: "Male", targetQuality: "C", overallGrade: "D" },
  { id: "am_puck", name: "Puck", language: "en-us", languageLabel: "American English", gender: "Male", targetQuality: "B", overallGrade: "C+" },
  { id: "am_santa", name: "Santa", language: "en-us", languageLabel: "American English", gender: "Male", targetQuality: "C", overallGrade: "D-" },
  { id: "bf_emma", name: "Emma", language: "en-gb", languageLabel: "British English", gender: "Female", traits: "🚺", targetQuality: "B", overallGrade: "B-" },
  { id: "bf_isabella", name: "Isabella", language: "en-gb", languageLabel: "British English", gender: "Female", targetQuality: "B", overallGrade: "C" },
  { id: "bm_george", name: "George", language: "en-gb", languageLabel: "British English", gender: "Male", targetQuality: "B", overallGrade: "C" },
  { id: "bm_lewis", name: "Lewis", language: "en-gb", languageLabel: "British English", gender: "Male", targetQuality: "C", overallGrade: "D+" },
  { id: "bf_alice", name: "Alice", language: "en-gb", languageLabel: "British English", gender: "Female", traits: "🚺", targetQuality: "C", overallGrade: "D" },
  { id: "bf_lily", name: "Lily", language: "en-gb", languageLabel: "British English", gender: "Female", traits: "🚺", targetQuality: "C", overallGrade: "D" },
  { id: "bm_daniel", name: "Daniel", language: "en-gb", languageLabel: "British English", gender: "Male", traits: "🚹", targetQuality: "C", overallGrade: "D" },
  { id: "bm_fable", name: "Fable", language: "en-gb", languageLabel: "British English", gender: "Male", traits: "🚹", targetQuality: "B", overallGrade: "C" },
];

export const KOKORO_LANGUAGES = [
  { code: "en-us", label: "American English" },
  { code: "en-gb", label: "British English" },
];

export function getVoicesByLanguage(lang: string): KokoroVoice[] {
  return KOKORO_VOICES.filter((v) => v.language === lang);
}

export function getVoicesGroupedByLanguage(): {
  label: string;
  voices: KokoroVoice[];
}[] {
  const groups: Record<string, KokoroVoice[]> = {};
  for (const voice of KOKORO_VOICES) {
    const label = voice.languageLabel;
    if (!groups[label]) groups[label] = [];
    groups[label].push(voice);
  }
  return Object.entries(groups).map(([label, voices]) => ({ label, voices }));
}
