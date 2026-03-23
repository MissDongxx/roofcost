const fs = require('fs');
const path = require('path');

const states = [
  { code: 'AL', name: 'Alabama', labor: 0.85, material: 0.95 },
  { code: 'AK', name: 'Alaska', labor: 1.30, material: 1.25 },
  { code: 'AZ', name: 'Arizona', labor: 0.98, material: 1.05 },
  { code: 'AR', name: 'Arkansas', labor: 0.82, material: 0.90 },
  { code: 'CA', name: 'California', labor: 1.35, material: 1.15 },
  { code: 'CO', name: 'Colorado', labor: 1.10, material: 1.08 },
  { code: 'CT', name: 'Connecticut', labor: 1.20, material: 1.10 },
  { code: 'DE', name: 'Delaware', labor: 1.05, material: 1.00 },
  { code: 'FL', name: 'Florida', labor: 0.98, material: 1.02 },
  { code: 'GA', name: 'Georgia', labor: 0.95, material: 0.98 },
  { code: 'HI', name: 'Hawaii', labor: 1.40, material: 1.30 },
  { code: 'ID', name: 'Idaho', labor: 0.90, material: 0.95 },
  { code: 'IL', name: 'Illinois', labor: 1.18, material: 1.05 },
  { code: 'IN', name: 'Indiana', labor: 0.95, material: 0.95 },
  { code: 'IA', name: 'Iowa', labor: 0.90, material: 0.95 },
  { code: 'KS', name: 'Kansas', labor: 0.88, material: 0.95 },
  { code: 'KY', name: 'Kentucky', labor: 0.86, material: 0.92 },
  { code: 'LA', name: 'Louisiana', labor: 0.88, material: 0.95 },
  { code: 'ME', name: 'Maine', labor: 0.95, material: 1.00 },
  { code: 'MD', name: 'Maryland', labor: 1.15, material: 1.05 },
  { code: 'MA', name: 'Massachusetts', labor: 1.25, material: 1.10 },
  { code: 'MI', name: 'Michigan', labor: 1.00, material: 0.98 },
  { code: 'MN', name: 'Minnesota', labor: 1.08, material: 1.02 },
  { code: 'MS', name: 'Mississippi', labor: 0.80, material: 0.90 },
  { code: 'MO', name: 'Missouri', labor: 0.92, material: 0.95 },
  { code: 'MT', name: 'Montana', labor: 0.85, material: 0.95 },
  { code: 'NE', name: 'Nebraska', labor: 0.88, material: 0.95 },
  { code: 'NV', name: 'Nevada', labor: 1.05, material: 1.05 },
  { code: 'NH', name: 'New Hampshire', labor: 1.05, material: 1.02 },
  { code: 'NJ', name: 'New Jersey', labor: 1.25, material: 1.10 },
  { code: 'NM', name: 'New Mexico', labor: 0.90, material: 0.98 },
  { code: 'NY', name: 'New York', labor: 1.42, material: 1.18 },
  { code: 'NC', name: 'North Carolina', labor: 0.92, material: 0.98 },
  { code: 'ND', name: 'North Dakota', labor: 0.85, material: 0.95 },
  { code: 'OH', name: 'Ohio', labor: 0.96, material: 0.95 },
  { code: 'OK', name: 'Oklahoma', labor: 0.85, material: 0.92 },
  { code: 'OR', name: 'Oregon', labor: 1.12, material: 1.05 },
  { code: 'PA', name: 'Pennsylvania', labor: 1.08, material: 1.02 },
  { code: 'RI', name: 'Rhode Island', labor: 1.15, material: 1.05 },
  { code: 'SC', name: 'South Carolina', labor: 0.88, material: 0.95 },
  { code: 'SD', name: 'South Dakota', labor: 0.82, material: 0.92 },
  { code: 'TN', name: 'Tennessee', labor: 0.88, material: 0.95 },
  { code: 'TX', name: 'Texas', labor: 0.92, material: 0.95 },
  { code: 'UT', name: 'Utah', labor: 0.95, material: 0.98 },
  { code: 'VT', name: 'Vermont', labor: 0.98, material: 1.00 },
  { code: 'VA', name: 'Virginia', labor: 1.05, material: 1.02 },
  { code: 'WA', name: 'Washington', labor: 1.20, material: 1.08 },
  { code: 'WV', name: 'West Virginia', labor: 0.85, material: 0.92 },
  { code: 'WI', name: 'Wisconsin', labor: 0.98, material: 0.98 },
  { code: 'WY', name: 'Wyoming', labor: 0.85, material: 0.95 }
];

const zipsPerState = 5;
const result = {};

// Default fallback
result["__default__"] = {
  "labor_cost_index": 1.000,
  "material_index": 1.000
};

let zipCounter = 10001;

for (const state of states) {
  for (let i = 0; i < zipsPerState; i++) {
    const zipCode = zipCounter.toString().padStart(5, '0');
    // slight variation for each city
    const localLabor = parseFloat((state.labor * (1 + (Math.random() * 0.1 - 0.05))).toFixed(3));
    const localMaterial = parseFloat((state.material * (1 + (Math.random() * 0.04 - 0.02))).toFixed(3));
    
    result[zipCode] = {
      state_code: state.code,
      metro_area: `${state.name} City ${i+1}`,
      labor_cost_index: localLabor,
      material_index: localMaterial
    };
    zipCounter += 500;
  }
}

// Add some exact major ones as requested in spec
result["10001"] = { "state_code": "NY", "metro_area": "New York City", "labor_cost_index": 1.42, "material_index": 1.18 };
result["90001"] = { "state_code": "CA", "metro_area": "Los Angeles", "labor_cost_index": 1.35, "material_index": 1.15 };
result["77001"] = { "state_code": "TX", "metro_area": "Houston", "labor_cost_index": 0.92, "material_index": 0.95 };
result["60601"] = { "state_code": "IL", "metro_area": "Chicago", "labor_cost_index": 1.18, "material_index": 1.05 };
result["33101"] = { "state_code": "FL", "metro_area": "Miami", "labor_cost_index": 0.98, "material_index": 1.02 };

const outputPath = path.resolve(__dirname, '../src/data/geo-cost-index.json');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
console.log(`Generated ${Object.keys(result).length} items in geo-cost-index.json`);
