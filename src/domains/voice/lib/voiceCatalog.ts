// AUTO-GENERATED — do not edit by hand.
//
// Source: @mintplex-labs/piper-tts-web@1.0.5 — the VoiceId union
// (dist/types.d.ts) unioned with the engine's PATH_MAP keys (dist/piper-tts-web.js),
// which is the authoritative set of ids the installed version can fetch.
// Regenerate with: npm run gen:voices
//
// 124 voices across 38 languages. The picker reads
// everything from here, so a dependency bump is a regeneration rather than a
// code change. Display names and gender tags are curated in voiceNames.ts —
// the generator hard-fails if any voice is missing from that mapping, if the
// mapping names a voice the library no longer ships, or if two speakers in one
// language share a display name.
//
// speed and secondsPer1000Chars are derived from the quality tier and are
// PROVISIONAL placeholders awaiting measurement. The quality tier is stored as
// its key alone: the words shown for it and the order it sorts in belong to
// voicePresentation.ts.

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
  /**
   * Curated voice gender (from voiceNames.ts), or null when it is unknown.
   * Null means "not recorded", never a guess, and is rendered as a label with
   * no parenthetical.
   */
  gender: "male" | "female" | null;
  /**
   * Relative speed tier, derived from the quality tier.
   *
   * PROVISIONAL — TODO: replace with measured values. Only the ordering is
   * meaningful; see SPEED_BY_QUALITY in scripts/generate-voice-catalog.mjs.
   */
  speed: "fast" | "normal" | "slow";
  /**
   * Rough synthesis time per 1000 characters, in seconds.
   *
   * PROVISIONAL — TODO: replace with measured values. Not a measurement; see
   * SECONDS_PER_1000_CHARS_BY_QUALITY in scripts/generate-voice-catalog.mjs.
   */
  secondsPer1000Chars: number;
  /**
   * Quality tier as published — a key, never a label. There is deliberately no
   * qualityLabel field: the display names and their order live in
   * voicePresentation.ts, so a rename cannot leave a stale word in the picker.
   */
  quality: "x_low" | "low" | "medium" | "high";
}

