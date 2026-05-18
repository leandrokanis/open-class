# ADR-011 — React + Vite + TypeScript como stack da UI

**Data**: 2026-05-17
**Status**: Aceito
**Decisores**: Leandro Alves

---

## Contexto

O projeto precisava escolher uma stack frontend para iniciar a Fase 4 (UI: Telas Principais). A API NestJS já está implementada; a UI é o próximo container a ser construído. O monorepo usa TypeScript em toda a stack, e o PRD descreve uma experiência "inspirada na Udemy" — SPA responsiva com navegação fluida.

## Decisão

Usar React 18 + Vite + TypeScript como stack da aplicação `apps/ui`.

## Alternativas consideradas

| Opção | Prós | Contras |
|-------|------|---------|
| **React + Vite + TS** *(escolhida)* | Ecossistema maduro, DX excelente, TypeScript nativo, HMR rápido | Requer configuração inicial |
| Next.js | SSR, file-based routing | Overkill para self-hosted; adiciona complexidade de servidor Node extra |
| Vue 3 + Vite | Mais simples para iniciantes | Menor ecossistema; inconsistência com o resto da stack TS |
| Svelte/SvelteKit | Bundle mínimo | Ecossistema menor; menos bibliotecas de UI disponíveis |

## Consequências

**Positivas**:
- TypeScript unifica tipos entre API e UI (DTOs como fonte da verdade)
- Vite oferece HMR instantâneo e build otimizado
- Ecossistema React é amplamente conhecido, facilitando contribuições

**Negativas / trade-offs**:
- SPA pura: sem SSR por padrão (não é requisito para v1 self-hosted)
- SEO limitado sem SSR (aceitável: plataforma fechada, não indexada por buscadores)

## Notas de implementação

Inicializar com: `pnpm create vite apps/ui --template react-ts`
Configurar path aliases via `vite.config.ts` e `tsconfig.json` (`@/` → `src/`).
