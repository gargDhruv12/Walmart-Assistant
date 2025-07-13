import { useState, useEffect } from 'react';
import { Stepper, Step, StepLabel, Button, Box } from '@mui/material';
import { Calculator, TrendingUp, AlertCircle, Download } from 'lucide-react';
import { suppliers, tariffData, ports, destinationPorts } from '../../data/mockData';
import { useLocation, useNavigate } from 'react-router-dom';

const CostEstimator = () => {
  const [formData, setFormData] = useState({
    productName: '',
    hsCode: '6203',
    quantity: 5000,
    selectedSuppliers: []
  });
  const [estimates, setEstimates] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);

  // Wizard logic
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
      {isWizard && (
        <Box sx={{ maxWidth: 900, mx: 'auto', mt: 2, mb: 2 }}>
          <Stepper activeStep={4} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button variant="outlined" onClick={() => navigate('/routes?wizard=1')}>Back</Button>
            <Button variant="contained" color="success" onClick={() => navigate('/?wizard=1')}>Finish</Button>
          </Box>
        </Box>
      )}
      <div className="page-header">
        <h1>Landed Cost Estimator</h1>
        <p>Calculate and compare total landed costs across suppliers</p>
      </div>

      {/* Input Form */}
      <div className="card mb-6">
        <h2 className="mb-4">Product Information</h2>
        <div className="form-grid">
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
          <h3 className="mb-4">Select Suppliers to Compare</h3>
          <div className="suppliers-grid">
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
            className="btn btn-primary"
          >
            <Calculator size={16} />
            {loading ? 'Calculating...' : 'Calculate Costs'}
          </button>
        </div>
      </div>

      {/* Cost Comparison */}
      {comparison && (
        <div className="card mb-6">
          <div className="comparison-header">
            <h2>Cost Comparison Summary</h2>
            <button onClick={downloadReport} className="btn btn-outline">
              <Download size={16} />
              Download Report
            </button>
          </div>
          
          <div className="comparison-metrics">
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
          <h2 className="mb-6">Detailed Cost Breakdown</h2>
          
          <div className="estimates-grid">
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

      <style jsx>{`
        .page-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .supplier-selection {
          margin-bottom: 2rem;
        }

        .suppliers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1rem;
        }

        .supplier-option {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
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
          background: var(--accent-primary)05;
          box-shadow: var(--shadow-md);
        }

        .supplier-info h4 {
          margin: 0 0 0.25rem 0;
          color: var(--text-primary);
        }

        .supplier-info p {
          margin: 0 0 0.5rem 0;
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .supplier-metrics {
          display: flex;
          gap: 1rem;
          font-size: 0.75rem;
          color: var(--text-tertiary);
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
          margin-bottom: 2rem;
        }

        .comparison-metrics {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
        }

        .metric-card {
          text-align: center;
          padding: 1.5rem;
          background: var(--bg-secondary);
          border-radius: 8px;
        }

        .metric-value {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--accent-primary);
          display: block;
          margin-bottom: 0.5rem;
        }

        .metric-label {
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .metric-detail {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .estimates-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 2rem;
        }

        .estimate-card {
          padding: 1.5rem;
        }

        .estimate-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
        }

        .estimate-header .supplier-info h3 {
          margin: 0 0 0.25rem 0;
        }

        .estimate-header .supplier-info p {
          margin: 0;
          color: var(--text-secondary);
        }

        .cost-summary {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
          padding: 1rem;
          background: var(--bg-secondary);
          border-radius: 8px;
        }

        .total-cost,
        .unit-cost {
          text-align: center;
        }

        .cost-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
          display: block;
        }

        .cost-label {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .savings-badge {
          background: var(--accent-success);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          text-align: center;
          font-weight: 500;
          margin-bottom: 1rem;
        }

        .cost-breakdown,
        .logistics-info {
          margin-bottom: 1.5rem;
        }

        .cost-breakdown h4,
        .logistics-info h4 {
          margin: 0 0 1rem 0;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--border-color);
          color: var(--text-primary);
        }

        .breakdown-items {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .breakdown-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem;
          background: var(--bg-secondary);
          border-radius: 4px;
          font-size: 0.875rem;
        }

        .logistics-details {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
          
          .suppliers-grid {
            grid-template-columns: 1fr;
          }
          
          .comparison-metrics {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .estimates-grid {
            grid-template-columns: 1fr;
          }
          
          .comparison-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }
        }

        @media (max-width: 480px) {
          .comparison-metrics {
            grid-template-columns: 1fr;
          }
          
          .cost-summary {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}

export default CostEstimator