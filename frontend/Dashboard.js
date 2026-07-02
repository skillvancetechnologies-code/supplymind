import { useState, useEffect } from 'react'
import { mockInventorySummary } from '../mocks/mockData'
import { INVENTORY_API, FORECAST_ACCURACY_API } from '../api/config'

const Dashboard = () => {
  const [summary, setSummary] = useState(mockInventorySummary)
  const [forecast, setForecast] = useState(mockInventorySummary.forecast_accuracy)
  const [summaryStatus, setSummaryStatus] = useState('loading')

  useEffect(() => {
    fetch(INVENTORY_API)
      .then(r => r.json())
      .then(data => {
        console.log('Inventory API Response:', data)
        console.log('Top 3 Critical SKUs:', data.top_3_critical)
        setSummary(data)
        setSummaryStatus('live')
      })
      .catch(error => {
        console.log('Inventory API error:', error)
        setSummary(mockInventorySummary)
        setSummaryStatus('mock')
      })

    fetch(FORECAST_ACCURACY_API)
      .then(r => r.json())
      .then(data => setForecast(data))
      .catch(error => {
        console.log('Forecast API error:', error)
        setForecast(mockInventorySummary.forecast_accuracy)
      })
  }, [])

  const kpis = [
    {
      label: 'Total SKUs Tracked',
      value: summary.total_skus_tracked,
     
     
     
      note: 'Live inventory coverage',
    },
    {
      label: 'Critical SKUs',
      value: summary.critical_skus,
     
     
      
      note: 'Requires immediate attention',
    },
    {
      label: 'Inventory Value',
      value: `₹${summary.total_inventory_value?.toLocaleString()}`,
     
     
      
      note: 'Total stock valuation',
    },
    {
      label: 'Avg Days of Cover',
      value: summary.avg_days_of_cover,
     
     
      
      note: 'Supply continuity indicator',
    },
  ]

  return (
    <div
      style={{
        padding: '34px',
        flex: 1,
        minHeight: '100vh',
        color: '#e5e7eb',
       
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '20px',
          alignItems: 'center',
          marginBottom: '28px',
          flexWrap: 'wrap',
        }}
      >
        <div>
        <h1
style={{
fontSize:"42px",
fontWeight:800,
color:"#fff",
margin:0,
textShadow:
"0 0 12px rgba(96,165,250,.6),0 0 35px rgba(37,99,235,.4)"
}}
>
Command Center
</h1>
         <p
  style={{
    color: "#94a3b8",
    marginTop: "10px",
    fontSize: "15px",
    display: "flex",
    gap: "18px",
    flexWrap: "wrap",
    alignItems: "center",
  }}
>
  <span> AI Supply Chain Command Center</span>

 
 
</p>
        </div>

       <div
  style={{
    padding: "16px 20px",
    borderRadius: "20px",
    background:
      "linear-gradient(145deg, rgba(15,23,42,.95), rgba(30,41,59,.72))",
    border: "1px solid rgba(34,197,94,.28)",
    boxShadow:
      "0 20px 45px rgba(0,0,0,.35), 0 0 24px rgba(34,197,94,.18)",
    minWidth: "240px",
  }}
>
  <div
    style={{
      color: summaryStatus === "live" ? "#22c55e" : "#f59e0b",
      fontWeight: 900,
      fontSize: "14px",
      marginBottom: "8px",
    }}
  >
    {summaryStatus === "live" ? "● LIVE BACKEND" : "● FALLBACK MODE"}
  </div>

  <div
    style={{
      color: "#f8fafc",
      fontSize: "13px",
      fontWeight: 700,
      marginBottom: "6px",
    }}
  >
    Inventory API ✓
  </div>

  <div
    style={{
      color: "#f8fafc",
      fontSize: "13px",
      fontWeight: 700,
      marginBottom: "10px",
    }}
  >
    Forecast API ✓
  </div>

  <div
    style={{
      color: "#94a3b8",
      fontSize: "12px",
    }}
  >
    {summaryStatus === "live"
      ? "Data fetched from live backend"
      : "Using mock data due to API issues"}
    
  </div>
</div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '18px',
          marginBottom: '28px',
        }}
      >
        {kpis.map(k => (
          <div
            key={k.label}
            className="dashboard-kpi-card"
            style={{
              position: 'relative',
              overflow: 'hidden',
              padding: '22px',
              minHeight: '150px',
              borderRadius: '22px',
              background:
                'linear-gradient(145deg, rgba(15, 23, 42, 0.94), rgba(15, 23, 42, 0.68))',
              border: '1px solid rgba(148, 163, 184, 0.18)',
              boxShadow: `0 20px 45px rgba(0,0,0,0.32), 0 0 28px ${k.glow}`,
              transition: 'all 0.28s ease',
cursor: 'default',
isolation: 'isolate',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-40px',
                right: '-35px',
                width: '110px',
                height: '110px',
                borderRadius: '50%',
                background: k.glow,
                filter: 'blur(4px)',
              }}
            />

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '12px',
              }}
            >
              <div>
                <p
                  style={{
                    margin: 0,
                    color: '#94a3b8',
                    fontSize: '13px',
                    fontWeight: 700,
                  }}
                >
                  {k.label}
                </p>

               <div
  style={{
    color: '#ffffff',
    margin: '12px 0 0',
    fontSize: '34px',
    lineHeight: 1.1,
    fontWeight: 900,
    textShadow: '0 0 18px rgba(96, 165, 250, 0.55)',
  }}
>
  {k.value}
</div>
              </div>

              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: k.glow,
                  color: k.accent,
                  fontSize: '24px',
                  border: `1px solid ${k.accent}55`,
                }}
              >
                {k.icon}
              </div>
            </div>

            <p
              style={{
                color: '#64748b',
                marginTop: '18px',
                marginBottom: 0,
                fontSize: '13px',
              }}
            >
              {k.note}
            </p>

            <div
              style={{
                marginTop: '16px',
                height: '4px',
                width: '100%',
                borderRadius: '999px',
                background: 'rgba(148, 163, 184, 0.18)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: '64%',
                  height: '100%',
                  background: `linear-gradient(90deg, ${k.accent}, transparent)`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '22px',
        }}
      >
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.86)',
            borderRadius: '24px',
            padding: '22px',
            border: '1px solid rgba(148, 163, 184, 0.18)',
            boxShadow: '0 24px 60px rgba(0,0,0,0.34)',
            overflowX: 'auto',
          }}
        >
          <h3 style={{ color: '#f8fafc', marginTop: 0 }}>
            Top 3 Critical SKUs
          </h3>

          <p style={{ color: '#94a3b8' }}>
            Click SKU to open Disruptions Center
          </p>

          <table
            style={{
              width: '100%',
              minWidth: '700px',
              borderCollapse: 'collapse',
              marginTop: '16px',
              overflow: 'hidden',
              borderRadius: '16px',
            }}
          >
            <thead>
              <tr
                style={{
                  background: 'linear-gradient(90deg, #0f172a, #1d4ed8)',
                }}
              >
                {['SKU', 'Name', 'Days of Cover', 'Stock'].map(h => (
                  <th
                    key={h}
                    style={{
                      padding: '14px',
                      color: '#f8fafc',
                      textAlign: 'left',
                      fontSize: '12px',
                      letterSpacing: '0.7px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {summary.top_3_critical?.slice(0, 3).map((sku, i) => (
                <tr
                  key={sku.sku_name || sku.sku}
                  onClick={() => alert('Please open Disruptions Center from sidebar')}
                  style={{
                    background:
                      i % 2 === 0
                        ? 'rgba(30, 41, 59, 0.88)'
                        : 'rgba(15, 23, 42, 0.92)',
                    cursor: 'pointer',
                    borderBottom: '1px solid rgba(148, 163, 184, 0.12)',
                  }}
                >
                  <td
                    style={{
                      padding: '14px',
                      fontWeight: 900,
                      color: '#60a5fa',
                    }}
                  >
                    {sku.sku_name || sku.sku}
                  </td>

                  <td style={{ padding: '14px', color: '#cbd5e1' }}>
                    {sku.sku_name || sku.name}
                  </td>

                  <td
                    style={{
                      padding: '14px',
                      color: '#f87171',
                      fontWeight: 900,
                    }}
                  >
                    {sku.days_of_cover} days
                  </td>

                  <td style={{ padding: '14px', color: '#e5e7eb' }}>
                    {sku.stock ||
                      sku.closing_stock_units ||
                      sku.current_stock ||
                      sku.stock_units ||
                      '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div
          style={{
            background: 'rgba(15, 23, 42, 0.86)',
            borderRadius: '24px',
            padding: '24px',
            border: '1px solid rgba(148, 163, 184, 0.18)',
            boxShadow: '0 24px 60px rgba(0,0,0,0.34)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              right: '-30px',
              top: '-30px',
              width: '130px',
              height: '130px',
              borderRadius: '50%',
              background: 'rgba(34, 197, 94, 0.20)',
              filter: 'blur(6px)',
            }}
          />

          <h3 style={{ color: '#f8fafc', marginTop: 0 }}>
            Forecast Accuracy
          </h3>

          <p style={{ color: '#94a3b8' }}>Average MAPE</p>

          <h1
            style={{
              color: '#22c55e',
              marginTop: '20px',
              fontSize: '46px',
              letterSpacing: '-1.5px',
            }}
          >
            {forecast?.avg_mape}%
          </h1>

          <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>
            Lower MAPE means better forecast accuracy.
          </p>

          <div
            style={{
              marginTop: '22px',
              padding: '14px',
              borderRadius: '16px',
              background: 'rgba(34, 197, 94, 0.10)',
              border: '1px solid rgba(34, 197, 94, 0.22)',
              color: '#bbf7d0',
              fontWeight: 800,
            }}
          >
            AI forecast validation active
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard