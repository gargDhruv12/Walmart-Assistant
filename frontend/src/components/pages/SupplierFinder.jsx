import { useState, useEffect } from 'react'
import { Search, Filter, MapPin, Star, Clock, DollarSign, Award } from 'lucide-react'
import { Stepper, Step, StepLabel, Button, Box } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';

const SupplierFinder = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filteredSuppliers, setFilteredSuppliers] = useState(suppliers)
  const [filters, setFilters] = useState({
    country: '',
    maxLeadTime: '',
    maxCost: '',
    minReliability: '',
    certifications: ''
  })
  const [sortBy, setSortBy] = useState('rating')
  // Add selectedSupplier state
  const [selectedSupplier, setSelectedSupplier] = useState(null)

  // Get unique countries for filter dropdown
  const countries = [...new Set(suppliers.map(supplier => supplier.country))]

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
    api.getSuppliers()
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch suppliers')
        return res.json()
      })
      .then(data => {
        setSuppliers(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    let filtered = suppliers.filter(supplier => {
      const matchesSearch = supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           supplier.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           supplier.city.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCountry = !filters.country || supplier.country === filters.country
      const matchesLeadTime = !filters.maxLeadTime || supplier.leadTime <= parseInt(filters.maxLeadTime)
      const matchesCost = !filters.maxCost || supplier.productCost <= parseFloat(filters.maxCost)
      const matchesReliability = !filters.minReliability || supplier.reliability >= parseInt(filters.minReliability)
      const matchesCertifications = !filters.certifications || 
                                   supplier.certifications.some(cert => 
                                     cert.toLowerCase().includes(filters.certifications.toLowerCase())
                                   )

      return matchesSearch && matchesCountry && matchesLeadTime && 
             matchesCost && matchesReliability && matchesCertifications
    })

    // Sort suppliers
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating
        case 'cost':
          return a.productCost - b.productCost
        case 'leadTime':
          return a.leadTime - b.leadTime
        case 'reliability':
          return b.reliability - a.reliability
        default:
          return 0
      }
    })

    setFilteredSuppliers(filtered)
  }, [searchQuery, filters, sortBy])

  const clearFilters = () => {
    setFilters({
      country: '',
      maxLeadTime: '',
      maxCost: '',
      minReliability: '',
      certifications: ''
    })
    setSearchQuery('')
  }

  const getReliabilityColor = (reliability) => {
    if (reliability >= 90) return 'status-low'
    if (reliability >= 85) return 'status-medium'
    return 'status-high'
  }

  if (loading) return <div>Loading suppliers...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="supplier-finder">
      <div className="container">
        {isWizard && (
          <Box sx={{ maxWidth: 900, mx: 'auto', mt: 2, mb: 2 }}>
            <Stepper activeStep={1} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button variant="outlined" onClick={() => navigate('/?wizard=1')}>Back</Button>
              <Button
                variant="contained"
                onClick={() => {
                  if (selectedSupplier) {
                    navigate('/tariffs?wizard=1', { state: { supplier: selectedSupplier } })
                  } else {
                    alert('Please select a supplier before proceeding.')
                  }
                }}
                disabled={!selectedSupplier}
              >
                Next
              </Button>
            </Box>
          </Box>
        )}
        <div className="page-header">
          <h1>Supplier Finder</h1>
          <p>Search and compare global suppliers for your products</p>
        </div>

        {/* Search and Filters */}
        <div className="search-section card mb-6">
          <div className="search-bar">
            <div className="search-input">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search suppliers by name, country, or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div className="filters-section">
            <div className="filters-header">
              <Filter size={16} />
              <span>Filters</span>
              <button onClick={clearFilters} className="clear-filters">
                Clear All
              </button>
            </div>

            <div className="filters-grid">
              <div className="form-group">
                <label className="form-label">Country</label>
                <select
                  value={filters.country}
                  onChange={(e) => setFilters({ ...filters, country: e.target.value })}
                  className="form-select"
                >
                  <option value="">All Countries</option>
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Max Lead Time (days)</label>
                <input
                  type="number"
                  value={filters.maxLeadTime}
                  onChange={(e) => setFilters({ ...filters, maxLeadTime: e.target.value })}
                  placeholder="e.g., 30"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Max Cost per Unit ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={filters.maxCost}
                  onChange={(e) => setFilters({ ...filters, maxCost: e.target.value })}
                  placeholder="e.g., 20.00"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Min Reliability (%)</label>
                <input
                  type="number"
                  value={filters.minReliability}
                  onChange={(e) => setFilters({ ...filters, minReliability: e.target.value })}
                  placeholder="e.g., 85"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Certifications</label>
                <input
                  type="text"
                  value={filters.certifications}
                  onChange={(e) => setFilters({ ...filters, certifications: e.target.value })}
                  placeholder="e.g., ISO 9001"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="form-select"
                >
                  <option value="rating">Rating</option>
                  <option value="cost">Cost (Low to High)</option>
                  <option value="leadTime">Lead Time</option>
                  <option value="reliability">Reliability</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Supplier List */}
        <div className="supplier-list card">
          <table className="table">
            <thead>
              <tr>
                <th></th>
                <th>Name</th>
                <th>Country</th>
                <th>City</th>
                <th>Lead Time</th>
                <th>Cost/Unit</th>
                <th>Reliability</th>
                <th>Certifications</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.map(supplier => (
                <tr
                  key={supplier.id}
                  className={selectedSupplier?.id === supplier.id ? 'selected' : ''}
                  onClick={() => setSelectedSupplier(supplier)}
                  style={{ cursor: 'pointer', background: selectedSupplier?.id === supplier.id ? 'var(--accent-primary)10' : undefined }}
                >
                  <td>
                    <input
                      type="radio"
                      name="selectedSupplier"
                      checked={selectedSupplier?.id === supplier.id}
                      onChange={() => setSelectedSupplier(supplier)}
                    />
                  </td>
                  <td>{supplier.name}</td>
                  <td>{supplier.country}</td>
                  <td>{supplier.city}</td>
                  <td>{supplier.leadTime} days</td>
                  <td>${supplier.productCost}</td>
                  <td>
                    <span className={`status ${getReliabilityColor(supplier.reliability)}`}>{supplier.reliability}%</span>
                  </td>
                  <td>{supplier.certifications.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSuppliers.length === 0 && (
          <div className="no-results">
            <p>No suppliers found matching your criteria.</p>
            <button onClick={clearFilters} className="btn btn-primary">
              Clear Filters
            </button>
          </div>
        )}
      </div>
      <style jsx>{`
        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
        }
        .page-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .search-section {
          padding: 1.25rem 1rem;
        }
        .supplier-list {
          padding: 1rem 0.5rem;
        }
        .search-bar {
          margin-bottom: 1.25rem;
        }
        .search-input {
          position: relative;
          max-width: 600px;
          margin: 0 auto;
        }
        .search-input svg {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-tertiary);
        }
        .search-input input {
          padding-left: 3rem;
        }
        .filters-section {
          border-top: 1px solid var(--border-color);
          padding-top: 1rem;
        }
        .filters-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          color: var(--text-secondary);
        }
        .clear-filters {
          margin-left: auto;
          background: none;
          border: none;
          color: var(--accent-primary);
          cursor: pointer;
          text-decoration: underline;
        }
        .filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }
        .form-group {
          margin-bottom: 0;
        }
        .results-header {
          margin-bottom: 1.5rem;
        }
        .no-results {
          text-align: center;
          padding: 2rem;
          color: var(--text-secondary);
        }
        @media (max-width: 768px) {
          .container {
            padding: 0 0.5rem;
          }
          .filters-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}

export default SupplierFinder