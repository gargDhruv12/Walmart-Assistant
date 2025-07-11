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
          <div className="mobile-nav-container">
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
        </div>
      )}

      <style jsx>{`
        .navbar {
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-color);
          position: sticky;
          top: 0;
          z-index: 1000;
          box-shadow: var(--shadow-sm);
          width: 100vw;
        }

        .navbar-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 4rem;
          width: 100%;
          padding: 0 var(--space-4);
          max-width: 100%;
        }

        .navbar-brand {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          text-decoration: none;
          color: var(--text-primary);
          flex-shrink: 0;
        }

        .brand-icon {
          color: var(--accent-primary);
          flex-shrink: 0;
        }

        .brand-text {
          font-weight: 700;
          font-size: clamp(var(--text-base), 2.5vw, var(--text-xl));
          white-space: nowrap;
        }

        .navbar-nav {
          display: none;
          gap: var(--space-8);
          flex: 1;
          justify-content: center;
          max-width: 600px;
        }

        .nav-link {
          color: var(--text-secondary);
          text-decoration: none;
          font-weight: 500;
          padding: var(--space-2) var(--space-3);
          position: relative;
          transition: color var(--transition-fast);
          white-space: nowrap;
          font-size: var(--text-base);
          border-radius: var(--radius-md);
        }

        .nav-link:hover {
          color: var(--accent-primary);
          background: var(--primary-50);
        }

        .dark .nav-link:hover {
          background: rgb(59 130 246 / 0.1);
        }

        .nav-link.active {
          color: var(--accent-primary);
          background: var(--primary-50);
        }

        .dark .nav-link.active {
          background: rgb(59 130 246 / 0.1);
        }

        .navbar-actions {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          flex-shrink: 0;
        }

        .theme-toggle,
        .mobile-menu-toggle {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: var(--space-2);
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 40px;
          min-height: 40px;
        }

        .theme-toggle:hover,
        .mobile-menu-toggle:hover {
          background: var(--bg-tertiary);
          color: var(--accent-primary);
        }

        .desktop-nav {
          display: none;
        }

        .mobile-nav {
          background: var(--bg-secondary);
          border-top: 1px solid var(--border-color);
          box-shadow: var(--shadow-lg);
          width: 100vw;
        }

        .mobile-nav-container {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
          padding: var(--space-4);
          max-width: 100%;
        }

        .mobile-nav-link {
          color: var(--text-secondary);
          text-decoration: none;
          font-weight: 500;
          padding: var(--space-4);
          border-radius: var(--radius-lg);
          transition: all var(--transition-fast);
          display: block;
          font-size: var(--text-base);
        }

        .mobile-nav-link:hover {
          background: var(--bg-tertiary);
          color: var(--accent-primary);
        }

        .mobile-nav-link.active {
          color: var(--accent-primary);
          background: var(--primary-50);
        }

        .dark .mobile-nav-link.active {
          background: rgb(59 130 246 / 0.1);
        }

        /* Tablet and up */
        @media (min-width: 768px) {
          .navbar-container {
            padding: 0 var(--space-6);
          }
          
          .desktop-nav {
            display: flex;
          }

          .mobile-menu-toggle {
            display: none;
          }

          .mobile-nav {
            display: none;
          }

          .navbar-actions {
            gap: var(--space-3);
          }
        }

        /* Large screens */
        @media (min-width: 1024px) {
          .navbar-container {
            padding: 0 var(--space-8);
          }
          
          .navbar-nav {
            gap: var(--space-10);
            max-width: 800px;
          }
        }

        /* Extra large screens */
        @media (min-width: 1280px) {
          .navbar-container {
            padding: 0 var(--space-10);
          }
        }

        @media (min-width: 1400px) {
          .navbar-container {
            padding: 0 var(--space-12);
          }
          
          .navbar-nav {
            max-width: 1000px;
          }
        }

        @media (min-width: 1600px) {
          .navbar-container {
            padding: 0 var(--space-16);
          }
        }

        /* Very small screens */
        @media (max-width: 480px) {
          .navbar-container {
            padding: 0 var(--space-3);
          }
          
          .brand-text {
            display: none;
          }

          .navbar-actions {
            gap: var(--space-1);
          }
        }

        /* Landscape mobile */
        @media (max-width: 767px) and (orientation: landscape) {
          .navbar-container {
            height: 3.5rem;
          }
        }
      `}</style>
    </nav>
  )
}

export default Navbar