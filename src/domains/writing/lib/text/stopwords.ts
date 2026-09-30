/**
 * A short, curated English stopword list (function words) used by the
 * frequency views so "the / and / of" do not dominate the top-word tables.
 *
 * This is a hand-maintained list of closed-class English words — not a copied
 * corpus file — so there is no third-party licence attached to it. It is
 * deliberately small: it filters function words, it is not a linguistic
 * stopword resource.
 */
export const ENGLISH_STOPWORDS: readonly string[] = [
  "a", "about", "above", "after", "again", "against", "all", "also", "am", "an",
  "and", "any", "are", "as", "at", "be", "because", "been", "before", "being",
  "below", "between", "both", "but", "by", "can", "cannot", "could", "did", "do",
  "does", "doing", "down", "during", "each", "either", "else", "few", "for",
  "from", "further", "had", "has", "have", "having", "he", "her", "here", "hers",
  "herself", "him", "himself", "his", "how", "however", "i", "if", "in", "into",
  "is", "it", "its", "itself", "just", "me", "might", "more", "most", "much",
  "must", "my", "myself", "neither", "no", "nor", "not", "now", "of", "off",
  "on", "once", "only", "or", "other", "our", "ours", "ourselves", "out", "over",
  "own", "same", "she", "should", "so", "some", "such", "than", "that", "the",
  "their", "theirs", "them", "themselves", "then", "there", "these", "they",
  "this", "those", "through", "to", "too", "under", "until", "up", "very", "was",
  "we", "were", "what", "when", "where", "which", "while", "who", "whom", "why",
  "will", "with", "would", "you", "your", "yours", "yourself", "yourselves",
];

/** Set form for O(1) lookups in the hot counting loop. */
export const ENGLISH_STOPWORD_SET: ReadonlySet<string> = new Set(ENGLISH_STOPWORDS);
