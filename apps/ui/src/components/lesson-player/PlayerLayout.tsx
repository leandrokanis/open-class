"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import styled from "styled-components";
import { Dialog, DialogClose } from "@/components/ui/dialog";
import { useLessonProgress } from "@/hooks/useLessonProgress";
import type { LessonDetail, LessonResource } from "@/lib/lesson-player";
import type { CourseModule } from "@/lib/course-detail";
import { YouTubeEmbed } from "./YouTubeEmbed";
import { LessonHeader } from "./LessonHeader";
import { LessonTabs } from "./LessonTabs";
import { CurriculumPanel } from "./CurriculumPanel";
import { PlayerNavbar } from "./PlayerNavbar";

/* ─── Styled ─── */

const Page = styled.div`
  min-height: 100vh;
  background: var(--color-background);
`;

/* Desktop: 2-col grid. Mobile: single column. */
const OuterLayout = styled.div`
  @media (min-width: 1024px) {
    display: grid;
    grid-template-columns: 1fr 380px;
    min-height: calc(100vh - 56px);
  }
`;

const MainColumn = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;

  @media (min-width: 1024px) {
    overflow-y: auto;
  }

  @media (orientation: landscape) and (max-width: 1023px) {
    padding-bottom: 0;
  }
`;

const VideoSection = styled.div`
  position: relative;

  @media (orientation: landscape) and (max-width: 1023px) {
    position: fixed;
    inset: 0;
    z-index: 100;
    background: #000;
  }
`;

/* Mobile-only elements */
const MobileOnly = styled.div`
  @media (min-width: 1024px) {
    display: none;
  }

  @media (orientation: landscape) and (max-width: 1023px) {
    display: none;
  }
`;

/* Desktop-only elements */
const DesktopOnly = styled.div`
  display: none;

  @media (min-width: 1024px) {
    display: block;
  }
`;

const BelowVideo = styled.div`
  padding: 24px 32px;
  flex: 1;
`;

const LessonTitleDesktop = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 6px;
`;

const LessonBreadcrumbDesktop = styled.p`
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-bottom: 20px;
`;

const DescriptionDesktop = styled.p`
  font-size: 15px;
  color: var(--color-text-secondary);
  line-height: 1.7;
  margin-bottom: 20px;
`;

const ResourcesDesktop = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ResourceLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--color-primary);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const Sidebar = styled.aside`
  display: none;

  @media (min-width: 1024px) {
    display: flex;
    flex-direction: column;
    border-left: 1px solid var(--color-border);
    overflow-y: auto;
  }
`;

const DialogActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
`;

const CancelBtn = styled.button`
  padding: 9px 20px;
  border-radius: var(--radius-btn);
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
`;

const ConfirmBtn = styled.button`
  padding: 9px 20px;
  border-radius: var(--radius-btn);
  border: none;
  background: var(--color-destructive);
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
`;

/* ─── Helpers ─── */

interface FlatLesson {
  id: string;
  title: string;
  durationSeconds: number | null;
  position: number;
  moduleId: string;
}

function buildFlatList(modules: CourseModule[]): FlatLesson[] {
  return modules.flatMap((m) =>
    m.lessons.map((l) => ({
      id: l.id,
      title: l.title,
      durationSeconds: l.duration ?? null,
      position: l.order,
      moduleId: m.id,
    })),
  );
}

function formatDuration(seconds: number): string {
  const m = Math.round(seconds / 60);
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem > 0 ? `${h}h ${rem}min` : `${h}h`;
}

/* ─── Types ─── */

interface PlayerLayoutProps {
  lesson: LessonDetail;
  modules: CourseModule[];
  courseId: string;
  courseTitle: string;
  courseSlug: string;
}

/* ─── Component ─── */

export function PlayerLayout({ lesson, modules, courseId, courseTitle, courseSlug }: PlayerLayoutProps) {
  const router = useRouter();
  const [confirmUnmark, setConfirmUnmark] = useState(false);
  const { completedLessonIds, percentage, isLoading, isCompleted, toggle } = useLessonProgress(
    courseId,
    lesson.id,
  );

  const flatLessons = buildFlatList(modules);
  const currentIndex = flatLessons.findIndex((l) => l.id === lesson.id);
  const prevLesson = currentIndex > 0 ? flatLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < flatLessons.length - 1 ? flatLessons[currentIndex + 1] : null;
  const lessonIndex = currentIndex + 1;
  const totalLessons = flatLessons.length;
  const completedCount = completedLessonIds.length;

  const activeModule = modules.find((m) => m.id === lesson.moduleId);
  const resources = (lesson.resources ?? []) as LessonResource[];

  const sidebarModules = modules.map((m) => ({
    ...m,
    order: m.order,
    lessons: m.lessons.map((l) => ({
      id: l.id,
      title: l.title,
      durationSeconds: l.duration ?? null,
      position: l.order,
    })),
  }));

  function handleLessonClick(lessonId: string) {
    router.push(`/curso/${courseSlug}/aula/${lessonId}`);
  }

  async function handleVideoEnded() {
    if (isCompleted(lesson.id)) return;
    await toggle(lesson.id);
    if (nextLesson) {
      router.push(`/curso/${courseSlug}/aula/${nextLesson.id}`);
    }
  }

  async function handleToggle() {
    if (isCompleted(lesson.id)) {
      setConfirmUnmark(true);
      return;
    }
    await toggle(lesson.id);
    if (nextLesson) {
      router.push(`/curso/${courseSlug}/aula/${nextLesson.id}`);
    }
  }

  async function handleConfirmUnmark() {
    setConfirmUnmark(false);
    await toggle(lesson.id);
  }

  return (
    <Page>
      {/* Navbar fixa — desktop only */}
      <PlayerNavbar
        courseTitle={courseTitle}
        courseSlug={courseSlug}
        lessonTitle={lesson.title}
        lessonIndex={lessonIndex}
        totalLessons={totalLessons}
        isCompleted={isCompleted(lesson.id)}
        isLoading={isLoading}
        onToggle={handleToggle}
      />

      <OuterLayout>
        <MainColumn>
          {/* Vídeo — renderizado UMA única vez */}
          <VideoSection>
            <YouTubeEmbed videoId={lesson.youtubeVideoId} onEnded={handleVideoEnded} />
          </VideoSection>

          {/* Abaixo do vídeo — mobile */}
          <MobileOnly>
            <LessonHeader
              title={lesson.title}
              moduleTitle={activeModule?.title ?? ""}
              lessonIndex={lessonIndex}
              totalLessons={totalLessons}
              durationSeconds={lesson.durationSeconds}
              isCompleted={isCompleted(lesson.id)}
              isLoading={isLoading}
              onToggle={handleToggle}
            />
            <LessonTabs
              curriculum={
                <CurriculumPanel
                  modules={sidebarModules}
                  activeLessonId={lesson.id}
                  completedLessonIds={completedLessonIds}
                  percentage={percentage}
                  totalLessons={totalLessons}
                  completedCount={completedCount}
                  onLessonClick={handleLessonClick}
                  showHeader={false}
                />
              }
              description={lesson.description}
              resources={resources}
            />
          </MobileOnly>

          {/* Abaixo do vídeo — desktop */}
          <DesktopOnly>
            <BelowVideo>
              <LessonTitleDesktop>{lesson.title}</LessonTitleDesktop>
              <LessonBreadcrumbDesktop>
                {activeModule?.title} · Aula {lessonIndex} de {totalLessons}
                {lesson.durationSeconds ? ` · ${formatDuration(lesson.durationSeconds)}` : ""}
              </LessonBreadcrumbDesktop>
              {lesson.description && (
                <DescriptionDesktop>{lesson.description}</DescriptionDesktop>
              )}
              {resources.length > 0 && (
                <ResourcesDesktop>
                  {resources.map((r) => (
                    <ResourceLink key={r.id} href={r.url} target="_blank" rel="noopener noreferrer">
                      → {r.label}
                    </ResourceLink>
                  ))}
                </ResourcesDesktop>
              )}
            </BelowVideo>
          </DesktopOnly>
        </MainColumn>

        {/* Sidebar currículo — desktop only */}
        <Sidebar>
          <CurriculumPanel
            modules={sidebarModules}
            activeLessonId={lesson.id}
            completedLessonIds={completedLessonIds}
            percentage={percentage}
            totalLessons={totalLessons}
            completedCount={completedCount}
            onLessonClick={handleLessonClick}
            showHeader={true}
          />
        </Sidebar>
      </OuterLayout>

      {/* Diálogo de confirmação de desmarcar */}
      <Dialog
        open={confirmUnmark}
        onOpenChange={setConfirmUnmark}
        title="Desmarcar aula como concluída?"
        description="Tem certeza que deseja remover a marcação de conclusão desta aula?"
      >
        <DialogActions>
          <DialogClose asChild>
            <CancelBtn>Cancelar</CancelBtn>
          </DialogClose>
          <ConfirmBtn onClick={handleConfirmUnmark}>Sim, desmarcar</ConfirmBtn>
        </DialogActions>
      </Dialog>
    </Page>
  );
}
