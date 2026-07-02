import { useState } from 'react'
import './App.css'
import { BrowserRouter, Routes, Route} from 'react-router-dom'
import SupplierDetail
from './components/SupplierDetail'
import SupplierIntelligenceDashboard from './components/SupplierIntelligenceDashboard'
import Dashboard from './components/Dashboard'
import Inventory from './components/Inventory'
import Suppliers from './components/Suppliers'
import Forecasts from './components/Forecasts'
import Disruptions from './components/Disruptions'
import ActionList from "./components/ActionList";
// component implementations moved to src/components; App only handles layout and routing
/* component implementations were moved to separate files in src/components/ */

/* =========================
   MAIN APP
========================= */

function App() {

  const [sidebarOpen, setSidebarOpen] = useState(true)

  const [page, setPage] = useState(localStorage.getItem('page') || 'dashboard')

const goToPage = (pageName) => {
  localStorage.setItem('page', pageName)
  setPage(pageName)
  window.location.href = '/'
}
  

  return (
    <BrowserRouter>
    <div className="app-layout">

      {/* Sidebar */}

      {sidebarOpen && (
        <div className="sidebar">

          <h1>
            SupplyMind
          </h1>

          <div style={{
            display:'flex',
            flexDirection:'column',
            gap:'20px',
            marginTop:'50px'
          }}>

            <div
              onClick={() => goToPage('dashboard')}
              style={{
                cursor:'pointer',
                fontWeight:'bold'
              }}
            >
              📊 Dashboard
            </div>

            <div
              onClick={() => goToPage('inventory')}
              style={{
                cursor:'pointer',
                fontWeight:'bold'
              }}
            >
              📦 Inventory
            </div>

            <div
              onClick={() => goToPage('suppliers')}
              style={{
                cursor:'pointer',
                fontWeight:'bold'
              }}
            >
              🏭 Suppliers
            </div>

            <div
              onClick={() => goToPage('disruptions')}
              style={{
                cursor:'pointer',
                fontWeight:'bold'
              }}
            >
              ⚠️ Disruptions
            </div>
            <div
  onClick={() => goToPage('forecasts')}
  style={{
    cursor:'pointer',
    fontWeight:'bold'
  }}
>
  📈 Forecasts
</div>
<div
  onClick={() => goToPage('supplierIntelligence')}
  style={{
    cursor:'pointer',
    fontWeight:'bold'
  }}
>
  🧠 Supplier Intelligence
</div>
<div
  onClick={() => {
  window.location.href = '/actions'
}}
  style={{
    cursor:'pointer',
    fontWeight:'bold'
  }}
>
  ✅ Recommended Actions
</div>

          </div>
        </div>
      )}

      {/* Main Content */}

     <div className="main-content">

        {/* Top Bar */}

      <div
  className="top-bar"
  style={{
    background:
      "radial-gradient(circle at top left, rgba(37,99,235,.20), transparent 30%), linear-gradient(135deg, #020617 0%, #07111f 45%, #020617 100%)",
  }}
>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              fontSize:'24px',
              background:'none',
              border:'none',
              cursor:'pointer',
              color:'#1B2A4A'
            }}
          >
            ☰
          </button>

        </div>

        {/* Pages */}

       <Routes>
  <Route
    path="/"
    element={
      <>
        {page === 'dashboard' && <Dashboard />}
        {page === 'inventory' && <Inventory />}
        {page === 'suppliers' && <Suppliers />}
        {page === 'disruptions' && <Disruptions />}
        {page === 'forecasts' && <Forecasts />}
        {page === 'supplierIntelligence' && <SupplierIntelligenceDashboard />}
      </>
    }
  />

  <Route
    path="/suppliers/:supplier_id"
    element={<SupplierDetail />}
  />

  <Route
    path="/actions"
    element={<ActionList />}
  />
</Routes>


        


      </div>

    </div>
    </BrowserRouter>
  )
}

export default App