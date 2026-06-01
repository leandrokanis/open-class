# PRD — Open Class: Plataforma de Cursos Online Open Source e Self-Hosted

**Versão:** 1.0  
**Data:** 2026-05-15  
**Status:** Draft  
**Autor:** Leandro Alves  

---

## 1. Resumo Executivo

Open Class é uma plataforma de cursos online open source, sem fins lucrativos e focada exclusivamente em conteúdo gratuito. Inspirada na experiência de uso da Udemy, a plataforma é projetada desde o dia zero para ser self-hosted em ambientes homelab, consumindo poucos recursos e sendo facilmente personalizável sob o modelo white-label.

O sistema não hospeda vídeos internamente: todo o conteúdo audiovisual é distribuído via embed do YouTube, eliminando os custos e complexidade de armazenamento de mídia. Instrutores organizam o conteúdo em cursos, módulos e aulas; alunos acompanham seu progresso de forma persistente.

O projeto é publicado sob licença open source permissiva (MIT ou Apache 2.0), incentivando comunidades, instituições de ensino, ONGs e projetos independentes a deployarem sua própria instância com identidade visual própria sem qualquer custo de licenciamento.

---

## 2. Declaração do Problema

### Problema Central

Comunidades técnicas, educadores independentes e organizações sem fins lucrativos que desejam oferecer conteúdo educacional estruturado dependem de plataformas comerciais (Udemy, Teachable, Hotmart) que impõem:

- Custos de hospedagem e licenciamento
- Lock-in de dados e conteúdo
- Impossibilidade de personalização de marca
- Cobrança obrigatória ou comissão por transação
- Inexistência de opção self-hosted

Soluções open source existentes (Moodle, Open edX) são complexas demais para deploy simples em homelab, exigem infraestrutura robusta e não são otimizadas para consumo de recursos mínimo.

### Impacto

Educadores e comunidades comprometidos com o ensino gratuito não têm uma alternativa moderna, leve e com boa UX para publicar e organizar seus conteúdos.

---

## 3. Objetivos e Metas

### Objetivos de Produto

1. Entregar uma plataforma de cursos funcionalmente comparável à Udemy em UX, mas sem qualquer mecanismo de pagamento.
2. Tornar o deploy tão simples quanto executar `docker compose up`.
3. Garantir que toda instância seja white-label pronta para uso.
4. Manter o consumo de RAM/CPU compatível com VPS de entrada (512MB RAM / 1 vCPU).
5. Eliminar dependência de armazenamento de mídia próprio via integração com YouTube.

### Metas Mensuráveis (para v1.0)


| Meta                | Indicador                                               | Target           |
| ------------------- | ------------------------------------------------------- | ---------------- |
| Deploy simples      | Tempo do `git clone` ao sistema funcional               | &lt; 5 minutos   |
| Performance         | RAM em idle (todos os serviços)                         | &lt; 256MB       |
| Cobertura funcional | User stories essenciais implementadas                   | 100%             |
| White-label         | Campos configuráveis via env/admin                      | ≥ 5              |
| Progresso           | % de aulas marcadas como concluídas salvas corretamente | 100% de precisão |


---

## 4. Personas de Usuário

### Persona 1 — O Instrutor Comunitário

**Nome:** Carlos, 34 anos, desenvolvedor de software  
**Contexto:** Mantém um canal no YouTube com tutoriais e quer organizar o conteúdo em trilhas de aprendizado estruturadas.  
**Objetivos:** Cadastrar cursos vinculados aos seus vídeos do YouTube, organizar módulos, acompanhar engajamento.  
**Frustrações:** Plataformas pagas cobram comissão; Moodle é muito complexo para manter.  
**Necessidades:** Interface simples para cadastrar cursos, embed automático do YouTube, painel leve.

---

### Persona 2 — O Aluno Autodidata

**Nome:** Beatriz, 22 anos, estudante universitária  
**Contexto:** Busca conteúdo gratuito e estruturado para aprender programação.  
**Objetivos:** Encontrar cursos, acompanhar progresso, retomar aulas de onde parou.  
**Frustrações:** Conteúdo gratuito disperso no YouTube sem organização curricular.  
**Necessidades:** Interface limpa, marcação de progresso, histórico de aulas concluídas.

---

### Persona 3 — O Administrador da Instância (SysAdmin / Mantenedor)

