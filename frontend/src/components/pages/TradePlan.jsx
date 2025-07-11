import { useState } from 'react'
import { FileText, Download, Calendar, MapPin, DollarSign, Truck, CheckCircle } from 'lucide-react'
import { suppliers, ports, destinationPorts, tariffData } from '../../data/mockData'
import jsPDF from 'jspdf'

const TradePlan = () => {
  const [planData, setPlanData] = useState({
    supplier: null,
    product: {
      name: '',
      hsCode: '6203',
      quantity: 5000,
      unitPrice: 0
    },
    route: {
      transitPort: null,
      destinationPort: null
    },
    timeline: null,
    costs: null
  })

  const [selectedSupplier, setSelectedSupplier] = useState('')
  const [generatedPlan, setGeneratedPlan] = useState(null)

  const generateTradePlan = () => {
    if (!selectedSupplier || !planData.product.name || !planData.product.quantity) {
      alert('Please fill in all required fields')
      return
    }

    const supplier = suppliers.find(s => s.id === parseInt(selectedSupplier))
    
    // Find best route
    const availablePorts = ports.filter(port => port.connectivity[supplier.country])
    const bestTransitPort = availablePorts.reduce((best, current) => {
      const currentCost = current.shippingCost + 
                         (current.connectivity[supplier.country]?.distance || 0) * 0.1
      const bestCost = best.shippingCost + 
                      (best.connectivity[supplier.country]?.distance || 0) * 0.1
      return currentCost < bestCost ? current : best
    }, availablePorts[0])

    const bestDestinationPort = destinationPorts[0] // Default to LA Port

    // Calculate costs
    const productCost = (planData.product.unitPrice || supplier.productCost) * planData.product.quantity
    const routeKey = `${supplier.country}-USA`
    const tariffRate = tariffData[planData.product.hsCode]?.rates[routeKey]?.rate || 0
    const tariffCost = (productCost * tariffRate) / 100

    const costs = {
      productCost,
      tariffCost,
      shippingCost: bestTransitPort.shippingCost,
      insuranceCost: productCost * 0.005,
      customsFees: 225, // Broker + documentation
      warehouseFees: planData.product.quantity * 0.25,
      totalCost: 0
    }
    costs.totalCost = Object.values(costs).reduce((sum, cost) => 
      typeof cost === 'number' ? sum + cost : sum, 0
    )

    // Calculate timeline
    const transitTime = bestTransitPort.connectivity[supplier.country]?.transitTime || 0
    const totalLeadTime = supplier.leadTime + transitTime + bestTransitPort.averageDelay + 
                         bestDestinationPort.averageDelay

    const timeline = {
      orderDate: new Date(),
      productionStart: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      productionComplete: new Date(Date.now() + supplier.leadTime * 24 * 60 * 60 * 1000),
      shipmentDeparture: new Date(Date.now() + (supplier.leadTime + 2) * 24 * 60 * 60 * 1000),
      portArrival: new Date(Date.now() + (supplier.leadTime + transitTime + 5) * 24 * 60 * 60 * 1000),
      customsClearance: new Date(Date.now() + (supplier.leadTime + transitTime + 8) * 24 * 60 * 60 * 1000),
      deliveryDate: new Date(Date.now() + totalLeadTime * 24 * 60 * 60 * 1000),
      totalLeadTime
    }

    const plan = {
      id: `TP-${Date.now()}`,
      supplier,
      product: planData.product,
      route: {
        transitPort: bestTransitPort,
        destinationPort: bestDestinationPort
      },
      costs,
      timeline,
      documents: [
        'Commercial Invoice',
        'Packing List', 
        'Bill of Lading',
        'Certificate of Origin',
        'Import License (if required)',
        'Insurance Certificate',
        'Customs Declaration'
      ],
      complianceRequirements: [
        `HS Code: ${planData.product.hsCode}`,
        `Tariff Rate: ${tariffRate}%`,
        'FDA Registration (if applicable)',
        'CPSC Compliance (if applicable)',
        'Customs Bond Required',
        'ISF Filing (10+2 Rule)'
      ],
      riskFactors: [
        {
          risk: 'Currency Fluctuation',
          level: supplier.country === 'India' ? 'High' : 'Medium',
          mitigation: 'Consider forward contract for large orders'
        },
        {
          risk: 'Port Congestion',
          level: bestTransitPort.congestionLevel,
          mitigation: 'Monitor port conditions and have backup routes'
        },
        {
          risk: 'Supplier Reliability',
          level: supplier.reliability > 90 ? 'Low' : supplier.reliability > 85 ? 'Medium' : 'High',
          mitigation: 'Regular communication and milestone tracking'
        }
      ]
    }

    setGeneratedPlan(plan)
  }

  const downloadPDF = () => {
    if (!generatedPlan) return

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.width
    const margin = 20
    let yPosition = margin

    // Helper function to add text
    const addText = (text, x, y, options = {}) => {
      doc.setFontSize(options.fontSize || 12)
      doc.setFont('helvetica', options.fontStyle || 'normal')
      doc.text(text, x, y)
      return y + (options.lineHeight || 7)
    }

    // Header
    doc.setFillColor(59, 130, 246)
    doc.rect(0, 0, pageWidth, 30, 'F')
    doc.setTextColor(255, 255, 255)
    yPosition = addText('WALMART TRADE PLAN', margin, 20, { fontSize: 20, fontStyle: 'bold' })
    
    doc.setTextColor(0, 0, 0)
    yPosition += 10

    // Plan Details
    yPosition = addText(`Plan ID: ${generatedPlan.id}`, margin, yPosition, { fontStyle: 'bold' })
    yPosition = addText(`Generated: ${new Date().toLocaleDateString()}`, margin, yPosition)
    yPosition += 10

    // Product Information
    yPosition = addText('PRODUCT INFORMATION', margin, yPosition, { fontSize: 14, fontStyle: 'bold' })
    yPosition += 5
    yPosition = addText(`Product: ${generatedPlan.product.name}`, margin, yPosition)
    yPosition = addText(`HS Code: ${generatedPlan.product.hsCode}`, margin, yPosition)
    yPosition = addText(`Quantity: ${generatedPlan.product.quantity.toLocaleString()} units`, margin, yPosition)
    yPosition += 10

    // Supplier Information
    yPosition = addText('SUPPLIER INFORMATION', margin, yPosition, { fontSize: 14, fontStyle: 'bold' })
    yPosition += 5
    yPosition = addText(`Supplier: ${generatedPlan.supplier.name}`, margin, yPosition)
    yPosition = addText(`Location: ${generatedPlan.supplier.city}, ${generatedPlan.supplier.country}`, margin, yPosition)
    yPosition = addText(`Reliability: ${generatedPlan.supplier.reliability}%`, margin, yPosition)
    yPosition += 10

    // Cost Breakdown
    yPosition = addText('COST BREAKDOWN', margin, yPosition, { fontSize: 14, fontStyle: 'bold' })
    yPosition += 5
    yPosition = addText(`Product Cost: $${generatedPlan.costs.productCost.toLocaleString()}`, margin, yPosition)
    yPosition = addText(`Tariffs: $${generatedPlan.costs.tariffCost.toLocaleString()}`, margin, yPosition)
    yPosition = addText(`Shipping: $${generatedPlan.costs.shippingCost.toLocaleString()}`, margin, yPosition)
    yPosition = addText(`Other Fees: $${(generatedPlan.costs.totalCost - generatedPlan.costs.productCost - generatedPlan.costs.tariffCost - generatedPlan.costs.shippingCost).toLocaleString()}`, margin, yPosition)
    yPosition = addText(`TOTAL: $${generatedPlan.costs.totalCost.toLocaleString()}`, margin, yPosition, { fontStyle: 'bold' })
    yPosition += 10

    // Timeline
    yPosition = addText('TIMELINE', margin, yPosition, { fontSize: 14, fontStyle: 'bold' })
    yPosition += 5
    yPosition = addText(`Production Complete: ${generatedPlan.timeline.productionComplete.toLocaleDateString()}`, margin, yPosition)
    yPosition = addText(`Shipment Departure: ${generatedPlan.timeline.shipmentDeparture.toLocaleDateString()}`, margin, yPosition)
    yPosition = addText(`Expected Delivery: ${generatedPlan.timeline.deliveryDate.toLocaleDateString()}`, margin, yPosition)
    yPosition = addText(`Total Lead Time: ${generatedPlan.timeline.totalLeadTime} days`, margin, yPosition, { fontStyle: 'bold' })

    doc.save(`walmart-trade-plan-${generatedPlan.id}.pdf`)
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getRiskColor = (level) => {
    switch (level.toLowerCase()) {
      case 'high': return 'status-high'
      case 'medium': return 'status-medium'
      default: return 'status-low'
    }
  }

  return (
    <div className="trade-plan">
      <div className="page-header">
        <h1>Trade Plan Generator</h1>
        <p>Create comprehensive trade execution plans for your orders</p>
      </div>

      {/* Plan Generator Form */}
      <div className="card mb-6">
        <h2 className="mb-4">Plan Configuration</h2>
        
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Product Name *</label>
            <input
              type="text"
              value={planData.product.name}
              onChange={(e) => setPlanData({
                ...planData,
                product: { ...planData.product, name: e.target.value }
              })}
              placeholder="e.g., Men's Cotton Jackets"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">HS Code</label>
            <select
              value={planData.product.hsCode}
              onChange={(e) => setPlanData({
                ...planData,
                product: { ...planData.product, hsCode: e.target.value }
              })}
              className="form-select"
            >
              <option value="6203">6203 - Men's Clothing</option>
              <option value="6204">6204 - Women's Clothing</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Quantity *</label>
            <input
              type="number"
              value={planData.product.quantity}
              onChange={(e) => setPlanData({
                ...planData,
                product: { ...planData.product, quantity: parseInt(e.target.value) || 0 }
              })}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Unit Price (optional)</label>
            <input
              type="number"
              step="0.01"
              value={planData.product.unitPrice}
              onChange={(e) => setPlanData({
                ...planData,
                product: { ...planData.product, unitPrice: parseFloat(e.target.value) || 0 }
              })}
              placeholder="Leave empty to use supplier default"
              className="form-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Select Supplier *</label>
          <select
            value={selectedSupplier}
            onChange={(e) => setSelectedSupplier(e.target.value)}
            className="form-select"
          >
            <option value="">Choose a supplier...</option>
            {suppliers.map(supplier => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name} - {supplier.city}, {supplier.country} (${supplier.productCost}/unit)
              </option>
            ))}
          </select>
        </div>

        <div className="form-actions">
          <button
            onClick={generateTradePlan}
            className="btn btn-primary w-full"
          >
            <FileText size={16} />
            Generate Trade Plan
          </button>
        </div>
      </div>

      {/* Generated Plan */}
      {generatedPlan && (
        <div className="generated-plan">
          {/* Plan Header */}
          <div className="card plan-header">
            <div className="plan-title">
              <h2>Trade Plan: {generatedPlan.id}</h2>
              <p>Generated on {formatDate(new Date())}</p>
            </div>
            <button onClick={downloadPDF} className="btn btn-secondary">
              <Download size={16} />
              Download PDF
            </button>
          </div>

          {/* Executive Summary */}
          <div className="card">
            <h3>Executive Summary</h3>
            <div className="summary-grid">
              <div className="summary-card">
                <div className="summary-icon">
                  <DollarSign size={24} />
                </div>
                <div className="summary-content">
                  <div className="summary-value">${generatedPlan.costs.totalCost.toLocaleString()}</div>
                  <div className="summary-label">Total Landed Cost</div>
                </div>
              </div>

              <div className="summary-card">
                <div className="summary-icon">
                  <Calendar size={24} />
                </div>
                <div className="summary-content">
                  <div className="summary-value">{generatedPlan.timeline.totalLeadTime} days</div>
                  <div className="summary-label">Total Lead Time</div>
                </div>
              </div>

              <div className="summary-card">
                <div className="summary-icon">
                  <MapPin size={24} />
                </div>
                <div className="summary-content">
                  <div className="summary-value">{generatedPlan.route.transitPort.name}</div>
                  <div className="summary-label">Transit Port</div>
                </div>
              </div>

              <div className="summary-card">
                <div className="summary-icon">
                  <Truck size={24} />
                </div>
                <div className="summary-content">
                  <div className="summary-value">{formatDate(generatedPlan.timeline.deliveryDate)}</div>
                  <div className="summary-label">Expected Delivery</div>
                </div>
              </div>
            </div>
          </div>

          <div className="plan-details grid grid-2">
            {/* Product & Supplier Info */}
            <div className="card">
              <h3>Product & Supplier Details</h3>
              <div className="detail-section">
                <h4>Product Information</h4>
                <div className="detail-grid">
                  <span>Product Name:</span>
                  <span>{generatedPlan.product.name}</span>
                  <span>HS Code:</span>
                  <span>{generatedPlan.product.hsCode}</span>
                  <span>Quantity:</span>
                  <span>{generatedPlan.product.quantity.toLocaleString()} units</span>
                </div>
              </div>

              <div className="detail-section">
                <h4>Supplier Information</h4>
                <div className="detail-grid">
                  <span>Supplier:</span>
                  <span>{generatedPlan.supplier.name}</span>
                  <span>Location:</span>
                  <span>{generatedPlan.supplier.city}, {generatedPlan.supplier.country}</span>
                  <span>Reliability:</span>
                  <span className={`status ${getRiskColor(generatedPlan.supplier.reliability > 90 ? 'Low' : 'Medium')}`}>
                    {generatedPlan.supplier.reliability}%
                  </span>
                  <span>Lead Time:</span>
                  <span>{generatedPlan.supplier.leadTime} days</span>
                </div>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="card">
              <h3>Cost Breakdown</h3>
              <div className="cost-breakdown">
                <div className="cost-item">
                  <span>Product Cost</span>
                  <span>${generatedPlan.costs.productCost.toLocaleString()}</span>
                </div>
                <div className="cost-item">
                  <span>Tariffs & Duties</span>
                  <span>${generatedPlan.costs.tariffCost.toLocaleString()}</span>
                </div>
                <div className="cost-item">
                  <span>Shipping Cost</span>
                  <span>${generatedPlan.costs.shippingCost.toLocaleString()}</span>
                </div>
                <div className="cost-item">
                  <span>Insurance</span>
                  <span>${generatedPlan.costs.insuranceCost.toLocaleString()}</span>
                </div>
                <div className="cost-item">
                  <span>Customs & Documentation</span>
                  <span>${generatedPlan.costs.customsFees.toLocaleString()}</span>
                </div>
                <div className="cost-item">
                  <span>Warehouse & Handling</span>
                  <span>${generatedPlan.costs.warehouseFees.toLocaleString()}</span>
                </div>
                <div className="cost-item total">
                  <span>Total Landed Cost</span>
                  <span>${generatedPlan.costs.totalCost.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="card">
            <h3>Project Timeline</h3>
            <div className="timeline">
              <div className="timeline-item">
                <div className="timeline-icon">
                  <CheckCircle size={16} />
                </div>
                <div className="timeline-content">
                  <div className="timeline-title">Order Placement</div>
                  <div className="timeline-date">{formatDate(generatedPlan.timeline.orderDate)}</div>
                </div>
              </div>

              <div className="timeline-item">
                <div className="timeline-icon">
                  <CheckCircle size={16} />
                </div>
                <div className="timeline-content">
                  <div className="timeline-title">Production Start</div>
                  <div className="timeline-date">{formatDate(generatedPlan.timeline.productionStart)}</div>
                </div>
              </div>

              <div className="timeline-item">
                <div className="timeline-icon">
                  <Calendar size={16} />
                </div>
                <div className="timeline-content">
                  <div className="timeline-title">Production Complete</div>
                  <div className="timeline-date">{formatDate(generatedPlan.timeline.productionComplete)}</div>
                </div>
              </div>

              <div className="timeline-item">
                <div className="timeline-icon">
                  <Calendar size={16} />
                </div>
                <div className="timeline-content">
                  <div className="timeline-title">Shipment Departure</div>
                  <div className="timeline-date">{formatDate(generatedPlan.timeline.shipmentDeparture)}</div>
                </div>
              </div>

              <div className="timeline-item">
                <div className="timeline-icon">
                  <Calendar size={16} />
                </div>
                <div className="timeline-content">
                  <div className="timeline-title">Port Arrival</div>
                  <div className="timeline-date">{formatDate(generatedPlan.timeline.portArrival)}</div>
                </div>
              </div>

              <div className="timeline-item">
                <div className="timeline-icon">
                  <Calendar size={16} />
                </div>
                <div className="timeline-content">
                  <div className="timeline-title">Customs Clearance</div>
                  <div className="timeline-date">{formatDate(generatedPlan.timeline.customsClearance)}</div>
                </div>
              </div>

              <div className="timeline-item">
                <div className="timeline-icon">
                  <Calendar size={16} />
                </div>
                <div className="timeline-content">
                  <div className="timeline-title">Final Delivery</div>
                  <div className="timeline-date">{formatDate(generatedPlan.timeline.deliveryDate)}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="plan-appendix grid grid-2">
            {/* Required Documents */}
            <div className="card">
              <h3>Required Documents</h3>
              <div className="document-list">
                {generatedPlan.documents.map((doc, index) => (
                  <div key={index} className="document-item">
                    <FileText size={16} />
                    <span>{doc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Assessment */}
            <div className="card">
              <h3>Risk Assessment</h3>
              <div className="risk-list">
                {generatedPlan.riskFactors.map((risk, index) => (
                  <div key={index} className="risk-item">
                    <div className="risk-header">
                      <span className="risk-name">{risk.risk}</span>
                      <span className={`status ${getRiskColor(risk.level)}`}>
                        {risk.level}
                      </span>
                    </div>
                    <div className="risk-mitigation">
                      {risk.mitigation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
          grid-template-columns: 1fr;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .form-actions {
          text-align: center;
        }

        .generated-plan {
          margin-top: 2rem;
        }

        .plan-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .plan-title h2 {
          margin: 0;
          color: var(--text-primary);
          font-size: clamp(1.25rem, 2.5vw, 1.5rem);
        }

        .plan-title p {
          margin: 0;
          color: var(--text-secondary);
          font-size: clamp(0.875rem, 1.5vw, 1rem);
        }

        .summary-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        .summary-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: var(--bg-secondary);
          border-radius: 8px;
        }

        .summary-icon {
          background: var(--accent-primary);
          color: white;
          padding: 0.75rem;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .summary-value {
          font-size: clamp(1.125rem, 2.5vw, 1.25rem);
          font-weight: 700;
          color: var(--text-primary);
        }

        .summary-label {
          font-size: clamp(0.75rem, 1.25vw, 0.875rem);
          color: var(--text-secondary);
        }

        .plan-details {
          margin: 2rem 0;
        }

        .detail-section {
          margin-bottom: 1.5rem;
        }

        .detail-section:last-child {
          margin-bottom: 0;
        }

        .detail-section h4 {
          margin: 0 0 1rem 0;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--border-color);
          color: var(--text-primary);
          font-size: clamp(1rem, 1.75vw, 1.125rem);
        }

        .detail-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.5rem;
          font-size: clamp(0.875rem, 1.5vw, 1rem);
        }

        .detail-grid span:nth-child(odd) {
          color: var(--text-secondary);
          font-weight: 500;
        }

        .detail-grid span:nth-child(even) {
          color: var(--text-primary);
        }

        .cost-breakdown {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .cost-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background: var(--bg-secondary);
          border-radius: 6px;
          font-size: clamp(0.875rem, 1.5vw, 1rem);
        }

        .cost-item.total {
          background: var(--accent-primary)10;
          border: 1px solid var(--accent-primary);
          font-weight: 600;
        }

        .timeline {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .timeline-item {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .timeline-icon {
          background: var(--accent-primary);
          color: white;
          padding: 0.5rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .timeline-title {
          font-weight: 600;
          color: var(--text-primary);
          font-size: clamp(0.875rem, 1.5vw, 1rem);
        }

        .timeline-date {
          font-size: clamp(0.75rem, 1.25vw, 0.875rem);
          color: var(--text-secondary);
        }

        .plan-appendix {
          margin-top: 2rem;
        }

        .document-list,
        .risk-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .document-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: var(--bg-secondary);
          border-radius: 6px;
          color: var(--text-primary);
          font-size: clamp(0.875rem, 1.5vw, 1rem);
        }

        .document-item svg {
          color: var(--accent-primary);
          flex-shrink: 0;
        }

        .risk-item {
          padding: 1rem;
          background: var(--bg-secondary);
          border-radius: 6px;
        }

        .risk-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .risk-name {
          font-weight: 600;
          color: var(--text-primary);
          font-size: clamp(0.875rem, 1.5vw, 1rem);
        }

        .risk-mitigation {
          font-size: clamp(0.75rem, 1.25vw, 0.875rem);
          color: var(--text-secondary);
        }

        /* Mobile optimizations */
        @media (min-width: 480px) {
          .form-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .summary-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .detail-grid {
            grid-template-columns: auto 1fr;
            gap: 0.75rem 1rem;
          }
        }

        @media (min-width: 768px) {
          .plan-header {
            flex-wrap: nowrap;
          }
          
          .summary-grid {
            grid-template-columns: repeat(4, 1fr);
          }
          
          .plan-details,
          .plan-appendix {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1024px) {
          .form-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        @media (max-width: 479px) {
          .plan-header {
            flex-direction: column;
            align-items: stretch;
          }
          
          .summary-card {
            flex-direction: column;
            text-align: center;
            gap: 0.75rem;
          }
          
          .timeline-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
          
          .risk-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .cost-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  )
}

export default TradePlan