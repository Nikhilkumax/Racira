import { listCategories } from "@/domains/finance/data/taxonomy";
import { CategoriesClient } from "./categories-client";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await listCategories();
  return <CategoriesClient initialCategories={categories} />;
}
