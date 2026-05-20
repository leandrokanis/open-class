import React from "react";
import styled from "styled-components";

const Card = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
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
  color: #64748b;
`;

const IconBox = styled.div<{ $bg: string }>`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: ${({ $bg }) => $bg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
`;

const Value = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1;
`;

const Trend = styled.div`
  font-size: 12px;
  color: #22c55e;
`;

interface MetricCardProps {
  icon: string;
  iconBg: string;
  label: string;
  value: string;
  trend?: string;
}

export function MetricCard({ icon, iconBg, label, value, trend }: MetricCardProps) {
  return (
    <Card>
      <TopRow>
        <Label>{label}</Label>
        <IconBox $bg={iconBg}>{icon}</IconBox>
      </TopRow>
      <Value>{value}</Value>
      {trend && <Trend>{trend}</Trend>}
    </Card>
  );
}