**Nome:** Diego, 28 anos, entusiasta de homelab  
**Contexto:** Hospeda serviços auto-gerenciados em um servidor local usando CasaOS ou Coolify.  
**Objetivos:** Deploy sem atrito, configuração via variáveis de ambiente, atualizações simples.  
**Frustrações:** Aplicações que exigem muitos serviços, dependências complexas ou documentação escassa.  
**Necessidades:** Docker Compose funcional, imagem leve, documentação clara, variáveis de ambiente documentadas.

---

### Persona 4 — O Gestor da Organização (Admin de Conteúdo)

**Nome:** Fernanda, 41 anos, coordenadora de ONG educacional  
**Contexto:** Lidera uma organização que produz conteúdo educacional gratuito e quer uma plataforma com a identidade visual da ONG.  
**Objetivos:** Customizar logo, cores e nome da plataforma; gerenciar instrutores e cursos.  
**Necessidades:** Painel administrativo web, configuração white-label acessível, sem necessidade de programar.

---

## 5. Histórias de Usuário e Requisitos

### Epic 1 — Autenticação e Gerenciamento de Usuários

#### US-01 — Registro de conta

```
Como visitante,
Quero criar uma conta com e-mail e senha,
Para ter acesso ao conteúdo e acompanhar meu progresso.

Critérios de Aceitação:
- Formulário com campos: nome, e-mail, senha (mín. 8 chars), confirmação de senha
- Validação de e-mail único no sistema
- Senha armazenada com hash seguro (bcrypt ou argon2)
- Redirecionamento ao dashboard após registro bem-sucedido
- Opção de desativar registro público via variável de ambiente (ALLOW_REGISTRATION=false)
```

#### US-02 — Login e sessão

```
Como usuário cadastrado,
Quero fazer login com e-mail e senha,
Para acessar minha conta e continuar meus cursos.

Critérios de Aceitação:
- Sessão persistida via JWT ou cookie seguro (httpOnly)
- Opção "Lembrar de mim" (sessão de 30 dias)
- Logout invalida o token/sessão
- Mensagem de erro genérica para credenciais inválidas (não expor qual campo está errado)
```

#### US-03 — Perfil do usuário

```
Como usuário autenticado,
Quero editar meu perfil (nome, avatar, bio),
Para personalizar minha presença na plataforma.

Critérios de Aceitação:
- Campos editáveis: nome de exibição, bio curta (máx. 300 chars)
- Upload de avatar (imagem, máx. 2MB, formatos: jpg/png/webp)
- Senha pode ser alterada mediante confirmação da senha atual
```

#### US-04 — Recuperação de senha

```
Como usuário que esqueceu a senha,
Quero receber um link de redefinição por e-mail,
Para recuperar o acesso à minha conta.

Critérios de Aceitação:
- Link com token de uso único, expiração em 1 hora
- E-mail enviado via SMTP configurável por variável de ambiente
- Página de redefinição com confirmação da nova senha
```

#### US-05 — Login e cadastro com Google (OAuth)

```
Como visitante,
Quero entrar na plataforma usando minha conta Google,
Para criar ou acessar minha conta sem precisar gerenciar uma senha separada.

Critérios de Aceitação:
- Botão "Entrar com Google" visível nas telas de login e registro
- Fluxo OAuth 2.0 via Google Identity (redirect ou popup)
- Campos obrigatórios: GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET via variável de ambiente
- Se o e-mail retornado pelo Google ainda não existe na plataforma: cria conta automaticamente com nome e avatar do perfil Google
- Se o e-mail já existe (conta criada com senha): vincula o provedor Google à conta existente; usuário pode usar ambos os métodos no futuro
- Conta vinculada ao Google pode definir senha local posteriormente (via configurações de perfil)
- O botão "Entrar com Google" é exibido apenas quando GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET estão configurados; caso contrário, a opção é ocultada automaticamente
- Registro via Google respeita a variável ALLOW_REGISTRATION: se false, novos usuários são bloqueados mesmo via OAuth
- Avatar importado do Google pode ser substituído pelo usuário após o cadastro
```

---

### Epic 2 — Catálogo e Descoberta de Cursos

#### US-05 — Listar cursos disponíveis

```
Como visitante ou aluno,
Quero ver o catálogo de cursos disponíveis,
Para descobrir conteúdos de meu interesse.

Critérios de Aceitação:
- Listagem com card: thumbnail, título, instrutor, categoria, nível, total de aulas
- Paginação ou scroll infinito
- Filtros por: categoria, nível (iniciante/intermediário/avançado), 
- Campo de busca por título e descrição
- Cursos sem nenhuma aula publicada não aparecem no catálogo público
```

