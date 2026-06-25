import {
  LineChart,
  Line,
  ResponsiveContainer
} from "recharts";

function TrendSparklines({ suppliers }) {

  const createTrendData = (trend) => {

    if (trend === "Improving") {
      return [
        { value: 70 },
        { value: 75 },
        { value: 80 },
        { value: 85 }
      ];
    }

    if (trend === "Declining") {
      return [
        { value: 85 },
        { value: 80 },
        { value: 75 },
        { value: 70 }
      ];
    }

    return [
      { value: 80 },
      { value: 81 },
      { value: 80 },
      { value: 81 }
    ];
  };

  return (
    <div
      style={{
        background: "white",
        padding: "20px",
        borderRadius: "16px",
        marginTop: "24px"
      }}
    >
      <h3>Supplier Trend Sparklines</h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fill,minmax(250px,1fr))",
          gap: "16px"
        }}
      >
        {suppliers.slice(0,12).map((supplier) => (

          <div
            key={supplier.supplier_id}
            style={{
              border: "1px solid #E2E8F0",
              borderRadius: "12px",
              padding: "12px"
            }}
          >
            <h4>{supplier.supplier_id}</h4>

            <p>
              Trend: {supplier.trend}
            </p>

            <ResponsiveContainer
              width="100%"
              height={60}
            >
              <LineChart
                data={createTrendData(
                  supplier.trend
                )}
              >
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>

          </div>

        ))}
      </div>
    </div>
  );
}

export default TrendSparklines;