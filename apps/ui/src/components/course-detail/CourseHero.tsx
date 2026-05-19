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

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}min`;
  const h = Math.floor(minutes / 60);
  const rem = minutes % 60;
  return rem > 0 ? `${h}h ${rem}min` : `${h}h`;
}

const HeroWrapper = styled.div<{ $gradient: string }>`
  background: ${({ $gradient }) => $gradient};
  aspect-ratio: 16 / 9;
  max-height: 240px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  position: relative;
  overflow: hidden;

  @media (min-width: 768px) {
    max-height: none;
    aspect-ratio: unset;
    min-height: 200px;
    border-radius: var(--radius-card);
  }
`;

const PlayButton = styled.button`
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  backdrop-filter: blur(4px);
  transition: background 0.15s;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  svg {
    width: 22px;
    height: 22px;
    fill: #ffffff;
    margin-left: 3px;
  }
`;

const PreviewLabel = styled.span`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.8);
`;

const DurationBadge = styled.span`
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.55);
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 4px;
  backdrop-filter: blur(4px);
`;

interface CourseHeroProps {
  categorySlug?: string | null;
  totalDurationMinutes?: number;
  previewUrl?: string | null;
}

export function CourseHero({ categorySlug, totalDurationMinutes, previewUrl }: CourseHeroProps) {
  const gradient = getCategoryGradient(categorySlug);

  return (
    <HeroWrapper $gradient={gradient}>
      <PlayButton aria-label="Assistir prévia do curso">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 5v14l11-7z" />
        </svg>
      </PlayButton>
      <PreviewLabel>Prévia disponível</PreviewLabel>
    </HeroWrapper>
  );
}
