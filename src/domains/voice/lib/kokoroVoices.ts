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

  // Non-English voices. These phonemize through espeak-ng rather than the
  // `phonemizer` package (see patches/kokoro-js+1.2.1.patch); the routing key is
  // the voice id's first character — e/f/i/p/h -> es/fr/it/pt-BR/hi.
  //
  // Upstream publishes no target-quality or overall-grade letters for these
  // voices the way it does for the English set, and there is no per-voice
  // training-duration data to derive them from. Recorded as "—" rather than
  // invented: neither field is rendered anywhere in the UI (both are referenced
  // only in this file), so a placeholder costs nothing, whereas a guessed "B"
  // would be indistinguishable from a measured one.
  { id: "ef_dora", name: "Dora", language: "es", languageLabel: "Spanish", gender: "Female", targetQuality: "—", overallGrade: "—" },
  { id: "em_alex", name: "Alex", language: "es", languageLabel: "Spanish", gender: "Male", targetQuality: "—", overallGrade: "—" },
  { id: "em_santa", name: "Santa", language: "es", languageLabel: "Spanish", gender: "Male", targetQuality: "—", overallGrade: "—" },
  { id: "ff_siwis", name: "Siwis", language: "fr", languageLabel: "French", gender: "Female", targetQuality: "—", overallGrade: "B-" },
  { id: "if_sara", name: "Sara", language: "it", languageLabel: "Italian", gender: "Female", targetQuality: "—", overallGrade: "—" },
  { id: "im_nicola", name: "Nicola", language: "it", languageLabel: "Italian", gender: "Male", targetQuality: "—", overallGrade: "—" },
  { id: "pf_dora", name: "Dora", language: "pt-BR", languageLabel: "Portuguese (Brazil)", gender: "Female", targetQuality: "—", overallGrade: "—" },
  { id: "pm_alex", name: "Alex", language: "pt-BR", languageLabel: "Portuguese (Brazil)", gender: "Male", targetQuality: "—", overallGrade: "—" },
  { id: "pm_santa", name: "Santa", language: "pt-BR", languageLabel: "Portuguese (Brazil)", gender: "Male", targetQuality: "—", overallGrade: "—" },
  { id: "hf_alpha", name: "Alpha", language: "hi", languageLabel: "Hindi", gender: "Female", targetQuality: "—", overallGrade: "—" },
  { id: "hf_beta", name: "Beta", language: "hi", languageLabel: "Hindi", gender: "Female", targetQuality: "—", overallGrade: "—" },
  { id: "hm_omega", name: "Omega", language: "hi", languageLabel: "Hindi", gender: "Male", targetQuality: "—", overallGrade: "—" },
  { id: "hm_psi", name: "Psi", language: "hi", languageLabel: "Hindi", gender: "Male", targetQuality: "—", overallGrade: "—" },
];

export const KOKORO_LANGUAGES = [
  { code: "en-us", label: "American English" },
  { code: "en-gb", label: "British English" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "it", label: "Italian" },
  { code: "pt-BR", label: "Portuguese (Brazil)" },
  { code: "hi", label: "Hindi" },
];
