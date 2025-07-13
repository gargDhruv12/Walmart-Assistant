// Dummy data generator for backend
const fs = require('fs');
const path = require('path');

// Helper functions
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomFloat(min, max, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}
function pick(arr) {
  return arr[randomInt(0, arr.length - 1)];
}
function pickMany(arr, n) {
  const shuffled = arr.slice().sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

// Data sources
const countries = [
  'India', 'Vietnam', 'Bangladesh', 'Thailand', 'Indonesia', 'China', 'Turkey', 'Pakistan', 'Egypt', 'Mexico',
  'Brazil', 'USA', 'Italy', 'Spain', 'Germany', 'France', 'UK', 'South Korea', 'Japan', 'Malaysia'
];
const cities = [
  'Mumbai', 'Ho Chi Minh City', 'Dhaka', 'Bangkok', 'Jakarta', 'Beijing', 'Istanbul', 'Karachi', 'Cairo', 'Mexico City',
  'Sao Paulo', 'New York', 'Milan', 'Madrid', 'Berlin', 'Paris', 'London', 'Seoul', 'Tokyo', 'Kuala Lumpur'
];
const certifications = ['ISO 9001', 'GOTS', 'OEKO-TEX', 'WRAP', 'BSCI', 'SEDEX', 'GRS', 'CPSIA', 'ISO 14001'];
const specialties = ['Cotton Garments', 'Organic Materials', 'Synthetic Materials', 'Quick Turnaround', 'Low-cost Production', 'Large Volumes', 'Premium Quality', 'Sustainable Materials', 'Eco-friendly Materials', 'Custom Designs'];
const hsCodes = [
  '6203', '6204', '6101', '6102', '6205', '6206', '6103', '6104', '6207', '6208'
];
const portNames = [
  'Jebel Ali Port', 'Singapore Port', 'Port Klang', 'Port of Shanghai', 'Port of Rotterdam', 'Port of Antwerp', 'Port of Los Angeles', 'Port of Hamburg', 'Port of Santos', 'Port of Felixstowe',
  'Port of Busan', 'Port of Tokyo', 'Port of Tanjung Pelepas', 'Port of Valencia', 'Port of Le Havre', 'Port of Genoa', 'Port of Barcelona', 'Port of Manzanillo', 'Port of Durban', 'Port of Vancouver',
  'Port of Algeciras', 'Port of Piraeus', 'Port of Jeddah', 'Port of Colombo', 'Port of Melbourne', 'Port of Montreal', 'Port of Seattle', 'Port of Gothenburg', 'Port of Zeebrugge', 'Port of Gdansk', 'Port of Haifa'
];

// Generate suppliers
const suppliers = [];
for (let i = 1; i <= 120; i++) {
  const country = pick(countries);
  const city = pick(cities);
  suppliers.push({
    id: i,
    name: `Supplier ${i} ${city} ${country}`,
    country,
    city,
    coordinates: [randomFloat(-40, 40, 4), randomFloat(30, 130, 4)],
    certifications: pickMany(certifications, randomInt(1, 3)),
    leadTime: randomInt(15, 45),
    reliability: randomInt(80, 99),
    productCost: randomFloat(10, 30),
    minOrderQuantity: randomInt(500, 5000),
    specialties: pickMany(specialties, randomInt(1, 3)),
    rating: randomFloat(3.5, 5, 1),
    yearsInBusiness: randomInt(3, 30),
    contact: {
      email: `contact${i}@supplier.com`,
      phone: `+${randomInt(1, 99)} ${randomInt(1000, 9999)} ${randomInt(1000, 9999)}`
    }
  });
}

// Generate ports
const ports = [];
for (let i = 1; i <= 30; i++) {
  const country = pick(countries);
  const city = pick(cities);
  const connectivity = {};
  countries.forEach(c => {
    connectivity[c] = {
      distance: randomInt(500, 8000),
      transitTime: randomInt(2, 20)
    };
  });
  ports.push({
    id: i,
    name: portNames[i % portNames.length] + ` ${i}`,
    country,
    city,
    coordinates: [randomFloat(-40, 40, 4), randomFloat(30, 130, 4)],
    congestionLevel: pick(['Low', 'Medium', 'High']),
    averageDelay: randomInt(1, 7),
    shippingCost: randomInt(800, 2500),
    facilities: pickMany(['Container Terminal', 'Free Zone', '24/7 Operations', 'Smart Port Technology', 'Automated Systems', 'Express Services', 'Deep Water Terminal', 'Rail Connectivity', 'Free Trade Zone'], randomInt(2, 4)),
    connectivity
  });
}

// Generate tariffs
const tariffs = {};
hsCodes.forEach(hs => {
  tariffs[hs] = { rates: {} };
  countries.slice(0, 10).forEach(origin => {
    tariffs[hs].rates[`${origin}-USA`] = {
      rate: randomFloat(10, 30),
      description: `${hs} from ${origin}`
    };
  });
});

// Write files
fs.writeFileSync(path.join(__dirname, 'suppliers.json'), JSON.stringify(suppliers, null, 2));
fs.writeFileSync(path.join(__dirname, 'ports.json'), JSON.stringify(ports, null, 2));
fs.writeFileSync(path.join(__dirname, 'tariffs.json'), JSON.stringify(tariffs, null, 2));

console.log('Dummy data generated: suppliers.json, ports.json, tariffs.json');
