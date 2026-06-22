import { useState, useEffect } from 'react'
import { SUPPLIER_API } from '../api/config'
import { mockSuppliers } from '../mocks/mockData'
import { Link } from 'react-router-dom'

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
const suppliersPerPage = 10

  useEffect(() => {
  const cachedData = sessionStorage.getItem('supplierRisksCache')

  if (cachedData) {
    console.log('Using cached supplier risks')
    setSuppliers(JSON.parse(cachedData))
    return
  }

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
      sessionStorage.setItem('supplierRisksCache', JSON.stringify(fixedSuppliers))
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

export default Suppliers
