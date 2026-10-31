# Routine — backend contract

- `GET /me/routine` → `RoutineSlot[]` (`day 0–6, period 1–6, assignment`) from the timetable module.
- Period times come from the teacher's shift (`PERIOD_MINUTES = 45`). Read-only — routine changes are made by the office.
