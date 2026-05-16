# ADR-004 — PostgreSQL 16 como banco de dados

**Data**: 2026-05-16
**Status**: Aceito
**Decisores**: Leandro Alves

---

## Contexto

O projeto requer um banco de dados relacional para armazenar usuários, cursos, matrículas e progresso. O ambiente de produção alvo é homelab com recursos limitados; o ambiente de desenvolvimento usa Docker.

## Decisão

Usar **PostgreSQL 16** (imagem `postgres:16-alpine` no Docker Compose).

## Alternativas consideradas

| Opção | Prós | Contras |
|-------|------|---------|
| **PostgreSQL 16** *(escolhido)* | Robusto, ACID, excelente suporte Drizzle, imagem Alpine pequena, Railway/Supabase nativos | Requer processo separado (não embedded) |
| SQLite | Zero infra, embedded, ideal para homelab mínimo | Sem suporte a conexões concorrentes, sem `uuid_generate_v4()`, sem enum nativo |
| MySQL / MariaDB | Amplamente usado, compatível com muitos hosts | Semântica de tipos diferente do PostgreSQL; suporte Drizzle menos maduro |
| PlanetScale (MySQL serverless) | Escalável, branching de schema | Serverless = latência variável; vendor lock-in; incompatível com self-hosted |

## Consequências

**Positivas**:
- `uuid` como PK nativo — sem necessidade de extensão `uuid-ossp` (PostgreSQL 13+ inclui `gen_random_uuid()`).
- `pgEnum` suportado nativamente no Drizzle — roles (`aluno`, `instrutor`, `admin`) são enums SQL reais.
- Compatibilidade direta com Railway e Supabase para deploy cloud sem mudança de driver.
- Imagem Alpine reduz footprint do container (~80 MB vs ~350 MB da imagem padrão).

**Negativas / trade-offs**:
- Requer container separado no Compose, adicionando complexidade ao setup local.
- Não é adequado para deploy em ambientes sem Docker (e.g., shared hosting barato).

## Configuração de produção

- Local: Docker Compose com volume persistente `pgdata`.
- Cloud: Railway (Postgres managed) ou Supabase — mesma `DATABASE_URL`, sem alteração de código.
