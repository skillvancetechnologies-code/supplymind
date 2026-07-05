import { useState } from "react";

function SupplierNetworkGraph({ relationshipData }) {
  const [selectedNode, setSelectedNode] = useState(null);

  const criticality = relationshipData?.supplier_criticality || [];

  const columns = 8;

  const nodes = criticality.map((s, index) => ({
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
      s.criticality_level === "Critical" || s.criticality_level === "High"
        ? "#dc2626"
        : s.criticality_level === "Medium"
        ? "#f59e0b"
        : "#16a34a",
   x: 80 + (index % columns) * 140,
y: 90 + Math.floor(index / columns) * 130,
  }));

  const rows = Math.ceil(nodes.length / columns);
  const svgHeight = rows * 140 + 100;

  console.log("Total Nodes:", nodes.length);

  return (
    <div
      style={{
        background: "white",
        marginTop: "24px",
        padding: "20px",
        borderRadius: "16px",
      }}
    >
      <h3>Supplier Network Graph</h3>

      <p style={{ color: "#64748b" }}>
       Supplier nodes are displayed using backend criticality data. Lines are visual network links.
      </p>

      <div
        style={{
          width: "100%",
          maxHeight: "650px",
          overflow: "auto",
        }}
      >
       <svg width="1200" height={svgHeight}>
  {nodes.slice(0, -1).map((node, index) => {
    const nextNode = nodes[index + 1];

    return (
      <line
        key={`line-${node.supplier_id}-${nextNode.supplier_id}`}
        x1={node.x}
        y1={node.y}
        x2={nextNode.x}
        y2={nextNode.y}
        stroke="rgba(148,163,184,0.35)"
        strokeWidth="2"
      />
    );
  })}

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
      </div>

      <div style={{ display: "flex", gap: "16px", marginTop: "12px" }}>
        <span style={{ color: "#16a34a" }}>● Low</span>
        <span style={{ color: "#f59e0b" }}>● Medium</span>
        <span style={{ color: "#dc2626" }}>● High / Critical</span>
      </div>

      {selectedNode && (
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            border: "1px solid #E2E8F0",
            borderRadius: "10px",
           background: "#111827",
color: "#CBD5E1",
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