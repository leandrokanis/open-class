import { fetchStats, fetchCategories, fetchCatalog } from "@/lib/catalog";
import { AppHeader } from "@/components/catalog/AppHeader";
import { HeroSection } from "@/components/catalog/HeroSection";
import { CatalogClient } from "@/components/catalog/CatalogClient";
import { MobileBottomNav } from "@/components/catalog/MobileBottomNav";

export default async function Home() {
  const [stats, categories, initialPage] = await Promise.all([
    fetchStats(),
    fetchCategories(),
    fetchCatalog({ limit: 12 }),
  ]);

  return (
    <>
      <AppHeader />
      <HeroSection stats={stats} />
      <CatalogClient categories={categories} initialPage={initialPage} />
      <MobileBottomNav />
    </>
  );
}
