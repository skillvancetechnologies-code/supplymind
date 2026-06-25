import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import SupplierActions from '../components/SupplierActions'

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
      <div style={{ padding: '40px' }}>
        <h2>Loading supplier details...</h2>
      </div>
    )
  }
  console.log('Trend Data:', supplier.trend || supplier.performance_trend)

  return (
    <div style={{ padding: '40px', background: '#F4F6F9', minHeight: '100vh' }}>
      <button
        onClick={() => navigate('/')}
        style={{
          background: '#1B2A4A',
          color: 'white',
          border: 'none',
          padding: '10px 16px',
          borderRadius: '6px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        ← Back to Suppliers
      </button>

      <h2>{supplier.name || supplier.supplier_name || supplier.supplier_id}</h2>
      <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
  <button
    onClick={() => setActiveTab('overview')}
    style={{
      padding: '10px 16px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      background: activeTab === 'overview' ? '#1B2A4A' : 'white',
      color: activeTab === 'overview' ? 'white' : '#1B2A4A'
    }}
  >
    Overview
  </button>

  <button
    onClick={() => setActiveTab('actions')}
    style={{
      padding: '10px 16px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      background: activeTab === 'actions' ? '#1B2A4A' : 'white',
      color: activeTab === 'actions' ? 'white' : '#1B2A4A'
    }}
  >
    Recommended Actions
  </button>
</div>
{activeTab === 'overview' && (
  <>

      <div style={{ background: 'white', padding: '20px', marginTop: '20px', borderRadius: '8px' }}>
        <h3>Supplier Info Card</h3>

        <p>Supplier ID: {supplier.supplier_id}</p>
        <p>City: {supplier.city || '-'}</p>
        <p>Tier: {supplier.tier || supplier.city_tier || '-'}</p>

        <p>
          Current OTIF: {supplier.current_otif ?? supplier.otif ?? supplier.otif_pct ?? '-'}%
        </p>

        <p>
          Avg Lead Time: {supplier.avg_lead_time_days ?? supplier.lead_time ?? '-'} days
        </p>

        <p>
          Fill Rate: {supplier.fill_rate_pct ?? supplier.fill_rate ?? '-'}%
        </p>
      </div>

      <div style={{ background: 'white', padding: '20px', marginTop: '20px', borderRadius: '8px' }}>
        <h3>Risk Score Card</h3>

        <p>
          Risk Score:{' '}
          {riskData?.risk_score !== undefined
            ? `${riskData.risk_score}%`
            : supplier.risk_score !== undefined
              ? `${Math.round(supplier.risk_score)}%`
              : 'Risk score unavailable — backend syncing'}
        </p>

        <p>
          Risk Tier: {riskData?.risk_tier || supplier.risk_tier || 'Not available'}
        </p>

        <h4>Top Contributing Features</h4>

        <ul>
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
          background: 'white',
          padding: '20px',
          marginTop: '20px',
          borderRadius: '8px',
          height: '300px'
        }}
      >
        <h3>Performance Trend</h3>

        {(supplier.trend || supplier.performance_trend || []).length > 0 ? (
          <ResponsiveContainer width="100%" height="95%">
            <LineChart
  data={[...(supplier.trend || supplier.performance_trend)].reverse()}
>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
  type="monotone"
  dataKey="otif"
  stroke="#2563eb"
  strokeWidth={2}
/>
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p>No performance trend data available from backend.</p>
        )}
      </div>

      <div style={{ background: 'white', padding: '20px', marginTop: '20px', borderRadius: '8px' }}>
        <h3>Supplied SKUs</h3>

        {(supplier.skus || supplier.supplied_skus || []).length > 0 ? (
          <ul>
            {(supplier.skus || supplier.supplied_skus).map((sku, index) => (
              <li key={index}>{sku}</li>
            ))}
          </ul>
        ) : (
          <p>No supplied SKU data available from backend.</p>
        )}
            </div>

    </>
  )}

  {activeTab === 'actions' && (
    <SupplierActions supplierId={supplier_id} />
  )}
</div>
  )
}

export default SupplierDetail