"use client";

import React, { useState, useEffect, useContext, useRef } from "react";
import styled from "styled-components";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/Icon";
import { updateCourse } from "@/lib/instructor";
import type { CourseEditorData } from "@/lib/instructor";
import { CourseEditorContext } from "@/app/instructor/cursos/[id]/layout";

const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FieldLabel = styled(Label)`
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
`;

const UrlRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: var(--color-surface-secondary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  margin-top: 4px;
`;

const UrlText = styled.span`
  font-size: 12px;
  color: var(--color-text-secondary);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: monospace;
`;

interface CourseInfoFormProps {
  course: CourseEditorData;
}

export function CourseInfoForm({ course }: CourseInfoFormProps) {
  const ctx = useContext(CourseEditorContext);
  const [title, setTitle] = useState(course.title);
  const [description, setDescription] = useState(course.description ?? "");
  const [currentSlug, setCurrentSlug] = useState(course.slug);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");
  const isDirty = useRef(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  // Register slug so the layout preview button works
  useEffect(() => {
    ctx?.setSlug(currentSlug);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSlug]);

  // Auto-save with 800ms debounce after first change
  useEffect(() => {
    if (!isDirty.current) return;
    const timer = setTimeout(async () => {
      const updated = await updateCourse(course.id, { title, description: description || undefined });
      if (updated?.slug) {
        setCurrentSlug(updated.slug);
        ctx?.setSlug(updated.slug);
      }
      ctx?.notifySaved();
    }, 800);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description]);

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    isDirty.current = true;
    setTitle(e.target.value);
  }

  function handleDescriptionChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    isDirty.current = true;
    setDescription(e.target.value);
  }

  function handleCopy() {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;
    navigator.clipboard.writeText(`${base}/curso/${currentSlug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const publicUrl = `${origin}/curso/${currentSlug}`;

  return (
    <Form>
      <Field>
        <FieldLabel htmlFor="course-title">Título do Curso</FieldLabel>
        <Input
          id="course-title"
          value={title}
          onChange={handleTitleChange}
          maxLength={150}
          placeholder="Digite o título do curso"
        />
        <UrlRow>
          <UrlText title={publicUrl}>{publicUrl}</UrlText>
          <Button size="sm" variant="ghost" onClick={handleCopy} style={{ padding: "2px 6px", flexShrink: 0 }}>
            <Icon name={copied ? "check" : "content_copy"} size={14} />
            {copied ? "Copiado" : "Copiar"}
          </Button>
        </UrlRow>
      </Field>

      <Field>
        <FieldLabel htmlFor="course-description">Descrição</FieldLabel>
        <Textarea
          id="course-description"
          value={description}
          onChange={handleDescriptionChange}
          placeholder="Descreva o que o aluno vai aprender neste curso"
          style={{ minHeight: 120 }}
        />
      </Field>
    </Form>
  );
}
