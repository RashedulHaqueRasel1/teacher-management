# Marks entry — backend contract

- `GET /me/exams` → exams that are running, completed or published and include at least one of the teacher's classes.
- `GET /exams/:examId/marks?sectionId=&subject=` → `[{ studentId, code, fullMarks, passMarks, obtained? }]`
  — only for the teacher's own assignment (section + subject).
- `PUT /exams/:examId/marks` `{ sectionId, subject, marks: [{ studentId, obtained }] }`
  - 403 unless the teacher has a teaching assignment for that section + subject.
  - Rejected when the exam is **published** (corrections go through the office) or the paper's date is in the future.
  - `obtained` is 0 … fullMarks in steps of 0.5.
  - Audit per student: "Marks updated · {exam}" by the teacher.
