import { formatBS } from "./nepaliDate";

export function formatDate(iso, dateFormat = "YYYY-MM-DD", options = {}) {
  if (!iso) return "\u2014";

  const { showYear = true } = options;

  if (dateFormat === "BS (बि.सं. YYYY-MM-DD)") {
    return formatBS(iso, { useNepaliMonth: false, showYear });
  }

  const d = new Date(iso);

  if (dateFormat === "DD/MM/YYYY") {
    if (showYear) {
      return d.toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" });
    }
    return d.toLocaleDateString("en-GB", { month: "short", day: "numeric" });
  }

  if (dateFormat === "MM/DD/YYYY") {
    if (showYear) {
      return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    }
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  // Default: YYYY-MM-DD style
  if (showYear) {
    return d.toLocaleDateString("en-NP", { year: "numeric", month: "short", day: "numeric" });
  }
  return d.toLocaleDateString("en-NP", { month: "short", day: "numeric" });
}
