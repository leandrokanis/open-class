import styled from "styled-components";

const CATEGORY_GRADIENTS: Record<string, string> = {
  "desenvolvimento-web": "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
  design: "linear-gradient(135deg, #6d28d9 0%, #a78bfa 100%)",
  dados: "linear-gradient(135deg, #0e7490 0%, #38bdf8 100%)",
  devops: "linear-gradient(135deg, #065f46 0%, #34d399 100%)",
  mobile: "linear-gradient(135deg, #9d174d 0%, #f472b6 100%)",
};

function getCategoryGradient(slug?: string | null): string {
  return slug && CATEGORY_GRADIENTS[slug]
    ? CATEGORY_GRADIENTS[slug]
    : "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)";
}

const HeroWrapper = styled.div<{ $gradient: string }>`
  background: ${({ $gradient }) => $gradient};
  aspect-ratio: 16 / 9;
  max-height: 240px;
  position: relative;
  overflow: hidden;
`;

const Thumbnail = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

interface CourseHeroProps {
  categorySlug?: string | null;
  thumbnailUrl?: string | null;
  totalDurationMinutes?: number;
}

export function CourseHero({ categorySlug, thumbnailUrl }: CourseHeroProps) {
  const gradient = getCategoryGradient(categorySlug);

  return (
    <HeroWrapper $gradient={gradient}>
      {thumbnailUrl && <Thumbnail src={thumbnailUrl} alt="Capa do curso" />}
    </HeroWrapper>
  );
}
