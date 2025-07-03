import { Link, useLocation } from 'react-router-dom'
import { Moon, Sun, Globe, Menu, X } from 'lucide-react'
import { useState } from 'react'

const Navbar = ({ isDarkMode, toggleDarkMode }) => {
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Globe },
    { path: '/suppliers', label: 'Suppliers' },
    { path: '/tariffs', label: 'Tariffs' },
    { path: '/routes', label: 'Routes' },
    { path: '/costs', label: 'Costs' },
    { path: '/plan', label: 'Trade Plan' }
  ]

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Globe className="brand-icon" />
          <span className="brand-text">Walmart Trade Assistant</span>
        </div>

        {/* Desktop Navigation */}
        <div className="navbar-nav desktop-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="navbar-actions">
          <button
            onClick={toggleDarkMode}
            className="theme-toggle"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button
            onClick={toggleMobileMenu}
            className="mobile-menu-toggle"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="mobile-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`mobile-nav-link ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}

      <style jsx>{`
        .navbar {
          background: var(--bg-primary);
          border-bottom: 1px solid var(--border-color);
          position: sticky;
          top: 0;
          z-index: 1000;
          box-shadow: var(--shadow-sm);
        }

        .navbar-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 4rem;
        }

        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
          color: var(--text-primary);
        }

        .brand-icon {
          color: var(--accent-primary);
        }

        .brand-text {
          font-weight: 700;
          font-size: 1.25rem;
        }

        .navbar-nav {
          display: flex;
          gap: 2rem;
        }

        .nav-link {
          color: var(--text-secondary);
          text-decoration: none;
          font-weight: 500;
          padding: 0.5rem 0;
          position: relative;
          transition: color 0.3s ease;
        }

        .nav-link:hover {
          color: var(--accent-primary);
        }

        .nav-link.active {
          color: var(--accent-primary);
        }

        .nav-link.active::after {
          content: '';
          position: absolute;
          bottom: -1rem;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--accent-primary);
        }

        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .theme-toggle {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 6px;
          transition: all 0.3s ease;
        }

        .theme-toggle:hover {
          background: var(--bg-secondary);
          color: var(--accent-primary);
        }

        .mobile-menu-toggle {
          display: none;
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 0.5rem;
        }

        .desktop-nav {
          display: flex;
        }

        .mobile-nav {
          display: none;
          background: var(--bg-primary);
          border-top: 1px solid var(--border-color);
          padding: 1rem 2rem;
          flex-direction: column;
          gap: 1rem;
        }

        .mobile-nav-link {
          color: var(--text-secondary);
          text-decoration: none;
          font-weight: 500;
          padding: 0.75rem 0;
          border-bottom: 1px solid var(--border-color);
        }

        .mobile-nav-link:last-child {
          border-bottom: none;
        }

        .mobile-nav-link.active {
          color: var(--accent-primary);
        }

        @media (max-width: 768px) {
          .navbar-container {
            padding: 0 1rem;
          }

          .desktop-nav {
            display: none;
          }

          .mobile-menu-toggle {
            display: block;
          }

          .mobile-nav {
            display: flex;
          }

          .brand-text {
            font-size: 1rem;
          }
        }

        @media (max-width: 480px) {
          .brand-text {
            display: none;
          }
        }
      `}</style>
    </nav>
  )
}

export default Navbar