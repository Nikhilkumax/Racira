/**
 * Per-domain index switch for pages whose registry status is not "live".
 *
 * While this is true the domain's Coming Soon pages are indexable: they carry a
 * unique title, a unique 120-160 character description and a self-referencing
 * flat canonical, with no robots noindex meta. Flip it to false to take every
 * soon page in this domain out of the index again — nothing else changes.
 *
 * Same contract as domains/calculator/indexing.ts and domains/pdf/indexing.ts.
 */
export const INDEX_SOON_PAGES = true;
