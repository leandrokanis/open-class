import Link from "next/link";
import styled from "styled-components";
import { Icon } from "@/components/ui/Icon";

const Wrap = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 40px 24px;
  text-align: center;
`;

const IconWrap = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--color-surface);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text-primary);
`;

const Desc = styled.p`
  font-size: 15px;
  color: var(--color-text-secondary);
  max-width: 360px;
`;

const CourseLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  border-radius: var(--radius-btn);
  background: var(--color-primary);
  color: var(--color-text-on-primary);
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
`;

interface NotEnrolledGateProps {
  courseSlug: string;
  courseTitle: string;
}

export function NotEnrolledGate({ courseSlug, courseTitle }: NotEnrolledGateProps) {
  return (
    <Wrap>
      <IconWrap>
        <Icon name="lock" size={32} style={{ color: "var(--color-text-secondary)" }} />
      </IconWrap>
      <Title>Você não está matriculado neste curso</Title>
      <Desc>Para assistir às aulas de &ldquo;{courseTitle}&rdquo;, você precisa se matricular primeiro.</Desc>
      <CourseLink href={`/course/${courseSlug}`}>
        Ver página do curso
        <Icon name="arrow_forward" size={16} style={{ color: "inherit" }} />
      </CourseLink>
    </Wrap>
  );
}
