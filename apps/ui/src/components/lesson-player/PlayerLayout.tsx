"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import { Dialog, DialogClose } from "@/components/ui/dialog";
import { useLessonProgress } from "@/hooks/useLessonProgress";
import {
  fetchExtrasStatus,
  postExtrasCelebration,
  fetchMyCohortForCourse,
  type LessonDetail,
  type LessonResource,
  type ModuleExtrasStatus,
} from "@/lib/lesson-player";
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

const CelebrationList = styled.ul`
  list-style: none;
  margin: 12px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const CelebrationItem = styled.li`
  font-size: 14px;
  color: var(--color-text-primary);
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

const PrimaryBtn = styled.button`
  padding: 9px 20px;
  border-radius: var(--radius-btn);
  border: none;
  background: var(--color-primary);
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

function buildFlatList(
  modules: CourseModule[],
  extrasUnlockedByModule: Record<string, boolean>,
  moduleLocks: Record<string, string>,
): FlatLesson[] {
  const now = new Date();
  return modules.flatMap((m) => {
    // Módulos com liberação futura ficam fora da navegação sequencial (US-24)
    const lockedUntil = moduleLocks[m.id];
    if (lockedUntil && new Date(lockedUntil) > now) return [];
    return m.lessons
      // Extras bloqueadas ficam fora da navegação sequencial (US-20)
      .filter((l) => !l.isExtra || extrasUnlockedByModule[m.id])
      .map((l) => ({
        id: l.id,
        title: l.title,
        durationSeconds: l.duration ?? null,
        position: l.order,
        moduleId: m.id,
      }));
  });
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

  // Status das aulas extras por módulo (desbloqueio + celebração) — US-20
  const [extrasStatus, setExtrasStatus] = useState<ModuleExtrasStatus[]>([]);
  const [celebrating, setCelebrating] = useState<ModuleExtrasStatus | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchExtrasStatus(courseId).then((status) => {
      if (cancelled) return;
      setExtrasStatus(status);
      const eligible = status.find((s) => s.hasExtras && s.unlocked && !s.celebrated);
      if (eligible) setCelebrating(eligible);
    });
    return () => { cancelled = true; };
  }, [courseId, completedLessonIds.length]);

  const extrasUnlockedByModule = useMemo(
    () => Object.fromEntries(extrasStatus.map((s) => [s.moduleId, s.unlocked])),
    [extrasStatus],
  );

  // Cronograma de turma: moduleId → data de liberação futura (US-24)
  const [moduleLocks, setModuleLocks] = useState<Record<string, string>>({});
  useEffect(() => {
    let cancelled = false;
    fetchMyCohortForCourse(courseId).then((cohort) => {
      if (cancelled || !cohort || cohort.closedAt) return;
      const locks: Record<string, string> = {};
      for (const entry of cohort.schedule) {
        locks[entry.moduleId] = entry.availableFrom;
      }
      setModuleLocks(locks);
    });
    return () => { cancelled = true; };
  }, [courseId]);

  async function handleCloseCelebration() {
    const moduleId = celebrating?.moduleId;
    setCelebrating(null);
    if (moduleId) {
      await postExtrasCelebration(moduleId);
      setExtrasStatus((prev) =>
        prev.map((s) => (s.moduleId === moduleId ? { ...s, celebrated: true } : s)),
      );
    }
  }

  const flatLessons = buildFlatList(modules, extrasUnlockedByModule, moduleLocks);
  const currentIndex = flatLessons.findIndex((l) => l.id === lesson.id);
  const normalFlat = modules.flatMap((m) => m.lessons.filter((l) => !l.isExtra));
  const lessonIndex = currentIndex + 1;
  const totalLessons = normalFlat.length;
  const completedCount = completedLessonIds.length;

  const activeModule = modules.find((m) => m.id === lesson.moduleId);
  const resources = (lesson.resources ?? []) as LessonResource[];
  const celebratingModule = celebrating ? modules.find((m) => m.id === celebrating.moduleId) : null;
  const celebratingExtras = celebratingModule?.lessons.filter((l) => l.isExtra) ?? [];

  const sidebarModules = modules.map((m) => ({
    ...m,
    order: m.order,
    lessons: m.lessons.map((l) => ({
      id: l.id,
      title: l.title,
      durationSeconds: l.duration ?? null,
      position: l.order,
      isExtra: l.isExtra ?? false,
    })),
  }));

  function handleLessonClick(lessonId: string) {
    router.push(`/course/${courseSlug}/lesson/${lessonId}`);
  }

  // Próxima aula considerando que a atual acabou de ser concluída: recalcula o
  // desbloqueio de extras localmente para não depender do fetch assíncrono, de
  // modo que concluir a última normal do módulo avance para a extra recém-liberada.
  function nextLessonIdAfterCompleting(currentId: string): string | null {
    const completed = new Set([...completedLessonIds, currentId]);
    const unlocked: Record<string, boolean> = {};
    for (const m of modules) {
      const normals = m.lessons.filter((l) => !l.isExtra);
      unlocked[m.id] = normals.length > 0 && normals.every((l) => completed.has(l.id));
    }
    const flat = buildFlatList(modules, unlocked, moduleLocks);
    const idx = flat.findIndex((l) => l.id === currentId);
    return idx >= 0 && idx < flat.length - 1 ? flat[idx + 1].id : null;
  }

  async function handleVideoEnded() {
    if (isCompleted(lesson.id)) return;
    await toggle(lesson.id);
    const nextId = nextLessonIdAfterCompleting(lesson.id);
    if (nextId) router.push(`/course/${courseSlug}/lesson/${nextId}`);
  }

  async function handleToggle() {
    if (isCompleted(lesson.id)) {
      setConfirmUnmark(true);
      return;
    }
    await toggle(lesson.id);
    const nextId = nextLessonIdAfterCompleting(lesson.id);
    if (nextId) router.push(`/course/${courseSlug}/lesson/${nextId}`);
  }

  async function handleConfirmUnmark() {
    setConfirmUnmark(false);
    await toggle(lesson.id);
  }

  // Modal de incentivo ao clicar numa aula extra ainda bloqueada
  const [lockedInfo, setLockedInfo] = useState<{ moduleTitle: string; remaining: number } | null>(null);

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
                  extrasUnlockedByModule={extrasUnlockedByModule}
                  moduleLocks={moduleLocks}
                  onLockedExtraClick={setLockedInfo}
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
            extrasUnlockedByModule={extrasUnlockedByModule}
            moduleLocks={moduleLocks}
            onLockedExtraClick={setLockedInfo}
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

      {/* Celebração de desbloqueio das aulas extras — uma vez por módulo (US-20) */}
      <Dialog
        open={celebrating !== null}
        onOpenChange={(o) => { if (!o) void handleCloseCelebration(); }}
        title="🎉 Aulas extras desbloqueadas!"
        description={
          celebratingModule
            ? `Você concluiu todas as aulas de "${celebratingModule.title}" e desbloqueou o conteúdo bônus:`
            : "Você desbloqueou o conteúdo bônus deste módulo:"
        }
      >
        <CelebrationList>
          {celebratingExtras.map((l) => (
            <CelebrationItem key={l.id}>★ {l.title}</CelebrationItem>
          ))}
        </CelebrationList>
        <DialogActions>
          <ConfirmBtn onClick={handleCloseCelebration}>Ver aulas extras</ConfirmBtn>
        </DialogActions>
      </Dialog>

      {/* Incentivo ao clicar numa aula extra ainda bloqueada (US-20) */}
      <Dialog
        open={lockedInfo !== null}
        onOpenChange={(o) => { if (!o) setLockedInfo(null); }}
        title="🔒 Conteúdo bônus bloqueado"
        description={
          lockedInfo && lockedInfo.remaining > 0
            ? `Falta${lockedInfo.remaining > 1 ? "m" : ""} ${lockedInfo.remaining} aula${lockedInfo.remaining > 1 ? "s" : ""} para desbloquear o bônus de "${lockedInfo.moduleTitle}". Conclua o módulo e o conteúdo extra é liberado automaticamente!`
            : `Conclua todas as aulas de "${lockedInfo?.moduleTitle}" para desbloquear o conteúdo bônus. Ele é liberado automaticamente!`
        }
      >
        <DialogActions>
          <PrimaryBtn onClick={() => setLockedInfo(null)}>Continuar assistindo</PrimaryBtn>
        </DialogActions>
      </Dialog>
    </Page>
  );
}