#### US-06 — Visualizar detalhes do curso

```
Como visitante ou aluno,
Quero ver a página de detalhes de um curso,
Para entender o conteúdo antes de começar.

Critérios de Aceitação:
- Exibição: thumbnail, título, descrição longa, instrutor, nível, total de horas estimadas
- Currículo expandível: lista de módulos e aulas (com duração)
- Primeira aula de cada módulo acessível como prévia (sem login)
- Botão "Começar curso" / "Continuar" dependendo do estado do aluno
- Indicador de progresso para alunos já inscritos
```

#### US-07 — Busca de cursos

```
Como aluno,
Quero buscar cursos por palavra-chave,
Para encontrar rapidamente conteúdo sobre um tema específico.

Critérios de Aceitação:
- Busca em tempo real (debounce de 300ms)
- Resultados incluem: título, descrição, tags
- Exibe "nenhum resultado encontrado" com sugestões quando aplicável
```

---

### Epic 3 — Aprendizado e Progresso

#### US-08 — Assistir a uma aula

```
Como aluno,
Quero assistir a aulas em vídeo via embed do YouTube,
Para consumir o conteúdo no contexto organizado da plataforma.

Critérios de Aceitação:
- Player do YouTube embeddado de forma responsiva (aspect-ratio 16:9)
- Exibição de: título da aula, descrição textual opcional, recursos anexos (links)
- Navegação para aula anterior / próxima dentro do módulo
- Ao final do vídeo (evento onStateChange do YouTube API), marcar aula como concluída automaticamente e avançar para próxima aula
- Usuário pode marcar/desmarcar manualmente "Concluída"
```

#### US-09 — Rastrear progresso

```
Como aluno,
Quero que meu progresso seja salvo automaticamente,
Para retomar os estudos de onde parei.

Critérios de Aceitação:
- Percentual de conclusão do curso calculado: (aulas concluídas / total de aulas) × 100
- Última aula acessada é registrada por curso
- Dashboard do aluno exibe todos os cursos com progresso
- Progresso preservado mesmo após logout/login
```

#### US-10 — Histórico de aprendizado

```
Como aluno,
Quero visualizar meu histórico de aulas concluídas,
Para acompanhar minha evolução ao longo do tempo.

Critérios de Aceitação:
- Lista cronológica de aulas concluídas com data e curso
- Acesso via painel "Meu Aprendizado"
- Filtro por curso
```

#### US-20 — Desbloquear e acessar aulas extras do módulo

```
Como aluno,
Quero desbloquear e acessar aulas extras de um módulo após concluir todas as aulas normais,
Para acessar conteúdo bônus exclusivo como recompensa pelo meu avanço.

Critérios de Aceitação:
- Aulas extras aparecem no currículo do módulo com indicação visual de bloqueio (ex: ícone de cadeado) antes do desbloqueio
- O desbloqueio ocorre automaticamente quando o aluno conclui todas as aulas normais visíveis do módulo
- Alunos que já tinham concluído todas as aulas normais antes de o instrutor adicionar as extras têm as extras desbloqueadas automaticamente
- Ao acessar o módulo pela primeira vez após o desbloqueio, um pop-up modal celebra o evento e exibe as aulas extras disponíveis
- O pop-up de celebração é exibido apenas uma vez por módulo por aluno
- Aulas extras não são contabilizadas no percentual de progresso do curso; somente aulas normais determinam 100%
- Aulas extras não são contabilizadas no tempo total estimado do módulo nem do curso
- Após o desbloqueio, as aulas extras são assistidas normalmente via player YouTube embed
- Aulas extras concluídas são registradas no histórico de aprendizado do aluno
```

---

### Epic 4 — Criação e Gestão de Conteúdo (Instrutor)

#### US-11 — Criar curso

```
Como instrutor,
Quero criar um novo curso,
Para organizar e publicar meu conteúdo.

Critérios de Aceitação:
- Campos obrigatórios: título, descrição curta (máx. 200 chars), descrição longa, categoria, nível
- Upload de thumbnail (imagem, máx. 2MB, proporção recomendada 16:9)
- Status: rascunho (padrão) ou publicado
- Curso em rascunho não aparece no catálogo público
```

#### US-12 — Gerenciar módulos e aulas

