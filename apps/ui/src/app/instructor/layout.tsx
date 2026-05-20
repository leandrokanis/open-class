import React from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { fetchMe } from "@/lib/dashboard";
import { InstructorSidebar } from "@/components/instructor/InstructorSidebar";
import styled from "styled-components";

const Wrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
`;

const Main = styled.main`
  flex: 1;
  min-width: 0;
  overflow-y: auto;
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
    <Wrapper>
      <InstructorSidebar userName={me.name} userRole="Instrutora" />
      <Main>{children}</Main>
    </Wrapper>
  );
}
