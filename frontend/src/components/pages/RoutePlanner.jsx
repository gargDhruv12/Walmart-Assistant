import { useState, useEffect, useRef } from 'react'
import ReactMapGL from 'react-map-gl';
import DeckGL from '@deck.gl/react';
import { ScatterplotLayer, LineLayer } from '@deck.gl/layers';
import { ColumnLayer } from '@deck.gl/layers';
import { Ship, Clock, DollarSign, AlertTriangle, Navigation, ArrowLeft, ArrowRight } from 'lucide-react'
import { destinationPorts, routes, suppliers } from '../../data/mockData'
import { Stepper, Step, StepLabel, Button, Box } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
import 'maplibre-gl/dist/maplibre-gl.css';

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json'; // More colorful Carto Voyager style

const steps = [
  'Dashboard',
  'Supplier Finder',
  'Tariff Checker',
  'Route Planner',
  'Cost Estimator'
];

const RoutePlanner = () => {
  const [selectedSupplier, setSelectedSupplier] = useState('')
  const [selectedDestination, setSelectedDestination] = useState('')
  const [routeOptions, setRouteOptions] = useState([])
  const [selectedRoute, setSelectedRoute] = useState(null)
  const [routeIndex, setRouteIndex] = useState(0)
  const [viewport, setViewport] = useState({
    longitude: 100,
    latitude: 20,
    zoom: 3,
    pitch: 45,
    bearing: 0,
    width: '100%',
    height: 400
  });
  const [ports, setPorts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showPortDetails, setShowPortDetails] = useState(false);
  const miniBoxRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();
  const isWizard = new URLSearchParams(location.search).get('wizard') === '1';

  useEffect(() => {
    api.getPorts()
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch ports')
        return res.json()
      })
      .then(data => {
        setPorts(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (selectedSupplier && selectedDestination) {
      generateRouteOptions()
    }
  }, [selectedSupplier, selectedDestination])

  useEffect(() => {
    if (routeOptions.length > 0) {
      setRouteIndex(0);
      setSelectedRoute(routeOptions[0]);
    }
  }, [routeOptions])

  useEffect(() => {
    if (!showPortDetails) return;
    function handleClick(e) {
      if (miniBoxRef.current && !miniBoxRef.current.contains(e.target)) {
        setShowPortDetails(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showPortDetails]);

  const generateRouteOptions = () => {
    const supplier = suppliers.find(s => s.id === parseInt(selectedSupplier))
    const destination = destinationPorts.find(d => d.id === parseInt(selectedDestination))
    if (!supplier || !destination) return
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
      setViewport(v => ({ ...v, latitude: centerLat, longitude: centerLng, zoom: 3 }))
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

  // deck.gl layers
  const getDeckLayers = () => {
    const layers = []
    // Supplier marker
    if (selectedSupplier) {
      const supplier = suppliers.find(s => s.id === parseInt(selectedSupplier))
      if (supplier) {
        // 3D Column marker for supplier
        layers.push(new ColumnLayer({
          id: 'supplier-3d-marker',
          data: [supplier],
          diskResolution: 12,
          radius: 12000,
          elevationScale: 100,
          getPosition: d => [d.coordinates[1], d.coordinates[0]],
          getFillColor: [59, 130, 246, 180],
          getElevation: 20000,
          pickable: true,
        }))
        layers.push(new ScatterplotLayer({
          id: 'supplier-marker',
          data: [supplier],
          getPosition: d => [d.coordinates[1], d.coordinates[0]],
          getFillColor: [59, 130, 246, 200],
          getRadius: 12000,
          radiusUnits: 'meters',
          pickable: true,
          elevationScale: 10,
        }))
      }
    }
    // Destination marker
    if (selectedDestination) {
      const dest = destinationPorts.find(d => d.id === parseInt(selectedDestination))
      if (dest) {
        // 3D Column marker for destination
        layers.push(new ColumnLayer({
          id: 'destination-3d-marker',
          data: [dest],
          diskResolution: 12,
          radius: 12000,
          elevationScale: 100,
          getPosition: d => [d.coordinates[1], d.coordinates[0]],
          getFillColor: [20, 184, 166, 180],
          getElevation: 20000,
          pickable: true,
        }))
        layers.push(new ScatterplotLayer({
          id: 'destination-marker',
          data: [dest],
          getPosition: d => [d.coordinates[1], d.coordinates[0]],
          getFillColor: [20, 184, 166, 200],
          getRadius: 12000,
          radiusUnits: 'meters',
          pickable: true,
          elevationScale: 10,
        }))
      }
    }
    // Port markers
    // 3D Column markers for ports
    layers.push(new ColumnLayer({
      id: 'port-3d-markers',
      data: ports,
      diskResolution: 12,
      radius: 9000,
      elevationScale: 80,
      getPosition: d => [d.coordinates[1], d.coordinates[0]],
      getFillColor: [255, 193, 7, 160],
      getElevation: 12000,
      pickable: true,
    }))
    layers.push(new ScatterplotLayer({
      id: 'port-markers',
      data: ports,
      getPosition: d => [d.coordinates[1], d.coordinates[0]],
      getFillColor: [255, 193, 7, 180],
      getRadius: 9000,
      radiusUnits: 'meters',
      pickable: true,
      elevationScale: 8,
    }))
    // Route lines
    if (selectedRoute) {
      layers.push(new LineLayer({
        id: 'route-lines',
        data: selectedRoute.segments,
        getSourcePosition: d => [d.from[1], d.from[0]],
        getTargetPosition: d => [d.to[1], d.to[0]],
        getColor: d => d.type === 'supplier-to-port' ? [59, 130, 246, 200] : [20, 184, 166, 200],
        getWidth: 6,
        pickable: true,
        elevationScale: 20,
        widthUnits: 'pixels',
        parameters: {
          depthTest: false
        }
      }))
    }
    return layers
  }

  if (loading) return <div>Loading ports...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="route-planner">
      {isWizard && (
        <Box sx={{ maxWidth: 900, mx: 'auto', mt: 2, mb: 2 }}>
          <Stepper activeStep={3} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button variant="outlined" onClick={() => navigate('/tariffs?wizard=1')}>Back</Button>
            <Button variant="contained" onClick={() => navigate('/costs?wizard=1')}>Next</Button>
          </Box>
        </Box>
      )}
      <div className="page-header">
        <h1>Route Planner</h1>
        <p>Plan optimal shipping routes and visualize your supply chain</p>
      </div>
      {/* Route Configuration */}
      <div className="card main-card mb-6 route-config-section">
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
      <div className="route-visualization-wrapper">
        <div className="card main-card route-visualization-large">
          <h2 className="mb-4">Route Visualization</h2>
          <div className="map-container large-map" style={{ height: '600px', width: '100%' }}>
            {/* Zoom controls */}
            <div className="zoom-controls">
              <button className="zoom-btn" onClick={() => setViewport(v => ({ ...v, zoom: Math.min(v.zoom + 1, 20) }))} aria-label="Zoom in">+</button>
              <button className="zoom-btn" onClick={() => setViewport(v => ({ ...v, zoom: Math.max(v.zoom - 1, 1) }))} aria-label="Zoom out">-</button>
            </div>
            <ReactMapGL
              {...viewport}
              mapStyle={MAP_STYLE}
              onViewportChange={setViewport}
              width="100%"
              height={600}
            >
              <DeckGL
                viewState={viewport}
                layers={getDeckLayers()}
                controller={true}
                style={{ pointerEvents: 'none' }}
              />
            </ReactMapGL>
            <div
              className="mini-route-options"
              ref={miniBoxRef}
              onClick={e => {
                if (e.target.closest('.mini-route-btn')) return;
                if (routeOptions.length > 0 && routeOptions[routeIndex]) setShowPortDetails(v => !v);
              }}
              style={{ cursor: routeOptions.length > 0 ? 'pointer' : 'default', position: 'absolute', zIndex: 20 }}
            >
              <button
                className="mini-route-btn"
                onClick={e => {
                  e.stopPropagation();
                  if (routeIndex > 0) {
                    setRouteIndex(routeIndex - 1);
                    setSelectedRoute(routeOptions[routeIndex - 1]);
                  }
                }}
                disabled={routeIndex === 0}
                aria-label="Previous route"
              >
                &#8592;
              </button>
              {routeOptions.length > 0 && routeOptions[routeIndex] ? (
                <span style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--accent-primary)', textAlign: 'center', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {routeOptions[routeIndex].intermediatePort.name}
                </span>
              ) : (
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', flex: 1, textAlign: 'center' }}>
                  No route
                </span>
              )}
              <button
                className="mini-route-btn"
                onClick={e => {
                  e.stopPropagation();
                  if (routeIndex < routeOptions.length - 1) {
                    setRouteIndex(routeIndex + 1);
                    setSelectedRoute(routeOptions[routeIndex + 1]);
                  }
                }}
                disabled={routeIndex === routeOptions.length - 1}
                aria-label="Next route"
              >
                &#8594;
              </button>
              {showPortDetails && routeOptions.length > 0 && routeOptions[routeIndex] && (
                <div className="port-details-popover">
                  <h3 style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }}>{routeOptions[routeIndex].intermediatePort.name}</h3>
                  <div style={{ marginBottom: '0.5rem' }}><b>City:</b> {routeOptions[routeIndex].intermediatePort.city}</div>
                  <div style={{ marginBottom: '0.5rem' }}><b>Country:</b> {routeOptions[routeIndex].intermediatePort.country}</div>
                  <div style={{ marginBottom: '0.5rem' }}><b>Congestion Level:</b> {routeOptions[routeIndex].intermediatePort.congestionLevel}</div>
                  <div style={{ marginBottom: '0.5rem' }}><b>Average Delay:</b> {routeOptions[routeIndex].intermediatePort.averageDelay} days</div>
                  <div style={{ marginBottom: '0.5rem' }}><b>Shipping Cost:</b> ${routeOptions[routeIndex].intermediatePort.shippingCost.toLocaleString()}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Route Details */}
      {selectedRoute && (
        <div className="card main-card mt-8">
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
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        .route-visualization-wrapper {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .route-visualization-large {
          width: 100%;
          max-width: 1600px;
          margin: 0 auto 2rem auto;
          position: relative;
        }
        .map-container.large-map {
          height: 600px;
          min-height: 400px;
          border-radius: 12px;
          overflow: hidden;
          position: relative;
        }
        .mini-route-options {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 180px;
          min-width: 0;
          height: 56px;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.10);
          padding: 0.5rem 1rem;
          z-index: 10;
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
        }
        .mini-route-btn {
          background: var(--accent-primary);
          border: none;
          border-radius: 50%;
          width: 28px;
          height: 28px;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          cursor: pointer;
          transition: background 0.18s, transform 0.18s;
          padding: 0;
        }
        .mini-route-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .mini-route-options h3 {
          margin-top: 0;
          margin-bottom: 1rem;
          font-size: 1.05rem;
          color: var(--accent-primary);
          font-weight: 600;
          text-align: center;
        }
        .route-options.mini {
          max-height: 400px;
          overflow-y: auto;
        }
        .no-routes {
          text-align: center;
          padding: 3rem;
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
          background: var(--accent-primary);
          box-shadow: var(--shadow-md);
        }
        .route-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }
        .route-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          color: var(--text-primary);
        }
        .route-metrics {
          display: flex;
          gap: 1rem;
          margin-bottom: 0.75rem;
        }
        .metric {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.875rem;
          color: var(--text-secondary);
        }
        .route-path {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: var(--text-tertiary);
        }
        .route-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }
        .detail-section h3 {
          margin-bottom: 1rem;
          color: var(--text-primary);
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.5rem;
        }
        .segments {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .segment {
          padding: 1rem;
          background: var(--bg-primary);
          border-radius: 8px;
        }
        .segment-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        .segment-title {
          font-weight: 600;
          color: var(--text-primary);
        }
        .segment-distance {
          font-weight: 500;
          color: var(--accent-primary);
        }
        .segment-details {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          color: var(--text-secondary);
        }
        .segment-time {
          font-size: 0.875rem;
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
          background: var(--bg-primary);
          border-radius: 6px;
        }
        .cost-item.total {
          background: var(--accent-primary);
          border: 1px solid var(--accent-primary);
          font-weight: 600;
        }
        .main-card {
          width: 100%;
          max-width: 1400px;
          margin-left: auto;
          margin-right: auto;
          box-sizing: border-box;
        }
        .route-visualization-wrapper {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .route-visualization-large {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto 2rem auto;
          position: relative;
        }
        .map-container.large-map {
          height: 480px;
          min-height: 320px;
          border-radius: 12px;
          overflow: hidden;
          position: relative;
        }
        .mini-route-options {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 180px;
          min-width: 0;
          height: 56px;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.10);
          padding: 0.5rem 1rem;
          z-index: 10;
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .mini-route-options h3 {
          margin-top: 0;
          margin-bottom: 1rem;
          font-size: 1.05rem;
          color: var(--accent-primary);
          font-weight: 600;
          text-align: center;
        }
        .route-options-carousel {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          gap: 0;
          position: relative;
        }
        .route-option.single {
          flex: 1 1 0;
          padding: 0.6rem 0.7rem 0.5rem 0.7rem;
          border: 1.2px solid var(--border-color, #2d3748);
          border-radius: 10px;
          background: var(--bg-primary, #181a20);
          color: var(--text-primary, #f1f5f9);
          cursor: default;
          transition: all 0.3s cubic-bezier(.4,1.3,.6,1);
          min-width: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          box-shadow: 0 1px 4px rgba(0,0,0,0.08);
          align-items: flex-start;
        }
        .route-option.single.selected {
          border-color: var(--accent-primary);
          background: var(--accent-primary)10;
          box-shadow: 0 4px 16px rgba(20,184,166,0.10);
        }
        .route-options-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          margin-bottom: 0.5rem;
        }
        .route-options-header h3 {
          margin: 0;
          font-size: 1.05rem;
          color: var(--accent-primary);
          font-weight: 600;
        }
        .route-options-arrows {
          display: flex;
          gap: 0.25rem;
        }
        .arrow-btn {
          background: var(--accent-primary, #14b8a6);
          border: none;
          border-radius: 50%;
          width: 48px;
          height: 48px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.18s, transform 0.18s, box-shadow 0.18s;
          color: #fff;
          box-shadow: 0 2px 8px rgba(20,184,166,0.13);
          font-size: 2rem;
        }
        .arrow-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, var(--accent-primary, #14b8a6) 80%, #0e9488 100%);
          transform: scale(1.12);
          box-shadow: 0 4px 16px rgba(20,184,166,0.18);
        }
        .arrow-btn:disabled {
          opacity: 1;
          cursor: not-allowed;
        }
        .zoom-controls {
          position: absolute;
          top: 18px;
          left: 18px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          z-index: 20;
        }
        .zoom-btn {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--accent-primary, #14b8a6);
          color: #fff;
          border: none;
          font-size: 1.1rem;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 1px 4px rgba(20,184,166,0.13);
          cursor: pointer;
          transition: background 0.18s, transform 0.18s;
        }
        .zoom-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, var(--accent-primary, #14b8a6) 80%, #0e9488 100%);
          transform: scale(1.08);
        }
        .route-config-section {
          margin-bottom: 2.5rem;
        }
        .port-details-popover {
          position: absolute;
          left: -80px;
          top: 100%;
          margin-top: 8px;
          background: #fff;
          border-radius: 14px;
          padding: 1.5rem 2rem 1.2rem 2rem;
          box-shadow: 0 4px 24px rgba(0,0,0,0.13);
          min-width: 200px;
          max-width: 90vw;
          border: 1.5px solid var(--border-color);
          z-index: 100;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        @media (max-width: 1500px) {
          .main-card, .route-visualization-large {
            max-width: 98vw;
          }
          .mini-route-options {
            width: 180px;
            min-width: 0;
            height: 56px;
            top: 8px;
            right: 8px;
            padding: 0.5rem 1rem;
          }
          .arrow-btn[aria-label="Previous route"] {
            left: -36px;
          }
          .arrow-btn[aria-label="Next route"] {
            right: -36px;
          }
        }
        @media (max-width: 768px) {
          .main-card, .route-visualization-large {
            max-width: 100vw;
            margin: 0 0 1.5rem 0;
            border-radius: 0;
          }
          .map-container.large-map {
            height: 300px;
            min-height: 180px;
            border-radius: 0;
          }
          .mini-route-options {
            width: 100vw;
            min-width: 0;
            left: 0;
            right: 0;
            top: unset;
            bottom: 0;
            border-radius: 0 0 12px 12px;
            box-shadow: 0 -2px 16px rgba(0,0,0,0.10);
            padding: 0.5rem 0.5rem 0.5rem 0.5rem;
          }
          .arrow-btn[aria-label="Previous route"] {
            left: 8px;
            top: unset;
            bottom: 12px;
            transform: none;
          }
          .arrow-btn[aria-label="Next route"] {
            right: 8px;
            top: unset;
            bottom: 12px;
            transform: none;
          }
        }
      `}</style>
    </div>
  )
}

export default RoutePlanner