```
Como instrutor,
Quero organizar o curso em módulos e aulas,
Para criar uma estrutura curricular clara.

Critérios de Aceitação:
- Adicionar, editar, reordenar e excluir módulos via drag-and-drop
- Dentro de cada módulo: adicionar, editar, reordenar e excluir aulas
- Cada aula possui: título, descrição opcional, URL do vídeo YouTube, duração (automática via youtube), recursos (links externos)
- Validação de URL do YouTube ao salvar a aula
- Pré-visualização do embed antes de salvar
```

#### US-13 — Publicar e despublicar curso

```
Como instrutor,
Quero controlar a visibilidade do meu curso,
Para publicá-lo somente quando estiver pronto.

Critérios de Aceitação:
- Toggle "Publicar / Despublicar" acessível no painel do curso
- Ao publicar: curso requer pelo menos 1 módulo com 1 aula
- Ao despublicar: curso some do catálogo mas progresso de alunos é preservado
- Alunos já inscritos continuam acessando curso despublicado
```

#### US-14 — Controlar visibilidade de módulos e aulas

```
Como instrutor,
Quero ocultar ou exibir módulos e aulas individualmente,
Para publicar conteúdo de forma gradual sem despublicar o curso inteiro.

Critérios de Aceitação:
- Cada módulo possui toggle de visibilidade: "Visível" / "Oculto"
- Cada aula possui toggle de visibilidade: "Visível" / "Oculto"
- Módulo oculto: não aparece no currículo público nem na página do curso
- Aula oculta: não aparece na listagem do módulo para alunos; não é contabilizada no cálculo de progresso
- Aula oculta que já foi concluída por um aluno mantém seu registro, mas é excluída do progresso a partir da ocultação
- Instrutor visualiza módulos e aulas ocultos no painel de edição com indicação visual (ex.: ícone de olho riscado)
- Módulo com todas as aulas ocultas é automaticamente tratado como oculto no catálogo público
- Administrador pode substituir a visibilidade de qualquer módulo ou aula pelo painel administrativo
```

#### US-15 — Painel do instrutor

```
Como instrutor,
Quero visualizar métricas básicas dos meus cursos,
Para entender o engajamento do meu conteúdo.

Critérios de Aceitação:
- Lista de cursos com: status, total de alunos inscritos, taxa de conclusão média
- Detalhe por curso: aulas com maior e menor taxa de conclusão
```

#### US-21 — Adicionar aulas extras a um módulo

> **Depende de**: US-12

```
Como instrutor,
Quero marcar aulas de um módulo como "extras",
Para oferecer conteúdo bônus acessível apenas após o aluno concluir o currículo normal do módulo.

Critérios de Aceitação:
- Na edição do módulo, o instrutor pode marcar qualquer aula como "extra" via toggle
- Aulas extras são exibidas em seção separada no painel de edição do módulo, com indicação visual distinta das aulas normais
- O instrutor pode reordenar aulas extras independentemente das aulas normais
- Aulas extras seguem o mesmo formato de aula normal: título, descrição opcional, URL YouTube, duração
- Ao marcar uma aula como "extra", ela passa a aparecer bloqueada para alunos que ainda não concluíram todas as aulas normais do módulo
- Alunos que já concluíram todas as aulas normais do módulo têm as extras desbloqueadas automaticamente no momento da adição
- O painel de edição exibe, por módulo, quantos alunos já desbloquearam as aulas extras
```

---

### Epic 5 — Administração da Plataforma

#### US-15 — Painel administrativo

```
Como administrador,
Quero um painel para gerenciar usuários, cursos e configurações,
Para operar a plataforma sem necessidade de acesso direto ao banco de dados.

Critérios de Aceitação:
- Listagem e busca de usuários (nome, e-mail, papel, data de cadastro)
- Ações sobre usuários: promover a instrutor, promover a admin, desativar conta
- Listagem de todos os cursos com status e instrutor
- Ações sobre cursos: publicar, despublicar, excluir (soft delete)
- Painel acessível somente para usuários com papel "admin"
```

#### US-16 — Gerenciamento de categorias

```
Como administrador,
Quero criar e gerenciar categorias de cursos,
Para organizar o catálogo de forma clara.

Critérios de Aceitação:
- CRUD de categorias (nome, slug, descrição, ícone opcional)
- Categorias usadas por cursos não podem ser excluídas (ou exibir aviso)
- Reordenação de categorias por drag-and-drop
```

---

### Epic 6 — White-label e Configuração

