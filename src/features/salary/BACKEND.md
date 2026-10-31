# Salary — backend contract

- `GET /me/salary?year=` → `SalaryLedger` (structure, months with paid / pending / upcoming, payments). Read-only.
- `GET /me/payslips/:slipNo` → payslip data for the print page. 404 if the slip isn't the teacher's.
