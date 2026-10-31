# My leave — backend contract

- `GET /me/leaves` → `TeacherLeave[]` + `balance: [{ type, quota, used, left }]` for the current year.
- `POST /me/leaves` `{ type, from, to, reason }` (multipart if an attachment is added later)
  - `from` ≥ today, `to` ≥ from, at least one school day (weekend plan + holidays excluded).
  - Days ≤ remaining balance for the type (except `other`); no overlap with pending / approved leave.
  - Creates `status: "pending"`, `submittedBy: "Teacher portal"`. The office decides and assigns a substitute.
- `DELETE /me/leaves/:id` — withdraw; only while pending.
