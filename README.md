# EduManage — Teacher Portal

The teacher-facing side of EduManage. A teacher signs in and works with their own classes: today's routine, attendance registers, marks entry, student leave approvals, their own leave, salary slips and school notices.

It has the same stack and folder structure as the admin app (`../School-Management`).

> **Project status:** a frontend prototype. Data is the same deterministic demo data as the admin app, and teacher changes are saved in the browser with `localStorage`. The two apps run on different ports, so they **don't share** browser data until a backend is connected.

## Pages

| Route | What the teacher can do |
| --- | --- |
| `/login` | Sign in with a school email (demo: pick any teacher, any password) |
| `/dashboard` | Greeting, today's classes (live "now / next"), own check-in, classes, notices, events |
| `/classes` · `/classes/[slug]` | Sections they teach or are class teacher of; students, their periods there |
| `/routine` | Weekly timetable (printable) |
| `/students` | Every student of their sections — search, guardians, attendance, results (read-only) |
| `/attendance` | Class teacher's daily register (P / L / A / Lv, last 7 days) |
| `/marks` | Marks entry for their own subject and sections; published results are locked |
| `/student-leave` | Class teacher step of student leave: recommend to the office or reject |
| `/leave` | Own leave balance, apply, withdraw pending requests |
| `/my-attendance` | Own biometric attendance (read-only) |
| `/salary` · `/payslips/[slipNo]` | Salary structure, monthly ledger, printable payslips (own only) |
| `/notices` · `/notices/[slug]` | Published notices (staff notices first) |
| `/events` | Upcoming events, exams and holidays |
| `/profile` | Own record; update contact details and password |

## Tech stack

- [Next.js](https://nextjs.org/) 16 with the App Router
- React 19 and TypeScript
- Tailwind CSS 4
- Zustand for client-side state
- Lucide icons

## Getting started

```bash
cd teacher-management
npm install
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) (the admin app uses 3000). Pick a teacher in the demo box on the login page — for example **Mahmuda Akter** (Bangla), who is a class teacher and teaches several sections.

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server on port 3001. |
| `npm run build` | Create a production build. |
| `npm run start` | Run the production build on port 3001. |
| `npm run lint` | Run ESLint. |

## Project structure

```text
src/
├── app/
│   ├── (auth)/          # /login
│   ├── (dashboard)/     # every teacher page (sidebar + header shell, sign-in guard)
│   └── (print)/         # payslips, notice print
├── components/          # Shared UI kit and the dashboard shell
├── features/
│   ├── auth/            # session store, useCurrentTeacher, login form
│   ├── dashboard/       # home page widgets
│   ├── classes/         # useMyClasses, My Classes, section page
│   ├── routine/         # weekly timetable
│   ├── attendance/      # class register, my attendance
│   ├── results/         # marks entry
│   ├── students/        # my students, student leave approvals
│   ├── leave/           # my leave
│   ├── salary/          # salary & payslips
│   ├── profile/         # my profile, contact & password
│   ├── notices/ events/ # read-only school notices and calendar
│   └── admissions/ teachers/ examinations/  # shared demo data, types and stores
├── hooks/  lib/  Providers/  store/  types/
```

Each teacher module has a `BACKEND.md` with the API it needs. Every `/me/*` endpoint must be scoped to the signed-in teacher on the server.

## Production checklist

- Real authentication (NextAuth) with role `teacher`; enforce it in `proxy.ts`.
- Connect stores to the same API as the admin app so both sides see the same data.
- Server-side permission checks: class-teacher-only registers, own-subject marks, own payslips.
- Audit logging, monitoring and automated tests.
