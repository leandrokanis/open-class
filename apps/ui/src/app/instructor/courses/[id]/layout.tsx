"use client";

import React, { useState, useCallback } from "react";
import { useParams } from "next/navigation";
import styled from "styled-components";
import { PropertiesPanelProvider, usePropertiesPanel } from "@/components/instructor/PropertiesPanelContext";
import { CourseCurriculumProvider } from "@/components/instructor/CourseCurriculumContext";
import { CourseTopBar } from "@/components/instructor/CourseTopBar";

const EditorWrapper = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
  min-height: 100vh;
  overflow: hidden;
`;

const EditorMain = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: var(--color-surface-secondary);
  overflow: hidden;
`;

const ScrollArea = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

const PropertiesAside = styled.aside`
  width: 280px;
  min-width: 280px;
  height: 100vh;
  background: var(--color-surface);
  border-left: 1px solid var(--color-border);
  overflow-y: auto;
  flex-shrink: 0;
  position: sticky;
  top: 0;
`;

export const CourseEditorContext = React.createContext<{
  courseId: string;
  slug: string;
  setSlug: (slug: string) => void;
  courseName: string;
  setCourseName: (name: string) => void;
  notifySaved: () => void;
  savedAt: Date | null;
} | null>(null);

function PropertiesSlot() {
  const { registerTarget } = usePropertiesPanel();
  return <PropertiesAside ref={registerTarget} />;
}

interface CourseEditorLayoutProps {
  children: React.ReactNode;
}

export default function CourseEditorLayout({ children }: CourseEditorLayoutProps) {
  const params = useParams<{ id: string }>();
  const courseId = params.id;

  const [slug, setSlugState] = useState("");
  const [courseName, setCourseNameState] = useState("");
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  const setSlug = useCallback((s: string) => setSlugState(s), []);
  const setCourseName = useCallback((n: string) => setCourseNameState(n), []);
  const notifySaved = useCallback(() => setSavedAt(new Date()), []);

  return (
    <CourseEditorContext.Provider value={{ courseId, slug, setSlug, courseName, setCourseName, notifySaved, savedAt }}>
      <CourseCurriculumProvider courseId={courseId}>
        <PropertiesPanelProvider>
          <EditorWrapper>
            <EditorMain>
              <CourseTopBar courseId={courseId} courseName={courseName} slug={slug} />
              <ScrollArea>{children}</ScrollArea>
            </EditorMain>
            <PropertiesSlot />
          </EditorWrapper>
        </PropertiesPanelProvider>
      </CourseCurriculumProvider>
    </CourseEditorContext.Provider>
  );
}
