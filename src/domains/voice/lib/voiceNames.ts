import type { CountryCode } from '@mintplex-labs/piper-tts-web';

export interface VoiceNameEntry {
  name: string;
  gender: 'male' | 'female';
}

// Keyed by `${langCode}|${rawSpeakerSlug}` exactly as it appears in the
// voiceId's own segments (e.g. 'en_US-ryan-high' -> 'en_US|ryan').
// Genuine person names already used by Piper (Amy, Ryan, Riccardo,
// Kareem, Thorsten, etc.) are kept as-is. Corpus/organization labels
// that were never people's names (mls, vctk, dfki, google, semaine,
// arctic, lanfrica, rapunzelina, talesyntese, etc.) were replaced with
// a real popular given name from that language/region.
export const VOICE_NAME_OVERRIDES: Record<`${CountryCode}|${string}`, VoiceNameEntry> = {
  // Arabic (Jordan)
  'ar_JO|kareem': { name: 'Kareem', gender: 'male' },
  // Catalan
  'ca_ES|upc_ona': { name: 'Ona', gender: 'female' },
  'ca_ES|upc_pau': { name: 'Pau', gender: 'male' },
  // Chinese (Mandarin)
  'zh_CN|huayan': { name: 'Mei', gender: 'female' },
  // Czech
  'cs_CZ|jirka': { name: 'Jirka', gender: 'male' },
  // Danish
  'da_DK|talesyntese': { name: 'Freja', gender: 'female' },
  // Dutch (Belgium)
  'nl_BE|nathalie': { name: 'Nathalie', gender: 'female' },
  'nl_BE|rdh': { name: 'Bram', gender: 'male' },
  // Dutch (Netherlands)
  'nl_NL|mls': { name: 'Daan', gender: 'male' },
  'nl_NL|mls_5809': { name: 'Sanne', gender: 'female' },
  'nl_NL|mls_7432': { name: 'Lars', gender: 'male' },
  // English (UK)
  'en_GB|alan': { name: 'Alan', gender: 'male' },
  'en_GB|alba': { name: 'Alba', gender: 'female' },
  'en_GB|aru': { name: 'Freddie', gender: 'male' },
  'en_GB|cori': { name: 'Cori', gender: 'female' },
  'en_GB|jenny_dioco': { name: 'Jenny', gender: 'female' },
  'en_GB|northern_english_male': { name: 'Oliver', gender: 'male' },
  'en_GB|semaine': { name: 'Isla', gender: 'female' },
  'en_GB|southern_english_female': { name: 'Poppy', gender: 'female' },
  'en_GB|vctk': { name: 'Henry', gender: 'male' },
  // English (US)
  'en_US|amy': { name: 'Amy', gender: 'female' },
  'en_US|arctic': { name: 'Nathan', gender: 'male' },
  'en_US|danny': { name: 'Danny', gender: 'male' },
  'en_US|hfc_female': { name: 'Sophia', gender: 'female' },
  'en_US|hfc_male': { name: 'Ethan', gender: 'male' },
  'en_US|joe': { name: 'Joe', gender: 'male' },
  'en_US|kathleen': { name: 'Kathleen', gender: 'female' },
  'en_US|kristin': { name: 'Kristin', gender: 'female' },
  'en_US|kusal': { name: 'Marcus', gender: 'male' },
  'en_US|l2arctic': { name: 'Leo', gender: 'male' },
  'en_US|lessac': { name: 'James', gender: 'male' },
  'en_US|libritts': { name: 'Emma', gender: 'female' },
  'en_US|libritts_r': { name: 'Aiden', gender: 'male' },
  'en_US|ljspeech': { name: 'Ava', gender: 'female' },
  'en_US|ryan': { name: 'Ryan', gender: 'male' },
  // Finnish
  'fi_FI|harri': { name: 'Harri', gender: 'male' },
  // French
  'fr_FR|gilles': { name: 'Gilles', gender: 'male' },
  'fr_FR|mls': { name: 'Camille', gender: 'female' },
  'fr_FR|mls_1840': { name: 'Julien', gender: 'male' },
  'fr_FR|siwis': { name: 'Élodie', gender: 'female' },
  'fr_FR|tom': { name: 'Tom', gender: 'male' },
  'fr_FR|upmc': { name: 'Antoine', gender: 'male' },
  // Georgian
  'ka_GE|natia': { name: 'Natia', gender: 'female' },
  // German
  'de_DE|eva_k': { name: 'Eva', gender: 'female' },
  'de_DE|karlsson': { name: 'Lukas', gender: 'male' },
  'de_DE|kerstin': { name: 'Kerstin', gender: 'female' },
  'de_DE|mls': { name: 'Anna', gender: 'female' },
  'de_DE|pavoque': { name: 'Felix', gender: 'male' },
  'de_DE|ramona': { name: 'Ramona', gender: 'female' },
  'de_DE|thorsten': { name: 'Thorsten', gender: 'male' },
  'de_DE|thorsten_emotional': { name: 'Thorsten (Emotional)', gender: 'male' },
  // Greek
  'el_GR|rapunzelina': { name: 'Elena', gender: 'female' },
  // Hungarian
  'hu_HU|anna': { name: 'Anna', gender: 'female' },
  'hu_HU|berta': { name: 'Berta', gender: 'female' },
  'hu_HU|imre': { name: 'Imre', gender: 'male' },
  // Icelandic
  'is_IS|bui': { name: 'Búi', gender: 'male' },
  'is_IS|salka': { name: 'Salka', gender: 'female' },
  'is_IS|steinn': { name: 'Steinn', gender: 'male' },
  'is_IS|ugla': { name: 'Ugla', gender: 'female' },
  // Italian
  'it_IT|riccardo': { name: 'Riccardo', gender: 'male' },
  // Kazakh
  'kk_KZ|iseke': { name: 'Iseke', gender: 'male' },
  'kk_KZ|issai': { name: 'Aigerim', gender: 'female' },
  'kk_KZ|raya': { name: 'Raya', gender: 'female' },
  // Luxembourgish
  'lb_LU|marylux': { name: 'Tessy', gender: 'female' },
  // Nepali
  'ne_NP|google': { name: 'Sita', gender: 'female' },
  // Norwegian
  'no_NO|talesyntese': { name: 'Magnus', gender: 'male' },
  // Persian
  'fa_IR|amir': { name: 'Amir', gender: 'male' },
  'fa_IR|gyro': { name: 'Yasmin', gender: 'female' },
  // Polish
  'pl_PL|darkman': { name: 'Marek', gender: 'male' },
  'pl_PL|gosia': { name: 'Gosia', gender: 'female' },
  'pl_PL|mc_speech': { name: 'Tomasz', gender: 'male' },
  'pl_PL|mls_6892': { name: 'Ola', gender: 'female' },
  // Portuguese (Brazil)
  'pt_BR|edresson': { name: 'Edresson', gender: 'male' },
  'pt_BR|faber': { name: 'Camila', gender: 'female' },
  // Portuguese (Portugal)
  'pt_PT|tugão': { name: 'Tiago', gender: 'male' },
  // Romanian
  'ro_RO|mihai': { name: 'Mihai', gender: 'male' },
  // Russian
  'ru_RU|denis': { name: 'Denis', gender: 'male' },
  'ru_RU|dmitri': { name: 'Dmitri', gender: 'male' },
  'ru_RU|irina': { name: 'Irina', gender: 'female' },
  'ru_RU|ruslan': { name: 'Ruslan', gender: 'male' },
  // Serbian
  'sr_RS|serbski_institut': { name: 'Milica', gender: 'female' },
  // Slovak
  'sk_SK|lili': { name: 'Lili', gender: 'female' },
  // Slovenian
  'sl_SI|artur': { name: 'Artur', gender: 'male' },
  // Spanish (Mexico)
  'es_MX|ald': { name: 'Valentina', gender: 'female' },
  'es_MX|claude': { name: 'Santiago', gender: 'male' },
  // Spanish (Spain)
  'es_ES|carlfm': { name: 'Carlos', gender: 'male' },
  'es_ES|davefx': { name: 'Lucía', gender: 'female' },
  'es_ES|mls_10246': { name: 'Javier', gender: 'male' },
  'es_ES|mls_9972': { name: 'Elena', gender: 'female' },
  'es_ES|sharvard': { name: 'Mateo', gender: 'male' },
  // Swahili (Congo)
  'sw_CD|lanfrica': { name: 'Amani', gender: 'female' },
  // Swedish
  'sv_SE|nst': { name: 'Erik', gender: 'male' },
  // Turkish
  'tr_TR|dfki': { name: 'Elif', gender: 'female' },
  'tr_TR|fahrettin': { name: 'Fahrettin', gender: 'male' },
  'tr_TR|fettah': { name: 'Fettah', gender: 'male' },
  // Ukrainian
  'uk_UA|lada': { name: 'Lada', gender: 'female' },
  'uk_UA|ukrainian_tts': { name: 'Andriy', gender: 'male' },
  // Vietnamese
  'vi_VN|25hours_single': { name: 'Linh', gender: 'female' },
  'vi_VN|vais1000': { name: 'Minh', gender: 'male' },
  'vi_VN|vivos': { name: 'Hoa', gender: 'female' },
};
