import React from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { fetchMe } from "@/lib/dashboard";
import { InstructorSidebar } from "@/components/instructor/InstructorSidebar";
import { SidebarSlotProvider } from "@/components/instructor/SidebarSlotContext";
import styled from "styled-components";

const Wrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background: var(--color-background);
`;

const Main = styled.main`
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const ContentInner = styled.div`
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

export default async function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieHeader = (await headers()).get("cookie") ?? "";
  const me = await fetchMe(cookieHeader);

  if (!me) redirect("/login");
  if (me.role !== "instrutor" && me.role !== "admin") redirect("/");

  return (
    <SidebarSlotProvider>
      <Wrapper data-theme="dark">
        <InstructorSidebar userName={me.name} userRole="Instrutor" avatarUrl={me.avatarUrl ?? undefined} />
        <Main>
          <ContentInner>{children}</ContentInner>
        </Main>
      </Wrapper>
    </SidebarSlotProvider>
  );
}
