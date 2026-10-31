# Profile — backend contract

- `GET /me` → `Teacher` + `PortalAccount` + recent audit entries for the teacher.
- `PATCH /me` `{ phone, presentAddress, emergencyContact }` — the only fields a teacher may change.
  Everything else (name, designation, salary, bank account, documents) is edited in the admin app.
- `POST /me/password` `{ currentPassword, newPassword }` — min 8 chars, letters + numbers. Sets `passwordChangedAt`, clears `mustChangePassword`.
- `GET /me/documents/:docId` — signed URL for preview / download.
