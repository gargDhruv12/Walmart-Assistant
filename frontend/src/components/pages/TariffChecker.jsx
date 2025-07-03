import { useState } from 'react'
import { Calculator, Info, TrendingUp, AlertCircle } from 'lucide-react'
import { tariffData, sampleProducts, suppliers } from '../../data/mockData'

const TariffChecker = () => {
  const [formData, setFormData] = useState({
    hsCode: '',
    originCountry: '',
    destinationCountry: 'USA',
    productValue: '',
    quantity: ''
  })
  
  const [results, setResults] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState('')

  const countries = [...new Set(suppliers.map(supplier => supplier.country))]

  const handleProductSelect = (productId) => {
    const product = sampleProducts.find(p => p.id === parseInt(productId))
    if (product) {
      setFormData({ ...formData, hsCode: product.hsCode })
      setSelectedProduct(productId)
    }
  }

  const calculateTariff = () => {
    const { hsCode, originCountry, destinationCountry, productValue, quantity } = formData
    
    if (!hsCode || !originCountry || !productValue || !quantity) {
      alert('Please fill in all required fields')
      return
    }

    const routeKey = `${originCountry}-${destinationCountry}`
    const tariffInfo = tariffData[hsCode]?.rates[routeKey]

    if (!tariffInfo) {
      setResults({
        error: `No tariff data available for ${routeKey} with HS Code ${hsCode}`
      })
      return
    }

    const totalValue = parseFloat(productValue) * parseInt(quantity)
    const tariffAmount = (totalValue * tariffInfo.rate) / 100
    const totalCostWithTariff = totalValue + tariffAmount

    setResults({
      routeKey,
      tariffRate: tariffInfo.rate,
      description: tariffInfo.description,
      totalValue,
      tariffAmount,
      totalCostWithTariff,
      perUnitTariff: tariffAmount / parseInt(quantity),
      hsCode,
      originCountry,
      destinationCountry,
      quantity: parseInt(quantity)
    })
  }

  const getTariffImpactLevel = (rate) => {
    if (rate > 20) return { level: 'High', color: 'status-high' }
    if (rate > 15) return { level: 'Medium', color: 'status-medium' }
    return { level: 'Low', color: 'status-low' }
  }

  return (
    <div className="tariff-checker">
      <div className="page-header">
        <h1>Tariff & Tax Checker</h1>
        <p>Calculate import tariffs and taxes for your products</p>
      </div>

      <div className="grid grid-2 gap-8">
        {/* Input Form */}
        <div className="card">
          <h2 className="mb-4">Product & Route Information</h2>
          
          <div className="form-group">
            <label className="form-label">Select Product (Optional)</label>
            <select
              value={selectedProduct}
              onChange={(e) => handleProductSelect(e.target.value)}
              className="form-select"
            >
              <option value="">Select a sample product...</option>
              {sampleProducts.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} (HS: {product.hsCode})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">HS Code *</label>
            <input
              type="text"
              value={formData.hsCode}
              onChange={(e) => setFormData({ ...formData, hsCode: e.target.value })}
              placeholder="e.g., 6203"
              className="form-input"
            />
            <small className="form-help">
              <Info size={14} />
              Harmonized System code for product classification
            </small>
          </div>

          <div className="form-group">
            <label className="form-label">Origin Country *</label>
            <select
              value={formData.originCountry}
              onChange={(e) => setFormData({ ...formData, originCountry: e.target.value })}
              className="form-select"
            >
              <option value="">Select origin country...</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Destination Country</label>
            <select
              value={formData.destinationCountry}
              onChange={(e) => setFormData({ ...formData, destinationCountry: e.target.value })}
              className="form-select"
            >
              <option value="USA">United States</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Product Value per Unit ($) *</label>
            <input
              type="number"
              step="0.01"
              value={formData.productValue}
              onChange={(e) => setFormData({ ...formData, productValue: e.target.value })}
              placeholder="e.g., 19.50"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Quantity *</label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              placeholder="e.g., 5000"
              className="form-input"
            />
          </div>

          <button
            onClick={calculateTariff}
            className="btn btn-primary"
          >
            <Calculator size={16} />
            Calculate Tariffs
          </button>
        </div>

        {/* Results */}
        <div className="card">
          <h2 className="mb-4">Tariff Calculation Results</h2>
          
          {!results && (
            <div className="no-results">
              <p>Enter product details and click "Calculate Tariffs" to see results</p>
            </div>
          )}

          {results && results.error && (
            <div className="error-message">
              <AlertCircle size={20} />
              <p>{results.error}</p>
            </div>
          )}

          {results && !results.error && (
            <div className="results-content">
              <div className="result-header">
                <h3>Route: {results.originCountry} → {results.destinationCountry}</h3>
                <p className="text-sm">HS Code: {results.hsCode}</p>
              </div>

              <div className="tariff-overview">
                <div className="tariff-rate">
                  <div className="rate-value">{results.tariffRate}%</div>
                  <div className="rate-label">Tariff Rate</div>
                  <span className={`status ${getTariffImpactLevel(results.tariffRate).color}`}>
                    {getTariffImpactLevel(results.tariffRate).level} Impact
                  </span>
                </div>
              </div>

              <div className="calculation-breakdown">
                <div className="breakdown-item">
                  <span className="breakdown-label">Product Value</span>
                  <span className="breakdown-value">${results.totalValue.toLocaleString()}</span>
                </div>
                <div className="breakdown-item">
                  <span className="breakdown-label">Tariff Amount</span>
                  <span className="breakdown-value">${results.tariffAmount.toLocaleString()}</span>
                </div>
                <div className="breakdown-item total">
                  <span className="breakdown-label">Total Cost</span>
                  <span className="breakdown-value">${results.totalCostWithTariff.toLocaleString()}</span>
                </div>
              </div>

              <div className="additional-info">
                <div className="info-item">
                  <span className="info-label">Tariff per Unit</span>
                  <span className="info-value">${results.perUnitTariff.toFixed(2)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Total Quantity</span>
                  <span className="info-value">{results.quantity.toLocaleString()} units</span>
                </div>
              </div>

              <div className="tariff-note">
                <Info size={16} />
                <p>{results.description}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tariff Comparison Table */}
      <div className="card mt-8">
        <h2 className="mb-4">Tariff Rates Comparison</h2>
        <div className="tariff-table-container">
          <table className="table">
            <thead>
              <tr>
                <th>HS Code</th>
                <th>Product Category</th>
                <th>India → USA</th>
                <th>Vietnam → USA</th>
                <th>Bangladesh → USA</th>
                <th>Thailand → USA</th>
                <th>Indonesia → USA</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(tariffData).map(([hsCode, data]) => (
                <tr key={hsCode}>
                  <td className="font-semibold">{hsCode}</td>
                  <td>{hsCode === '6203' ? "Men's Clothing" : "Women's Clothing"}</td>
                  <td>
                    <span className={`status ${getTariffImpactLevel(data.rates['India-USA']?.rate || 0).color}`}>
                      {data.rates['India-USA']?.rate || 'N/A'}%
                    </span>
                  </td>
                  <td>
                    <span className={`status ${getTariffImpactLevel(data.rates['Vietnam-USA']?.rate || 0).color}`}>
                      {data.rates['Vietnam-USA']?.rate || 'N/A'}%
                    </span>
                  </td>
                  <td>
                    <span className={`status ${getTariffImpactLevel(data.rates['Bangladesh-USA']?.rate || 0).color}`}>
                      {data.rates['Bangladesh-USA']?.rate || 'N/A'}%
                    </span>
                  </td>
                  <td>
                    <span className={`status ${getTariffImpactLevel(data.rates['Thailand-USA']?.rate || 0).color}`}>
                      {data.rates['Thailand-USA']?.rate || 'N/A'}%
                    </span>
                  </td>
                  <td>
                    <span className={`status ${getTariffImpactLevel(data.rates['Indonesia-USA']?.rate || 0).color}`}>
                      {data.rates['Indonesia-USA']?.rate || 'N/A'}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .page-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .form-help {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-tertiary);
          font-size: 0.75rem;
          margin-top: 0.25rem;
        }

        .no-results {
          text-align: center;
          padding: 3rem;
          color: var(--text-secondary);
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          color: #dc2626;
        }

        .dark .error-message {
          background: #3c1618;
          border-color: #7f1d1d;
          color: #fca5a5;
        }

        .results-content {
          space-y: 1.5rem;
        }

        .result-header {
          margin-bottom: 1.5rem;
        }

        .result-header h3 {
          margin: 0;
          color: var(--text-primary);
        }

        .tariff-overview {
          background: var(--bg-secondary);
          padding: 1.5rem;
          border-radius: 8px;
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .tariff-rate {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .rate-value {
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--accent-primary);
        }

        .rate-label {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .calculation-breakdown {
          border: 1px solid var(--border-color);
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 1.5rem;
        }

        .breakdown-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid var(--border-color);
        }

        .breakdown-item:last-child {
          border-bottom: none;
        }

        .breakdown-item.total {
          background: var(--bg-secondary);
          font-weight: 600;
        }

        .breakdown-label {
          color: var(--text-secondary);
        }

        .breakdown-value {
          color: var(--text-primary);
          font-weight: 500;
        }

        .additional-info {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          text-align: center;
          padding: 1rem;
          background: var(--bg-secondary);
          border-radius: 8px;
        }

        .info-label {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .info-value {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .tariff-note {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 1rem;
          background: var(--bg-secondary);
          border-radius: 8px;
          color: var(--text-secondary);
        }

        .tariff-note svg {
          flex-shrink: 0;
          margin-top: 0.125rem;
        }

        .tariff-note p {
          margin: 0;
        }

        .tariff-table-container {
          overflow-x: auto;
        }

        @media (max-width: 768px) {
          .grid-2 {
            grid-template-columns: 1fr;
          }
          
          .additional-info {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}

export default TariffChecker