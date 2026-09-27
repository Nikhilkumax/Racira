export const toSlug = (text: string) => {
  if (!text) return "";
  return text
    // Transliterate accented characters first (è -> e) so tool names with
    // diacritics produce readable slugs instead of silently dropping the
    // accented letter (e.g. "Vigenère Cipher Tool" once produced
    // "vigenre-cipher-tool"). NFD splits è into e + combining mark; the
    // mark is then stripped by the special-char filter below.
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, 'and') // replace & with and
    .replace(/\//g, '-')  // replace / with hyphen
    .replace(/[^a-z0-9\s-]/g, '') // remove special chars
    .replace(/\s+/g, '-') // spaces to hyphens
    .replace(/-+/g, '-') // double hyphens to single
    .replace(/^-|-$/g, ''); // trim hyphens
};
