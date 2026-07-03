# Gamificação das Turmas — Projeto Octalysis

**Status**: Registrado no PRD — Epic 8 (US-27 a US-32)
**Escopo alvo**: v2.0, junto ao Epic 7 — Turmas
**Data**: 2026-07-02
**Framework**: [Octalysis](https://yukaichou.com/gamification-examples/octalysis-complete-gamification-framework/) (Yu-kai Chou)

---

## 1. Objetivo

Aumentar a **taxa de conclusão de cursos**. Essa é a única métrica-mãe do
projeto: toda mecânica descrita aqui existe para que o aluno que começa um
curso chegue ao fim dele.

A aposta central: em turmas, **sincronia vale mais que volume**. O aluno que
acompanha o conteúdo da semana, andando junto com o grupo, tem probabilidade
muito maior de concluir do que o aluno que acumula atraso — mesmo que este
tenha assistido mais aulas em termos absolutos. O jogo inteiro premia estar
em dia.

## 2. Decisões estruturais (fechadas em interrogatório)

| # | Decisão | Valor |
|---|---------|-------|
| 1 | Métrica-alvo | Taxa de conclusão de cursos |
| 2 | Tom motivacional | Balanceado com urgência: base White Hat + Black Hat real (perda de streak, prazos, competição) |
| 3 | Arena do jogo | **Exclusivamente turmas** (Epic 7). On-demand fica só com o desbloqueio de aulas bônus (US-20) |
| 4 | Ativação | **Sempre ativa** em toda turma — sem toggle de instrutor nem de admin. Gamificação é parte da definição de turma |
| 5 | Valor central do XP | Sincronia: estar em dia com o conteúdo da semana > assistir todas as aulas |
| 6 | Streak | **Semanal** — completar o conteúdo da semana mantém a chama; falhar uma semana quebra |
| 7 | Ranking | **Só por turma** — sem ranking global, por curso ou entre turmas |

## 3. O modelo em uma frase

> Cada semana a turma libera um bloco de conteúdo; quem completa o bloco
> dentro da semana mantém sua chama acesa, ganha XP cheio e sobe no ranking
> da turma; quem atrasa recupera com XP reduzido; quem falha a semana perde
> a chama.

---

## 4. Os 8 Core Drives aplicados

O Octalysis organiza a motivação humana em 8 impulsos. Abaixo, como cada um
se manifesta (ou deliberadamente não se manifesta) nas turmas do open-class.

### CD1 — Significado Épico & Chamado

*O jogador acredita que faz parte de algo maior que ele.*

- **Meta coletiva da turma** *(proposta)*: a turma tem um objetivo
  compartilhado visível — ex.: "70% da turma concluindo o curso". O painel
  mostra o progresso coletivo: "Estamos a 12 alunos da meta da turma".
  Concluir deixa de ser ato individual e vira contribuição ao grupo.
- A narrativa de coorte ("nós começamos juntos, terminamos juntos") é o
  antídoto White Hat para a pressão Black Hat das outras mecânicas.

### CD2 — Desenvolvimento & Realização

*Progresso visível, superação de desafios, senso de competência.*

- **XP de sincronia** (fechado): concluir aula do bloco da semana corrente
  gera XP cheio; concluir aula de semana já encerrada gera XP reduzido.
  O placar reflete quem anda junto, não quem maratona.
- **Ranking da turma** (fechado): classificação por XP dentro da turma.
- **Marcos de conclusão** *(proposta)*: conquistas por módulo concluído no
  prazo, curso concluído, todas as semanas em dia ("turma perfeita").
- **Celebrações** *(proposta)*: modal de celebração ao fechar a semana em
  dia e ao concluir módulos — o padrão já definido na US-20 estende-se aqui.

### CD3 — Empoderamento da Criatividade & Feedback

*O jogador experimenta, vê o resultado, ajusta.*

- Deliberadamente **mínimo nesta fase**. O modelo de aprendizado do
  open-class (videoaulas YouTube) não tem espaço natural para criação.
- O feedback existe na forma de painel pessoal: onde estou na semana, quanto
  falta, como está minha chama.

### CD4 — Propriedade & Posse

*O jogador valoriza o que é dele e quer melhorar/acumular.*

- **A chama (streak) é o bem do aluno**: semanas consecutivas em dia. É
  acumulada, exibida no perfil dentro da turma e — pela dor de perdê-la —
  alimenta também o CD8.
- **Histórico de conquistas** *(proposta)*: badges ganhos ficam permanentes
  no perfil do aluno, mesmo após o fim da turma.
- Sem economia de troca: XP não é gastável. Decisão de simplicidade.

### CD5 — Influência Social & Pertencimento

*Comparação, companheirismo, competição, inveja produtiva.*

- **Ranking da turma** (fechado): a arena social é o grupo que começou
  junto — comparação justa, coorte única.
- **Visibilidade do ritmo do grupo** *(proposta)*: "78% da turma já concluiu
  o conteúdo desta semana" — prova social que puxa o atrasado mais forte que
  qualquer notificação.
- **Exibição no ranking** *(proposta, em aberto)*: nome + avatar, top 10 +
  posição própria destacada. Alternativa mais conservadora: mostrar apenas
  posição própria e o top 3.

### CD6 — Escassez & Impaciência

*Querer o que é raro, limitado ou ainda inacessível.*

- **Aulas exclusivas de turma** (já no PRD — US-25): conteúdo que só existe
  ali e fica inacessível após o encerramento. Escassez real, já especificada.
- **Vagas limitadas e período de inscrição** (já no PRD — US-22/23): a turma
  em si já é um objeto escasso; a gamificação herda essa moldura.
- **Conteúdo da semana ainda bloqueado**: o cronograma por módulo (US-22)
  cria a antecipação do "abre semana que vem".

### CD7 — Imprevisibilidade & Curiosidade

*O que vem a seguir? O cérebro precisa saber.*

- **Desbloqueio de aulas bônus** (US-20, adaptado à turma): concluir o bloco
  da semana pode revelar conteúdo extra não anunciado no cronograma.
- **Recompensas-surpresa** *(proposta, dosagem mínima)*: eventualmente, fechar
  uma semana em dia revela um bônus inesperado (aula extra, badge raro).
  Usar com parcimônia — imprevisibilidade demais em educação vira ruído.

### CD8 — Perda & Evitação

*Agir para não perder o que já se tem.*

- **Perda da chama** (fechado): falhar uma semana zera o streak. É a
  principal alavanca de urgência do sistema — e é honesta: o prazo é real
  (o cronograma da turma), não fabricado.
- **Prazo semanal visível** (fechado): contagem regressiva da semana corrente
  no painel da turma ("3 dias para fechar a semana 4").
- **Aviso de chama em risco** *(proposta)*: notificação quando a semana está
  acabando e o bloco não foi concluído — o momento de maior alavancagem
  comportamental do sistema.
- **Limite ético**: a perda máxima é o streak e a posição no ranking. Nunca
  se perde progresso de curso, acesso a conteúdo regular nem certificação.

---

## 5. Balanço White Hat × Black Hat

| Lado | Mecânicas | Papel |
|------|-----------|-------|
| **White Hat** (sustenta) | Meta coletiva (CD1), XP e marcos (CD2), chama como posse (CD4) | Fazem o aluno *querer* continuar semana após semana |
| **Black Hat** (urgência) | Prazo semanal (CD6/8), perda da chama (CD8), ranking (CD5/8), exclusividade que expira (CD6) | Fazem o aluno agir *esta semana*, não "depois" |

O tom decidido é **balanceado com urgência**: o Black Hat aqui não é
artificial — deriva do fato pedagógico de que a turma tem cronograma real.
A âncora de segurança é o limite ético do CD8: nada além de streak e ranking
é perdível.

## 6. Jornada do jogador (4 fases)

### Discovery — antes de entrar
O aluno vê na página do curso que existe uma turma com vagas, cronograma e
elementos de jogo (ranking, chama, aulas exclusivas). A escassez de vagas
(CD6) e a promessa social (CD5) diferenciam a turma do botão on-demand.

### Onboarding — semana 1
Primeira semana concluída = primeira chama + primeiro XP + primeira posição
no ranking. A primeira vitória deve ser garantida e celebrada (CD2): o bloco
da semana 1 deve ser projetado para ser vencível por qualquer aluno.

### Scaffolding — o meio do curso
O ciclo semanal roda: abre bloco → estuda → fecha semana → mantém chama →
sobe/defende posição. As semanas do meio são onde cursos morrem; aqui operam
juntos o hábito (CD4), a prova social (CD5) e o medo de perder a chama (CD8).

### Endgame — reta final e encerramento
A meta coletiva (CD1) domina: "a turma está chegando junto". Conclusão gera
o marco máximo; badges e histórico permanecem no perfil (CD4) após o fim da
turma. O encerramento da turma também fecha o acesso às aulas exclusivas
(CD6 — já especificado na US-25), dando peso real ao "termine com a turma".

## 7. Catálogo de mecânicas

| Mecânica | Core drives | Status |
|----------|------------|--------|
| XP de sincronia (cheio na semana, reduzido atrasado) | CD2 | **Decidido** |
| Chama semanal (streak de semanas em dia) | CD4, CD8 | **Decidido** |
| Ranking por turma (XP) | CD2, CD5 | **Decidido** |
| Prazo semanal com contagem regressiva | CD6, CD8 | **Decidido** |
| Aulas exclusivas de turma que expiram | CD6 | **Já no PRD** (US-25) |
| Desbloqueio de aulas bônus por progresso | CD7 | **Já no PRD** (US-20, adaptar à turma) |
| Meta coletiva da turma | CD1 | Proposta |
| Marcos/badges (módulo no prazo, turma perfeita, conclusão) | CD2, CD4 | Proposta |
| Prova social ("78% da turma em dia") | CD5 | Proposta |
| Aviso de chama em risco | CD8 | Proposta |
| Recompensa-surpresa ocasional | CD7 | Proposta (dosagem mínima) |
| Celebrações de fechamento de semana/módulo | CD2 | Proposta |

## 8. Questões em aberto — **todas resolvidas na rodada de PRD (Epic 8)**

1. **Valores de XP** — ✅ aula em dia: 10 XP; aula atrasada: 5 XP; módulo
   concluído no prazo: bônus de 20 XP (US-27).
2. **Exibição do ranking** — ✅ top 10 com nome + avatar; posição própria
   sempre visível e destacada (US-29).
3. **Meta coletiva** — ✅ fixa em 70% de conclusão, sem configuração —
   coerente com a decisão de gamificação sempre ativa (US-31).
4. **Catálogo de badges** — ✅ quatro: Primeira semana, Módulo no prazo,
   Turma perfeita (sem reacendimento), Formado na turma (US-32).
5. **Notificações** — ✅ in-app sempre; e-mail adicional quando SMTP estiver
   configurado, com degradação graciosa (US-30).
6. **Recuperação de chama** — ✅ reacendimento único por turma: na primeira
   falha, recuperar todo o atraso até o fim da semana seguinte restaura a
   chama; depois, perda definitiva (US-28).

## 9. Métricas de sucesso

| Métrica | O que indica |
|---------|--------------|
| Taxa de conclusão em turmas vs. on-demand do mesmo curso | Se o jogo cumpre o objetivo |
| % de alunos em dia por semana (curva ao longo da turma) | Saúde da sincronia — a métrica operacional |
| Retenção de chama (distribuição de streaks) | Se o custo de manter é realista |
| Abandono após perda de chama | **Alerta**: se perder a chama derruba o aluno, o Black Hat está pesado demais |

A última métrica é o disjuntor do design: se a perda de streak correlacionar
com abandono, revisitar o CD8 (introduzir o "perdão" da questão 6).

## 10. Relação com o PRD

- **Epic 7 — Turmas (US-22 a US-26)**: infraestrutura sobre a qual todo este
  design opera (cronograma por módulo, inscrições, aulas exclusivas, painel
  do instrutor). A gamificação pressupõe o Epic 7 implementado.
- **US-20 / US-21 — Aulas extras**: mecânica de desbloqueio reaproveitada
  como recompensa de sincronia dentro de turmas.
- **Epic 8 — Gamificação das Turmas (US-27 a US-32)**: registro deste design
  no PRD, com as questões da seção 8 resolvidas. A implementação segue após a
  entrega do Epic 7.
