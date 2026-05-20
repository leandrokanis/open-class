'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createResource, deleteResource } from '@/lib/instructor';
import type { Resource } from '@/lib/instructor';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Item = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
`;

const ResourceLabel = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: #1e293b;
  flex-shrink: 0;
`;

const ResourceUrl = styled.a`
  font-size: 12px;
  color: #3b82f6;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;


const AddForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  border: 1px dashed #cbd5e1;
  border-radius: 6px;
`;

const FormRow = styled.div`
  display: flex;
  gap: 8px;
`;


interface ResourceListProps {
  lessonId: string;
  initialResources: Resource[];
}

export default function ResourceList({ lessonId, initialResources }: ResourceListProps) {
  const [resources, setResources] = useState<Resource[]>(initialResources);
  const [showForm, setShowForm] = useState(false);
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleAdd() {
    if (!label.trim() || !url.trim()) return;
    setSaving(true);
    const created = await createResource(lessonId, { label: label.trim(), url: url.trim() });
    if (created) {
      setResources((prev) => [...prev, created]);
      setLabel('');
      setUrl('');
      setShowForm(false);
    }
    setSaving(false);
  }

  async function handleRemove(resourceId: string) {
    setResources((prev) => prev.filter((r) => r.id !== resourceId));
    await deleteResource(lessonId, resourceId);
  }

  return (
    <Wrapper>
      {resources.map((r) => (
        <Item key={r.id}>
          <ResourceLabel>{r.label}</ResourceLabel>
          <ResourceUrl href={r.url} target="_blank" rel="noopener noreferrer">
            {r.url}
          </ResourceUrl>
          <Button variant="ghost" size="sm" onClick={() => handleRemove(r.id)} title="Remover recurso" style={{ color: '#94a3b8', padding: '2px 6px' }}>✕</Button>
        </Item>
      ))}
      {showForm ? (
        <AddForm>
          <FormRow>
            <Input
              placeholder="Rótulo (ex: Documentação MDN)"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
            <Input
              placeholder="URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              type="url"
            />
          </FormRow>
          <FormRow>
            <Button size="sm" onClick={handleAdd} disabled={saving || !label.trim() || !url.trim()}>
              {saving ? 'Adicionando...' : 'Adicionar'}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setShowForm(false); setLabel(''); setUrl(''); }}>
              Cancelar
            </Button>
          </FormRow>
        </AddForm>
      ) : (
        <Button size="sm" variant="ghost" onClick={() => setShowForm(true)} style={{ paddingLeft: 0 }}>+ Adicionar link</Button>
      )}
    </Wrapper>
  );
}
