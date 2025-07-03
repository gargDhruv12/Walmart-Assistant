import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Navbar from './components/layout/Navbar'
import Dashboard from './components/pages/Dashboard'
import SupplierFinder from './components/pages/SupplierFinder'
import TariffChecker from './components/pages/TariffChecker'
import RoutePlanner from './components/pages/RoutePlanner'
import CostEstimator from './components/pages/CostEstimator'
import TradePlan from './components/pages/TradePlan'
import './App.css'

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved ? JSON.parse(saved) : false
  })

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode))
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  return (
    <Router>
      <div className={`app ${isDarkMode ? 'dark' : ''}`}>
        <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/suppliers" element={<SupplierFinder />} />
            <Route path="/tariffs" element={<TariffChecker />} />
            <Route path="/routes" element={<RoutePlanner />} />
            <Route path="/costs" element={<CostEstimator />} />
            <Route path="/plan" element={<TradePlan />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App