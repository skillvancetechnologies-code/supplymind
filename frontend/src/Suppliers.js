import { useState, useEffect } from 'react'
import { SUPPLIER_API } from '../api/config'
import { mockSuppliers } from '../mocks/mockData'
import { Link } from 'react-router-dom'

const rc = (r = '') => {
  if (r === 'Low') return '#22C55E'
  if (r === 'Medium') return '#F59E0B'
  return '#EF4444'
}

const tc = (t = '') => {
  if (t === 'Improving') return '#22C55E'
  if (t === 'Declining') return '#EF4444'
  return '#F59E0B'
}

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
    <div
      style={{
        padding: '34px',
        flex: 1,
        minHeight: '100vh',
        color: '#e5e7eb',
        background:
          'radial-gradient(circle at top left, rgba(37,99,235,.20), transparent 30%), linear-gradient(135deg, #020617 0%, #07111f 45%, #020617 100%)',
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
        Supplier Scoreboard
      </h1>

      <p
        style={{
          color: '#94a3b8',
          marginTop: '10px',
          marginBottom: '28px',
          fontSize: '15px',
        }}
      >
        Live supplier risk monitoring — sorted by supplier ID
      </p>

      <div
        style={{
          width: '100%',
          overflowX: window.innerWidth <= 768 ? 'auto' : 'visible',
          WebkitOverflowScrolling: 'touch',
          borderRadius: '22px',
          border: '1px solid rgba(148,163,184,.18)',
          boxShadow: '0 24px 60px rgba(0,0,0,.34)',
          background: 'rgba(15,23,42,.86)',
        }}
      >
        <table
          style={{
            width: window.innerWidth <= 768 ? '950px' : '100%',
            minWidth: window.innerWidth <= 768 ? '950px' : '100%',
            borderCollapse: 'collapse',
            background: '#111827',
            borderRadius: '22px',
            overflow: 'hidden',
          }}
        >
          <thead>
            <tr
              style={{
                background: 'linear-gradient(90deg,#1E3A8A,#2563EB)',
              }}
            >
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
                    padding: '14px',
                    color: '#F8FAFC',
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
            {currentSuppliers.map((s, i) => (
              <tr
                key={s.supplier_id || i}
                style={{
                  height: '58px',
                  background: i % 2 === 0 ? '#1E293B' : '#111827',
                  transition: 'all .25s ease',
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = '#273549')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background =
                    i % 2 === 0 ? '#1E293B' : '#111827')
                }
              >
                <td
                  style={{
                    padding: '14px',
                    verticalAlign: 'middle',
                    borderBottom: '1px solid rgba(255,255,255,.05)',
                  }}
                >
                  <Link
                    to={`/suppliers/${s.supplier_id}`}
                    style={{
                      color: '#60A5FA',
                      textDecoration: 'none',
                      fontWeight: 900,
                    }}
                  >
                    {s.supplier_id}
                  </Link>
                </td>

                <td style={{ padding: '14px', color: '#E2E8F0', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                  {s.city}
                </td>

                <td style={{ padding: '14px', color: '#E2E8F0', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                  {s.tier}
                </td>

                <td style={{ padding: '14px', color: '#E2E8F0', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                  {s.current_otif !== '-' ? `${s.current_otif}%` : '-'}
                </td>

                <td style={{ padding: '14px', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '6px 14px',
                      borderRadius: '999px',
                      fontSize: '12px',
                      fontWeight: 800,
                      background:
                        s.risk_tier === 'Low'
                          ? 'rgba(34,197,94,.15)'
                          : s.risk_tier === 'Medium'
                          ? 'rgba(245,158,11,.15)'
                          : 'rgba(239,68,68,.15)',
                      color: rc(s.risk_tier),
                      border: `1px solid ${rc(s.risk_tier)}`,
                    }}
                  >
                    {s.risk_tier}
                  </span>
                </td>

                <td style={{ padding: '14px', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '6px 14px',
                      borderRadius: '999px',
                      fontSize: '12px',
                      fontWeight: 800,
                      background:
                        s.trend === 'Improving'
                          ? 'rgba(34,197,94,.15)'
                          : s.trend === 'Declining'
                          ? 'rgba(239,68,68,.15)'
                          : 'rgba(245,158,11,.15)',
                      color: tc(s.trend),
                      border: `1px solid ${tc(s.trend)}`,
                    }}
                  >
                    {s.trend}
                  </span>
                </td>

                <td style={{ padding: '14px', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                  <Link
                    to={`/suppliers/${s.supplier_id}`}
                    style={{
                      color: '#93C5FD',
                      fontWeight: 900,
                      textDecoration: 'none',
                    }}
                  >
                    View Details →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '16px',
          marginTop: '24px',
          color: '#CBD5E1',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            padding: '10px 18px',
            borderRadius: '12px',
            border: '1px solid rgba(148,163,184,.25)',
            background: currentPage === 1 ? '#111827' : '#2563EB',
            color: '#F8FAFC',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            fontWeight: 800,
          }}
        >
          Previous
        </button>

        <span style={{ fontWeight: 700 }}>
          Showing {startIndex + 1} - {Math.min(endIndex, sortedSuppliers.length)} of {sortedSuppliers.length}
        </span>

        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            padding: '10px 18px',
            borderRadius: '12px',
            border: '1px solid rgba(148,163,184,.25)',
            background: currentPage === totalPages ? '#111827' : '#2563EB',
            color: '#F8FAFC',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            fontWeight: 800,
          }}
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default Suppliers