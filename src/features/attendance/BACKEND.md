# Attendance — backend contract

## Class register (class teachers only)

- `GET /me/sections/:id/attendance?date=` → `[{ studentId, status, checkIn, checkOut, note, edited }]`
  (gate-scanner records with corrections applied).
- `PUT /me/sections/:id/attendance/:date` `[{ studentId, status }]`
  - Only the section's class teacher.
  - `date` must be within the last **7 days** (`EDIT_WINDOW_DAYS`) and a school day.
  - Writes the same correction the admin app writes, with `by = teacher` and note "marked by class teacher".
  - Audit: `{ studentId, category: "attendance", action, detail, at, by }`.

## My attendance

- `GET /me/attendance?from=&to=` → `AttendanceDay[]` (staff biometric, read-only). Corrections are made by the office.
