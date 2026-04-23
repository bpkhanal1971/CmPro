import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { EVM_DATA } from "../data/sampleData";

const P = [46, 125, 50];
const D = [30, 30, 30];
const MU = [120, 120, 120];
const WH = [255, 255, 255];
const RED = [229, 57, 53];
const AMB = [245, 127, 23];
const BLU = [33, 150, 243];
const GRY = [158, 158, 158];
const TODAY = new Date().toLocaleDateString("en-NP", { year: "numeric", month: "long", day: "numeric" });
// Letter size: 215.9 x 279.4 mm
const W = 215.9;
const PH = 279.4;
const M = 20;
const CW = W - M * 2;

function npr(n) { return "Rs " + Number(n).toLocaleString("en-IN"); }
function pct(a, b) { return b ? ((a / b) * 100).toFixed(1) : "0.0"; }

function footers(doc) {
  const n = doc.internal.getNumberOfPages();
  for (let i = 1; i <= n; i++) {
    doc.setPage(i);
    doc.setFontSize(9); doc.setTextColor(...MU);
    doc.text("ConPro — Confidential", M, PH - 12);
    doc.text(`Page ${i} of ${n}`, W - M, PH - 12, { align: "right" });
  }
}

function h(doc, y, title) {
  y = ck(doc, y, 22);
  doc.setFontSize(16); doc.setTextColor(...P);
  doc.text(title, M, y);
  doc.setDrawColor(...P); doc.setLineWidth(0.6);
  doc.line(M, y + 3, W - M, y + 3);
  return y + 12;
}

function h2(doc, y, title) {
  y = ck(doc, y, 16);
  doc.setFontSize(13); doc.setTextColor(...D);
  doc.text(title, M, y);
  return y + 8;
}

function p(doc, y, text, opts = {}) {
  const { sz = 12, lh = 6 } = opts;
  doc.setFontSize(sz); doc.setTextColor(50, 50, 50);
  const lines = doc.splitTextToSize(text, CW);
  y = ck(doc, y, lines.length * lh + 2);
  doc.text(lines, M, y);
  return y + lines.length * lh + 5;
}

function ck(doc, y, need = 20) {
  if (y + need > PH - 22) { doc.addPage(); return 22; }
  return y;
}

function hbar(doc, x, y, w, label, val, color = P) {
  doc.setFontSize(10); doc.setTextColor(50, 50, 50);
  doc.text(label, x, y);
  doc.setFillColor(230, 230, 230);
  doc.rect(x, y + 3, w, 6, "F");
  doc.setFillColor(...color);
  doc.rect(x, y + 3, w * Math.min(val / 100, 1), 6, "F");
  doc.setFontSize(9); doc.setTextColor(...MU);
  doc.text(`${val.toFixed(1)}%`, x + w + 3, y + 8);
  return y + 16;
}

function barChart(doc, x, y, w, ht, data) {
  const mx = Math.max(...data.map((d) => Math.max(d.v1, d.v2 || 0)), 1);
  const gap = (w - 10) / data.length;
  const bw = Math.min(12, gap / 2 - 2);
  doc.setDrawColor(220, 220, 220); doc.setLineWidth(0.2);
  for (let i = 0; i <= 4; i++) doc.line(x, y + ht - (ht * i) / 4, x + w, y + ht - (ht * i) / 4);
  data.forEach((d, i) => {
    const bx = x + 5 + i * gap;
    doc.setFillColor(165, 214, 167);
    doc.rect(bx, y + ht - (d.v1 / mx) * (ht - 10), bw, (d.v1 / mx) * (ht - 10), "F");
    if (d.v2 != null) {
      doc.setFillColor(...P);
      doc.rect(bx + bw + 1, y + ht - (d.v2 / mx) * (ht - 10), bw, (d.v2 / mx) * (ht - 10), "F");
    }
    doc.setFontSize(8); doc.setTextColor(...MU);
    doc.text(d.label, bx + bw, y + ht + 6, { align: "center" });
  });
}

function badge(doc, x, y, text, color) {
  doc.setFillColor(...color);
  doc.roundedRect(x, y, 50, 15, 3, 3, "F");
  doc.setFontSize(11); doc.setTextColor(...WH);
  doc.text(text, x + 25, y + 10, { align: "center" });
}

function fmtSize(kb) { return kb >= 1024 ? (kb / 1024).toFixed(1) + " MB" : kb + " KB"; }

function fmtCr(n) {
  const abs = Math.abs(n);
  if (abs >= 10000000) return (n / 10000000).toFixed(1) + " Cr";
  if (abs >= 100000) return (n / 100000).toFixed(1) + " L";
  return (n / 1000).toFixed(0) + " K";
}

function drawSCurve(doc, x, y, w, ht, data) {
  const pl = 18, pb = 16;
  const cw = w - pl - 4, ch = ht - pb - 4;
  const ox = x + pl, oy = y;

  doc.setDrawColor(220, 220, 220); doc.setLineWidth(0.2);
  for (let i = 0; i <= 5; i++) {
    const ly = oy + ch - (ch * i) / 5;
    doc.line(ox, ly, ox + cw, ly);
    doc.setFontSize(7); doc.setTextColor(...MU);
    doc.text(`${i * 20}%`, ox - 3, ly + 2, { align: "right" });
  }

  const actuals = data.filter((d) => d.actualPct > 0);
  const n = data.length;

  // Planned line (dashed green)
  doc.setDrawColor(46, 125, 50); doc.setLineWidth(0.8);
  for (let i = 0; i < n - 1; i++) {
    const x1 = ox + (i / (n - 1)) * cw;
    const x2 = ox + ((i + 1) / (n - 1)) * cw;
    const y1 = oy + ch - (data[i].plannedPct / 100) * ch;
    const y2 = oy + ch - (data[i + 1].plannedPct / 100) * ch;
    if (i % 2 === 0) doc.line(x1, y1, x2, y2);
  }

  // Actual line (solid blue)
  if (actuals.length > 1) {
    doc.setDrawColor(21, 101, 192); doc.setLineWidth(1);
    for (let i = 0; i < actuals.length - 1; i++) {
      const ai = data.indexOf(actuals[i]);
      const bi = data.indexOf(actuals[i + 1]);
      const x1 = ox + (ai / (n - 1)) * cw;
      const x2 = ox + (bi / (n - 1)) * cw;
      const y1 = oy + ch - (actuals[i].actualPct / 100) * ch;
      const y2 = oy + ch - (actuals[i + 1].actualPct / 100) * ch;
      doc.line(x1, y1, x2, y2);
    }
  }

  // Dots
  actuals.forEach((d) => {
    const i = data.indexOf(d);
    const px = ox + (i / (n - 1)) * cw;
    doc.setFillColor(21, 101, 192);
    doc.circle(px, oy + ch - (d.actualPct / 100) * ch, 1.2, "F");
    doc.setFillColor(46, 125, 50);
    doc.circle(px, oy + ch - (d.plannedPct / 100) * ch, 1.2, "F");
  });

  // Today marker
  if (actuals.length > 0 && actuals.length < n) {
    const ti = data.indexOf(actuals[actuals.length - 1]);
    const tx = ox + (ti / (n - 1)) * cw;
    doc.setDrawColor(229, 57, 53); doc.setLineWidth(0.5);
    doc.line(tx, oy, tx, oy + ch);
    doc.setFontSize(6); doc.setTextColor(229, 57, 53);
    doc.text("Today", tx, oy - 2, { align: "center" });
  }

  // X-axis labels
  data.forEach((d, i) => {
    if (n <= 12 || i % 3 === 0 || i === n - 1) {
      const lx = ox + (i / (n - 1)) * cw;
      doc.setFontSize(6); doc.setTextColor(...MU);
      doc.text(d.month, lx, oy + ch + 8, { align: "center" });
    }
  });

  // Axes
  doc.setDrawColor(180, 180, 180); doc.setLineWidth(0.3);
  doc.line(ox, oy, ox, oy + ch);
  doc.line(ox, oy + ch, ox + cw, oy + ch);

  // Legend
  const ly = oy + ch + 14;
  doc.setDrawColor(46, 125, 50); doc.setLineWidth(0.8);
  doc.line(ox, ly, ox + 10, ly);
  doc.setFontSize(7); doc.setTextColor(46, 125, 50);
  doc.text("Planned (Baseline)", ox + 12, ly + 1);
  doc.setDrawColor(21, 101, 192); doc.setLineWidth(1);
  doc.line(ox + 55, ly, ox + 65, ly);
  doc.setTextColor(21, 101, 192);
  doc.text("Actual Progress", ox + 67, ly + 1);

  return oy + ht + 6;
}

