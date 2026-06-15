export const toSlug = (text: string) => {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/&/g, '') // remove &
    .replace(/[^a-z0-9\s-]/g, '') // remove special chars
    .replace(/\s+/g, '-') // spaces to hyphens
    .replace(/-+/g, '-') // double hyphens to single
    .replace(/^-|-$/g, ''); // trim hyphens
};
