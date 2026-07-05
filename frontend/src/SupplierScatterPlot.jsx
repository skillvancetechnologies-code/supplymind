import { useState } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ZAxis,
} from "recharts";

function SupplierScatterPlot({ suppliers }) {
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [zoom, setZoom] = useState(1);

  const getRiskLevel = (score) => {
    if (score >= 70) return "High";
    if (score >= 40) return "Medium";
    return "Low";
  };

  const getRiskColor = (score) => {
    if (score >= 70) return "#dc2626";
    if (score >= 40) return "#f59e0b";
    return "#16a34a";
  };
console.log("Suppliers received:", suppliers);
 const chartData = (suppliers || []).map((s) => ({
    supplier_id: s.supplier_id,
    name: s.supplier_name || s.supplier_id,
    cost: s.lead_time || s.avg_lead_time_days || 0,
    otif: s.otif || s.current_otif || 0,
    fill_rate: s.fill_rate || s.fill_rate_pct || 0,
    volume:
      ((s.fill_rate || s.fill_rate_pct || 0) * 2) +
      ((s.otif || s.current_otif || 0) * 1.5) +
      ((100 - (s.risk_score || 0)) * 1),
    risk_score: s.risk_score || 0,
    risk_level: getRiskLevel(s.risk_score || 0),
  }));

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
      <h3>Supplier Segmentation Scatter Plot</h3>

      <p style={{ color: "#64748b" }}>
        X-axis: Cost proxy, Y-axis: OTIF, Bubble size: Volume proxy, Color: Risk level
      </p>
      <div style={{ display: "flex", gap: "10px", marginBottom: "12px", flexWrap: "wrap" }}>
  <button onClick={() => setZoom((z) => Math.min(z + 0.2, 2))}>
    Zoom In
  </button>

  <button onClick={() => setZoom((z) => Math.max(z - 0.2, 1))}>
    Zoom Out
  </button>

  <button onClick={() => setZoom(1)}>
    Reset
  </button>
</div>

      <div style={{ width: "100%", overflowX: "auto" }}>
       <div
  style={{
    minWidth: `${700 * zoom}px`,
    height: "400px",
  }}
>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 20 }}>
              <CartesianGrid />

              <XAxis
                type="number"
                dataKey="cost"
                name="Cost"
                label={{
                  value: "Cost / Lead Time Proxy",
                  position: "insideBottom",
                  offset: -10,
                }}
              />

              <YAxis
                type="number"
                dataKey="otif"
                name="OTIF"
                unit="%"
                label={{
                  value: "OTIF %",
                  angle: -90,
                  position: "insideLeft",
                }}
              />

              <ZAxis type="number" dataKey="volume" range={[15, 300]} />

              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;

                    return (
                      <div
                        style={{
                          background: "#111827",
color: "#CBD5E1",
                          padding: "12px",
                          border: "1px solid rgba(148,163,184,.25)",
                          borderRadius: "10px",
                        }}
                      >
                        <p><b>{data.name}</b></p>
                        <p>ID: {data.supplier_id}</p>
                        <p>OTIF: {data.otif}%</p>
                        <p>Risk Score: {data.risk_score}</p>
                        <p>Risk Level: {data.risk_level}</p>
                        <p>Cost Proxy: {data.cost}</p>
                        <p>Volume Proxy: {Math.round(data.volume)}</p>
                        <p>Fill Rate: {data.fill_rate}%</p>
                      </div>
                    );
                  }

                  return null;
                }}
              />

              <Scatter
                data={chartData}
                onClick={(e) => setSelectedSupplier(e?.payload)}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`${entry.supplier_id}-${index}`}
                    fill={getRiskColor(entry.risk_score)}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {selectedSupplier && (
        <div
          style={{
            marginTop: "16px",
            marginBottom: "15px",
            padding: "15px",
           border: "1px solid rgba(148,163,184,.25)",
            borderRadius: "10px",
           background: "#111827",
color: "#CBD5E1",
          }}
        >
          <h4>Supplier Details</h4>
          <p><b>Name:</b> {selectedSupplier.name}</p>
          <p><b>ID:</b> {selectedSupplier.supplier_id}</p>
          <p><b>OTIF:</b> {selectedSupplier.otif}%</p>
          <p><b>Risk Score:</b> {selectedSupplier.risk_score}</p>
          <p><b>Fill Rate:</b> {selectedSupplier.fill_rate}%</p>
          <p><b>Lead Time:</b> {selectedSupplier.cost}</p>
        </div>
      )}

      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
        <span>🟢 Low Risk</span>
        <span>🟡 Medium Risk</span>
        <span>🔴 High Risk</span>
      </div>
    </div>
  );
}

export default SupplierScatterPlot;