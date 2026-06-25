import { useState, useEffect } from 'react'
import {
  mockInventorySummary
} from '../mocks/mockData'
import { INVENTORY_API, FORECAST_ACCURACY_API } from '../api/config'


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

export default Dashboard
