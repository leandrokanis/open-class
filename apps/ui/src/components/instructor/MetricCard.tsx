import React from "react";
import styled from "styled-components";
import { Icon } from "@/components/ui/Icon";

const Card = styled.div`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const TopRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
`;

const Label = styled.span`
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-secondary);
`;

const IconBox = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: var(--color-surface-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
`;

const Value = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1;
`;

const Trend = styled.div`
  font-size: 12px;
  color: var(--color-success);
`;

interface MetricCardProps {
  icon: string;
  label: string;
  value: string;
  trend?: string;
}

export function MetricCard({ icon, label, value, trend }: MetricCardProps) {
  return (
    <Card>
      <TopRow>
        <Label>{label}</Label>
        <IconBox>
          <Icon name={icon} size={18} />
        </IconBox>
      </TopRow>
      <Value>{value}</Value>
      {trend && <Trend>{trend}</Trend>}
    </Card>
  );
}
