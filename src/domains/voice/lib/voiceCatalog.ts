// AUTO-GENERATED — do not edit by hand.
//
// Source: @mintplex-labs/piper-tts-web@1.0.5 dist/types.d.ts (the VoiceId union,
// which is the same set of ids the library's PATH_MAP can fetch).
// Regenerate with: npm run gen:voices
//
// 119 voices across 37 languages. The picker reads
// everything from here, so a dependency bump is a regeneration rather than a
// code change. Display names and gender tags are curated in voiceNames.ts —
// the generator hard-fails if any voice is missing from that mapping, if the
// mapping names a voice the library no longer ships, or if two speakers in one
// language share a display name.

export interface VoiceOption {
  /** Engine-facing id, e.g. "en_US-ryan-high". */
  id: string;
  /** Language-region code, e.g. "en_US". */
  lang: string;
  /** Human-readable language name, e.g. "English (United States)". */
  langName: string;
  /** Speaker slug as published, e.g. "ryan". */
  speaker: string;
  /** Curated display name, e.g. "Ryan" (from voiceNames.ts). */
  name: string;
  /** Voice gender for the picker's filter (from voiceNames.ts). */
  gender: "male" | "female";
  /** Quality tier as published. */
  quality: "x_low" | "low" | "medium" | "high";
  /** Display label for the quality tier. */
  qualityLabel: string;
}