export const VOICE_CATALOG: VoiceOption[] = [
  {"id":"en_US-ryan-medium","lang":"en_US","langName":"English (United States)","speaker":"ryan","name":"Ryan","gender":"male","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"en_US-ryan-high","lang":"en_US","langName":"English (United States)","speaker":"ryan","name":"Ryan","gender":"male","speed":"slow","secondsPer1000Chars":20,"quality":"high"},
  {"id":"en_US-amy-medium","lang":"en_US","langName":"English (United States)","speaker":"amy","name":"Amy","gender":"female","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"en_US-lessac-medium","lang":"en_US","langName":"English (United States)","speaker":"lessac","name":"James","gender":"male","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"en_US-hfc_female-medium","lang":"en_US","langName":"English (United States)","speaker":"hfc_female","name":"Sophia","gender":"female","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"en_US-joe-medium","lang":"en_US","langName":"English (United States)","speaker":"joe","name":"Joe","gender":"male","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"en_US-libritts_r-medium","lang":"en_US","langName":"English (United States)","speaker":"libritts_r","name":"Aiden","gender":"male","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"en_US-amy-low","lang":"en_US","langName":"English (United States)","speaker":"amy","name":"Amy","gender":"female","speed":"fast","secondsPer1000Chars":3,"quality":"low"},
  {"id":"en_US-ljspeech-high","lang":"en_US","langName":"English (United States)","speaker":"ljspeech","name":"Ava","gender":"female","speed":"slow","secondsPer1000Chars":20,"quality":"high"},
  {"id":"en_US-ljspeech-medium","lang":"en_US","langName":"English (United States)","speaker":"ljspeech","name":"Ava","gender":"female","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"en_US-bryce-medium","lang":"en_US","langName":"English (United States)","speaker":"bryce","name":"Bryce","gender":"male","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"en_US-danny-low","lang":"en_US","langName":"English (United States)","speaker":"danny","name":"Danny","gender":"male","speed":"fast","secondsPer1000Chars":3,"quality":"low"},
  {"id":"en_US-libritts-high","lang":"en_US","langName":"English (United States)","speaker":"libritts","name":"Emma","gender":"female","speed":"slow","secondsPer1000Chars":20,"quality":"high"},
  {"id":"en_US-hfc_male-medium","lang":"en_US","langName":"English (United States)","speaker":"hfc_male","name":"Ethan","gender":"male","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"en_US-lessac-high","lang":"en_US","langName":"English (United States)","speaker":"lessac","name":"James","gender":"male","speed":"slow","secondsPer1000Chars":20,"quality":"high"},
  {"id":"en_US-lessac-low","lang":"en_US","langName":"English (United States)","speaker":"lessac","name":"James","gender":"male","speed":"fast","secondsPer1000Chars":3,"quality":"low"},
  {"id":"en_US-john-medium","lang":"en_US","langName":"English (United States)","speaker":"john","name":"John","gender":"male","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"en_US-kathleen-low","lang":"en_US","langName":"English (United States)","speaker":"kathleen","name":"Kathleen","gender":"female","speed":"fast","secondsPer1000Chars":3,"quality":"low"},
  {"id":"en_US-kristin-medium","lang":"en_US","langName":"English (United States)","speaker":"kristin","name":"Kristin","gender":"female","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"en_US-l2arctic-medium","lang":"en_US","langName":"English (United States)","speaker":"l2arctic","name":"Leo","gender":"male","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"en_US-kusal-medium","lang":"en_US","langName":"English (United States)","speaker":"kusal","name":"Marcus","gender":"male","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"en_US-arctic-medium","lang":"en_US","langName":"English (United States)","speaker":"arctic","name":"Nathan","gender":"male","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"en_US-norman-medium","lang":"en_US","langName":"English (United States)","speaker":"norman","name":"Norman","gender":"male","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"en_US-ryan-low","lang":"en_US","langName":"English (United States)","speaker":"ryan","name":"Ryan","gender":"male","speed":"fast","secondsPer1000Chars":3,"quality":"low"},
  {"id":"en_GB-alba-medium","lang":"en_GB","langName":"English (United Kingdom)","speaker":"alba","name":"Alba","gender":"female","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"en_GB-cori-high","lang":"en_GB","langName":"English (United Kingdom)","speaker":"cori","name":"Cori","gender":"female","speed":"slow","secondsPer1000Chars":20,"quality":"high"},
  {"id":"en_GB-jenny_dioco-medium","lang":"en_GB","langName":"English (United Kingdom)","speaker":"jenny_dioco","name":"Jenny","gender":"female","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"en_GB-northern_english_male-medium","lang":"en_GB","langName":"English (United Kingdom)","speaker":"northern_english_male","name":"Oliver","gender":"male","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"en_GB-alan-medium","lang":"en_GB","langName":"English (United Kingdom)","speaker":"alan","name":"Alan","gender":"male","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"en_GB-alan-low","lang":"en_GB","langName":"English (United Kingdom)","speaker":"alan","name":"Alan","gender":"male","speed":"fast","secondsPer1000Chars":3,"quality":"low"},
  {"id":"en_GB-cori-medium","lang":"en_GB","langName":"English (United Kingdom)","speaker":"cori","name":"Cori","gender":"female","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"en_GB-aru-medium","lang":"en_GB","langName":"English (United Kingdom)","speaker":"aru","name":"Freddie","gender":"male","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"en_GB-vctk-medium","lang":"en_GB","langName":"English (United Kingdom)","speaker":"vctk","name":"Henry","gender":"male","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"en_GB-semaine-medium","lang":"en_GB","langName":"English (United Kingdom)","speaker":"semaine","name":"Isla","gender":"female","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"en_GB-southern_english_female-low","lang":"en_GB","langName":"English (United Kingdom)","speaker":"southern_english_female","name":"Poppy","gender":"female","speed":"fast","secondsPer1000Chars":3,"quality":"low"},
  {"id":"ar_JO-kareem-medium","lang":"ar_JO","langName":"Arabic (Jordan)","speaker":"kareem","name":"Kareem","gender":"male","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"ar_JO-kareem-low","lang":"ar_JO","langName":"Arabic (Jordan)","speaker":"kareem","name":"Kareem","gender":"male","speed":"fast","secondsPer1000Chars":3,"quality":"low"},
  {"id":"ca_ES-upc_ona-medium","lang":"ca_ES","langName":"Catalan (Spain)","speaker":"upc_ona","name":"Ona","gender":"female","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"ca_ES-upc_ona-x_low","lang":"ca_ES","langName":"Catalan (Spain)","speaker":"upc_ona","name":"Ona","gender":"female","speed":"fast","secondsPer1000Chars":3,"quality":"x_low"},
  {"id":"ca_ES-upc_pau-x_low","lang":"ca_ES","langName":"Catalan (Spain)","speaker":"upc_pau","name":"Pau","gender":"male","speed":"fast","secondsPer1000Chars":3,"quality":"x_low"},
  {"id":"zh_CN-huayan-medium","lang":"zh_CN","langName":"Chinese (China)","speaker":"huayan","name":"Mei","gender":"female","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"zh_CN-huayan-x_low","lang":"zh_CN","langName":"Chinese (China)","speaker":"huayan","name":"Mei","gender":"female","speed":"fast","secondsPer1000Chars":3,"quality":"x_low"},
  {"id":"cs_CZ-jirka-medium","lang":"cs_CZ","langName":"Czech (Czechia)","speaker":"jirka","name":"Jirka","gender":"male","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"cs_CZ-jirka-low","lang":"cs_CZ","langName":"Czech (Czechia)","speaker":"jirka","name":"Jirka","gender":"male","speed":"fast","secondsPer1000Chars":3,"quality":"low"},
  {"id":"da_DK-talesyntese-medium","lang":"da_DK","langName":"Danish (Denmark)","speaker":"talesyntese","name":"Freja","gender":"female","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"nl_BE-rdh-medium","lang":"nl_BE","langName":"Dutch (Belgium)","speaker":"rdh","name":"Bram","gender":"male","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"nl_BE-rdh-x_low","lang":"nl_BE","langName":"Dutch (Belgium)","speaker":"rdh","name":"Bram","gender":"male","speed":"fast","secondsPer1000Chars":3,"quality":"x_low"},
  {"id":"nl_BE-nathalie-medium","lang":"nl_BE","langName":"Dutch (Belgium)","speaker":"nathalie","name":"Nathalie","gender":"female","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"nl_BE-nathalie-x_low","lang":"nl_BE","langName":"Dutch (Belgium)","speaker":"nathalie","name":"Nathalie","gender":"female","speed":"fast","secondsPer1000Chars":3,"quality":"x_low"},
  {"id":"nl_NL-mls-medium","lang":"nl_NL","langName":"Dutch (Netherlands)","speaker":"mls","name":"Daan","gender":"male","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"nl_NL-mls_7432-low","lang":"nl_NL","langName":"Dutch (Netherlands)","speaker":"mls_7432","name":"Lars","gender":"male","speed":"fast","secondsPer1000Chars":3,"quality":"low"},
  {"id":"nl_NL-mls_5809-low","lang":"nl_NL","langName":"Dutch (Netherlands)","speaker":"mls_5809","name":"Sanne","gender":"female","speed":"fast","secondsPer1000Chars":3,"quality":"low"},
  {"id":"fi_FI-harri-medium","lang":"fi_FI","langName":"Finnish (Finland)","speaker":"harri","name":"Harri","gender":"male","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"fi_FI-harri-low","lang":"fi_FI","langName":"Finnish (Finland)","speaker":"harri","name":"Harri","gender":"male","speed":"fast","secondsPer1000Chars":3,"quality":"low"},
  {"id":"fr_FR-upmc-medium","lang":"fr_FR","langName":"French (France)","speaker":"upmc","name":"Antoine","gender":"male","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"fr_FR-mls-medium","lang":"fr_FR","langName":"French (France)","speaker":"mls","name":"Camille","gender":"female","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"fr_FR-siwis-medium","lang":"fr_FR","langName":"French (France)","speaker":"siwis","name":"Élodie","gender":"female","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"fr_FR-siwis-low","lang":"fr_FR","langName":"French (France)","speaker":"siwis","name":"Élodie","gender":"female","speed":"fast","secondsPer1000Chars":3,"quality":"low"},
  {"id":"fr_FR-gilles-low","lang":"fr_FR","langName":"French (France)","speaker":"gilles","name":"Gilles","gender":"male","speed":"fast","secondsPer1000Chars":3,"quality":"low"},
  {"id":"fr_FR-mls_1840-low","lang":"fr_FR","langName":"French (France)","speaker":"mls_1840","name":"Julien","gender":"male","speed":"fast","secondsPer1000Chars":3,"quality":"low"},
  {"id":"fr_FR-tom-medium","lang":"fr_FR","langName":"French (France)","speaker":"tom","name":"Tom","gender":"male","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"ka_GE-natia-medium","lang":"ka_GE","langName":"Georgian (Georgia)","speaker":"natia","name":"Natia","gender":"female","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"de_DE-mls-medium","lang":"de_DE","langName":"German (Germany)","speaker":"mls","name":"Anna","gender":"female","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"de_DE-eva_k-x_low","lang":"de_DE","langName":"German (Germany)","speaker":"eva_k","name":"Eva","gender":"female","speed":"fast","secondsPer1000Chars":3,"quality":"x_low"},
  {"id":"de_DE-pavoque-low","lang":"de_DE","langName":"German (Germany)","speaker":"pavoque","name":"Felix","gender":"male","speed":"fast","secondsPer1000Chars":3,"quality":"low"},
  {"id":"de_DE-kerstin-low","lang":"de_DE","langName":"German (Germany)","speaker":"kerstin","name":"Kerstin","gender":"female","speed":"fast","secondsPer1000Chars":3,"quality":"low"},
  {"id":"de_DE-karlsson-low","lang":"de_DE","langName":"German (Germany)","speaker":"karlsson","name":"Lukas","gender":"male","speed":"fast","secondsPer1000Chars":3,"quality":"low"},
  {"id":"de_DE-ramona-low","lang":"de_DE","langName":"German (Germany)","speaker":"ramona","name":"Ramona","gender":"female","speed":"fast","secondsPer1000Chars":3,"quality":"low"},
  {"id":"de_DE-thorsten-high","lang":"de_DE","langName":"German (Germany)","speaker":"thorsten","name":"Thorsten","gender":"male","speed":"slow","secondsPer1000Chars":20,"quality":"high"},
  {"id":"de_DE-thorsten-medium","lang":"de_DE","langName":"German (Germany)","speaker":"thorsten","name":"Thorsten","gender":"male","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"de_DE-thorsten-low","lang":"de_DE","langName":"German (Germany)","speaker":"thorsten","name":"Thorsten","gender":"male","speed":"fast","secondsPer1000Chars":3,"quality":"low"},
  {"id":"de_DE-thorsten_emotional-medium","lang":"de_DE","langName":"German (Germany)","speaker":"thorsten_emotional","name":"Thorsten (Emotional)","gender":"male","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"el_GR-rapunzelina-low","lang":"el_GR","langName":"Greek (Greece)","speaker":"rapunzelina","name":"Elena","gender":"female","speed":"fast","secondsPer1000Chars":3,"quality":"low"},
  {"id":"hu_HU-anna-medium","lang":"hu_HU","langName":"Hungarian (Hungary)","speaker":"anna","name":"Anna","gender":"female","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"hu_HU-berta-medium","lang":"hu_HU","langName":"Hungarian (Hungary)","speaker":"berta","name":"Berta","gender":"female","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"hu_HU-imre-medium","lang":"hu_HU","langName":"Hungarian (Hungary)","speaker":"imre","name":"Imre","gender":"male","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"is_IS-bui-medium","lang":"is_IS","langName":"Icelandic (Iceland)","speaker":"bui","name":"Búi","gender":"male","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"is_IS-salka-medium","lang":"is_IS","langName":"Icelandic (Iceland)","speaker":"salka","name":"Salka","gender":"female","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"is_IS-steinn-medium","lang":"is_IS","langName":"Icelandic (Iceland)","speaker":"steinn","name":"Steinn","gender":"male","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"is_IS-ugla-medium","lang":"is_IS","langName":"Icelandic (Iceland)","speaker":"ugla","name":"Ugla","gender":"female","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"it_IT-paola-medium","lang":"it_IT","langName":"Italian (Italy)","speaker":"paola","name":"Paola","gender":"female","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"it_IT-riccardo-x_low","lang":"it_IT","langName":"Italian (Italy)","speaker":"riccardo","name":"Riccardo","gender":"male","speed":"fast","secondsPer1000Chars":3,"quality":"x_low"},
  {"id":"kk_KZ-issai-high","lang":"kk_KZ","langName":"Kazakh (Kazakhstan)","speaker":"issai","name":"Aigerim","gender":"female","speed":"slow","secondsPer1000Chars":20,"quality":"high"},
  {"id":"kk_KZ-iseke-x_low","lang":"kk_KZ","langName":"Kazakh (Kazakhstan)","speaker":"iseke","name":"Iseke","gender":"male","speed":"fast","secondsPer1000Chars":3,"quality":"x_low"},
  {"id":"kk_KZ-raya-x_low","lang":"kk_KZ","langName":"Kazakh (Kazakhstan)","speaker":"raya","name":"Raya","gender":"female","speed":"fast","secondsPer1000Chars":3,"quality":"x_low"},
  {"id":"lb_LU-marylux-medium","lang":"lb_LU","langName":"Luxembourgish (Luxembourg)","speaker":"marylux","name":"Tessy","gender":"female","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"ne_NP-google-medium","lang":"ne_NP","langName":"Nepali (Nepal)","speaker":"google","name":"Sita","gender":"female","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"ne_NP-google-x_low","lang":"ne_NP","langName":"Nepali (Nepal)","speaker":"google","name":"Sita","gender":"female","speed":"fast","secondsPer1000Chars":3,"quality":"x_low"},
  {"id":"no_NO-talesyntese-medium","lang":"no_NO","langName":"Norwegian (Norway)","speaker":"talesyntese","name":"Magnus","gender":"male","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"fa_IR-amir-medium","lang":"fa_IR","langName":"Persian (Iran)","speaker":"amir","name":"Amir","gender":"male","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"fa_IR-gyro-medium","lang":"fa_IR","langName":"Persian (Iran)","speaker":"gyro","name":"Yasmin","gender":"female","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"pl_PL-gosia-medium","lang":"pl_PL","langName":"Polish (Poland)","speaker":"gosia","name":"Gosia","gender":"female","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"pl_PL-darkman-medium","lang":"pl_PL","langName":"Polish (Poland)","speaker":"darkman","name":"Marek","gender":"male","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"pl_PL-mls_6892-low","lang":"pl_PL","langName":"Polish (Poland)","speaker":"mls_6892","name":"Ola","gender":"female","speed":"fast","secondsPer1000Chars":3,"quality":"low"},
  {"id":"pl_PL-mc_speech-medium","lang":"pl_PL","langName":"Polish (Poland)","speaker":"mc_speech","name":"Tomasz","gender":"male","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"pt_BR-faber-medium","lang":"pt_BR","langName":"Portuguese (Brazil)","speaker":"faber","name":"Camila","gender":"female","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"pt_BR-edresson-low","lang":"pt_BR","langName":"Portuguese (Brazil)","speaker":"edresson","name":"Edresson","gender":"male","speed":"fast","secondsPer1000Chars":3,"quality":"low"},
  {"id":"pt_PT-tugão-medium","lang":"pt_PT","langName":"Portuguese (Portugal)","speaker":"tugão","name":"Tiago","gender":"male","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"ro_RO-mihai-medium","lang":"ro_RO","langName":"Romanian (Romania)","speaker":"mihai","name":"Mihai","gender":"male","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"ru_RU-denis-medium","lang":"ru_RU","langName":"Russian (Russia)","speaker":"denis","name":"Denis","gender":"male","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"ru_RU-dmitri-medium","lang":"ru_RU","langName":"Russian (Russia)","speaker":"dmitri","name":"Dmitri","gender":"male","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"ru_RU-irina-medium","lang":"ru_RU","langName":"Russian (Russia)","speaker":"irina","name":"Irina","gender":"female","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"ru_RU-ruslan-medium","lang":"ru_RU","langName":"Russian (Russia)","speaker":"ruslan","name":"Ruslan","gender":"male","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"sr_RS-serbski_institut-medium","lang":"sr_RS","langName":"Serbian (Serbia)","speaker":"serbski_institut","name":"Milica","gender":"female","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"sk_SK-lili-medium","lang":"sk_SK","langName":"Slovak (Slovakia)","speaker":"lili","name":"Lili","gender":"female","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"sl_SI-artur-medium","lang":"sl_SI","langName":"Slovenian (Slovenia)","speaker":"artur","name":"Artur","gender":"male","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"es_MX-claude-high","lang":"es_MX","langName":"Spanish (Mexico)","speaker":"claude","name":"Santiago","gender":"male","speed":"slow","secondsPer1000Chars":20,"quality":"high"},
  {"id":"es_MX-ald-medium","lang":"es_MX","langName":"Spanish (Mexico)","speaker":"ald","name":"Valentina","gender":"female","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"es_ES-carlfm-x_low","lang":"es_ES","langName":"Spanish (Spain)","speaker":"carlfm","name":"Carlos","gender":"male","speed":"fast","secondsPer1000Chars":3,"quality":"x_low"},
  {"id":"es_ES-mls_9972-low","lang":"es_ES","langName":"Spanish (Spain)","speaker":"mls_9972","name":"Elena","gender":"female","speed":"fast","secondsPer1000Chars":3,"quality":"low"},
  {"id":"es_ES-mls_10246-low","lang":"es_ES","langName":"Spanish (Spain)","speaker":"mls_10246","name":"Javier","gender":"male","speed":"fast","secondsPer1000Chars":3,"quality":"low"},
  {"id":"es_ES-davefx-medium","lang":"es_ES","langName":"Spanish (Spain)","speaker":"davefx","name":"Lucía","gender":"female","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"es_ES-sharvard-medium","lang":"es_ES","langName":"Spanish (Spain)","speaker":"sharvard","name":"Mateo","gender":"male","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"sw_CD-lanfrica-medium","lang":"sw_CD","langName":"Swahili (DR Congo)","speaker":"lanfrica","name":"Amani","gender":"female","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"sv_SE-nst-medium","lang":"sv_SE","langName":"Swedish (Sweden)","speaker":"nst","name":"Erik","gender":"male","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"tr_TR-dfki-medium","lang":"tr_TR","langName":"Turkish (Türkiye)","speaker":"dfki","name":"Elif","gender":"female","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"tr_TR-fahrettin-medium","lang":"tr_TR","langName":"Turkish (Türkiye)","speaker":"fahrettin","name":"Fahrettin","gender":"male","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"tr_TR-fettah-medium","lang":"tr_TR","langName":"Turkish (Türkiye)","speaker":"fettah","name":"Fettah","gender":"male","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"uk_UA-ukrainian_tts-medium","lang":"uk_UA","langName":"Ukrainian (Ukraine)","speaker":"ukrainian_tts","name":"Andriy","gender":"male","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"uk_UA-lada-x_low","lang":"uk_UA","langName":"Ukrainian (Ukraine)","speaker":"lada","name":"Lada","gender":"female","speed":"fast","secondsPer1000Chars":3,"quality":"x_low"},
  {"id":"vi_VN-vivos-x_low","lang":"vi_VN","langName":"Vietnamese (Vietnam)","speaker":"vivos","name":"Hoa","gender":"female","speed":"fast","secondsPer1000Chars":3,"quality":"x_low"},
  {"id":"vi_VN-25hours_single-low","lang":"vi_VN","langName":"Vietnamese (Vietnam)","speaker":"25hours_single","name":"Linh","gender":"female","speed":"fast","secondsPer1000Chars":3,"quality":"low"},
  {"id":"vi_VN-vais1000-medium","lang":"vi_VN","langName":"Vietnamese (Vietnam)","speaker":"vais1000","name":"Minh","gender":"male","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
  {"id":"cy_GB-gwryw_gogleddol-medium","lang":"cy_GB","langName":"Welsh","speaker":"gwryw_gogleddol","name":"Owain","gender":"male","speed":"normal","secondsPer1000Chars":6,"quality":"medium"},
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
  { code: "en_US", label: "English (United States)", voiceCount: 24 },
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
  { code: "it_IT", label: "Italian (Italy)", voiceCount: 2 },
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
  { code: "cy_GB", label: "Welsh", voiceCount: 1 },
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

/** Initial picker value — the flagship US male voice at the middle quality tier. */
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
