const W = 700, H = 380, PL = 80, PR = 20, PT = 20, PB = 50;
const CW = W - PL - PR, CH = H - PT - PB;

function fmtCr(n) {
  if (n >= 10000000) return (n / 10000000).toFixed(1) + " Cr";
  if (n >= 100000) return (n / 100000).toFixed(1) + " L";
  return (n / 1000).toFixed(0) + " K";
}

function buildPath(data, key, maxVal) {
  const pts = data.filter((d) => d[key] > 0);
  if (pts.length === 0) return "";
  return pts
    .map((d, i) => {
      const x = PL + (data.indexOf(d) / (data.length - 1)) * CW;
      const y = PT + CH - (d[key] / maxVal) * CH;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export default function EVMChart({ data, BAC }) {
  const maxVal = BAC * 1.1;
  const ySteps = 5;

  const todayIdx = data.findIndex((d) => d.EV === 0) - 1;
  const todayX = todayIdx >= 0 ? PL + (todayIdx / (data.length - 1)) * CW : null;

  return (
    <div style={{ overflowX: "auto" }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W, height: "auto", fontFamily: "inherit" }}>
        {/* Grid */}
        {Array.from({ length: ySteps + 1 }, (_, i) => {
          const val = (maxVal / ySteps) * i;
          const y = PT + CH - (val / maxVal) * CH;
          return (
            <g key={i}>
              <line x1={PL} y1={y} x2={PL + CW} y2={y} stroke="#e0e0e0" strokeWidth={0.5} />
              <text x={PL - 8} y={y + 4} textAnchor="end" fontSize={9} fill="#888">{fmtCr(val)}</text>
            </g>
          );
        })}

        {/* BAC line */}
        <line
          x1={PL} y1={PT + CH - (BAC / maxVal) * CH}
          x2={PL + CW} y2={PT + CH - (BAC / maxVal) * CH}
          stroke="#9c27b0" strokeWidth={1} strokeDasharray="8 4" opacity={0.6}
        />
        <text x={PL + CW + 2} y={PT + CH - (BAC / maxVal) * CH + 4} fontSize={8} fill="#9c27b0">BAC</text>

        {/* X-axis labels */}
        {data.map((d, i) => {
          const x = PL + (i / (data.length - 1)) * CW;
          const show = data.length <= 12 || i % 2 === 0 || i === data.length - 1;
          return show ? (
            <text key={i} x={x} y={H - PB + 18} textAnchor="middle" fontSize={9} fill="#888">{d.month}</text>
          ) : null;
        })}

        {/* PV line (Planned Value) */}
        <path d={buildPath(data, "PV", maxVal)} fill="none" stroke="#2e7d32" strokeWidth={2.5} strokeDasharray="6 3" />

        {/* EV line (Earned Value) */}
        <path d={buildPath(data, "EV", maxVal)} fill="none" stroke="#1565c0" strokeWidth={2.5} />

        {/* AC line (Actual Cost) */}
        <path d={buildPath(data, "AC", maxVal)} fill="none" stroke="#e53935" strokeWidth={2.5} />

        {/* Data points for lines with actual data */}
        {data.filter((d) => d.EV > 0).map((d) => {
          const i = data.indexOf(d);
          const x = PL + (i / (data.length - 1)) * CW;
          return (
            <g key={`p-${i}`}>
              <circle cx={x} cy={PT + CH - (d.PV / maxVal) * CH} r={3} fill="#2e7d32" />
              <circle cx={x} cy={PT + CH - (d.EV / maxVal) * CH} r={3} fill="#1565c0" />
              <circle cx={x} cy={PT + CH - (d.AC / maxVal) * CH} r={3} fill="#e53935" />
            </g>
          );
        })}

        {/* Today line */}
        {todayX && (
          <g>
            <line x1={todayX} y1={PT} x2={todayX} y2={PT + CH} stroke="#ff9800" strokeWidth={1.5} strokeDasharray="4 2" />
            <text x={todayX} y={PT - 5} textAnchor="middle" fontSize={9} fill="#ff9800" fontWeight={600}>Data Date</text>
          </g>
        )}

        {/* CV and SV annotations at current point */}
        {todayIdx >= 0 && data[todayIdx] && (() => {
          const d = data[todayIdx];
          const x = PL + (todayIdx / (data.length - 1)) * CW;
          const yEV = PT + CH - (d.EV / maxVal) * CH;
          const yPV = PT + CH - (d.PV / maxVal) * CH;
          const yAC = PT + CH - (d.AC / maxVal) * CH;
          return (
            <g>
              {/* SV arrow */}
              <line x1={x + 8} y1={yEV} x2={x + 8} y2={yPV} stroke="#1565c0" strokeWidth={1.5} markerEnd="url(#arrow-blue)" />
              <text x={x + 14} y={(yEV + yPV) / 2 + 3} fontSize={8} fill="#1565c0" fontWeight={600}>SV</text>
              {/* CV arrow */}
              <line x1={x - 8} y1={yEV} x2={x - 8} y2={yAC} stroke="#e53935" strokeWidth={1.5} />
              <text x={x - 22} y={(yEV + yAC) / 2 + 3} fontSize={8} fill="#e53935" fontWeight={600}>CV</text>
            </g>
          );
        })()}

        {/* Axes */}
        <line x1={PL} y1={PT} x2={PL} y2={PT + CH} stroke="#bbb" strokeWidth={1} />
        <line x1={PL} y1={PT + CH} x2={PL + CW} y2={PT + CH} stroke="#bbb" strokeWidth={1} />

        {/* Labels */}
        <text x={PL + CW / 2} y={H - 4} textAnchor="middle" fontSize={11} fill="#555" fontWeight={600}>Timeline (Months)</text>
        <text x={16} y={PT + CH / 2} textAnchor="middle" fontSize={11} fill="#555" fontWeight={600} transform={`rotate(-90, 16, ${PT + CH / 2})`}>Cost (NPR)</text>
      </svg>

      <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap", marginTop: 8, fontSize: "0.82rem" }}>
        <span><span style={{ display: "inline-block", width: 24, height: 0, borderTop: "2.5px dashed #2e7d32", verticalAlign: "middle", marginRight: 6 }} /> PV (Planned Value)</span>
        <span><span style={{ display: "inline-block", width: 24, height: 3, background: "#1565c0", verticalAlign: "middle", marginRight: 6 }} /> EV (Earned Value)</span>
        <span><span style={{ display: "inline-block", width: 24, height: 3, background: "#e53935", verticalAlign: "middle", marginRight: 6 }} /> AC (Actual Cost)</span>
        <span><span style={{ display: "inline-block", width: 24, height: 0, borderTop: "1.5px dashed #9c27b0", verticalAlign: "middle", marginRight: 6 }} /> BAC</span>
      </div>
    </div>
  );
}