export const VOICE_CATALOG: VoiceOption[] = [
  {"id":"en_US-ryan-medium","lang":"en_US","langName":"English (United States)","speaker":"ryan","name":"Ryan","gender":"male","quality":"medium","qualityLabel":"Standard"},
  {"id":"en_US-ryan-high","lang":"en_US","langName":"English (United States)","speaker":"ryan","name":"Ryan","gender":"male","quality":"high","qualityLabel":"High fidelity"},
  {"id":"en_US-amy-medium","lang":"en_US","langName":"English (United States)","speaker":"amy","name":"Amy","gender":"female","quality":"medium","qualityLabel":"Standard"},
  {"id":"en_US-lessac-medium","lang":"en_US","langName":"English (United States)","speaker":"lessac","name":"James","gender":"male","quality":"medium","qualityLabel":"Standard"},
  {"id":"en_US-hfc_female-medium","lang":"en_US","langName":"English (United States)","speaker":"hfc_female","name":"Sophia","gender":"female","quality":"medium","qualityLabel":"Standard"},
  {"id":"en_US-joe-medium","lang":"en_US","langName":"English (United States)","speaker":"joe","name":"Joe","gender":"male","quality":"medium","qualityLabel":"Standard"},
  {"id":"en_US-libritts_r-medium","lang":"en_US","langName":"English (United States)","speaker":"libritts_r","name":"Aiden","gender":"male","quality":"medium","qualityLabel":"Standard"},
  {"id":"en_US-amy-low","lang":"en_US","langName":"English (United States)","speaker":"amy","name":"Amy","gender":"female","quality":"low","qualityLabel":"Light"},
  {"id":"en_US-ljspeech-high","lang":"en_US","langName":"English (United States)","speaker":"ljspeech","name":"Ava","gender":"female","quality":"high","qualityLabel":"High fidelity"},
  {"id":"en_US-ljspeech-medium","lang":"en_US","langName":"English (United States)","speaker":"ljspeech","name":"Ava","gender":"female","quality":"medium","qualityLabel":"Standard"},
  {"id":"en_US-danny-low","lang":"en_US","langName":"English (United States)","speaker":"danny","name":"Danny","gender":"male","quality":"low","qualityLabel":"Light"},
  {"id":"en_US-libritts-high","lang":"en_US","langName":"English (United States)","speaker":"libritts","name":"Emma","gender":"female","quality":"high","qualityLabel":"High fidelity"},
  {"id":"en_US-hfc_male-medium","lang":"en_US","langName":"English (United States)","speaker":"hfc_male","name":"Ethan","gender":"male","quality":"medium","qualityLabel":"Standard"},
  {"id":"en_US-lessac-high","lang":"en_US","langName":"English (United States)","speaker":"lessac","name":"James","gender":"male","quality":"high","qualityLabel":"High fidelity"},
  {"id":"en_US-lessac-low","lang":"en_US","langName":"English (United States)","speaker":"lessac","name":"James","gender":"male","quality":"low","qualityLabel":"Light"},
  {"id":"en_US-kathleen-low","lang":"en_US","langName":"English (United States)","speaker":"kathleen","name":"Kathleen","gender":"female","quality":"low","qualityLabel":"Light"},
  {"id":"en_US-kristin-medium","lang":"en_US","langName":"English (United States)","speaker":"kristin","name":"Kristin","gender":"female","quality":"medium","qualityLabel":"Standard"},
  {"id":"en_US-l2arctic-medium","lang":"en_US","langName":"English (United States)","speaker":"l2arctic","name":"Leo","gender":"male","quality":"medium","qualityLabel":"Standard"},
  {"id":"en_US-kusal-medium","lang":"en_US","langName":"English (United States)","speaker":"kusal","name":"Marcus","gender":"male","quality":"medium","qualityLabel":"Standard"},
  {"id":"en_US-arctic-medium","lang":"en_US","langName":"English (United States)","speaker":"arctic","name":"Nathan","gender":"male","quality":"medium","qualityLabel":"Standard"},
  {"id":"en_US-ryan-low","lang":"en_US","langName":"English (United States)","speaker":"ryan","name":"Ryan","gender":"male","quality":"low","qualityLabel":"Light"},
  {"id":"en_GB-alba-medium","lang":"en_GB","langName":"English (United Kingdom)","speaker":"alba","name":"Alba","gender":"female","quality":"medium","qualityLabel":"Standard"},
  {"id":"en_GB-cori-high","lang":"en_GB","langName":"English (United Kingdom)","speaker":"cori","name":"Cori","gender":"female","quality":"high","qualityLabel":"High fidelity"},
  {"id":"en_GB-jenny_dioco-medium","lang":"en_GB","langName":"English (United Kingdom)","speaker":"jenny_dioco","name":"Jenny","gender":"female","quality":"medium","qualityLabel":"Standard"},
  {"id":"en_GB-northern_english_male-medium","lang":"en_GB","langName":"English (United Kingdom)","speaker":"northern_english_male","name":"Oliver","gender":"male","quality":"medium","qualityLabel":"Standard"},
  {"id":"en_GB-alan-low","lang":"en_GB","langName":"English (United Kingdom)","speaker":"alan","name":"Alan","gender":"male","quality":"low","qualityLabel":"Light"},
  {"id":"en_GB-alan-medium","lang":"en_GB","langName":"English (United Kingdom)","speaker":"alan","name":"Alan","gender":"male","quality":"medium","qualityLabel":"Standard"},
  {"id":"en_GB-cori-medium","lang":"en_GB","langName":"English (United Kingdom)","speaker":"cori","name":"Cori","gender":"female","quality":"medium","qualityLabel":"Standard"},
  {"id":"en_GB-aru-medium","lang":"en_GB","langName":"English (United Kingdom)","speaker":"aru","name":"Freddie","gender":"male","quality":"medium","qualityLabel":"Standard"},
  {"id":"en_GB-vctk-medium","lang":"en_GB","langName":"English (United Kingdom)","speaker":"vctk","name":"Henry","gender":"male","quality":"medium","qualityLabel":"Standard"},
  {"id":"en_GB-semaine-medium","lang":"en_GB","langName":"English (United Kingdom)","speaker":"semaine","name":"Isla","gender":"female","quality":"medium","qualityLabel":"Standard"},
  {"id":"en_GB-southern_english_female-low","lang":"en_GB","langName":"English (United Kingdom)","speaker":"southern_english_female","name":"Poppy","gender":"female","quality":"low","qualityLabel":"Light"},
  {"id":"ar_JO-kareem-low","lang":"ar_JO","langName":"Arabic (Jordan)","speaker":"kareem","name":"Kareem","gender":"male","quality":"low","qualityLabel":"Light"},
  {"id":"ar_JO-kareem-medium","lang":"ar_JO","langName":"Arabic (Jordan)","speaker":"kareem","name":"Kareem","gender":"male","quality":"medium","qualityLabel":"Standard"},
  {"id":"ca_ES-upc_ona-medium","lang":"ca_ES","langName":"Catalan (Spain)","speaker":"upc_ona","name":"Ona","gender":"female","quality":"medium","qualityLabel":"Standard"},
  {"id":"ca_ES-upc_ona-x_low","lang":"ca_ES","langName":"Catalan (Spain)","speaker":"upc_ona","name":"Ona","gender":"female","quality":"x_low","qualityLabel":"Very light"},
  {"id":"ca_ES-upc_pau-x_low","lang":"ca_ES","langName":"Catalan (Spain)","speaker":"upc_pau","name":"Pau","gender":"male","quality":"x_low","qualityLabel":"Very light"},
  {"id":"zh_CN-huayan-medium","lang":"zh_CN","langName":"Chinese (China)","speaker":"huayan","name":"Mei","gender":"female","quality":"medium","qualityLabel":"Standard"},
  {"id":"zh_CN-huayan-x_low","lang":"zh_CN","langName":"Chinese (China)","speaker":"huayan","name":"Mei","gender":"female","quality":"x_low","qualityLabel":"Very light"},
  {"id":"cs_CZ-jirka-low","lang":"cs_CZ","langName":"Czech (Czechia)","speaker":"jirka","name":"Jirka","gender":"male","quality":"low","qualityLabel":"Light"},
  {"id":"cs_CZ-jirka-medium","lang":"cs_CZ","langName":"Czech (Czechia)","speaker":"jirka","name":"Jirka","gender":"male","quality":"medium","qualityLabel":"Standard"},
  {"id":"da_DK-talesyntese-medium","lang":"da_DK","langName":"Danish (Denmark)","speaker":"talesyntese","name":"Freja","gender":"female","quality":"medium","qualityLabel":"Standard"},
  {"id":"nl_BE-rdh-medium","lang":"nl_BE","langName":"Dutch (Belgium)","speaker":"rdh","name":"Bram","gender":"male","quality":"medium","qualityLabel":"Standard"},
  {"id":"nl_BE-rdh-x_low","lang":"nl_BE","langName":"Dutch (Belgium)","speaker":"rdh","name":"Bram","gender":"male","quality":"x_low","qualityLabel":"Very light"},
  {"id":"nl_BE-nathalie-medium","lang":"nl_BE","langName":"Dutch (Belgium)","speaker":"nathalie","name":"Nathalie","gender":"female","quality":"medium","qualityLabel":"Standard"},
  {"id":"nl_BE-nathalie-x_low","lang":"nl_BE","langName":"Dutch (Belgium)","speaker":"nathalie","name":"Nathalie","gender":"female","quality":"x_low","qualityLabel":"Very light"},
  {"id":"nl_NL-mls-medium","lang":"nl_NL","langName":"Dutch (Netherlands)","speaker":"mls","name":"Daan","gender":"male","quality":"medium","qualityLabel":"Standard"},
  {"id":"nl_NL-mls_7432-low","lang":"nl_NL","langName":"Dutch (Netherlands)","speaker":"mls_7432","name":"Lars","gender":"male","quality":"low","qualityLabel":"Light"},
  {"id":"nl_NL-mls_5809-low","lang":"nl_NL","langName":"Dutch (Netherlands)","speaker":"mls_5809","name":"Sanne","gender":"female","quality":"low","qualityLabel":"Light"},
  {"id":"fi_FI-harri-low","lang":"fi_FI","langName":"Finnish (Finland)","speaker":"harri","name":"Harri","gender":"male","quality":"low","qualityLabel":"Light"},
  {"id":"fi_FI-harri-medium","lang":"fi_FI","langName":"Finnish (Finland)","speaker":"harri","name":"Harri","gender":"male","quality":"medium","qualityLabel":"Standard"},
  {"id":"fr_FR-upmc-medium","lang":"fr_FR","langName":"French (France)","speaker":"upmc","name":"Antoine","gender":"male","quality":"medium","qualityLabel":"Standard"},
  {"id":"fr_FR-mls-medium","lang":"fr_FR","langName":"French (France)","speaker":"mls","name":"Camille","gender":"female","quality":"medium","qualityLabel":"Standard"},
  {"id":"fr_FR-siwis-low","lang":"fr_FR","langName":"French (France)","speaker":"siwis","name":"Élodie","gender":"female","quality":"low","qualityLabel":"Light"},
  {"id":"fr_FR-siwis-medium","lang":"fr_FR","langName":"French (France)","speaker":"siwis","name":"Élodie","gender":"female","quality":"medium","qualityLabel":"Standard"},
  {"id":"fr_FR-gilles-low","lang":"fr_FR","langName":"French (France)","speaker":"gilles","name":"Gilles","gender":"male","quality":"low","qualityLabel":"Light"},
  {"id":"fr_FR-mls_1840-low","lang":"fr_FR","langName":"French (France)","speaker":"mls_1840","name":"Julien","gender":"male","quality":"low","qualityLabel":"Light"},
  {"id":"fr_FR-tom-medium","lang":"fr_FR","langName":"French (France)","speaker":"tom","name":"Tom","gender":"male","quality":"medium","qualityLabel":"Standard"},
  {"id":"ka_GE-natia-medium","lang":"ka_GE","langName":"Georgian (Georgia)","speaker":"natia","name":"Natia","gender":"female","quality":"medium","qualityLabel":"Standard"},
  {"id":"de_DE-mls-medium","lang":"de_DE","langName":"German (Germany)","speaker":"mls","name":"Anna","gender":"female","quality":"medium","qualityLabel":"Standard"},
  {"id":"de_DE-eva_k-x_low","lang":"de_DE","langName":"German (Germany)","speaker":"eva_k","name":"Eva","gender":"female","quality":"x_low","qualityLabel":"Very light"},
  {"id":"de_DE-pavoque-low","lang":"de_DE","langName":"German (Germany)","speaker":"pavoque","name":"Felix","gender":"male","quality":"low","qualityLabel":"Light"},
  {"id":"de_DE-kerstin-low","lang":"de_DE","langName":"German (Germany)","speaker":"kerstin","name":"Kerstin","gender":"female","quality":"low","qualityLabel":"Light"},
  {"id":"de_DE-karlsson-low","lang":"de_DE","langName":"German (Germany)","speaker":"karlsson","name":"Lukas","gender":"male","quality":"low","qualityLabel":"Light"},
  {"id":"de_DE-ramona-low","lang":"de_DE","langName":"German (Germany)","speaker":"ramona","name":"Ramona","gender":"female","quality":"low","qualityLabel":"Light"},
  {"id":"de_DE-thorsten-high","lang":"de_DE","langName":"German (Germany)","speaker":"thorsten","name":"Thorsten","gender":"male","quality":"high","qualityLabel":"High fidelity"},
  {"id":"de_DE-thorsten-low","lang":"de_DE","langName":"German (Germany)","speaker":"thorsten","name":"Thorsten","gender":"male","quality":"low","qualityLabel":"Light"},
  {"id":"de_DE-thorsten-medium","lang":"de_DE","langName":"German (Germany)","speaker":"thorsten","name":"Thorsten","gender":"male","quality":"medium","qualityLabel":"Standard"},
  {"id":"de_DE-thorsten_emotional-medium","lang":"de_DE","langName":"German (Germany)","speaker":"thorsten_emotional","name":"Thorsten (Emotional)","gender":"male","quality":"medium","qualityLabel":"Standard"},
  {"id":"el_GR-rapunzelina-low","lang":"el_GR","langName":"Greek (Greece)","speaker":"rapunzelina","name":"Elena","gender":"female","quality":"low","qualityLabel":"Light"},
  {"id":"hu_HU-anna-medium","lang":"hu_HU","langName":"Hungarian (Hungary)","speaker":"anna","name":"Anna","gender":"female","quality":"medium","qualityLabel":"Standard"},
  {"id":"hu_HU-berta-medium","lang":"hu_HU","langName":"Hungarian (Hungary)","speaker":"berta","name":"Berta","gender":"female","quality":"medium","qualityLabel":"Standard"},
  {"id":"hu_HU-imre-medium","lang":"hu_HU","langName":"Hungarian (Hungary)","speaker":"imre","name":"Imre","gender":"male","quality":"medium","qualityLabel":"Standard"},
  {"id":"is_IS-bui-medium","lang":"is_IS","langName":"Icelandic (Iceland)","speaker":"bui","name":"Búi","gender":"male","quality":"medium","qualityLabel":"Standard"},
  {"id":"is_IS-salka-medium","lang":"is_IS","langName":"Icelandic (Iceland)","speaker":"salka","name":"Salka","gender":"female","quality":"medium","qualityLabel":"Standard"},
  {"id":"is_IS-steinn-medium","lang":"is_IS","langName":"Icelandic (Iceland)","speaker":"steinn","name":"Steinn","gender":"male","quality":"medium","qualityLabel":"Standard"},
  {"id":"is_IS-ugla-medium","lang":"is_IS","langName":"Icelandic (Iceland)","speaker":"ugla","name":"Ugla","gender":"female","quality":"medium","qualityLabel":"Standard"},
  {"id":"it_IT-riccardo-x_low","lang":"it_IT","langName":"Italian (Italy)","speaker":"riccardo","name":"Riccardo","gender":"male","quality":"x_low","qualityLabel":"Very light"},
  {"id":"kk_KZ-issai-high","lang":"kk_KZ","langName":"Kazakh (Kazakhstan)","speaker":"issai","name":"Aigerim","gender":"female","quality":"high","qualityLabel":"High fidelity"},
  {"id":"kk_KZ-iseke-x_low","lang":"kk_KZ","langName":"Kazakh (Kazakhstan)","speaker":"iseke","name":"Iseke","gender":"male","quality":"x_low","qualityLabel":"Very light"},
  {"id":"kk_KZ-raya-x_low","lang":"kk_KZ","langName":"Kazakh (Kazakhstan)","speaker":"raya","name":"Raya","gender":"female","quality":"x_low","qualityLabel":"Very light"},
  {"id":"lb_LU-marylux-medium","lang":"lb_LU","langName":"Luxembourgish (Luxembourg)","speaker":"marylux","name":"Tessy","gender":"female","quality":"medium","qualityLabel":"Standard"},
  {"id":"ne_NP-google-medium","lang":"ne_NP","langName":"Nepali (Nepal)","speaker":"google","name":"Sita","gender":"female","quality":"medium","qualityLabel":"Standard"},
  {"id":"ne_NP-google-x_low","lang":"ne_NP","langName":"Nepali (Nepal)","speaker":"google","name":"Sita","gender":"female","quality":"x_low","qualityLabel":"Very light"},
  {"id":"no_NO-talesyntese-medium","lang":"no_NO","langName":"Norwegian (Norway)","speaker":"talesyntese","name":"Magnus","gender":"male","quality":"medium","qualityLabel":"Standard"},
  {"id":"fa_IR-amir-medium","lang":"fa_IR","langName":"Persian (Iran)","speaker":"amir","name":"Amir","gender":"male","quality":"medium","qualityLabel":"Standard"},
  {"id":"fa_IR-gyro-medium","lang":"fa_IR","langName":"Persian (Iran)","speaker":"gyro","name":"Yasmin","gender":"female","quality":"medium","qualityLabel":"Standard"},
  {"id":"pl_PL-gosia-medium","lang":"pl_PL","langName":"Polish (Poland)","speaker":"gosia","name":"Gosia","gender":"female","quality":"medium","qualityLabel":"Standard"},
  {"id":"pl_PL-darkman-medium","lang":"pl_PL","langName":"Polish (Poland)","speaker":"darkman","name":"Marek","gender":"male","quality":"medium","qualityLabel":"Standard"},
  {"id":"pl_PL-mls_6892-low","lang":"pl_PL","langName":"Polish (Poland)","speaker":"mls_6892","name":"Ola","gender":"female","quality":"low","qualityLabel":"Light"},
  {"id":"pl_PL-mc_speech-medium","lang":"pl_PL","langName":"Polish (Poland)","speaker":"mc_speech","name":"Tomasz","gender":"male","quality":"medium","qualityLabel":"Standard"},
  {"id":"pt_BR-faber-medium","lang":"pt_BR","langName":"Portuguese (Brazil)","speaker":"faber","name":"Camila","gender":"female","quality":"medium","qualityLabel":"Standard"},
  {"id":"pt_BR-edresson-low","lang":"pt_BR","langName":"Portuguese (Brazil)","speaker":"edresson","name":"Edresson","gender":"male","quality":"low","qualityLabel":"Light"},
  {"id":"pt_PT-tugão-medium","lang":"pt_PT","langName":"Portuguese (Portugal)","speaker":"tugão","name":"Tiago","gender":"male","quality":"medium","qualityLabel":"Standard"},
  {"id":"ro_RO-mihai-medium","lang":"ro_RO","langName":"Romanian (Romania)","speaker":"mihai","name":"Mihai","gender":"male","quality":"medium","qualityLabel":"Standard"},
  {"id":"ru_RU-denis-medium","lang":"ru_RU","langName":"Russian (Russia)","speaker":"denis","name":"Denis","gender":"male","quality":"medium","qualityLabel":"Standard"},
  {"id":"ru_RU-dmitri-medium","lang":"ru_RU","langName":"Russian (Russia)","speaker":"dmitri","name":"Dmitri","gender":"male","quality":"medium","qualityLabel":"Standard"},
  {"id":"ru_RU-irina-medium","lang":"ru_RU","langName":"Russian (Russia)","speaker":"irina","name":"Irina","gender":"female","quality":"medium","qualityLabel":"Standard"},
  {"id":"ru_RU-ruslan-medium","lang":"ru_RU","langName":"Russian (Russia)","speaker":"ruslan","name":"Ruslan","gender":"male","quality":"medium","qualityLabel":"Standard"},
  {"id":"sr_RS-serbski_institut-medium","lang":"sr_RS","langName":"Serbian (Serbia)","speaker":"serbski_institut","name":"Milica","gender":"female","quality":"medium","qualityLabel":"Standard"},
  {"id":"sk_SK-lili-medium","lang":"sk_SK","langName":"Slovak (Slovakia)","speaker":"lili","name":"Lili","gender":"female","quality":"medium","qualityLabel":"Standard"},
  {"id":"sl_SI-artur-medium","lang":"sl_SI","langName":"Slovenian (Slovenia)","speaker":"artur","name":"Artur","gender":"male","quality":"medium","qualityLabel":"Standard"},
  {"id":"es_MX-claude-high","lang":"es_MX","langName":"Spanish (Mexico)","speaker":"claude","name":"Santiago","gender":"male","quality":"high","qualityLabel":"High fidelity"},
  {"id":"es_MX-ald-medium","lang":"es_MX","langName":"Spanish (Mexico)","speaker":"ald","name":"Valentina","gender":"female","quality":"medium","qualityLabel":"Standard"},
  {"id":"es_ES-carlfm-x_low","lang":"es_ES","langName":"Spanish (Spain)","speaker":"carlfm","name":"Carlos","gender":"male","quality":"x_low","qualityLabel":"Very light"},
  {"id":"es_ES-mls_9972-low","lang":"es_ES","langName":"Spanish (Spain)","speaker":"mls_9972","name":"Elena","gender":"female","quality":"low","qualityLabel":"Light"},
  {"id":"es_ES-mls_10246-low","lang":"es_ES","langName":"Spanish (Spain)","speaker":"mls_10246","name":"Javier","gender":"male","quality":"low","qualityLabel":"Light"},
  {"id":"es_ES-davefx-medium","lang":"es_ES","langName":"Spanish (Spain)","speaker":"davefx","name":"Lucía","gender":"female","quality":"medium","qualityLabel":"Standard"},
  {"id":"es_ES-sharvard-medium","lang":"es_ES","langName":"Spanish (Spain)","speaker":"sharvard","name":"Mateo","gender":"male","quality":"medium","qualityLabel":"Standard"},
  {"id":"sw_CD-lanfrica-medium","lang":"sw_CD","langName":"Swahili (DR Congo)","speaker":"lanfrica","name":"Amani","gender":"female","quality":"medium","qualityLabel":"Standard"},
  {"id":"sv_SE-nst-medium","lang":"sv_SE","langName":"Swedish (Sweden)","speaker":"nst","name":"Erik","gender":"male","quality":"medium","qualityLabel":"Standard"},
  {"id":"tr_TR-dfki-medium","lang":"tr_TR","langName":"Turkish (Türkiye)","speaker":"dfki","name":"Elif","gender":"female","quality":"medium","qualityLabel":"Standard"},
  {"id":"tr_TR-fahrettin-medium","lang":"tr_TR","langName":"Turkish (Türkiye)","speaker":"fahrettin","name":"Fahrettin","gender":"male","quality":"medium","qualityLabel":"Standard"},
  {"id":"tr_TR-fettah-medium","lang":"tr_TR","langName":"Turkish (Türkiye)","speaker":"fettah","name":"Fettah","gender":"male","quality":"medium","qualityLabel":"Standard"},
  {"id":"uk_UA-ukrainian_tts-medium","lang":"uk_UA","langName":"Ukrainian (Ukraine)","speaker":"ukrainian_tts","name":"Andriy","gender":"male","quality":"medium","qualityLabel":"Standard"},
  {"id":"uk_UA-lada-x_low","lang":"uk_UA","langName":"Ukrainian (Ukraine)","speaker":"lada","name":"Lada","gender":"female","quality":"x_low","qualityLabel":"Very light"},
  {"id":"vi_VN-vivos-x_low","lang":"vi_VN","langName":"Vietnamese (Vietnam)","speaker":"vivos","name":"Hoa","gender":"female","quality":"x_low","qualityLabel":"Very light"},
  {"id":"vi_VN-25hours_single-low","lang":"vi_VN","langName":"Vietnamese (Vietnam)","speaker":"25hours_single","name":"Linh","gender":"female","quality":"low","qualityLabel":"Light"},
  {"id":"vi_VN-vais1000-medium","lang":"vi_VN","langName":"Vietnamese (Vietnam)","speaker":"vais1000","name":"Minh","gender":"male","quality":"medium","qualityLabel":"Standard"},
];

