const PROB_MAP = { rare: 1, unlikely: 2, possible: 3, likely: 4, certain: 5 };
const IMPACT_MAP = { negligible: 1, minor: 2, moderate: 3, major: 4, catastrophic: 5 };

function calcRiskScore(probability, impact) {
  return (PROB_MAP[probability] || 3) * (IMPACT_MAP[impact] || 3);
}

module.exports = { calcRiskScore };
