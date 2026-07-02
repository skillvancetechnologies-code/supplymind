import { useState, useEffect } from 'react'
import { DISRUPTION_API, RESPONSE_PLAN_API, USE_MOCK } from '../api/config'
import { mockPlans } from '../mocks/mockData'

const urgencyColor = (urgency = '') => {
  const u = urgency.toLowerCase()
  if (u === 'critical') return '#EF4444'
  if (u === 'warning') return '#F59E0B'
  return '#22C55E'
}

const Disruptions = () => {
  const [disruptions, setDisruptions] = useState([
    {
      sku_name: 'Electronics Component 64',
      category: 'Electronics',
      days_of_cover: 1.4,
      urgency: 'Critical',
      closing_stock_units: 45
    },
    {
      sku_name: 'Packaging Component 12',
      category: 'Packaging',
      days_of_cover: 6.2,
      urgency: 'Warning',
      closing_stock_units: 980
    },
    {
      sku_name: 'Mechanical Component 31',
      category: 'Mechanical',
      days_of_cover: 2.1,
      urgency: 'Critical',
      closing_stock_units: 320
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

      if (USE_MOCK) {
        const mock = mockPlans[item.sku_name] || {
          summary: `${item.sku_name} disruption detected. Backend response plan unavailable.`,
          actions: [
            'Review current stock level',
            'Contact supplier immediately',
            'Prepare alternate procurement option'
          ],
          alternateSupplier: 'Backup supplier required',
          reorderQuantity: item.closing_stock_units || 500,
          checklist: [
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

      const response = await fetch(RESPONSE_PLAN_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
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

      const mock = mockPlans[item.sku_name] || {
        summary: `${item.sku_name} disruption detected. Backend response plan unavailable.`,
        actions: [
          'Review current stock level',
          'Contact supplier immediately',
          'Prepare alternate procurement option'
        ],
        alternateSupplier: 'Backup supplier required',
        reorderQuantity: item.closing_stock_units || 500,
        checklist: [
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
const rawPlanText = responsePlan.replace(/\*\*/g, "").trim();

const headings = [
  "Situation Summary",
  "Immediate Actions",
  "Alternate Supplier Recommendation",
  "Alternate Supplier",
  "Recommended Reorder Quantity",
  "Reorder Quantity",
  "Monitoring Checklist",
];

const extractSection = (title) => {
  const otherHeadings = headings.filter((h) => h !== title).join("|");

  const regex = new RegExp(
    `${title}:?\\s*([\\s\\S]*?)(?=\\n\\s*(${otherHeadings}):?|$)`,
    "i"
  );

  return rawPlanText.match(regex)?.[1]?.trim() || "";
};

const reorderQuantity =
  responsePlan.match(/Recommended Reorder Quantity:\s*([\d,]+)/i)?.[1] ||
  responsePlan.match(/Reorder Quantity[\s\S]*?(\d[\d,]*)/i)?.[1] ||
  "-";

const planSections = [
  {
    title: "Situation Summary",
    content: extractSection("Situation Summary"),
  },
  {
    title: "Immediate Actions",
    content: extractSection("Immediate Actions"),
  },
  {
    title: "Alternate Supplier Recommendation",
    content:
      extractSection("Alternate Supplier Recommendation") ||
      extractSection("Alternate Supplier"),
  },
  {
    title: "Monitoring Checklist",
    content: extractSection("Monitoring Checklist"),
  },
];
  return (
    <div
      style={{
        padding: '34px',
        flex: 1,
        minHeight: '100vh',
        color: '#e5e7eb',
        background: 'linear-gradient(135deg, #020617 0%, #07111f 45%, #020617 100%)',
      }}
    >
      <h1
        style={{
          fontSize: '42px',
          fontWeight: 900,
          margin: 0,
          color: '#f8fafc',
          textShadow:
            '0 0 12px rgba(96,165,250,.55), 0 0 35px rgba(37,99,235,.35)',
        }}
      >
        Disruptions Center
      </h1>

      <p
        style={{
          color: '#94a3b8',
          marginTop: '10px',
          marginBottom: '28px',
          fontSize: '15px',
        }}
      >
        AI-powered disruption monitoring and response planning
      </p>

      <div
        style={{
          background: 'rgba(15,23,42,.86)',
          borderRadius: '22px',
          padding: '22px',
          border: '1px solid rgba(148,163,184,.18)',
          boxShadow: '0 24px 60px rgba(0,0,0,.34)',
          overflowX: window.innerWidth <= 768 ? 'auto' : 'visible',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <h3
          style={{
            marginTop: 0,
            marginBottom: '20px',
            color: '#f8fafc',
          }}
        >
          At-Risk SKUs
        </h3>

        <table
          style={{
            width: window.innerWidth <= 768 ? '850px' : '100%',
            minWidth: window.innerWidth <= 768 ? '850px' : '100%',
            borderCollapse: 'collapse',
            background: '#111827',
            borderRadius: '16px',
            overflow: 'hidden',
          }}
        >
          <thead>
            <tr
              style={{
                background: 'linear-gradient(90deg,#7F1D1D,#2563EB)',
              }}
            >
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
                    padding: '14px',
                    color: '#f8fafc',
                    textAlign: 'left',
                    fontSize: '12px',
                    letterSpacing: '.7px',
                    textTransform: 'uppercase',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {disruptions.map((item, i) => (
              <tr
                key={i}
                style={{
                  background: i % 2 === 0 ? '#1E293B' : '#111827',
                  transition: 'all .25s ease',
                  borderBottom: '1px solid rgba(255,255,255,.05)',
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = '#273549')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background =
                    i % 2 === 0 ? '#1E293B' : '#111827')
                }
              >
                <td style={{ padding: '14px', color: '#E2E8F0', fontWeight: 800 }}>
                  {item.sku_name}
                </td>

                <td style={{ padding: '14px', color: '#CBD5E1' }}>
                  {item.category}
                </td>

                <td style={{ padding: '14px', color: '#CBD5E1' }}>
                  {item.days_of_cover} days
                </td>

                <td style={{ padding: '14px' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '6px 14px',
                      borderRadius: '999px',
                      fontSize: '12px',
                      fontWeight: 900,
                      textTransform: 'uppercase',
                      background:
                        item.urgency === 'Critical'
                          ? 'rgba(239,68,68,.15)'
                          : 'rgba(245,158,11,.15)',
                      color: urgencyColor(item.urgency),
                      border: `1px solid ${urgencyColor(item.urgency)}`,
                    }}
                  >
                    {item.urgency}
                  </span>
                </td>

                <td style={{ padding: '14px' }}>
                  <button
                    onClick={() => generatePlan(item)}
                    style={{
                      background: 'linear-gradient(135deg,#2563EB,#1E3A8A)',
                      color: 'white',
                      border: '1px solid rgba(96,165,250,.35)',
                      padding: '9px 14px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontWeight: 900,
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
  <div
    style={{
      marginTop: "32px",
      background: "rgba(15,23,42,.92)",
      borderRadius: "24px",
      border: "1px solid rgba(148,163,184,.18)",
      boxShadow: "0 24px 60px rgba(0,0,0,.34)",
      overflow: "hidden",
    }}
  >
    <div
      style={{
        padding: "26px 30px",
        borderBottom: "1px solid rgba(148,163,184,.18)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "20px",
        flexWrap: "wrap",
        background: "linear-gradient(135deg,#0F172A,#111827)",
      }}
    >
      <div>
        <h2 style={{ margin: 0, color: "#F8FAFC", fontSize: "28px", fontWeight: 900 }}>
          AI Response Plan
        </h2>
        <p style={{ margin: "8px 0 0", color: "#94A3B8", fontSize: "14px" }}>
          Live response generated from backend data
        </p>
      </div>

      <div
        style={{
          background: "rgba(37,99,235,.18)",
          border: "1px solid rgba(96,165,250,.35)",
          borderRadius: "18px",
          padding: "14px 24px",
          minWidth: "190px",
          textAlign: "center",
        }}
      >
        <div style={{ color: "#93C5FD", fontSize: "12px", fontWeight: 900 }}>
          REORDER QUANTITY
        </div>
        <div style={{ color: "#60A5FA", fontSize: "38px", fontWeight: 900 }}>
          {reorderQuantity}
        </div>
      </div>
    </div>

    <div style={{ padding: "30px", background: "#0F172A" }}>
      {planSections.map((section, index) => (
        <div
          key={section.title}
          style={{
            background: "#1E293B",
            border: "1px solid rgba(148,163,184,.16)",
            borderRadius: "18px",
            padding: "24px",
            marginBottom: index === planSections.length - 1 ? 0 : "20px",
          }}
        >
          <h3
            style={{
              margin: "0 0 14px",
              color: "#F8FAFC",
              fontSize: "18px",
              fontWeight: 900,
              borderBottom: "1px solid rgba(148,163,184,.16)",
              paddingBottom: "10px",
            }}
          >
            {section.title}
          </h3>

          <div
            style={{
              color: "#CBD5E1",
              fontSize: "15px",
              lineHeight: "1.9",
              whiteSpace: "pre-wrap",
            }}
          >
            {section.content || "Not provided by backend."}
          </div>
        </div>
      ))}
    </div>
  </div>
)}
    </div>
  )
}

export default Disruptions