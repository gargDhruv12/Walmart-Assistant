import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import { Ship, Clock, DollarSign, AlertTriangle, Navigation } from 'lucide-react'
import { ports, destinationPorts, routes, suppliers } from '../../data/mockData'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in react-leaflet
import L from 'leaflet'
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const RoutePlanner = () => {
  const [selectedSupplier, setSelectedSupplier] = useState('')
  const [selectedDestination, setSelectedDestination] = useState('')
  const [routeOptions, setRouteOptions] = useState([])
  const [selectedRoute, setSelectedRoute] = useState(null)
  const [mapCenter, setMapCenter] = useState([20, 100])
  const [mapZoom, setMapZoom] = useState(3)

  useEffect(() => {
    if (selectedSupplier && selectedDestination) {
      generateRouteOptions()
    }
  }, [selectedSupplier, selectedDestination])

  const generateRouteOptions = () => {
    const supplier = suppliers.find(s => s.id === parseInt(selectedSupplier))
    const destination = destinationPorts.find(d => d.id === parseInt(selectedDestination))
    
    if (!supplier || !destination) return

    // Generate route options through different intermediate ports
    const options = ports.map(port => {
      const supplierToPort = port.connectivity[supplier.country]
      if (!supplierToPort) return null

      const portToDestination = {
        distance: calculateDistance(port.coordinates, destination.coordinates),
        transitTime: Math.ceil(calculateDistance(port.coordinates, destination.coordinates) / 500) + 2
      }

      const totalDistance = supplierToPort.distance + portToDestination.distance
      const totalTransitTime = supplierToPort.transitTime + portToDestination.transitTime + port.averageDelay + destination.averageDelay
      const totalCost = port.shippingCost + destination.unloadingCost + (totalDistance * 0.15)

      return {
        id: `${supplier.id}-${port.id}-${destination.id}`,
        supplier,
        intermediatePort: port,
        destination,
        segments: [
          {
            from: supplier.coordinates,
            to: port.coordinates,
            type: 'supplier-to-port'
          },
          {
            from: port.coordinates,
            to: destination.coordinates,
            type: 'port-to-destination'
          }
        ],
        totalDistance,
        totalTransitTime,
        totalCost,
        riskLevel: getRiskLevel(port.congestionLevel, supplier.country),
        details: {
          supplierToPort: supplierToPort,
          portToDestination: portToDestination,
          portDelay: port.averageDelay,
          destinationDelay: destination.averageDelay
        }
      }
    }).filter(Boolean)

    // Sort by total cost
    options.sort((a, b) => a.totalCost - b.totalCost)
    setRouteOptions(options)
    
    if (options.length > 0) {
      setSelectedRoute(options[0])
      // Center map to show the route
      const bounds = [
        ...options[0].segments.map(s => s.from),
        ...options[0].segments.map(s => s.to)
      ]
      const centerLat = bounds.reduce((sum, coord) => sum + coord[0], 0) / bounds.length
      const centerLng = bounds.reduce((sum, coord) => sum + coord[1], 0) / bounds.length
      setMapCenter([centerLat, centerLng])
      setMapZoom(3)
    }
  }

  const calculateDistance = (coord1, coord2) => {
    const R = 6371 // Earth's radius in km
    const dLat = (coord2[0] - coord1[0]) * Math.PI / 180
    const dLon = (coord2[1] - coord1[1]) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(coord1[0] * Math.PI / 180) * Math.cos(coord2[0] * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  const getRiskLevel = (congestionLevel, country) => {
    const congestionRisk = congestionLevel === 'High' ? 2 : congestionLevel === 'Medium' ? 1 : 0
    const countryRisk = ['Bangladesh', 'Indonesia'].includes(country) ? 1 : 0
    const totalRisk = congestionRisk + countryRisk
    
    if (totalRisk >= 2) return 'High'
    if (totalRisk === 1) return 'Medium'
    return 'Low'
  }

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'High': return 'status-high'
      case 'Medium': return 'status-medium'
      default: return 'status-low'
    }
  }

  return (
    <div className="route-planner">
      <div className="page-header">
        <h1>Route Planner</h1>
        <p>Plan optimal shipping routes and visualize your supply chain</p>
      </div>

      {/* Route Configuration */}
      <div className="card mb-6">
        <h2 className="mb-4">Route Configuration</h2>
        <div className="route-config">
          <div className="form-group">
            <label className="form-label">Select Supplier</label>
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="form-select"
            >
              <option value="">Choose a supplier...</option>
              {suppliers.map(supplier => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name} - {supplier.city}, {supplier.country}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Select Destination Port</label>
            <select
              value={selectedDestination}
              onChange={(e) => setSelectedDestination(e.target.value)}
              className="form-select"
            >
              <option value="">Choose destination...</option>
              {destinationPorts.map(port => (
                <option key={port.id} value={port.id}>
                  {port.name} - {port.city}, {port.country}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Map and Route Options */}
      <div className="grid grid-2 gap-8">
        {/* Route Map */}
        <div className="card">
          <h2 className="mb-4">Route Visualization</h2>
          <div className="map-container">
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              
              {/* Supplier Markers */}
              {selectedSupplier && (
                <Marker position={suppliers.find(s => s.id === parseInt(selectedSupplier))?.coordinates || [0, 0]}>
                  <Popup>
                    <strong>Supplier</strong><br />
                    {suppliers.find(s => s.id === parseInt(selectedSupplier))?.name}
                  </Popup>
                </Marker>
              )}

              {/* Port Markers */}
              {ports.map(port => (
                <Marker key={port.id} position={port.coordinates}>
                  <Popup>
                    <strong>{port.name}</strong><br />
                    {port.city}, {port.country}<br />
                    Congestion: {port.congestionLevel}
                  </Popup>
                </Marker>
              ))}

              {/* Destination Markers */}
              {selectedDestination && (
                <Marker position={destinationPorts.find(d => d.id === parseInt(selectedDestination))?.coordinates || [0, 0]}>
                  <Popup>
                    <strong>Destination</strong><br />
                    {destinationPorts.find(d => d.id === parseInt(selectedDestination))?.name}
                  </Popup>
                </Marker>
              )}

              {/* Route Lines */}
              {selectedRoute && selectedRoute.segments.map((segment, index) => (
                <Polyline
                  key={index}
                  positions={[segment.from, segment.to]}
                  color={segment.type === 'supplier-to-port' ? '#3b82f6' : '#14b8a6'}
                  weight={3}
                  opacity={0.7}
                />
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Route Options */}
        <div className="card">
          <h2 className="mb-4">Route Options</h2>
          {routeOptions.length === 0 ? (
            <div className="no-routes">
              <p>Select a supplier and destination to see route options</p>
            </div>
          ) : (
            <div className="route-options">
              {routeOptions.map((route, index) => (
                <div
                  key={route.id}
                  className={`route-option ${selectedRoute?.id === route.id ? 'selected' : ''}`}
                  onClick={() => setSelectedRoute(route)}
                >
                  <div className="route-header">
                    <div className="route-title">
                      <Navigation size={16} />
                      <span>Via {route.intermediatePort.name}</span>
                    </div>
                    <span className={`status ${getRiskColor(route.riskLevel)}`}>
                      {route.riskLevel} Risk
                    </span>
                  </div>

                  <div className="route-metrics">
                    <div className="metric">
                      <Clock size={14} />
                      <span>{route.totalTransitTime} days</span>
                    </div>
                    <div className="metric">
                      <Ship size={14} />
                      <span>{route.totalDistance.toLocaleString()} km</span>
                    </div>
                    <div className="metric">
                      <DollarSign size={14} />
                      <span>${route.totalCost.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="route-path">
                    <span>{route.supplier.city}</span>
                    <span>→</span>
                    <span>{route.intermediatePort.city}</span>
                    <span>→</span>
                    <span>{route.destination.city}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Route Details */}
      {selectedRoute && (
        <div className="card mt-8">
          <h2 className="mb-4">Detailed Route Information</h2>
          <div className="route-details">
            <div className="detail-section">
              <h3>Route Segments</h3>
              <div className="segments">
                <div className="segment">
                  <div className="segment-header">
                    <span className="segment-title">Supplier to Transit Port</span>
                    <span className="segment-distance">
                      {selectedRoute.details.supplierToPort.distance.toLocaleString()} km
                    </span>
                  </div>
                  <div className="segment-details">
                    <span>{selectedRoute.supplier.city}, {selectedRoute.supplier.country}</span>
                    <span>→</span>
                    <span>{selectedRoute.intermediatePort.city}, {selectedRoute.intermediatePort.country}</span>
                  </div>
                  <div className="segment-time">
                    Transit: {selectedRoute.details.supplierToPort.transitTime} days
                  </div>
                </div>

                <div className="segment">
                  <div className="segment-header">
                    <span className="segment-title">Transit Port to Destination</span>
                    <span className="segment-distance">
                      {selectedRoute.details.portToDestination.distance.toLocaleString()} km
                    </span>
                  </div>
                  <div className="segment-details">
                    <span>{selectedRoute.intermediatePort.city}, {selectedRoute.intermediatePort.country}</span>
                    <span>→</span>
                    <span>{selectedRoute.destination.city}, {selectedRoute.destination.country}</span>
                  </div>
                  <div className="segment-time">
                    Transit: {selectedRoute.details.portToDestination.transitTime} days
                  </div>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3>Cost Breakdown</h3>
              <div className="cost-breakdown">
                <div className="cost-item">
                  <span>Port Charges</span>
                  <span>${selectedRoute.intermediatePort.shippingCost.toLocaleString()}</span>
                </div>
                <div className="cost-item">
                  <span>Destination Charges</span>
                  <span>${selectedRoute.destination.unloadingCost.toLocaleString()}</span>
                </div>
                <div className="cost-item">
                  <span>Shipping Cost</span>
                  <span>${(selectedRoute.totalDistance * 0.15).toLocaleString()}</span>
                </div>
                <div className="cost-item total">
                  <span>Total Cost</span>
                  <span>${selectedRoute.totalCost.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3>Risk Factors</h3>
              <div className="risk-factors">
                <div className="risk-item">
                  <span>Port Congestion</span>
                  <span className={`status ${
                    selectedRoute.intermediatePort.congestionLevel === 'High' ? 'status-high' :
                    selectedRoute.intermediatePort.congestionLevel === 'Medium' ? 'status-medium' : 'status-low'
                  }`}>
                    {selectedRoute.intermediatePort.congestionLevel}
                  </span>
                </div>
                <div className="risk-item">
                  <span>Expected Delays</span>
                  <span>{selectedRoute.details.portDelay + selectedRoute.details.destinationDelay} days</span>
                </div>
                <div className="risk-item">
                  <span>Overall Risk</span>
                  <span className={`status ${getRiskColor(selectedRoute.riskLevel)}`}>
                    {selectedRoute.riskLevel}
                  </span>
                </div>
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

        .route-config {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }

        .map-container {
          border-radius: 8px;
          overflow: hidden;
          height: 300px;
        }

        .no-routes {
          text-align: center;
          padding: 2rem 1rem;
          color: var(--text-secondary);
        }

        .route-options {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          max-height: 400px;
          overflow-y: auto;
        }

        .route-option {
          padding: 1rem;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .route-option:hover {
          border-color: var(--accent-primary);
          box-shadow: var(--shadow-sm);
        }

        .route-option.selected {
          border-color: var(--accent-primary);
          background: var(--accent-primary)05;
          box-shadow: var(--shadow-md);
        }

        .route-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .route-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          color: var(--text-primary);
          font-size: clamp(0.875rem, 1.5vw, 1rem);
        }

        .route-metrics {
          display: flex;
          gap: 1rem;
          margin-bottom: 0.75rem;
          flex-wrap: wrap;
        }

        .metric {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: clamp(0.75rem, 1.25vw, 0.875rem);
          color: var(--text-secondary);
        }

        .route-path {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: clamp(0.75rem, 1.25vw, 0.875rem);
          color: var(--text-tertiary);
          flex-wrap: wrap;
        }

        .route-details {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }

        .detail-section h3 {
          margin-bottom: 1rem;
          color: var(--text-primary);
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.5rem;
          font-size: clamp(1.125rem, 2vw, 1.25rem);
        }

        .segments {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .segment {
          padding: 1rem;
          background: var(--bg-secondary);
          border-radius: 8px;
        }

        .segment-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .segment-title {
          font-weight: 600;
          color: var(--text-primary);
          font-size: clamp(0.875rem, 1.5vw, 1rem);
        }

        .segment-distance {
          font-weight: 500;
          color: var(--accent-primary);
          font-size: clamp(0.875rem, 1.5vw, 1rem);
        }

        .segment-details {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          color: var(--text-secondary);
          flex-wrap: wrap;
          font-size: clamp(0.875rem, 1.5vw, 1rem);
        }

        .segment-time {
          font-size: clamp(0.75rem, 1.25vw, 0.875rem);
          color: var(--text-tertiary);
        }

        .cost-breakdown,
        .risk-factors {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .cost-item,
        .risk-item {
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

        /* Mobile optimizations */
        @media (min-width: 480px) {
          .route-config {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .map-container {
            height: 350px;
          }
        }

        @media (min-width: 768px) {
          .grid-2 {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .map-container {
            height: 400px;
          }
          
          .route-details {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 479px) {
          .route-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .route-metrics {
            flex-direction: column;
            gap: 0.5rem;
          }
          
          .route-path {
            justify-content: center;
          }
          
          .segment-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .cost-item,
          .risk-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  )
}

export default RoutePlanner