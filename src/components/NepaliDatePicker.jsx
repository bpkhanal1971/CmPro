import { useState, useEffect, useRef } from "react";
import { useSettings } from "../context/SettingsContext";
import { toBS, fromBS, getDaysInBSMonth, getBSYears, BS_MONTHS_EN } from "../utils/nepaliDate";
import "../styles/nepali-datepicker.css";

export default function NepaliDatePicker({ id, name, value, onChange, placeholder }) {
  const { settings } = useSettings();
  const isBS = settings.dateFormat === "BS (बि.सं. YYYY-MM-DD)";

  if (!isBS) {
    return (
      <input
        id={id}
        name={name}
        type="date"
        value={value}
        onChange={onChange}
      />
    );
  }

  const bs = value ? toBS(value) : null;
  const [bsYear, setBsYear] = useState(bs?.year || 2083);
  const [bsMonth, setBsMonth] = useState(bs?.month || 1);
  const [bsDay, setBsDay] = useState(bs?.day || 1);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (value) {
      const converted = toBS(value);
      if (converted) {
        setBsYear(converted.year);
        setBsMonth(converted.month);
        setBsDay(converted.day);
      }
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const daysInMonth = getDaysInBSMonth(bsYear, bsMonth);
  const years = getBSYears();

  function handleSelect(year, month, day) {
    const adDate = fromBS(year, month, day);
    if (adDate) {
      onChange({ target: { name, value: adDate } });
    }
    setOpen(false);
  }

  function handleYearChange(newYear) {
    setBsYear(newYear);
    const maxDay = getDaysInBSMonth(newYear, bsMonth);
    if (bsDay > maxDay) setBsDay(maxDay);
  }

  function handleMonthChange(newMonth) {
    setBsMonth(newMonth);
    const maxDay = getDaysInBSMonth(bsYear, newMonth);
    if (bsDay > maxDay) setBsDay(maxDay);
  }

  function prevMonth() {
    if (bsMonth === 1) {
      if (bsYear > years[0]) { setBsYear(bsYear - 1); setBsMonth(12); }
    } else {
      setBsMonth(bsMonth - 1);
    }
  }

  function nextMonth() {
    if (bsMonth === 12) {
      if (bsYear < years[years.length - 1]) { setBsYear(bsYear + 1); setBsMonth(1); }
    } else {
      setBsMonth(bsMonth + 1);
    }
  }

  const pad = (n) => String(n).padStart(2, "0");
  const displayText = value && bs
    ? `${bs.year} ${BS_MONTHS_EN[bs.month - 1]} ${pad(bs.day)}`
    : "";

  const days = [];
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const selectedDay = bs && bs.year === bsYear && bs.month === bsMonth ? bs.day : null;

  return (
    <div className="npdp-wrap" ref={ref}>
      <div className="npdp-input" onClick={() => setOpen(!open)}>
        <span className={displayText ? "" : "npdp-placeholder"}>
          {displayText || placeholder || "Select date (BS)"}
        </span>
        <span className="npdp-cal-icon">&#128197;</span>
      </div>

      {open && (
        <div className="npdp-dropdown">
          <div className="npdp-header">
            <button type="button" className="npdp-nav" onClick={prevMonth}>&lsaquo;</button>
            <select
              className="npdp-select"
              value={bsMonth}
              onChange={(e) => handleMonthChange(Number(e.target.value))}
            >
              {BS_MONTHS_EN.map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
            <select
              className="npdp-select"
              value={bsYear}
              onChange={(e) => handleYearChange(Number(e.target.value))}
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <button type="button" className="npdp-nav" onClick={nextMonth}>&rsaquo;</button>
          </div>

          <div className="npdp-grid">
            {days.map((d) => (
              <button
                key={d}
                type="button"
                className={`npdp-day${d === selectedDay ? " selected" : ""}`}
                onClick={() => handleSelect(bsYear, bsMonth, d)}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
