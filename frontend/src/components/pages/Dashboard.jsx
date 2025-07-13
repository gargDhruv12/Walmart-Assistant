import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Globe, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Ship, 
  Users,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { suppliers, routes, tariffData } from '../../data/mockData'
import { Stepper, Step, StepLabel, Button, Box } from '@mui/material';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalSuppliers: 0,
    avgLeadTime: 0,
    avgCost: 0,
    activeRoutes: 0
  })

  const [recentActivity] = useState([
    {
      id: 1,
      action: "New supplier onboarded",
      supplier: "Thai Premium Textiles",
      time: "2 hours ago",
      status: "success"
    },
    {
      id: 2,
      action: "Tariff rate updated",
      detail: "India-USA rates increased by 0.3%",
      time: "4 hours ago",
      status: "warning"
    },
    {
      id: 3,
      action: "Route optimization completed",
      detail: "Vietnam to LA route - 2 days faster",
      time: "6 hours ago",
      status: "success"
    },
    {
      id: 4,
      action: "Port congestion alert",
      detail: "Los Angeles Port - High congestion",
      time: "8 hours ago",
      status: "error"
    }
  ])

  const steps = [
    'Dashboard',
    'Supplier Finder',
    'Tariff Checker',
    'Route Planner',
    'Cost Estimator'
  ];

  const location = useLocation();
  const navigate = useNavigate();
  const isWizard = new URLSearchParams(location.search).get('wizard') === '1';

  useEffect(() => {
    // Calculate dashboard statistics
    const totalSuppliers = suppliers.length
    const avgLeadTime = Math.round(
      suppliers.reduce((sum, supplier) => sum + supplier.leadTime, 0) / suppliers.length
    )
    const avgCost = (
      suppliers.reduce((sum, supplier) => sum + supplier.productCost, 0) / suppliers.length
    ).toFixed(2)
    const activeRoutes = routes.length

    setStats({
      totalSuppliers,
      avgLeadTime,
      avgCost: parseFloat(avgCost),
      activeRoutes
    })
  }, [])

  const quickActions = [
    {
      title: "Find Suppliers",
      description: "Search and compare global suppliers",
      icon: Users,
      link: "/suppliers",
      color: "primary"
    },
    {
      title: "Check Tariffs",
      description: "Calculate tariffs and taxes",
      icon: DollarSign,
      link: "/tariffs",
      color: "secondary"
    },
    {
      title: "Plan Routes",
      description: "Optimize shipping routes",
      icon: Ship,
      link: "/routes",
      color: "primary"
    },
    {
      title: "Estimate Costs",
      description: "Calculate total landed costs",
      icon: TrendingUp,
      link: "/costs",
      color: "secondary"
    }
  ]

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={16} className="text-green-500" />
      case 'warning':
        return <AlertTriangle size={16} className="text-yellow-500" />
      case 'error':
        return <AlertTriangle size={16} className="text-red-500" />
      default:
        return <CheckCircle size={16} className="text-blue-500" />
    }
  }

  return (
    <div className="dashboard">
      {!isWizard && (
        <Box sx={{ maxWidth: 900, mx: 'auto', mt: 2, mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" onClick={() => navigate('/suppliers?wizard=1')}>Estimate</Button>
        </Box>
      )}
      {isWizard && (
        <Box sx={{ maxWidth: 900, mx: 'auto', mt: 2, mb: 2 }}>
          <Stepper activeStep={0} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button variant="contained" onClick={() => navigate('/suppliers?wizard=1')}>Estimate</Button>
          </Box>
        </Box>
      )}
      <div className="dashboard-header">
        <h1>Global Trade Dashboard</h1>
        <p>Monitor your supply chain operations and trade activities</p>
      </div>

      {/* Key Statistics */}
      <div className="stats-grid grid grid-4 mb-8">
        <div className="stat-card card">
          <div className="stat-icon">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.totalSuppliers}</h3>
            <p>Active Suppliers</p>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.avgLeadTime} days</h3>
            <p>Avg Lead Time</p>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <h3>${stats.avgCost}</h3>
            <p>Avg Unit Cost</p>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon">
            <Ship size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.activeRoutes}</h3>
            <p>Active Routes</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content grid grid-2">
        {/* Quick Actions */}
        <div className="card">
          <h2 className="mb-4">Quick Actions</h2>
          <div className="quick-actions">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon
              return (
                <Link
                  key={index}
                  to={action.link}
                  className={`quick-action-card ${action.color}`}
                >
                  <div className="action-icon">
                    <IconComponent size={24} />
                  </div>
                  <div className="action-content">
                    <h4>{action.title}</h4>
                    <p>{action.description}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h2 className="mb-4">Recent Activity</h2>
          <div className="activity-list">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-status">
                  {getStatusIcon(activity.status)}
                </div>
                <div className="activity-content">
                  <p className="activity-action">{activity.action}</p>
                  {activity.supplier && (
                    <p className="activity-detail">Supplier: {activity.supplier}</p>
                  )}
                  {activity.detail && (
                    <p className="activity-detail">{activity.detail}</p>
                  )}
                  <p className="activity-time">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Suppliers Preview */}
      <div className="card mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2>Top Suppliers</h2>
          <Link to="/suppliers" className="btn btn-outline">
            View All
          </Link>
        </div>
        <div className="suppliers-preview">
          <table className="table">
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Country</th>
                <th>Lead Time</th>
                <th>Cost/Unit</th>
                <th>Reliability</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.slice(0, 3).map((supplier) => (
                <tr key={supplier.id}>
                  <td>
                    <div>
                      <div className="font-semibold">{supplier.name}</div>
                      <div className="text-sm text-gray-500">{supplier.city}</div>
                    </div>
                  </td>
                  <td>{supplier.country}</td>
                  <td>{supplier.leadTime} days</td>
                  <td>${supplier.productCost}</td>
                  <td>
                    <span className={`status ${
                      supplier.reliability > 90 ? 'status-low' : 
                      supplier.reliability > 85 ? 'status-medium' : 'status-high'
                    }`}>
                      {supplier.reliability}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .dashboard-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .dashboard-header h1 {
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .dashboard-header p {
          color: var(--text-secondary);
          font-size: 1.125rem;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
        }

        .stat-icon {
          background: var(--accent-primary);
          color: white;
          padding: 0.75rem;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-content h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }

        .stat-content p {
          color: var(--text-secondary);
          margin: 0;
          font-size: 0.875rem;
        }

        .quick-actions {
          display: grid;
          gap: 1rem;
        }

        .quick-action-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border-radius: 8px;
          text-decoration: none;
          transition: all 0.3s ease;
          border: 1px solid var(--border-color);
        }

        .quick-action-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .quick-action-card.primary {
          background: linear-gradient(135deg, var(--accent-primary)10, var(--accent-primary)05);
          border-color: var(--accent-primary);
        }

        .quick-action-card.secondary {
          background: linear-gradient(135deg, var(--accent-secondary)10, var(--accent-secondary)05);
          border-color: var(--accent-secondary);
        }

        .action-icon {
          background: var(--accent-primary);
          color: white;
          padding: 0.75rem;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .quick-action-card.secondary .action-icon {
          background: var(--accent-secondary);
        }

        .action-content h4 {
          margin: 0;
          color: var(--text-primary);
          font-weight: 600;
        }

        .action-content p {
          margin: 0;
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .activity-item {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
          padding: 1rem;
          background: var(--bg-secondary);
          border-radius: 8px;
        }

        .activity-status {
          flex-shrink: 0;
          padding-top: 0.25rem;
        }

        .activity-content {
          flex: 1;
        }

        .activity-action {
          font-weight: 500;
          color: var(--text-primary);
          margin: 0 0 0.25rem 0;
        }

        .activity-detail {
          color: var(--text-secondary);
          font-size: 0.875rem;
          margin: 0 0 0.25rem 0;
        }

        .activity-time {
          color: var(--text-tertiary);
          font-size: 0.75rem;
          margin: 0;
        }

        .suppliers-preview {
          overflow-x: auto;
        }

        .text-gray-500 {
          color: var(--text-secondary);
        }

        @media (max-width: 768px) {
          .dashboard-content {
            grid-template-columns: 1fr;
          }
          
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}

export default Dashboard