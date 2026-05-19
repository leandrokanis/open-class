"use client";

import styled from "styled-components";
import Link from "next/link";

const MobileHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 50;

  @media (min-width: 768px) {
    display: none;
  }
`;

const MobileTitle = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
`;

const BackLink = styled(Link)`
  font-size: 14px;
  color: var(--color-text-secondary);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    color: var(--color-text-primary);
  }
`;

const DesktopBreadcrumb = styled.nav`
  display: none;

  @media (min-width: 768px) {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 0;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--color-text-on-dark);
    opacity: 0.75;
  }
`;

const BreadcrumbLink = styled(Link)`
  color: inherit;
  text-decoration: none;
  opacity: 0.85;

  &:hover {
    opacity: 1;
  }
`;

const BreadcrumbSep = styled.span`
  opacity: 0.5;
`;

const BreadcrumbCurrent = styled.span`
  opacity: 1;
  font-weight: 700;
`;

interface CourseDetailHeaderProps {
  categoryName?: string | null;
  categorySlug?: string | null;
  courseTitle?: string;
  variant?: "mobile" | "desktop";
}

export function CourseDetailHeader({
  categoryName,
  categorySlug,
  courseTitle,
  variant = "mobile",
}: CourseDetailHeaderProps) {
  if (variant === "desktop") {
    return (
      <DesktopBreadcrumb aria-label="Breadcrumb">
        <BreadcrumbLink href="/">Catálogo</BreadcrumbLink>
        {categoryName && categorySlug && (
          <>
            <BreadcrumbSep>/</BreadcrumbSep>
            <BreadcrumbLink href={`/?category=${categorySlug}`}>{categoryName}</BreadcrumbLink>
          </>
        )}
        {courseTitle && (
          <>
            <BreadcrumbSep>/</BreadcrumbSep>
            <BreadcrumbCurrent>{courseTitle}</BreadcrumbCurrent>
          </>
        )}
      </DesktopBreadcrumb>
    );
  }

  return (
    <MobileHeader>
      <BackLink href="/">← Catálogo</BackLink>
      <MobileTitle>Detalhes do Curso</MobileTitle>
      <div style={{ width: 60 }} />
    </MobileHeader>
  );
}
