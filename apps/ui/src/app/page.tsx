import { fetchStats, fetchCategories, fetchCatalog } from "@/lib/catalog";
import { AppHeader } from "@/components/catalog/AppHeader";
import { HeroSection } from "@/components/catalog/HeroSection";
import { CatalogClient } from "@/components/catalog/CatalogClient";
import { MobileBottomNav } from "@/components/catalog/MobileBottomNav";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: categorySlug } = await searchParams;

  const [stats, categories] = await Promise.all([fetchStats(), fetchCategories()]);

  const matchedCategory = categorySlug
    ? categories.find((c) => c.slug === categorySlug) ?? null
    : null;

  const initialPage = await fetchCatalog({
    limit: 12,
    categoryId: matchedCategory?.id,
  });

  return (
    <>
      <AppHeader />
      <HeroSection stats={stats} />
      <CatalogClient
        categories={categories}
        initialPage={initialPage}
        initialCategoryId={matchedCategory?.id ?? null}
      />
      <MobileBottomNav />
    </>
  );
}
