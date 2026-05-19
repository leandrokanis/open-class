import { Skeleton } from "@/components/ui/skeleton";
import styled from "styled-components";

const Wrapper = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export function CourseDetailSkeleton() {
  return (
    <Wrapper>
      <Skeleton style={{ height: "12px", width: "60%" }} />
      <Skeleton style={{ height: "8px", width: "100%", borderRadius: "4px" }} />
      <Skeleton style={{ height: "12px", width: "40%" }} />
      <Skeleton style={{ height: "48px", borderRadius: "var(--radius-btn)" }} />
    </Wrapper>
  );
}