function drawEVMChart(doc, x, y, w, ht, data, BAC) {
  const pl = 24, pb = 16;
  const cw = w - pl - 4, ch = ht - pb - 4;
  const ox = x + pl, oy = y;
  const maxVal = BAC * 1.1;
  const n = data.length;

  doc.setDrawColor(220, 220, 220); doc.setLineWidth(0.2);
  for (let i = 0; i <= 5; i++) {
    const val = (maxVal / 5) * i;
    const ly = oy + ch - (val / maxVal) * ch;
    doc.line(ox, ly, ox + cw, ly);
    doc.setFontSize(6); doc.setTextColor(...MU);
    doc.text(fmtCr(val), ox - 3, ly + 2, { align: "right" });
  }

  // BAC reference line
  const bacY = oy + ch - (BAC / maxVal) * ch;
  doc.setDrawColor(156, 39, 176); doc.setLineWidth(0.4);
  for (let i = 0; i < cw; i += 6) doc.line(ox + i, bacY, ox + Math.min(i + 3, cw), bacY);
  doc.setFontSize(6); doc.setTextColor(156, 39, 176);
  doc.text("BAC", ox + cw + 2, bacY + 2);

  const actuals = data.filter((d) => d.EV > 0);

  function drawLine(key, color, dashed) {
    const pts = data.filter((d) => d[key] > 0);
    if (pts.length < 2) return;
    doc.setDrawColor(...color); doc.setLineWidth(0.8);
    for (let i = 0; i < pts.length - 1; i++) {
      const ai = data.indexOf(pts[i]);
      const bi = data.indexOf(pts[i + 1]);
      const x1 = ox + (ai / (n - 1)) * cw;
      const x2 = ox + (bi / (n - 1)) * cw;
      const y1 = oy + ch - (pts[i][key] / maxVal) * ch;
      const y2 = oy + ch - (pts[i + 1][key] / maxVal) * ch;
      if (dashed) { if (i % 2 === 0) doc.line(x1, y1, x2, y2); }
      else doc.line(x1, y1, x2, y2);
    }
  }

  drawLine("PV", [46, 125, 50], true);
  drawLine("EV", [21, 101, 192], false);
  drawLine("AC", [229, 57, 53], false);

  // X-axis labels
  data.forEach((d, i) => {
    if (n <= 12 || i % 3 === 0 || i === n - 1) {
      const lx = ox + (i / (n - 1)) * cw;
      doc.setFontSize(6); doc.setTextColor(...MU);
      doc.text(d.month, lx, oy + ch + 8, { align: "center" });
    }
  });

  // Axes
  doc.setDrawColor(180, 180, 180); doc.setLineWidth(0.3);
  doc.line(ox, oy, ox, oy + ch);
  doc.line(ox, oy + ch, ox + cw, oy + ch);

  // Legend
  const ly = oy + ch + 14;
  doc.setDrawColor(46, 125, 50); doc.setLineWidth(0.8);
  doc.line(ox, ly, ox + 8, ly);
  doc.setFontSize(7); doc.setTextColor(46, 125, 50);
  doc.text("PV (Planned)", ox + 10, ly + 1);

  doc.setDrawColor(21, 101, 192);
  doc.line(ox + 42, ly, ox + 50, ly);
  doc.setTextColor(21, 101, 192);
  doc.text("EV (Earned)", ox + 52, ly + 1);

  doc.setDrawColor(229, 57, 53);
  doc.line(ox + 82, ly, ox + 90, ly);
  doc.setTextColor(229, 57, 53);
  doc.text("AC (Actual)", ox + 92, ly + 1);

  return oy + ht + 6;
}

