// Bikram Sambat (BS) calendar data and conversion from Gregorian (AD)
// Each entry: [total days in year, days in each month (Baisakh..Chaitra)]
const BS_CALENDAR = {
  2070: [365, 31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2071: [365, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2072: [366, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2073: [365, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2074: [365, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2075: [366, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2076: [365, 31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2077: [365, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2078: [366, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2079: [365, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2080: [366, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2081: [365, 31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2082: [365, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2083: [366, 32, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2084: [365, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2085: [366, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2086: [365, 31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2087: [365, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2088: [366, 31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2089: [365, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2090: [365, 31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
};

// Reference point: BS 2070-01-01 = AD 2013-04-14
const REF_BS = { year: 2070, month: 1, day: 1 };
const REF_AD = new Date(2013, 3, 14); // April 14, 2013

const BS_MONTHS_NP = [
  "बैशाख", "जेठ", "असार", "श्रावण", "भदौ", "असोज",
  "कार्तिक", "मंसिर", "पौष", "माघ", "फाल्गुन", "चैत्र",
];

const BS_MONTHS_EN = [
  "Baisakh", "Jestha", "Ashar", "Shrawan", "Bhadra", "Ashoj",
  "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra",
];

function diffDays(date1, date2) {
  const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
}

export function toBS(adDate) {
  const ad = typeof adDate === "string" ? new Date(adDate) : adDate;
  let totalDays = diffDays(REF_AD, ad);

  if (totalDays < 0) return null;

  let bsYear = REF_BS.year;
  let bsMonth = REF_BS.month;
  let bsDay = REF_BS.day;

  while (totalDays > 0) {
    const cal = BS_CALENDAR[bsYear];
    if (!cal) return null;

    const daysInMonth = cal[bsMonth];
    const daysLeftInMonth = daysInMonth - bsDay;

    if (totalDays <= daysLeftInMonth) {
      bsDay += totalDays;
      totalDays = 0;
    } else {
      totalDays -= (daysLeftInMonth + 1);
      bsMonth++;
      bsDay = 1;
      if (bsMonth > 12) {
        bsMonth = 1;
        bsYear++;
      }
    }
  }

  return { year: bsYear, month: bsMonth, day: bsDay };
}

export function fromBS(bsYear, bsMonth, bsDay) {
  let totalDays = 0;
  for (let y = REF_BS.year; y < bsYear; y++) {
    const cal = BS_CALENDAR[y];
    if (!cal) return null;
    totalDays += cal[0];
  }
  const cal = BS_CALENDAR[bsYear];
  if (!cal) return null;
  for (let m = 1; m < bsMonth; m++) {
    totalDays += cal[m];
  }
  totalDays += bsDay - 1;
  const result = new Date(REF_AD);
  result.setDate(result.getDate() + totalDays);
  const pad = (n) => String(n).padStart(2, "0");
  return `${result.getFullYear()}-${pad(result.getMonth() + 1)}-${pad(result.getDate())}`;
}

export function getDaysInBSMonth(bsYear, bsMonth) {
  const cal = BS_CALENDAR[bsYear];
  if (!cal) return 30;
  return cal[bsMonth];
}

export function getBSYears() {
  return Object.keys(BS_CALENDAR).map(Number);
}

export { BS_MONTHS_EN, BS_MONTHS_NP };

export function formatBS(adDate, options = {}) {
  const bs = toBS(adDate);
  if (!bs) {
    const d = typeof adDate === "string" ? new Date(adDate) : adDate;
    return d.toLocaleDateString("en-NP", { year: "numeric", month: "short", day: "numeric" });
  }

  const { useNepaliMonth = false, showYear = true } = options;
  const monthName = useNepaliMonth ? BS_MONTHS_NP[bs.month - 1] : BS_MONTHS_EN[bs.month - 1];
  const pad = (n) => String(n).padStart(2, "0");

  if (showYear) {
    return `${bs.year} ${monthName} ${pad(bs.day)}`;
  }
  return `${monthName} ${pad(bs.day)}`;
}