#### US-18 — Configuração de identidade visual

```
Como administrador,
Quero personalizar a identidade visual da plataforma,
Para que a instância reflita a marca da minha organização.

Critérios de Aceitação:
- Campos configuráveis via painel admin ou variáveis de ambiente:
  - Nome da plataforma (APP_NAME)
  - Logo principal (upload de imagem SVG/PNG)
  - Favicon
  - Cor primária (hex) e cor de destaque
  - Tipografia (seleção de Google Fonts pré-aprovadas ou fonte customizada via URL)
  - Descrição/slogan da plataforma
  - Links de rodapé (ex.: GitHub, comunidade, suporte)
- Mudanças aplicadas sem necessidade de rebuild da imagem
- Variáveis de ambiente têm precedência sobre configurações do painel
```

#### US-19 — Configuração de e-mail

```
Como administrador,
Quero configurar o servidor SMTP da plataforma,
Para que e-mails transacionais sejam enviados com meu domínio.

Critérios de Aceitação:
- Campos: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, SMTP_SECURE (TLS/SSL)
- Configuráveis via variáveis de ambiente
- Botão "Testar configuração" no painel admin (envia e-mail de teste)
```

---

## 6. Métricas de Sucesso

### Métricas de Adoção (pós-lançamento open source)


| Métrica                                 | Objetivo (3 meses pós-lançamento) |
| --------------------------------------- | --------------------------------- |
| Stars no repositório GitHub             | ≥ 200                             |
| Forks ativos                            | ≥ 30                              |
| Instâncias reportadas (via opt-in ping) | ≥ 10                              |
| Issues reportadas vs. fechadas          | Ratio ≥ 0,8 (saúde do projeto)    |


### Métricas de Performance Técnica


| Métrica                                                   | Target                  |
| --------------------------------------------------------- | ----------------------- |
| Tempo de carregamento da página inicial (LCP)             | &lt; 2,5s em conexão 4G |
| Consumo de RAM em idle (todos os containers)              | &lt; 256MB              |
| Tempo de build da imagem Docker                           | &lt; 3 minutos          |
| Tempo do `docker compose up --build` ao sistema funcional | &lt; 5 minutos          |
| Tamanho total das imagens Docker (comprimidas)            | &lt; 500MB              |


### Métricas de Qualidade de Produto


| Métrica                                              | Target |
| ---------------------------------------------------- | ------ |
| Cobertura de testes (backend)                        | ≥ 80%  |
| Score de acessibilidade (Lighthouse)                 | ≥ 85   |
| Score de performance (Lighthouse)                    | ≥ 80   |
| Ausência de vulnerabilidades críticas (OWASP Top 10) | 100%   |


---

## 7. Escopo

### Dentro do Escopo (v1.0)

- Autenticação com e-mail e senha (registro, login, logout, recuperação de senha)
- Papéis de usuário: aluno, instrutor, administrador
- Catálogo de cursos com busca e filtros
- Organização de conteúdo em cursos &gt; módulos &gt; aulas
- Embed de vídeos do YouTube via API do YouTube IFrame Player
- Rastreamento de progresso por aula (concluída / não concluída)
- Dashboard do aluno com progresso por curso
- Painel do instrutor para criação e gerenciamento de conteúdo
- Painel administrativo para gestão de usuários, cursos e categorias
- Configuração white-label (nome, logo, cores, tipografia) via painel e/ou env vars
- Internacionalização (i18n) com suporte inicial a Português (pt-BR) e Inglês (en)
- Containerização completa com Docker e Docker Compose
- Documentação de deploy (README, variáveis de ambiente, guia de atualização)
- Licença open source (MIT)

### Fora do Escopo (v1.0 e definitivamente)

- Mecanismos de pagamento, cobrança, checkout, assinatura
- Upload ou processamento de arquivos de vídeo
- Transmissões ao vivo (live streaming)
- Avaliações, notas e certificados (considerado para v2.0)
- Fórum ou chat integrado (considerado para v2.0)
- Aulas extras com desbloqueio por progresso e gamificação (considerado para v2.0 — US-20, US-21)
- App mobile nativo
- Integração com outros provedores de vídeo (Vimeo, etc.) — fora do escopo v1.0
- CDN própria ou gerenciamento de assets de mídia pesados

---

## 8. Considerações Técnicas

### Arquitetura Geral

