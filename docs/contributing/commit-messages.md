# Diretrizes de mensagem de commit

Seguimos [Conventional Commits](https://www.conventionalcommits.org/) com as convenções abaixo.

---

## Formato

```
<tipo>(<escopo>): <descrição>

[corpo opcional]

[rodapé opcional]
```

### Regras da linha de assunto

- Tipo e escopo em minúsculas
- Descrição em **inglês**, modo imperativo, sem ponto final
- Máximo **72 caracteres** na linha de assunto
- Escopo é opcional mas recomendado quando a mudança é localizada

**Bom**: `feat(enrollments): prevent duplicate enrollment on retry`  
**Ruim**: `feat: added enrollment duplication fix.`

---

## Tipos

| Tipo | Quando usar |
|------|-------------|
| `feat` | Nova funcionalidade visível ao usuário ou ao sistema |
| `fix` | Correção de bug |
| `refactor` | Mudança de código sem alterar comportamento externo |
| `perf` | Melhoria de performance |
| `test` | Adição ou correção de testes |
| `docs` | Documentação, ADRs, diagramas, READMEs |
| `chore` | Dependências, config, build, CI — sem impacto em runtime |
| `style` | Formatação pura (espaços, vírgulas) sem mudança de lógica |

---

## Escopo

Use o nome do módulo NestJS, pacote ou área do projeto afetada:

`auth`, `courses`, `enrollments`, `lessons`, `modules`, `users`, `categories`, `db`, `ui`, `ci`, `docker`

Omita o escopo apenas quando a mudança for genuinamente transversal (ex: renomear variável de ambiente usada em todo o projeto).

---

## Corpo

Use quando a linha de assunto não é suficiente para explicar **por quê** a mudança foi feita. Separe do assunto com uma linha em branco.

```
fix(lessons): clamp YouTube duration to zero on parse error

The YouTube API occasionally returns negative durations for
live streams that ended abruptly. Clamping to 0 prevents the
duration field from being saved as a negative integer.
```

Não use o corpo para listar o que foi alterado — isso é responsabilidade do diff.

---

## Rodapé

Use para referenciar issues ou indicar breaking changes:

```
Closes #42
BREAKING CHANGE: the `duration` field is now always a non-negative integer
```

---

## Breaking changes

Adicione `!` após o tipo/escopo e explique no rodapé:

```
feat(auth)!: replace cookie-based auth with Bearer token

BREAKING CHANGE: clients must now send Authorization header instead of cookie
```

---

## Exemplos

```
feat(reviews): add student course review endpoint
fix(enrollments): return 409 when enrollment already exists
refactor(courses): extract slug generation to shared util
perf(lessons): add index on module_id for lesson queries
test(users): add unit tests for password reset flow
docs(decisions): add ADR-011 for object storage strategy
chore(db): upgrade drizzle-orm to 0.40.0
```