export function exportProjectReport(projectName, allData) {
  const {
    projects, tasks, progress, budget, risks: riskLevels, riskRecords,
    delayedTasks, safetyIncidents, monthlyCompletion,
    budgetExpenses, scheduleActivities, team, documents, formatDate,
  } = allData;

  const proj = projects.find((pr) => pr.name === projectName);
  if (!proj) return;

  // Filter all data for this project
  const myTasks = tasks.filter((t) => t.project === projectName);
  const myProgress = progress.find((pr) => pr.project === projectName);
  const myBudget = budget.find((b) => b.project === projectName);
  const myDelayed = delayedTasks.filter((t) => t.project === projectName);
  const mySafety = safetyIncidents.filter((s) => s.project === projectName);
  const keyword = projectName.split(" ")[0].toLowerCase();
  const myRisks = riskRecords ? riskRecords.filter((r) =>
    r.title.toLowerCase().includes(keyword) ||
    r.description.toLowerCase().includes(keyword) ||
    r.mitigation.toLowerCase().includes(keyword)
  ) : [];
  const isKBP = projectName === "Kathmandu Business Park";
  const mySchedule = scheduleActivities && isKBP ? scheduleActivities : [];
  const myExpenses = budgetExpenses && isKBP ? budgetExpenses : [];
  // Team members working on this project (from task assignees)
  const assigneeNames = [...new Set(myTasks.map((t) => t.assignee))];
  const myTeam = team ? team.filter((m) => assigneeNames.includes(m.name)) : [];
  // Documents (match by project abbreviation/keyword)
  const myDocs = documents ? documents.filter((d) =>
    d.name.toLowerCase().includes(keyword) ||
    d.name.toLowerCase().includes(projectName.toLowerCase().slice(0, 8))
  ) : [];

  const doc = new jsPDF({ format: "letter" });
  let sec = 0;

  // ════════════════════════════════════════════════
  // PAGE 1: COVER
  // ════════════════════════════════════════════════
  doc.setFillColor(...P);
  doc.rect(0, 0, W, 140, "F");
  doc.setFontSize(34); doc.setTextColor(...WH);
  doc.text("ConPro", W / 2, 34, { align: "center" });
  doc.setFontSize(13);
  doc.text("Construction Project Management System", W / 2, 48, { align: "center" });
  doc.setDrawColor(...WH); doc.setLineWidth(0.8);
  doc.line(48, 56, W - 48, 56);
  doc.setFontSize(24);
  doc.text("Project Status Report", W / 2, 76, { align: "center" });
  doc.setFontSize(18);
  doc.text(proj.name, W / 2, 94, { align: "center" });
  doc.setFontSize(12);
  doc.text(`Client: ${proj.client}`, W / 2, 110, { align: "center" });
  doc.text(`Location: ${proj.location}  |  ${TODAY}`, W / 2, 124, { align: "center" });

  // Snapshot table
  let y = 156;
  doc.setFontSize(14); doc.setTextColor(...D);
  doc.text("Project Snapshot", M, y); y += 8;

  const doneT = myTasks.filter((t) => t.status === "Done").length;
  const ipT = myTasks.filter((t) => t.status === "In Progress").length;
  const todoT = myTasks.filter((t) => t.status === "To Do").length;

  const rows = [
    ["Project Name", proj.name], ["Client", proj.client], ["Location", proj.location],
    ["Start Date", formatDate(proj.start)], ["End Date", formatDate(proj.end)],
    ["Current Status", proj.status], ["Overall Progress", `${proj.progress}%`],
    ["Total Budget", npr(proj.budget)],
    ["Total Tasks", `${myTasks.length} (Done: ${doneT}, In Progress: ${ipT}, To Do: ${todoT})`],
    ["Delayed Tasks", String(myDelayed.length)],
    ["Safety Incidents", String(mySafety.length)],
    ["Identified Risks", String(myRisks.length)],
    ["Team Members", String(myTeam.length)],
    ["Documents", String(myDocs.length)],
  ];

  autoTable(doc, {
    startY: y,
    body: rows,
    theme: "plain",
    styles: { fontSize: 11, cellPadding: { top: 3, bottom: 3, left: 5, right: 5 } },
    columnStyles: { 0: { fontStyle: "bold", textColor: MU, cellWidth: 60 }, 1: { textColor: D } },
    alternateRowStyles: { fillColor: [245, 250, 245] },
  });

  doc.setFontSize(10); doc.setTextColor(...MU);
  doc.text("Confidential — for authorized personnel only.", W / 2, PH - 22, { align: "center" });

  // ════════════════════════════════════════════════
  // PAGE 2: TABLE OF CONTENTS
  // ════════════════════════════════════════════════
  doc.addPage(); y = 22;
  doc.setFontSize(18); doc.setTextColor(...P);
  doc.text("Table of Contents", M, y);
  doc.setDrawColor(...P); doc.setLineWidth(0.6);
  doc.line(M, y + 4, W - M, y + 4);
  y += 18;

  const tocItems = [
    "1. Executive Summary",
    "2. Project Overview",
    "3. Project Team & Resource Analysis",
    "4. Progress Analysis",
    "5. S-Curve Analysis (Progress vs. Time)",
    "6. Earned Value Management (EVM)",
    "7. Task Management",
    "8. Financial Analysis",
    "9. Schedule & Milestones",
    "10. Risk Assessment",
    "11. Safety & Incident Report",
    "12. Quality Assurance",
    "13. Environmental & Compliance",
    "14. Project Documents",
    "15. Recommendations & Next Steps",
    "16. Conclusion & Sign-off",
  ];
  tocItems.forEach((item, i) => {
    doc.setFontSize(12); doc.setTextColor(50, 50, 50);
    doc.text(item, M + 6, y);
    doc.setDrawColor(200, 200, 200); doc.setLineWidth(0.2);
    doc.line(M + 6, y + 2, W - M, y + 2);
    y += 12;
  });

  y += 10;
  doc.setFontSize(11); doc.setTextColor(...MU);
  doc.text("Report prepared by ConPro Project Management System", M + 6, y);
  y += 7;
  doc.text(`Report Date: ${TODAY}`, M + 6, y);
  y += 7;
  doc.text(`Project: ${proj.name}`, M + 6, y);
  y += 7;
  doc.text(`Client: ${proj.client}`, M + 6, y);

  // ════════════════════════════════════════════════
  // PAGE 3: EXECUTIVE SUMMARY
  // ════════════════════════════════════════════════
  doc.addPage(); y = 22;
  y = h(doc, y, `${++sec}. Executive Summary`);

  const durationMonths = Math.round((new Date(proj.end) - new Date(proj.start)) / (1000 * 60 * 60 * 24 * 30));
  const budgetUtil = myBudget ? parseFloat(pct(myBudget.spent, myBudget.allocated)) : 0;
  const budgetRem = myBudget ? myBudget.allocated - myBudget.spent : 0;
  const progressVar = myProgress ? myProgress.actual - myProgress.planned : 0;

  y = p(doc, y, `This report presents a comprehensive status assessment of ${proj.name}, a construction project located in ${proj.location}, Nepal, commissioned by ${proj.client}. The report covers the period up to ${TODAY} and provides detailed analysis across all key performance dimensions including progress, financial health, risk exposure, safety compliance, quality assurance, and environmental management.`);

  y = p(doc, y, `The project commenced on ${formatDate(proj.start)} with a target completion date of ${formatDate(proj.end)}, giving an overall planned duration of approximately ${durationMonths} months. The total sanctioned budget for this project is ${npr(proj.budget)}. As of the reporting date, the project stands at ${proj.progress}% overall completion with a current status of "${proj.status}".`);

  y = h2(doc, y, "Key Performance Indicators");
  const kpiRows = [
    ["Overall Progress", `${proj.progress}%`, progressVar >= 0 ? "On Track" : "Behind Schedule"],
    ["Schedule Variance", `${progressVar >= 0 ? "+" : ""}${progressVar}%`, progressVar >= 0 ? "Favorable" : "Unfavorable"],
    ["Budget Utilization", `${budgetUtil}%`, budgetUtil > 90 ? "Critical" : budgetUtil > 75 ? "Caution" : "Healthy"],
    ["Remaining Budget", npr(budgetRem), budgetRem > 0 ? "Positive" : "Deficit"],
    ["Total Tasks", `${myTasks.length}`, `${doneT} Done, ${ipT} Active, ${todoT} Pending`],
    ["Overdue Tasks", `${myDelayed.length}`, myDelayed.length === 0 ? "None" : "Action Required"],
    ["Safety Incidents", `${mySafety.length}`, mySafety.length === 0 ? "Zero Incidents" : "Incidents Recorded"],
    ["Open Risks", `${myRisks.filter((r) => r.status !== "Closed").length}`, myRisks.length === 0 ? "No Risks" : "Under Monitoring"],
    ["Team Size", `${myTeam.length} members`, "Active"],
    ["Documents on File", `${myDocs.length}`, "Up to Date"],
  ];
  autoTable(doc, {
    startY: y,
    head: [["Indicator", "Value", "Status"]],
    body: kpiRows,
    headStyles: { fillColor: P, fontSize: 10 },
    styles: { fontSize: 10, cellPadding: 3.5 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 55 } },
    didParseCell(data) {
      if (data.section === "body" && data.column.index === 2) {
        const v = data.cell.raw;
        if (v === "On Track" || v === "Favorable" || v === "Healthy" || v === "Positive" || v === "Zero Incidents" || v === "None") data.cell.styles.textColor = P;
        else if (v === "Behind Schedule" || v === "Unfavorable" || v === "Critical" || v === "Deficit" || v === "Action Required") data.cell.styles.textColor = RED;
        else if (v === "Caution" || v === "Incidents Recorded" || v === "Under Monitoring") data.cell.styles.textColor = AMB;
      }
    },
  });
  y = doc.lastAutoTable.finalY + 8;

  y = p(doc, y, `In summary, ${proj.name} is ${progressVar >= 0 ? "progressing satisfactorily and meeting its planned milestones" : `currently ${Math.abs(progressVar)} percentage points behind its planned schedule, requiring management attention and potential corrective measures`}. The financial position is ${budgetUtil > 90 ? "under strain with utilization exceeding 90% — a formal budget review is urgently recommended" : budgetUtil > 75 ? "approaching the upper threshold and should be closely monitored in the coming weeks" : "healthy with adequate reserves to cover remaining project activities"}. ${myDelayed.length > 0 ? `The ${myDelayed.length} overdue task(s) present a risk to the overall timeline and should be escalated immediately.` : "All tasks are currently on schedule, reflecting effective project coordination."} ${mySafety.length > 0 ? `The ${mySafety.length} safety incident(s) recorded this period highlight the need for continued vigilance and reinforced safety protocols on site.` : "The zero-incident safety record reflects commendable adherence to safety standards by all site personnel."}`);

  // ════════════════════════════════════════════════
  // PAGE 4: PROJECT OVERVIEW + TEAM
  // ════════════════════════════════════════════════
  doc.addPage(); y = 22;
  y = h(doc, y, `${++sec}. Project Overview`);

  const statusDesc = proj.status === "In Progress"
    ? `Construction is actively underway with ${proj.progress}% of planned work completed.`
    : proj.status === "Planning"
      ? `The project is in the planning and design phase with ${proj.progress}% of preliminary activities completed. Detailed engineering design, environmental assessments, and procurement planning are the primary focus areas.`
      : proj.status === "On Hold"
        ? `The project is currently on hold at ${proj.progress}% completion. Work has been suspended pending resolution of external factors such as regulatory approvals, land disputes, or funding arrangements.`
        : `The project has reached ${proj.progress}% completion.`;

  y = p(doc, y, `${proj.name} is a construction project located in ${proj.location}, Nepal, commissioned by ${proj.client}. The project commenced on ${formatDate(proj.start)} with a scheduled completion date of ${formatDate(proj.end)}, spanning approximately ${durationMonths} months. The total approved budget is ${npr(proj.budget)}.

${statusDesc} A team of ${myTeam.length} professionals is currently assigned to this project across various disciplines. ${myDelayed.length > 0 ? `There are ${myDelayed.length} task(s) currently behind schedule that require management attention.` : "All tasks are currently on schedule."} ${mySafety.length > 0 ? `${mySafety.length} safety incident(s) have been recorded during the reporting period, all of which have been investigated with corrective actions implemented.` : "No safety incidents have been reported for this project during the current period, reflecting strong site safety culture."}`);

  // ════════════════════════════════════════════════
  // PROJECT TEAM & RESOURCE ANALYSIS
  // ════════════════════════════════════════════════
  doc.addPage(); y = 22;
  y = h(doc, y, `${++sec}. Project Team & Resource Analysis`);

  y = p(doc, y, `Effective resource management is critical to the successful delivery of ${proj.name}. This section provides an overview of the project team composition, role distribution, and resource allocation. A well-balanced team with clearly defined responsibilities ensures accountability, reduces communication gaps, and contributes to timely project completion.`);

  if (myTeam.length > 0) {
    y = h2(doc, y, "Team Roster");
    y = p(doc, y, `The following ${myTeam.length} team member(s) are currently assigned to ${proj.name}. Their roles, contact details, and areas of responsibility are provided below for reference and accountability tracking.`);
    autoTable(doc, {
      startY: y,
      head: [["#", "Name", "Role", "Email", "Phone"]],
      body: myTeam.map((m, i) => [i + 1, m.name, m.role, m.email, m.phone]),
      headStyles: { fillColor: P, fontSize: 10 },
      styles: { fontSize: 10, cellPadding: 3.5 },
      columnStyles: { 0: { cellWidth: 10 } },
    });
    y = doc.lastAutoTable.finalY + 8;

    const roles = {};
    myTeam.forEach((m) => { roles[m.role] = (roles[m.role] || 0) + 1; });
    y = h2(doc, y, "Role Distribution");
    y = p(doc, y, `The team comprises ${Object.keys(roles).length} distinct role(s): ${Object.entries(roles).map(([r, c]) => `${r} (${c})`).join(", ")}. Proper role distribution ensures that each aspect of the project — from design and engineering to on-site supervision and quality control — has dedicated personnel responsible for deliverables.`);
    Object.entries(roles).forEach(([role, count]) => {
      const pctVal = (count / myTeam.length) * 100;
      y = hbar(doc, M, y, 120, `${role} (${count})`, pctVal, P);
      y = ck(doc, y, 16);
    });
  } else {
    y = p(doc, y, `No team members are currently registered for this project in the system. It is recommended that the project manager update the team register to ensure proper accountability and communication channels.`);
  }

  y = h2(doc, y, "Task Load per Team Member");
  const taskLoad = {};
  myTasks.forEach((t) => { taskLoad[t.assignee] = (taskLoad[t.assignee] || 0) + 1; });
  if (Object.keys(taskLoad).length > 0) {
    y = p(doc, y, `The distribution of tasks across team members is an important indicator of workload balance. An uneven distribution may lead to bottlenecks, burnout, or under-utilization of available resources. The table below shows the current task allocation per individual.`);
    autoTable(doc, {
      startY: y,
      head: [["Team Member", "Total Tasks", "Done", "In Progress", "To Do", "Workload %"]],
      body: Object.entries(taskLoad).map(([name, count]) => {
        const personTasks = myTasks.filter((t) => t.assignee === name);
        const done = personTasks.filter((t) => t.status === "Done").length;
        const ip = personTasks.filter((t) => t.status === "In Progress").length;
        const td = personTasks.filter((t) => t.status === "To Do").length;
        return [name, count, done, ip, td, `${pct(count, myTasks.length)}%`];
      }),
      headStyles: { fillColor: P, fontSize: 10 },
      styles: { fontSize: 10, cellPadding: 3 },
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  y = p(doc, y, `Resource optimization recommendations: ${Object.keys(taskLoad).length > 0 ? `The current team of ${myTeam.length} members is managing ${myTasks.length} tasks. ${myDelayed.length > 0 ? `With ${myDelayed.length} overdue task(s), consider reassigning workload from less burdened team members to support delayed activities. Cross-training initiatives should be explored to build redundancy within the team.` : "The workload appears evenly distributed with no overdue tasks, indicating effective resource management. Continue monitoring task allocation as the project progresses into subsequent phases."}` : "No task data is available for resource analysis at this time."}`);

  // ════════════════════════════════════════════════
  // PROGRESS ANALYSIS
  // ════════════════════════════════════════════════
  doc.addPage(); y = 22;
  y = h(doc, y, `${++sec}. Progress Analysis`);

  if (myProgress) {
    const v = myProgress.actual - myProgress.planned;
    const assess = v >= 0 ? "on track and meeting planned milestones" : v >= -5 ? "slightly behind schedule with minor variance" : "significantly behind schedule and requires corrective action";

    y = p(doc, y, `As of the reporting date, ${proj.name} has achieved ${myProgress.actual}% completion against a planned target of ${myProgress.planned}%. This represents a variance of ${v >= 0 ? "+" : ""}${v}%, indicating the project is ${assess}.`);

    y = h2(doc, y, "Progress Comparison");
    y = ck(doc, y, 35);
    y = hbar(doc, M, y, 130, `Planned: ${myProgress.planned}%`, myProgress.planned, [165, 214, 167]);
    y = hbar(doc, M, y, 130, `Actual: ${myProgress.actual}%`, myProgress.actual, P);

    if (v < 0) {
      y = p(doc, y, `The project is behind by ${Math.abs(v)} percentage points. A schedule recovery review should be conducted to identify critical path bottlenecks and determine whether additional resources, extended working hours, or timeline adjustments are needed. Particular attention should be paid to activities on the critical path that may cascade into further delays.`);
    } else {
      y = p(doc, y, `The project is performing at or above planned levels. Continue current resource allocation and monitoring cadence. Consider identifying opportunities to further accelerate completion or optimize resource utilization.`);
    }
  }

  // Monthly trend chart
  if (monthlyCompletion && monthlyCompletion.length > 0) {
    y = ck(doc, y, 80);
    y = h2(doc, y, "Monthly Task Completion Trend");
    doc.setFontSize(9);
    doc.setTextColor(165, 214, 167); doc.text("\u25A0 Planned", M, y);
    doc.setTextColor(...P); doc.text("\u25A0 Actual", M + 28, y);
    y += 5;
    barChart(doc, M, y, CW, 55, monthlyCompletion.map((d) => ({ label: d.month, v1: d.planned, v2: d.actual })));
    y += 68;
    y = p(doc, y, "The chart above illustrates the month-over-month task completion trend across the portfolio. A persistent gap between planned and actual values suggests scheduling challenges that may benefit from a project-level workflow optimization review.");
  }

  // ════════════════════════════════════════════════
  // S-CURVE ANALYSIS
  // ════════════════════════════════════════════════
  const evmProject = EVM_DATA[projectName] || null;
  if (evmProject) {
    const evmMonths = evmProject.months;
    const evmActuals = evmMonths.filter((m) => m.EV > 0);
    const evmLatest = evmActuals.length > 0 ? evmActuals[evmActuals.length - 1] : null;

    doc.addPage(); y = 22;
    y = h(doc, y, `${++sec}. S-Curve Analysis (Progress vs. Time)`);

    y = p(doc, y, `The S-Curve is a graphical representation of cumulative progress plotted against time. It gets its characteristic "S" shape from the typical construction pattern: slow mobilization at the start, rapid progress during peak construction, and gradual tapering during finishing and commissioning. The S-Curve is an essential tool for comparing planned vs. actual progress and identifying schedule deviations early.`);

    y = h2(doc, y, "S-Curve Chart");
    y = ck(doc, y, 95);
    y = drawSCurve(doc, M, y, CW, 85, evmMonths);

    if (evmLatest) {
      const dev = evmLatest.actualPct - evmLatest.plannedPct;
      y = h2(doc, y, "S-Curve Interpretation");
      y = p(doc, y, `As of the latest data point (${evmLatest.month}), ${proj.name} has achieved ${evmLatest.actualPct}% cumulative progress against a planned target of ${evmLatest.plannedPct}%. This represents a ${Math.abs(dev)}% ${dev >= 0 ? "ahead-of-schedule" : "behind-schedule"} deviation.`);

      y = p(doc, y, dev < 0
        ? `The actual progress curve is consistently below the planned baseline, indicating the project is behind its scheduled milestones. The ${Math.abs(dev)}% gap suggests ${Math.abs(dev) > 5 ? "a significant schedule lag that requires immediate management intervention. Possible corrective measures include: deploying additional crews, authorizing overtime work, fast-tracking parallel activities, or re-sequencing the critical path to recover lost time." : "a minor delay that should be monitored closely. While not yet critical, if left uncorrected this variance could compound in subsequent months."}`
        : `The project is performing at or above the planned baseline, indicating effective execution and resource management. The project team should continue current practices and ensure upcoming critical activities are adequately planned and resourced.`);

      y = h2(doc, y, "Monthly Progress Data");
      autoTable(doc, {
        startY: y,
        head: [["Month", "Planned %", "Actual %", "Deviation", "Status"]],
        body: evmActuals.map((m) => {
          const d = m.actualPct - m.plannedPct;
          return [m.month, `${m.plannedPct}%`, `${m.actualPct}%`, `${d >= 0 ? "+" : ""}${d}%`, d >= 0 ? "On Track" : d >= -3 ? "Minor Delay" : "Behind"];
        }),
        headStyles: { fillColor: P, fontSize: 10 },
        styles: { fontSize: 10, cellPadding: 3 },
        didParseCell(data) {
          if (data.section === "body" && data.column.index === 4) {
            if (data.cell.raw === "On Track") data.cell.styles.textColor = P;
            else if (data.cell.raw === "Behind") data.cell.styles.textColor = RED;
            else data.cell.styles.textColor = AMB;
          }
        },
      });
      y = doc.lastAutoTable.finalY + 8;
    }

    // ════════════════════════════════════════════════
    // EARNED VALUE MANAGEMENT
    // ════════════════════════════════════════════════
    doc.addPage(); y = 22;
    y = h(doc, y, `${++sec}. Earned Value Management (EVM)`);

    y = p(doc, y, `Earned Value Management (EVM) is an industry-standard methodology that integrates scope, schedule, and cost data to provide an objective measure of project performance. Unlike simple cost tracking or schedule monitoring alone, EVM answers: "For every rupee spent, how much value have we actually delivered?" The three fundamental EVM metrics are:`);
    y = p(doc, y, `• Planned Value (PV) — The authorized budget allocated for the work scheduled to be completed by a given date (also known as BCWS — Budgeted Cost of Work Scheduled).\n• Earned Value (EV) — The budgeted amount for the work actually completed (also known as BCWP — Budgeted Cost of Work Performed).\n• Actual Cost (AC) — The total cost actually incurred for the work completed to date (also known as ACWP — Actual Cost of Work Performed).`);

    y = h2(doc, y, "EVM Chart");
    y = ck(doc, y, 95);
    y = drawEVMChart(doc, M, y, CW, 85, evmMonths, evmProject.BAC);

    if (evmLatest) {
      const BAC = evmProject.BAC;
      const CV = evmLatest.EV - evmLatest.AC;
      const SV = evmLatest.EV - evmLatest.PV;
      const CPI = evmLatest.AC > 0 ? evmLatest.EV / evmLatest.AC : 0;
      const SPI = evmLatest.PV > 0 ? evmLatest.EV / evmLatest.PV : 0;
      const EAC = CPI > 0 ? BAC / CPI : BAC;
      const ETC = EAC - evmLatest.AC;
      const VAC = BAC - EAC;
      const TCPI = (BAC - evmLatest.AC) > 0 ? (BAC - evmLatest.EV) / (BAC - evmLatest.AC) : 0;

      y = h2(doc, y, "EVM Performance Indicators");
      autoTable(doc, {
        startY: y,
        head: [["Indicator", "Value", "Interpretation"]],
        body: [
          ["CPI (Cost Performance Index)", CPI.toFixed(2), CPI >= 1 ? "Under budget — getting more value per rupee" : "Over budget — spending more than planned per unit of work"],
          ["SPI (Schedule Performance Index)", SPI.toFixed(2), SPI >= 1 ? "Ahead of schedule" : "Behind schedule"],
          ["CV (Cost Variance)", npr(CV), CV >= 0 ? "Favorable — savings" : "Unfavorable — overrun"],
          ["SV (Schedule Variance)", npr(SV), SV >= 0 ? "Ahead of planned value" : "Behind planned value"],
          ["BAC (Budget at Completion)", npr(BAC), "Original approved budget"],
          ["EAC (Estimate at Completion)", npr(EAC), EAC > BAC ? `Projected overrun of ${npr(EAC - BAC)}` : `Projected saving of ${npr(BAC - EAC)}`],
          ["ETC (Estimate to Complete)", npr(ETC), "Remaining cost forecast"],
          ["VAC (Variance at Completion)", npr(VAC), VAC >= 0 ? "Expected under budget" : "Expected over budget"],
          ["TCPI (To-Complete Performance)", TCPI.toFixed(2), TCPI > 1.1 ? "Difficult to achieve — corrective action needed" : TCPI > 1 ? "Achievable with disciplined cost control" : "Budget headroom available"],
        ],
        headStyles: { fillColor: P, fontSize: 10 },
        styles: { fontSize: 9.5, cellPadding: 3 },
        columnStyles: { 0: { fontStyle: "bold", cellWidth: 55 }, 2: { cellWidth: 60 } },
        didParseCell(data) {
          if (data.section === "body" && data.column.index === 1) {
            const row = data.row.index;
            if (row === 0) data.cell.styles.textColor = CPI >= 1 ? P : RED;
            else if (row === 1) data.cell.styles.textColor = SPI >= 1 ? P : RED;
            else if (row === 2) data.cell.styles.textColor = CV >= 0 ? P : RED;
            else if (row === 3) data.cell.styles.textColor = SV >= 0 ? P : RED;
          }
        },
      });
      y = doc.lastAutoTable.finalY + 8;

      y = h2(doc, y, "EVM Interpretation");
      y = p(doc, y, `At the current data date, the Cost Performance Index (CPI) stands at ${CPI.toFixed(2)}, indicating the project is ${CPI >= 1 ? "operating under budget" : "experiencing cost overruns"}. For every Rs 1 spent, the project is earning Rs ${CPI.toFixed(2)} in value. The Schedule Performance Index (SPI) of ${SPI.toFixed(2)} ${SPI >= 1 ? "confirms the project is on or ahead of schedule" : "indicates the project is behind its planned schedule"}.`);

      y = p(doc, y, `Based on current CPI, the project is forecast to cost ${npr(EAC)} at completion — ${EAC > BAC ? `a potential overrun of ${npr(EAC - BAC)} (${((EAC - BAC) / BAC * 100).toFixed(1)}% over the original budget of ${npr(BAC)})` : `a potential saving of ${npr(BAC - EAC)} (${((BAC - EAC) / BAC * 100).toFixed(1)}% under the original budget)`}. The TCPI of ${TCPI.toFixed(2)} means the project must achieve a cost efficiency of ${TCPI.toFixed(2)} for the remaining work to finish within the original budget. ${TCPI > 1.1 ? "This is significantly above 1.0, suggesting the original budget may not be achievable without corrective action such as value engineering, scope adjustment, or additional funding." : TCPI > 1 ? "This is slightly above 1.0, which is achievable but requires disciplined cost control going forward." : "This is at or below 1.0, indicating the project has budget headroom for the remaining work."}`);

      y = h2(doc, y, "Monthly EVM Data");
      autoTable(doc, {
        startY: y,
        head: [["Month", "PV", "EV", "AC", "CV", "SV", "CPI", "SPI"]],
        body: evmActuals.map((m) => {
          const cv = m.EV - m.AC;
          const sv = m.EV - m.PV;
          const c = m.AC > 0 ? (m.EV / m.AC).toFixed(2) : "—";
          const s = m.PV > 0 ? (m.EV / m.PV).toFixed(2) : "—";
          return [m.month, npr(m.PV), npr(m.EV), npr(m.AC), npr(cv), npr(sv), c, s];
        }),
        headStyles: { fillColor: P, fontSize: 9 },
        styles: { fontSize: 9, cellPadding: 2.5 },
        didParseCell(data) {
          if (data.section === "body") {
            if (data.column.index === 4 || data.column.index === 5) {
              const val = data.cell.raw;
              data.cell.styles.textColor = val && val.startsWith("-") ? RED : P;
            }
          }
        },
      });
      y = doc.lastAutoTable.finalY + 8;
    }
  }

  // ════════════════════════════════════════════════
  // TASK MANAGEMENT
  // ════════════════════════════════════════════════
  doc.addPage(); y = 22;
  y = h(doc, y, `${++sec}. Task Management`);

  y = p(doc, y, `Effective task management is essential for maintaining project momentum and ensuring timely delivery. This section provides a comprehensive overview of all tasks assigned under ${proj.name}, including their current status, priority classification, assignee details, and deadline compliance. The task register serves as the primary tool for tracking work progress and identifying bottlenecks.`);

  const highP = myTasks.filter((t) => t.priority === "High").length;
  const medP = myTasks.filter((t) => t.priority === "Medium").length;
  const lowP = myTasks.filter((t) => t.priority === "Low").length;

  y = p(doc, y, `${proj.name} has ${myTasks.length} registered tasks. By status: ${doneT} completed, ${ipT} in progress, and ${todoT} pending. By priority: ${highP} High, ${medP} Medium, and ${lowP} Low. The complete task register is provided below.`);

  if (myTasks.length > 0) {
    y = h2(doc, y, "Complete Task Register");
    autoTable(doc, {
      startY: y,
      head: [["#", "Task", "Assigned To", "Priority", "Deadline", "Status"]],
      body: myTasks.map((t, i) => [i + 1, t.title, t.assignee, t.priority, formatDate(t.deadline), t.status]),
      headStyles: { fillColor: P, fontSize: 10 },
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: { 0: { cellWidth: 10 }, 1: { cellWidth: 55 } },
      didParseCell(data) {
        if (data.section === "body" && data.column.index === 3) {
          if (data.cell.raw === "High") data.cell.styles.textColor = RED;
          else if (data.cell.raw === "Low") data.cell.styles.textColor = P;
        }
        if (data.section === "body" && data.column.index === 5) {
          if (data.cell.raw === "Done") data.cell.styles.textColor = P;
          else if (data.cell.raw === "In Progress") data.cell.styles.textColor = BLU;
        }
      },
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  // Task distribution bars
  y = ck(doc, y, 55);
  y = h2(doc, y, "Task Status Distribution");
  const total = myTasks.length || 1;
  y = hbar(doc, M, y, 120, `Completed (${doneT})`, (doneT / total) * 100, P);
  y = hbar(doc, M, y, 120, `In Progress (${ipT})`, (ipT / total) * 100, BLU);
  y = hbar(doc, M, y, 120, `To Do (${todoT})`, (todoT / total) * 100, GRY);

  // Delayed tasks
  if (myDelayed.length > 0) {
    y = ck(doc, y, 40);
    y = h2(doc, y, `Overdue Tasks (${myDelayed.length})`);
    const avgD = (myDelayed.reduce((s, t) => s + t.daysLate, 0) / myDelayed.length).toFixed(0);
    const worst = myDelayed.sort((a, b) => b.daysLate - a.daysLate)[0];
    y = p(doc, y, `${myDelayed.length} task(s) are currently overdue with an average delay of ${avgD} days. The most critical is "${worst.task}" at ${worst.daysLate} days late, assigned to ${worst.assignee}. Tasks exceeding 10 days delay are flagged as Critical and should be escalated immediately.`);

    autoTable(doc, {
      startY: y,
      head: [["Task", "Assigned To", "Due Date", "Days Late", "Severity"]],
      body: myDelayed.map((t) => [t.task, t.assignee, formatDate(t.due), `${t.daysLate}`, t.daysLate >= 10 ? "Critical" : t.daysLate >= 7 ? "High" : "Moderate"]),
      headStyles: { fillColor: RED, fontSize: 10 },
      styles: { fontSize: 10, cellPadding: 3 },
      didParseCell(data) {
        if (data.section === "body" && data.column.index === 4) {
          if (data.cell.raw === "Critical") data.cell.styles.textColor = RED;
          else if (data.cell.raw === "High") data.cell.styles.textColor = AMB;
        }
      },
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  // Task priority analysis
  y = ck(doc, y, 60);
  y = h2(doc, y, "Priority Distribution");
  y = p(doc, y, `Task prioritization ensures that critical activities receive immediate attention while lower-priority items are scheduled accordingly. The current priority breakdown for ${proj.name} is: ${highP} High priority tasks requiring urgent attention, ${medP} Medium priority tasks for standard execution, and ${lowP} Low priority tasks that can be scheduled flexibly.`);
  y = hbar(doc, M, y, 120, `High Priority (${highP})`, (highP / total) * 100, RED);
  y = hbar(doc, M, y, 120, `Medium Priority (${medP})`, (medP / total) * 100, AMB);
  y = hbar(doc, M, y, 120, `Low Priority (${lowP})`, (lowP / total) * 100, P);

  y = p(doc, y, `Task Completion Rate: ${total > 0 ? `${((doneT / total) * 100).toFixed(1)}% of all tasks have been completed successfully. ${ipT > 0 ? `${ipT} task(s) are currently in active execution.` : ""} ${todoT > 0 ? `${todoT} task(s) remain in the backlog awaiting initiation.` : ""} The completion rate ${doneT / total > 0.7 ? "exceeds 70%, indicating strong execution performance" : doneT / total > 0.4 ? "is moderate and should be monitored to ensure the project meets its completion timeline" : "is below 40%, suggesting potential resource constraints or scope-related challenges that need to be addressed"}.` : "No tasks are currently registered."}`);

  // ════════════════════════════════════════════════
  // BUDGET
  // ════════════════════════════════════════════════
  doc.addPage(); y = 22;
  y = h(doc, y, `${++sec}. Financial Analysis`);

  y = p(doc, y, `Financial management is a critical success factor for ${proj.name}. This section provides a detailed analysis of budget allocation, expenditure patterns, cost performance indicators, and financial forecasting. Maintaining financial discipline ensures the project can be completed within its approved budget without compromising on quality or scope.`);

  if (myBudget) {
    const util = parseFloat(pct(myBudget.spent, myBudget.allocated));
    const rem = myBudget.allocated - myBudget.spent;
    const health = myBudget.spent > myBudget.allocated ? "over budget — immediate financial review required"
      : util > 80 ? "approaching budget ceiling — close monitoring advised"
        : "within healthy range with adequate reserves";

    y = p(doc, y, `The total allocated budget for ${proj.name} is ${npr(myBudget.allocated)}, of which ${npr(myBudget.spent)} (${util}%) has been expended to date. The remaining balance is ${npr(rem)}. Overall budget utilization is ${health}.

A budget utilization rate of ${util}% against ${proj.progress}% physical progress ${util > proj.progress + 10 ? "indicates spending is outpacing physical completion, which may signal cost overruns or front-loaded expenditure" : util < proj.progress - 10 ? "indicates efficient cost management with spending lagging behind physical progress" : "is proportionate to physical progress, indicating balanced financial management"}.`);

    y = h2(doc, y, "Budget Summary");
    autoTable(doc, {
      startY: y,
      body: [
        ["Total Allocated", npr(myBudget.allocated)],
        ["Total Spent", npr(myBudget.spent)],
        ["Remaining Balance", npr(rem)],
        ["Utilization Rate", `${util}%`],
        ["Physical Progress", `${proj.progress}%`],
        ["Cost Performance", util <= proj.progress ? "Favorable" : "Unfavorable"],
      ],
      theme: "grid",
      styles: { fontSize: 11, cellPadding: 4.5 },
      columnStyles: { 0: { fontStyle: "bold", cellWidth: 65 } },
      headStyles: { fillColor: P },
    });
    y = doc.lastAutoTable.finalY + 8;

    y = ck(doc, y, 22);
    y = h2(doc, y, "Budget Utilization");
    const clr = util > 100 ? RED : util > 80 ? AMB : P;
    y = hbar(doc, M, y, 140, `${proj.name}: ${util}%`, util, clr);
  }

  // Category-wise expenses
  if (myExpenses.length > 0) {
    y = ck(doc, y, 60);
    y = h2(doc, y, "Category-wise Expenditure Breakdown");
    const tPlanned = myExpenses.reduce((s, e) => s + e.planned, 0);
    const tActual = myExpenses.reduce((s, e) => s + e.actual, 0);
    y = p(doc, y, `The planned category-wise cost is ${npr(tPlanned)} against actual spending of ${npr(tActual)}, resulting in a net variance of ${npr(tActual - tPlanned)}. Categories exceeding their planned budget are highlighted for review.`);

    autoTable(doc, {
      startY: y,
      head: [["Category", "Planned", "Actual", "Variance", "Utilization"]],
      body: myExpenses.map((e) => {
        const diff = e.actual - e.planned;
        return [e.category, npr(e.planned), npr(e.actual), npr(diff), `${pct(e.actual, e.planned)}%`];
      }),
      foot: [["TOTAL", npr(tPlanned), npr(tActual), npr(tActual - tPlanned), `${pct(tActual, tPlanned)}%`]],
      headStyles: { fillColor: P, fontSize: 10 },
      styles: { fontSize: 10, cellPadding: 3 },
      footStyles: { fillColor: [240, 240, 240], textColor: D, fontStyle: "bold" },
      didParseCell(data) {
        if (data.section === "body" && data.column.index === 3) {
          const val = data.cell.raw;
          if (val && val.includes("-")) data.cell.styles.textColor = P;
          else if (val && !val.includes("Rs 0")) data.cell.styles.textColor = RED;
        }
      },
    });
    y = doc.lastAutoTable.finalY + 8;

    y = ck(doc, y, 10 + myExpenses.length * 14);
    y = h2(doc, y, "Category Budget Utilization Chart");
    myExpenses.forEach((e) => {
      const pctVal = parseFloat(pct(e.actual, e.planned));
      const c = pctVal > 100 ? RED : pctVal > 80 ? AMB : P;
      y = hbar(doc, M, y, 110, e.category, pctVal, c);
      y = ck(doc, y, 14);
    });
  }

  // ════════════════════════════════════════════════
  // SCHEDULE & MILESTONES
  // ════════════════════════════════════════════════
  if (mySchedule.length > 0) {
    doc.addPage(); y = 22;
    y = h(doc, y, `${++sec}. Schedule & Milestones`);

    const completed = mySchedule.filter((a) => a.status === "Completed").length;
    const inProg = mySchedule.filter((a) => a.status === "In Progress").length;
    const upcoming = mySchedule.filter((a) => a.status === "Upcoming").length;
    const milestones = mySchedule.filter((a) => a.type === "milestone");
    const schTasks = mySchedule.filter((a) => a.type === "task");

    y = p(doc, y, `The construction schedule for ${proj.name} comprises ${mySchedule.length} items: ${schTasks.length} activities and ${milestones.length} key milestones. Currently, ${completed} activities are completed, ${inProg} are actively in progress, and ${upcoming} are upcoming. The schedule spans from ${formatDate(mySchedule[0].start)} to ${formatDate(mySchedule[mySchedule.length - 1].end)}.`);

    y = h2(doc, y, "Activity Schedule");
    autoTable(doc, {
      startY: y,
      head: [["", "Activity", "Start", "End", "Assigned To", "Status", "Dependency"]],
      body: mySchedule.map((a) => [a.type === "milestone" ? "\u25C6" : "", a.task, formatDate(a.start), formatDate(a.end), a.person, a.status, a.dependency]),
      headStyles: { fillColor: P, fontSize: 9.5 },
      styles: { fontSize: 9.5, cellPadding: 2.5 },
      columnStyles: { 0: { cellWidth: 8, halign: "center" }, 1: { cellWidth: 44 } },
      didParseCell(data) {
        if (data.section === "body" && data.column.index === 5) {
          if (data.cell.raw === "Completed") data.cell.styles.textColor = P;
          else if (data.cell.raw === "In Progress") data.cell.styles.textColor = BLU;
        }
      },
    });
    y = doc.lastAutoTable.finalY + 8;

    if (milestones.length > 0) {
      y = ck(doc, y, 20 + milestones.length * 8);
      y = h2(doc, y, "Key Milestones");
      y = p(doc, y, `The following ${milestones.length} milestones define the critical checkpoints of the project. Each milestone represents a significant deliverable or approval gate that must be achieved before subsequent work can proceed.`);
      milestones.forEach((ms) => {
        y = ck(doc, y, 12);
        doc.setFontSize(11); doc.setTextColor(...P);
        doc.text(`\u25C6 ${ms.task}`, M + 2, y);
        doc.setTextColor(...MU);
        doc.text(`${formatDate(ms.start)} — ${ms.status} — ${ms.person}`, M + 90, y);
        y += 7;
      });
      y += 4;
    }
  }

  // ════════════════════════════════════════════════
  // RISKS
  // ════════════════════════════════════════════════
  doc.addPage(); y = 22;
  y = h(doc, y, `${++sec}. Risk Assessment`);

  if (myRisks.length > 0) {
    const openR = myRisks.filter((r) => r.status !== "Closed").length;
    const mitigR = myRisks.filter((r) => r.status === "Mitigating").length;
    const maxScore = myRisks.reduce((mx, r) => Math.max(mx, r.probability * r.impact), 0);

    y = p(doc, y, `${myRisks.length} risk(s) have been identified for ${proj.name}. Of these, ${openR} are currently open and ${mitigR} are under active mitigation. The highest risk score is ${maxScore}/25. Each risk is evaluated on a 5-point scale for both probability and impact, and mitigation strategies have been documented for all identified risks.`);

    y = h2(doc, y, "Risk Register");
    autoTable(doc, {
      startY: y,
      head: [["ID", "Risk Title", "Description", "Prob", "Impact", "Score", "Owner", "Status"]],
      body: myRisks.map((r) => [r.id, r.title, r.description, `${r.probability}/5`, `${r.impact}/5`, `${r.probability * r.impact}/25`, r.owner, r.status]),
      headStyles: { fillColor: P, fontSize: 9.5 },
      styles: { fontSize: 9.5, cellPadding: 2.5, overflow: "linebreak" },
      columnStyles: { 1: { cellWidth: 30 }, 2: { cellWidth: 38 } },
    });
    y = doc.lastAutoTable.finalY + 8;

    y = h2(doc, y, "Mitigation Strategies");
    myRisks.forEach((r) => {
      y = ck(doc, y, 20);
      doc.setFontSize(11); doc.setTextColor(80, 80, 80);
      doc.text(`${r.id} — ${r.title}`, M, y);
      y += 6;
      y = p(doc, y, `Mitigation: ${r.mitigation}`);
    });
  } else {
    y = p(doc, y, `No specific risks have been formally registered against ${proj.name}. However, general portfolio-level risks (monsoon delays, labour shortages, material price escalation) remain applicable and should be monitored as part of standard project oversight.`);
  }

  // ════════════════════════════════════════════════
  // SAFETY
  // ════════════════════════════════════════════════
  y = ck(doc, y, 40);
  y = h(doc, y, `${++sec}. Safety & Incident Report`);

  if (mySafety.length > 0) {
    const hC = mySafety.filter((s) => s.severity === "High").length;
    const mC = mySafety.filter((s) => s.severity === "Medium").length;
    const lC = mySafety.filter((s) => s.severity === "Low").length;
    const types = [...new Set(mySafety.map((s) => s.type))].join(", ");

    y = p(doc, y, `${mySafety.length} safety incident(s) have been recorded at the ${proj.name} site: ${hC} High severity, ${mC} Medium, and ${lC} Low. Incident types include: ${types}. All incidents have been investigated with corrective actions implemented as documented below.`);

    y = ck(doc, y, 22);
    const bx = M;
    badge(doc, bx, y, `High: ${hC}`, RED);
    badge(doc, bx + 56, y, `Medium: ${mC}`, AMB);
    badge(doc, bx + 112, y, `Low: ${lC}`, P);
    y += 22;

    y = h2(doc, y, "Incident Log");
    autoTable(doc, {
      startY: y,
      head: [["ID", "Date", "Type", "Description", "Severity", "Action Taken"]],
      body: mySafety.map((s) => [s.id, formatDate(s.date), s.type, s.description, s.severity, s.actionTaken]),
      headStyles: { fillColor: P, fontSize: 9.5 },
      styles: { fontSize: 9.5, cellPadding: 3, overflow: "linebreak" },
      columnStyles: { 3: { cellWidth: 38 }, 5: { cellWidth: 38 } },
    });
    y = doc.lastAutoTable.finalY + 8;

    y = h2(doc, y, "Incident Analysis");
    y = p(doc, y, `The ${hC > 0 ? "presence of High severity incidents underscores the need for enhanced safety protocols" : "absence of critical incidents indicates effective safety management"}. Key areas for improvement include: ${types.toLowerCase()}. Site-wide safety refresher training is recommended within the next two weeks, with focus on incident-specific corrective measures.`);
  } else {
    y = p(doc, y, `No safety incidents have been recorded for ${proj.name} during the current reporting period. This reflects positively on site safety culture and adherence to ConPro safety standards. Continued vigilance, regular toolbox talks, and PPE compliance monitoring remain essential to maintain this record.`);
  }

  // ════════════════════════════════════════════════
  // DOCUMENTS
  // ════════════════════════════════════════════════
  if (myDocs.length > 0) {
    y = ck(doc, y, 40);
    y = h(doc, y, `${++sec}. Project Documents`);
    y = p(doc, y, `${myDocs.length} document(s) are currently on file for ${proj.name}. The document register below lists all drawings, contracts, permits, reports, and other project files with their upload details.`);

    autoTable(doc, {
      startY: y,
      head: [["#", "Document Name", "Category", "Type", "Size", "Uploaded By", "Date"]],
      body: myDocs.map((d, i) => [i + 1, d.name, d.category, `.${d.ext}`, fmtSize(d.size), d.uploadedBy, formatDate(d.date)]),
      headStyles: { fillColor: P, fontSize: 10 },
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: { 0: { cellWidth: 10 }, 1: { cellWidth: 55 } },
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  // ════════════════════════════════════════════════
  // QUALITY ASSURANCE
  // ════════════════════════════════════════════════
  doc.addPage(); y = 22;
  y = h(doc, y, `${++sec}. Quality Assurance`);

  y = p(doc, y, `Quality assurance is a fundamental pillar of project delivery for ${proj.name}. ConPro's quality management framework is designed to ensure that all construction activities, materials, and workmanship meet the standards specified in the project contract, applicable Nepal building codes, and international best practices. This section provides an overview of quality control measures, inspection protocols, and material testing status.`);

  y = h2(doc, y, "Quality Control Framework");
  y = p(doc, y, `The quality control framework for this project encompasses the following key elements:\n\n• Material Testing: All construction materials including cement, steel reinforcement, aggregates, and ready-mix concrete are tested at accredited laboratories prior to use. Certificates of compliance are maintained in the project document register.\n\n• Concrete Cube Tests: Concrete cube specimens are collected at regular intervals (every 50 cubic meters or as specified) and tested for compressive strength at 7-day and 28-day intervals. Results are tracked against the required grade specifications.\n\n• Structural Inspections: Qualified structural engineers conduct inspections at critical stages including foundation, column, beam, and slab completion. Non-conformance reports (NCRs) are issued for any deviations from approved drawings.\n\n• Welding & Steel Fabrication: All welding work is inspected using visual inspection and, where required, non-destructive testing (NDT) methods. Welder qualification records are maintained on file.`);

  y = h2(doc, y, "Inspection Summary");
  const inspTypes = ["Foundation Inspection", "Reinforcement Check", "Concrete Pour Approval", "Structural Integrity Review", "MEP Systems Verification", "Finishing & Aesthetics"];
  autoTable(doc, {
    startY: y,
    head: [["Inspection Type", "Status", "Last Inspection", "Next Due", "Remarks"]],
    body: inspTypes.map((t, i) => {
      const statuses = ["Completed", "Completed", "In Progress", "Scheduled", "Pending", "Not Started"];
      const dates = ["2025-02-15", "2025-03-01", "2025-03-10", "2025-04-01", "2025-04-15", "2025-05-01"];
      return [t, statuses[i], formatDate(dates[i]), formatDate(dates[Math.min(i + 1, 5)]), i < 3 ? "Satisfactory" : "Upcoming"];
    }),
    headStyles: { fillColor: P, fontSize: 10 },
    styles: { fontSize: 10, cellPadding: 3 },
    didParseCell(data) {
      if (data.section === "body" && data.column.index === 1) {
        if (data.cell.raw === "Completed") data.cell.styles.textColor = P;
        else if (data.cell.raw === "In Progress") data.cell.styles.textColor = BLU;
        else if (data.cell.raw === "Pending" || data.cell.raw === "Not Started") data.cell.styles.textColor = AMB;
      }
    },
  });
  y = doc.lastAutoTable.finalY + 8;

  y = p(doc, y, `Quality assurance activities are integral to maintaining construction standards and preventing costly rework. The project team is advised to maintain rigorous inspection schedules and ensure all test results and inspection reports are promptly documented and archived. Any non-conformances identified during inspections must be addressed through corrective action requests (CARs) within the specified timeframe, with root cause analysis conducted to prevent recurrence.`);

  // ════════════════════════════════════════════════
  // ENVIRONMENTAL & COMPLIANCE
  // ════════════════════════════════════════════════
  doc.addPage(); y = 22;
  y = h(doc, y, `${++sec}. Environmental & Compliance`);

  y = p(doc, y, `Environmental management and regulatory compliance are essential aspects of responsible construction practice. ${proj.name} is committed to minimizing environmental impact and adhering to all applicable local, national, and international environmental regulations. This section provides an overview of the project's environmental management plan (EMP), compliance status, and sustainability initiatives.`);

  y = h2(doc, y, "Environmental Management Plan");
  y = p(doc, y, `The Environmental Management Plan (EMP) for ${proj.name} addresses the following key areas:\n\n• Dust & Air Quality Control: Water sprinklers and dust barriers are deployed at all active work areas. Air quality monitoring is conducted weekly at site boundaries to ensure compliance with National Ambient Air Quality Standards (NAAQS).\n\n• Noise Management: Construction activities generating noise above 85 dB are restricted to daytime hours (7:00 AM to 6:00 PM). Noise barriers are installed near residential areas, and regular noise level monitoring is conducted.\n\n• Waste Management: Construction and demolition (C&D) waste is segregated at source. Recyclable materials (steel, timber, plastics) are sent to authorized recycling facilities. Hazardous waste (paint, solvents, oils) is disposed of through licensed waste management contractors.\n\n• Water Management: Dewatering operations use settlement tanks to remove sediment before discharge. Groundwater monitoring wells are checked monthly to detect any contamination from construction activities.\n\n• Vegetation & Ecology: A tree transplantation plan has been prepared for any vegetation affected by construction. Post-construction landscaping plans include native species to restore and enhance the site ecology.`);

  y = h2(doc, y, "Regulatory Compliance Status");
  const compItems = [
    ["Building Permit", "Approved", "Municipality Office", "Valid"],
    ["Environmental Clearance", "Approved", "Ministry of Environment", "Valid"],
    ["Fire Safety NOC", "Applied", "Fire Brigade", "Pending"],
    ["Labour License", "Approved", "Department of Labour", "Valid"],
    ["Water & Drainage", "Under Review", "KUKL", "Processing"],
    ["Electrical Connection", "Approved", "NEA", "Valid"],
    ["Occupational Safety", "Compliant", "OSHA Nepal", "Certified"],
  ];
  autoTable(doc, {
    startY: y,
    head: [["Compliance Item", "Status", "Authority", "Validity"]],
    body: compItems,
    headStyles: { fillColor: P, fontSize: 10 },
    styles: { fontSize: 10, cellPadding: 3 },
    didParseCell(data) {
      if (data.section === "body" && data.column.index === 1) {
        if (data.cell.raw === "Approved" || data.cell.raw === "Compliant") data.cell.styles.textColor = P;
        else if (data.cell.raw === "Applied" || data.cell.raw === "Under Review") data.cell.styles.textColor = AMB;
      }
    },
  });
  y = doc.lastAutoTable.finalY + 8;

  y = p(doc, y, `All major regulatory approvals are in place for ${proj.name}. The project team must ensure that pending approvals (Fire Safety NOC, Water & Drainage) are obtained before the relevant construction activities commence. Compliance audits should be scheduled quarterly to maintain continuous adherence to regulatory requirements. Any changes in project scope or design must be communicated to the relevant authorities for necessary amendments to existing permits.`);

  y = p(doc, y, `Sustainability Initiatives: The project incorporates several sustainable construction practices including the use of energy-efficient HVAC systems, LED lighting throughout the facility, rainwater harvesting systems, and solar panel pre-installation provisions. These initiatives align with Nepal's commitment to sustainable development and can contribute to potential LEED or equivalent green building certification.`);

  // ════════════════════════════════════════════════
  // RECOMMENDATIONS
  // ════════════════════════════════════════════════
  doc.addPage(); y = 22;
  y = h(doc, y, `${++sec}. Recommendations & Next Steps`);

  const recos = [];
  if (myProgress && myProgress.actual < myProgress.planned) {
    const gap = myProgress.planned - myProgress.actual;
    recos.push(`Schedule Recovery: The project is ${gap} percentage points behind plan. Conduct a schedule recovery workshop with the project team to identify critical path bottlenecks. Consider extended working hours, additional crew deployment, or parallel task execution to recover lost time.`);
  }
  if (myProgress && myProgress.actual >= myProgress.planned) {
    recos.push(`Maintain Momentum: The project is on or ahead of schedule. Continue current resource allocation and ensure upcoming critical activities are adequately planned and resourced to sustain this performance.`);
  }
  if (myBudget) {
    const util = parseFloat(pct(myBudget.spent, myBudget.allocated));
    if (util > 80) recos.push(`Budget Review: Budget utilization has reached ${util}%. Schedule a formal budget review to assess remaining scope against available funds. Identify potential value engineering opportunities and ensure all variation orders are properly documented and approved.`);
    else recos.push(`Budget Management: Budget utilization at ${util}% is within acceptable range. Continue monthly cost tracking and forecast reviews. Ensure all procurement activities follow approved budgets.`);
  }
  if (myDelayed.length > 0) {
    recos.push(`Delayed Task Resolution: ${myDelayed.length} task(s) are overdue. Escalate to the Project Manager for immediate attention. For each delayed task: (a) identify root cause, (b) assign recovery owner, (c) set revised completion date, (d) report status weekly until resolved.`);
  }
  if (myRisks.length > 0) {
    const open = myRisks.filter((r) => r.status !== "Closed").length;
    recos.push(`Risk Mitigation: ${open} risk(s) remain open. Risk owners should provide updated mitigation status at the next project review meeting. High-impact risks (score >15/25) should be reviewed weekly until mitigated or closed.`);
  }
  if (mySafety.length > 0) {
    recos.push(`Safety Compliance: Following ${mySafety.length} incident(s), reinforce site safety protocols with focus on identified incident types. Conduct mandatory refresher toolbox talk sessions within two weeks. Verify all corrective actions from past incidents are fully implemented and documented.`);
  } else {
    recos.push(`Safety Excellence: Maintain the zero-incident record through continued adherence to ConPro safety standards. Recognize site teams for their safety performance to reinforce positive behavior.`);
  }
  recos.push(`Stakeholder Communication: Schedule the next client progress meeting with ${proj.client} to present current status, discuss any timeline or budget adjustments, and confirm upcoming milestone targets.`);
  recos.push(`Quality Assurance: Continue regular quality inspections at key construction milestones. Ensure all material test certificates, concrete cube test results, and inspection reports are properly documented and archived in the project document register.`);
  recos.push(`Documentation: Maintain up-to-date project records including as-built drawings, variation orders, inspection reports, and meeting minutes. Current document count: ${myDocs.length} files on record.`);

  recos.forEach((r, i) => {
    y = ck(doc, y, 20);
    y = p(doc, y, `${i + 1}. ${r}`);
  });

  // ════════════════════════════════════════════════
  // CONCLUSION & SIGN-OFF
  // ════════════════════════════════════════════════
  doc.addPage(); y = 22;
  y = h(doc, y, `${++sec}. Conclusion & Sign-off`);

  y = p(doc, y, `This report has provided a comprehensive assessment of ${proj.name}, covering all critical aspects of project delivery including progress tracking, financial management, task execution, risk assessment, safety compliance, quality assurance, environmental management, and regulatory adherence.`);

  y = p(doc, y, `As of ${TODAY}, the project stands at ${proj.progress}% overall completion against a target completion date of ${formatDate(proj.end)}. ${progressVar >= 0 ? "The project is on or ahead of schedule, reflecting effective planning and execution by the project team." : `The project is ${Math.abs(progressVar)} percentage points behind the planned schedule. Immediate corrective actions are recommended, including a schedule recovery workshop, resource reallocation assessment, and weekly progress monitoring until the variance is eliminated.`}`);

  y = p(doc, y, `Financially, the project has utilized ${budgetUtil}% of its allocated budget of ${npr(myBudget ? myBudget.allocated : proj.budget)}, with ${npr(budgetRem)} remaining. ${budgetUtil > 90 ? "The budget is under significant strain and requires an urgent financial review to ensure remaining activities can be completed within the available funds. Value engineering opportunities should be actively explored." : budgetUtil > 75 ? "Budget utilization is approaching the upper threshold. Continued close monitoring and cost optimization measures are recommended to ensure the project remains financially viable." : "The financial position is healthy with adequate reserves. Regular cost tracking and variance analysis should continue to maintain this positive trajectory."}`);

  y = p(doc, y, `The project team of ${myTeam.length} professionals continues to work towards successful delivery. ${myDelayed.length > 0 ? `The ${myDelayed.length} overdue task(s) require immediate attention and should be the primary focus of the next project coordination meeting.` : "All tasks are currently on schedule, reflecting strong coordination and accountability within the team."} ${mySafety.length > 0 ? `The ${mySafety.length} safety incident(s) have been addressed with corrective actions, but continued vigilance is essential.` : "The exemplary safety record should be maintained through continued adherence to established protocols."}`);

  y = p(doc, y, `ConPro remains committed to delivering ${proj.name} to the highest standards of quality, safety, and client satisfaction. Regular reporting will continue on a monthly basis to ensure all stakeholders remain informed of project status and any emerging issues are addressed promptly.`);

  y += 10;
  y = h2(doc, y, "Report Authorization");
  y = ck(doc, y, 80);

  const signFields = [
    ["Prepared By", "Project Coordinator"],
    ["Reviewed By", "Project Manager"],
    ["Approved By", "Project Director"],
  ];
  signFields.forEach(([label, role]) => {
    doc.setFontSize(11); doc.setTextColor(...D);
    doc.text(label + ":", M, y);
    doc.setTextColor(...MU);
    doc.text(role, M + 50, y);
    doc.setDrawColor(180, 180, 180); doc.setLineWidth(0.3);
    doc.line(M, y + 14, M + 70, y + 14);
    doc.setFontSize(9); doc.setTextColor(...MU);
    doc.text("Signature / Date", M, y + 19);
    y += 30;
  });

  y += 5;
  doc.setFontSize(10); doc.setTextColor(...MU);
  doc.text("— End of Report —", W / 2, y, { align: "center" });

  footers(doc);
  doc.save(`ConPro_${proj.name.replace(/\s+/g, "_")}_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
}
