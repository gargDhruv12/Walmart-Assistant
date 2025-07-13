import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import Navbar from './components/layout/Navbar'
import Dashboard from './components/pages/Dashboard'
import SupplierFinder from './components/pages/SupplierFinder'
import TariffChecker from './components/pages/TariffChecker'
import RoutePlanner from './components/pages/RoutePlanner'
import CostEstimator from './components/pages/CostEstimator'
import TradePlan from './components/pages/TradePlan'
import MainProgressWizard from './components/pages/MainProgressWizard';
import Login from './components/pages/Login';
import './App.css'

function PrivateRoute({ children, isAuthenticated }) {
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('walmart_auth') === 'true';
  });

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('walmart_auth', 'true');
  };
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('walmart_auth');
  };

  return (
    <Router>
      <div className="app">
        {window.location.pathname !== '/login' && <Navbar onLogout={handleLogout} isAuthenticated={isAuthenticated} />}
        <main className="main-content">
          <Routes>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/" element={<PrivateRoute isAuthenticated={isAuthenticated}><Dashboard /></PrivateRoute>} />
            <Route path="/suppliers" element={<PrivateRoute isAuthenticated={isAuthenticated}><SupplierFinder /></PrivateRoute>} />
            <Route path="/tariffs" element={<PrivateRoute isAuthenticated={isAuthenticated}><TariffChecker /></PrivateRoute>} />
            <Route path="/routes" element={<PrivateRoute isAuthenticated={isAuthenticated}><RoutePlanner /></PrivateRoute>} />
            <Route path="/costs" element={<PrivateRoute isAuthenticated={isAuthenticated}><CostEstimator /></PrivateRoute>} />
            <Route path="/plan" element={<PrivateRoute isAuthenticated={isAuthenticated}><TradePlan /></PrivateRoute>} />
            <Route path="/progress-wizard" element={<PrivateRoute isAuthenticated={isAuthenticated}><MainProgressWizard /></PrivateRoute>} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App