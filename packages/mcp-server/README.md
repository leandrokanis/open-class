# @open-class/mcp-server

MCP (Model Context Protocol) server for the Open Class LMS platform. Exposes courses, users, and enrollments as resources and tools consumable by AI agents such as Claude Code and Claude Desktop.

## Prerequisites

- Node.js 18+
- A running Open Class API instance
- An admin account on the platform

## Environment variables

| Variable | Description |
|----------|-------------|
| `MCP_API_TOKEN` | Static token that identifies this MCP server to its clients |
| `OPEN_CLASS_API_URL` | Base URL of the Open Class API (e.g. `http://localhost:3000`) |
| `OPEN_CLASS_ADMIN_EMAIL` | Email of the admin account the server will use for internal API calls |
| `OPEN_CLASS_ADMIN_PASSWORD` | Password for the admin account |

## Build and run

```bash
# From the monorepo root
pnpm install

# Build the package
cd packages/mcp-server
pnpm build

# Start the server (stdio transport)
pnpm start
```

## Development (without building)

```bash
MCP_API_TOKEN=mytoken \
OPEN_CLASS_API_URL=http://localhost:3000 \
OPEN_CLASS_ADMIN_EMAIL=admin@example.com \
OPEN_CLASS_ADMIN_PASSWORD=secret \
pnpm dev
```

## Connecting to Claude Code

Add the following to your `~/.claude/settings.json` (or project `.claude/settings.json`):

```json
{
  "mcpServers": {
    "open-class": {
      "command": "node",
      "args": ["/absolute/path/to/open-class/packages/mcp-server/dist/index.js"],
      "env": {
        "MCP_API_TOKEN": "your-secret-token",
        "OPEN_CLASS_API_URL": "http://localhost:3000",
        "OPEN_CLASS_ADMIN_EMAIL": "admin@yourdomain.com",
        "OPEN_CLASS_ADMIN_PASSWORD": "your-admin-password"
      }
    }
  }
}
```

Then restart Claude Code. You can verify the connection with:

```
list the available courses
```

## Available resources

| URI | Description |
|-----|-------------|
| `courses://list` | All published courses with id, title, shortDescription, category, level, slug |
| `users://list` | All platform users (admin) |
| `enrollments://list/{userEmail}` | All enrollments for a given user |

## Available tools

| Tool | Parameters | Description |
|------|-----------|-------------|
| `enroll_user` | `userEmail`, `courseId` | Enroll a user in a course |
| `create_course` | `title`, `shortDescription`, `categoryId`, `level` | Create a draft course |
| `get_student_progress` | `userEmail`, `courseId` | Get a student's progress in a course |

## Running tests

```bash
cd packages/mcp-server
pnpm test
```
