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

export default Forecasts
