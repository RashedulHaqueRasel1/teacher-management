# My Classes — backend contract

| Action | Endpoint | Notes |
| --- | --- | --- |
| My sections | `GET /me/sections` | Sections where the teacher is class teacher **or** has a teaching assignment. Each: `ClassSection` + `isClassTeacher` + `assignments: TeachingAssignment[]`. |
| One section | `GET /me/sections/:slug` | 403 if the section isn't one of the teacher's. Includes students (roll, guardian, today's status, attendance rate, latest published GPA). |
| Student card | `GET /me/students/:id` | Read-only: guardians, attendance summary, published results. Only students of the teacher's sections. |

Teachers can't edit sections, students or class teachers — that stays in the admin app.
