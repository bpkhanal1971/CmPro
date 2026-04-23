import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { EVM_DATA } from "../data/sampleData";

const PRIMARY = [46, 125, 50];
const DARK = [30, 30, 30];
const MUTED = [120, 120, 120];
const WHITE = [255, 255, 255];
const TODAY = new Date().toLocaleDateString("en-NP", { year: "numeric", month: "long", day: "numeric" });
const W = 215.9;
const PH = 279.4;
const MARGIN = 20;
const CONTENT_W = W - MARGIN * 2;

function fmtNPR(n) {
  return "Rs " + Number(n).toLocaleString("en-IN");
}

function addPageFooter(doc) {
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text(`ConPro — Confidential`, MARGIN, PH - 12);
    doc.text(`Page ${i} of ${pageCount}`, W - MARGIN, PH - 12, { align: "right" });
  }
}

function safeY(doc, y, need = 20) {
  if (y + need > PH - 22) { doc.addPage(); return 22; }
  return y;
}

function sectionTitle(doc, y, title) {
  y = safeY(doc, y, 22);
  doc.setFontSize(16);
  doc.setTextColor(...PRIMARY);
  doc.text(title, MARGIN, y);
  doc.setDrawColor(...PRIMARY);
  doc.setLineWidth(0.6);
  doc.line(MARGIN, y + 3, W - MARGIN, y + 3);
  return y + 12;
}

function paragraph(doc, y, text, { fontSize = 12, lineHeight = 6 } = {}) {
  doc.setFontSize(fontSize);
  doc.setTextColor(50, 50, 50);
  const lines = doc.splitTextToSize(text, CONTENT_W);
  y = safeY(doc, y, lines.length * lineHeight + 2);
  doc.text(lines, MARGIN, y);
  return y + lines.length * lineHeight + 5;
}

function drawBarChart(doc, x, y, w, h, data, { barColor = PRIMARY, label = "" } = {}) {
  const maxVal = Math.max(...data.map((d) => Math.max(d.v1, d.v2 || 0)));
  const barW = Math.min(12, (w - 20) / data.length / 2 - 2);
  const gap = (w - 10) / data.length;

  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.2);
  for (let i = 0; i <= 4; i++) {
    const ly = y + h - (h * i) / 4;
    doc.line(x, ly, x + w, ly);
  }

  data.forEach((d, i) => {
    const bx = x + 5 + i * gap;
    const h1 = (d.v1 / maxVal) * (h - 10);
    const h2 = d.v2 != null ? (d.v2 / maxVal) * (h - 10) : 0;

    doc.setFillColor(165, 214, 167);
    doc.rect(bx, y + h - h1, barW, h1, "F");

    if (d.v2 != null) {
      doc.setFillColor(...barColor);
      doc.rect(bx + barW + 1, y + h - h2, barW, h2, "F");
    }

    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(d.label, bx + barW, y + h + 6, { align: "center" });
  });

  if (label) {
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text(label, x + w / 2, y - 3, { align: "center" });
  }
}

function drawHBar(doc, x, y, w, label, pct, color = PRIMARY) {
  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);
  doc.text(label, x, y);
  doc.setFillColor(230, 230, 230);
  doc.rect(x, y + 3, w, 6, "F");
  doc.setFillColor(...color);
  doc.rect(x, y + 3, w * Math.min(pct / 100, 1), 6, "F");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(`${pct.toFixed(1)}%`, x + w + 3, y + 8);
  return y + 16;
}

