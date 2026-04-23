function SummaryCard({ icon, color, value, label }) {
  return (
    <div className="summary-card">
      <div className={`summary-icon ${color || "green"}`}>
        <span>{icon}</span>
      </div>
      <div>
        <div className="summary-value">{value}</div>
        <div className="summary-label">{label}</div>
      </div>
    </div>
  );
}

export default SummaryCard;
