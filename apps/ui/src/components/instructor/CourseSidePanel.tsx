"use client";

import React, { useState, useRef } from "react";
import styled from "styled-components";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useContext } from "react";
import { Icon } from "@/components/ui/Icon";
import { toast } from "sonner";
import { publishCourse, unpublishCourse, updateCourse, uploadCourseThumbnail, deleteCourse } from "@/lib/instructor";
import type { CourseEditorData, Category } from "@/lib/instructor";
import { useRouter } from "next/navigation";
import { CourseEditorContext } from "@/app/instructor/courses/[id]/layout";

const Panel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Card = styled.div`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const VisibilityRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`;

const VisibilityInfo = styled.div`
  flex: 1;
`;

const VisibilityTitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
`;

const VisibilityTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
`;

const VisibilityDesc = styled.div`
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-bottom: 12px;
`;

const StatusBadge = styled.span<{ $published: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 600;
  color: ${({ $published }) => ($published ? "var(--color-success)" : "var(--color-text-secondary)")};
  background: ${({ $published }) => ($published ? "rgba(34,197,94,0.12)" : "var(--color-surface-secondary)")};
  border: 1px solid ${({ $published }) => ($published ? "rgba(34,197,94,0.3)" : "var(--color-border)")};
  border-radius: 20px;
  padding: 3px 10px;
`;

const VisibilityActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const ThumbnailBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ThumbnailLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
`;

const ThumbnailPreview = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  inset: 0;
`;

const ThumbnailOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s;
  border-radius: 8px;
`;

const OverlayButton = styled(Button)`
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.4);
  color: #fff;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.7);
    color: #fff;
  }
`;

const DropZone = styled.div<{ $hasThumbnail: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  height: 160px;
  border: 2px dashed var(--color-border);
  border-radius: 10px;
  cursor: pointer;
  background: var(--color-surface-secondary);
  overflow: hidden;
  position: relative;
  transition: border-color 0.15s;

  &:hover {
    border-color: var(--color-text-secondary);
  }

  &:hover ${ThumbnailOverlay} {
    opacity: 1;
  }
`;

const DropHint = styled.div`
  text-align: center;
  padding: 16px;
`;

const DropText = styled.div`
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-bottom: 4px;
`;

const DropSub = styled.div`
  font-size: 11px;
  color: var(--color-text-tertiary);
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FieldLabel = styled(Label)`
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
`;

const DangerCard = styled.div`
  border: 1px solid rgba(239,68,68,0.3);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: rgba(239,68,68,0.06);
`;

const DangerHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`;

const DangerInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const DangerTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: var(--color-destructive);
`;

const DangerDesc = styled.div`
  font-size: 12px;
  color: var(--color-destructive);
  line-height: 1.5;
  opacity: 0.8;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
`;

const ConfirmLabel = styled.div`
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-bottom: 6px;

  strong {
    color: var(--color-text-primary);
    font-family: monospace;
  }
`;

const levelLabels: Record<string, string> = {
  beginner: "Iniciante",
  intermediate: "Intermediário",
  advanced: "Avançado",
};

interface CourseSidePanelProps {
  course: CourseEditorData;
  categories: Category[];
}

export function CourseSidePanel({ course, categories }: CourseSidePanelProps) {
  const router = useRouter();
  const ctx = useContext(CourseEditorContext);
  const [isPublished, setIsPublished] = useState(course.status === "published");
  const [thumbnailUrl, setThumbnailUrl] = useState(course.thumbnailUrl);
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(course.categoryId ?? "");
  const [selectedLevel, setSelectedLevel] = useState(course.level ?? "");
  const fileRef = useRef<HTMLInputElement>(null);
  const [publishing, setPublishing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function handleVisibilityToggle() {
    setPublishing(true);
    try {
      if (isPublished) {
        const result = await unpublishCourse(course.id);
        if (result.ok) { setIsPublished(false); toast.success("Curso movido para rascunho."); }
        else toast.error(result.error ?? "Erro ao mover para rascunho.");
      } else {
        const result = await publishCourse(course.id);
        if (result.ok) { setIsPublished(true); toast.success("Curso publicado!"); }
        else toast.error(result.error ?? "Erro ao publicar.");
      }
      router.refresh();
    } finally {
      setPublishing(false);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setUploading(true);
    const updated = await uploadCourseThumbnail(course.id, file);
    if (updated) setThumbnailUrl(updated.thumbnailUrl);
    setUploading(false);
  }

  async function handleRemoveThumbnail(e: React.MouseEvent) {
    e.preventDefault();
    await updateCourse(course.id, { thumbnailUrl: null });
    setThumbnailUrl(null);
    ctx?.notifySaved();
  }

  async function handleCategoryChange(value: string) {
    setSelectedCategory(value);
    await updateCourse(course.id, { categoryId: value || undefined });
    ctx?.notifySaved();
  }

  async function handleLevelChange(value: string) {
    setSelectedLevel(value);
    await updateCourse(course.id, { level: value });
    ctx?.notifySaved();
  }

  async function handleDelete() {
    setDeleting(true);
    await deleteCourse(course.id);
    router.push("/instructor");
  }

  return (
    <Panel>
      <Card>
        <VisibilityRow>
          <VisibilityInfo>
            <VisibilityTitleRow>
              <VisibilityTitle>Visibilidade no catálogo</VisibilityTitle>
              <StatusBadge $published={isPublished}>
                <Icon name={isPublished ? "visibility" : "draft"} size={13} />
                {isPublished ? "Publicado" : "Rascunho"}
              </StatusBadge>
            </VisibilityTitleRow>
            <VisibilityDesc>
              {isPublished
                ? "Qualquer pessoa pode encontrar e se inscrever."
                : "Somente você pode ver este curso."}
            </VisibilityDesc>
            <VisibilityActions>
              <Button
                size="sm"
                variant={isPublished ? "outline" : "default"}
                onClick={handleVisibilityToggle}
                disabled={publishing}
              >
                {publishing ? "Aguarde..." : isPublished ? "Mover para rascunho" : "Publicar"}
              </Button>
            </VisibilityActions>
          </VisibilityInfo>
        </VisibilityRow>
      </Card>

      <Card>
        <ThumbnailBox>
          <ThumbnailLabel>Capa do Curso</ThumbnailLabel>
          <DropZone $hasThumbnail={!!thumbnailUrl} as={thumbnailUrl ? "div" : "label"} {...(!thumbnailUrl ? { htmlFor: "thumbnail-upload" } : {})}>
            {thumbnailUrl ? (
              <>
                <ThumbnailPreview src={thumbnailUrl} alt="Capa do curso" />
                <ThumbnailOverlay>
                  <OverlayButton size="sm" variant="outline" onClick={() => fileRef.current?.click()}>
                    <Icon name="upload" size={14} />
                    Substituir
                  </OverlayButton>
                  <OverlayButton size="sm" variant="outline" onClick={handleRemoveThumbnail}>
                    <Icon name="delete" size={14} />
                    Remover
                  </OverlayButton>
                </ThumbnailOverlay>
              </>
            ) : (
              <DropHint>
                <DropText>{uploading ? "Enviando..." : "Arraste uma imagem ou clique para fazer upload"}</DropText>
                <DropSub>PNG, JPG até 2MB · 1280×720px recomendado</DropSub>
              </DropHint>
            )}
          </DropZone>
          <input
            id="thumbnail-upload"
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </ThumbnailBox>
      </Card>

      <Card>
        <FieldGroup>
          <FieldLabel htmlFor="course-category">Categoria</FieldLabel>
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger id="course-category">
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldGroup>

        <FieldGroup>
          <FieldLabel htmlFor="course-level">Nível</FieldLabel>
          <Select value={selectedLevel} onValueChange={handleLevelChange}>
            <SelectTrigger id="course-level">
              <SelectValue placeholder="Selecione o nível" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(levelLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldGroup>
      </Card>
      <DangerCard>
        <DangerHeader>
          <DangerInfo>
            <DangerTitle>Zona de perigo</DangerTitle>
            <DangerDesc>Remove permanentemente aulas, seções e inscrições.</DangerDesc>
          </DangerInfo>
          <Button
            size="sm"
            variant="outline"
            style={{ borderColor: 'var(--color-destructive)', color: 'var(--color-destructive)', flexShrink: 0 }}
            onClick={() => { setDeleteInput(""); setDeleteOpen(true); }}
          >
            Excluir
          </Button>
        </DangerHeader>
      </DangerCard>

      <Dialog
        open={deleteOpen}
        onOpenChange={(open) => { if (!deleting) setDeleteOpen(open); }}
        title="Excluir curso"
        description={`Esta ação é permanente e não pode ser desfeita. Todas as aulas, seções e inscrições serão removidas.`}
      >
        <ConfirmLabel>
          Para confirmar, escreva exatamente: <strong>{course.title}</strong>
        </ConfirmLabel>
        <Input
          value={deleteInput}
          onChange={(e) => setDeleteInput(e.target.value)}
          placeholder={course.title}
          autoFocus
        />
        <ModalFooter>
          <DialogClose asChild>
            <Button size="sm" variant="outline" disabled={deleting}>Cancelar</Button>
          </DialogClose>
          <Button
            size="sm"
            variant="destructive"
            disabled={deleteInput !== course.title || deleting}
            onClick={handleDelete}
          >
            {deleting ? "Excluindo..." : "Excluir permanentemente"}
          </Button>
        </ModalFooter>
      </Dialog>
    </Panel>
  );
}
