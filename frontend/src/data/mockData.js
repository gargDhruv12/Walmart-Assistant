// Mock data for the trade assistant application

export const suppliers = [
  {
    id: 1,
    name: "Global Textiles Ltd",
    country: "India",
    city: "Mumbai",
    coordinates: [19.0760, 72.8777],
    certifications: ["ISO 9001", "GOTS", "OEKO-TEX"],
    leadTime: 27,
    reliability: 92,
    productCost: 19.50,
    minOrderQuantity: 1000,
    specialties: ["Cotton Garments", "Organic Materials"],
    rating: 4.6,
    yearsInBusiness: 15,
    contact: {
      email: "contact@globaltextiles.in",
      phone: "+91 22 1234 5678"
    }
  },
  {
    id: 2,
    name: "Vietnam Manufacturing Co.",
    country: "Vietnam",
    city: "Ho Chi Minh City",
    coordinates: [10.8231, 106.6297],
    certifications: ["ISO 14001", "WRAP", "BSCI"],
    leadTime: 30,
    reliability: 88,
    productCost: 18.00,
    minOrderQuantity: 2000,
    specialties: ["Synthetic Materials", "Quick Turnaround"],
    rating: 4.4,
    yearsInBusiness: 12,
    contact: {
      email: "sales@vietnammanufacturing.com",
      phone: "+84 28 1234 5678"
    }
  },
  {
    id: 3,
    name: "Bangladesh Garments Inc",
    country: "Bangladesh",
    city: "Dhaka",
    coordinates: [23.8103, 90.4125],
    certifications: ["ISO 9001", "SEDEX", "GOTS"],
    leadTime: 35,
    reliability: 85,
    productCost: 16.75,
    minOrderQuantity: 3000,
    specialties: ["Low-cost Production", "Large Volumes"],
    rating: 4.2,
    yearsInBusiness: 18,
    contact: {
      email: "export@bangladeshgarments.com",
      phone: "+880 2 1234 5678"
    }
  },
  {
    id: 4,
    name: "Thai Premium Textiles",
    country: "Thailand",
    city: "Bangkok",
    coordinates: [13.7563, 100.5018],
    certifications: ["ISO 9001", "OEKO-TEX", "GRS"],
    leadTime: 25,
    reliability: 94,
    productCost: 22.00,
    minOrderQuantity: 500,
    specialties: ["Premium Quality", "Sustainable Materials"],
    rating: 4.8,
    yearsInBusiness: 20,
    contact: {
      email: "info@thaipremiumtextiles.com",
      phone: "+66 2 1234 5678"
    }
  },
  {
    id: 5,
    name: "Indonesian Fabric Solutions",
    country: "Indonesia",
    city: "Jakarta",
    coordinates: [-6.2088, 106.8456],
    certifications: ["ISO 14001", "WRAP", "CPSIA"],
    leadTime: 32,
    reliability: 90,
    productCost: 17.25,
    minOrderQuantity: 1500,
    specialties: ["Eco-friendly Materials", "Custom Designs"],
    rating: 4.5,
    yearsInBusiness: 14,
    contact: {
      email: "business@indonesianfabric.co.id",
      phone: "+62 21 1234 5678"
    }
  }
]

export const tariffData = {
  // HS Code 6203 - Men's suits, ensembles, jackets, blazers, trousers
  "6203": {
    rates: {
      "India-USA": { rate: 16.6, description: "Men's clothing from India" },
      "Vietnam-USA": { rate: 17.0, description: "Men's clothing from Vietnam" },
      "Bangladesh-USA": { rate: 15.3, description: "Men's clothing from Bangladesh" },
      "Thailand-USA": { rate: 17.7, description: "Men's clothing from Thailand" },
      "Indonesia-USA": { rate: 16.2, description: "Men's clothing from Indonesia" },
      "China-USA": { rate: 27.8, description: "Men's clothing from China (Trade War Impact)" }
    }
  },
  // HS Code 6204 - Women's suits, ensembles, jackets, blazers, dresses
  "6204": {
    rates: {
      "India-USA": { rate: 12.8, description: "Women's clothing from India" },
      "Vietnam-USA": { rate: 13.2, description: "Women's clothing from Vietnam" },
      "Bangladesh-USA": { rate: 11.9, description: "Women's clothing from Bangladesh" },
      "Thailand-USA": { rate: 14.1, description: "Women's clothing from Thailand" },
      "Indonesia-USA": { rate: 12.5, description: "Women's clothing from Indonesia" }
    }
  }
}

