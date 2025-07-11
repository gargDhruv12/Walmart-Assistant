import { useState, useEffect } from 'react'
import { Calculator, TrendingUp, AlertCircle, Download } from 'lucide-react'
import { suppliers, tariffData, ports, destinationPorts } from '../../data/mockData'

const CostEstimator = () => {
  const [formData, setFormData] = useState({
    productName: '',
    hsCode: '6203',
    quantity: 5000,
    selectedSuppliers: []
  })

  const [estimates, setEstimates] = useState([])
  const [comparison, setComparison] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSupplierToggle = (supplierId) => {
    const currentSelected = formData.selectedSuppliers
    const updated = currentSelected.includes(supplierId)
      ? currentSelected.filter(id => id !== supplierId)
      : [...currentSelected, supplierId]
    
    setFormData({ ...formData, selectedSuppliers: updated })
  }

  const calculateEstimates = async () => {
    if (formData.selectedSuppliers.length === 0) {
      alert('Please select at least one supplier')
      return
    }

    setLoading(true)
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    const newEstimates = formData.selectedSuppliers.map(supplierId => {
      const supplier = suppliers.find(s => s.id === supplierId)
      
      // Calculate base product cost
      const productCost = supplier.productCost * formData.quantity

      // Calculate tariff
      const routeKey = `${supplier.country}-USA`
      const tariffRate = tariffData[formData.hsCode]?.rates[routeKey]?.rate || 0
      const tariffCost = (productCost * tariffRate) / 100

      // Find best port for this supplier
      const availablePorts = ports.filter(port => port.connectivity[supplier.country])
      const bestPort = availablePorts.reduce((best, current) => {
        const currentCost = current.shippingCost + 
                           (current.connectivity[supplier.country]?.distance || 0) * 0.1
        const bestCost = best.shippingCost + 
                        (best.connectivity[supplier.country]?.distance || 0) * 0.1
        return currentCost < bestCost ? current : best
      }, availablePorts[0])

      // Calculate shipping costs
      const shippingCost = bestPort.shippingCost
      const transitTime = bestPort.connectivity[supplier.country]?.transitTime || 0
      
      // Calculate additional costs
      const insuranceCost = productCost * 0.005 // 0.5% of product value
      const customsBrokerFee = 150
      const documentationFee = 75
      const warehouseFee = formData.quantity * 0.25
      const delayPenalty = bestPort.averageDelay * 100 // $100 per day of delay

      // Calculate risk premium based on supplier reliability
      const riskPremium = productCost * (100 - supplier.reliability) / 1000

      const totalLandedCost = productCost + tariffCost + shippingCost + 
                             insuranceCost + customsBrokerFee + documentationFee + 
                             warehouseFee + delayPenalty + riskPremium

      const costPerUnit = totalLandedCost / formData.quantity

      return {
        supplier,
        costs: {
          productCost,
          tariffCost,
          shippingCost,
          insuranceCost,
          customsBrokerFee,
          documentationFee,
          warehouseFee,
          delayPenalty,
          riskPremium,
          totalLandedCost,
          costPerUnit
        },
        logistics: {
          port: bestPort,
          transitTime: transitTime + bestPort.averageDelay,
          tariffRate
        },
        savings: null // Will be calculated in comparison
      }
    })

    // Calculate savings comparison (vs most expensive option)
    const mostExpensive = Math.max(...newEstimates.map(e => e.costs.totalLandedCost))
    newEstimates.forEach(estimate => {
      estimate.savings = mostExpensive - estimate.costs.totalLandedCost
    })

    // Sort by total cost
    newEstimates.sort((a, b) => a.costs.totalLandedCost - b.costs.totalLandedCost)

    setEstimates(newEstimates)
    setComparison({
      bestOption: newEstimates[0],
      worstOption: newEstimates[newEstimates.length - 1],
      averageCost: newEstimates.reduce((sum, e) => sum + e.costs.totalLandedCost, 0) / newEstimates.length,
      totalSavings: newEstimates[0].savings
    })
    
    setLoading(false)
  }

  const downloadReport = () => {
    // In a real app, this would generate a PDF report
    const reportData = {
      product: formData.productName,
      quantity: formData.quantity,
      estimates: estimates.map(e => ({
        supplier: e.supplier.name,
        country: e.supplier.country,
        totalCost: e.costs.totalLandedCost,
        costPerUnit: e.costs.costPerUnit,
        transitTime: e.logistics.transitTime
      }))
    }
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'cost-estimate-report.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getCostRanking = (index) => {
    if (index === 0) return { label: 'Best Value', color: 'status-low' }
    if (index === estimates.length - 1) return { label: 'Most Expensive', color: 'status-high' }
    return { label: 'Competitive', color: 'status-medium' }
  }

  return (
    <div className="cost-estimator">
      <div className="container">
        <div className="page-header">
          <h1>Landed Cost Estimator</h1>
          <p>Calculate and compare total landed costs across suppliers</p>
        </div>

        {/* Input Form */}
        <div className="card mb-xl">
          <h2 className="mb-lg">Product Information</h2>
          <div className="form-grid grid grid-responsive-3 mb-xl">
            <div className="form-group">
              <label className="form-label">Product Name</label>
              <input
                type="text"
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                placeholder="e.g., Men's Cotton Jackets"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">HS Code</label>
              <select
                value={formData.hsCode}
                onChange={(e) => setFormData({ ...formData, hsCode: e.target.value })}
                className="form-select"
              >
                <option value="6203">6203 - Men's Clothing</option>
                <option value="6204">6204 - Women's Clothing</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Quantity</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                className="form-input"
              />
            </div>
          </div>

          <div className="supplier-selection">
            <h3 className="mb-lg">Select Suppliers to Compare</h3>
            <div className="suppliers-grid grid grid-auto">
              {suppliers.map(supplier => (
                <div
                  key={supplier.id}
                  className={`supplier-option ${
                    formData.selectedSuppliers.includes(supplier.id) ? 'selected' : ''
                  }`}
                  onClick={() => handleSupplierToggle(supplier.id)}
                >
                  <div className="supplier-info">
                    <h4>{supplier.name}</h4>
                    <p>{supplier.city}, {supplier.country}</p>
                    <div className="supplier-metrics">
                      <span>${supplier.productCost}/unit</span>
                      <span>{supplier.leadTime} days</span>
                      <span>{supplier.reliability}% reliable</span>
                    </div>
                  </div>
                  <div className="selection-indicator">
                    {formData.selectedSuppliers.includes(supplier.id) && '✓'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button
              onClick={calculateEstimates}
              disabled={loading || formData.selectedSuppliers.length === 0}
              className="btn btn-primary w-full"
            >
              <Calculator size={16} />
              {loading ? 'Calculating...' : 'Calculate Costs'}
            </button>
          </div>
        </div>

        {/* Cost Comparison */}
        {comparison && (
          <div className="card mb-xl">
            <div className="comparison-header">
              <h2>Cost Comparison Summary</h2>
              <button onClick={downloadReport} className="btn btn-outline">
                <Download size={16} />
                Download Report
              </button>
            </div>
            
            <div className="comparison-metrics grid grid-responsive-4">
              <div className="metric-card">
                <div className="metric-value">{formatCurrency(comparison.bestOption.costs.totalLandedCost)}</div>
                <div className="metric-label">Best Total Cost</div>
                <div className="metric-detail">{comparison.bestOption.supplier.name}</div>
              </div>
              
              <div className="metric-card">
                <div className="metric-value">{formatCurrency(comparison.totalSavings)}</div>
                <div className="metric-label">Potential Savings</div>
                <div className="metric-detail">vs Most Expensive Option</div>
              </div>
              
              <div className="metric-card">
                <div className="metric-value">{formatCurrency(comparison.averageCost)}</div>
                <div className="metric-label">Average Cost</div>
                <div className="metric-detail">Across All Options</div>
              </div>
              
              <div className="metric-card">
                <div className="metric-value">{comparison.bestOption.logistics.transitTime} days</div>
                <div className="metric-label">Best Option Transit</div>
                <div className="metric-detail">Including Delays</div>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Estimates */}
        {estimates.length > 0 && (
          <div className="estimates-section">
            <h2 className="mb-xl">Detailed Cost Breakdown</h2>
            
            <div className="estimates-grid grid grid-auto">
              {estimates.map((estimate, index) => {
                const ranking = getCostRanking(index)
                return (
                  <div key={estimate.supplier.id} className="estimate-card card">
                    <div className="estimate-header">
                      <div className="supplier-info">
                        <h3>{estimate.supplier.name}</h3>
                        <p>{estimate.supplier.city}, {estimate.supplier.country}</p>
                      </div>
                      <div className="ranking">
                        <span className={`status ${ranking.color}`}>
                          {ranking.label}
                        </span>
                      </div>
                    </div>

                    <div className="cost-summary">
                      <div className="total-cost">
                        <span className="cost-value">{formatCurrency(estimate.costs.totalLandedCost)}</span>
                        <span className="cost-label">Total Landed Cost</span>
                      </div>
                      <div className="unit-cost">
                        <span className="cost-value">{formatCurrency(estimate.costs.costPerUnit)}</span>
                        <span className="cost-label">Per Unit</span>
                      </div>
                    </div>

                    {estimate.savings > 0 && (
                      <div className="savings-badge">
                        Saves {formatCurrency(estimate.savings)}
                      </div>
                    )}

                    <div className="cost-breakdown">
                      <h4>Cost Breakdown</h4>
                      <div className="breakdown-items">
                        <div className="breakdown-item">
                          <span>Product Cost</span>
                          <span>{formatCurrency(estimate.costs.productCost)}</span>
                        </div>
                        <div className="breakdown-item">
                          <span>Tariffs ({estimate.logistics.tariffRate}%)</span>
                          <span>{formatCurrency(estimate.costs.tariffCost)}</span>
                        </div>
                        <div className="breakdown-item">
                          <span>Shipping</span>
                          <span>{formatCurrency(estimate.costs.shippingCost)}</span>
                        </div>
                        <div className="breakdown-item">
                          <span>Insurance</span>
                          <span>{formatCurrency(estimate.costs.insuranceCost)}</span>
                        </div>
                        <div className="breakdown-item">
                          <span>Customs & Documentation</span>
                          <span>{formatCurrency(estimate.costs.customsBrokerFee + estimate.costs.documentationFee)}</span>
                        </div>
                        <div className="breakdown-item">
                          <span>Warehouse & Handling</span>
                          <span>{formatCurrency(estimate.costs.warehouseFee)}</span>
                        </div>
                        <div className="breakdown-item">
                          <span>Delay Costs</span>
                          <span>{formatCurrency(estimate.costs.delayPenalty)}</span>
                        </div>
                        <div className="breakdown-item">
                          <span>Risk Premium</span>
                          <span>{formatCurrency(estimate.costs.riskPremium)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="logistics-info">
                      <h4>Logistics Details</h4>
                      <div className="logistics-details">
                        <div>Transit Port: {estimate.logistics.port.name}</div>
                        <div>Transit Time: {estimate.logistics.transitTime} days</div>
                        <div>Lead Time: {estimate.supplier.leadTime} days</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .page-header {
          text-align: center;
          margin-bottom: var(--spacing-2xl);
        }

        .form-grid {
          margin-bottom: var(--spacing-xl);
        }

        .supplier-selection {
          margin-bottom: var(--spacing-xl);
        }

        .suppliers-grid {
          gap: var(--spacing-md);
        }

        .supplier-option {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--spacing-lg);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .supplier-option:hover {
          border-color: var(--accent-primary);
          box-shadow: var(--shadow-sm);
        }

        .supplier-option.selected {
          border-color: var(--accent-primary);
          background: rgba(59, 130, 246, 0.05);
          box-shadow: var(--shadow-md);
        }

        .supplier-info h4 {
          margin: 0 0 var(--spacing-xs) 0;
          color: var(--text-primary);
          font-size: clamp(1rem, 2vw, 1.125rem);
        }

        .supplier-info p {
          margin: 0 0 var(--spacing-sm) 0;
          color: var(--text-secondary);
          font-size: clamp(0.75rem, 1.5vw, 0.875rem);
        }

        .supplier-metrics {
          display: flex;
          gap: var(--spacing-sm);
          font-size: clamp(0.7rem, 1.25vw, 0.75rem);
          color: var(--text-tertiary);
          flex-wrap: wrap;
        }

        .selection-indicator {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--accent-primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          flex-shrink: 0;
        }

        .supplier-option:not(.selected) .selection-indicator {
          background: var(--border-color);
          color: transparent;
        }

        .form-actions {
          text-align: center;
        }

        .comparison-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-xl);
          flex-wrap: wrap;
          gap: var(--spacing-md);
        }

        .comparison-metrics {
          gap: var(--spacing-lg);
        }

        .metric-card {
          text-align: center;
          padding: var(--spacing-xl) var(--spacing-md);
          background: var(--bg-secondary);
          border-radius: 8px;
        }

        .metric-value {
          font-size: clamp(1.25rem, 3vw, 1.75rem);
          font-weight: 700;
          color: var(--accent-primary);
          display: block;
          margin-bottom: var(--spacing-sm);
        }

        .metric-label {
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--spacing-xs);
          font-size: clamp(0.875rem, 1.5vw, 1rem);
        }

        .metric-detail {
          font-size: clamp(0.75rem, 1.25vw, 0.875rem);
          color: var(--text-secondary);
        }

        .estimates-grid {
          gap: var(--spacing-xl);
        }

        .estimate-card {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
          height: 100%;
        }

        .estimate-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: var(--spacing-md);
        }

        .estimate-header .supplier-info h3 {
          margin: 0 0 var(--spacing-xs) 0;
          font-size: clamp(1.125rem, 2vw, 1.25rem);
        }

        .estimate-header .supplier-info p {
          margin: 0;
          color: var(--text-secondary);
        }

        .cost-summary {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--spacing-md);
          padding: var(--spacing-lg);
          background: var(--bg-secondary);
          border-radius: 8px;
        }

        .total-cost,
        .unit-cost {
          text-align: center;
        }

        .cost-value {
          font-size: clamp(1.125rem, 2.5vw, 1.25rem);
          font-weight: 700;
          color: var(--text-primary);
          display: block;
        }

        .cost-label {
          font-size: clamp(0.75rem, 1.25vw, 0.875rem);
          color: var(--text-secondary);
        }

        .savings-badge {
          background: var(--accent-success);
          color: white;
          padding: var(--spacing-sm) var(--spacing-md);
          border-radius: 20px;
          text-align: center;
          font-weight: 500;
          font-size: clamp(0.875rem, 1.5vw, 1rem);
        }

        .cost-breakdown,
        .logistics-info {
          flex: 1;
        }

        .cost-breakdown h4,
        .logistics-info h4 {
          margin: 0 0 var(--spacing-md) 0;
          padding-bottom: var(--spacing-sm);
          border-bottom: 1px solid var(--border-color);
          color: var(--text-primary);
          font-size: clamp(1rem, 1.75vw, 1.125rem);
        }

        .breakdown-items {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }

        .breakdown-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-sm);
          background: var(--bg-secondary);
          border-radius: 4px;
          font-size: clamp(0.75rem, 1.25vw, 0.875rem);
        }

        .logistics-details {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
          font-size: clamp(0.75rem, 1.25vw, 0.875rem);
          color: var(--text-secondary);
        }

        /* Mobile optimizations */
        @media (min-width: 480px) {
          .cost-summary {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 479px) {
          .supplier-option {
            flex-direction: column;
            gap: var(--spacing-md);
            text-align: center;
          }
          
          .comparison-header {
            flex-direction: column;
            align-items: stretch;
          }
          
          .estimate-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .breakdown-item {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--spacing-xs);
          }
        }
      `}</style>
    </div>
  )
}

export default CostEstimator