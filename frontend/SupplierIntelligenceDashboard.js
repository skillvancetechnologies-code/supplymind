import { useState, useEffect } from "react";
import SupplierScatterPlot from "../components/SupplierScatterPlot";
import RiskHeatmap from "../components/RiskHeatmap";
import TrendSparklines from "../components/TrendSparklines";
import SupplierNetworkGraph from "../components/SupplierNetworkGraph";
import {
  SUPPLIER_API,
  SUPPLIER_SCORECARD_API,
  SUPPLIER_PEERS_API,
  SUPPLIER_RELATIONSHIPS_API
} from "../api/config";

const SupplierIntelligenceDashboard = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [scorecard, setScorecard] = useState(null);
const [peers, setPeers] = useState(null);
const [relationshipData, setRelationshipData] = useState(null);
  const [search, setSearch] = useState("");
 const [riskFilter, setRiskFilter] = useState("All");
const [regionFilter, setRegionFilter] = useState("All");
const [sortBy, setSortBy] = useState("Risk");
useEffect(() => {
  fetch(SUPPLIER_RELATIONSHIPS_API)
    .then((r) => r.json())
    .then((data) => {
      console.log("Supplier Relationships API Response:", data);
      console.log(
  "First Supplier Criticality Item:",
  data.supplier_criticality?.[0]
);
      setRelationshipData(data);

    })
    .catch((error) => {
      console.log("Supplier Relationships API error:", error);
    });
}, []);
  useEffect(() => {
  fetch(SUPPLIER_API)
    .then((r) => r.json())
    .then((data) => {
        console.log("Supplier Intelligence API Response:", data);
      const list =
        Array.isArray(data)
          ? data
          : data.supplier_risks || data.suppliers || data.data || [];

     const fixed = list.map((s) => ({
  supplier_id: s.supplier_id,
  supplier_name:
    s.supplier_name ||
    s.supplier ||
    s.name ||
    s.company_name ||
    s.supplier_id,
  risk_score: Number(s.risk_score || 0),
  otif: Number(s.current_otif || s.otif || 0),
  lead_time: Number(s.avg_lead_time_days || s.lead_time || 0),
  fill_rate: Number(s.fill_rate_pct || s.fill_rate || 0),
  trend: s.trend || "Stable",
  region: s.city || s.region || "Unknown",
 category: s.tier || "Unknown"
}));

      setSuppliers(fixed);
      setSelectedSupplier(fixed[0]);
    })
    .catch((error) => {
      console.log("Supplier API error:", error);
    });
}, []);
useEffect(() => {
  if (!selectedSupplier) return;

  fetch(`${SUPPLIER_SCORECARD_API}/${selectedSupplier.supplier_id}`)
    .then((r) => r.json())
    .then((data) => {
  console.log("Supplier Scorecard API Response:", data);
  setScorecard(data);
})
    .catch((error) => console.log("Scorecard API error:", error));

  fetch(`${SUPPLIER_PEERS_API}/${selectedSupplier.supplier_id}`)
    .then((r) => r.json())
    .then((data) => {
  console.log("Supplier Peers API Response:", data);
  setPeers(data);
})
    .catch((error) => console.log("Peers API error:", error));
}, [selectedSupplier]);
  const getRiskLevel = (score) => {
    if (score >= 70) return "High";
    if (score >= 40) return "Medium";
    return "Low";
  };

  const getRiskColor = (score) => {
    if (score >= 70) return "#C53030";
    if (score >= 40) return "#B7791F";
    return "#1A6B3A";
  };

  const filteredSuppliers = suppliers
  .filter((s) => {

    const risk = getRiskLevel(s.risk_score)

    const searchMatch =
      s.supplier_name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      s.supplier_id
        .toLowerCase()
        .includes(search.toLowerCase())

    const riskMatch =
      riskFilter === 'All' ||
      risk === riskFilter

    const regionMatch =
      regionFilter === 'All' ||
      s.region === regionFilter

    return (
      searchMatch &&
      riskMatch &&
      regionMatch
    )
  })
  .sort((a,b) => {

    if(sortBy === 'Risk')
      return b.risk_score - a.risk_score

    if(sortBy === 'OTIF')
      return b.otif - a.otif

    if(sortBy === 'Lead Time')
      return b.lead_time - a.lead_time

    return 0
  })

  return (
    <div
      style={{
        padding: "30px",
        background: "#F4F6F9",
        minHeight: "100vh"
      }}
    >
      <h2 style={{ color: "#1B2A4A" }}>
        Supplier Intelligence Dashboard
      </h2>

      {/* KPI CARDS */}

      <div
        style={{
          display: "flex",
          gap: "16px",
          marginTop: "20px",
          marginBottom: "25px"
        }}
      >
        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "10px",
            flex: 1
          }}
        >
          <p>Suppliers At Risk</p>
          <h2 style={{ color: "#C53030" }}>
            {
              suppliers.filter(
                (s) => s.risk_score >= 70
              ).length
            }
          </h2>
        </div>

        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "10px",
            flex: 1
          }}
        >
          <p>Average OTIF</p>
          <h2 style={{ color: "#1A6B3A" }}>
           {suppliers.length
  ? Math.round(suppliers.reduce((sum, s) => sum + s.otif, 0) / suppliers.length)
  : 0}%
          </h2>
        </div>

        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "10px",
            flex: 1
          }}
        >
          <p>Average Lead Time</p>
          <h2 style={{ color: "#1B2A4A" }}>
          {suppliers.length
  ? Math.round(suppliers.reduce((sum, s) => sum + s.lead_time, 0) / suppliers.length)
  : 0} Days
          </h2>
        </div>
      </div>

      {/* MAIN LAYOUT */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "250px 1fr 350px",
          gap: "20px"
        }}
      >
        {/* LEFT FILTERS */}

        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "10px"
          }}
        >
          <h3>Filters</h3>

          <input
            type="text"
            placeholder="Search Supplier"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "15px"
            }}
          />

          <select
            value={riskFilter}
            onChange={(e) =>
              setRiskFilter(e.target.value)
            }
            style={{
              width: "100%",
              padding: "10px"
            }}
          >
            <option>All</option>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
          <select
  value={regionFilter}
  onChange={(e) => setRegionFilter(e.target.value)}
  style={{
    width:'100%',
    padding:'10px',
    marginTop:'10px'
  }}
>
  <option>All</option>
  <option>North</option>
  <option>South</option>
  <option>East</option>
  <option>West</option>
</select>
<select
  value={sortBy}
  onChange={(e) => setSortBy(e.target.value)}
  style={{
    width:'100%',
    padding:'10px',
    marginTop:'10px'
  }}
>
  <option>Risk</option>
  <option>OTIF</option>
  <option>Lead Time</option>
</select>
        </div>

        {/* SUPPLIER CARDS */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill,minmax(260px,1fr))",
            gap: "15px"
          }}
        >
          {filteredSuppliers.map((supplier) => (
            <div
              key={supplier.supplier_id}
              onClick={() =>
                setSelectedSupplier(supplier)
              }
              style={{
                background: "white",
                padding: "18px",
                borderRadius: "10px",
                cursor: "pointer",
                border: "1px solid #E2E8F0"
              }}
            >
              <h4>{supplier.supplier_name}</h4>

              <p>{supplier.supplier_id}</p>

              <p
                style={{
                  color: getRiskColor(
                    supplier.risk_score
                  ),
                  fontWeight: "bold"
                }}
              >
                {getRiskLevel(
                  supplier.risk_score
                )}
              </p>

              <p>OTIF: {supplier.otif}%</p>

              <p>
                Lead Time: {supplier.lead_time} Days
              </p>
            </div>
          ))}
        </div>

        {/* RIGHT PANEL */}

        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "10px"
          }}
        >
          {selectedSupplier && (
            <>
              <h3>Supplier Scorecard</h3>

              <p>
                <b>ID:</b>{" "}
                {selectedSupplier.supplier_id}
              </p>

              <p>
                <b>Name:</b>{" "}
                {selectedSupplier.supplier_name}
              </p>

              <p>
                <b>Risk Score:</b>{" "}
                {selectedSupplier.risk_score}
              </p>

              <p>
                <b>OTIF:</b>{" "}
                {selectedSupplier.otif}%
              </p>

              <p>
                <b>Lead Time:</b>{" "}
                {selectedSupplier.lead_time} Days
              </p>

              <p>
                <b>Region:</b>{" "}
                {selectedSupplier.region}
              </p>
              <p>
  <b>Benchmark Percentile:</b>{" "}
{scorecard?.benchmarks?.otif_percentile || "-"}%
</p>

<p>
<b>Benchmark Summary:</b> {scorecard?.benchmark_summary || "-"}
</p>
<p>
  <b>Total Peers:</b>{" "}
  {peers?.total_peers || "-"}
</p>

<p>
  <b>Peer Group:</b>{" "}
  {peers?.peer_group || "-"}
</p>

<p>
 <b>Peer Rank:</b>{" "}
{peers?.this_supplier_rank || "-"}
</p>

              <button
                style={{
                  width: "100%",
                  marginTop: "10px",
                  padding: "10px",
                  background: "#1B2A4A",
                  color: "white",
                  border: "none",
                  borderRadius: "6px"
                }}
              >
                Flag For Review
              </button>

              <button
                style={{
                  width: "100%",
                  marginTop: "10px",
                  padding: "10px",
                  background: "#1A6B3A",
                  color: "white",
                  border: "none",
                  borderRadius: "6px"
                }}
              >
                Export Details
              </button>
            </>
          )}
        </div>
      </div>
      <SupplierScatterPlot suppliers={suppliers} />
      <RiskHeatmap suppliers={suppliers} />
     <TrendSparklines suppliers={suppliers} />
  <SupplierNetworkGraph
  suppliers={suppliers}
  relationshipData={relationshipData}
/>
    </div>
  );
};

export default SupplierIntelligenceDashboard;