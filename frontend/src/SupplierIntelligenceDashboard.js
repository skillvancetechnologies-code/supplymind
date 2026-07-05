import { useState, useEffect } from "react";
import SupplierScatterPlot from "./SupplierScatterPlot";
import RiskHeatmap from "./RiskHeatmap";
import TrendSparklines from "./TrendSparklines";
import SupplierNetworkGraph from "./SupplierNetworkGraph";
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

const regions = [...new Set(suppliers.map((s) => s.region))];
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
const supplier = filteredSuppliers[0];
  return (
   <div
  style={{
    padding: "34px",
    minHeight: "100vh",
    color: "#E5E7EB",
   
  }}
>   
    
     <h1
  style={{
    fontSize: "42px",
    fontWeight: 900,
    margin: 0,
    color: "#F8FAFC",
    textShadow:
      "0 0 12px rgba(96,165,250,.55),0 0 35px rgba(37,99,235,.35)",
  }}
>
  Supplier Intelligence Dashboard
</h1>
<p
  style={{
    color: "#94A3B8",
    marginTop: "10px",
    marginBottom: "28px",
    fontSize: "15px",
  }}
>
  Live supplier intelligence, benchmarking and risk analytics
</p>

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
           background:"rgba(15,23,42,.88)",
border:"1px solid rgba(148,163,184,.18)",
borderRadius:"22px",
boxShadow:"0 24px 60px rgba(0,0,0,.34)",
            padding: "20px",
            
            flex: 1
          }}
        >
          <p  style={{
    color: "#94A3B8",
    fontSize: "14px",
    marginBottom: "8px",
  }}>Suppliers At Risk</p>
         <h2
  style={{
    color: "#EF4444",
    fontSize: "36px",
    fontWeight: 900,
    margin: 0,
  }}
>
            {
              suppliers.filter(
                (s) => s.risk_score >= 70
              ).length
            }
          </h2>
        </div>

        <div
          style={{
           background:"rgba(15,23,42,.88)",
border:"1px solid rgba(148,163,184,.18)",
borderRadius:"22px",
boxShadow:"0 24px 60px rgba(0,0,0,.34)",
            padding: "20px",
           
            flex: 1
          }}
        >
          <p style={{
    color: "#94A3B8",
    fontSize: "14px",
    marginBottom: "8px",
  }}>Average OTIF</p>
         <h2
  style={{
    color: "#22C55E",
    fontSize: "36px",
    fontWeight: 900,
    margin: 0,
  }}
>
           {suppliers.length
  ? Math.round(suppliers.reduce((sum, s) => sum + s.otif, 0) / suppliers.length)
  : 0}%
          </h2>
        </div>

        <div
          style={{
            background: "rgba(15,23,42,.88)",
border: "1px solid rgba(148,163,184,.18)",
boxShadow: "0 24px 60px rgba(0,0,0,.34)",
            padding: "20px",
            borderRadius: "10px",
            flex: 1
          }}
        >
          <p style={{
    color: "#94A3B8",
    fontSize: "14px",
    marginBottom: "8px",
  }}>Average Lead Time</p>
       <h2
  style={{
    color: "#F8FAFC",
    fontSize: "36px",
    fontWeight: 900,
    margin: 0,
  }}
>
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
gridTemplateColumns: "250px 450px 350px",
justifyContent: "space-between",
gap: "24px",
alignItems: "start",
        }}
      >
        {/* LEFT FILTERS */}

        <div
          style={{
            background: "rgba(15,23,42,.88)",
border: "1px solid rgba(148,163,184,.18)",
boxShadow: "0 24px 60px rgba(0,0,0,.34)",
            padding: "20px",
            borderRadius: "10px"
          }}
        >
         <h3
  style={{
    color:"#F8FAFC",
    marginBottom:"20px"
  }}
>
Filters
</h3>
<div
  style={{
    background: "#111827",
    border: "1px solid rgba(148,163,184,.25)",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "20px",
    textAlign: "center",
  }}
>
  <div
    style={{
      fontSize: "34px",
      fontWeight: "900",
      color: "#60A5FA",
    }}
  >
    {suppliers.length}
  </div>

  <div
    style={{
      color: "#94A3B8",
      fontSize: "14px",
    }}
  >
    Total Suppliers
  </div>
</div>

          <input
            type="text"
            placeholder="Search Supplier"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
           style={{
  width:"100%",
  padding:"12px",
  marginBottom:"12px",
  background:"#111827",
  color:"#F8FAFC",
  border:"1px solid rgba(148,163,184,.25)",
  borderRadius:"10px",
  outline:"none"
}}
          />

          <select
            value={riskFilter}
            onChange={(e) =>
              setRiskFilter(e.target.value)
            }
           style={{
  width:"100%",
  padding:"12px",
  marginBottom:"12px",
  background:"#111827",
  color:"#F8FAFC",
  border:"1px solid rgba(148,163,184,.25)",
  borderRadius:"10px",
  outline:"none"
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
    width: "100%",
    padding: "12px",
    marginBottom: "12px",
    background: "#111827",
    color: "#F8FAFC",
    border: "1px solid rgba(148,163,184,.25)",
    borderRadius: "10px",
    outline: "none",
  }}
