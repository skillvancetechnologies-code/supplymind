import { useState, useEffect } from 'react'
import './App.css'
import {
  BrowserRouter,
  Routes,
  Route,
  Link
} from 'react-router-dom'
import SupplierDetail
from './pages/SupplierDetail'
import {
  mockPlans,
  mockInventorySummary,
  mockSuppliers
} from './mocks/mockData'
import {
  USE_MOCK,
  RESPONSE_PLAN_API,
  FORECAST_API,
  INVENTORY_API,
  FORECAST_ACCURACY_API,
  SUPPLIER_API,
  DISRUPTION_API
} from './api/config'
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts'

/* =========================
   INVENTORY DATA
========================= */

const inventoryData = [
  {
    sku:'SKU-00064',
    name:'Electronics Component 64',
    category:'Electronics',
    stock:45,
    doc:1.4,
    status:'Critical'
  },
  {
    sku:'SKU-00123',
    name:'Packaging Component 12',
    category:'Packaging',
    stock:980,
    doc:6.2,
    status:'Warning'
  },
  {
    sku:'SKU-00201',
    name:'Raw Materials Component 20',
    category:'Raw Materials',
    stock:5200,
    doc:18.5,
    status:'Healthy'
  },
  {
    sku:'SKU-00312',
    name:'Mechanical Component 31',
    category:'Mechanical',
    stock:320,
    doc:2.1,
    status:'Critical'
  },
]

const statusColor = (s) =>
  s === 'Critical'
    ? '#C53030'
    : s === 'Warning'
    ? '#B7791F'
    : '#1A6B3A'

/* =========================
   DASHBOARD
========================= */

