import { useState } from "react";
function SupplierNetworkGraph({ suppliers, relationshipData }) {
 
const [selectedNode, setSelectedNode] = useState(null);


const criticality =
  relationshipData?.supplier_criticality || [];
 const nodes = criticality.slice(0, 12).map((s, index) => ({
  supplier_id: s.primary_supplier_id,
  name: s.primary_supplier_id,
  risk_score:
    s.criticality_level === "Critical"
      ? 90
      : s.criticality_level === "High"
      ? 70
      : s.criticality_level === "Medium"
      ? 50
      : 20,
  risk_level: s.criticality_level,
  criticality_score: s.sku_count || 0,
  single_source_count: s.single_source_count || 0,
  color:
    s.criticality_level === "Critical"
      ? "#dc2626"
      : s.criticality_level === "High"
      ? "#dc2626"
      : s.criticality_level === "Medium"
      ? "#f59e0b"
      : "#16a34a",
  x: 120 + (index % 4) * 220,
  y: 100 + Math.floor(index / 4) * 140,
}));
  return (
    <div style={{
      background: "white",
      marginTop: "24px",
      padding: "20px",
      borderRadius: "16px"
    }}>
      <h3>Supplier Network Graph</h3>
      <p style={{ color: "#64748b" }}>
        Nodes = Suppliers, Edges = Dependency links, Color = Risk level
      </p>

      <svg width="100%" height="500">
        {nodes.slice(0, -1).map((node, index) => (
          <line
            key={`line-${node.supplier_id}-${nodes[index + 1]?.supplier_id}-${index}`}
            x1={node.x}
            y1={node.y}
            x2={nodes[index + 1].x}
            y2={nodes[index + 1].y}
            stroke="#CBD5E1"
            strokeWidth="2"
          />
        ))}

       {nodes.map((node, index) => (
        <g key={`node-${node.supplier_id}-${index}`}>
            <circle
  cx={node.x}
  cy={node.y}
  r="20"
  fill={node.color}
  style={{ cursor: "pointer" }}
  onClick={() => setSelectedNode(node)}
/>
            <text
              x={node.x}
              y={node.y + 42}
              textAnchor="middle"
              fontSize="12"
              fill="#0f172a"
            >
              {node.supplier_id}
            </text>
          </g>
        ))}
      </svg>

      <div style={{ display: "flex", gap: "16px" }}>
        <span>🟢 Low Risk</span>
        <span>🟡 Medium Risk</span>
        <span>🔴 High Risk</span>
      </div>
      {selectedNode && (
  <div
    style={{
      marginTop: "20px",
      padding: "15px",
      border: "1px solid #E2E8F0",
      borderRadius: "10px",
      background: "#F8FAFC"
    }}
  >
    <h4>Selected Supplier</h4>

    <p><b>ID:</b> {selectedNode.supplier_id}</p>
    <p><b>Name:</b> {selectedNode.name}</p>
    <p><b>Risk Score:</b> {selectedNode.risk_score}</p>
    <p><b>Risk Level:</b> {selectedNode.risk_level}</p>
    <p><b>Criticality Score:</b> {selectedNode.criticality_score}</p>
<p><b>Single Source Count:</b> {selectedNode.single_source_count}</p>
  </div>
)}
    </div>
  );
}

export default SupplierNetworkGraph;