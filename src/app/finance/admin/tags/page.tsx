import { listTags } from "@/domains/finance/data/taxonomy";
import { TagsClient } from "./tags-client";

export const dynamic = "force-dynamic";

export default async function TagsPage() {
  const tags = await listTags();
  return <TagsClient initialTags={tags} />;
}
