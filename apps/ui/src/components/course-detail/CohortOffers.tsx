"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import styled from "styled-components";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/Icon";
import { fetchPublicCohorts, enrollInCohort, type PublicCohort } from "@/lib/course-detail";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Title = styled.div`
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  gap: 6px;
`;

const CohortCard = styled.div`
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: var(--color-surface);
`;

const CohortName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const Badge = styled.span<{ $tone: "open" | "full" | "soon" }>`
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 2px 8px;
  border-radius: 10px;
  color: ${({ $tone }) =>
    $tone === "open" ? "var(--color-success)" : $tone === "soon" ? "var(--color-primary)" : "var(--color-text-secondary)"};
  background: ${({ $tone }) =>
    $tone === "open" ? "rgba(34,197,94,0.12)" : $tone === "soon" ? "color-mix(in srgb, var(--color-primary) 12%, transparent)" : "var(--color-surface-secondary)"};
  border: 1px solid var(--color-border);
`;

const Meta = styled.div`
  font-size: 12px;
  color: var(--color-text-secondary);
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

interface CohortOffersProps {
  courseId: string;
}

export function CohortOffers({ courseId }: CohortOffersProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [cohorts, setCohorts] = useState<PublicCohort[]>([]);
  const [enrolling, setEnrolling] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchPublicCohorts(courseId).then((rows) => {
      if (!cancelled) setCohorts(rows);
    });
    return () => { cancelled = true; };
  }, [courseId]);

  if (cohorts.length === 0) return null;

  async function handleEnroll(cohort: PublicCohort) {
    setEnrolling(cohort.id);
    try {
      await enrollInCohort(cohort.id);
      toast.success(`Inscrição confirmada na ${cohort.name}!`);
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao se inscrever.";
      // 401: usuário não autenticado — manda para o login com retorno
      if (message.toLowerCase().includes("unauthorized") || message.includes("401")) {
        window.location.href = `/login?return=${encodeURIComponent(pathname)}`;
        return;
      }
      toast.error(message);
    } finally {
      setEnrolling(null);
    }
  }

  return (
    <Wrapper>
      <Title>
        <Icon name="groups" size={15} />
        Turmas
      </Title>
      {cohorts.map((cohort) => (
        <CohortCard key={cohort.id}>
          <CohortName>
            {cohort.name}
            {cohort.status === "aberta" && <Badge $tone="open">Inscrições abertas</Badge>}
            {cohort.status === "esgotada" && <Badge $tone="full">Esgotada</Badge>}
            {cohort.status === "agendada" && <Badge $tone="soon">Em breve</Badge>}
          </CohortName>
          <Meta>
            <span>Inscrições: {formatDate(cohort.enrollmentStart)} — {formatDate(cohort.enrollmentEnd)}</span>
            {cohort.status === "aberta" && (
              <span>{cohort.seatsLeft} {cohort.seatsLeft === 1 ? "vaga restante" : "vagas restantes"}</span>
            )}
          </Meta>
          {cohort.status === "aberta" && (
            <Button
              size="sm"
              onClick={() => handleEnroll(cohort)}
              disabled={enrolling === cohort.id}
            >
              {enrolling === cohort.id ? "Inscrevendo..." : "Inscrever-se na turma"}
            </Button>
          )}
        </CohortCard>
      ))}
    </Wrapper>
  );
}
