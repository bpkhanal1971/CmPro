import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const PRIMARY = [46, 125, 50];
const TODAY = new Date().toLocaleDateString("en-NP", { year: "numeric", month: "long", day: "numeric" });

const M = 20;

function addHeader(doc, title) {
  const pw = doc.internal.pageSize.getWidth();
  doc.setFontSize(20);
  doc.setTextColor(...PRIMARY);
  doc.text("ConPro", M, 20);
  doc.setFontSize(11);
  doc.setTextColor(120, 120, 120);
  doc.text("Construction Project Management", M, 27);
  doc.setDrawColor(...PRIMARY);
  doc.setLineWidth(0.6);
  doc.line(M, 30, pw - M, 30);
  doc.setFontSize(16);
  doc.setTextColor(30, 30, 30);
  doc.text(title, M, 40);
  doc.setFontSize(10);
  doc.setTextColor(140, 140, 140);
  doc.text(`Generated: ${TODAY}`, pw - M, 40, { align: "right" });
  return 48;
}

function fmtNPR(n) {
  return "Rs " + Number(n).toLocaleString("en-IN");
}

export function exportPDF(activeTab, { progress, budget, risks, delayedTasks, safetyIncidents, monthlyCompletion, formatDate }) {
  const doc = new jsPDF({ format: "letter" });
  const startY = addHeader(doc, `Report — ${activeTab}`);

  if (activeTab === "Progress") {
    autoTable(doc, {
      startY,
      head: [["Project", "Planned %", "Actual %", "Variance", "Status"]],
      body: progress.map((p) => [
        p.project,
        `${p.planned}%`,
        `${p.actual}%`,
        `${p.actual - p.planned >= 0 ? "+" : ""}${p.actual - p.planned}%`,
        p.status,
      ]),
      headStyles: { fillColor: PRIMARY, fontSize: 12 },
      styles: { fontSize: 12, cellPadding: 3.5 },
    });

    const y = doc.lastAutoTable.finalY + 14;
    doc.setFontSize(13);
    doc.setTextColor(30, 30, 30);
    doc.text("Monthly Task Completion", M, y);
    autoTable(doc, {
      startY: y + 5,
      head: [["Month", "Planned", "Actual"]],
      body: monthlyCompletion.map((d) => [d.month, `${d.planned}%`, `${d.actual}%`]),
      headStyles: { fillColor: PRIMARY, fontSize: 12 },
      styles: { fontSize: 12, cellPadding: 3.5 },
    });
  }

  if (activeTab === "Budget") {
    const totalAllocated = budget.reduce((s, b) => s + b.allocated, 0);
    const totalSpent = budget.reduce((s, b) => s + b.spent, 0);

    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    doc.text(`Total Allocated: ${fmtNPR(totalAllocated)}    |    Total Spent: ${fmtNPR(totalSpent)}    |    Remaining: ${fmtNPR(totalAllocated - totalSpent)}`, M, startY);

    autoTable(doc, {
      startY: startY + 10,
      head: [["Project", "Allocated", "Spent", "Remaining", "Usage %"]],
      body: budget.map((b) => [
        b.project,
        fmtNPR(b.allocated),
        fmtNPR(b.spent),
        fmtNPR(b.allocated - b.spent),
        `${((b.spent / b.allocated) * 100).toFixed(1)}%`,
      ]),
      headStyles: { fillColor: PRIMARY, fontSize: 12 },
      styles: { fontSize: 12, cellPadding: 3.5 },
    });
  }

  if (activeTab === "Risks") {
    const riskTotal = risks.reduce((s, r) => s + r.count, 0);
    autoTable(doc, {
      startY,
      head: [["Risk Level", "Count", "Percentage"]],
      body: risks.map((r) => [r.level, r.count, `${((r.count / riskTotal) * 100).toFixed(1)}%`]),
      headStyles: { fillColor: PRIMARY, fontSize: 12 },
      styles: { fontSize: 12, cellPadding: 3.5 },
    });
  }

  if (activeTab === "Delayed Tasks") {
    autoTable(doc, {
      startY,
      head: [["Task", "Project", "Assigned To", "Due Date", "Days Late"]],
      body: delayedTasks.map((t) => [
        t.task,
        t.project,
        t.assignee,
        formatDate(t.due),
        `${t.daysLate} days`,
      ]),
      headStyles: { fillColor: PRIMARY, fontSize: 12 },
      styles: { fontSize: 12, cellPadding: 3.5 },
    });
  }

  if (activeTab === "Safety") {
    autoTable(doc, {
      startY,
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
      headStyles: { fillColor: PRIMARY, fontSize: 10 },
      styles: { fontSize: 10, cellPadding: 3, cellWidth: "wrap" },
      columnStyles: {
        4: { cellWidth: 42 },
        6: { cellWidth: 42 },
      },
    });
  }

  doc.save(`ConPro_${activeTab.replace(/\s+/g, "_")}_Report.pdf`);
}

export function exportExcel(activeTab, { progress, budget, risks, delayedTasks, safetyIncidents, monthlyCompletion, formatDate }) {
  const wb = XLSX.utils.book_new();

  if (activeTab === "Progress") {
    const data = progress.map((p) => ({
      Project: p.project,
      "Planned %": p.planned,
      "Actual %": p.actual,
      "Variance %": p.actual - p.planned,
      Status: p.status,
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), "Progress");
    const mc = monthlyCompletion.map((d) => ({ Month: d.month, Planned: d.planned, Actual: d.actual }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(mc), "Monthly Completion");
  }

  if (activeTab === "Budget") {
    const data = budget.map((b) => ({
      Project: b.project,
      Allocated: b.allocated,
      Spent: b.spent,
      Remaining: b.allocated - b.spent,
      "Usage %": +((b.spent / b.allocated) * 100).toFixed(1),
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), "Budget");
  }

  if (activeTab === "Risks") {
    const riskTotal = risks.reduce((s, r) => s + r.count, 0);
    const data = risks.map((r) => ({
      Level: r.level,
      Count: r.count,
      "Percentage %": +((r.count / riskTotal) * 100).toFixed(1),
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), "Risks");
  }

  if (activeTab === "Delayed Tasks") {
    const data = delayedTasks.map((t) => ({
      Task: t.task,
      Project: t.project,
      "Assigned To": t.assignee,
      "Due Date": formatDate(t.due),
      "Days Late": t.daysLate,
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), "Delayed Tasks");
  }

  if (activeTab === "Safety") {
    const data = safetyIncidents.map((s) => ({
      ID: s.id,
      Date: formatDate(s.date),
      Project: s.project,
      Type: s.type,
      Description: s.description,
      Severity: s.severity,
      "Action Taken": s.actionTaken,
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), "Safety Incidents");
  }

  XLSX.writeFile(wb, `ConPro_${activeTab.replace(/\s+/g, "_")}_Report.xlsx`);
}
