# ADR-022 — nestjs-i18n para internacionalização da API

**Data**: 2026-06-02
**Status**: Aceito
**Decisores**: Leandro Alves

---

## Contexto

Todas as mensagens voltadas ao usuário final na API (exceções HTTP, erros de
validação de DTO e e-mails transacionais) estavam embutidas em português do
Brasil diretamente no código. Para atender usuários de outros idiomas e
centralizar a manutenção dos textos, é necessário externalizar essas mensagens
em catálogos por idioma e resolver o idioma da resposta por requisição, com
suporte inicial a `pt-BR` (padrão) e `en`.

## Decisão

Adotar a biblioteca `nestjs-i18n` com catálogos JSON por idioma, resolução de
idioma via cabeçalho HTTP `Accept-Language` e `pt-BR` como idioma de fallback.

## Alternativas consideradas

| Opção | Prós | Contras |
|-------|------|---------|
| **`nestjs-i18n`** *(escolhida)* | Idiomática para NestJS; resolvers prontos (`Accept-Language`); integra com `class-validator` via pipe/filter; fallback configurável; catálogos JSON simples | Dependência adicional; acoplamento ao ecossistema da lib |
| Solução caseira (mapa de chaves + helper) | Zero dependências; controle total | Reimplementa resolução de idioma, fallback e integração com validação; mais código para manter |
| `i18next` puro | Maduro e popular no JS | Não integra nativamente com DI/pipes do NestJS; mais wiring manual |

## Consequências

**Positivas**:
- Mensagens centralizadas em catálogos por idioma, fáceis de revisar e estender.
- Negociação de idioma transparente para todas as rotas existentes via
  `Accept-Language`, sem mudança de contrato.
- Adicionar um novo idioma passa a ser criar um novo diretório de catálogo.

**Negativas / trade-offs**:
- Acoplamento ao ciclo de vida e às convenções do `nestjs-i18n`.
- Necessidade de manter o `HttpExceptionFilter` compatível com o filtro de
  validação i18n para preservar o shape de resposta `{ error, statusCode }`.

## Notas de implementação

- Registrar `I18nModule.forRoot({ fallbackLanguage: 'pt-BR', loaderOptions,
  resolvers: [AcceptLanguageResolver] })` em `app.module.ts`.
- Catálogos em `apps/api/src/i18n/i18n/<lang>/<namespace>.json`, com namespaces
  alinhados aos módulos (`auth`, `courses`, `lessons`, `enrollments`, `youtube`,
  `progress`, `validation`, `mail`).
- Resolver o idioma em services via `I18nContext.current()?.lang`.
- Manter os textos pt-BR idênticos aos atuais para evitar regressão.
