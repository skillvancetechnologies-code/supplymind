import { useState, useEffect } from 'react'
import { DISRUPTION_API, RESPONSE_PLAN_API, USE_MOCK } from '../api/config'
import { mockPlans } from '../mocks/mockData'

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
  .then(data => {
    console.log("Disruption API Response:", data)
    setDisruptions(data)
  })
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

export default Disruptions