O projeto não inclui proxy reverso na stack. A aplicação expõe sua porta diretamente; a camada de exposição pública é responsabilidade do operador da instância, permitindo integração nativa com qualquer solução de ingress já existente no homelab.

**Opção A — Cloudflare Tunnel (recomendada para homelab sem IP fixo):**

```
Internet → Cloudflare Edge (TLS) ─── cloudflared (host) ───▶ porta local
                                                                    │
                          ┌─────────────────────────────────────────┘
                          │           Docker Compose
                          │
                  ┌───────▼──────┐    ┌──────────────────┐
                  │   Next.js    │───▶│   API (REST)     │
                  │  (SSR/CSR)   │    │  Node.js/NestJS  │
                  └──────────────┘    └────────┬─────────┘
                                               │
                                      ┌────────▼─────────┐
                                      │   PostgreSQL     │
                                      └──────────────────┘
```

**Opção B — Proxy reverso do painel (Coolify, CasaOS, Nginx Proxy Manager):**

```
Internet → Proxy reverso do painel (TLS) ───▶ porta local do container
```

O `cloudflared` é instalado diretamente no host e configurado fora do `docker-compose.yml`, apontando para a porta exposta pelo container do frontend.

### Stack Tecnológica (Proposta)


| Camada         | Tecnologia                | Justificativa                                             |
| -------------- | ------------------------- | --------------------------------------------------------- |
| Frontend       | Next.js (App Router)      | SSR/SSG para SEO, ecossistema React maduro                |
| UI             | Tailwind CSS + shadcn/ui  | Leveza, customização de tema via CSS variables            |
| Backend        | NestJS + Express          | Arquitetura modular, convenções claras, TypeScript nativo |
| ORM            | Drizzle ORM               | Type-safe, migrações simples, sem CLI pesado              |
| Banco de dados | PostgreSQL                | Confiável, suportado nativamente em Coolify/CasaOS        |
| Auth           | Lucia Auth ou NextAuth v5 | Sessões seguras sem dependência de serviço externo        |
| Exposição      | Cloudflare Tunnel (host)  | TLS automático sem abrir portas, sem proxy no compose     |
| Container      | Docker + Docker Compose   | Padrão da indústria, suportado em CasaOS e Coolify        |
| Monorepo       | Turborepo                 | Build incremental, workspaces npm                         |


### Requisitos de Infraestrutura Mínimos


| Recurso       | Mínimo                             |
| ------------- | ---------------------------------- |
| RAM           | 512MB (recomendado: 1GB)           |
| CPU           | 1 vCPU                             |
| Armazenamento | 5GB (thumbnails, avatares, assets) |
| SO            | Linux (qualquer distro com Docker) |


### Variáveis de Ambiente Essenciais

```env
# App
APP_NAME="Open Class"
APP_URL="https://meudominio.com"
ALLOW_REGISTRATION=true

# Banco de dados
DATABASE_URL="postgresql://user:pass@db:5432/openclass"

# Auth
AUTH_SECRET="chave-secreta-256-bits"

# E-mail
SMTP_HOST=""
SMTP_PORT=587
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM="noreply@meudominio.com"

# White-label
BRAND_PRIMARY_COLOR="#6366f1"
BRAND_ACCENT_COLOR="#f59e0b"
```

### Integrações Externas


| Serviço                   | Uso                     | Dependência                            |
| ------------------------- | ----------------------- | -------------------------------------- |
| YouTube IFrame Player API | Embed de vídeos         | Requer acesso à internet no cliente    |
| Google Fonts              | Tipografia customizável | Opcional (pode ser servido localmente) |
| SMTP externo              | E-mails transacionais   | Opcional (funciona sem e-mail)         |


### Segurança

- Senhas: hash com argon2id
- CSRF: tokens em formulários stateful
- Rate limiting: nas rotas de auth (login, registro, recuperação)
- Headers de segurança: configurados na camada da aplicação (Next.js headers config / middleware) e reforçados pelo Cloudflare (CSP, HSTS, X-Frame-Options)
- Inputs: sanitização e validação com Zod
- SQL: uso exclusivo de ORM com prepared statements (sem SQL raw)
- Dependências: varredura automática via `npm audit` no CI

### Compatibilidade com Painéis Homelab


| Painel     | Nível de Suporte                   |
| ---------- | ---------------------------------- |
| Coolify    | Nativo (compose stack)             |
| CasaOS     | Via docker-compose.yml customizado |
| Portainer  | Via stack compose                  |
| Bare metal | docker compose up                  |


