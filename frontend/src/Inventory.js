import { useState, useEffect } from 'react'
import { INVENTORY_DETAIL_API } from '../api/config'

const statusColor = (s = '') => {
  const status = s.toLowerCase()

  if (status === 'critical') return '#C53030'
  if (status === 'warning') return '#B7791F'
  return '#1A6B3A'
}

const Inventory = () => {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('pending')

  useEffect(() => {
    fetch(INVENTORY_DETAIL_API)
      .then(r => {
        if (!r.ok) throw new Error('Inventory detail endpoint not ready')
        return r.json()
      })
      .then(data => {
        const rows = Array.isArray(data)
          ? data
          : data.inventory_detail || data.data || data.results || []

        setInventory(rows)
        setStatus('live')
      })
      .catch(error => {
        console.log('Inventory detail API pending:', error)
        setInventory([])
        setStatus('pending')
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ padding:'40px', flex:1 }}>
      <h2 style={{ color:'#1B2A4A' }}>
        Inventory Positions
      </h2>

      <p style={{ color:'#4A5568' }}>
        {status === 'live'
          ? 'Live SKU-level inventory data'
          : 'Inventory detail endpoint pending from backend'}
      </p>

      {loading && (
        <div style={{
          background:'white',
          padding:'20px',
          borderRadius:'8px',
          marginTop:'20px'
        }}>
          Inventory detail loading...
        </div>
      )}

      {!loading && inventory.length === 0 && (
        <div style={{
          background:'white',
          padding:'20px',
          borderRadius:'8px',
          marginTop:'20px',
          color:'#B7791F',
          fontWeight:'bold'
        }}>
          No live SKU inventory rows available yet. Waiting for /api/analytics/inventory-detail.
        </div>
      )}

      {!loading && inventory.length > 0 && (
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
            <tr style={{ background:'#1B2A4A' }}>
              {['SKU ID','SKU Name','Category','Current Stock','Days of Cover','Status'].map(h => (
                <th key={h} style={{ padding:'12px', color:'white', textAlign:'left' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {inventory.map((r, i) => (
              <tr key={r.sku_id || i} style={{ background:i%2===0 ? '#F4F6F9' : 'white' }}>
                <td style={{ padding:'10px' }}>{r.sku_id}</td>
                <td style={{ padding:'10px' }}>{r.sku_name}</td>
                <td style={{ padding:'10px' }}>{r.category}</td>
                <td style={{ padding:'10px' }}>{r.current_stock}</td>
                <td style={{ padding:'10px' }}>{r.days_of_cover} days</td>
                <td style={{
                  padding:'10px',
                  fontWeight:'bold',
                  color:statusColor(String(r.status).toLowerCase())
                }}>
                  {r.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default Inventory
