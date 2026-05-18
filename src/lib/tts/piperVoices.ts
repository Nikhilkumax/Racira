export interface PiperVoice {
  id: string
  name: string           // Display name (Racira branded)
  language: string       // BCP-47 code
  languageLabel: string  // "English (US)"
  gender: "male" | "female"
  category: string       // "Studio" | "Podcast" etc.
  modelUrl: string       // Direct URL to .onnx file
  configUrl: string      // Direct URL to .json config
  sizeMB: number
  quality: "high" | "medium"
}

// Piper models are hosted at:
// https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/

const BASE = "https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0"

export const PIPER_VOICES: PiperVoice[] = [

  // ── ENGLISH (US) ──────────────────────────
  {
    id: "en-us-amy-low",
    name: "Amy",
    language: "en-US",
    languageLabel: "English (US)",
    gender: "female",
    category: "Studio",
    modelUrl: `${BASE}/en/en_US/amy/low/en_US-amy-low.onnx`,
    configUrl: `${BASE}/en/en_US/amy/low/en_US-amy-low.onnx.json`,
    sizeMB: 25,
    quality: "medium",
  },
  {
    id: "en-us-lessac-high",
    name: "Lessac",
    language: "en-US",
    languageLabel: "English (US)",
    gender: "female",
    category: "Podcast",
    modelUrl: `${BASE}/en/en_US/lessac/high/en_US-lessac-high.onnx`,
    configUrl: `${BASE}/en/en_US/lessac/high/en_US-lessac-high.onnx.json`,
    sizeMB: 63,
    quality: "high",
  },
  {
    id: "en-us-ryan-high",
    name: "Ryan",
    language: "en-US",
    languageLabel: "English (US)",
    gender: "male",
    category: "Narrator",
    modelUrl: `${BASE}/en/en_US/ryan/high/en_US-ryan-high.onnx`,
    configUrl: `${BASE}/en/en_US/ryan/high/en_US-ryan-high.onnx.json`,
    sizeMB: 63,
    quality: "high",
  },
  {
    id: "en-us-joe-medium",
    name: "Joe",
    language: "en-US",
    languageLabel: "English (US)",
    gender: "male",
    category: "Podcast",
    modelUrl: `${BASE}/en/en_US/joe/medium/en_US-joe-medium.onnx`,
    configUrl: `${BASE}/en/en_US/joe/medium/en_US-joe-medium.onnx.json`,
    sizeMB: 63,
    quality: "medium",
  },
  {
    id: "en-us-kusal-medium",
    name: "Kusal",
    language: "en-US",
    languageLabel: "English (US)",
    gender: "male",
    category: "Studio",
    modelUrl: `${BASE}/en/en_US/kusal/medium/en_US-kusal-medium.onnx`,
    configUrl: `${BASE}/en/en_US/kusal/medium/en_US-kusal-medium.onnx.json`,
    sizeMB: 63,
    quality: "medium",
  },

  // ── ENGLISH (GB) ──────────────────────────
  {
    id: "en-gb-alan-medium",
    name: "Alan",
    language: "en-GB",
    languageLabel: "English (UK)",
    gender: "male",
    category: "Narrator",
    modelUrl: `${BASE}/en/en_GB/alan/medium/en_GB-alan-medium.onnx`,
    configUrl: `${BASE}/en/en_GB/alan/medium/en_GB-alan-medium.onnx.json`,
    sizeMB: 63,
    quality: "medium",
  },
  {
    id: "en-gb-jenny-dioco-medium",
    name: "Jenny",
    language: "en-GB",
    languageLabel: "English (UK)",
    gender: "female",
    category: "Studio",
    modelUrl: `${BASE}/en/en_GB/jenny_dioco/medium/en_GB-jenny_dioco-medium.onnx`,
    configUrl: `${BASE}/en/en_GB/jenny_dioco/medium/en_GB-jenny_dioco-medium.onnx.json`,
    sizeMB: 63,
    quality: "medium",
  },

  // ── HINDI ─────────────────────────────────
  {
    id: "hi-harini-medium",
    name: "Harini",
    language: "hi-IN",
    languageLabel: "Hindi",
    gender: "female",
    category: "Studio",
    modelUrl: `${BASE}/hi/hi_IN/harini/medium/hi_IN-harini-medium.onnx`,
    configUrl: `${BASE}/hi/hi_IN/harini/medium/hi_IN-harini-medium.onnx.json`,
    sizeMB: 63,
    quality: "medium",
  },

  // ── SPANISH ───────────────────────────────
  {
    id: "es-carlfm-low",
    name: "Carlos",
    language: "es-ES",
    languageLabel: "Spanish",
    gender: "male",
    category: "Studio",
    modelUrl: `${BASE}/es/es_ES/carlfm/x_low/es_ES-carlfm-x_low.onnx`,
    configUrl: `${BASE}/es/es_ES/carlfm/x_low/es_ES-carlfm-x_low.onnx.json`,
    sizeMB: 25,
    quality: "medium",
  },
  {
    id: "es-mx-claude-high",
    name: "Claude",
    language: "es-MX",
    languageLabel: "Spanish (Mexico)",
    gender: "male",
    category: "Podcast",
    modelUrl: `${BASE}/es/es_MX/claude/high/es_MX-claude-high.onnx`,
    configUrl: `${BASE}/es/es_MX/claude/high/es_MX-claude-high.onnx.json`,
    sizeMB: 63,
    quality: "high",
  },

  // ── FRENCH ────────────────────────────────
  {
    id: "fr-siwis-medium",
    name: "Siwis",
    language: "fr-FR",
    languageLabel: "French",
    gender: "female",
    category: "Studio",
    modelUrl: `${BASE}/fr/fr_FR/siwis/medium/fr_FR-siwis-medium.onnx`,
    configUrl: `${BASE}/fr/fr_FR/siwis/medium/fr_FR-siwis-medium.onnx.json`,
    sizeMB: 63,
    quality: "medium",
  },
  {
    id: "fr-tom-medium",
    name: "Tom",
    language: "fr-FR",
    languageLabel: "French",
    gender: "male",
    category: "Podcast",
    modelUrl: `${BASE}/fr/fr_FR/tom/medium/fr_FR-tom-medium.onnx`,
    configUrl: `${BASE}/fr/fr_FR/tom/medium/fr_FR-tom-medium.onnx.json`,
    sizeMB: 63,
    quality: "medium",
  },

  // ── GERMAN ────────────────────────────────
  {
    id: "de-thorsten-high",
    name: "Thorsten",
    language: "de-DE",
    languageLabel: "German",
    gender: "male",
    category: "Studio",
    modelUrl: `${BASE}/de/de_DE/thorsten/high/de_DE-thorsten-high.onnx`,
    configUrl: `${BASE}/de/de_DE/thorsten/high/de_DE-thorsten-high.onnx.json`,
    sizeMB: 63,
    quality: "high",
  },
  {
    id: "de-eva-medium",
    name: "Eva",
    language: "de-DE",
    languageLabel: "German",
    gender: "female",
    category: "Podcast",
    modelUrl: `${BASE}/de/de_DE/eva_k/x_low/de_DE-eva_k-x_low.onnx`,
    configUrl: `${BASE}/de/de_DE/eva_k/x_low/de_DE-eva_k-x_low.onnx.json`,
    sizeMB: 25,
    quality: "medium",
  },

  // ── ITALIAN ───────────────────────────────
  {
    id: "it-riccardo-x-low",
    name: "Riccardo",
    language: "it-IT",
    languageLabel: "Italian",
    gender: "male",
    category: "Studio",
    modelUrl: `${BASE}/it/it_IT/riccardo-fasol/x_low/it_IT-riccardo-fasol-x_low.onnx`,
    configUrl: `${BASE}/it/it_IT/riccardo-fasol/x_low/it_IT-riccardo-fasol-x_low.onnx.json`,
    sizeMB: 25,
    quality: "medium",
  },

  // ── PORTUGUESE ────────────────────────────
  {
    id: "pt-br-faber-medium",
    name: "Faber",
    language: "pt-BR",
    languageLabel: "Portuguese (Brazil)",
    gender: "male",
    category: "Studio",
    modelUrl: `${BASE}/pt/pt_BR/faber/medium/pt_BR-faber-medium.onnx`,
    configUrl: `${BASE}/pt/pt_BR/faber/medium/pt_BR-faber-medium.onnx.json`,
    sizeMB: 63,
    quality: "medium",
  },

  // ── DUTCH ─────────────────────────────────
  {
    id: "nl-mls-medium",
    name: "Nora",
    language: "nl-NL",
    languageLabel: "Dutch",
    gender: "female",
    category: "Studio",
    modelUrl: `${BASE}/nl/nl_NL/mls/medium/nl_NL-mls-medium.onnx`,
    configUrl: `${BASE}/nl/nl_NL/mls/medium/nl_NL-mls-medium.onnx.json`,
    sizeMB: 63,
    quality: "medium",
  },

  // ── POLISH ────────────────────────────────
  {
    id: "pl-mls-medium",
    name: "Piotr",
    language: "pl-PL",
    languageLabel: "Polish",
    gender: "male",
    category: "Studio",
    modelUrl: `${BASE}/pl/pl_PL/mls/medium/pl_PL-mls-medium.onnx`,
    configUrl: `${BASE}/pl/pl_PL/mls/medium/pl_PL-mls-medium.onnx.json`,
    sizeMB: 63,
    quality: "medium",
  },

  // ── RUSSIAN ───────────────────────────────
  {
    id: "ru-ruslan-medium",
    name: "Ruslan",
    language: "ru-RU",
    languageLabel: "Russian",
    gender: "male",
    category: "Studio",
    modelUrl: `${BASE}/ru/ru_RU/ruslan/medium/ru_RU-ruslan-medium.onnx`,
    configUrl: `${BASE}/ru/ru_RU/ruslan/medium/ru_RU-ruslan-medium.onnx.json`,
    sizeMB: 63,
    quality: "medium",
  },

  // ── UKRAINIAN ─────────────────────────────
  {
    id: "uk-lada-x-low",
    name: "Lada",
    language: "uk-UA",
    languageLabel: "Ukrainian",
    gender: "female",
    category: "Studio",
    modelUrl: `${BASE}/uk/uk_UA/lada/x_low/uk_UA-lada-x_low.onnx`,
    configUrl: `${BASE}/uk/uk_UA/lada/x_low/uk_UA-lada-x_low.onnx.json`,
    sizeMB: 25,
    quality: "medium",
  },

  // ── CHINESE ───────────────────────────────
  {
    id: "zh-huayan-x-low",
    name: "Huayan",
    language: "zh-CN",
    languageLabel: "Chinese",
    gender: "female",
    category: "Studio",
    modelUrl: `${BASE}/zh/zh_CN/huayan/x_low/zh_CN-huayan-x_low.onnx`,
    configUrl: `${BASE}/zh/zh_CN/huayan/x_low/zh_CN-huayan-x_low.onnx.json`,
    sizeMB: 25,
    quality: "medium",
  },

  // ── JAPANESE ──────────────────────────────
  {
    id: "ja-kokoro-medium",
    name: "Kokoro",
    language: "ja-JP",
    languageLabel: "Japanese",
    gender: "female",
    category: "Studio",
    modelUrl: `${BASE}/ja/ja_JP/kokoro/medium/ja_JP-kokoro-medium.onnx`,
    configUrl: `${BASE}/ja/ja_JP/kokoro/medium/ja_JP-kokoro-medium.onnx.json`,
    sizeMB: 63,
    quality: "medium",
  },

  // ── KOREAN ────────────────────────────────
  {
    id: "ko-gyehyun-medium",
    name: "Gyehyun",
    language: "ko-KR",
    languageLabel: "Korean",
    gender: "female",
    category: "Studio",
    modelUrl: `${BASE}/ko/ko_KR/kss/medium/ko_KR-kss-medium.onnx`,
    configUrl: `${BASE}/ko/ko_KR/kss/medium/ko_KR-kss-medium.onnx.json`,
    sizeMB: 63,
    quality: "medium",
  },

  // ── ARABIC ────────────────────────────────
  {
    id: "ar-kareem-low",
    name: "Kareem",
    language: "ar-AR",
    languageLabel: "Arabic",
    gender: "male",
    category: "Studio",
    modelUrl: `${BASE}/ar/ar_JO/kareem/low/ar_JO-kareem-low.onnx`,
    configUrl: `${BASE}/ar/ar_JO/kareem/low/ar_JO-kareem-low.onnx.json`,
    sizeMB: 25,
    quality: "medium",
  },

  // ── TURKISH ───────────────────────────────
  {
    id: "tr-dfki-medium",
    name: "Aylin",
    language: "tr-TR",
    languageLabel: "Turkish",
    gender: "female",
    category: "Studio",
    modelUrl: `${BASE}/tr/tr_TR/dfki/medium/tr_TR-dfki-medium.onnx`,
    configUrl: `${BASE}/tr/tr_TR/dfki/medium/tr_TR-dfki-medium.onnx.json`,
    sizeMB: 63,
    quality: "medium",
  },

  // ── SWEDISH ───────────────────────────────
  {
    id: "sv-nst-medium",
    name: "Erik",
    language: "sv-SE",
    languageLabel: "Swedish",
    gender: "male",
    category: "Studio",
    modelUrl: `${BASE}/sv/sv_SE/nst/medium/sv_SE-nst-medium.onnx`,
    configUrl: `${BASE}/sv/sv_SE/nst/medium/sv_SE-nst-medium.onnx.json`,
    sizeMB: 63,
    quality: "medium",
  },

  // ── NORWEGIAN ─────────────────────────────
  {
    id: "no-talesyntese-medium",
    name: "Sigrid",
    language: "no-NO",
    languageLabel: "Norwegian",
    gender: "female",
    category: "Studio",
    modelUrl: `${BASE}/no/no_NO/talesyntese/medium/no_NO-talesyntese-medium.onnx`,
    configUrl: `${BASE}/no/no_NO/talesyntese/medium/no_NO-talesyntese-medium.onnx.json`,
    sizeMB: 63,
    quality: "medium",
  },

  // ── CATALAN ───────────────────────────────
  {
    id: "ca-upc-low",
    name: "Marc",
    language: "ca-ES",
    languageLabel: "Catalan",
    gender: "male",
    category: "Studio",
    modelUrl: `${BASE}/ca/ca_ES/upc_ona/x_low/ca_ES-upc_ona-x_low.onnx`,
    configUrl: `${BASE}/ca/ca_ES/upc_ona/x_low/ca_ES-upc_ona-x_low.onnx.json`,
    sizeMB: 25,
    quality: "medium",
  },

  // ── FINNISH ───────────────────────────────
  {
    id: "fi-harri-low",
    name: "Harri",
    language: "fi-FI",
    languageLabel: "Finnish",
    gender: "male",
    category: "Studio",
    modelUrl: `${BASE}/fi/fi_FI/harri/low/fi_FI-harri-low.onnx`,
    configUrl: `${BASE}/fi/fi_FI/harri/low/fi_FI-harri-low.onnx.json`,
    sizeMB: 25,
    quality: "medium",
  },

  // ── VIETNAMESE ────────────────────────────
  {
    id: "vi-vivos-x-low",
    name: "Linh",
    language: "vi-VN",
    languageLabel: "Vietnamese",
    gender: "female",
    category: "Studio",
    modelUrl: `${BASE}/vi/vi_VN/vivos/x_low/vi_VN-vivos-x_low.onnx`,
    configUrl: `${BASE}/vi/vi_VN/vivos/x_low/vi_VN-vivos-x_low.onnx.json`,
    sizeMB: 25,
    quality: "medium",
  },

]

export function getVoicesByLanguage(lang: string): PiperVoice[] {
  return PIPER_VOICES.filter(v => 
    v.language === lang || 
    v.language.startsWith(lang.split("-")[0])
  )
}

export function getDefaultVoice(lang: string): PiperVoice {
  const voices = getVoicesByLanguage(lang)
  return voices[0] ?? PIPER_VOICES[0]
}

export function getAllLanguages(): string[] {
  const langs = new Set(PIPER_VOICES.map(v => v.language))
  return Array.from(langs)
}