---

## 9. Requisitos de Design e UX

### Princípios de Design

1. **Clareza acima de densidade**: Cada tela tem um objetivo principal.
2. **Mobile-first**: Layout responsivo para dispositivos 320px–1920px.
3. **Acessibilidade**: Conformidade com WCAG 2.1 AA (contraste, foco, ARIA labels).
4. **Performance percebida**: Skeleton screens durante carregamento, sem spinner bloqueante.
5. **White-label nativo**: Sistema de tokens de design (CSS custom properties) para que cores e fontes sejam trocáveis globalmente.

### Telas Essenciais (v1.0)

- Home / Catálogo de cursos
- Página de detalhes do curso
- Player de aula (com sidebar de currículo)
- Dashboard do aluno ("Meu Aprendizado")
- Painel do instrutor (gestão de cursos)
- Painel administrativo
- Telas de autenticação (login, registro, recuperação)
- Configurações de perfil do usuário
- Configurações da plataforma (admin)

---

## 10. Cronograma e Marcos

> **Estratégia de build:** API-first. A interface é implementada somente após os contratos da API estarem estáveis, evitando retrabalho por suposições feitas no frontend.

---

### Fase 1 — Fundação (Semanas 1–2)

Infraestrutura e autenticação completa no backend.

- [x] Setup do monorepo (Turborepo, workspaces npm)
- [x] Docker Compose: PostgreSQL + API (NestJS) + Frontend shell (Next.js inerte)
- [ ] CI/CD básico (lint, typecheck, testes unitários)
- [x] Modelo de dados inicial — schema Drizzle + primeiras migrations
  - `users`, `sessions`, `roles`
- [x] Módulo de autenticação (API)
  - Registro com e-mail e senha (argon2id)
  - Login com JWT (httpOnly cookie)
  - Recuperação de senha via SMTP
  - OAuth Google (opcional via env vars)
  - Rate limiting nas rotas de auth

---

### Fase 2 — API: Conteúdo (Semanas 3–5)

CRUD completo de cursos, módulos e aulas.

- [ ] Migrations: `courses`, `modules`, `lessons`, `enrollments`
- [ ] Módulo de cursos (API)
  - CRUD completo (instrutor)
  - Upload de thumbnail
  - Publicar / despublicar
  - Visibilidade por módulo e por aula
- [ ] Módulo de aulas (API)
  - Validação de URL do YouTube
  - Busca automática de duração via YouTube Data API v3
  - Recursos (links externos) por aula
  - Reordenação de módulos e aulas
- [ ] Sistema de papéis e permissões (guards NestJS)
  - `aluno`, `instrutor`, `admin`

---

### Fase 3 — API: Catálogo, Progresso e Admin (Semanas 6–8)

Endpoints de consumo de conteúdo e administração.

- [ ] Migrations: `progress`, `categories`, `platform_config`
- [ ] Módulo de catálogo (API)
  - Listagem pública com filtros (categoria, nível) e busca (título, descrição)
  - Paginação por cursor
  - Endpoint de detalhes do curso (currículo expandido)
- [ ] Módulo de progresso (API)
  - Marcar aula como concluída / não concluída
  - Percentual de conclusão por curso
  - Última aula acessada por curso
- [ ] Módulo administrativo (API)
  - CRUD de usuários (promover, desativar)
  - Gestão de cursos (publicar, despublicar, excluir soft)
  - CRUD de categorias com reordenação
- [ ] Módulo white-label (API)
  - Leitura e escrita de configurações (nome, logo, cores, tipografia)
  - Env vars com precedência sobre banco

---

### Fase 4 — UI: Telas Principais (Semanas 9–12)

Implementação da interface com contratos de API já estáveis.

- [ ] Setup de design system (shadcn/ui + tokens de tema via CSS variables)
- [ ] Telas de autenticação (login, registro, recuperação de senha)
- [ ] Home / Catálogo de cursos (busca, filtros, paginação)
- [ ] Página de detalhes do curso
- [ ] Player de aula (embed YouTube + currículo lateral + marcação de progresso)
- [ ] Dashboard do aluno ("Meu Aprendizado")
- [ ] Painel do instrutor
  - Visão geral (métricas)
  - Editor de curso (informações + currículo)
  - Editor de aula (link YouTube + recursos + visibilidade)
- [ ] Painel administrativo (usuários, cursos, categorias)
- [ ] Configurações de perfil do usuário
- [ ] Configurações da plataforma (white-label, SMTP)

