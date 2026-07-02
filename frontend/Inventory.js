import { useState, useEffect } from 'react'
import { INVENTORY_DETAIL_API } from '../api/config'

const statusColor = (s = '') => {
  const status = s.toLowerCase()

  if (status === 'critical') return '#C53030'
  if (status === 'warning') return '#B7791F'
  return '#1A6B3A'
}

const Inventory = () => {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('pending')

  useEffect(() => {
    fetch(INVENTORY_DETAIL_API)
      .then(r => {
        if (!r.ok) throw new Error('Inventory detail endpoint not ready')
        return r.json()
      })
      .then(data => {
        const rows = Array.isArray(data)
          ? data
          : data.inventory_detail || data.data || data.results || []

        setInventory(rows)
        setStatus('live')
      })
      .catch(error => {
        console.log('Inventory detail API pending:', error)
        setInventory([])
        setStatus('pending')
      })
      .finally(() => setLoading(false))
  }, [])

  return (
   <div
  style={{
    padding: "34px",
    flex: 1,
    minHeight: "100vh",
    color: "#e5e7eb",
   
  }}
>
     <h1
  style={{
    fontSize: "42px",
    fontWeight: 900,
    margin: 0,
    color: "#f8fafc",
    textShadow:
      "0 0 12px rgba(96,165,250,.55), 0 0 35px rgba(37,99,235,.35)",
  }}
>
  Inventory Positions
</h1>

<p
  style={{
    color: "#94a3b8",
    marginTop: "10px",
    marginBottom: "28px",
    fontSize: "15px",
  }}
>
        {status === 'live'
          ? 'Live SKU-level inventory data'
          : 'Inventory detail endpoint pending from backend'}
      </p>

      {loading && (
        <div style={{
         background: "rgba(15,23,42,.86)",
padding: "22px",
borderRadius: "20px",
marginTop: "20px",
border: "1px solid rgba(148,163,184,.18)",
color: "#cbd5e1",
boxShadow: "0 24px 60px rgba(0,0,0,.34)"
        }}>
          Inventory detail loading...
        </div>
      )}

      {!loading && inventory.length === 0 && (
        <div style={{
         background: "#111827",
border: "1px solid rgba(255,255,255,.08)",
color: "#FBBF24",
          padding:'20px',
          borderRadius:'8px',
          marginTop:'20px',
         
          fontWeight:'bold'
        }}>
          No live SKU inventory rows available yet. Waiting for /api/analytics/inventory-detail.
        </div>
      )}

      {!loading && inventory.length > 0 && (
     <div
  style={{
    width: "100%",
    overflowX: window.innerWidth <= 768 ? "auto" : "visible",
    WebkitOverflowScrolling: "touch",
  }}
>
 <table
  style={{
    width: window.innerWidth <= 768 ? "950px" : "100%",
    minWidth: window.innerWidth <= 768 ? "950px" : "100%",
    borderCollapse: "collapse",
   background: "#111827",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  }}
>
          <thead>
            <tr
  style={{
    background: "linear-gradient(90deg,#1E3A8A,#2563EB)",
  }}
>
              {['SKU ID','SKU Name','Category','Current Stock','Days of Cover','Status'].map(h => (
                <th key={h} style={{ padding:'12px', color:'white', textAlign:'left' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {inventory.map((r, i) => (
             <tr
  key={r.sku_id || i}
  style={{
    background: i % 2 === 0 ? "#1E293B" : "#111827",
    transition: "all .25s ease",
  }}
  onMouseEnter={(e) =>
    (e.currentTarget.style.background = "#273549")
  }
  onMouseLeave={(e) =>
    (e.currentTarget.style.background =
      i % 2 === 0 ? "#1E293B" : "#111827")
  }
>
                <td
  style={{
    padding: "14px",
    color: "#E2E8F0",
    borderBottom: "1px solid rgba(255,255,255,.05)",
  }}
>{r.sku_id}</td>
                <td
  style={{
    padding: "14px",
    color: "#E2E8F0",
    borderBottom: "1px solid rgba(255,255,255,.05)",
  }}
>{r.sku_name}</td>
                <td
  style={{
    padding: "14px",
    color: "#E2E8F0",
    borderBottom: "1px solid rgba(255,255,255,.05)",
  }}
>{r.category}</td>
                <td
  style={{
    padding: "14px",
    color: "#E2E8F0",
    borderBottom: "1px solid rgba(255,255,255,.05)",
  }}
>{r.current_stock}</td>
                <td
  style={{
    padding: "14px",
    color: "#E2E8F0",
    borderBottom: "1px solid rgba(255,255,255,.05)",
  }}
>
                  {r.days_of_cover} days
                </td>
               <td
  style={{
    padding: "14px",
    borderBottom: "1px solid rgba(255,255,255,.05)",
  }}
>
  <span
    style={{
      display: "inline-block",
      padding: "6px 14px",
      borderRadius: "999px",
      fontSize: "12px",
      fontWeight: 700,
      textTransform: "uppercase",
      background:
        r.status?.toLowerCase() === "critical"
          ? "rgba(239,68,68,.15)"
          : r.status?.toLowerCase() === "warning"
          ? "rgba(245,158,11,.15)"
          : "rgba(34,197,94,.15)",
      color: statusColor(r.status),
      border: `1px solid ${statusColor(r.status)}`,
    }}
  >
    {r.status}
  </span>
</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </div>
  )
}

export default Inventory
