/** Printable payslip page (print route group). */
export const payslipHref = (slipNo: string, autoPrint = false) => `/payslips/${encodeURIComponent(slipNo)}${autoPrint ? "?print=1" : ""}`;
