/**
 * Language profiles for the in-house detector — data only, loaded lazily.
 *
 * Each profile is a hand-curated description of one language: the closed class
 * of function words that a sentence cannot avoid using, the letters that are
 * distinctive to its orthography, and a few characteristic word endings. No
 * corpus was copied and no third-party resource is bundled; the lists are
 * facts about the languages (which words are closed-class, which letters are
 * used) written out in-house.
 *
 * Twelve languages, all Latin-script, deliberately: the detector scores text
 * against every profile at once, and each additional language makes the
 * scores of its close relatives harder to separate. Closely related pairs such
 * as Danish and Norwegian, or Slovak and Czech, are narrowed to one member per
 * pair so a result can be trusted rather than guessed.
 *
 * This module must stay out of the shared text barrel: the tool that uses it
 * dynamic-imports it so the data never loads on any other page.
 */
import type { LanguageProfile } from "./language.ts";

export const LANGUAGE_PROFILES: readonly LanguageProfile[] = [
  {
    code: "en",
    name: "English",
    stopwords: [
      "the", "and", "of", "to", "in", "that", "is", "it", "for", "was", "with", "as", "on", "be",
      "at", "by", "this", "from", "are", "not", "but", "they", "you", "we", "what", "when", "who",
      "will", "can", "would", "there", "their", "which", "has", "have", "had", "were", "one", "all",
      "if", "so", "out", "up", "about", "just", "should", "now", "than", "then", "them", "he", "she",
      "her", "his", "been", "because", "while", "into", "over",
    ],
    characters: [],
    endings: ["ing", "tion", "ly", "ness", "ful", "ous", "ive"],
  },
  {
    code: "es",
    name: "Spanish",
    stopwords: [
      "el", "la", "los", "las", "un", "una", "unos", "unas", "de", "del", "que", "y", "en", "es",
      "son", "por", "para", "con", "no", "se", "su", "sus", "al", "como", "más", "pero", "o",
      "este", "esta", "estos", "estas", "hay", "muy", "también", "hasta", "desde", "entre", "cuando",
      "donde", "porque", "sobre", "todo", "todos", "nada", "algo", "yo", "tú", "él", "ella",
      "nosotros", "ellos", "usted", "ustedes", "era", "fue", "han", "tiene",
    ],
    characters: ["ñ", "¿", "¡"],
    endings: ["ción", "ciones", "dad", "dades", "mente", "ado", "ido", "ando", "iendo", "oso"],
  },
  {
    code: "fr",
    name: "French",
    stopwords: [
      "le", "la", "les", "un", "une", "des", "du", "de", "et", "en", "est", "sont", "que", "qui",
      "pour", "dans", "avec", "pas", "ne", "se", "ce", "cette", "ces", "au", "aux", "il", "elle",
      "ils", "elles", "nous", "vous", "je", "tu", "on", "son", "sa", "ses", "mais", "ou", "où",
      "comme", "plus", "très", "aussi", "tout", "tous", "sur", "par", "être", "avoir", "fait",
      "était",
    ],
    characters: ["ç", "œ", "æ", "ê", "ë", "î", "ï", "ô", "û"],
    endings: ["tion", "ment", "eau", "eux", "ette", "ique"],
  },
  {
    code: "de",
    name: "German",
    stopwords: [
      "der", "die", "das", "den", "dem", "des", "ein", "eine", "einen", "einem", "einer", "und",
      "ist", "sind", "war", "waren", "nicht", "mit", "auf", "für", "von", "zu", "im", "in", "am",
      "an", "als", "auch", "es", "sie", "er", "wir", "ich", "du", "dass", "wie", "aber", "oder",
      "wenn", "dann", "noch", "nur", "schon", "sehr", "bei", "aus", "nach", "über", "um", "werden",
      "wird", "hat", "haben", "hatte",
    ],
    characters: ["ß", "ä", "ö", "ü"],
    endings: ["ung", "ungen", "keit", "heit", "lich", "chen", "schaft"],
  },
  {
    code: "it",
    name: "Italian",
    stopwords: [
      "il", "lo", "la", "i", "gli", "le", "un", "uno", "una", "di", "del", "della", "dei", "delle",
      "che", "e", "è", "sono", "per", "con", "non", "si", "in", "al", "alla", "come", "più", "ma",
      "o", "questo", "questa", "questi", "queste", "io", "tu", "lui", "lei", "noi", "voi", "loro",
      "ha", "hanno", "essere", "stato", "anche", "molto", "quando", "dove", "perché", "tra", "fra",
      "su", "da", "nel", "nella", "sulla", "sopra",
    ],
    characters: ["è", "ì", "ò"],
    endings: ["zione", "zioni", "mente", "are", "ire", "ere", "ato", "ito", "uto", "anza"],
  },
  {
    code: "pt",
    name: "Portuguese",
    stopwords: [
      "o", "a", "os", "as", "um", "uma", "uns", "umas", "de", "do", "da", "dos", "das", "que", "e",
      "é", "são", "em", "no", "na", "por", "para", "com", "não", "se", "seu", "sua", "seus", "suas",
      "ao", "aos", "como", "mais", "mas", "ou", "este", "esta", "esses", "essas", "eu", "tu", "ele",
      "ela", "nós", "eles", "elas", "você", "vocês", "há", "foi", "ser", "estar", "tem", "têm",
      "muito", "também", "quando", "onde", "porque", "sobre",
    ],
    characters: ["ã", "õ", "ç"],
    endings: ["ção", "ções", "mente", "ado", "ido", "eiro", "eira", "oso"],
  },
  {
    code: "nl",
    name: "Dutch",
    stopwords: [
      "de", "het", "een", "en", "van", "is", "zijn", "was", "waren", "in", "op", "voor", "met",
      "dat", "die", "deze", "dit", "niet", "maar", "of", "als", "ook", "er", "ik", "je", "hij",
      "zij", "we", "jullie", "ze", "aan", "bij", "uit", "naar", "over", "om", "te", "wordt",
      "worden", "heeft", "hebben", "had", "kan", "kunnen", "zal", "zou", "nog", "al", "zeer",
    ],
    characters: ["ij", "ë", "ï"],
    endings: ["tje", "heid", "lijk", "schap"],
  },
  {
    code: "sv",
    name: "Swedish",
    stopwords: [
      "och", "att", "det", "som", "är", "en", "ett", "på", "i", "av", "för", "med", "till", "den",
      "de", "inte", "men", "om", "så", "kan", "ska", "har", "hade", "var", "blev", "blir", "vi",
      "du", "jag", "han", "hon", "dem", "deras", "sin", "sitt", "sina", "från", "vid", "över",
      "under", "också", "bara", "när", "där", "här",
    ],
    characters: ["å", "ä", "ö"],
    endings: ["ning", "ningen", "het", "lig", "isk"],
  },
  {
    code: "pl",
    name: "Polish",
    stopwords: [
      "i", "w", "na", "z", "do", "że", "nie", "się", "jest", "są", "był", "była", "było", "jak",
      "po", "dla", "od", "tym", "tego", "ale", "lub", "czy", "już", "przez", "przy", "oraz", "gdy",
      "gdzie", "kiedy", "który", "która", "które", "jego", "jej", "ich", "my", "wy", "oni", "ja",
      "ty", "nad", "pod", "za", "przed", "bez", "może", "także",
    ],
    characters: ["ą", "ę", "ł", "ż", "ź", "ś", "ć", "ń", "ó"],
    endings: ["ski", "ska", "owy", "anie", "enie", "ść"],
  },
  {
    code: "cs",
    name: "Czech",
    stopwords: [
      "a", "v", "na", "se", "je", "že", "to", "s", "z", "do", "pro", "za", "ale", "nebo", "jako",
      "když", "kde", "který", "která", "které", "byl", "byla", "bylo", "jsou", "není", "jsem",
      "jsi", "jsme", "jste", "on", "ona", "oni", "my", "vy", "také", "ještě", "jen", "velmi",
      "tak", "pak", "už", "přes", "pod", "nad", "před", "bez", "při",
    ],
    characters: ["ř", "ě", "ů", "č", "š", "ž", "ý", "á", "í", "é"],
    endings: ["ní", "ový", "ský", "ská", "ech", "ům", "ost"],
  },
  {
    code: "tr",
    name: "Turkish",
    stopwords: [
      "bir", "ve", "bu", "şu", "o", "için", "ile", "ama", "fakat", "çok", "daha", "en", "gibi",
      "kadar", "sonra", "önce", "şimdi", "her", "hiç", "ne", "nasıl", "neden", "çünkü", "eğer",
      "ise", "var", "yok", "olarak", "olan", "oldu", "değil", "ben", "sen", "biz", "siz", "onlar",
      "de", "da",
    ],
    characters: ["ğ", "ş", "ı", "ç"],
    endings: ["lar", "ler", "yor", "mek", "mak", "dır", "dir", "lik"],
  },
  {
    code: "fi",
    name: "Finnish",
    stopwords: [
      "ja", "on", "ei", "se", "että", "joka", "mutta", "tai", "kun", "missä", "mikä", "kuka",
      "minä", "sinä", "hän", "me", "te", "he", "ovat", "oli", "olivat", "ole", "en", "et", "emme",
      "ette", "eivät", "myös", "vain", "niin", "kuin", "sekä", "jälkeen", "ennen", "kanssa",
      "ilman", "varten", "yli", "alla", "päällä",
    ],
    characters: ["ä", "ö"],
    endings: ["nen", "ssa", "ssä", "lla", "llä", "minen", "ksi"],
  },
];
