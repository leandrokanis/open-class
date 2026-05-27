# Open Class

**A self-hosted, open source LMS for communities that believe education should be free.**

Open Class is a lightweight learning management system designed to run on a homelab. No vendor lock-in, no licensing fees, no hosted video — just a clean platform for organizing and sharing knowledge via YouTube embeds.

---

## Why Open Class?

Existing open source LMS platforms (Moodle, Open edX) are powerful but notoriously heavy — hard to deploy, expensive to run, and overwhelming for small teams. Commercial platforms (Udemy, Teachable) impose transaction fees, data lock-in, and mandatory branding.

Open Class is for communities, independent educators, and non-profits who want:

- A **modern UI** that feels like a real product, not a 2005 admin panel
- **Self-hosted control** — your data, your domain, your brand
- **Zero infrastructure cost** for video — content is delivered via YouTube embeds
- **One `docker compose up`** to get running

---

## Features

- **Courses & curriculum** — organize content into modules and lessons with drag-and-drop reordering
- **YouTube-powered lessons** — paste a video URL, duration is fetched automatically
- **Student enrollment & progress tracking** — per-lesson completion, course progress percentage
- **Instructor panel** — dark-themed editor with 4-column layout (activity bar · curriculum · editor · properties)
- **Authentication** — email/password + Google OAuth, JWT sessions
- **Role-based access** — `aluno`, `instrutor`, `admin`
- **White-label ready** — CSS variables for full theme customization
- **Swagger docs** — full API documentation at `/api/docs`
- **MCP Server** — expose courses, users, and enrollments as tools/resources consumable by AI agents (Claude Code, Claude Desktop)

---

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 16 · React · styled-components · shadcn/ui |
| Backend | NestJS 11 · Passport JWT · Swagger |
| Database | PostgreSQL 16 · Drizzle ORM |
| Monorepo | pnpm workspaces · Turborepo |
| Deploy | Docker · Docker Compose |

---

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose v2
- A [YouTube Data API v3](https://console.cloud.google.com/) key (optional — only needed for automatic duration detection)

### 1. Clone the repo

```bash
git clone https://github.com/leandrokanis/open-class.git
cd open-class
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set at minimum:

```env
JWT_SECRET=change-me-in-production

# Optional: enables Google login
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:41701/auth/google/callback

# Optional: enables automatic lesson duration detection
YOUTUBE_API_KEY=

# Optional: outbound email
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
```

### 3. Start

```bash
docker compose up -d
```

| Service | URL |
|---------|-----|
| UI | http://localhost:41700 |
| API | http://localhost:41701 |
| Swagger | http://localhost:41701/api/docs |

The first user to register automatically becomes `admin`.

---

## Development

### Requirements

- Node.js 20+
- pnpm 9+
- PostgreSQL 16 (or `docker compose up db -d`)

### Setup

```bash
pnpm install

# Start the database
docker compose up db -d

# Apply migrations
cd packages/db && pnpm drizzle-kit migrate && cd ../..

# Run everything in dev mode
pnpm dev
```

The API runs on `:3001` and the UI on `:3000`.

### Project structure

```
open-class/
├── apps/
│   ├── api/          # NestJS — auth, courses, lessons, enrollments, progress
│   └── ui/           # Next.js — student dashboard, instructor panel, lesson player
├── packages/
│   ├── db/           # Drizzle schema + migrations (shared by API)
│   └── mcp-server/   # MCP server — exposes platform data/actions to AI agents
└── docs/
    ├── prd.md
    ├── architecture/  # C4 diagrams
    └── decisions/     # Architecture Decision Records (ADRs)
```

### Running tests

```bash
# API unit tests
cd apps/api && pnpm test

# MCP server unit tests
cd packages/mcp-server && pnpm test

# Watch mode
cd apps/api && pnpm test:watch
```

---

## Configuration reference

All configuration is done via environment variables. See the full reference in [`docker-compose.yml`](./docker-compose.yml).

| Variable | Default | Description |
|----------|---------|-------------|
| `JWT_SECRET` | `change-me-in-production` | Secret for signing JWT tokens. **Change this.** |
| `JWT_EXPIRES_IN` | `100y` | Token expiry |
| `ALLOW_REGISTRATION` | `true` | Set to `false` to disable new signups |
| `DB_PORT` | `54170` | Host port for PostgreSQL |
| `API_PORT` | `41701` | Host port for the API |
| `UI_PORT` | `41700` | Host port for the UI |
| `YOUTUBE_API_KEY` | — | Enables duration auto-detection on lesson save |
| `GOOGLE_CLIENT_ID` | — | Enables Google OAuth login |
| `COOKIE_SECURE` | `false` | Set to `true` when serving over HTTPS |
| `FRONTEND_URL` | `http://localhost:41700` | CORS allowed origins (comma-separated) |

---

## API

The REST API is fully documented with Swagger at `/api/docs` when the server is running.

Key resources:

| Resource | Base path |
|----------|-----------|
| Auth | `POST /api/auth/login`, `POST /api/auth/register` |
| Courses | `GET /api/courses`, `POST /api/courses` |
| Modules | `GET /api/courses/:id`, `POST /api/courses/:id/modules` |
| Lessons | `GET /api/lessons/:id`, `POST /api/modules/:id/lessons` |
| Enrollments | `POST /api/enrollments`, `POST /api/enrollments/admin` |
| Progress | `GET /api/progress/courses/:id` |
| Admin | `GET /api/admin/users`, `GET /api/admin/courses` |

---

## MCP Server

Open Class ships an [MCP (Model Context Protocol)](https://modelcontextprotocol.io/) server that exposes platform data and actions as tools/resources consumable by AI agents such as Claude Code and Claude Desktop.

### Quick setup with Claude Code

Build the server and add it to your Claude Code config:

```bash
cd packages/mcp-server && pnpm build
```

Add to `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "open-class": {
      "command": "node",
      "args": ["/absolute/path/to/open-class/packages/mcp-server/dist/index.js"],
      "env": {
        "MCP_API_TOKEN": "your-secret-token",
        "OPEN_CLASS_API_URL": "http://localhost:41701",
        "OPEN_CLASS_ADMIN_EMAIL": "admin@yourdomain.com",
        "OPEN_CLASS_ADMIN_PASSWORD": "your-admin-password"
      }
    }
  }
}
```

### Available resources and tools

| Type | Name | Description |
|------|------|-------------|
| Resource | `courses://list` | All published courses |
| Resource | `users://list` | All platform users (admin) |
| Resource | `enrollments://list/{userEmail}` | Enrollments for a user |
| Tool | `enroll_user` | Enroll a user in a course by email |
| Tool | `create_course` | Create a draft course |
| Tool | `get_student_progress` | Get a student's progress in a course |

See [`packages/mcp-server/README.md`](./packages/mcp-server/README.md) for full documentation.

---

## Roadmap

- [ ] Admin panel — user management, course moderation, platform settings
- [ ] Student certificates
- [ ] Course ratings and reviews
- [ ] Email notifications for enrollment
- [ ] i18n support
- [ ] Mobile app

---

## Contributing

Contributions are welcome. Please open an issue before submitting a pull request for non-trivial changes.

```bash
# Create a branch
git checkout -b feat/your-feature

# Follow conventional commits
git commit -m "feat(lessons): add transcript support"
```

See [`docs/contributing/commit-messages.md`](./docs/contributing/commit-messages.md) for commit conventions.

---

## License

MIT — do whatever you want, just don't sell it as a closed product.
