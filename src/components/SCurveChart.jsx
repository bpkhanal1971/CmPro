const W = 700, H = 360, PL = 55, PR = 20, PT = 20, PB = 50;
const CW = W - PL - PR, CH = H - PT - PB;

function buildPath(data, key) {
  const pts = data.filter((d) => d[key] > 0);
  if (pts.length === 0) return "";
  return pts
    .map((d, i) => {
      const x = PL + (data.indexOf(d) / (data.length - 1)) * CW;
      const y = PT + CH - (d[key] / 100) * CH;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function buildArea(data, key) {
  const pts = data.filter((d) => d[key] > 0);
  if (pts.length === 0) return "";
  const line = pts.map((d) => {
    const x = PL + (data.indexOf(d) / (data.length - 1)) * CW;
    const y = PT + CH - (d[key] / 100) * CH;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const lastX = PL + (data.indexOf(pts[pts.length - 1]) / (data.length - 1)) * CW;
  const firstX = PL + (data.indexOf(pts[0]) / (data.length - 1)) * CW;
  const baseY = PT + CH;
  return `M${line[0]} L${line.join(" L")} L${lastX},${baseY} L${firstX},${baseY} Z`;
}

export default function SCurveChart({ data, projectName }) {
  const yTicks = [0, 20, 40, 60, 80, 100];
  const todayIdx = data.findIndex((d) => d.actualPct === 0) - 1;
  const todayX = todayIdx >= 0
    ? PL + (todayIdx / (data.length - 1)) * CW
    : null;

  return (
    <div style={{ overflowX: "auto" }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W, height: "auto", fontFamily: "inherit" }}>
        {/* Grid */}
        {yTicks.map((v) => {
          const y = PT + CH - (v / 100) * CH;
          return (
            <g key={v}>
              <line x1={PL} y1={y} x2={PL + CW} y2={y} stroke="#e0e0e0" strokeWidth={0.5} />
              <text x={PL - 8} y={y + 4} textAnchor="end" fontSize={10} fill="#888">{v}%</text>
            </g>
          );
        })}

        {/* X-axis labels */}
        {data.map((d, i) => {
          const x = PL + (i / (data.length - 1)) * CW;
          const show = data.length <= 12 || i % 2 === 0 || i === data.length - 1;
          return show ? (
            <text key={i} x={x} y={H - PB + 18} textAnchor="middle" fontSize={9} fill="#888">{d.month}</text>
          ) : null;
        })}

        {/* Area fills */}
        <path d={buildArea(data, "plannedPct")} fill="#a5d6a7" opacity={0.25} />
        <path d={buildArea(data, "actualPct")} fill="#1565c0" opacity={0.15} />

        {/* Lines */}
        <path d={buildPath(data, "plannedPct")} fill="none" stroke="#2e7d32" strokeWidth={2.5} strokeDasharray="6 3" />
        <path d={buildPath(data, "actualPct")} fill="none" stroke="#1565c0" strokeWidth={2.5} />

        {/* Data points */}
        {data.filter((d) => d.actualPct > 0).map((d) => {
          const i = data.indexOf(d);
          const x = PL + (i / (data.length - 1)) * CW;
          return (
            <g key={`a-${i}`}>
              <circle cx={x} cy={PT + CH - (d.actualPct / 100) * CH} r={3.5} fill="#1565c0" />
              <circle cx={x} cy={PT + CH - (d.plannedPct / 100) * CH} r={3.5} fill="#2e7d32" />
            </g>
          );
        })}

        {/* Today line */}
        {todayX && (
          <g>
            <line x1={todayX} y1={PT} x2={todayX} y2={PT + CH} stroke="#e53935" strokeWidth={1.5} strokeDasharray="4 2" />
            <text x={todayX} y={PT - 5} textAnchor="middle" fontSize={9} fill="#e53935" fontWeight={600}>Today</text>
          </g>
        )}

        {/* Axes */}
        <line x1={PL} y1={PT} x2={PL} y2={PT + CH} stroke="#bbb" strokeWidth={1} />
        <line x1={PL} y1={PT + CH} x2={PL + CW} y2={PT + CH} stroke="#bbb" strokeWidth={1} />

        {/* Labels */}
        <text x={PL + CW / 2} y={H - 4} textAnchor="middle" fontSize={11} fill="#555" fontWeight={600}>Timeline (Months)</text>
        <text x={12} y={PT + CH / 2} textAnchor="middle" fontSize={11} fill="#555" fontWeight={600} transform={`rotate(-90, 12, ${PT + CH / 2})`}>Progress (%)</text>
      </svg>

      <div style={{ display: "flex", gap: 20, justifyContent: "center", marginTop: 8, fontSize: "0.82rem" }}>
        <span><span style={{ display: "inline-block", width: 24, height: 3, background: "#2e7d32", verticalAlign: "middle", marginRight: 6, borderTop: "2px dashed #2e7d32" }} /> Planned (Baseline)</span>
        <span><span style={{ display: "inline-block", width: 24, height: 3, background: "#1565c0", verticalAlign: "middle", marginRight: 6 }} /> Actual Progress</span>
        <span><span style={{ display: "inline-block", width: 16, height: 0, borderTop: "2px dashed #e53935", verticalAlign: "middle", marginRight: 6 }} /> Current Date</span>
      </div>
    </div>
  );
}
