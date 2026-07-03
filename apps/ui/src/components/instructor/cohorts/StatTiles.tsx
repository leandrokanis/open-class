'use client';

import styled from 'styled-components';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
`;

const Tile = styled.div`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Value = styled.span`
  font-size: 26px;
  font-weight: 700;
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
`;

const Label = styled.span`
  font-size: 12px;
  color: var(--color-text-secondary);
`;

const Sub = styled.span`
  font-size: 11.5px;
  color: var(--color-text-tertiary);
`;

interface StatTilesProps {
  enrolledCount: number;
  seatsLeft: number;
  avgCompletion: number;
  activeCount: number;
  completedCount: number;
}

export function StatTiles({ enrolledCount, seatsLeft, avgCompletion, activeCount, completedCount }: StatTilesProps) {
  return (
    <Grid>
      <Tile>
        <Value>{enrolledCount}</Value>
        <Label>Inscritos</Label>
        <Sub>{seatsLeft} vagas restantes</Sub>
      </Tile>
      <Tile>
        <Value>{Math.round(avgCompletion)}%</Value>
        <Label>Conclusão média</Label>
      </Tile>
      <Tile>
        <Value>{activeCount}</Value>
        <Label>Alunos ativos</Label>
        <Sub>últimos 7 dias</Sub>
      </Tile>
      <Tile>
        <Value>{completedCount}</Value>
        <Label>Concluíram o curso</Label>
      </Tile>
    </Grid>
  );
}
