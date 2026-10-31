# Notices & events — backend contract (read-only)

- `GET /notices?status=published` → live notices (pinned first). The portal shows staff notices by default.
- `GET /notices/:slug` → one published notice; 404 for drafts, scheduled, expired or archived.
- `GET /calendar?from=&to=` → school events, government holidays and exams that concern teachers.
