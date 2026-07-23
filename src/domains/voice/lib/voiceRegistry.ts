export type KokoroLangCode = 'a' | 'b' | 'j' | 'z' | 'e' | 'f' | 'h' | 'i' | 'p';
export type VoiceGrade = 'A' | 'A-' | 'B' | 'B-' | 'C' | 'C+' | 'C-' | 'D' | 'D-' | 'D+' | 'F+';
export type VoiceGender = 'Female' | 'Male';

export interface KokoroVoice {
  id: string;
  name: string;
  langCode: KokoroLangCode;
  language: string;
  gender: VoiceGender;
  grade: VoiceGrade;
  sampleText: string;
}

const LANG_LABELS: Record<KokoroLangCode, string> = {
  a: 'English (US)',
  b: 'English (UK)',
  j: 'Japanese',
  z: 'Mandarin Chinese',
  e: 'Spanish',
  f: 'French',
  h: 'Hindi',
  i: 'Italian',
  p: 'Brazilian Portuguese',
};

const SAMPLES: Record<string, string> = {
  'English (US)': "Welcome to Racira. This is a sample of my voice.",
  'English (UK)': "Welcome to Racira. This is a sample of my voice.",
  'Japanese': "Raciraへようこそ。これは私の声のサンプルです。",
  'Mandarin Chinese': "欢迎来到 Racira。这是我声音的样本。",
  'Spanish': "Bienvenido a Racira. Esta es una muestra de mi voz.",
  'French': "Bienvenue sur Racira. Ceci est un échantillon de ma voix.",
  'Hindi': "Racira में आपका स्वागत है। यह मेरी आवाज़ का एक नमूना है।",
  'Italian': "Benvenuto in Racira. Questo è un campione della mia voce.",
  'Brazilian Portuguese': "Bem-vindo ao Racira. Esta é uma amostra da minha voz.",
};

function v(
  id: string,
  grade: VoiceGrade,
  langCode: KokoroLangCode,
  gender: VoiceGender
): KokoroVoice {
  const language = LANG_LABELS[langCode];
  const rawName = id.split('_')[1] ?? id;
  return {
    id,
    name: rawName.charAt(0).toUpperCase() + rawName.slice(1),
    langCode,
    language,
    gender,
    grade,
    sampleText: SAMPLES[language] ?? SAMPLES['English (US)'],
  };
}

export const kokoroVoices: KokoroVoice[] = [
  // American English (lang_code='a')
  v('af_heart', 'A', 'a', 'Female'),
  v('af_alloy', 'C', 'a', 'Female'),
  v('af_aoede', 'C+', 'a', 'Female'),
  v('af_bella', 'A-', 'a', 'Female'),
  v('af_jessica', 'D', 'a', 'Female'),
  v('af_kore', 'C+', 'a', 'Female'),
  v('af_nicole', 'B-', 'a', 'Female'),
  v('af_nova', 'C', 'a', 'Female'),
  v('af_river', 'D', 'a', 'Female'),
  v('af_sarah', 'C+', 'a', 'Female'),
  v('af_sky', 'C-', 'a', 'Female'),
  v('am_adam', 'F+', 'a', 'Male'),
  v('am_echo', 'D', 'a', 'Male'),
  v('am_eric', 'D', 'a', 'Male'),
  v('am_fenrir', 'C+', 'a', 'Male'),
  v('am_liam', 'D', 'a', 'Male'),
  v('am_michael', 'C+', 'a', 'Male'),
  v('am_onyx', 'D', 'a', 'Male'),
  v('am_puck', 'C+', 'a', 'Male'),
  v('am_santa', 'D-', 'a', 'Male'),

  // British English (lang_code='b')
  v('bf_alice', 'D', 'b', 'Female'),
  v('bf_emma', 'B-', 'b', 'Female'),
  v('bf_isabella', 'C', 'b', 'Female'),
  v('bf_lily', 'D', 'b', 'Female'),
  v('bm_daniel', 'D', 'b', 'Male'),
  v('bm_fable', 'C', 'b', 'Male'),
  v('bm_george', 'C', 'b', 'Male'),
  v('bm_lewis', 'D+', 'b', 'Male'),

  // Japanese (lang_code='j')
  v('jf_alpha', 'C+', 'j', 'Female'),
  v('jf_gongitsune', 'C', 'j', 'Female'),
  v('jf_nezumi', 'C-', 'j', 'Female'),
  v('jf_tebukuro', 'C', 'j', 'Female'),
  v('jm_kumo', 'C-', 'j', 'Male'),

  // Mandarin Chinese (lang_code='z')
  v('zf_xiaobei', 'D', 'z', 'Female'),
  v('zf_xiaoni', 'D', 'z', 'Female'),
  v('zf_xiaoxiao', 'D', 'z', 'Female'),
  v('zf_xiaoyi', 'D', 'z', 'Female'),
  v('zm_yunjian', 'D', 'z', 'Male'),
  v('zm_yunxi', 'D', 'z', 'Male'),
  v('zm_yunxia', 'D', 'z', 'Male'),
  v('zm_yunyang', 'D', 'z', 'Male'),

  // Spanish (lang_code='e')
  v('ef_dora', 'C', 'e', 'Female'),
  v('em_alex', 'C', 'e', 'Male'),
  v('em_santa', 'C', 'e', 'Male'),

  // French (lang_code='f')
  v('ff_siwis', 'B-', 'f', 'Female'),

  // Hindi (lang_code='h')
  v('hf_alpha', 'C', 'h', 'Female'),
  v('hf_beta', 'C', 'h', 'Female'),
  v('hm_omega', 'C', 'h', 'Male'),
  v('hm_psi', 'C', 'h', 'Male'),

  // Italian (lang_code='i')
  v('if_sara', 'C', 'i', 'Female'),
  v('im_nicola', 'C', 'i', 'Male'),

  // Brazilian Portuguese (lang_code='p')
  v('pf_dora', 'C', 'p', 'Female'),
  v('pm_alex', 'C', 'p', 'Male'),
  v('pm_santa', 'C', 'p', 'Male'),
];
