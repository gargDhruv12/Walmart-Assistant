import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Globe, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Ship, 
  Users,
  AlertTriangle,
  CheckCircle,
  ArrowRight
} from 'lucide-react'
import { suppliers, routes, tariffData } from '../../data/mockData'

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
        return <CheckCircle size={16} className="text-success" />
      case 'warning':
        return <AlertTriangle size={16} className="text-warning" />
      case 'error':
        return <AlertTriangle size={16} className="text-error" />
      default:
        return <CheckCircle size={16} className="text-primary" />
    }
  }

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Global Trade Dashboard</h1>
          <p>Monitor your supply chain operations and trade activities</p>
        </div>

        {/* Key Statistics */}
        <div className="stats-grid grid grid-responsive-4 mb-8">
          <div className="stat-card card">
            <div className="stat-icon stat-icon-primary">
              <Users size={24} />
            </div>
            <div className="stat-content">
              <h3>{stats.totalSuppliers}</h3>
              <p>Active Suppliers</p>
            </div>
          </div>

          <div className="stat-card card">
            <div className="stat-icon stat-icon-secondary">
              <Clock size={24} />
            </div>
            <div className="stat-content">
              <h3>{stats.avgLeadTime} days</h3>
              <p>Avg Lead Time</p>
            </div>
          </div>

          <div className="stat-card card">
            <div className="stat-icon stat-icon-primary">
              <DollarSign size={24} />
            </div>
            <div className="stat-content">
              <h3>${stats.avgCost}</h3>
              <p>Avg Unit Cost</p>
            </div>
          </div>

          <div className="stat-card card">
            <div className="stat-icon stat-icon-secondary">
              <Ship size={24} />
            </div>
            <div className="stat-content">
              <h3>{stats.activeRoutes}</h3>
              <p>Active Routes</p>
            </div>
          </div>
        </div>

        <div className="dashboard-content grid grid-responsive-2 mb-8">
          {/* Quick Actions */}
          <div className="card">
            <h2 className="mb-6">Quick Actions</h2>
            <div className="quick-actions">
              {quickActions.map((action, index) => {
                const IconComponent = action.icon
                return (
                  <Link
                    key={index}
                    to={action.link}
                    className={`quick-action-card ${action.color}`}
                  >
                    <div className={`action-icon action-icon-${action.color}`}>
                      <IconComponent size={24} />
                    </div>
                    <div className="action-content">
                      <h4>{action.title}</h4>
                      <p>{action.description}</p>
                    </div>
                    <ArrowRight size={20} className="action-arrow" />
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card">
            <h2 className="mb-6">Recent Activity</h2>
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
        <div className="card">
          <div className="suppliers-header">
            <h2>Top Suppliers</h2>
            <Link to="/suppliers" className="btn btn-outline">
              View All
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className="suppliers-preview overflow-x-auto">
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
                        <div className="text-sm text-secondary">{supplier.city}</div>
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
      </div>

      <style jsx>{`
        .dashboard-header {
          text-align: center;
          margin-bottom: var(--space-12);
        }

        .dashboard-header h1 {
          color: var(--text-primary);
          margin-bottom: var(--space-3);
        }

        .dashboard-header p {
          color: var(--text-secondary);
          font-size: clamp(var(--text-base), 2vw, var(--text-lg));
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          padding: var(--space-6);
          transition: all var(--transition-normal);
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }

        .stat-icon {
          padding: var(--space-4);
          border-radius: var(--radius-xl);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .stat-icon-primary {
          background: var(--primary-100);
          color: var(--primary-600);
        }

        .stat-icon-secondary {
          background: var(--secondary-100);
          color: var(--secondary-600);
        }

        .dark .stat-icon-primary {
          background: rgb(59 130 246 / 0.2);
          color: var(--primary-400);
        }

        .dark .stat-icon-secondary {
          background: rgb(20 184 166 / 0.2);
          color: var(--secondary-400);
        }

        .stat-content h3 {
          font-size: clamp(var(--text-xl), 3vw, var(--text-2xl));
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }

        .stat-content p {
          color: var(--text-secondary);
          margin: 0;
          font-size: var(--text-sm);
        }

        .quick-actions {
          display: grid;
          gap: var(--space-4);
        }

        .quick-action-card {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          padding: var(--space-6);
          border-radius: var(--radius-xl);
          text-decoration: none;
          transition: all var(--transition-normal);
          border: 1px solid var(--border-color);
          background: var(--bg-secondary);
        }

        .quick-action-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
          border-color: var(--accent-primary);
        }

        .quick-action-card.primary:hover {
          background: var(--primary-50);
        }

        .quick-action-card.secondary:hover {
          background: var(--secondary-50);
        }

        .dark .quick-action-card.primary:hover {
          background: rgb(59 130 246 / 0.05);
        }

        .dark .quick-action-card.secondary:hover {
          background: rgb(20 184 166 / 0.05);
        }

        .action-icon {
          padding: var(--space-3);
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .action-icon-primary {
          background: var(--primary-100);
          color: var(--primary-600);
        }

        .action-icon-secondary {
          background: var(--secondary-100);
          color: var(--secondary-600);
        }

        .dark .action-icon-primary {
          background: rgb(59 130 246 / 0.2);
          color: var(--primary-400);
        }

        .dark .action-icon-secondary {
          background: rgb(20 184 166 / 0.2);
          color: var(--secondary-400);
        }

        .action-content {
          flex: 1;
          min-width: 0;
        }

        .action-content h4 {
          margin: 0;
          color: var(--text-primary);
          font-weight: 600;
          font-size: var(--text-base);
        }

        .action-content p {
          margin: 0;
          color: var(--text-secondary);
          font-size: var(--text-sm);
        }

        .action-arrow {
          color: var(--text-tertiary);
          transition: all var(--transition-fast);
          flex-shrink: 0;
        }

        .quick-action-card:hover .action-arrow {
          color: var(--accent-primary);
          transform: translateX(4px);
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .activity-item {
          display: flex;
          gap: var(--space-4);
          align-items: flex-start;
          padding: var(--space-4);
          background: var(--bg-tertiary);
          border-radius: var(--radius-lg);
          transition: all var(--transition-fast);
        }

        .activity-item:hover {
          background: var(--bg-primary);
        }

        .activity-status {
          flex-shrink: 0;
          padding-top: var(--space-1);
        }

        .activity-content {
          flex: 1;
          min-width: 0;
        }

        .activity-action {
          font-weight: 500;
          color: var(--text-primary);
          margin: 0 0 var(--space-1) 0;
          font-size: var(--text-sm);
        }

        .activity-detail {
          color: var(--text-secondary);
          font-size: var(--text-xs);
          margin: 0 0 var(--space-1) 0;
          word-wrap: break-word;
        }

        .activity-time {
          color: var(--text-tertiary);
          font-size: var(--text-xs);
          margin: 0;
        }

        .suppliers-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-6);
          flex-wrap: wrap;
          gap: var(--space-4);
        }

        .suppliers-preview {
          overflow-x: auto;
        }

        .text-secondary {
          color: var(--text-secondary);
        }

        .text-success {
          color: var(--success-500);
        }

        .text-warning {
          color: var(--warning-500);
        }

        .text-error {
          color: var(--error-500);
        }

        .text-primary {
          color: var(--accent-primary);
        }

        /* Mobile optimizations */
        @media (max-width: 639px) {
          .stat-card {
            flex-direction: column;
            text-align: center;
            gap: var(--space-3);
          }
          
          .quick-action-card {
            flex-direction: column;
            text-align: center;
            gap: var(--space-3);
          }
          
          .action-arrow {
            display: none;
          }
          
          .suppliers-header {
            flex-direction: column;
            align-items: stretch;
          }
          
          .suppliers-header .btn {
            width: 100%;
          }
        }

        @media (max-width: 479px) {
          .activity-item {
            flex-direction: column;
            gap: var(--space-2);
          }
          
          .activity-status {
            align-self: flex-start;
          }
        }

        /* Tablet adjustments */
        @media (min-width: 768px) and (max-width: 1023px) {
          .stat-card {
            flex-direction: column;
            text-align: center;
            gap: var(--space-3);
          }
        }

        /* Large screen optimizations */
        @media (min-width: 1400px) {
          .dashboard-header {
            margin-bottom: var(--space-16);
          }
          
          .stat-card {
            padding: var(--space-8);
          }
          
          .quick-action-card {
            padding: var(--space-8);
          }
          
          .activity-item {
            padding: var(--space-6);
          }
        }
      `}</style>
    </div>
  )
}

export default Dashboard