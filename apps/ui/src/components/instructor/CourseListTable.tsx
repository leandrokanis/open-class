"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Icon } from "@/components/ui/Icon";
import { publishCourse, unpublishCourse } from "@/lib/instructor";
import type { CourseListItem } from "@/lib/instructor";

const Wrapper = styled.div`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--color-border);
  gap: 16px;
  flex-wrap: wrap;
`;

const Title = styled.h2`
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-primary);
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SearchWrapper = styled.div`
  position: relative;
  width: 180px;

  svg {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    color: var(--color-text-secondary);
  }

  input {
    padding-left: 30px;
    height: 36px;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
`;

const FilterBtn = styled.button<{ $active: boolean }>`
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  background: ${({ $active }) => ($active ? "var(--color-primary)" : "transparent")};
  color: ${({ $active }) => ($active ? "var(--color-text-on-primary)" : "var(--color-text-secondary)")};
  transition: background 0.15s, color 0.15s;

  &:hover {
    background: ${({ $active }) => ($active ? "var(--color-primary)" : "var(--color-surface-tertiary)")};
    color: ${({ $active }) => ($active ? "var(--color-text-on-primary)" : "var(--color-text-primary)")};
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  padding: 10px 16px;
  text-align: left;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-secondary);
  background: var(--color-surface-secondary);
  border-bottom: 1px solid var(--color-border);
`;

const Td = styled.td`
  padding: 14px 16px;
  font-size: 14px;
  color: var(--color-text-primary);
  border-bottom: 1px solid var(--color-border);
  vertical-align: middle;
`;

const CourseCell = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Thumbnail = styled.div<{ $url?: string | null }>`
  width: 40px;
  height: 40px;
  border-radius: 6px;
  background: ${({ $url }) =>
    $url
      ? `url(${$url}) center/cover no-repeat`
      : "linear-gradient(135deg, #3b82f6, #6366f1)"};
  flex-shrink: 0;
`;

const CourseLink = styled(Link)`
  font-weight: 600;
  color: var(--color-text-primary);
  text-decoration: none;
  display: block;
  margin-bottom: 2px;
  &:hover {
    text-decoration: underline;
    color: var(--color-primary);
  }
`;

const CourseDate = styled.div`
  font-size: 12px;
  color: var(--color-text-secondary);
`;

const Rating = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
  color: var(--color-text-primary);
`;

const Star = styled.span`
  color: var(--color-warning, #f59e0b);
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const StatusWrap = styled.div`
  width: 130px;
`;

const Empty = styled.div`
  padding: 48px;
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 14px;
`;

const Dash = styled.span`
  color: var(--color-text-tertiary);
`;

type FilterType = "all" | "published" | "draft";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatRating(rating: string | null) {
  if (!rating) return null;
  return Number(rating).toFixed(1);
}

interface CourseListTableProps {
  initialCourses: CourseListItem[];
}

export function CourseListTable({ initialCourses }: CourseListTableProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  const visible = initialCourses.filter((c) => {
    const matchFilter =
      filter === "all" ||
      (filter === "published" && c.status === "published") ||
      (filter === "draft" && c.status === "draft");
    const matchSearch =
      search === "" || c.title.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  async function handleStatusChange(id: string, newStatus: string) {
    if (newStatus === "published") {
      const result = await publishCourse(id);
      if (result.ok) {
        toast.success("Curso publicado com sucesso!");
      } else {
        toast.error(result.error ?? "Erro ao publicar curso.");
      }
    } else {
      const result = await unpublishCourse(id);
      if (result.ok) {
        toast.success("Curso despublicado.");
      } else {
        toast.error(result.error ?? "Erro ao despublicar curso.");
      }
    }
    startTransition(() => router.refresh());
  }

  return (
    <Wrapper>
      <TableHeader>
        <Title>Meus Cursos</Title>
        <Controls>
          <SearchWrapper>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <Input
              placeholder="Buscar curso..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </SearchWrapper>
          <FilterGroup>
            <FilterBtn $active={filter === "all"} onClick={() => setFilter("all")}>Todos</FilterBtn>
            <FilterBtn $active={filter === "published"} onClick={() => setFilter("published")}>Publicados</FilterBtn>
            <FilterBtn $active={filter === "draft"} onClick={() => setFilter("draft")}>Rascunhos</FilterBtn>
          </FilterGroup>
        </Controls>
      </TableHeader>

      <Table>
        <thead>
          <tr>
            <Th>Curso</Th>
            <Th>Alunos</Th>
            <Th>Status</Th>
            <Th>Avaliação</Th>
            <Th>Aulas</Th>
            <Th>Ações</Th>
          </tr>
        </thead>
        <tbody>
          {visible.length === 0 ? (
            <tr>
              <td colSpan={6}>
                <Empty>Nenhum curso encontrado.</Empty>
              </td>
            </tr>
          ) : (
            visible.map((course) => {
              const rating = formatRating(course.rating);
              return (
                <tr key={course.id}>
                  <Td>
                    <CourseCell>
                      <Thumbnail $url={course.thumbnailUrl} />
                      <div>
                        <CourseLink href={`/instructor/cursos/${course.id}`}>
                          {course.title}
                        </CourseLink>
                        <CourseDate>Última edição: {formatDate(course.updatedAt)}</CourseDate>
                      </div>
                    </CourseCell>
                  </Td>
                  <Td>
                    {course.enrollmentCount != null ? (
                      course.enrollmentCount.toLocaleString("pt-BR")
                    ) : (
                      <Dash>—</Dash>
                    )}
                  </Td>
                  <Td>
                    <StatusWrap>
                      <Select
                        value={course.status}
                        onValueChange={(val) => handleStatusChange(course.id, val)}
                        disabled={isPending}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="published">Publicado</SelectItem>
                          <SelectItem value="draft">Rascunho</SelectItem>
                        </SelectContent>
                      </Select>
                    </StatusWrap>
                  </Td>
                  <Td>
                    {rating ? (
                      <Rating>
                        <Star>★</Star>
                        {rating}
                      </Rating>
                    ) : (
                      <Dash>—</Dash>
                    )}
                  </Td>
                  <Td>{course.lessonCount ?? <Dash>—</Dash>}</Td>
                  <Td>
                    <Actions>
                      <Button size="sm" variant="outline" onClick={() => router.push(`/instructor/cursos/${course.id}`)}>
                        <Icon name="edit" size={16} />
                        Editar
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => window.open(`/curso/${course.slug}`, "_blank")}>
                        <Icon name="open_in_new" size={16} />
                        Ver
                      </Button>
                    </Actions>
                  </Td>
                </tr>
              );
            })
          )}
        </tbody>
      </Table>
    </Wrapper>
  );
}
