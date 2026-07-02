import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import SupplierActions from './SupplierActions'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

import { supplierDetails } from '../mocks/mockData'
import {
  SUPPLIER_RISK_API,
  SUPPLIER_DETAIL_API
} from '../api/config'

const SupplierDetail = () => {
  const { supplier_id } = useParams()
  const navigate = useNavigate()

  const [supplierData, setSupplierData] = useState(null)
  const [riskData, setRiskData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  const fallbackSupplier = supplierDetails?.[supplier_id]

  const supplier = {
    supplier_id,
    ...(fallbackSupplier || {}),
    ...(supplierData || {})
  }

  const riskScore =
    riskData?.risk_score !== undefined
      ? riskData.risk_score
      : supplier.risk_score !== undefined
      ? Math.round(supplier.risk_score)
      : null

  const riskTier =
    riskData?.risk_tier || supplier.risk_tier || 'Not available'

  const cardStyle = {
    background: 'rgba(15,23,42,.86)',
    padding: '22px',
    marginTop: '20px',
    borderRadius: '22px',
    border: '1px solid rgba(148,163,184,.18)',
    boxShadow: '0 24px 60px rgba(0,0,0,.34)',
    color: '#E2E8F0'
  }

  const labelStyle = {
    color: '#94A3B8',
    fontSize: '13px',
    marginBottom: '4px'
  }

  const valueStyle = {
    color: '#F8FAFC',
    fontWeight: 800,
    fontSize: '15px'
  }

  useEffect(() => {
    setLoading(true)
    setSupplierData(null)
    setRiskData(null)

    fetch(`${SUPPLIER_DETAIL_API}?supplier_id=${supplier_id}`)
      .then(r => r.json())
      .then(data => {
        console.log(' Supplier Detail API response:', data)

        let selectedSupplier = null

        if (Array.isArray(data)) {
          selectedSupplier = data.find(
            item => item.supplier_id === supplier_id
          )
        } else {
          selectedSupplier = data
        }

        if (
          selectedSupplier &&
          !selectedSupplier.detail &&
          !selectedSupplier.error
        ) {
          setSupplierData(selectedSupplier)
        } else {
          setSupplierData(fallbackSupplier || null)
        }
      })
      .catch(() => {
        console.log('Supplier detail API unavailable')
        setSupplierData(fallbackSupplier || null)
      })
      .finally(() => {
        setLoading(false)
      })

    fetch(`${SUPPLIER_RISK_API}?supplier_id=${supplier_id}`)
      .then(r => r.json())
      .then(data => {
        console.log(' API response:', data)

        if (data && !data.error && !data.detail) {
          setRiskData({
            ...data,
            risk_score:
              data.risk_score !== undefined
                ? Math.round(data.risk_score)
                : undefined
          })
        }
      })
      .catch(() => {
        console.log('Risk API unavailable')
      })
  }, [supplier_id, fallbackSupplier])

  if (loading) {
    return (
      <div
        style={{
          padding: '40px',
          minHeight: '100vh',
          background:
            'linear-gradient(135deg, #020617 0%, #07111f 45%, #020617 100%)',
          color: '#E2E8F0'
        }}
      >
        <h2 style={{ color: '#F8FAFC' }}>Loading supplier details...</h2>
      </div>
    )
  }

  return (
    <div
      style={{
        padding: '34px',
        minHeight: '100vh',
        background:
          'radial-gradient(circle at top left, rgba(37,99,235,.20), transparent 30%), linear-gradient(135deg, #020617 0%, #07111f 45%, #020617 100%)',
        color: '#E5E7EB'
      }}
    >
      <button
        onClick={() => navigate('/')}
        style={{
          background: 'rgba(37,99,235,.18)',
          color: '#93C5FD',
          border: '1px solid rgba(96,165,250,.35)',
          padding: '11px 18px',
          borderRadius: '14px',
          cursor: 'pointer',
          marginBottom: '22px',
          fontWeight: 900
        }}
      >
        ← Back to Suppliers
      </button>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '20px',
          flexWrap: 'wrap'
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '42px',
              fontWeight: 900,
              margin: 0,
              color: '#F8FAFC',
              textShadow:
                '0 0 12px rgba(96,165,250,.55), 0 0 35px rgba(37,99,235,.35)'
            }}
          >
            {supplier.name || supplier.supplier_name || supplier.supplier_id}
          </h1>

          <p
            style={{
              color: '#94A3B8',
              marginTop: '10px',
              fontSize: '15px'
            }}
          >
            Supplier Intelligence Detail View — {supplier_id}
          </p>
        </div>

        <div
          style={{
            padding: '14px 18px',
            borderRadius: '18px',
            background: 'rgba(15,23,42,.86)',
            border: '1px solid rgba(148,163,184,.18)',
            color:
              riskTier === 'Low'
                ? '#22C55E'
                : riskTier === 'Medium'
                ? '#F59E0B'
                : '#EF4444',
            fontWeight: 900,
            boxShadow: '0 18px 45px rgba(0,0,0,.28)'
          }}
        >
          Risk Tier: {riskTier}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '12px',
          marginTop: '24px',
          flexWrap: 'wrap'
        }}
      >
        <button
          onClick={() => setActiveTab('overview')}
          style={{
            padding: '11px 18px',
            borderRadius: '14px',
            border: '1px solid rgba(96,165,250,.35)',
            cursor: 'pointer',
            background:
              activeTab === 'overview'
                ? 'linear-gradient(135deg,#2563EB,#1E3A8A)'
                : 'rgba(15,23,42,.86)',
            color: '#F8FAFC',
            fontWeight: 900
          }}
        >
          Overview
        </button>

        <button
          onClick={() => setActiveTab('actions')}
          style={{
            padding: '11px 18px',
            borderRadius: '14px',
            border: '1px solid rgba(96,165,250,.35)',
            cursor: 'pointer',
            background:
              activeTab === 'actions'
                ? 'linear-gradient(135deg,#2563EB,#1E3A8A)'
                : 'rgba(15,23,42,.86)',
            color: '#F8FAFC',
            fontWeight: 900
          }}
        >
          Recommended Actions
        </button>
      </div>

      {activeTab === 'overview' && (
        <>
          <div style={cardStyle}>
            <h3 style={{ color: '#F8FAFC', marginTop: 0 }}>
              Supplier Info Card
            </h3>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '18px',
                marginTop: '18px'
              }}
            >
              {[
                ['Supplier ID', supplier.supplier_id],
                ['City', supplier.city || '-'],
                ['Tier', supplier.tier || supplier.city_tier || '-'],
                ['Current OTIF', `${supplier.current_otif ?? supplier.otif ?? supplier.otif_pct ?? '-'}%`],
                ['Avg Lead Time', `${supplier.avg_lead_time_days ?? supplier.lead_time ?? '-'} days`],
                ['Fill Rate', `${supplier.fill_rate_pct ?? supplier.fill_rate ?? '-'}%`]
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    padding: '16px',
                    borderRadius: '16px',
                    background: 'rgba(30,41,59,.72)',
                    border: '1px solid rgba(148,163,184,.12)'
                  }}
                >
                  <div style={labelStyle}>{label}</div>
                  <div style={valueStyle}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={cardStyle}>
            <h3 style={{ color: '#F8FAFC', marginTop: 0 }}>
              Risk Score Card
            </h3>

            <div
              style={{
                fontSize: '44px',
                color:
                  riskScore >= 70
                    ? '#EF4444'
                    : riskScore >= 40
                    ? '#F59E0B'
                    : '#22C55E',
                fontWeight: 900,
                marginTop: '12px'
              }}
            >
              {riskScore !== null
                ? `${riskScore}%`
                : 'Risk score unavailable'}
            </div>

            <p style={{ color: '#CBD5E1' }}>
              Risk Tier: {riskTier}
            </p>

            <h4 style={{ color: '#F8FAFC' }}>
              Top Contributing Features
            </h4>

            <ul style={{ color: '#CBD5E1', lineHeight: 1.8 }}>
              {(riskData?.top_features || supplier.top_features || []).length > 0 ? (
                (riskData?.top_features || supplier.top_features).map((f, index) => (
                  <li key={index}>{f}</li>
                ))
              ) : (
                <li>No feature data available</li>
              )}
            </ul>
          </div>

          <div
            style={{
              ...cardStyle,
              height: '340px'
            }}
          >
            <h3 style={{ color: '#F8FAFC', marginTop: 0 }}>
              Performance Trend
            </h3>

            {(supplier.trend || supplier.performance_trend || []).length > 0 ? (
              <ResponsiveContainer width="100%" height="88%">
                <LineChart
                  data={[...(supplier.trend || supplier.performance_trend)].reverse()}
                >
                  <XAxis dataKey="month" stroke="#94A3B8" />
                  <YAxis stroke="#94A3B8" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="otif"
                    stroke="#60A5FA"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: '#94A3B8' }}>
                No performance trend data available from backend.
              </p>
            )}
          </div>

          <div style={cardStyle}>
            <h3 style={{ color: '#F8FAFC', marginTop: 0 }}>
              Supplied SKUs
            </h3>

            {(supplier.skus || supplier.supplied_skus || []).length > 0 ? (
              <ul style={{ color: '#CBD5E1', lineHeight: 1.9 }}>
                {(supplier.skus || supplier.supplied_skus).map((sku, index) => (
                  <li key={index}>{sku}</li>
                ))}
              </ul>
            ) : (
              <p style={{ color: '#94A3B8' }}>
                No supplied SKU data available from backend.
              </p>
            )}
          </div>
        </>
      )}

      {activeTab === 'actions' && (
        <div style={{ marginTop: '20px' }}>
          <SupplierActions supplierId={supplier_id} />
        </div>
      )}
    </div>
  )
}

export default SupplierDetail