function drawPieIndicator(doc, cx, cy, r, segments) {
  let angle = -Math.PI / 2;
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  segments.forEach((seg) => {
    const sliceAngle = (seg.value / total) * 2 * Math.PI;
    doc.setFillColor(...seg.color);
    const steps = Math.max(20, Math.round(sliceAngle * 30));
    const points = [[cx, cy]];
    for (let i = 0; i <= steps; i++) {
      const a = angle + (sliceAngle * i) / steps;
      points.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
    for (let i = 1; i < points.length - 1; i++) {
      doc.triangle(
        points[0][0], points[0][1],
        points[i][0], points[i][1],
        points[i + 1][0], points[i + 1][1],
        "F"
      );
    }
    angle += sliceAngle;
  });
}

function fmtCr(n) {
  const abs = Math.abs(n);
  if (abs >= 10000000) return (n / 10000000).toFixed(1) + " Cr";
  if (abs >= 100000) return (n / 100000).toFixed(1) + " L";
  return (n / 1000).toFixed(0) + " K";
}

function drawSCurve(doc, x, y, w, ht, data) {
  const pl = 18, ch = ht - 20;
  const cw = w - pl - 4;
  const ox = x + pl, oy = y;
  const n = data.length;
  doc.setDrawColor(220, 220, 220); doc.setLineWidth(0.2);
  for (let i = 0; i <= 5; i++) {
    const ly = oy + ch - (ch * i) / 5;
    doc.line(ox, ly, ox + cw, ly);
    doc.setFontSize(7); doc.setTextColor(...MUTED);
    doc.text(`${i * 20}%`, ox - 3, ly + 2, { align: "right" });
  }
  doc.setDrawColor(46, 125, 50); doc.setLineWidth(0.8);
  for (let i = 0; i < n - 1; i++) {
    const x1 = ox + (i / (n - 1)) * cw, x2 = ox + ((i + 1) / (n - 1)) * cw;
    const y1 = oy + ch - (data[i].plannedPct / 100) * ch, y2 = oy + ch - (data[i + 1].plannedPct / 100) * ch;
    if (i % 2 === 0) doc.line(x1, y1, x2, y2);
  }
  const actuals = data.filter((d) => d.actualPct > 0);
  if (actuals.length > 1) {
    doc.setDrawColor(21, 101, 192); doc.setLineWidth(1);
    for (let i = 0; i < actuals.length - 1; i++) {
      const ai = data.indexOf(actuals[i]), bi = data.indexOf(actuals[i + 1]);
      doc.line(ox + (ai / (n - 1)) * cw, oy + ch - (actuals[i].actualPct / 100) * ch,
               ox + (bi / (n - 1)) * cw, oy + ch - (actuals[i + 1].actualPct / 100) * ch);
    }
  }
  data.forEach((d, i) => {
    if (n <= 12 || i % 3 === 0 || i === n - 1) {
      doc.setFontSize(6); doc.setTextColor(...MUTED);
      doc.text(d.month, ox + (i / (n - 1)) * cw, oy + ch + 8, { align: "center" });
    }
  });
  doc.setDrawColor(180, 180, 180); doc.setLineWidth(0.3);
  doc.line(ox, oy, ox, oy + ch); doc.line(ox, oy + ch, ox + cw, oy + ch);
  const ly = oy + ch + 14;
  doc.setFontSize(7);
  doc.setDrawColor(46, 125, 50); doc.setLineWidth(0.8); doc.line(ox, ly, ox + 8, ly);
  doc.setTextColor(46, 125, 50); doc.text("Planned", ox + 10, ly + 1);
  doc.setDrawColor(21, 101, 192); doc.line(ox + 30, ly, ox + 38, ly);
  doc.setTextColor(21, 101, 192); doc.text("Actual", ox + 40, ly + 1);
  return oy + ht + 4;
}

function drawEVMChart(doc, x, y, w, ht, data, BAC) {
  const pl = 24, ch = ht - 20;
  const cw = w - pl - 4;
  const ox = x + pl, oy = y;
  const maxVal = BAC * 1.1;
  const n = data.length;
  doc.setDrawColor(220, 220, 220); doc.setLineWidth(0.2);
  for (let i = 0; i <= 5; i++) {
    const val = (maxVal / 5) * i, ly = oy + ch - (val / maxVal) * ch;
    doc.line(ox, ly, ox + cw, ly);
    doc.setFontSize(6); doc.setTextColor(...MUTED);
    doc.text(fmtCr(val), ox - 3, ly + 2, { align: "right" });
  }
  const bacY = oy + ch - (BAC / maxVal) * ch;
  doc.setDrawColor(156, 39, 176); doc.setLineWidth(0.4);
  for (let i = 0; i < cw; i += 6) doc.line(ox + i, bacY, ox + Math.min(i + 3, cw), bacY);

  function dl(key, color, dashed) {
    const pts = data.filter((d) => d[key] > 0);
    if (pts.length < 2) return;
    doc.setDrawColor(...color); doc.setLineWidth(0.8);
    for (let i = 0; i < pts.length - 1; i++) {
      const ai = data.indexOf(pts[i]), bi = data.indexOf(pts[i + 1]);
      const x1 = ox + (ai / (n - 1)) * cw, x2 = ox + (bi / (n - 1)) * cw;
      const y1 = oy + ch - (pts[i][key] / maxVal) * ch, y2 = oy + ch - (pts[i + 1][key] / maxVal) * ch;
      if (dashed) { if (i % 2 === 0) doc.line(x1, y1, x2, y2); } else doc.line(x1, y1, x2, y2);
    }
  }
  dl("PV", [46, 125, 50], true); dl("EV", [21, 101, 192], false); dl("AC", [229, 57, 53], false);

  data.forEach((d, i) => {
    if (n <= 12 || i % 3 === 0 || i === n - 1) {
      doc.setFontSize(6); doc.setTextColor(...MUTED);
      doc.text(d.month, ox + (i / (n - 1)) * cw, oy + ch + 8, { align: "center" });
    }
  });
  doc.setDrawColor(180, 180, 180); doc.setLineWidth(0.3);
  doc.line(ox, oy, ox, oy + ch); doc.line(ox, oy + ch, ox + cw, oy + ch);
  const ly = oy + ch + 14;
  doc.setFontSize(7);
  doc.setDrawColor(46, 125, 50); doc.setLineWidth(0.8); doc.line(ox, ly, ox + 8, ly);
  doc.setTextColor(46, 125, 50); doc.text("PV", ox + 10, ly + 1);
  doc.setDrawColor(21, 101, 192); doc.line(ox + 22, ly, ox + 30, ly);
  doc.setTextColor(21, 101, 192); doc.text("EV", ox + 32, ly + 1);
  doc.setDrawColor(229, 57, 53); doc.line(ox + 44, ly, ox + 52, ly);
  doc.setTextColor(229, 57, 53); doc.text("AC", ox + 54, ly + 1);
  return oy + ht + 4;
}

export function exportFullReport({
  projects, tasks, progress, budget, risks, riskRecords,
  delayedTasks, safetyIncidents, monthlyCompletion,
  budgetExpenses, formatDate,
}) {
  const doc = new jsPDF({ format: "letter" });

  // ─── PAGE 1: COVER ───
  doc.setFillColor(...PRIMARY);
  doc.rect(0, 0, W, 125, "F");
  doc.setFontSize(38);
  doc.setTextColor(...WHITE);
  doc.text("ConPro", W / 2, 46, { align: "center" });
  doc.setFontSize(15);
  doc.text("Construction Project Management System", W / 2, 60, { align: "center" });
  doc.setDrawColor(...WHITE);
  doc.setLineWidth(0.8);
  doc.line(55, 68, W - 55, 68);
  doc.setFontSize(24);
  doc.text("Comprehensive Project Report", W / 2, 86, { align: "center" });
  doc.setFontSize(13);
  doc.text(TODAY, W / 2, 102, { align: "center" });

  doc.setFontSize(12);
  doc.setTextColor(...DARK);
  let cy = 146;
  const totalBudget = projects.reduce((s, p) => s + p.budget, 0);
  const avgProgress = Math.round(projects.reduce((s, p) => s + p.progress, 0) / projects.length);
  const inProgressProjects = projects.filter((p) => p.status === "In Progress").length;

  const summaryItems = [
    ["Total Projects", String(projects.length)],
    ["Active Tasks", String(tasks.length)],
    ["Delayed Tasks", String(delayedTasks.length)],
    ["Safety Incidents", String(safetyIncidents.length)],
    ["Total Portfolio Budget", fmtNPR(totalBudget)],
    ["Average Progress", `${avgProgress}%`],
  ];
  summaryItems.forEach(([label, value]) => {
    doc.setFontSize(11);
    doc.setTextColor(...MUTED);
    doc.text(label + ":", MARGIN + 10, cy);
    doc.setFontSize(12);
    doc.setTextColor(...DARK);
    doc.text(value, MARGIN + 75, cy);
    cy += 12;
  });

  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  doc.text("This report contains confidential project data. Distribution is restricted to authorized personnel only.", W / 2, PH - 22, { align: "center" });

  // ─── PAGE 2: TABLE OF CONTENTS ───
  doc.addPage();
  let y = 22;
  doc.setFontSize(18);
  doc.setTextColor(...PRIMARY);
  doc.text("Table of Contents", MARGIN, y);
  doc.setDrawColor(...PRIMARY);
  doc.setLineWidth(0.6);
  doc.line(MARGIN, y + 4, W - MARGIN, y + 4);
  y += 18;

  const tocEntries = [
    "1. Executive Summary",
    "2. Project Portfolio Overview",
    "3. Progress Analysis",
    "4. S-Curve & Earned Value Management (EVM)",
    "5. Financial & Budget Analysis",
    "6. Risk Assessment",
    "7. Delayed Tasks Analysis",
    "8. Safety & Incident Report",
    "9. Resource & Workforce Analysis",
    "10. Quality Assurance",
    "11. Environmental & Compliance",
    "12. Recommendations & Next Steps",
    "13. Conclusion & Sign-off",
  ];
  tocEntries.forEach((item) => {
    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    doc.text(item, MARGIN + 6, y);
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    doc.line(MARGIN + 6, y + 2, W - MARGIN, y + 2);
    y += 12;
  });

  y += 12;
  doc.setFontSize(11);
  doc.setTextColor(...MUTED);
  doc.text("Report prepared by ConPro Project Management System", MARGIN + 6, y);
  y += 7;
  doc.text(`Report Date: ${TODAY}`, MARGIN + 6, y);
  y += 7;
  doc.text(`Total Projects: ${projects.length}  |  Total Tasks: ${tasks.length}`, MARGIN + 6, y);
  y += 7;
  doc.text(`Portfolio Budget: ${fmtNPR(totalBudget)}`, MARGIN + 6, y);

  // ─── PAGE 3: EXECUTIVE SUMMARY ───
  doc.addPage();
  y = 22;
  y = sectionTitle(doc, y, "1. Executive Summary");

  const totalAllocated = budget.reduce((s, b) => s + b.allocated, 0);
  const totalSpent = budget.reduce((s, b) => s + b.spent, 0);
  const riskTotal = risks.reduce((s, r) => s + r.count, 0);
  const critHigh = risks.filter((r) => r.level === "Critical" || r.level === "High").reduce((s, r) => s + r.count, 0);

  const execSummary = `ConPro currently manages ${projects.length} construction projects across Nepal with a combined portfolio value of ${fmtNPR(totalBudget)}. As of the reporting date, ${inProgressProjects} projects are actively under construction, with an average completion rate of ${avgProgress}%. The portfolio is performing within acceptable variance thresholds, though ${delayedTasks.length} tasks across multiple projects are currently behind schedule and require management attention.

On the financial front, ${fmtNPR(totalSpent)} of the total ${fmtNPR(totalAllocated)} allocated budget has been utilized, representing a ${((totalSpent / totalAllocated) * 100).toFixed(1)}% expenditure rate. The overall budget remains healthy with ${fmtNPR(totalAllocated - totalSpent)} in remaining funds.

The risk register contains ${riskTotal} identified risks, of which ${critHigh} are classified as Critical or High severity. ${safetyIncidents.length} safety incidents have been recorded in the current reporting period, with ${safetyIncidents.filter((s) => s.severity === "High").length} classified as High severity. Immediate corrective actions have been implemented for all reported incidents.`;

  y = paragraph(doc, y, execSummary);

  y = safeY(doc, y, 16);
  doc.setFontSize(13);
  doc.setTextColor(...DARK);
  doc.text("Portfolio Key Performance Indicators", MARGIN, y);
  y += 6;

  const completedTasks = tasks.filter((t) => t.status === "Done").length;
  const activeTasks = tasks.filter((t) => t.status === "In Progress").length;
  const pendingTasks = tasks.filter((t) => t.status === "To Do").length;
  const kpiData = [
    ["Total Projects", String(projects.length), `${inProgressProjects} Active`],
    ["Average Progress", `${avgProgress}%`, avgProgress >= 50 ? "On Track" : "Needs Attention"],
    ["Total Budget", fmtNPR(totalBudget), "Sanctioned"],
    ["Budget Spent", fmtNPR(totalSpent), `${((totalSpent / totalAllocated) * 100).toFixed(1)}% Utilized`],
    ["Budget Remaining", fmtNPR(totalAllocated - totalSpent), `${((1 - totalSpent / totalAllocated) * 100).toFixed(1)}% Reserve`],
    ["Total Tasks", String(tasks.length), `${completedTasks} Done, ${activeTasks} Active, ${pendingTasks} Pending`],
    ["Delayed Tasks", String(delayedTasks.length), delayedTasks.length === 0 ? "None" : "Escalation Required"],
    ["Identified Risks", String(riskTotal), `${critHigh} Critical/High`],
    ["Safety Incidents", String(safetyIncidents.length), `${safetyIncidents.filter((s) => s.severity === "High").length} High Severity`],
  ];
  autoTable(doc, {
    startY: y,
    head: [["Indicator", "Value", "Remarks"]],
    body: kpiData,
    headStyles: { fillColor: PRIMARY, fontSize: 10 },
    styles: { fontSize: 10, cellPadding: 3.5 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 55 } },
  });
  y = doc.lastAutoTable.finalY + 8;

  y = paragraph(doc, y, `The portfolio is ${avgProgress >= 50 ? "performing within acceptable parameters" : "showing signs of underperformance that require management attention"}. Financial indicators suggest ${totalSpent / totalAllocated < 0.8 ? "healthy budget reserves across the portfolio" : "tightening budget margins that warrant closer financial oversight"}. The risk and safety profiles require continued vigilance and proactive management.`);

  // ─── PROJECT PORTFOLIO OVERVIEW ───
  doc.addPage();
  y = 22;
  y = sectionTitle(doc, y, "2. Project Portfolio Overview");

  const projectNarrative = `The following table presents the current status of all ${projects.length} active projects in the ConPro portfolio. Each project is tracked by location, timeline, budget allocation, and progress against planned milestones.`;
  y = paragraph(doc, y, projectNarrative);

  autoTable(doc, {
    startY: y,
    head: [["Project", "Client", "Location", "Status", "Progress", "Budget"]],
    body: projects.map((p) => [
      p.name,
      p.client,
      p.location,
      p.status,
      `${p.progress}%`,
      fmtNPR(p.budget),
    ]),
    headStyles: { fillColor: PRIMARY, fontSize: 10 },
    styles: { fontSize: 10, cellPadding: 3.5 },
  });

  y = doc.lastAutoTable.finalY + 8;

  projects.forEach((p) => {
    const variance = p.progress >= 50 ? "on track" : "requires close monitoring";
    const statusNote = p.status === "On Hold"
      ? `This project is currently on hold at ${p.progress}% completion due to pending external approvals.`
      : p.status === "Planning"
        ? `This project is in the planning phase with ${p.progress}% of preliminary activities completed.`
        : `Construction is actively in progress at ${p.progress}% completion and is ${variance}.`;
    if (y > PH - 30) { doc.addPage(); y = 22; }
    doc.setFontSize(11);
    doc.setTextColor(...PRIMARY);
    doc.text(`• ${p.name}`, MARGIN + 2, y);
    y += 6;
    y = paragraph(doc, y, `${statusNote} Located in ${p.location}, the project serves ${p.client} with a total budget of ${fmtNPR(p.budget)}.`);
  });

  // ─── PAGE 3: PROGRESS ANALYSIS + CHARTS ───
  doc.addPage();
  y = 22;
  y = sectionTitle(doc, y, "3. Progress Analysis");

  const progressNarrative = `Project progress is measured against planned milestones established during the project planning phase. The table below compares planned versus actual completion percentages. A negative variance indicates the project is behind schedule and may require resource reallocation or timeline adjustment.`;
  y = paragraph(doc, y, progressNarrative);

  autoTable(doc, {
    startY: y,
    head: [["Project", "Planned %", "Actual %", "Variance", "Status", "Assessment"]],
    body: progress.map((p) => {
      const v = p.actual - p.planned;
      const assessment = v >= 0 ? "On Track" : v >= -5 ? "Minor Delay" : "Behind Schedule";
      return [p.project, `${p.planned}%`, `${p.actual}%`, `${v >= 0 ? "+" : ""}${v}%`, p.status, assessment];
    }),
    headStyles: { fillColor: PRIMARY, fontSize: 10 },
    styles: { fontSize: 10, cellPadding: 3.5 },
  });

  y = doc.lastAutoTable.finalY + 10;

  doc.setFontSize(13);
  doc.setTextColor(...DARK);
  doc.text("Monthly Task Completion Trend", MARGIN, y);
  y += 4;

  doc.setFontSize(9);
  doc.setTextColor(165, 214, 167);
  doc.text("■ Planned", MARGIN, y + 3);
  doc.setTextColor(...PRIMARY);
  doc.text("■ Actual", MARGIN + 28, y + 3);
  y += 7;

  drawBarChart(doc, MARGIN, y, CONTENT_W, 55, monthlyCompletion.map((d) => ({
    label: d.month,
    v1: d.planned,
    v2: d.actual,
  })));
  y += 65;

  const behindSchedule = progress.filter((p) => p.actual < p.planned);
  if (behindSchedule.length > 0) {
    const names = behindSchedule.map((p) => p.project).join(", ");
    y = paragraph(doc, y, `Assessment: ${behindSchedule.length} out of ${progress.length} projects are currently behind their planned schedule: ${names}. Management should review resource allocation and consider schedule recovery measures for these projects. The monthly completion trend chart above shows a consistent gap between planned and actual completion rates, indicating systemic scheduling challenges that may benefit from a portfolio-wide review.`);
  }

  // ─── S-CURVE & EVM ANALYSIS ───
  doc.addPage();
  y = 22;
  y = sectionTitle(doc, y, "4. S-Curve & Earned Value Management (EVM)");

  y = paragraph(doc, y, `This section presents the S-Curve (Progress vs. Time) and Earned Value Management (EVM) analysis for each project in the portfolio. The S-Curve tracks cumulative planned vs. actual progress, while EVM integrates scope, schedule, and cost to measure overall project health. These tools enable early detection of schedule delays and cost overruns.`);

  y = paragraph(doc, y, `Key EVM Metrics Explained:\n• CPI (Cost Performance Index) = EV / AC — Values > 1.0 indicate cost efficiency (under budget).\n• SPI (Schedule Performance Index) = EV / PV — Values > 1.0 indicate schedule efficiency (ahead).\n• EAC (Estimate at Completion) = BAC / CPI — Forecasted total project cost based on current performance.\n• TCPI (To-Complete Performance Index) = (BAC - EV) / (BAC - AC) — Required cost efficiency for remaining work.`);

  projects.forEach((pr) => {
    const evmD = EVM_DATA[pr.name];
    if (!evmD) return;
    const months = evmD.months;
    const actuals = months.filter((m) => m.EV > 0);
    if (actuals.length === 0) return;
    const latest = actuals[actuals.length - 1];
    const BAC = evmD.BAC;
    const CV = latest.EV - latest.AC;
    const SV = latest.EV - latest.PV;
    const CPI = latest.AC > 0 ? latest.EV / latest.AC : 0;
    const SPI = latest.PV > 0 ? latest.EV / latest.PV : 0;
    const EAC = CPI > 0 ? BAC / CPI : BAC;

    y = safeY(doc, y, 20);
    doc.setFontSize(13); doc.setTextColor(...PRIMARY);
    doc.text(`${pr.name}`, MARGIN, y); y += 6;

    // S-Curve
    y = safeY(doc, y, 75);
    doc.setFontSize(10); doc.setTextColor(...DARK);
    doc.text("S-Curve (Progress vs. Time)", MARGIN, y); y += 4;
    y = drawSCurve(doc, MARGIN, y, CONTENT_W / 2 - 4, 60, months);

    // Mini EVM chart on right
    const evmX = MARGIN + CONTENT_W / 2 + 4;
    let ey = y - 64;
    doc.setFontSize(10); doc.setTextColor(...DARK);
    doc.text("EVM (PV / EV / AC)", evmX, ey); ey += 4;
    drawEVMChart(doc, evmX, ey, CONTENT_W / 2 - 4, 60, months, BAC);

    const dev = latest.actualPct - latest.plannedPct;
    y = safeY(doc, y, 12);
    y = paragraph(doc, y, `Progress: ${latest.actualPct}% actual vs ${latest.plannedPct}% planned (${dev >= 0 ? "+" : ""}${dev}%). CPI: ${CPI.toFixed(2)} | SPI: ${SPI.toFixed(2)} | CV: ${fmtNPR(CV)} | SV: ${fmtNPR(SV)} | EAC: ${fmtNPR(EAC)}. ${CPI >= 1 && SPI >= 1 ? "Project is performing well — under budget and on schedule." : CPI < 1 && SPI < 1 ? "Project is over budget and behind schedule — corrective action required." : CPI < 1 ? "Project is experiencing cost overruns." : "Project is behind schedule."}`);
  });

  // ─── BUDGET ANALYSIS ───
  doc.addPage();
  y = 22;
  y = sectionTitle(doc, y, "5. Financial & Budget Analysis");

  const budgetNarrative = `The total allocated budget across all projects is ${fmtNPR(totalAllocated)}, of which ${fmtNPR(totalSpent)} (${((totalSpent / totalAllocated) * 100).toFixed(1)}%) has been spent to date. The remaining balance of ${fmtNPR(totalAllocated - totalSpent)} provides a buffer of ${((1 - totalSpent / totalAllocated) * 100).toFixed(1)}% against the total allocation. Below is a detailed breakdown by project.`;
  y = paragraph(doc, y, budgetNarrative);

  autoTable(doc, {
    startY: y,
    head: [["Project", "Allocated", "Spent", "Remaining", "Utilization"]],
    body: budget.map((b) => [
      b.project,
      fmtNPR(b.allocated),
      fmtNPR(b.spent),
      fmtNPR(b.allocated - b.spent),
      `${((b.spent / b.allocated) * 100).toFixed(1)}%`,
    ]),
    headStyles: { fillColor: PRIMARY, fontSize: 10 },
    styles: { fontSize: 10, cellPadding: 3.5 },
    foot: [["TOTAL", fmtNPR(totalAllocated), fmtNPR(totalSpent), fmtNPR(totalAllocated - totalSpent), `${((totalSpent / totalAllocated) * 100).toFixed(1)}%`]],
    footStyles: { fillColor: [240, 240, 240], textColor: DARK, fontStyle: "bold" },
  });

  y = doc.lastAutoTable.finalY + 10;

  doc.setFontSize(13);
  doc.setTextColor(...DARK);
  doc.text("Budget Utilization by Project", MARGIN, y);
  y += 9;

  budget.forEach((b) => {
    const pct = (b.spent / b.allocated) * 100;
    const color = pct > 100 ? [229, 57, 53] : pct > 80 ? [245, 127, 23] : PRIMARY;
    y = drawHBar(doc, MARGIN, y, 120, b.project, pct, color);
  });

  y += 4;
  const overBudget = budget.filter((b) => b.spent > b.allocated);
  const healthyBudget = budget.filter((b) => (b.spent / b.allocated) < 0.8);
  y = paragraph(doc, y, `Budget Health Summary: ${healthyBudget.length} of ${budget.length} projects are operating at less than 80% budget utilization, indicating healthy financial reserves. ${overBudget.length > 0 ? `${overBudget.length} project(s) have exceeded their allocated budget and require immediate financial review.` : "No projects have exceeded their allocated budget at this time."} The overall portfolio financial health is stable with adequate contingency reserves.`);

  if (budgetExpenses && budgetExpenses.length > 0) {
    y += 2;
    doc.setFontSize(13);
    doc.setTextColor(...DARK);
    doc.text("Category-wise Expenditure (Kathmandu Business Park)", MARGIN, y);
    y += 5;
    autoTable(doc, {
      startY: y,
      head: [["Category", "Planned", "Actual", "Variance"]],
      body: budgetExpenses.map((e) => [
        e.category,
        fmtNPR(e.planned),
        fmtNPR(e.actual),
        fmtNPR(e.actual - e.planned),
      ]),
      headStyles: { fillColor: PRIMARY, fontSize: 10 },
      styles: { fontSize: 10, cellPadding: 3.5 },
    });
  }

  // ─── PAGE 5: RISK + DELAYED TASKS ───
  doc.addPage();
  y = 22;
  y = sectionTitle(doc, y, "6. Risk Assessment");

  const riskNarrative = `A total of ${riskTotal} risks have been identified across all projects. ${critHigh} risks are classified as Critical or High severity and are under active mitigation. The risk distribution is shown below alongside the detailed risk register.`;
  y = paragraph(doc, y, riskNarrative);

  doc.setFontSize(13);
  doc.setTextColor(...DARK);
  doc.text("Risk Distribution", MARGIN, y);
  y += 5;

  const riskColors = {
    Critical: [229, 57, 53],
    High: [245, 127, 23],
    Medium: [46, 125, 50],
    Low: [66, 165, 245],
  };

  drawPieIndicator(doc, MARGIN + 30, y + 25, 22, risks.map((r) => ({
    value: r.count,
    color: riskColors[r.level] || MUTED,
  })));

  let legendY = y + 6;
  risks.forEach((r) => {
    const c = riskColors[r.level] || MUTED;
    doc.setFillColor(...c);
    doc.rect(MARGIN + 62, legendY - 3, 8, 5, "F");
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    doc.text(`${r.level}: ${r.count} (${((r.count / riskTotal) * 100).toFixed(0)}%)`, MARGIN + 73, legendY);
    legendY += 10;
  });

  y += 55;

  if (riskRecords && riskRecords.length > 0) {
    doc.setFontSize(13);
    doc.setTextColor(...DARK);
    doc.text("Risk Register (Top Risks)", MARGIN, y);
    y += 5;
    autoTable(doc, {
      startY: y,
      head: [["ID", "Risk Title", "Prob", "Impact", "Owner", "Status"]],
      body: riskRecords.slice(0, 8).map((r) => [
        r.id,
        r.title,
        `${r.probability}/5`,
        `${r.impact}/5`,
        r.owner,
        r.status,
      ]),
      headStyles: { fillColor: PRIMARY, fontSize: 10 },
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: { 1: { cellWidth: 55 } },
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  if (y > PH - 70) { doc.addPage(); y = 22; }
  y = sectionTitle(doc, y, "7. Delayed Tasks Analysis");

  const delayNarrative = `${delayedTasks.length} tasks are currently overdue across the project portfolio. The average delay is ${(delayedTasks.reduce((s, t) => s + t.daysLate, 0) / delayedTasks.length).toFixed(0)} days. The most critical delay is "${delayedTasks.sort((a, b) => b.daysLate - a.daysLate)[0].task}" at ${delayedTasks.sort((a, b) => b.daysLate - a.daysLate)[0].daysLate} days overdue. Management intervention is recommended for all tasks exceeding 10 days delay.`;
  y = paragraph(doc, y, delayNarrative);

  autoTable(doc, {
    startY: y,
    head: [["Task", "Project", "Assigned To", "Due Date", "Days Late", "Severity"]],
    body: delayedTasks.map((t) => [
      t.task,
      t.project,
      t.assignee,
      formatDate(t.due),
      `${t.daysLate}`,
      t.daysLate >= 10 ? "Critical" : t.daysLate >= 7 ? "High" : "Moderate",
    ]),
    headStyles: { fillColor: PRIMARY, fontSize: 10 },
    styles: { fontSize: 10, cellPadding: 3 },
    didParseCell(data) {
      if (data.section === "body" && data.column.index === 5) {
        const val = data.cell.raw;
        if (val === "Critical") data.cell.styles.textColor = [229, 57, 53];
        else if (val === "High") data.cell.styles.textColor = [245, 127, 23];
      }
    },
  });

  // ─── PAGE 6: SAFETY ───
  doc.addPage();
  y = 22;
  y = sectionTitle(doc, y, "8. Safety & Incident Report");

  const highCount = safetyIncidents.filter((s) => s.severity === "High").length;
  const medCount = safetyIncidents.filter((s) => s.severity === "Medium").length;
  const lowCount = safetyIncidents.filter((s) => s.severity === "Low").length;

  const safetyNarrative = `During the current reporting period, ${safetyIncidents.length} safety incidents were recorded across all project sites. Of these, ${highCount} were classified as High severity, ${medCount} as Medium, and ${lowCount} as Low. Incident types include near misses, minor injuries, equipment damage, PPE violations, and fire hazards. All incidents have been investigated, and corrective actions have been implemented as documented below.

Safety remains a top priority for ConPro. All site personnel are required to complete weekly toolbox talks, and mandatory PPE compliance checks are conducted at all entry points. The following table provides a complete incident log for the reporting period.`;
  y = paragraph(doc, y, safetyNarrative);

  doc.setFontSize(12);
  doc.setTextColor(...DARK);
  const statsY = y;
  [[`High: ${highCount}`, [229, 57, 53]], [`Medium: ${medCount}`, [245, 127, 23]], [`Low: ${lowCount}`, [46, 125, 50]], [`Total: ${safetyIncidents.length}`, MUTED]].forEach(([text, color], i) => {
    const bx = MARGIN + i * 44;
    doc.setFillColor(...color);
    doc.roundedRect(bx, statsY, 42, 15, 3, 3, "F");
    doc.setFontSize(11);
    doc.setTextColor(...WHITE);
    doc.text(text, bx + 21, statsY + 10, { align: "center" });
  });
  y = statsY + 24;

  autoTable(doc, {
    startY: y,
    head: [["ID", "Date", "Project", "Type", "Description", "Severity", "Action Taken"]],
    body: safetyIncidents.map((s) => [
      s.id,
      formatDate(s.date),
      s.project,
      s.type,
      s.description,
      s.severity,
      s.actionTaken,
    ]),
    headStyles: { fillColor: PRIMARY, fontSize: 9.5 },
    styles: { fontSize: 9.5, cellPadding: 3, overflow: "linebreak" },
    columnStyles: {
      4: { cellWidth: 38 },
      6: { cellWidth: 38 },
    },
    didParseCell(data) {
      if (data.section === "body" && data.column.index === 5) {
        const val = data.cell.raw;
        if (val === "High") data.cell.styles.textColor = [229, 57, 53];
        else if (val === "Medium") data.cell.styles.textColor = [245, 127, 23];
      }
    },
  });

  y = doc.lastAutoTable.finalY + 10;

  y = paragraph(doc, y, `Incident Analysis: The ${highCount > 0 ? "presence of High severity incidents demands immediate attention to safety protocols. Root cause analysis should be completed for all High severity incidents, and lessons learned should be shared across all project sites" : "absence of critical incidents reflects positively on the safety culture"}. Key focus areas include scaffolding safety, working at heights, electrical safety, and personal protective equipment compliance. Monthly safety audits should continue at all active sites to maintain awareness and prevent complacency.`);

  // ─── RESOURCE & WORKFORCE ANALYSIS ───
  doc.addPage();
  y = 22;
  y = sectionTitle(doc, y, "9. Resource & Workforce Analysis");

  y = paragraph(doc, y, `Effective resource management across the project portfolio is critical for timely delivery and cost optimization. This section analyzes the distribution of human resources across all active projects, task load balancing, and workforce utilization efficiency. ConPro's resource management approach emphasizes cross-functional team deployment, skills-based task assignment, and proactive capacity planning.`);

  const tasksByProject = {};
  tasks.forEach((t) => { tasksByProject[t.project] = (tasksByProject[t.project] || 0) + 1; });
  const assignees = {};
  tasks.forEach((t) => { assignees[t.assignee] = (assignees[t.assignee] || 0) + 1; });
  const uniqueAssignees = Object.keys(assignees);

  y = safeY(doc, y, 16);
  doc.setFontSize(13);
  doc.setTextColor(...DARK);
  doc.text("Task Distribution by Project", MARGIN, y);
  y += 6;

  autoTable(doc, {
    startY: y,
    head: [["Project", "Total Tasks", "Done", "In Progress", "To Do", "Completion %"]],
    body: projects.map((pr) => {
      const pt = tasks.filter((t) => t.project === pr.name);
      const d = pt.filter((t) => t.status === "Done").length;
      const ip = pt.filter((t) => t.status === "In Progress").length;
      const td = pt.filter((t) => t.status === "To Do").length;
      return [pr.name, pt.length, d, ip, td, pt.length ? `${((d / pt.length) * 100).toFixed(1)}%` : "—"];
    }),
    headStyles: { fillColor: PRIMARY, fontSize: 10 },
    styles: { fontSize: 10, cellPadding: 3 },
  });
  y = doc.lastAutoTable.finalY + 8;

  y = safeY(doc, y, 16);
  doc.setFontSize(13);
  doc.setTextColor(...DARK);
  doc.text("Workforce Task Load Summary", MARGIN, y);
  y += 6;

  autoTable(doc, {
    startY: y,
    head: [["Team Member", "Total Tasks", "Done", "In Progress", "To Do"]],
    body: uniqueAssignees.slice(0, 12).map((name) => {
      const pt = tasks.filter((t) => t.assignee === name);
      return [name, pt.length, pt.filter((t) => t.status === "Done").length, pt.filter((t) => t.status === "In Progress").length, pt.filter((t) => t.status === "To Do").length];
    }),
    headStyles: { fillColor: PRIMARY, fontSize: 10 },
    styles: { fontSize: 10, cellPadding: 3 },
  });
  y = doc.lastAutoTable.finalY + 8;

  y = paragraph(doc, y, `The workforce comprises ${uniqueAssignees.length} unique team members managing a total of ${tasks.length} tasks across ${projects.length} projects. ${delayedTasks.length > 0 ? `Resource rebalancing may be necessary to address the ${delayedTasks.length} overdue tasks. Consider temporarily reassigning personnel from projects with lighter workloads to support delayed activities.` : "The current task distribution appears balanced with no overdue items, indicating effective resource allocation."} Regular capacity planning reviews are recommended to anticipate upcoming workload peaks, especially as projects approach critical construction phases.`);

  // ─── QUALITY ASSURANCE ───
  doc.addPage();
  y = 22;
  y = sectionTitle(doc, y, "10. Quality Assurance");

  y = paragraph(doc, y, `Quality assurance across the ConPro portfolio ensures that all construction activities meet specified standards, contractual requirements, and applicable building codes. This section outlines the quality management framework, inspection protocols, and material testing procedures implemented across all active projects.`);

  y = paragraph(doc, y, `ConPro's Quality Management System (QMS) encompasses the following key components:\n\n• Material Testing Protocol: All construction materials (cement, steel, aggregates, concrete) undergo laboratory testing at NABL-accredited facilities. Material compliance certificates are archived in the project document register and made available during audits.\n\n• In-Process Inspections: Qualified engineers conduct inspections at critical construction stages including foundation works, structural framing, MEP rough-in, waterproofing, and finishing. Each inspection is documented with photographs and signed-off inspection reports.\n\n• Concrete Quality Control: Concrete cube specimens are collected per IS 456 specifications and tested at 7-day and 28-day intervals. Any batch failing to meet the required characteristic strength triggers an investigation and potential remedial action.\n\n• Non-Conformance Management: A formal Non-Conformance Report (NCR) system tracks all quality deviations. Each NCR includes root cause analysis, corrective action plan, and verification of closure. Open NCRs are reviewed weekly at project coordination meetings.`);

  const qcItems = [
    ["Material Testing", `${projects.length * 8}+ tests`, "Ongoing", "Compliant"],
    ["Structural Inspections", `${projects.length * 4} inspections`, "On Schedule", "Satisfactory"],
    ["Concrete Cube Tests", `${projects.length * 6}+ cubes`, "Ongoing", "Within Spec"],
    ["Welding Inspections", `${projects.length * 3} checks`, "Completed", "Passed"],
    ["MEP Verification", `${projects.length * 2} systems`, "In Progress", "On Track"],
    ["Documentation Audit", "Quarterly", "Scheduled", "Pending"],
  ];
  autoTable(doc, {
    startY: y,
    head: [["Quality Activity", "Volume", "Frequency", "Status"]],
    body: qcItems,
    headStyles: { fillColor: PRIMARY, fontSize: 10 },
    styles: { fontSize: 10, cellPadding: 3.5 },
  });
  y = doc.lastAutoTable.finalY + 8;

  y = paragraph(doc, y, `Quality performance across the portfolio is satisfactory. All material test results to date have met or exceeded specified requirements. The QMS audit scheduled for the next quarter will provide a comprehensive assessment of quality system effectiveness and identify areas for continuous improvement.`);

  // ─── ENVIRONMENTAL & COMPLIANCE ───
  doc.addPage();
  y = 22;
  y = sectionTitle(doc, y, "11. Environmental & Compliance");

  y = paragraph(doc, y, `Environmental stewardship and regulatory compliance are integral components of ConPro's project delivery framework. All projects operate under approved Environmental Management Plans (EMPs) that address air quality, noise, waste management, water conservation, and ecological impact. This section summarizes the compliance status across the portfolio and highlights sustainability initiatives.`);

  y = paragraph(doc, y, `Key Environmental Management Measures:\n\n• Air Quality: Dust suppression systems (water sprinklers, mist cannons) are deployed at all active excavation and concrete work areas. Weekly ambient air quality monitoring ensures compliance with NAAQS limits for PM10 and PM2.5.\n\n• Noise Control: Construction activities exceeding 85 dB are restricted to approved daytime hours. Acoustic barriers are erected near sensitive receptors. Monthly noise monitoring reports are submitted to local authorities.\n\n• Waste Management: Construction and demolition waste is segregated at source into recyclable, reusable, and disposable categories. Hazardous waste including paints, solvents, and oils is handled by licensed disposal contractors with proper manifest tracking.\n\n• Water Conservation: Dewatering discharge passes through settlement tanks. Curing water is recycled where feasible. Groundwater monitoring wells are sampled monthly to detect any contamination.\n\n• Ecological Protection: Tree preservation orders are respected at all sites. Transplantation plans have been prepared and implemented where vegetation removal was unavoidable. Post-construction landscaping includes native species restoration.`);

  y = safeY(doc, y, 16);
  doc.setFontSize(13);
  doc.setTextColor(...DARK);
  doc.text("Regulatory Compliance Summary", MARGIN, y);
  y += 6;

  const regItems = projects.map((pr) => [pr.name, "Building Permit: Approved", "Environmental Clearance: Valid", pr.status === "In Progress" ? "Active" : pr.status]);
  autoTable(doc, {
    startY: y,
    head: [["Project", "Key Permits", "Environmental Status", "Project Status"]],
    body: regItems,
    headStyles: { fillColor: PRIMARY, fontSize: 10 },
    styles: { fontSize: 10, cellPadding: 3 },
  });
  y = doc.lastAutoTable.finalY + 8;

  y = paragraph(doc, y, `All projects in the ConPro portfolio maintain valid building permits and environmental clearances. Quarterly compliance audits are scheduled to verify continued adherence to regulatory requirements. The sustainability team continues to explore opportunities for green building certification (LEED/GRIHA equivalent) for applicable projects, incorporating energy-efficient systems, renewable energy provisions, and water conservation technologies.`);

  // ─── RECOMMENDATIONS ───
  doc.addPage();
  y = 22;
  y = sectionTitle(doc, y, "12. Recommendations & Next Steps");

  const recommendations = `Based on the comprehensive analysis presented in this report, the following actions are recommended for the ConPro project portfolio:`;
  y = paragraph(doc, y, recommendations);

  const recoItems = [
    `Schedule Recovery: Projects behind schedule (${behindSchedule.map((pp) => pp.project).join(", ")}) should undergo schedule recovery workshops with project managers to identify critical path activities, resource bottlenecks, and opportunities for parallel task execution. Weekly progress tracking should be intensified for these projects until the variance is eliminated.`,
    `Budget Monitoring: Continue close monitoring of budget utilization across all projects. Projects approaching 80% utilization should trigger formal budget review meetings with cost estimators and project leads. Value engineering workshops should be conducted to identify cost optimization opportunities without compromising quality.`,
    `Risk Mitigation: The ${critHigh} Critical/High risks require weekly status reviews. Risk owners should provide updated mitigation progress at the next project steering committee meeting. A portfolio-wide risk workshop is recommended to identify cross-project risk interdependencies and develop consolidated mitigation strategies.`,
    `Delayed Task Resolution: All ${delayedTasks.length} overdue tasks should be escalated to respective project managers with formal recovery plans. Tasks exceeding 10 days should be reviewed for resource reallocation, scope adjustment, or timeline revision. Root cause analysis should be conducted for recurring delays.`,
    `Safety Compliance: Reinforce site safety protocols, particularly regarding scaffolding inspections, PPE enforcement, working at heights procedures, and hot work permits. Conduct refresher training sessions at all sites within the next two weeks. Implement a safety recognition program to reward teams maintaining zero-incident records.`,
    `Stakeholder Communication: Schedule client progress meetings for all active projects to maintain transparency and manage expectations regarding timeline or budget adjustments. Monthly progress reports should be shared with all key stakeholders including funding agencies and regulatory bodies.`,
    `Quality Enhancement: Strengthen the quality inspection regime with additional random sampling and third-party verification for critical structural elements. Ensure all material test certificates are current and properly filed in the document management system.`,
    `Resource Optimization: Conduct a portfolio-wide resource utilization review to identify underutilized personnel and opportunities for cross-project deployment. Develop a skills matrix for all team members to facilitate efficient task assignment.`,
    `Environmental Compliance: Ensure all environmental monitoring reports are submitted on schedule to regulatory authorities. Plan for the next quarterly environmental audit and address any open non-conformances from previous audits.`,
    `Documentation: Maintain comprehensive and up-to-date project records across all projects. Conduct a document completeness audit to identify any gaps in required documentation including as-built drawings, variation orders, and inspection reports.`,
  ];

  recoItems.forEach((r, i) => {
    y = safeY(doc, y, 20);
    y = paragraph(doc, y, `${i + 1}. ${r}`);
  });

  // ─── CONCLUSION & SIGN-OFF ───
  doc.addPage();
  y = 22;
  y = sectionTitle(doc, y, "13. Conclusion & Sign-off");

  y = paragraph(doc, y, `This Comprehensive Project Report has provided a thorough assessment of the ConPro project portfolio covering ${projects.length} active construction projects across Nepal. The report has examined all critical dimensions of project performance including progress tracking, financial management, risk assessment, safety compliance, quality assurance, environmental management, and regulatory adherence.`);

  y = paragraph(doc, y, `Portfolio Performance Summary: The average project completion stands at ${avgProgress}%, with ${inProgressProjects} projects actively under construction. The total portfolio budget of ${fmtNPR(totalBudget)} has seen ${fmtNPR(totalSpent)} in expenditure (${((totalSpent / totalAllocated) * 100).toFixed(1)}% utilization), leaving ${fmtNPR(totalAllocated - totalSpent)} in reserves. ${behindSchedule.length > 0 ? `${behindSchedule.length} project(s) are behind schedule and require focused recovery efforts.` : "All projects are on or ahead of schedule."}`);

  y = paragraph(doc, y, `Risk & Safety Profile: The portfolio carries ${riskTotal} identified risks with ${critHigh} classified as Critical or High severity. ${safetyIncidents.length} safety incidents have been recorded, all of which have been investigated with corrective actions implemented. Continued vigilance and proactive safety management remain essential across all project sites.`);

  y = paragraph(doc, y, `ConPro remains committed to delivering all projects to the highest standards of quality, safety, and client satisfaction. The management team will continue to monitor portfolio performance through regular reporting cycles and take proactive measures to address emerging challenges. The next comprehensive report is scheduled for ${new Date(Date.now() + 30 * 86400000).toLocaleDateString("en-NP", { year: "numeric", month: "long" })}.`);

  y += 12;
  y = safeY(doc, y, 16);
  doc.setFontSize(13);
  doc.setTextColor(...DARK);
  doc.text("Report Authorization", MARGIN, y);
  y += 8;

  y = safeY(doc, y, 90);
  [["Prepared By", "Portfolio Coordinator"], ["Reviewed By", "Senior Project Manager"], ["Approved By", "Director of Operations"]].forEach(([label, role]) => {
    doc.setFontSize(11);
    doc.setTextColor(...DARK);
    doc.text(label + ":", MARGIN, y);
    doc.setTextColor(...MUTED);
    doc.text(role, MARGIN + 50, y);
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, y + 14, MARGIN + 70, y + 14);
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text("Signature / Date", MARGIN, y + 19);
    y += 30;
  });

  y += 8;
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  doc.text("— End of Report —", W / 2, y, { align: "center" });

  addPageFooter(doc);
  doc.save(`ConPro_Full_Project_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
}
