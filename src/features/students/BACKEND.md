# Student leave (class teacher step) — backend contract

Workflow: student / guardian → **class teacher** → office (final).

- `GET /me/student-leaves?stage=teacher|admin|decided` → leave requests of students in the teacher's class-teacher sections.
- `POST /student-leaves/:id/decision` `{ role: "class-teacher", approved, note }`
  - Only while `stage = "teacher"`, only the section's class teacher.
  - Approved → `stage = "admin"` (waits for the office). Rejected → `stage = "rejected"` (note required).
  - SMS the guardian on rejection.
- `GET /student-leaves/:id/attachment` — signed URL.