const Dashboard = () => {

  const [summary, setSummary] = useState(mockInventorySummary)

  const [forecast, setForecast] = useState(
    mockInventorySummary.forecast_accuracy
  )

  const [summaryStatus, setSummaryStatus] = useState('loading')

  useEffect(() => {

    // Inventory Summary API
     
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

    // Forecast Accuracy API
 
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
      label:'Total SKUs Tracked',
      value:summary.total_skus_tracked,
      color:'#1B2A4A'
    },
    {
      label:'Critical SKUs',
      value:summary.critical_skus,
      color:'#C53030'
    },
    {
      label:'Total Inventory Value',
      value:`₹${summary.total_inventory_value?.toLocaleString()}`,
      color:'#1A6B3A'
    },
    {
      label:'Average Days of Cover',
      value:summary.avg_days_of_cover,
      color:'#B7791F'
    }
  ]

  return (
    <div style={{
      padding:'40px',
      flex:1,
      background:'#F4F6F9',
      minHeight:'100vh'
    }}>

      <h2 style={{color:'#1B2A4A'}}>
        Command Center
      </h2>

     <p style={{
  color:'#4A5568',
  marginBottom:'30px'
}}>
  {summaryStatus === 'live'
  ? 'Live inventory summary '
  : summaryStatus === 'mock'
  ? 'Showing mock inventory data'
  : 'Loading inventory summary...'}
</p>
      {/* KPI Cards */}

      <div style={{
        display:'flex',
        gap:'16px',
        flexWrap:'wrap',
        marginBottom:'30px'
      }}>

        {kpis.map(k => (
          <div
            key={k.label}
            style={{
              background:'white',
              padding:'20px',
              borderRadius:'8px',
              minWidth:'200px',
              flex:'1',
              boxShadow:'0 2px 4px rgba(0,0,0,0.1)'
            }}
          >

            <p style={{
              color:'#4A5568',
              fontSize:'13px'
            }}>
              {k.label}
            </p>

            <h2 style={{
              color:k.color,
              margin:0
            }}>
              {k.value}
            </h2>

          </div>
        ))}

      </div>

      {/* Widgets */}

      <div style={{
        display:'grid',
        gridTemplateColumns:'2fr 1fr',
        gap:'20px'
      }}>

        {/* Top Critical SKUs */}

        <div style={{
          background:'white',
          borderRadius:'8px',
          padding:'20px',
          boxShadow:'0 2px 4px rgba(0,0,0,0.1)'
        }}>

          <h3 style={{
            color:'#1B2A4A'
          }}>
            Top 3 Critical SKUs
          </h3>

          <p style={{
            color:'#4A5568'
          }}>
            Click SKU to open Disruptions Center
          </p>

          <table style={{
            width:'100%',
            borderCollapse:'collapse',
            marginTop:'16px'
          }}>

            <thead>
              <tr style={{
                background:'#1B2A4A'
              }}>

                {[
                  'SKU',
                  'Name',
                  'Days of Cover',
                  'Stock'
                ].map(h => (
                  <th
                    key={h}
                    style={{
                      padding:'12px',
                      color:'white',
                      textAlign:'left'
                    }}
                  >
                    {h}
                  </th>
                ))}

              </tr>
            </thead>

            <tbody>

              {summary.top_3_critical?.slice(0,3).map((sku,i) => (
                <tr
                  key={sku.sku_name || sku.sku}
                  onClick={() => alert('Please open Disruptions Center from sidebar')}
                  style={{
                    background:i%2===0 ? '#F4F6F9' : 'white',
                    cursor:'pointer'
                  }}
                >

                  <td style={{
                    padding:'10px',
                    fontWeight:'bold',
                    color:'#1B2A4A'
                  }}>
                    {sku.sku_name || sku.sku}
                  </td>

                  <td style={{padding:'10px'}}>
                    {sku.sku_name || sku.name}
                  </td>

                  <td style={{
                    padding:'10px',
                    color:'#C53030',
                    fontWeight:'bold'
                  }}>
                    {sku.days_of_cover} days
                  </td>

                 <td style={{
  padding:'10px'
}}>
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

        {/* Forecast Accuracy */}

        <div style={{
          background:'white',
          borderRadius:'8px',
          padding:'20px',
          boxShadow:'0 2px 4px rgba(0,0,0,0.1)'
        }}>

          <h3 style={{
            color:'#1B2A4A'
          }}>
            Forecast Accuracy
          </h3>

          <p style={{
            color:'#4A5568'
          }}>
            Average MAPE
          </p>

          <h1 style={{
            color:'#1A6B3A',
            marginTop:'20px'
          }}>
            {forecast?.avg_mape}%
          </h1>

          <p style={{
            color:'#4A5568'
          }}>
            Lower MAPE means better forecast accuracy.
          </p>

        </div>

      </div>

    </div>
  )
}


/* =========================
   INVENTORY PAGE
========================= */

const Inventory = () => (
  <div style={{
    padding:'40px',
    flex:1
  }}>

    <h2 style={{
      color:'#1B2A4A'
    }}>
      Inventory Positions
    </h2>

    <table style={{
      width:'100%',
      borderCollapse:'collapse',
      marginTop:'20px',
      background:'white',
      borderRadius:'8px',
      overflow:'hidden',
      boxShadow:'0 2px 4px rgba(0,0,0,0.1)'
    }}>

      <thead>
        <tr style={{
          background:'#1B2A4A'
        }}>
          {['SKU ID','Product','Category','Stock','Days of Cover','Status'].map(h => (
            <th
              key={h}
              style={{
                padding:'12px',
                color:'white',
                textAlign:'left'
              }}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {inventoryData.map((r,i) => (
          <tr
            key={r.sku}
            style={{
              background:i%2===0 ? '#F4F6F9' : 'white'
            }}
          >

            <td style={{padding:'10px'}}>{r.sku}</td>
            <td style={{padding:'10px'}}>{r.name}</td>
            <td style={{padding:'10px'}}>{r.category}</td>
            <td style={{padding:'10px'}}>{r.stock}</td>
            <td style={{padding:'10px'}}>{r.doc} days</td>

            <td style={{
              padding:'10px',
              fontWeight:'bold',
              color:statusColor(r.status)
            }}>
              {r.status}
            </td>

          </tr>
        ))}
      </tbody>

    </table>
  </div>
)

/* =========================
   SUPPLIERS PAGE
========================= */

const rc = (r) =>
  r==='Low'
    ? '#1A6B3A'
    : r==='Medium'
    ? '#B7791F'
    : '#C53030'

const tc = (t = '') =>
  t === 'Improving'
    ? '#1A6B3A'
    : t === 'Declining'
    ? '#C53030'
    : '#B7791F'

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
const suppliersPerPage = 30

  useEffect(() => {
    fetch(SUPPLIER_API)
      .then(r => r.json())
      .then(data => {
        console.log('Pavan supplier API response:', data)

        const supplierList =
          Array.isArray(data)
            ? data
            : data.supplier_risks ||
              data.suppliers ||
              data.data ||
              data.results ||
              []

        console.log('Actual supplier list:', supplierList)
        console.log('First supplier object:', supplierList[0])
        console.log('First 5 suppliers:', supplierList.slice(0, 5))
        

        const fixedSuppliers = supplierList.map((s) => {
          const riskScore = Number(
            s.risk_score ??
            s.supplier_risk_score ??
            s.score ??
            0
          )

          const otifValue =
            s.current_otif ??
            s.otif ??
            s.otif_percent ??
            s.otif_percentage ??
            s.otif_pct ??
            s.avg_otif ??
            s.current_otif_percentage ??
            '-'

          const riskValue =
            s.risk_tier ??
            s.risk_level ??
            s.risk ??
            (riskScore >= 70 ? 'High' : riskScore >= 40 ? 'Medium' : 'Low')

          const trendValue =
            s.trend ??
            s.performance_trend ??
            s.risk_trend ??
            (riskScore >= 70 ? 'Declining' : riskScore >= 40 ? 'Watch' : 'Stable')

          return {
            supplier_id: s.supplier_id,
            name: s.supplier_name || s.name || s.supplier_id || '-',
            city: s.city || s.supplier_city || '-',
            tier: s.city_tier || s.tier || '-',
           current_otif: otifValue,
           risk_tier: riskValue,
            trend: trendValue,
            risk_score: riskScore
          }
        })

        setSuppliers(fixedSuppliers)
      })
      .catch(error => {
  console.log('Supplier API error. Using mock suppliers:', error)

  const fixedMockSuppliers = mockSuppliers.map(s => ({
    supplier_id: s.id || s.supplier_id,
    name: s.name || s.id,
    city: s.city || '-',
    tier: s.tier || '-',
    current_otif: s.otif ?? '-',
    risk_tier: s.risk || 'Low',
    trend: s.trend || 'Stable',
    risk_score:
      s.risk === 'High'
        ? 80
        : s.risk === 'Medium'
        ? 50
        : 25
  }))

  setSuppliers(fixedMockSuppliers)
})
  }, [])
  const sortedSuppliers = [...suppliers].sort((a, b) => {
  const numA = Number(a.supplier_id.replace('SUP-', ''))
  const numB = Number(b.supplier_id.replace('SUP-', ''))
  return numA - numB
})

const totalPages = Math.ceil(sortedSuppliers.length / suppliersPerPage)

const startIndex = (currentPage - 1) * suppliersPerPage
const endIndex = startIndex + suppliersPerPage

const currentSuppliers = sortedSuppliers.slice(startIndex, endIndex)

  return (
    <div style={{
      padding:'40px',
      flex:1
    }}>

      <h2 style={{
        color:'#1B2A4A'
      }}>
        Supplier Scoreboard
      </h2>

      <p style={{
        color:'#4A5568',
        marginBottom:'20px'
      }}>
       Sorted by supplier ID — Ascending order
      </p>

      <table style={{
        width:'100%',
        borderCollapse:'collapse',
         tableLayout:'fixed',
        background:'white',
        borderRadius:'8px',
        overflow:'hidden',
        boxShadow:'0 2px 4px rgba(0,0,0,0.1)'
       
      }}>

        <thead>
          <tr style={{
            background:'#1B2A4A'
          }}>
            {[
              'Supplier',
              'City',
              'Tier',
              'OTIF %',
              'Risk',
              'Trend',
              'Details'
            ].map(h => (
              <th
                key={h}
                style={{
                 
                  padding:'12px',
                  color:'white',
                  textAlign:'left'
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
       {currentSuppliers.map((s, i) => (
            <tr
              key={s.supplier_id || i}
              style={{
                height:'56px',
                background:i%2===0 ? '#F4F6F9' : 'white'
              }}
            >

              <td style={{padding:'10px',
                verticalAlign:'middle'
              }}>
                <Link
                  to={`/suppliers/${s.supplier_id}`}
                  style={{
                    color:'#1B2A4A',
                    textDecoration:'none',
                    fontWeight:'bold'
                  }}
                >
                  {s.supplier_id}
                </Link>
              </td>

              <td style={{padding:'10px'}}>
                {s.city}
              </td>

              <td style={{padding:'10px'}}>
                {s.tier}
              </td>

              <td style={{padding:'10px'}}>
                {s.current_otif !== '-' ? `${s.current_otif}%` : '-'}
              </td>

              <td style={{
                padding:'10px',
                fontWeight:'bold',
                color: rc(s.risk_tier)
              }}>
                {s.risk_tier}
              </td>

              <td style={{
                padding:'10px',
                fontWeight:'bold',
                color:tc(s.trend)
              }}>
                {s.trend}
              </td>

              <td style={{padding:'10px'}}>
                <Link
                  to={`/suppliers/${s.supplier_id}`}
                  style={{
                    color:'#1B2A4A',
                    fontWeight:'bold',
                    textDecoration:'none'
                  }}
                >
                  View Details
                </Link>
              </td>

            </tr>
          ))}
        </tbody>

      </table>
      <div style={{
  display:'flex',
  justifyContent:'center',
  alignItems:'center',
  gap:'16px',
  marginTop:'24px'
}}>
  <button
    onClick={() => setCurrentPage(currentPage - 1)}
    disabled={currentPage === 1}
  >
    Previous
  </button>

  <span>
    Showing {startIndex + 1} - {Math.min(endIndex, sortedSuppliers.length)} of {sortedSuppliers.length}
  </span>

  <button
    onClick={() => setCurrentPage(currentPage + 1)}
    disabled={currentPage === totalPages}
  >
    Next
  </button>
</div>

    </div>
  )
}
/* =========================
   FORECAST PAGE
========================= */
const Forecasts = () => {
  const [forecastStatus, setForecastStatus] = useState('idle')
  const [allForecasts, setAllForecasts] = useState([])
  const [selectedForecast, setSelectedForecast] = useState(null)

  const forecastDays = 30

  useEffect(() => {
    const rahulSkus = [
  'SKU-00201',
  'SKU-00278',
  'SKU-00477',
  'SKU-00064',
  'SKU-00463',
  'SKU-00216',
  'SKU-00269',
  'SKU-00247',
  'SKU-00474',
  'SKU-00377'
]
    setForecastStatus('loading')

    Promise.all(
      rahulSkus.map(sku =>
        fetch(FORECAST_API, {
          method:'POST',
          headers:{
            'Content-Type':'application/json'
          },
          body:JSON.stringify({
            sku_id: sku,
            forecast_days: Number(forecastDays)
          })
        })
          .then(r => r.json())
          .then(data => {
            console.log('Rahul Forecast API:', sku, data)

            const demands = data.predicted_demand || []

            const avgDemand =
              demands.length > 0
                ? demands.reduce((sum, value) => sum + value, 0) / demands.length
                : 0

            const minDemand = demands.length > 0 ? Math.min(...demands) : 0
            const maxDemand = demands.length > 0 ? Math.max(...demands) : 0

            return {
              sku_id: sku,
              predicted_demand: avgDemand.toFixed(1),
              confidence: `${Math.round(minDemand)} - ${Math.round(maxDemand)}`,
              minDemand: Math.round(minDemand),
              maxDemand: Math.round(maxDemand),
              demand_values: demands
            }
          })
      )
    )
      .then(results => {
        setAllForecasts(results)
        setSelectedForecast(results[0])
        setForecastStatus('live')
      })
     .catch(error => {
  console.log('Forecast API error. Using mock forecast data:', error)

  const mockForecasts = rahulSkus.map((sku, index) => {
    const base = 120 + index * 18
    const demands = Array.from({ length: 30 }, (_, day) =>
      base + Math.round(Math.sin(day / 3) * 12) + day
    )

    const avgDemand =
      demands.reduce((sum, value) => sum + value, 0) / demands.length

    const minDemand = Math.min(...demands)
    const maxDemand = Math.max(...demands)

    return {
      sku_id: sku,
      predicted_demand: avgDemand.toFixed(1),
      confidence: `${minDemand} - ${maxDemand}`,
      minDemand,
      maxDemand,
      demand_values: demands
    }
  })

  setAllForecasts(mockForecasts)
  setSelectedForecast(mockForecasts[0])
  setForecastStatus('mock')
})
  }, [])

  return (
    <div style={{
      padding:'40px',
      flex:1,
      background:'#F4F6F9',
      minHeight:'100vh'
    }}>

      <h2 style={{ color:'#1B2A4A' }}>
        Forecast Center
      </h2>

      <p style={{ color:'#4A5568' }}>
        AI-powered demand forecasting 
      </p>

      <div style={{
        background:'white',
        padding:'24px',
        borderRadius:'10px',
        boxShadow:'0 2px 4px rgba(0,0,0,0.1)'
      }}>

        <h3 style={{ color:'#1B2A4A' }}>
          Forecast Output
        </h3>

        <p style={{
          color:'#1A6B3A',
          fontWeight:'bold'
        }}>
         {forecastStatus === 'live'
  ? 'Live forecast generated'
  : forecastStatus === 'mock'
  ? 'Showing mock forecast data'
  : 'Loading forecast data...'}
        </p>

        <table style={{
          width:'100%',
          borderCollapse:'collapse',
          background:'white'
        }}>
          <thead>
            <tr style={{
              background:'#1B2A4A',
              color:'white'
            }}>
              <th style={{ padding:'12px' }}>SKU ID</th>
              <th style={{ padding:'12px' }}>Predicted Demand</th>
              <th style={{ padding:'12px' }}>Confidence</th>
            </tr>
          </thead>

          <tbody>
            {allForecasts.map(item => (
              <tr
                key={item.sku_id}
                onClick={() => setSelectedForecast(item)}
                style={{
                  cursor:'pointer',
                  borderBottom:'1px solid #E2E8F0',
                  background:selectedForecast?.sku_id === item.sku_id
                    ? '#E8F0FE'
                    : 'white'
                }}
              >
                <td style={{
                  padding:'12px',
                  textAlign:'center',
                  fontWeight:'bold'
                }}>
                  {item.sku_id}
                </td>

                <td style={{
                  padding:'12px',
                  textAlign:'center',
                  fontWeight:'bold'
                }}>
                  {item.predicted_demand}
                </td>

                <td style={{
                  padding:'12px',
                  textAlign:'center',
                  color:'#1A6B3A',
                  fontWeight:'bold'
                }}>
                  {item.confidence}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {selectedForecast && (
          <div style={{
            marginTop:'30px',
            background:'#F8FAFC',
            padding:'24px',
            borderRadius:'12px',
            border:'1px solid #E2E8F0'
          }}>

            <h3 style={{ color:'#1B2A4A' }}>
              30-Day Forecast — {selectedForecast.sku_id}
            </h3>

            <p>
              <b>Average Predicted Demand:</b> {selectedForecast.predicted_demand}
            </p>

            <p>
              <b>Confidence Interval:</b>{' '}
              Minimum expected demand = {selectedForecast.minDemand},{' '}
              Maximum expected demand = {selectedForecast.maxDemand}
            </p>

            <ResponsiveContainer width="100%" height={320}>
              <AreaChart
                data={selectedForecast.demand_values.map((value, index) => ({
                  day: `Day ${index + 1}`,
                  demand: Math.max(0, Number(value.toFixed(1))),
                  confidenceRange: [
                    Math.max(0, selectedForecast.minDemand),
                    selectedForecast.maxDemand
                  ]
                }))}
              >
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />

                <Area
                  type="monotone"
                  dataKey="confidenceRange"
                  stroke="none"
                  fill="#CBD5E1"
                  fillOpacity={0.35}
                  name="Confidence band"
                />

                <ReferenceLine
                  y={Number(selectedForecast.predicted_demand)}
                  stroke="red"
                  strokeDasharray="5 5"
                  label="Average Demand"
                />

                <Line
                  type="monotone"
                  dataKey="demand"
                  strokeWidth={3}
                  dot={false}
                  name="Daily predicted demand"
                />
              </AreaChart>
            </ResponsiveContainer>

          </div>
        )}

      </div>
    </div>
  )
}

/* =========================
   DISRUPTIONS PAGE
========================= */

const Disruptions = () => {

  const [disruptions, setDisruptions] = useState([
    {
      sku_name:'Electronics Component 64',
      category:'Electronics',
      days_of_cover:1.4,
      urgency:'Critical',
      closing_stock_units:45
    },
    {
      sku_name:'Packaging Component 12',
      category:'Packaging',
      days_of_cover:6.2,
      urgency:'Warning',
      closing_stock_units:980
    },
    {
      sku_name:'Mechanical Component 31',
      category:'Mechanical',
      days_of_cover:2.1,
      urgency:'Critical',
      closing_stock_units:320
    },
  ])

  const [responsePlan, setResponsePlan] = useState('')



  useEffect(() => {

  fetch(DISRUPTION_API)
    .then(r => r.json())
    .then(data => setDisruptions(data))
    .catch(error => {
      console.log('Disruption API error:', error)
      console.log('Using mock data')
    })

}, [])
    
  const generatePlan = async (item) => {
    console.log("Sending to Karthi:", item)
  try {

    setResponsePlan('Loading response plan...')

    // FORCE MOCK MODE
    if (USE_MOCK) {
const mock = mockPlans[item.sku_name] || {
  summary:`${item.sku_name} disruption detected. Backend response plan unavailable.`,
  actions:[
    'Review current stock level',
    'Contact supplier immediately',
    'Prepare alternate procurement option'
  ],
  alternateSupplier:'Backup supplier required',
  reorderQuantity:item.closing_stock_units || 500,
  checklist:[
    'Monitor inventory daily',
    'Track supplier update',
    'Escalate if stock risk increases'
  ]
}
      

      setResponsePlan(`
Situation Summary:
${mock.summary}

Immediate Actions:
${mock.actions.join('\n')}

Alternate Supplier:
${mock.alternateSupplier}

Recommended Reorder Quantity:
${mock.reorderQuantity}

Monitoring Checklist:
${mock.checklist.join('\n')}
      `)

      return
    }

    // REAL API CALL
    const response = await fetch(RESPONSE_PLAN_API, {
      method:'POST',
    headers:{
  'Content-Type':'application/json'
},
body: JSON.stringify({
  disruption_type: 'Stock Risk',
  sku_name: item.sku_name,
  category: item.category,
  closing_stock_units: Number(item.closing_stock_units || 100),
  daily_consumption_units: Math.round(Number(item.daily_consumption_units || 20)),
  days_of_cover: Number(item.days_of_cover || 0),
  otif_percentage: Number(item.otif_percentage || 70),
  lead_time_days: Math.round(Number(item.lead_time_days || 10)),
  alternate_supplier: item.alternate_supplier || 'Backup Supplier'
})
    })

    // BACKEND FAILURE
    if (!response.ok) {
      throw new Error('Backend failed')
    }

    const data = await response.json()
    console.log('Karthi Live API response:', data)

setResponsePlan(`
${data.plan}

Recommended Reorder Quantity:
${data.reorder_qty}
`)
  } catch (error) {

    console.log('API failed. Using mock fallback.')

    // MOCK FALLBACK
   const mock = mockPlans[item.sku_name] || {
  summary:`${item.sku_name} disruption detected. Backend response plan unavailable.`,
  actions:[
    'Review current stock level',
    'Contact supplier immediately',
    'Prepare alternate procurement option'
  ],
  alternateSupplier:'Backup supplier required',
  reorderQuantity:item.closing_stock_units || 500,
  checklist:[
    'Monitor inventory daily',
    'Track supplier update',
    'Escalate if stock risk increases'
  ]
}

     setResponsePlan(`
Situation Summary:
${mock.summary}

Immediate Actions:
${mock.actions.join('\n')}

Alternate Supplier:
${mock.alternateSupplier}

Recommended Reorder Quantity:
${mock.reorderQuantity}

Monitoring Checklist:
${mock.checklist.join('\n')}
    `)
  }
}

  

  return (
    <div style={{
      padding:'40px',
      flex:1,
      background:'#F4F6F9',
      minHeight:'100vh'
    }}>

      <h2 style={{
        color:'#1B2A4A',
        marginBottom:'10px'
      }}>
        Disruptions Center
      </h2>

      <p style={{
        color:'#4A5568',
        marginBottom:'30px'
      }}>
        AI-powered disruption monitoring and response planning
      </p>

      <div style={{
        background:'white',
        borderRadius:'8px',
        padding:'20px',
        boxShadow:'0 2px 4px rgba(0,0,0,0.1)'
      }}>

        <h3 style={{
          marginBottom:'20px',
          color:'#1B2A4A'
        }}>
          At-Risk SKUs
        </h3>

        <table style={{
          width:'100%',
          borderCollapse:'collapse'
        }}>

          <thead>
            <tr style={{
              background:'#1B2A4A'
            }}>

              {[
                'SKU Name',
                'Category',
                'Days of Cover',
                'Urgency',
                'Action'
              ].map(h => (
                <th
                  key={h}
                  style={{
                    padding:'12px',
                    color:'white',
                    textAlign:'left'
                  }}
                >
                  {h}
                </th>
              ))}

            </tr>
          </thead>

          <tbody>

            {disruptions.map((item,i) => (

              <tr
                key={i}
                style={{
                  background:i%2===0 ? '#F4F6F9' : 'white',
                  borderBottom:'1px solid #E2E8F0'
                }}
              >

                <td style={{padding:'10px'}}>
                  {item.sku_name}
                </td>

                <td style={{padding:'10px'}}>
                  {item.category}
                </td>

                <td style={{padding:'10px'}}>
                  {item.days_of_cover} days
                </td>

                <td
                  style={{
                    padding:'10px',
                    fontWeight:'bold',
                    color:
                      item.urgency === 'Critical'
                        ? '#C53030'
                        : '#B7791F'
                  }}
                >
                  {item.urgency}
                </td>

                <td style={{padding:'10px'}}>

  <button
    onClick={() => generatePlan(item)}
    style={{
      background:'#1B2A4A',
      color:'white',
      border:'none',
      padding:'8px 14px',
      borderRadius:'6px',
      cursor:'pointer'
    }}
  >
    Generate Response Plan
  </button>

</td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

     {responsePlan && (
  <div style={{
    marginTop:'32px',
    background:'#FFFFFF',
    borderRadius:'16px',
    border:'1px solid #E5E7EB',
    boxShadow:'0 10px 28px rgba(15,23,42,0.08)',
    overflow:'hidden'
  }}>

    <div style={{
      padding:'22px 26px',
      borderBottom:'1px solid #E5E7EB',
      display:'flex',
      justifyContent:'space-between',
      alignItems:'center',
      gap:'20px',
      background:'#FFFFFF'
    }}>
      <div>
        <h3 style={{
          margin:0,
          color:'#0F172A',
          fontSize:'22px',
          fontWeight:'800'
        }}>
          AI Response Plan
        </h3>

        <p style={{
          margin:'6px 0 0',
          color:'#64748B',
          fontSize:'14px'
        }}>
          Live response generated from backend data
        </p>
      </div>

      <div style={{
        background:'#F8FAFC',
        border:'1px solid #E2E8F0',
        borderRadius:'14px',
        padding:'12px 18px',
        minWidth:'170px'
      }}>
        <div style={{
          color:'#64748B',
          fontSize:'12px',
          fontWeight:'700'
        }}>
          Reorder Quantity
        </div>

        <div style={{
          color:'#1D4ED8',
          fontSize:'28px',
          fontWeight:'900',
          marginTop:'4px'
        }}>
          {responsePlan.match(/Recommended Reorder Quantity:\s*([\d,]+)/i)?.[1] || '-'}
        </div>
      </div>
    </div>

    <div style={{
      padding:'26px',
      background:'#F8FAFC'
    }}>
      <div style={{
        background:'#FFFFFF',
        border:'1px solid #E2E8F0',
        borderRadius:'14px',
        padding:'24px'
      }}>
        <div
  style={{
    whiteSpace:'pre-wrap',
    fontFamily:'"Segoe UI", Inter, sans-serif',
    lineHeight:'2',
    fontSize:'16px',
    color:'#334155',
    fontWeight:'500'
  }}
>
  {responsePlan
    .replace(/\*\*/g, '')
    .replace(/Situation Summary/g, '📋 Situation Summary')
    .replace(/Immediate Actions/g, '⚡ Immediate Actions')
    .replace(
      /Alternate Supplier Recommendation/g,
      '🤝 Alternate Supplier Recommendation'
    )
    .replace(/Reorder Quantity/g, '📦 Reorder Quantity')
    .replace(/Monitoring Checklist/g, '📊 Monitoring Checklist')
  }
</div>
      </div>
    </div>

  </div>
)}

    </div>
  )
}

/* =========================
   MAIN APP
========================= */

function App() {

  const [sidebarOpen, setSidebarOpen] = useState(true)

  const [page, setPage] = useState('dashboard')
  

  return (
    <BrowserRouter>
    <div style={{
      display:'flex',
      minHeight:'100vh',
      background:'#F4F7FB'
    }}>

      {/* Sidebar */}

      {sidebarOpen && (
        <div style={{
          width:'250px',
          background:'#1B2A4A',
          color:'white',
          padding:'30px 20px'
        }}>

          <h1>
            SupplyMind
          </h1>

          <div style={{
            display:'flex',
            flexDirection:'column',
            gap:'20px',
            marginTop:'50px'
          }}>

            <div
              onClick={() => setPage('dashboard')}
              style={{
                cursor:'pointer',
                fontWeight:'bold'
              }}
            >
              📊 Dashboard
            </div>

            <div
              onClick={() => setPage('inventory')}
              style={{
                cursor:'pointer',
                fontWeight:'bold'
              }}
            >
              📦 Inventory
            </div>

            <div
              onClick={() => setPage('suppliers')}
              style={{
                cursor:'pointer',
                fontWeight:'bold'
              }}
            >
              🏭 Suppliers
            </div>

            <div
              onClick={() => setPage('disruptions')}
              style={{
                cursor:'pointer',
                fontWeight:'bold'
              }}
            >
              ⚠️ Disruptions
            </div>
            <div
  onClick={() => setPage('forecasts')}
  style={{
    cursor:'pointer',
    fontWeight:'bold'
  }}
>
  📈 Forecasts
</div>

          </div>
        </div>
      )}

      {/* Main Content */}

      <div style={{flex:1}}>

        {/* Top Bar */}

        <div style={{
          padding:'20px 30px'
        }}>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              fontSize:'24px',
              background:'none',
              border:'none',
              cursor:'pointer',
              color:'#1B2A4A'
            }}
          >
            ☰
          </button>

        </div>

        {/* Pages */}

       <Routes>

  <Route
    path="/"
    element={
      <>
        {page === 'dashboard' && <Dashboard />}
        {page === 'inventory' && <Inventory />}
        {page === 'suppliers' && <Suppliers />}
        {page === 'disruptions' && <Disruptions />}
        {page === 'forecasts' && <Forecasts />}
      </>
    }
  />

  <Route
    path="/suppliers/:supplier_id"
    element={<SupplierDetail />}
  />

</Routes>           

        


      </div>

    </div>
    </BrowserRouter>
  )
}

export default App