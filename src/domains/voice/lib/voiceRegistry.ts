export type VoiceGrade = 'A' | 'B' | 'C' | 'D';
export type VoiceLanguage = 'English (US)' | 'English (UK)' | 'Japanese' | 'Mandarin' | 'Spanish' | 'French' | 'Hindi' | 'Italian' | 'Portuguese';
export type VoiceGender = 'Female' | 'Male';

export interface KokoroVoice {
  id: string; // e.g., 'af_heart'
  name: string; // e.g., 'Heart'
  language: VoiceLanguage;
  gender: VoiceGender;
  grade: VoiceGrade;
  sampleText: string;
}

// Default sample texts per language (you can customize these per voice if desired)
const SAMPLES = {
  'English (US)': "Welcome to Racira. This is a sample of my voice.",
  'English (UK)': "Welcome to Racira. This is a sample of my voice.",
  'Japanese': "Raciraへようこそ。これは私の声のサンプルです。",
  'Mandarin': "欢迎来到 Racira。这是我声音的样本。",
  'Spanish': "Bienvenido a Racira. Esta es una muestra de mi voz.",
  'French': "Bienvenue sur Racira. Ceci est un échantillon de ma voix.",
  'Hindi': "Racira में आपका स्वागत है। यह मेरी आवाज़ का एक नमूना है।",
  'Italian': "Benvenuto in Racira. Questo è un campione della mia voce.",
  'Portuguese': "Bem-vindo ao Racira. Esta é uma amostra da minha voz."
};

// Initial subset of Kokoro Grade A/B English voices. 
// The full 88-voice list can be appended here using the same structure.
export const kokoroVoices: KokoroVoice[] = [
  // American Female (Grade A/B)
  { id: 'af_heart', name: 'Heart', language: 'English (US)', gender: 'Female', grade: 'A', sampleText: SAMPLES['English (US)'] },
  { id: 'af_alloy', name: 'Alloy', language: 'English (US)', gender: 'Female', grade: 'A', sampleText: SAMPLES['English (US)'] },
  { id: 'af_bella', name: 'Bella', language: 'English (US)', gender: 'Female', grade: 'A', sampleText: SAMPLES['English (US)'] },
  { id: 'af_jessica', name: 'Jessica', language: 'English (US)', gender: 'Female', grade: 'A', sampleText: SAMPLES['English (US)'] },
  { id: 'af_kore', name: 'Kore', language: 'English (US)', gender: 'Female', grade: 'A', sampleText: SAMPLES['English (US)'] },
  { id: 'af_nicole', name: 'Nicole', language: 'English (US)', gender: 'Female', grade: 'A', sampleText: SAMPLES['English (US)'] },
  { id: 'af_nova', name: 'Nova', language: 'English (US)', gender: 'Female', grade: 'A', sampleText: SAMPLES['English (US)'] },
  { id: 'af_river', name: 'River', language: 'English (US)', gender: 'Female', grade: 'A', sampleText: SAMPLES['English (US)'] },
  { id: 'af_sarah', name: 'Sarah', language: 'English (US)', gender: 'Female', grade: 'A', sampleText: SAMPLES['English (US)'] },
  { id: 'af_sky', name: 'Sky', language: 'English (US)', gender: 'Female', grade: 'A', sampleText: SAMPLES['English (US)'] },
  
  // American Male (Grade A/B)
  { id: 'am_adam', name: 'Adam', language: 'English (US)', gender: 'Male', grade: 'A', sampleText: SAMPLES['English (US)'] },
  { id: 'am_echo', name: 'Echo', language: 'English (US)', gender: 'Male', grade: 'A', sampleText: SAMPLES['English (US)'] },
  { id: 'am_eric', name: 'Eric', language: 'English (US)', gender: 'Male', grade: 'A', sampleText: SAMPLES['English (US)'] },
  { id: 'am_fenrir', name: 'Fenrir', language: 'English (US)', gender: 'Male', grade: 'A', sampleText: SAMPLES['English (US)'] },
  { id: 'am_liam', name: 'Liam', language: 'English (US)', gender: 'Male', grade: 'A', sampleText: SAMPLES['English (US)'] },
  { id: 'am_michael', name: 'Michael', language: 'English (US)', gender: 'Male', grade: 'A', sampleText: SAMPLES['English (US)'] },
  { id: 'am_onyx', name: 'Onyx', language: 'English (US)', gender: 'Male', grade: 'A', sampleText: SAMPLES['English (US)'] },
  { id: 'am_puck', name: 'Puck', language: 'English (US)', gender: 'Male', grade: 'A', sampleText: SAMPLES['English (US)'] },
  { id: 'am_santa', name: 'Santa', language: 'English (US)', gender: 'Male', grade: 'A', sampleText: SAMPLES['English (US)'] },

  // British Female (Grade A/B)
  { id: 'bf_alice', name: 'Alice', language: 'English (UK)', gender: 'Female', grade: 'A', sampleText: SAMPLES['English (UK)'] },
  { id: 'bf_emma', name: 'Emma', language: 'English (UK)', gender: 'Female', grade: 'A', sampleText: SAMPLES['English (UK)'] },
  { id: 'bf_isabella', name: 'Isabella', language: 'English (UK)', gender: 'Female', grade: 'A', sampleText: SAMPLES['English (UK)'] },
  { id: 'bf_lily', name: 'Lily', language: 'English (UK)', gender: 'Female', grade: 'A', sampleText: SAMPLES['English (UK)'] },

  // British Male (Grade A/B)
  { id: 'bm_daniel', name: 'Daniel', language: 'English (UK)', gender: 'Male', grade: 'A', sampleText: SAMPLES['English (UK)'] },
  { id: 'bm_fable', name: 'Fable', language: 'English (UK)', gender: 'Male', grade: 'A', sampleText: SAMPLES['English (UK)'] },
  { id: 'bm_george', name: 'George', language: 'English (UK)', gender: 'Male', grade: 'A', sampleText: SAMPLES['English (UK)'] },
  { id: 'bm_lewis', name: 'Lewis', language: 'English (UK)', gender: 'Male', grade: 'A', sampleText: SAMPLES['English (UK)'] },
];
