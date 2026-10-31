# Auth (teacher portal) — backend contract

The demo keeps the signed-in teacher's staff ID in localStorage
(`store/session.store.ts`, key `teacher-session-demo`) and accepts any password
for a current teacher's school email. Replace with NextAuth credentials.

| Action | Endpoint | Notes |
| --- | --- | --- |
| Sign in | `POST /auth/teacher/login` `{ email, password }` | → `{ accessToken, refreshToken, user: { id, name, role: "teacher" } }`. Reject teachers with status `left` or a suspended / blocked / disabled portal account. |
| Current teacher | `GET /me` | `Teacher` + `PortalAccount` (never the password). |
| Sign out | `POST /auth/logout` | |

- `proxy.ts` redirects signed-out visitors to `/login` once the session cookie exists.
- **Every `/me/*` endpoint is scoped to the token's teacher** — the client never sends a teacher ID.
- If `mustChangePassword` is true, send the teacher to the change-password dialog after sign-in.