export const ports = [
  {
    id: 1,
    name: "Jebel Ali Port",
    country: "UAE",
    city: "Dubai",
    coordinates: [25.0657, 55.1713],
    congestionLevel: "Low",
    averageDelay: 2,
    shippingCost: 1200,
    facilities: ["Container Terminal", "Free Zone", "24/7 Operations"],
    connectivity: {
      "India": { distance: 1200, transitTime: 3 },
      "Vietnam": { distance: 3800, transitTime: 8 },
      "Bangladesh": { distance: 2100, transitTime: 5 },
      "Thailand": { distance: 3200, transitTime: 7 },
      "Indonesia": { distance: 4500, transitTime: 10 }
    }
  },
  {
    id: 2,
    name: "Singapore Port",
    country: "Singapore",
    city: "Singapore",
    coordinates: [1.2966, 103.7764],
    congestionLevel: "Medium",
    averageDelay: 3,
    shippingCost: 1400,
    facilities: ["Smart Port Technology", "Automated Systems", "Express Services"],
    connectivity: {
      "India": { distance: 3200, transitTime: 7 },
      "Vietnam": { distance: 1100, transitTime: 3 },
      "Bangladesh": { distance: 3800, transitTime: 8 },
      "Thailand": { distance: 1600, transitTime: 4 },
      "Indonesia": { distance: 900, transitTime: 2 }
    }
  },
  {
    id: 3,
    name: "Port Klang",
    country: "Malaysia",
    city: "Klang",
    coordinates: [3.0738, 101.4298],
    congestionLevel: "Low",
    averageDelay: 1,
    shippingCost: 1100,
    facilities: ["Deep Water Terminal", "Rail Connectivity", "Free Trade Zone"],
    connectivity: {
      "India": { distance: 2800, transitTime: 6 },
      "Vietnam": { distance: 1400, transitTime: 3 },
      "Bangladesh": { distance: 3400, transitTime: 7 },
      "Thailand": { distance: 1200, transitTime: 3 },
      "Indonesia": { distance: 600, transitTime: 2 }
    }
  }
]

export const destinationPorts = [
  {
    id: 1,
    name: "Los Angeles Port",
    country: "USA",
    city: "Los Angeles",
    coordinates: [33.7362, -118.2924],
    congestionLevel: "High",
    averageDelay: 7,
    unloadingCost: 800,
    facilities: ["Container Terminal", "Rail Connection", "Truck Access"]
  },
  {
    id: 2,
    name: "Long Beach Port",
    country: "USA",
    city: "Long Beach",
    coordinates: [33.7701, -118.1937],
    congestionLevel: "High",
    averageDelay: 6,
    unloadingCost: 750,
    facilities: ["Automated Terminal", "Green Port Initiative", "24/7 Operations"]
  },
  {
    id: 3,
    name: "New York Port",
    country: "USA",
    city: "New York",
    coordinates: [40.6643, -74.0486],
    congestionLevel: "Medium",
    averageDelay: 4,
    unloadingCost: 900,
    facilities: ["Deep Water Access", "Rail Terminal", "Customs Facility"]
  }
]

export const routes = [
  {
    id: 1,
    from: "Mumbai, India",
    to: "Los Angeles, USA",
    via: "Jebel Ali Port",
    totalDistance: 8900,
    estimatedDays: 21,
    riskLevel: "Low",
    baseShippingCost: 1800,
    fuelSurcharge: 200,
    portCharges: 400
  },
  {
    id: 2,
    from: "Ho Chi Minh City, Vietnam",
    to: "Los Angeles, USA",
    via: "Singapore Port",
    totalDistance: 8200,
    estimatedDays: 18,
    riskLevel: "Low",
    baseShippingCost: 1600,
    fuelSurcharge: 180,
    portCharges: 350
  },
  {
    id: 3,
    from: "Dhaka, Bangladesh",
    to: "New York, USA",
    via: "Jebel Ali Port",
    totalDistance: 10500,
    estimatedDays: 28,
    riskLevel: "Medium",
    baseShippingCost: 2200,
    fuelSurcharge: 250,
    portCharges: 500
  }
]

export const riskFactors = [
  {
    factor: "Political Stability",
    countries: {
      "India": "Medium",
      "Vietnam": "Low",
      "Bangladesh": "Medium",
      "Thailand": "Low",
      "Indonesia": "Low"
    }
  },
  {
    factor: "Currency Fluctuation",
    countries: {
      "India": "High",
      "Vietnam": "Medium",
      "Bangladesh": "High",
      "Thailand": "Medium",
      "Indonesia": "Medium"
    }
  },
  {
    factor: "Trade Relations",
    countries: {
      "India": "Good",
      "Vietnam": "Excellent",
      "Bangladesh": "Good",
      "Thailand": "Excellent",
      "Indonesia": "Good"
    }
  }
]

export const sampleProducts = [
  {
    id: 1,
    name: "Men's Cotton Jackets",
    hsCode: "6203",
    category: "Apparel",
    description: "High-quality cotton casual jackets for men"
  },
  {
    id: 2,
    name: "Women's Formal Blazers",
    hsCode: "6204",
    category: "Apparel",
    description: "Professional blazers for women's business wear"
  },
  {
    id: 3,
    name: "Winter Coats",
    hsCode: "6203",
    category: "Outerwear",
    description: "Insulated winter coats for cold weather"
  }
]