>
  <option value="All">All Regions</option>

  {regions.map((region) => (
    <option key={region} value={region}>
      {region}
    </option>
  ))}
</select>
<select
  value={sortBy}
  onChange={(e) => setSortBy(e.target.value)}
 style={{
  width:"100%",
  padding:"12px",
  marginBottom:"12px",
  background:"#111827",
  color:"#F8FAFC",
  border:"1px solid rgba(148,163,184,.25)",
  borderRadius:"10px",
  outline:"none"
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
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingTop: "40px",
    minHeight: "420px",
  }}
>
  {search.trim() === "" ? (
   <div
  style={{
    width: "430px",
    height: "240px",
    border: "2px dashed rgba(96,165,250,.25)",
    borderRadius: "18px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    color: "#94A3B8",
    background: "rgba(15,23,42,.45)",
  }}
>
  <div style={{ fontSize: "48px" }}></div>

  <h3 style={{ marginTop: "25px" }}>
    Search for a supplier to view details
    
  </h3>

  <p>
    
  </p>
</div>
  ) :supplier ? (
      <div
        key={supplier.supplier_id}
        onClick={() => setSelectedSupplier(supplier)}
        style={{
    width: "430px",
    background: "rgba(15,23,42,.95)",
    border: "1px solid rgba(96,165,250,.25)",
    borderRadius: "18px",
    padding: "24px",
    boxShadow: "0 18px 45px rgba(0,0,0,.35)",
    transition: ".25s",
    cursor: "pointer"
}}
      >
        <h4 style={{ color: "#F8FAFC" }}>
          {supplier.supplier_name}
        </h4>

        <p style={{ color: "#60A5FA" }}>
          {supplier.supplier_id}
        </p>

        <p
          style={{
            color: getRiskColor(supplier.risk_score),
            fontWeight: "bold",
          }}
        >
          {getRiskLevel(supplier.risk_score)}
        </p>

        <p style={{ color: "#CBD5E1" }}>
          OTIF: {supplier.otif}%
        </p>

        <p style={{ color: "#CBD5E1" }}>
          Lead Time: {supplier.lead_time} Days
        </p>
      </div>
    
  ) : (
    <div
      style={{
        marginTop: "80px",
        color: "#EF4444",
        fontSize: "18px",
      }}
    >
      No supplier found.
    </div>
  )}
</div>

        {/* RIGHT PANEL */}

        <div
          style={{
           background: "rgba(15,23,42,.88)",
border: "1px solid rgba(148,163,184,.18)",
boxShadow: "0 24px 60px rgba(0,0,0,.34)",
            padding: "26px",
            borderRadius: "10px",
            display:"flex",
flexDirection:"column",
justifyContent:"space-between",
minHeight:"420px",
          }}
        >
          {selectedSupplier && (
            <>
            <h3 style={{ color: "#F8FAFC" }}>Supplier Scorecard</h3>

             <p
  style={{
    color: "#CBD5E1",
    marginBottom: "10px",
  }}
>
                <b>ID:</b>{" "}
                {selectedSupplier.supplier_id}
              </p>

             <p
  style={{
    color: "#CBD5E1",
    marginBottom: "10px",
  }}
>
                <b>Name:</b>{" "}
                {selectedSupplier.supplier_name}
              </p>

             <p
  style={{
    color: "#CBD5E1",
    marginBottom: "10px",
  }}
>
                <b>Risk Score:</b>{" "}
                {selectedSupplier.risk_score}
              </p>

             <p
  style={{
    color: "#CBD5E1",
    marginBottom: "10px",
  }}
>
                <b>OTIF:</b>{" "}
                {selectedSupplier.otif}%
              </p>

              <p
  style={{
    color: "#CBD5E1",
    marginBottom: "10px",
  }}
>
                <b>Lead Time:</b>{" "}
                {selectedSupplier.lead_time} Days
              </p>

              <p
  style={{
    color: "#CBD5E1",
    marginBottom: "10px",
  }}
>
                <b>Region:</b>{" "}
                {selectedSupplier.region}
              </p>
              <p
  style={{
    color: "#CBD5E1",
    marginBottom: "10px",
  }}
>
  <b>Benchmark Percentile:</b>{" "}
{scorecard?.benchmarks?.otif_percentile || "-"}%
</p>

<p
  style={{
    color: "#CBD5E1",
    marginBottom: "10px",
  }}
>
<b>Benchmark Summary:</b> {scorecard?.benchmark_summary || "-"}
</p>
<p
  style={{
    color: "#CBD5E1",
    marginBottom: "10px",
  }}
>
  <b>Total Peers:</b>{" "}
  {peers?.total_peers || "-"}
</p>

<p
  style={{
    color: "#CBD5E1",
    marginBottom: "10px",
  }}
>
  <b>Peer Group:</b>{" "}
  {peers?.peer_group || "-"}
</p>

<p
  style={{
    color: "#CBD5E1",
    marginBottom: "10px",
  }}
>
 <b>Peer Rank:</b>{" "}
{peers?.this_supplier_rank || "-"}
</p>

             
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