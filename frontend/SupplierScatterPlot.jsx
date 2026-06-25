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
      const [selectedSupplier, setSelectedSupplier] =
    useState(null);
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

  const chartData = suppliers.map((s) => ({
    supplier_id: s.supplier_id,
    name: s.supplier_name,
    cost: s.lead_time,
    otif: s.otif,
    fill_rate: s.fill_rate,
volume:
  ((s.fill_rate || 0) * 2) +
  ((s.otif || 0) * 1.5) +
  ((100 - (s.risk_score || 0)) * 1),
    risk_score: s.risk_score,
    risk_level: getRiskLevel(s.risk_score),
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

      <ResponsiveContainer width="100%" height={420}>
        <ScatterChart>
          <CartesianGrid />

          <XAxis
            type="number"
            dataKey="cost"
            name="Cost"
            label={{
              value: "Cost / Lead Time Proxy",
              position: "insideBottom",
              offset: -5,
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

       <ZAxis
  type="number"
  dataKey="volume"
  range={[15, 300]}
/>
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            formatter={(value, name) => {
              if (name === "otif") return [`${value}%`, "OTIF"];
              if (name === "cost") return [value, "Cost Proxy"];
              if (name === "volume") return [value, "Volume Proxy"];
              return [value, name];
            }}
            labelFormatter={() => "Supplier"}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;

                return (
                  <div
                    style={{
                      background: "white",
                      padding: "12px",
                      border: "1px solid #E2E8F0",
                      borderRadius: "10px",
                    }}
                  >
                    <p><b>{data.name}</b></p>
                    <p>ID: {data.supplier_id}</p>
                    <p>OTIF: {data.otif}%</p>
                    <p>Risk Score: {data.risk_score}</p>
                    <p>Risk Level: {data.risk_level}</p>
                    <p>Cost Proxy: {data.cost}</p>
                  <p>Volume Proxy: {data.volume}</p>
<p>Fill Rate: {data.fill_rate}%</p>
                  </div>
                );
              }

              return null;
            }}
          />

       <Scatter
  data={chartData}
  onClick={(e) => {
  console.log(e);
  setSelectedSupplier(e?.payload);
}}
  
>
            {chartData.map((entry) => (
              <Cell
                key={entry.supplier_id}
                fill={getRiskColor(entry.risk_score)}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>

      <div style={{ marginTop: "12px" }}>
    {selectedSupplier && (
  <div
    style={{
      marginBottom: "15px",
      padding: "15px",
      border: "1px solid #E2E8F0",
      borderRadius: "10px",
      background: "#F8FAFC"
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

<div style={{ display: "flex", gap: "16px" }}>
  <span>🟢 Low Risk</span>
  <span>🟡 Medium Risk</span>
  <span>🔴 High Risk</span>
</div>

</div>

</div>

);
}

export default SupplierScatterPlot;