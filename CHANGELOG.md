# Changelog

All notable changes to Open Class are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-07-01

First stable release and open source publication under the MIT license. Open Class
is a self-hosted, lightweight LMS for homelabs, built around YouTube embeds and
white-label customization, deployable with `docker compose up`.

### Added

- **Authentication & user management** — account registration, login with JWT
  session via httpOnly cookie, password recovery, user profiles, and optional
  Google OAuth sign-in.
- **Course catalog & discovery** — public course listing with search, filters and
  pagination, and course detail pages.
- **Learning & progress** — lesson player with YouTube embed and side curriculum,
  lesson progress tracking, and the "My Learning" student dashboard.
- **Content authoring (instructor)** — course creation, module and lesson
  management, publish/unpublish, per-module and per-lesson visibility control, and
  the instructor dashboard with overview metrics.
- **Platform administration** — admin panel for users, courses and categories, and
  category management.
- **White-label & configuration** — visual identity (branding) configuration and
  SMTP e-mail settings.
- **Self-hosting** — Docker Compose deployment, deploy/config/upgrade guides,
  minimal resource footprint targeted at homelab environments.
- **Security** — rate limiting on auth routes and an OWASP Top 10 hardening
  checklist.
- **Open source governance** — MIT license, changelog, contributing guide, code of
  conduct, security policy, and issue/PR templates.

[1.0.0]: https://github.com/leandrokanis/open-class/releases/tag/v1.0.0
