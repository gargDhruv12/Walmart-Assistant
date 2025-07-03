import { useState, useEffect } from 'react'
import { Search, Filter, MapPin, Star, Clock, DollarSign, Award } from 'lucide-react'
import { suppliers } from '../../data/mockData'

const SupplierFinder = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredSuppliers, setFilteredSuppliers] = useState(suppliers)
  const [filters, setFilters] = useState({
    country: '',
    maxLeadTime: '',
    maxCost: '',
    minReliability: '',
    certifications: ''
  })
  const [sortBy, setSortBy] = useState('rating')

  // Get unique countries for filter dropdown
  const countries = [...new Set(suppliers.map(supplier => supplier.country))]

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

  return (
    <div className="supplier-finder">
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

      {/* Results */}
      <div className="results-section">
        <div className="results-header">
          <h2>Found {filteredSuppliers.length} suppliers</h2>
        </div>

        <div className="suppliers-grid grid grid-2">
          {filteredSuppliers.map(supplier => (
            <div key={supplier.id} className="supplier-card card">
              <div className="supplier-header">
                <div className="supplier-info">
                  <h3>{supplier.name}</h3>
                  <div className="location">
                    <MapPin size={16} />
                    <span>{supplier.city}, {supplier.country}</span>
                  </div>
                </div>
                <div className="supplier-rating">
                  <Star size={16} fill="currentColor" />
                  <span>{supplier.rating}</span>
                </div>
              </div>

              <div className="supplier-metrics">
                <div className="metric">
                  <Clock size={16} />
                  <span>{supplier.leadTime} days</span>
                  <small>Lead Time</small>
                </div>
                <div className="metric">
                  <DollarSign size={16} />
                  <span>${supplier.productCost}</span>
                  <small>Per Unit</small>
                </div>
                <div className="metric">
                  <Award size={16} />
                  <span className={`status ${getReliabilityColor(supplier.reliability)}`}>
                    {supplier.reliability}%
                  </span>
                  <small>Reliability</small>
                </div>
              </div>

              <div className="supplier-details">
                <div className="detail-section">
                  <h4>Specialties</h4>
                  <div className="specialties">
                    {supplier.specialties.map((specialty, index) => (
                      <span key={index} className="specialty-tag">
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Certifications</h4>
                  <div className="certifications">
                    {supplier.certifications.map((cert, index) => (
                      <span key={index} className="certification-tag">
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Business Details</h4>
                  <div className="business-details">
                    <span>Min Order: {supplier.minOrderQuantity.toLocaleString()} units</span>
                    <span>Experience: {supplier.yearsInBusiness} years</span>
                  </div>
                </div>
              </div>

              <div className="supplier-actions">
                <button className="btn btn-primary">
                  Get Quote
                </button>
                <button className="btn btn-outline">
                  View Details
                </button>
              </div>
            </div>
          ))}
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
        .page-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .search-section {
          padding: 2rem;
        }

        .search-bar {
          margin-bottom: 2rem;
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
          padding-top: 2rem;
        }

        .filters-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
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

        .supplier-card {
          padding: 1.5rem;
        }

        .supplier-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
        }

        .supplier-info h3 {
          margin: 0 0 0.5rem 0;
          color: var(--text-primary);
        }

        .location {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .supplier-rating {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: var(--accent-warning);
          font-weight: 600;
        }

        .supplier-metrics {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: var(--bg-secondary);
          border-radius: 8px;
        }

        .metric {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          text-align: center;
        }

        .metric svg {
          color: var(--accent-primary);
        }

        .metric span {
          font-weight: 600;
          color: var(--text-primary);
        }

        .metric small {
          color: var(--text-tertiary);
          font-size: 0.75rem;
        }

        .supplier-details {
          margin-bottom: 1.5rem;
        }

        .detail-section {
          margin-bottom: 1rem;
        }

        .detail-section:last-child {
          margin-bottom: 0;
        }

        .detail-section h4 {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin: 0 0 0.5rem 0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .specialties,
        .certifications {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .specialty-tag,
        .certification-tag {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .specialty-tag {
          background: var(--accent-primary);
          color: white;
        }

        .certification-tag {
          background: var(--accent-secondary);
          color: white;
        }

        .business-details {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .supplier-actions {
          display: flex;
          gap: 1rem;
        }

        .supplier-actions button {
          flex: 1;
        }

        .no-results {
          text-align: center;
          padding: 3rem;
          color: var(--text-secondary);
        }

        @media (max-width: 768px) {
          .suppliers-grid {
            grid-template-columns: 1fr;
          }
          
          .filters-grid {
            grid-template-columns: 1fr;
          }
          
          .supplier-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  )
}

export default SupplierFinder