export interface VoiceLanguage {
  /** Language-region code, e.g. "en_GB". */
  code: string;
  /** Display label, e.g. "English (United Kingdom)". */
  label: string;
  voiceCount: number;
}

/**
 * Every language the installed engine can synthesize, English first (the
 * featured accents) and alphabetical after that.
 */
export const VOICE_LANGUAGES: VoiceLanguage[] = [
  { code: "en_US", label: "English (United States)", voiceCount: 21 },
  { code: "en_GB", label: "English (United Kingdom)", voiceCount: 11 },
  { code: "ar_JO", label: "Arabic (Jordan)", voiceCount: 2 },
  { code: "ca_ES", label: "Catalan (Spain)", voiceCount: 3 },
  { code: "zh_CN", label: "Chinese (China)", voiceCount: 2 },
  { code: "cs_CZ", label: "Czech (Czechia)", voiceCount: 2 },
  { code: "da_DK", label: "Danish (Denmark)", voiceCount: 1 },
  { code: "nl_BE", label: "Dutch (Belgium)", voiceCount: 4 },
  { code: "nl_NL", label: "Dutch (Netherlands)", voiceCount: 3 },
  { code: "fi_FI", label: "Finnish (Finland)", voiceCount: 2 },
  { code: "fr_FR", label: "French (France)", voiceCount: 7 },
  { code: "ka_GE", label: "Georgian (Georgia)", voiceCount: 1 },
  { code: "de_DE", label: "German (Germany)", voiceCount: 10 },
  { code: "el_GR", label: "Greek (Greece)", voiceCount: 1 },
  { code: "hu_HU", label: "Hungarian (Hungary)", voiceCount: 3 },
  { code: "is_IS", label: "Icelandic (Iceland)", voiceCount: 4 },
  { code: "it_IT", label: "Italian (Italy)", voiceCount: 1 },
  { code: "kk_KZ", label: "Kazakh (Kazakhstan)", voiceCount: 3 },
  { code: "lb_LU", label: "Luxembourgish (Luxembourg)", voiceCount: 1 },
  { code: "ne_NP", label: "Nepali (Nepal)", voiceCount: 2 },
  { code: "no_NO", label: "Norwegian (Norway)", voiceCount: 1 },
  { code: "fa_IR", label: "Persian (Iran)", voiceCount: 2 },
  { code: "pl_PL", label: "Polish (Poland)", voiceCount: 4 },
  { code: "pt_BR", label: "Portuguese (Brazil)", voiceCount: 2 },
  { code: "pt_PT", label: "Portuguese (Portugal)", voiceCount: 1 },
  { code: "ro_RO", label: "Romanian (Romania)", voiceCount: 1 },
  { code: "ru_RU", label: "Russian (Russia)", voiceCount: 4 },
  { code: "sr_RS", label: "Serbian (Serbia)", voiceCount: 1 },
  { code: "sk_SK", label: "Slovak (Slovakia)", voiceCount: 1 },
  { code: "sl_SI", label: "Slovenian (Slovenia)", voiceCount: 1 },
  { code: "es_MX", label: "Spanish (Mexico)", voiceCount: 2 },
  { code: "es_ES", label: "Spanish (Spain)", voiceCount: 5 },
  { code: "sw_CD", label: "Swahili (DR Congo)", voiceCount: 1 },
  { code: "sv_SE", label: "Swedish (Sweden)", voiceCount: 1 },
  { code: "tr_TR", label: "Turkish (Türkiye)", voiceCount: 3 },
  { code: "uk_UA", label: "Ukrainian (Ukraine)", voiceCount: 2 },
  { code: "vi_VN", label: "Vietnamese (Vietnam)", voiceCount: 3 },
];

