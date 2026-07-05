import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

function TrendSparklines({ suppliers }) {
  const getTrendColor = (trend = "") => {
    if (trend === "Improving") return "#16a34a";
    if (trend === "Declining") return "#dc2626";
    return "#94a3b8";
  };

  const getTrendLineData = (trend = "") => {
    if (trend === "Improving") {
      return [
        { point: "W1", value: 1 },
        { point: "W2", value: 2 },
        { point: "W3", value: 3 },
        { point: "W4", value: 4 },
      ];
    }

    if (trend === "Declining") {
      return [
        { point: "W1", value: 4 },
        { point: "W2", value: 3 },
        { point: "W3", value: 2 },
        { point: "W4", value: 1 },
      ];
    }

    return [
      { point: "W1", value: 2 },
      { point: "W2", value: 2 },
      { point: "W3", value: 2 },
      { point: "W4", value: 2 },
    ];
  };

  return (
    <div
      style={{
        background: "#0f172a",
        padding: "20px",
        borderRadius: "16px",
        marginTop: "24px",
        border: "1px solid rgba(148,163,184,.18)",
      }}
    >
      <h3 style={{ color: "#f8fafc", marginTop: 0 }}>
        Supplier Trend Sparklines
      </h3>

      <p style={{ color: "#94a3b8" }}>
        Lines are rendered from the backend-provided trend direction.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
          gap: "16px",
        }}
      >
       {(suppliers || []).map((supplier) => {
          const trend = supplier.trend || "Stable";

          return (
            <div
              key={supplier.supplier_id}
              style={{
                border: "1px solid rgba(148,163,184,.28)",
                borderRadius: "14px",
                padding: "16px",
                background: "#111827",
              }}
            >
              <h4 style={{ color: "#f8fafc", margin: "0 0 10px" }}>
                {supplier.supplier_id}
              </h4>

              <div
                style={{
                  display: "inline-block",
                  padding: "6px 12px",
                  borderRadius: "999px",
                  background: `${getTrendColor(trend)}22`,
                  color: getTrendColor(trend),
                  fontWeight: 800,
                  marginBottom: "12px",
                }}
              >
                {trend}
              </div>

              <ResponsiveContainer width="100%" height={70}>
                <LineChart data={getTrendLineData(trend)}>
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={getTrendColor(trend)}
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TrendSparklines;