---

### Fase 5 — Qualidade e Release (Semanas 13–16)

- [ ] i18n — pt-BR (padrão) e en
- [ ] Testes de integração end-to-end (Playwright)
- [ ] Otimização de performance (LCP &lt; 2,5s, RAM idle &lt; 256MB)
- [ ] Otimização das imagens Docker (&lt; 500MB total comprimido)
- [ ] Documentação completa (README, guia de deploy, variáveis de ambiente, guia de atualização)
- [ ] Checklist OWASP Top 10
- [ ] Release v1.0 + publicação open source (MIT)

---

## 11. Riscos e Mitigação


| Risco                                            | Probabilidade | Impacto | Mitigação                                                                       |
| ------------------------------------------------ | ------------- | ------- | ------------------------------------------------------------------------------- |
| YouTube bloquear embed em instâncias self-hosted | Baixa         | Alto    | Documentar domínios confiáveis; instruir sobre allowedDomains na API            |
| Consumo de recursos maior que o esperado         | Média         | Alto    | Benchmarks contínuos; limite de conexões DB; cache de páginas estáticas         |
| Baixa adoção da comunidade                       | Média         | Médio   | Documentação excelente, demo público, presença no HackerNews/Reddit             |
| Acumulação de scope creep durante dev            | Alta          | Médio   | PRD como contrato; backlog separado para v2.0                                   |
| Vulnerabilidades de segurança                    | Baixa         | Alto    | OWASP Top 10 checklist no PRE-MERGE; dependabot ativo                           |
| Complexidade do white-label atrasar entrega      | Média         | Baixo   | CSS variables como implementação mínima; configuração de painel como incremento |


---

## 12. Dependências e Premissas

### Dependências

- Usuário final tem acesso à internet para que os embeds do YouTube funcionem no navegador
- Instância requer PostgreSQL (fornecido no compose)
- Envio de e-mail depende de SMTP externo configurado (opcional, mas necessário para recuperação de senha)

### Premissas

- O conteúdo publicado pelos instrutores já existe no YouTube como vídeo público ou não-listado
- A plataforma não é responsável pelo conteúdo dos vídeos (responsabilidade do instrutor/instância)
- O administrador da instância é responsável pela conformidade legal do conteúdo publicado
- Não haverá SaaS gerenciado; cada organização opera sua própria instância

---

## 13. Questões em Aberto


| #   | Questão                                                                              | Decisão Necessária                             |
| --- | ------------------------------------------------------------------------------------ | ---------------------------------------------- |
| 1   | Permitir que visitantes (não cadastrados) vejam aulas, ou exigir login?              | UX vs. fricção de cadastro                     |
| 2   | Certificados de conclusão fazem parte do v1.0 ou v2.0?                               | Definido como v2.0, confirmar                  |
| 3   | Opt-in de telemetria anônima para o mantenedor do projeto?                           | Questão de privacidade e governança            |
| 4   | Suporte a SSO (OAuth com Google/GitHub) no v1.0?                                     | Simplifica onboarding mas adiciona dependência |
| 5   | Limite de tamanho de thumbnail/avatar armazenados localmente?                        | Impacto em armazenamento do servidor           |
| 6   | Internacionalização de conteúdo (cursos em múltiplos idiomas com UI correspondente)? | Complexidade vs. alcance global                |
| 7   | Aulas extras (US-20/US-21) pertencem ao v1.0 ou v2.0?                               | **Decidido**: v2.0 — gamificação fora do escopo do MVP                 |


---

## 14. Glossário


| Termo       | Definição                                                                           |
| ----------- | ----------------------------------------------------------------------------------- |
| Self-hosted | Aplicação hospedada e operada pelo próprio usuário em sua infraestrutura            |
| Homelab     | Servidor doméstico ou de pequena escala usado para auto-hospedagem                  |
| White-label | Sistema que permite personalização de marca sem alterar o código-fonte              |
| Embed       | Incorporação de conteúdo externo (vídeo YouTube) dentro de uma página da plataforma |
| Soft delete | Marcar registro como inativo sem removê-lo fisicamente do banco de dados            |
| Instrutor   | Usuário com permissão para criar e gerenciar cursos                                 |
| Admin       | Usuário com acesso total ao painel de administração da instância                    |


---

*Este documento é um artefato vivo. Atualizações devem ser versionadas e comunicadas aos contribuidores do projeto.*