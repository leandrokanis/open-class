# Security Policy

## Supported Versions

Open Class follows semantic versioning. Security fixes are provided for the
latest minor release line.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, report them privately through one of these channels:

- **GitHub Private Vulnerability Reporting** — use the "Report a vulnerability"
  button under the repository's **Security** tab (preferred).
- **Email** — send details to **leandrosustenido@gmail.com**.

Please include as much of the following as possible:

- The type of issue (e.g. injection, broken authentication, privilege
  escalation).
- Affected component (`apps/api`, `apps/ui`, `packages/db`) and version.
- Steps to reproduce or a proof of concept.
- Any potential impact you have identified.

## What to Expect

- We will acknowledge your report within **72 hours**.
- We will confirm the vulnerability and determine its impact.
- We will release a fix as soon as practical and credit you in the release notes
  unless you prefer to remain anonymous.

Since Open Class is self-hosted, once a fix is released, operators are
responsible for upgrading their own instances. See the
[upgrade guide](./docs) for details.

Thank you for helping keep Open Class and its community safe.
