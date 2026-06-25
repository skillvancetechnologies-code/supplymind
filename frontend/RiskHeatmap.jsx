import { useState } from "react";
function RiskHeatmap({ suppliers }) {
  const getRiskLevel = (score) => {
    if (score >= 85) return "Critical";
    if (score >= 70) return "High";
    if (score >= 40) return "Medium";
    return "Low";
  };
const [selectedCell, setSelectedCell] = useState(null);
  const categories = [...new Set(suppliers.map((s) => s.category || "General"))];

  const riskLevels = ["Low", "Medium", "High", "Critical"];

  const getCount = (category, riskLevel) => {
    return suppliers.filter(
      (s) =>
        (s.category || "General") === category &&
        getRiskLevel(s.risk_score) === riskLevel
    ).length;
  };

  const getIntensity = (count) => {
    if (count === 0) return "#F8FAFC";
    if (count <= 3) return "#DBEAFE";
    if (count <= 8) return "#60A5FA";
    if (count <= 15) return "#2563EB";
    return "#1E3A8A";
  };

  return (
    <div
      style={{
        background: "white",
        padding: "20px",
        borderRadius: "16px",
        marginTop: "24px",
        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
      }}
    >
      <h3>Supplier Risk Heatmap</h3>
      <p style={{ color: "#64748b" }}>
        Rows: Supplier categories, Columns: Risk levels, Color intensity: Supplier count
      </p>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "16px",
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  textAlign: "left",
                  padding: "12px",
                  background: "#0F172A",
                  color: "white",
                }}
              >
                Category
              </th>

              {riskLevels.map((risk) => (
                <th
                  key={risk}
                  style={{
                    padding: "12px",
                    background: "#0F172A",
                    color: "white",
                  }}
                >
                  {risk}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {categories.map((category) => (
              <tr key={category}>
                <td
                  style={{
                    padding: "12px",
                    fontWeight: "bold",
                    border: "1px solid #E2E8F0",
                  }}
                >
                  {category}
                </td>

                {riskLevels.map((risk) => {
                  const count = getCount(category, risk);

                  return (
<td
  key={risk}
  title={`${category} - ${risk}: ${count} suppliers`}
  onClick={() =>
    setSelectedCell({
      category,
      riskLevel: risk,
      count,
    })
  }
  style={{
    padding: "18px",
    textAlign: "center",
    color: count > 8 ? "white" : "#0F172A",
    background: getIntensity(count),
    border: "1px solid #E2E8F0",
    fontWeight: "bold",
    cursor: "pointer",
  }}
>
  {count}
</td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selectedCell && (
  <div
    style={{
      marginTop: "20px",
      padding: "15px",
      border: "1px solid #E2E8F0",
      borderRadius: "10px",
      background: "#F8FAFC",
    }}
  >
    <h4>Selected Risk Segment</h4>

    <p>
      <b>Category:</b> {selectedCell.category}
    </p>

    <p>
      <b>Risk Level:</b> {selectedCell.riskLevel}
    </p>

    <p>
      <b>Supplier Count:</b> {selectedCell.count}
    </p>
  </div>
)}
    </div>
  );
}

export default RiskHeatmap;