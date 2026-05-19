"use client";

import { useState, useCallback } from "react";
import styled from "styled-components";
import { SearchBar } from "./SearchBar";
import { CategoryPills } from "./CategoryPills";
import { LevelFilter } from "./LevelFilter";
import { CourseGrid } from "./CourseGrid";
import { LoadMoreButton } from "./LoadMoreButton";
import { fetchCatalog } from "@/lib/catalog";
import type { CategoryItem, CatalogPage, CourseListItem } from "@/lib/catalog";

const FiltersBar = styled.div`
  padding: 16px 20px;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);

  @media (min-width: 768px) {
    padding: 20px 32px;
  }
`;

const SearchBarWrapper = styled.div`
  padding: 20px;
  background: var(--gradient-hero-alt);

  @media (min-width: 768px) {
    padding: 32px 48px;
  }
`;

const FilterRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  max-width: 1440px;
  margin: 0 auto;
`;

const FilterLeft = styled.div`
  flex: 1;
  overflow: hidden;
`;

const FilterRight = styled.div`
  display: none;

  @media (min-width: 768px) {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
  }
`;

const CourseCount = styled.span`
  font-size: 14px;
  color: var(--color-text-secondary);
  white-space: nowrap;
`;

const Main = styled.main`
  padding: 20px;
  max-width: 1440px;
  margin: 0 auto;
  background: var(--color-background);

  @media (min-width: 768px) {
    padding: 32px;
  }
`;

const LoadMoreWrapper = styled.div`
  margin-top: 32px;
  padding-bottom: 80px;

  @media (min-width: 768px) {
    padding-bottom: 32px;
  }
`;

interface CatalogClientProps {
  categories: CategoryItem[];
  initialPage: CatalogPage;
  initialCategoryId?: string | null;
}

export function CatalogClient({ categories, initialPage, initialCategoryId = null }: CatalogClientProps) {
  const [courses, setCourses] = useState<CourseListItem[]>(initialPage.data);
  const [meta, setMeta] = useState(initialPage.meta);
  const [searchQ, setSearchQ] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(initialCategoryId);
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced" | null>(null);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(
    async (params: {
      q?: string;
      catId?: string | null;
      lvl?: "beginner" | "intermediate" | "advanced" | null;
    }) => {
      setLoading(true);
      try {
        const resolvedCatId = "catId" in params ? params.catId : categoryId;
        const resolvedLvl = "lvl" in params ? params.lvl : level;
        const page = await fetchCatalog({
          q: params.q !== undefined ? params.q : searchQ,
          categoryId: resolvedCatId ?? undefined,
          level: resolvedLvl ?? undefined,
          limit: 12,
        });
        setCourses(page.data);
        setMeta(page.meta);
      } finally {
        setLoading(false);
      }
    },
    [searchQ, categoryId, level],
  );

  function handleSearch(q: string) {
    setSearchQ(q);
    reload({ q });
  }

  function handleCategory(id: string | null) {
    setCategoryId(id);
    reload({ catId: id });
  }

  function handleLevel(lvl: "beginner" | "intermediate" | "advanced" | null) {
    setLevel(lvl);
    reload({ lvl });
  }

  async function handleLoadMore() {
    if (!meta.hasMore || !meta.nextCursor || loading) return;
    setLoading(true);
    try {
      const page = await fetchCatalog({
        q: searchQ,
        categoryId: categoryId ?? undefined,
        level: level ?? undefined,
        cursor: meta.nextCursor,
        limit: 12,
      });
      setCourses((prev) => [...prev, ...page.data]);
      setMeta(page.meta);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <SearchBarWrapper>
        <SearchBar onSearch={handleSearch} />
      </SearchBarWrapper>

      <FiltersBar>
        <FilterRow>
          <FilterLeft>
            <CategoryPills
              categories={categories}
              activeId={categoryId}
              onSelect={handleCategory}
            />
          </FilterLeft>
          <FilterRight>
            <CourseCount>{courses.length} cursos</CourseCount>
            <LevelFilter value={level} onChange={handleLevel} />
          </FilterRight>
        </FilterRow>
      </FiltersBar>

      <Main>
        <CourseGrid courses={courses} searchTerm={searchQ || undefined} />
        <LoadMoreWrapper>
          <LoadMoreButton
            hasMore={meta.hasMore}
            loading={loading}
            onLoadMore={handleLoadMore}
          />
        </LoadMoreWrapper>
      </Main>
    </>
  );
}
