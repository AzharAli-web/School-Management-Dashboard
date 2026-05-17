/**
 * Opens a print-friendly report so the user can save as PDF from the browser print dialog.
 */
export function printResultReport({ result, studentName }) {
  const exam = result.examId;
  const examName = exam?.examName ?? "Examination";
  const examClass = exam?.class ?? "";
  const examDate = exam?.date ? new Date(exam.date).toLocaleDateString() : "";
  const rows = (result.subjectMarks || [])
    .map(
      (s) =>
        `<tr><td>${escapeHtml(String(s.subject))}</td><td style="text-align:right">${escapeHtml(
          String(s.marks)
        )}</td></tr>`
    )
    .join("");

  const w = window.open("", "_blank", "noopener,noreferrer");
  if (!w) {
    return false;
  }
  w.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>${escapeHtml(examName)} — Result</title>
  <style>
    body { font-family: ui-sans-serif, system-ui, sans-serif; padding: 32px; max-width: 720px; margin: 0 auto; color: #111; }
    h1 { font-size: 1.35rem; margin: 0 0 8px; }
    .muted { color: #555; font-size: 0.9rem; margin-bottom: 20px; }
    .summary { display: flex; gap: 24px; flex-wrap: wrap; margin: 16px 0 24px; padding: 16px; background: #f4f4f5; border-radius: 12px; }
    .summary div span { display: block; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em; color: #666; }
    .summary div strong { font-size: 1.25rem; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #ddd; padding: 10px 12px; text-align: left; }
    th { background: #fafafa; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.04em; color: #444; }
    @media print { body { padding: 16px; } }
  </style>
</head>
<body>
  <h1>${escapeHtml(examName)}</h1>
  <p class="muted">Student: <strong>${escapeHtml(studentName || "Student")}</strong> &nbsp;|&nbsp; Class: ${escapeHtml(
    examClass
  )} &nbsp;|&nbsp; Date: ${escapeHtml(examDate)}</p>
  <div class="summary">
    <div><span>Grade</span><strong>${escapeHtml(String(result.grade))}</strong></div>
    <div><span>Percentage</span><strong>${escapeHtml(String(Math.round(result.percentage * 100) / 100))}%</strong></div>
    <div><span>Total marks</span><strong>${escapeHtml(String(result.totalMarks))}</strong></div>
  </div>
  <table>
    <thead><tr><th>Subject</th><th style="text-align:right">Marks (out of 100)</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <script>window.addEventListener("load", function () { window.focus(); window.print(); });</script>
</body>
</html>`);
  w.document.close();
  return true;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
