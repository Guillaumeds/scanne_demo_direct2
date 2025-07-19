/**
 * Transactional Data: Farms
 * Dynamic farm data that can be modified in demo mode
 */

export interface Farm {
  id: string
  name: string
  companyId: string
  location: {
    latitude: number
    longitude: number
    address: string
    region: string
    country: string
  }
  area: {
    total: number // hectares
    cultivated: number
    fallow: number
  }
  soilType: string[]
  climateZone: string
  waterSources: string[]
  infrastructure: {
    roads: boolean
    electricity: boolean
    storage: boolean
    processing: boolean
  }
  contact: {
    manager: string
    phone: string
    email: string
  }
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface Company {
  id: string
  name: string
  type: 'estate' | 'cooperative' | 'private' | 'government'
  registrationNumber: string
  address: {
    street: string
    city: string
    region: string
    country: string
    postalCode: string
  }
  contact: {
    phone: string
    email: string
    website?: string
  }
  active: boolean
  createdAt: string
  updatedAt: string
}

// Initial demo companies
export const DEMO_COMPANIES: Company[] = [
  {
    id: 'comp-001',
    name: 'Omnicane Limited',
    type: 'estate',
    registrationNumber: 'C07013400',
    address: {
      street: 'La Baraque, Fuel',
      city: 'Fuel',
      region: 'Savanne',
      country: 'Mauritius',
      postalCode: '61001'
    },
    contact: {
      phone: '+230 626 1010',
      email: 'info@omnicane.com',
      website: 'https://omnicane.com'
    },
    active: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'comp-002',
    name: 'Terragri Limited',
    type: 'private',
    registrationNumber: 'C08024500',
    address: {
      street: 'Royal Road, Belle Vue',
      city: 'Quatre Bornes',
      region: 'Plaines Wilhems',
      country: 'Mauritius',
      postalCode: '72201'
    },
    contact: {
      phone: '+230 454 2020',
      email: 'contact@terragri.mu'
    },
    active: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
]

// Initial demo farms
export const DEMO_FARMS: Farm[] = [
  {
    id: 'farm-001',
    name: 'Omnicane Estate - North',
    companyId: 'comp-001',
    location: {
      latitude: -20.2833,
      longitude: 57.6167,
      address: 'La Baraque, Fuel',
      region: 'Savanne',
      country: 'Mauritius'
    },
    area: {
      total: 1250,
      cultivated: 1180,
      fallow: 70
    },
    soilType: ['Latosol', 'Clay Loam', 'Sandy Loam'],
    climateZone: 'Tropical Maritime',
    waterSources: ['River', 'Borehole', 'Irrigation Canal'],
    infrastructure: {
      roads: true,
      electricity: true,
      storage: true,
      processing: true
    },
    contact: {
      manager: 'Jean-Claude Ramdoyal',
      phone: '+230 626 1015',
      email: 'jc.ramdoyal@omnicane.com'
    },
    active: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'farm-002',
    name: 'Omnicane Estate - South',
    companyId: 'comp-001',
    location: {
      latitude: -20.3167,
      longitude: 57.6000,
      address: 'St. Aubin, Rivière des Anguilles',
      region: 'Savanne',
      country: 'Mauritius'
    },
    area: {
      total: 980,
      cultivated: 920,
      fallow: 60
    },
    soilType: ['Latosol', 'Clay'],
    climateZone: 'Tropical Maritime',
    waterSources: ['River', 'Borehole'],
    infrastructure: {
      roads: true,
      electricity: true,
      storage: true,
      processing: false
    },
    contact: {
      manager: 'Priya Sharma',
      phone: '+230 626 1025',
      email: 'p.sharma@omnicane.com'
    },
    active: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'farm-003',
    name: 'Terragri Belle Vue',
    companyId: 'comp-002',
    location: {
      latitude: -20.2667,
      longitude: 57.4833,
      address: 'Belle Vue, Quatre Bornes',
      region: 'Plaines Wilhems',
      country: 'Mauritius'
    },
    area: {
      total: 450,
      cultivated: 420,
      fallow: 30
    },
    soilType: ['Sandy Loam', 'Clay Loam'],
    climateZone: 'Tropical Maritime',
    waterSources: ['Borehole', 'Municipal Supply'],
    infrastructure: {
      roads: true,
      electricity: true,
      storage: false,
      processing: false
    },
    contact: {
      manager: 'Raj Patel',
      phone: '+230 454 2025',
      email: 'r.patel@terragri.mu'
    },
    active: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
]

// Utility functions for farm data
export const farmUtils = {
  getById: (id: string, farms: Farm[] = DEMO_FARMS) => farms.find(f => f.id === id),
  getByCompanyId: (companyId: string, farms: Farm[] = DEMO_FARMS) => farms.filter(f => f.companyId === companyId),
  getActive: (farms: Farm[] = DEMO_FARMS) => farms.filter(f => f.active),
  getTotalArea: (farms: Farm[] = DEMO_FARMS) => farms.reduce((total, farm) => total + farm.area.total, 0),
  getCultivatedArea: (farms: Farm[] = DEMO_FARMS) => farms.reduce((total, farm) => total + farm.area.cultivated, 0),
  getByRegion: (region: string, farms: Farm[] = DEMO_FARMS) => farms.filter(f => f.location.region === region),
  searchByName: (query: string, farms: Farm[] = DEMO_FARMS) => farms.filter(f =>
    f.name.toLowerCase().includes(query.toLowerCase())
  ),
}

export const companyUtils = {
  getById: (id: string, companies: Company[] = DEMO_COMPANIES) => companies.find(c => c.id === id),
  getActive: (companies: Company[] = DEMO_COMPANIES) => companies.filter(c => c.active),
  getByType: (type: Company['type'], companies: Company[] = DEMO_COMPANIES) => companies.filter(c => c.type === type),
  searchByName: (query: string, companies: Company[] = DEMO_COMPANIES) => companies.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase())
  ),
}
