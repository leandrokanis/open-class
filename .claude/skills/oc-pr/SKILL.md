---
name: "oc-pr"
description: "Cria o pull request da feature ativa do open-class com título em conventional commits, template padronizado e fechamento automático da issue. Use sempre que o usuário quiser abrir um PR, publicar uma feature, criar pull request ou mandar para revisão."
argument-hint: "Tipo do commit opcional (feat, fix, chore…) e escopo"
user-invocable: true
---

## Entrada do usuário

```text
$ARGUMENTS
```

Se fornecido, use como dica do tipo/escopo do conventional commit (ex: `feat(reviews)`, `fix(enrollments)`).

---

## Etapa 1 — Coletar contexto

Execute os comandos abaixo e guarde os resultados:

```bash
git branch --show-current          # branch atual
git log main..HEAD --oneline       # commits desta branch em relação à main
git diff main...HEAD --stat        # arquivos alterados
```

Leia `.current-plan.md` para obter `feature_directory`, `spec` e `plan`.

Se o `plan.md` existir, leia-o para extrair: módulo(s) alterado(s), endpoints criados/modificados e entidades.

---

## Etapa 2 — Extrair o número da issue

Do nome da branch (resultado do `git branch --show-current`), extraia o número da issue com a mesma lógica do `/oc-specify`:

- Primeiro grupo de dígitos após ignorar prefixos como `feat/`, `fix/`, `chore/`, `feature/`
- Exemplos: `feat/42-student-reviews` → `42`, `42-student-reviews` → `42`

Se não encontrar número, pare e informe: "Não encontrei número de issue na branch. Confirme a branch ou informe o número manualmente."

---

## Etapa 3 — Montar o título (conventional commits)

Formato: `<type>(<scope>): <descrição imperativa em inglês>`

**Tipos permitidos**:

| Tipo | Quando usar |
|------|-------------|
| `feat` | Nova funcionalidade para o usuário |
| `fix` | Correção de bug |
| `refactor` | Mudança de código sem novo comportamento |
| `perf` | Melhoria de performance |
| `test` | Adição ou correção de testes |
| `chore` | Tarefas de manutenção, deps, config |
| `docs` | Documentação |

**Escopo**: nome do módulo NestJS principal alterado (`courses`, `enrollments`, `users`, etc.). Omita se a mudança for transversal.

**Regras do título**:
- Imperativo, sem ponto final: "add student reviews" não "added student reviews" nem "adding student reviews."
- Máximo 72 caracteres
- Minúsculas

**Exemplos**:
- `feat(reviews): add student course review system`
- `fix(enrollments): prevent duplicate enrollment on retry`
- `refactor(lessons): extract youtube validation to service`

Se `$ARGUMENTS` informar tipo/escopo, priorize. Caso contrário, derive dos commits e arquivos alterados.

---

## Etapa 4 — Fazer commit e push (se necessário)

1. Verifique se há arquivos não commitados:
   ```bash
   git status --short
   ```
2. Se houver, pare e oriente: "Há alterações não commitadas. Faça commit antes de abrir o PR."
3. Verifique se a branch tem upstream:
   ```bash
   git status -sb | head -1
   ```
4. Se não tiver upstream, faça push:
   ```bash
   git push -u origin <branch>
   ```

---

## Etapa 5 — Criar o PR

Use o template abaixo. Substitua todos os placeholders com informação real — nunca deixe placeholder literal no PR.

```bash
gh pr create \
  --title "<título conventional commit>" \
  --body "$(cat <<'EOF'
## O que muda

<1–3 frases descrevendo o que foi implementado e por quê. Foco no valor, não na técnica.>

## Detalhes técnicos

<Bullet points com as mudanças relevantes:>
- <módulo / arquivo principal alterado e o que faz>
- <entidade criada/modificada, se houver>
- <endpoint novo, se houver: METHOD /rota — descrição>
- <migration, se houver>

## Como testar

- [ ] <passo 1 para verificar o comportamento principal>
- [ ] <passo 2 — caso de borda ou erro esperado>
- [ ] Testes unitários passando: `cd apps/api && pnpm vitest run`

## Checklist

- [ ] Testes escritos e passando
- [ ] Swagger atualizado (se endpoint novo)
- [ ] Sem `console.log` ou código de debug
- [ ] Migration gerada e aplicada localmente

Closes #<ISSUE_NUMBER>
EOF
)"
```

---

## Etapa 6 — Reportar

Após criar o PR, informe:
- URL do PR
- Título usado
- Issue fechada: `Closes #<N>`
