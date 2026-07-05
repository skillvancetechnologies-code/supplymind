import { useState, useEffect } from 'react'
import { FORECAST_API } from '../api/config'
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
    color: "#F8FAFC",
    textShadow:
      "0 0 12px rgba(96,165,250,.55),0 0 35px rgba(37,99,235,.35)",
  }}
>
  Forecast Center
</h1>
     <p
  style={{
    color: "#94A3B8",
    marginTop: "10px",
    marginBottom: "28px",
    fontSize: "15px",
  }}
>
        AI-powered demand forecasting 
      </p>

      <div style={{
        background:"rgba(15,23,42,.88)",
padding:"24px",
borderRadius:"22px",
border:"1px solid rgba(148,163,184,.18)",
boxShadow:"0 24px 60px rgba(0,0,0,.34)"
      }}>

        <h3 style={{  color:"#F8FAFC"}}>
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
          background:"#111827"
        }}>
          <thead>
            <tr style={{
             background:"linear-gradient(90deg,#1E3A8A,#2563EB)"
          
            }}>
              <th style={{ padding:"14px",
textTransform:"uppercase",
letterSpacing:".7px",
fontSize:"12px" }}>SKU ID</th>
              <th style={{ padding:"14px",
textTransform:"uppercase",
letterSpacing:".7px",
fontSize:"12px" }}>Predicted Demand</th>
              <th style={{ padding:"14px",
textTransform:"uppercase",
letterSpacing:".7px",
fontSize:"12px" }}>Confidence</th>
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
                 background:
selectedForecast?.sku_id===item.sku_id
? "#1D4ED8"
: "#111827",
                }}
              >
                <td style={{
padding:"14px",
textAlign:"center",
color:"#E2E8F0",
borderBottom:"1px solid rgba(255,255,255,.05)"
}}>
                  {item.sku_id}
                </td>

                <td style={{
padding:"14px",
textAlign:"center",
color:"#E2E8F0",
borderBottom:"1px solid rgba(255,255,255,.05)"
}}>
                  {item.predicted_demand}
                </td>

                <td style={{
padding:"14px",
textAlign:"center",
color:"#E2E8F0",
borderBottom:"1px solid rgba(255,255,255,.05)"
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
          background:"#111827",
            padding:'24px',
            borderRadius:'12px',
            border:"1px solid rgba(148,163,184,.18)"
          }}>

            <h3 style={{  color:"#F8FAFC"}}>
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
                 fill="#3B82F6"
fillOpacity={0.12}
                  
                  name="Confidence band"
                />

                <ReferenceLine
                  y={Number(selectedForecast.predicted_demand)}
                  stroke="#EF4444"
                  strokeDasharray="5 5"
                  label="Average Demand"
                />

              <Line
stroke="#60A5FA"
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

export default Forecasts
