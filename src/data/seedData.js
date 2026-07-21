const vehicleTypes = [
  { code: 'hatchback', name: 'Hatchback', priceModifier: 0, sortOrder: 1 },
  { code: 'sedan', name: 'Sedan', priceModifier: 0, sortOrder: 2 },
  { code: 'crossover', name: 'Crossover', priceModifier: 0, sortOrder: 3 },
  { code: 'suv', name: 'SUV', priceModifier: 0, sortOrder: 4 },
  { code: 'minivan', name: 'Minivan', priceModifier: 0, sortOrder: 5 },
];

const packageTiers = [
  {
    code: 'basic',
    name: 'Basic Wash',
    durationMinutes: 60,
    sortOrder: 1,
    features: [
      'Exterior Detailed Wash',
      'Interior Cleaning',
      'Tire & Rim Cleaning',
      'Dashboard Wipe',
    ],
  },
  {
    code: 'deluxe',
    name: 'Deluxe Wash',
    durationMinutes: 90,
    sortOrder: 2,
    features: [
      'Exterior Detailed Wash',
      'Interior Cleaning',
      'Tire & Rim Cleaning',
      'Dashboard Wipe',
      'Premium Body Waxing',
    ],
  },
  {
    code: 'ultimate',
    name: 'Ultimate Shine',
    durationMinutes: 120,
    sortOrder: 3,
    features: [
      'Exterior Detailed Wash',
      'Interior Deep Cleaning',
      'Tire & Rim Cleaning',
      'Dashboard Wipe',
      'Premium Body Waxing',
      'Window Polishing',
      'Engine Degreasing',
    ],
  },
];

const vehiclePackagePrices = {
  hatchback: [999, 1499, 1999],
  sedan: [1099, 1599, 2099],
  crossover: [1199, 1699, 2199],
  suv: [1299, 1799, 2299],
  minivan: [1399, 1899, 2399],
};

const packages = vehicleTypes.flatMap((vehicleType) =>
  packageTiers.map((tier, index) => ({
    ...tier,
    code: `${vehicleType.code}-${tier.code}`,
    vehicleTypeCode: vehicleType.code,
    basePrice: vehiclePackagePrices[vehicleType.code][index],
  }))
);

const addons = [
  {
    code: 'bike',
    name: 'Bike',
    description: 'Additional bike wash',
    price: 500,
    durationMinutes: 30,
    sortOrder: 1,
  },
  {
    code: 'tire-dressing',
    name: 'Tire Dressing',
    description: 'Deep tire clean with a lasting shine',
    price: 300,
    durationMinutes: 15,
    sortOrder: 2,
  },
  {
    code: 'sealer-hand-wax',
    name: 'Sealer Hand Wax',
    description: 'Hand-applied paint protection and gloss',
    price: 700,
    durationMinutes: 30,
    sortOrder: 3,
  },
  {
    code: 'windows-in-out',
    name: 'Windows In & Out',
    description: 'Streak-free interior and exterior glass cleaning',
    price: 400,
    durationMinutes: 15,
    sortOrder: 4,
  },
  {
    code: 'engine-bay-cleaning',
    name: 'Engine Bay Cleaning',
    description: 'Careful degreasing and cleaning of the engine bay',
    price: 800,
    durationMinutes: 30,
    sortOrder: 5,
  },
  {
    code: 'interior-sanitization',
    name: 'Interior Sanitization',
    description: 'Sanitization of high-touch interior surfaces',
    price: 600,
    durationMinutes: 20,
    sortOrder: 6,
  },
  {
    code: 'seat-shampoo',
    name: 'Seat Shampoo',
    description: 'Deep shampoo cleaning for fabric seats',
    price: 900,
    durationMinutes: 45,
    sortOrder: 7,
  },
  {
    code: 'carpet-shampoo',
    name: 'Carpet Shampoo',
    description: 'Deep cleaning for carpets and floor mats',
    price: 700,
    durationMinutes: 35,
    sortOrder: 8,
  },
  {
    code: 'headlight-polish',
    name: 'Headlight Polish',
    description: 'Restore clarity and shine to both headlights',
    price: 500,
    durationMinutes: 25,
    sortOrder: 9,
  },
  {
    code: 'rim-polish',
    name: 'Rim Polish',
    description: 'Detailed cleaning and polish for all rims',
    price: 450,
    durationMinutes: 20,
    sortOrder: 10,
  },
  {
    code: 'underbody-wash',
    name: 'Underbody Wash',
    description: 'Pressure wash for the vehicle underbody',
    price: 600,
    durationMinutes: 20,
    sortOrder: 11,
  },
  {
    code: 'ac-vent-cleaning',
    name: 'AC Vent Cleaning',
    description: 'Dust removal and sanitization for AC vents',
    price: 350,
    durationMinutes: 15,
    sortOrder: 12,
  },
  {
    code: 'dashboard-polish',
    name: 'Dashboard Polish',
    description: 'Dashboard cleaning with a protective finish',
    price: 300,
    durationMinutes: 15,
    sortOrder: 13,
  },
  {
    code: 'leather-conditioning',
    name: 'Leather Conditioning',
    description: 'Clean and condition leather seating surfaces',
    price: 750,
    durationMinutes: 30,
    sortOrder: 14,
  },
  {
    code: 'odor-removal',
    name: 'Odor Removal',
    description: 'Interior deodorizing treatment for persistent odors',
    price: 500,
    durationMinutes: 20,
    sortOrder: 15,
  },
];

const timeSlots = [
  { code: 'morning', title: 'Morning', startTime: '09:00', endTime: '12:00', capacity: 5, sortOrder: 1 },
  { code: 'noon', title: 'Noon', startTime: '12:00', endTime: '15:00', capacity: 5, sortOrder: 2 },
  { code: 'evening', title: 'Evening', startTime: '15:00', endTime: '18:00', capacity: 5, sortOrder: 3 },
  { code: 'night', title: 'Night', startTime: '18:00', endTime: '21:00', capacity: 5, sortOrder: 4 },
  { code: 'mid-night', title: 'Mid Night', startTime: '21:00', endTime: '23:59', capacity: 3, sortOrder: 5 },
];

module.exports = { vehicleTypes, packages, addons, timeSlots };