/**
 * English-first shortlist shown at the top of a language's voice list.
 * All ids are guaranteed to exist in VOICE_CATALOG (the generator fails
 * otherwise).
 */
export const FEATURED_VOICE_IDS: string[] = [
  "en_US-ryan-medium",
  "en_US-ryan-high",
  "en_US-amy-medium",
  "en_US-lessac-medium",
  "en_US-hfc_female-medium",
  "en_US-joe-medium",
  "en_US-libritts_r-medium",
  "en_GB-alba-medium",
  "en_GB-cori-high",
  "en_GB-jenny_dioco-medium",
  "en_GB-northern_english_male-medium",
];

export const VOICE_COUNT = VOICE_CATALOG.length;
export const LANGUAGE_COUNT = VOICE_LANGUAGES.length;

/** Initial picker value — the flagship US male voice at standard quality. */
export const DEFAULT_VOICE_ID = FEATURED_VOICE_IDS[0];

export function voicesForLanguage(code: string): VoiceOption[] {
  return VOICE_CATALOG.filter((voice) => voice.lang === code);
}

export function findVoice(id: string): VoiceOption | undefined {
  return VOICE_CATALOG.find((voice) => voice.id === id);
}

export function isFeaturedVoice(id: string): boolean {
  return FEATURED_VOICE_IDS.includes(id);
}
