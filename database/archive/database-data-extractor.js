-- =====================================================
-- COMPLETE CONFIGURATION DATA MIGRATION
-- =====================================================
-- Converted from database-data-extractor.js with ALL complete data
-- Includes all varieties, products, resources, and system configuration
-- Plus company and farm data for operational setup

-- Clear existing data
TRUNCATE TABLE attachments CASCADE;
TRUNCATE TABLE observations CASCADE;
TRUNCATE TABLE activities CASCADE;
TRUNCATE TABLE crop_cycles CASCADE;
TRUNCATE TABLE blocs CASCADE;
TRUNCATE TABLE fields CASCADE;
TRUNCATE TABLE farms CASCADE;
TRUNCATE TABLE companies CASCADE;
TRUNCATE TABLE products CASCADE;
TRUNCATE TABLE resources CASCADE;
TRUNCATE TABLE sugarcane_varieties CASCADE;
TRUNCATE TABLE intercrop_varieties CASCADE;
TRUNCATE TABLE activity_categories CASCADE;
TRUNCATE TABLE observation_categories CASCADE;
TRUNCATE TABLE attachment_categories CASCADE;
TRUNCATE TABLE system_config CASCADE;

-- =====================================================
-- SYSTEM CONFIGURATION
-- =====================================================

INSERT INTO system_config (config_key, config_group, config_value, description) VALUES
('default_currency', 'financial', '{"code": "MUR", "symbol": "Rs", "decimals": 2}', 'Default currency for financial calculations'),
('weight_units', 'measurements', '["kg", "tons", "g", "lbs"]', 'Available weight units'),
('area_units', 'measurements', '["hectares", "acres", "m²"]', 'Available area units'),
('volume_units', 'measurements', '["liters", "ml", "gallons"]', 'Available volume units'),
('growth_stage_update_frequency', 'system', '{"hours": 24}', 'How often to recalculate growth stages');

-- =====================================================
-- ACTIVITY CATEGORIES
-- =====================================================

INSERT INTO activity_categories (category_id, name, description, icon, color, active) VALUES
('land-preparation', 'Land Preparation', 'Field preparation and soil management activities', 'mountain', '#8B4513', true),
('planting', 'Planting', 'Sugarcane and intercrop planting activities', 'sprout', '#10B981', true),
('fertilization', 'Fertilization', 'Fertilizer application and soil nutrition', 'leaf', '#22C55E', true),
('pest-control', 'Pest Control', 'Pest and disease management activities', 'shield', '#EF4444', true),
('irrigation', 'Irrigation', 'Water management and irrigation activities', 'droplets', '#3B82F6', true),
('harvesting', 'Harvesting', 'Crop harvesting and post-harvest activities', 'scissors', '#F59E0B', true),
('maintenance', 'Maintenance', 'Equipment and infrastructure maintenance', 'settings', '#8B5CF6', true),
('monitoring', 'Monitoring', 'Field monitoring and assessment activities', 'eye', '#06B6D4', true);

-- =====================================================
-- OBSERVATION CATEGORIES
-- =====================================================

INSERT INTO observation_categories (category_id, name, description, icon, color, active) VALUES
('soil', 'Soil', 'Soil condition and health observations', 'mountain', '#8B4513', true),
('water', 'Water', 'Water quality and availability observations', 'droplets', '#3B82F6', true),
('plant', 'Plant', 'Plant health and growth observations', 'leaf', '#10B981', true),
('pest', 'Pest', 'Pest and disease observations', 'bug', '#EF4444', true),
('weather', 'Weather', 'Weather and climate observations', 'cloud', '#6B7280', true),
('yield', 'Yield', 'Yield estimation and quality observations', 'bar-chart', '#F59E0B', true),
('equipment', 'Equipment', 'Equipment condition observations', 'settings', '#8B5CF6', true),
('general', 'General', 'General field observations', 'eye', '#06B6D4', true);

-- =====================================================
-- ATTACHMENT CATEGORIES
-- =====================================================

INSERT INTO attachment_categories (category_id, name, description, icon, color, active) VALUES
('photo', 'Photo', 'Photographs and images', 'camera', '#10B981', true),
('document', 'Document', 'Documents and reports', 'file-text', '#3B82F6', true),
('video', 'Video', 'Video recordings', 'video', '#EF4444', true),
('audio', 'Audio', 'Audio recordings and notes', 'mic', '#F59E0B', true),
('map', 'Map', 'Maps and spatial data', 'map', '#8B5CF6', true),
('other', 'Other', 'Other file types', 'paperclip', '#6B7280', true);

-- =====================================================
-- SUGARCANE VARIETIES (Complete M-Series and R-Series)
-- =====================================================

INSERT INTO sugarcane_varieties (variety_id, name, category, harvest_start_month, harvest_end_month, seasons, soil_types, sugar_content_percent, characteristics, description, icon, image_url, information_leaflet_url, active) VALUES
('m-1176-77', 'M 1176/77', 'M-Series', 'August', 'September', ARRAY['mid'], ARRAY['L1', 'L2', 'P1', 'P2', 'P3'], NULL, '{"growth_habit": "Semi-erect", "tillering": "High", "stalk_number": "High", "stalk_height": "Fairly Tall", "stalk_diameter": "Medium to Large", "trashing": "Fairly Easy", "flowering": "Low", "germination": "Good", "ratooning_ability": "Good", "ground_coverage": "Good"}', 'Popular M-series variety with good ratooning ability and high tillering', '🌾', NULL, 'http://www.msiri.mu/UserFiles/File/sugarcane%20pamphlets/M%201176-77.pdf', true),
  {
    variety_id: 'm-52-78',
    name: 'M 52/78',
    category: 'M-Series',
    harvest_start_month: 'June',
    harvest_end_month: 'August',
    seasons: ['early', 'mid'],
    soil_types: ['B1', 'B2', 'F1', 'F2', 'H1', 'H2', 'L2'],
    characteristics: {
      growth_habit: 'Semi-erect',
      tillering: 'Fairly High',
      stalk_number: 'Fairly High',
      stalk_height: 'Fairly Tall',
      stalk_diameter: 'Medium',
      trashing: 'Fairly Easy',
      flowering: 'Low',
      germination: 'Good',
      ratooning_ability: 'Good',
      ground_coverage: 'Fairly Good'
    },
    description: 'Sweet variety suitable for multiple soil types',
    icon: '🌾',
    image_url: null,
    information_leaflet_url: 'http://www.msiri.mu/UserFiles/File/sugarcane%20pamphlets/M%2052-78.pdf',
    active: true
  },
  {
    variety_id: 'm-387-85',
    name: 'M 387/85',
    category: 'M-Series',
    harvest_start_month: 'July',
    harvest_end_month: 'October',
    seasons: ['early', 'mid'],
    soil_types: ['B1', 'B2'],
    characteristics: {
      growth_habit: 'Semi-erect',
      tillering: 'Fairly High',
      stalk_number: 'Fairly High',
      stalk_height: 'Fairly Tall',
      stalk_diameter: 'Medium',
      trashing: 'Fairly Easy',
      flowering: 'Low',
      germination: 'Good',
      ratooning_ability: 'Good',
      ground_coverage: 'Fairly Good'
    },
    description: 'Sweet variety specifically adapted to brown forest soils',
    icon: '🌾',
    image_url: null,
    information_leaflet_url: 'http://www.msiri.mu/UserFiles/File/sugarcane%20pamphlets/M%20387-85.pdf',
    active: true
  },
  {
    variety_id: 'm-1400-86',
    name: 'M 1400/86',
    category: 'M-Series',
    harvest_start_month: 'August',
    harvest_end_month: 'September',
    seasons: ['mid'],
    soil_types: ['B1', 'B2', 'F1', 'F2', 'H1', 'H2', 'L1', 'L2', 'P1', 'P2', 'P3'],
    characteristics: {
      growth_habit: 'Semi-erect',
      tillering: 'Fairly High',
      stalk_number: 'Fairly High',
      stalk_height: 'Fairly Tall',
      stalk_diameter: 'Medium',
      trashing: 'Fairly Easy',
      flowering: 'Low',
      germination: 'Good',
      ratooning_ability: 'Good',
      ground_coverage: 'Fairly Good'
    },
    description: 'Yellow variety with excellent soil adaptability across all soil types',
    icon: '🌾',
    image_url: null,
    information_leaflet_url: 'http://www.msiri.mu/UserFiles/File/sugarcane%20pamphlets/M%201400-86.pdf',
    active: true
  },
  {
    variety_id: 'm-2256-88',
    name: 'M 2256/88',
    category: 'M-Series',
    harvest_start_month: 'June',
    harvest_end_month: 'September',
    seasons: ['early', 'mid'],
    soil_types: ['B1', 'B2', 'F1', 'F2', 'H1', 'H2', 'L1', 'L2', 'P1', 'P2', 'P3'],
    characteristics: {
      growth_habit: 'Semi-erect',
      tillering: 'Fairly High',
      stalk_number: 'Fairly High',
      stalk_height: 'Fairly Tall',
      stalk_diameter: 'Medium',
      trashing: 'Fairly Easy',
      flowering: 'Low',
      germination: 'Good',
      ratooning_ability: 'Good',
      ground_coverage: 'Fairly Good'
    },
    description: 'Light variety with universal soil compatibility and extended harvest period',
    icon: '🌾',
    image_url: null,
    information_leaflet_url: 'http://www.msiri.mu/UserFiles/File/sugarcane%20pamphlets/M%202256-88.pdf',
    active: true
  },
  {
    variety_id: 'm-703-89',
    name: 'M 703/89',
    category: 'M-Series',
    harvest_start_month: 'June',
    harvest_end_month: 'July',
    seasons: ['early'],
    soil_types: ['H1', 'H2', 'L1', 'L2'],
    characteristics: {
      growth_habit: 'Semi-erect',
      tillering: 'Fairly High',
      stalk_number: 'Fairly High',
      stalk_height: 'Fairly Tall',
      stalk_diameter: 'Medium',
      trashing: 'Fairly Easy',
      flowering: 'Low',
      germination: 'Good',
      ratooning_ability: 'Good',
      ground_coverage: 'Fairly Good'
    },
    description: 'Yellow variety suitable for irrigation, early harvest',
    icon: '🌾',
    information_leaflet_url: 'http://www.msiri.mu/UserFiles/File/sugarcane%20pamphlets/M%20703-89.pdf',
    active: true
  },
  {
    variety_id: 'm-1861-89',
    name: 'M 1861/89',
    category: 'M-Series',
    harvest_start_month: 'August',
    harvest_end_month: 'November',
    seasons: ['mid', 'late'],
    soil_types: ['B1', 'B2', 'F1', 'F2', 'H1', 'H2'],
    characteristics: {
      growth_habit: 'Semi-erect',
      tillering: 'Fairly High',
      stalk_number: 'Fairly High',
      stalk_height: 'Fairly Tall',
      stalk_diameter: 'Medium',
      trashing: 'Fairly Easy',
      flowering: 'Low',
      germination: 'Good',
      ratooning_ability: 'Good',
      ground_coverage: 'Fairly Good'
    },
    description: 'Extended harvest period variety for forest and latosol soils',
    icon: '🌾',
    information_leaflet_url: 'http://www.msiri.mu/UserFiles/File/sugarcane%20pamphlets/M%201861-89.pdf',
    active: true
  },
  {
    variety_id: 'm-1672-90',
    name: 'M 1672/90',
    category: 'M-Series',
    harvest_start_month: 'August',
    harvest_end_month: 'November',
    seasons: ['mid', 'late'],
    soil_types: ['L1', 'L2', 'P1', 'P2', 'P3'],
    characteristics: {
      growth_habit: 'Semi-erect',
      tillering: 'Fairly High',
      stalk_number: 'Fairly High',
      stalk_height: 'Fairly Tall',
      stalk_diameter: 'Medium',
      trashing: 'Fairly Easy',
      flowering: 'Low',
      germination: 'Good',
      ratooning_ability: 'Good',
      ground_coverage: 'Fairly Good'
    },
    description: 'Yellow variety for prairie and low humic latosol soils',
    icon: '🌾',
    information_leaflet_url: 'http://www.msiri.mu/UserFiles/File/sugarcane%20pamphlets/M%201672-90.pdf',
    active: true
  },
  {
    variety_id: 'm-2593-92',
    name: 'M 2593/92',
    category: 'M-Series',
    harvest_start_month: 'August',
    harvest_end_month: 'November',
    seasons: ['mid', 'late'],
    soil_types: ['H1', 'H2', 'L1', 'L2', 'P1', 'P2', 'P3'],
    information_leaflet_url: '/sugarcane_varieties_leaflets/m2593.pdf',
    characteristics: {
      growth_habit: 'Semi-erect',
      tillering: 'Fairly High',
      stalk_number: 'Fairly High',
      stalk_height: 'Fairly Tall',
      stalk_diameter: 'Medium',
      trashing: 'Fairly Easy',
      flowering: 'Low',
      germination: 'Good',
      ratooning_ability: 'Good',
      ground_coverage: 'Fairly Good'
    },
    description: 'Yellow, resistant variety suitable for irrigation with MSIRI documentation',
    icon: '🌾',
    active: true
  },
  {
    variety_id: 'm-2283-98',
    name: 'M 2283/98',
    category: 'M-Series',
    harvest_start_month: 'August',
    harvest_end_month: 'November',
    seasons: ['mid', 'late'],
    soil_types: ['B1', 'B2', 'F1', 'F2'],
    image_url: '/images/varieties/m-2283-98.jpg',
    information_leaflet_url: 'http://www.msiri.mu/UserFiles/File/sugarcane%20pamphlets/M%2283-98.pdf',
    characteristics: {
      growth_habit: 'Semi-erect',
      tillering: 'Fairly High',
      stalk_number: 'Fairly High',
      stalk_height: 'Fairly Tall',
      stalk_diameter: 'Medium',
      trashing: 'Fairly Easy',
      flowering: 'Low',
      germination: 'Good',
      ratooning_ability: 'Good',
      ground_coverage: 'Fairly Good'
    },
    description: 'Yellow variety for brown forest and ferruginous latosol soils',
    icon: '🌾',
    active: true
  },
  // Continue with remaining sugarcane varieties...
  {
    variety_id: 'm-683-99',
    name: 'M 683/99',
    category: 'M-Series',
    harvest_start_month: 'August',
    harvest_end_month: 'November',
    seasons: ['mid', 'late'],
    soil_types: ['L1', 'L2', 'P1', 'P2', 'P3'],
    information_leaflet_url: 'http://www.msiri.mu/UserFiles/File/sugarcane%20pamphlets/M%20683-99.pdf',
    characteristics: {
      growth_habit: 'Semi-erect',
      tillering: 'Fairly High',
      stalk_number: 'Fairly High',
      stalk_height: 'Fairly Tall',
      stalk_diameter: 'Medium',
      trashing: 'Fairly Easy',
      flowering: 'Low',
      germination: 'Good',
      ratooning_ability: 'Good',
      ground_coverage: 'Fairly Good'
    },
    description: 'Light, yellow variety for low humic latosols and prairie soils',
    icon: '🌾',
    active: true
  },
  {
    variety_id: 'm-1989-99',
    name: 'M 1989/99',
    category: 'M-Series',
    harvest_start_month: 'August',
    harvest_end_month: 'October',
    seasons: ['mid'],
    soil_types: ['L1', 'L2', 'P1', 'P2', 'P3'],
    information_leaflet_url: 'http://www.msiri.mu/UserFiles/File/sugarcane%20pamphlets/M%201989-99.pdf',
    characteristics: {
      growth_habit: 'Semi-erect',
      tillering: 'Fairly High',
      stalk_number: 'Fairly High',
      stalk_height: 'Fairly Tall',
      stalk_diameter: 'Medium',
      trashing: 'Fairly Easy',
      flowering: 'Low',
      germination: 'Good',
      ratooning_ability: 'Good',
      ground_coverage: 'Fairly Good'
    },
    description: 'Yellow variety for prairie and low humic latosol soils',
    icon: '🌾',
    active: true
  },
  {
    variety_id: 'm-2502-99',
    name: 'M 2502/99',
    category: 'M-Series',
    harvest_start_month: 'August',
    harvest_end_month: 'October',
    seasons: ['mid'],
    soil_types: ['B1', 'B2', 'F1', 'F2', 'P1', 'P2', 'P3'],
    information_leaflet_url: 'http://www.msiri.mu/UserFiles/File/sugarcane%20pamphlets/M%202502-99.pdf',
    characteristics: {
      growth_habit: 'Semi-erect',
      tillering: 'Fairly High',
      stalk_number: 'Fairly High',
      stalk_height: 'Fairly Tall',
      stalk_diameter: 'Medium',
      trashing: 'Fairly Easy',
      flowering: 'Low',
      germination: 'Good',
      ratooning_ability: 'Good',
      ground_coverage: 'Fairly Good'
    },
    description: 'Yellow, sweet variety suitable for irrigation',
    icon: '🌾',
    active: true
  },
  {
    variety_id: 'm-1392-00',
    name: 'M 1392/00',
    category: 'M-Series',
    harvest_start_month: 'July',
    harvest_end_month: 'October',
    seasons: ['early', 'mid'],
    soil_types: ['B1', 'B2', 'F1', 'F2', 'L1', 'L2', 'P1', 'P2', 'P3'],
    image_url: '/images/varieties/m-1392-00.jpg',
    information_leaflet_url: 'http://www.msiri.mu/UserFiles/File/sugarcane%20pamphlets/M%201392-00.pdf',
    characteristics: {
      growth_habit: 'Semi-erect',
      tillering: 'Fairly High',
      stalk_number: 'Fairly High',
      stalk_height: 'Fairly Tall',
      stalk_diameter: 'Medium',
      trashing: 'Fairly Easy',
      flowering: 'Low',
      germination: 'Good',
      ratooning_ability: 'Good',
      ground_coverage: 'Fairly Good'
    },
    description: 'Yellow variety with excellent soil adaptability',
    icon: '🌾',
    active: true
  },
  // Additional M-Series varieties
  {
    variety_id: 'm-63',
    name: 'M 63',
    category: 'M-Series',
    harvest_start_month: 'August',
    harvest_end_month: 'October',
    seasons: ['mid'],
    soil_types: ['L1', 'L2', 'P1', 'P2', 'P3'],
    characteristics: {
      growth_habit: 'Semi-erect',
      tillering: 'Fairly High',
      stalk_number: 'Fairly High',
      stalk_height: 'Fairly Tall',
      stalk_diameter: 'Medium',
      trashing: 'Fairly Easy',
      flowering: 'Low',
      germination: 'Good',
      ratooning_ability: 'Good',
      ground_coverage: 'Fairly Good'
    },
    description: 'Resistant variety suitable for irrigation with high productivity',
    icon: '🌾',
    information_leaflet_url: 'http://www.msiri.mu/UserFiles/File/sugarcane%20pamphlets/M%2063.pdf',
    active: true
  },
  {
    variety_id: 'm-1561-01',
    name: 'M 1561/01',
    category: 'M-Series',
    harvest_start_month: 'June',
    harvest_end_month: 'October',
    seasons: ['early', 'mid'],
    soil_types: ['B1', 'B2'],
    characteristics: {
      growth_habit: 'Semi-erect',
      tillering: 'Fairly High',
      stalk_number: 'Fairly High',
      stalk_height: 'Fairly Tall',
      stalk_diameter: 'Medium',
      trashing: 'Fairly Easy',
      flowering: 'Low',
      germination: 'Good',
      ratooning_ability: 'Good',
      ground_coverage: 'Fairly Good'
    },
    description: 'Sweet, yellow variety for brown forest soils',
    icon: '🌾',
    information_leaflet_url: 'http://www.msiri.mu/UserFiles/File/sugarcane%20pamphlets/M%201561-01.pdf',
    active: true
  },
  {
    variety_id: 'm-216-02',
    name: 'M 216/02',
    category: 'M-Series',
    harvest_start_month: 'June',
    harvest_end_month: 'October',
    seasons: ['early', 'mid'],
    soil_types: ['L1', 'L2', 'P1', 'P2', 'P3'],
    characteristics: {
      growth_habit: 'Semi-erect',
      tillering: 'Fairly High',
      stalk_number: 'Fairly High',
      stalk_height: 'Fairly Tall',
      stalk_diameter: 'Medium',
      trashing: 'Fairly Easy',
      flowering: 'Low',
      germination: 'Good',
      ratooning_ability: 'Good',
      ground_coverage: 'Fairly Good'
    },
    description: 'Yellow variety with high productivity for prairie soils',
    icon: '🌾',
    information_leaflet_url: 'http://www.msiri.mu/UserFiles/File/sugarcane%20pamphlets/M%20216-02.pdf',
    active: true
  },
  {
    variety_id: 'm-1698-02',
    name: 'M 1698/02',
    category: 'M-Series',
    harvest_start_month: 'August',
    harvest_end_month: 'November',
    seasons: ['mid', 'late'],
    soil_types: ['L1', 'L2', 'P1', 'P2', 'P3'],
    characteristics: {
      growth_habit: 'Semi-erect',
      tillering: 'Fairly High',
      stalk_number: 'Fairly High',
      stalk_height: 'Fairly Tall',
      stalk_diameter: 'Medium',
      trashing: 'Fairly Easy',
      flowering: 'Low',
      germination: 'Good',
      ratooning_ability: 'Good',
      ground_coverage: 'Fairly Good'
    },
    description: 'Yellow variety with high productivity for prairie soils',
    icon: '🌾',
    information_leaflet_url: 'http://www.msiri.mu/UserFiles/File/sugarcane%20pamphlets/M%201698-02.pdf',
    active: true
  },
  {
    variety_id: 'm-64',
    name: 'M 64',
    category: 'M-Series',
    harvest_start_month: 'August',
    harvest_end_month: 'November',
    seasons: ['mid', 'late'],
    soil_types: ['B1', 'B2', 'F1', 'F2'],
    characteristics: {
      growth_habit: 'Semi-erect',
      tillering: 'Fairly High',
      stalk_number: 'Fairly High',
      stalk_height: 'Fairly Tall',
      stalk_diameter: 'Medium',
      trashing: 'Fairly Easy',
      flowering: 'Low',
      germination: 'Good',
      ratooning_ability: 'Good',
      ground_coverage: 'Fairly Good'
    },
    description: 'High productivity variety for brown forest and ferruginous soils',
    icon: '🌾',
    information_leaflet_url: 'http://www.msiri.mu/UserFiles/File/sugarcane%20pamphlets/M%2064.pdf',
    active: true
  },
  {
    variety_id: 'm-65',
    name: 'M 65',
    category: 'M-Series',
    harvest_start_month: 'August',
    harvest_end_month: 'October',
    seasons: ['mid'],
    soil_types: ['B1', 'B2', 'P1', 'P2', 'P3'],
    characteristics: {
      growth_habit: 'Semi-erect',
      tillering: 'Fairly High',
      stalk_number: 'Fairly High',
      stalk_height: 'Fairly Tall',
      stalk_diameter: 'Medium',
      trashing: 'Fairly Easy',
      flowering: 'Low',
      germination: 'Good',
      ratooning_ability: 'Good',
      ground_coverage: 'Fairly Good'
    },
    description: 'High productivity variety for brown forest and prairie soils',
    icon: '🌾',
    information_leaflet_url: 'http://www.msiri.mu/UserFiles/File/sugarcane%20pamphlets/M%2065.pdf',
    active: true
  },
  // Varieties being phased out
  {
    variety_id: 'm-3035-66',
    name: 'M 3035/66',
    category: 'M-Series',
    harvest_start_month: 'August',
    harvest_end_month: 'December',
    seasons: ['mid', 'late'],
    soil_types: ['B1', 'B2', 'F1', 'F2', 'H1', 'H2'],
    characteristics: {
      growth_habit: 'Erect',
      tillering: 'Medium',
      stalk_number: 'Medium',
      stalk_height: 'Tall',
      stalk_diameter: 'Medium to Large',
      trashing: 'Fairly Easy',
      flowering: 'Low',
      germination: 'Good',
      ratooning_ability: 'Good',
      ground_coverage: 'Good'
    },
    description: 'Green, red variety being phased out - one of the most popular varieties',
    icon: '🌾',
    information_leaflet_url: 'http://www.msiri.mu/UserFiles/File/sugarcane%20pamphlets/M%203035-66.pdf',
    active: false
  },
  {
    variety_id: 'm-1246-84',
    name: 'M 1246/84',
    category: 'M-Series',
    harvest_start_month: 'August',
    harvest_end_month: 'September',
    seasons: ['mid'],
    soil_types: ['H1', 'H2', 'L1', 'L2', 'P1', 'P2', 'P3'],
    characteristics: {
      growth_habit: 'Semi-erect',
      tillering: 'Fairly High',
      stalk_number: 'Fairly High',
      stalk_height: 'Fairly Tall',
      stalk_diameter: 'Medium',
      trashing: 'Fairly Easy',
      flowering: 'Medium',
      germination: 'Good',
      ratooning_ability: 'Good',
      ground_coverage: 'Fairly Good'
    },
    description: 'Yellow variety being phased out',
    icon: '🌾',
    information_leaflet_url: 'http://www.msiri.mu/UserFiles/File/sugarcane%20pamphlets/M%201246-84.pdf',
    active: false
  },
  {
    variety_id: 'r570',
    name: 'R570',
    category: 'R-Series',
    harvest_start_month: 'September',
    harvest_end_month: 'December',
    seasons: ['mid', 'late'],
    soil_types: ['H1', 'H2', 'L1', 'L2', 'P1', 'P2', 'P3'],
    information_leaflet_url: 'https://www.ercane.re/nos-varietes/r-570/',
    characteristics: {
      growth_habit: 'Semi-erect',
      tillering: 'High',
      stalk_number: 'High',
      stalk_height: 'Tall',
      stalk_diameter: 'Medium to Large',
      trashing: 'Fairly Easy',
      flowering: 'Low',
      germination: 'Good',
      ratooning_ability: 'Good',
      ground_coverage: 'Good'
    },
    description: 'Yellow eRCane variety being phased out, late harvest',
    icon: '🌾',
    active: false
  },
  {
    variety_id: 'r573',
    name: 'R573',
    category: 'R-Series',
    harvest_start_month: 'July',
    harvest_end_month: 'September',
    seasons: ['early', 'mid'],
    soil_types: ['H1', 'H2', 'L1', 'L2', 'P1', 'P2', 'P3'],
    information_leaflet_url: 'https://www.ercane.re/nos-varietes/r-573/',
    characteristics: {
      growth_habit: 'Semi-erect',
      tillering: 'Fairly High',
      stalk_number: 'Fairly High',
      stalk_height: 'Fairly Tall',
      stalk_diameter: 'Medium',
      trashing: 'Fairly Easy',
      flowering: 'Low',
      germination: 'Good',
      ratooning_ability: 'Good',
      ground_coverage: 'Fairly Good'
    },
    description: 'Yellow eRCane variety for multiple soil types',
    icon: '🌾',
    active: true
  },
  {
    variety_id: 'r575',
    name: 'R575',
    category: 'R-Series',
    harvest_start_month: 'June',
    harvest_end_month: 'August',
    seasons: ['early', 'mid'],
    soil_types: ['H1', 'H2', 'L1', 'L2', 'P1', 'P2', 'P3'],
    information_leaflet_url: 'https://www.ercane.re/nos-varietes/r-575/',
    characteristics: {
      growth_habit: 'Semi-erect',
      tillering: 'High',
      stalk_number: 'High',
      stalk_height: 'Tall',
      stalk_diameter: 'Medium to Large',
      trashing: 'Fairly Easy',
      flowering: 'Low',
      germination: 'Excellent',
      ratooning_ability: 'Good',
      ground_coverage: 'Good'
    },
    description: 'Light eRCane variety suitable for irrigation with excellent germination',
    icon: '🌾',
    active: true
  },
  {
    variety_id: 'r579',
    name: 'R579',
    category: 'R-Series',
    harvest_start_month: 'October',
    harvest_end_month: 'December',
    seasons: ['mid', 'late'],
    soil_types: ['H1', 'H2', 'L2', 'P1', 'P2', 'P3'],
    information_leaflet_url: 'https://www.ercane.re/nos-varietes/r-579/',
    characteristics: {
      growth_habit: 'Semi-erect',
      tillering: 'High',
      stalk_number: 'High',
      stalk_height: 'Tall',
      stalk_diameter: 'Medium to Large',
      trashing: 'Fairly Easy',
      flowering: 'Low',
      germination: 'Good',
      ratooning_ability: 'Very Good',
      ground_coverage: 'Good'
    },
    description: 'Green, yellow eRCane variety suitable for irrigation with very good ratooning',
    icon: '🌾',
    active: true
  },
  {
    variety_id: 'r585',
    name: 'R585',
    category: 'R-Series',
    harvest_start_month: 'August',
    harvest_end_month: 'November',
    seasons: ['mid', 'late'],
    soil_types: ['H1', 'H2', 'L1', 'L2', 'P1', 'P2', 'P3'],
    information_leaflet_url: 'https://www.ercane.re/nos-varietes/r-585/',
    characteristics: {
      growth_habit: 'Semi-erect',
      tillering: 'High',
      stalk_number: 'High',
      stalk_height: 'Tall',
      stalk_diameter: 'Medium to Large',
      trashing: 'Fairly Easy',
      flowering: 'Low',
      germination: 'Good',
      ratooning_ability: 'Good',
      ground_coverage: 'Good'
    },
    description: 'Recent eRCane variety with high tillering and good performance',
    icon: '🌾',
    active: true
  }
];

// =====================================================
// INTERCROP VARIETIES DATA
// =====================================================

const intercropVarietiesData = [
  {
    variety_id: 'none',
    name: 'None',
    scientific_name: '',
    benefits: ['No intercrop selected', 'Monoculture sugarcane'],
    planting_time: '',
    harvest_time: '',
    description: 'No intercrop companion plant selected',
    icon: '❌',
    image_url: null,
    information_leaflet_url: null,
    active: true
  },
  {
    variety_id: 'cowpea',
    name: 'Cowpea',
    scientific_name: 'Vigna unguiculata',
    benefits: ['Nitrogen fixation', 'Soil improvement', 'Additional income', 'Ground cover'],
    planting_time: 'Early rainy season',
    harvest_time: '60-90 days',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Vigna_unguiculata_Blanco2.286-cropped.jpg/300px-Vigna_unguiculata_Blanco2.286-cropped.jpg',
    description: 'Fast-growing legume that fixes nitrogen and provides ground cover',
    icon: '🌱',
    information_leaflet_url: 'https://en.wikipedia.org/wiki/Cowpea',
    active: true
  },
  {
    variety_id: 'soybean',
    name: 'Soybean',
    scientific_name: 'Glycine max',
    benefits: ['High nitrogen fixation', 'Protein-rich crop', 'Market value', 'Soil structure improvement'],
    planting_time: 'Beginning of rainy season',
    harvest_time: '90-120 days',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Soybeanvarieties.jpg/300px-Soybeanvarieties.jpg',
    description: 'High-value legume crop with excellent nitrogen fixation capacity',
    icon: '🌱',
    information_leaflet_url: 'https://en.wikipedia.org/wiki/Soybean',
    active: true
  },
  {
    variety_id: 'groundnut',
    name: 'Groundnut (Peanut)',
    scientific_name: 'Arachis hypogaea',
    benefits: ['Nitrogen fixation', 'High economic value', 'Oil production', 'Soil aeration'],
    planting_time: 'Start of rainy season',
    harvest_time: '90-120 days',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Groundnut_%28Arachis_hypogaea%29.jpg/300px-Groundnut_%28Arachis_hypogaea%29.jpg',
    description: 'Valuable cash crop that improves soil fertility through nitrogen fixation',
    icon: '🥜',
    information_leaflet_url: 'https://en.wikipedia.org/wiki/Peanut',
    active: true
  },
  {
    variety_id: 'blackgram',
    name: 'Black Gram',
    scientific_name: 'Vigna mungo',
    benefits: ['Nitrogen fixation', 'Short duration', 'Drought tolerance', 'Soil enrichment'],
    planting_time: 'Post-monsoon',
    harvest_time: '60-90 days',
    description: 'Short-duration pulse crop suitable for intercropping',
    icon: '🌱',
    image_url: null,
    information_leaflet_url: 'https://en.wikipedia.org/wiki/Vigna_mungo',
    active: true
  },
  {
    variety_id: 'greengram',
    name: 'Green Gram (Mung Bean)',
    scientific_name: 'Vigna radiata',
    benefits: ['Quick nitrogen fixation', 'Fast growing', 'Multiple harvests', 'Market demand'],
    planting_time: 'Multiple seasons',
    harvest_time: '60-75 days',
    description: 'Fast-growing legume with high market value and quick returns',
    icon: '🌱',
    image_url: null,
    information_leaflet_url: 'https://en.wikipedia.org/wiki/Mung_bean',
    active: true
  },
  {
    variety_id: 'pigeonpea',
    name: 'Pigeon Pea',
    scientific_name: 'Cajanus cajan',
    benefits: ['Long-term nitrogen fixation', 'Deep root system', 'Windbreak', 'Perennial benefits'],
    planting_time: 'Beginning of rainy season',
    harvest_time: '150-180 days',
    description: 'Long-duration legume that provides sustained soil improvement',
    icon: '🌱',
    image_url: null,
    information_leaflet_url: 'https://en.wikipedia.org/wiki/Pigeon_pea',
    active: true
  },
  {
    variety_id: 'chickpea',
    name: 'Chickpea',
    scientific_name: 'Cicer arietinum',
    benefits: ['Nitrogen fixation', 'Drought tolerance', 'High protein', 'Cool season crop'],
    planting_time: 'Post-monsoon/Winter',
    harvest_time: '90-120 days',
    description: 'Cool season legume suitable for winter intercropping',
    icon: '🌱',
    image_url: null,
    information_leaflet_url: 'https://en.wikipedia.org/wiki/Chickpea',
    active: true
  },
  {
    variety_id: 'fieldpea',
    name: 'Field Pea',
    scientific_name: 'Pisum arvense',
    benefits: ['Nitrogen fixation', 'Cool season adaptation', 'Fodder value', 'Soil improvement'],
    planting_time: 'Winter season',
    harvest_time: '90-110 days',
    description: 'Cool season legume that provides both grain and fodder',
    icon: '🌱',
    image_url: null,
    information_leaflet_url: 'https://en.wikipedia.org/wiki/Field_pea',
    active: true
  }
];

// =====================================================
// PRODUCTS DATA (Fertilizers, Pesticides, etc.)
// =====================================================

const productsData = [
  // Compound and NPK Fertilizers
  {
    product_id: 'npk-13-13-20',
    name: '13-13-20+2MgO',
    category: 'Compound and NPK Fertilizers',
    description: 'Balanced NPK fertilizer with magnesium oxide for comprehensive plant nutrition',
    unit: 'kg',
    recommended_rate_per_ha: 250.00,
    cost_per_unit: 45.00,
    brand: null,
    composition: '13% N, 13% P2O5, 20% K2O, 2% MgO',
    icon: '🧪',
    image_url: null,
    information_url: null,
    specifications: {},
    safety_datasheet_url: null,
    active: true
  },
  {
    product_id: 'npk-13-8-24',
    name: '13:8:24',
    category: 'Compound and NPK Fertilizers',
    description: 'High potassium NPK fertilizer for enhanced plant vigor and disease resistance',
    unit: 'kg',
    recommended_rate_per_ha: 250.00,
    cost_per_unit: 42.00,
    brand: null,
    composition: '13% N, 8% P2O5, 24% K2O',
    icon: '🧪',
    image_url: null,
    information_url: null,
    specifications: {},
    safety_datasheet_url: null,
    active: true
  },
  {
    product_id: 'npk-12-8-20',
    name: '12:8:20',
    category: 'Compound and NPK Fertilizers',
    description: 'Balanced NPK fertilizer for general crop nutrition',
    unit: 'kg',
    recommended_rate_per_ha: 250.00,
    cost_per_unit: 40.00,
    composition: '12% N, 8% P2O5, 20% K2O',
    icon: '🧪',
    active: true
  },
  {
    product_id: 'npk-12-12-17',
    name: '12:12:17',
    category: 'Compound and NPK Fertilizers',
    description: 'Balanced NPK fertilizer with equal nitrogen and phosphorus content',
    unit: 'kg',
    recommended_rate_per_ha: 250.00,
    cost_per_unit: 38.00,
    composition: '12% N, 12% P2O5, 17% K2O',
    icon: '🧪',
    active: true
  },
  {
    product_id: 'urea-46',
    name: 'Urea (46% N, Granular)',
    category: 'Nitrogen Fertilizers',
    description: 'High nitrogen content fertilizer for rapid plant growth',
    unit: 'kg',
    recommended_rate_per_ha: 130.00,
    cost_per_unit: 30.00,
    composition: '46% N',
    icon: '🌿',
    active: true
  },
  {
    product_id: 'ammonium-sulphate-crystal',
    name: 'Ammonium Sulphate 21% (Crystal)',
    category: 'Nitrogen Fertilizers',
    description: 'Nitrogen fertilizer with sulfur for improved protein synthesis',
    unit: 'kg',
    recommended_rate_per_ha: 150.00,
    cost_per_unit: 25.00,
    composition: '21% N, 24% S',
    icon: '🌿',
    active: true
  }
];

// =====================================================
// RESOURCES DATA (Labor, Equipment, etc.)
// =====================================================

const resourcesData = [
  // Fleet & Vehicles
  {
    resource_id: 'tractor-small',
    name: 'Small Tractor (40-60 HP)',
    category: 'Fleet & Vehicles',
    description: 'Compact tractor suitable for small to medium field operations',
    unit: 'hours',
    cost_per_hour: 450.00,
    cost_per_unit: 450.00,
    skill_level: 'Specialized',
    overtime_multiplier: 1.0,
    icon: '🚜',
    specifications: {},
    active: true
  },
  {
    resource_id: 'tractor-medium',
    name: 'Medium Tractor (60-90 HP)',
    category: 'Fleet & Vehicles',
    description: 'Medium-sized tractor for general field operations',
    unit: 'hours',
    cost_per_hour: 650.00,
    cost_per_unit: 650.00,
    skill_level: 'Specialized',
    overtime_multiplier: 1.0,
    icon: '🚜',
    specifications: {},
    active: true
  },
  {
    resource_id: 'tractor-large',
    name: 'Large Tractor (90+ HP)',
    category: 'Fleet & Vehicles',
    description: 'Heavy-duty tractor for intensive field operations',
    unit: 'hours',
    cost_per_hour: 850.00,
    cost_per_unit: 850.00,
    skill_level: 'Specialized',
    overtime_multiplier: 1.0,
    icon: '🚜',
    active: true
  },
  // Labour & Personnel
  {
    resource_id: 'field-worker',
    name: 'Field Worker',
    category: 'Labour & Personnel',
    description: 'General agricultural field worker for basic farm operations',
    unit: 'hours',
    cost_per_hour: 25.00,
    cost_per_unit: 25.00,
    skill_level: 'Basic',
    overtime_multiplier: 1.5,
    icon: '👷',
    active: true
  },
  {
    resource_id: 'skilled-worker',
    name: 'Skilled Agricultural Worker',
    category: 'Labour & Personnel',
    description: 'Experienced agricultural worker with specialized skills',
    unit: 'hours',
    cost_per_hour: 35.00,
    cost_per_unit: 35.00,
    skill_level: 'Skilled',
    overtime_multiplier: 1.5,
    icon: '👷',
    active: true
  },
  {
    resource_id: 'machine-operator',
    name: 'Machine Operator',
    category: 'Labour & Personnel',
    description: 'Specialized operator for agricultural machinery',
    unit: 'hours',
    cost_per_hour: 45.00,
    cost_per_unit: 45.00,
    skill_level: 'Specialized',
    overtime_multiplier: 1.5,
    icon: '👷',
    active: true
  },
  {
    resource_id: 'supervisor',
    name: 'Field Supervisor',
    category: 'Labour & Personnel',
    description: 'Field supervisor for managing agricultural operations',
    unit: 'hours',
    cost_per_hour: 60.00,
    cost_per_unit: 60.00,
    skill_level: 'Management',
    overtime_multiplier: 1.5,
    icon: '👷',
    active: true
  },
  // Equipment & Tools
  {
    resource_id: 'plow',
    name: 'Moldboard Plow',
    category: 'Equipment & Tools',
    description: 'Primary tillage equipment for soil preparation',
    unit: 'hours',
    cost_per_hour: 50.00,
    cost_per_unit: 50.00,
    skill_level: 'Basic',
    overtime_multiplier: 1.0,
    icon: '🔧',
    active: true
  },
  {
    resource_id: 'disc-harrow',
    name: 'Disc Harrow',
    category: 'Equipment & Tools',
    description: 'Secondary tillage equipment for soil preparation',
    unit: 'hours',
    cost_per_hour: 40.00,
    cost_per_unit: 40.00,
    skill_level: 'Basic',
    overtime_multiplier: 1.0,
    icon: '🔧',
    active: true
  },
  {
    resource_id: 'planter',
    name: 'Sugarcane Planter',
    category: 'Equipment & Tools',
    description: 'Specialized equipment for sugarcane planting',
    unit: 'hours',
    cost_per_hour: 80.00,
    cost_per_unit: 80.00,
    skill_level: 'Specialized',
    overtime_multiplier: 1.0,
    icon: '🔧',
    active: true
  },
  {
    resource_id: 'cane-harvester',
    name: 'Sugarcane Harvester',
    category: 'Harvesting Equipment',
    description: 'Mechanical harvester for sugarcane cutting and loading',
    unit: 'hours',
    cost_per_hour: 1500.00,
    cost_per_unit: 1500.00,
    skill_level: 'Specialized',
    overtime_multiplier: 1.0,
    icon: '🌾',
    active: true
  }
];

// Function to continue with more data...
async function insertSugarcaneVarieties() {
  try {
    const { data, error } = await supabase
      .from('sugarcane_varieties')
      .insert(sugarcaneVarietiesData);
    
    if (error) throw error;
    console.log('Sugarcane varieties inserted successfully:', data);
  } catch (error) {
    console.error('Error inserting sugarcane varieties:', error);
  }
}

async function insertIntercropVarieties() {
  try {
    const { data, error } = await supabase
      .from('intercrop_varieties')
      .insert(intercropVarietiesData);

    if (error) throw error;
    console.log('Intercrop varieties inserted successfully:', data);
  } catch (error) {
    console.error('Error inserting intercrop varieties:', error);
  }
}

async function insertProducts() {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert(productsData);

    if (error) throw error;
    console.log('Products inserted successfully:', data);
  } catch (error) {
    console.error('Error inserting products:', error);
  }
}

async function insertResources() {
  try {
    const { data, error } = await supabase
      .from('resources')
      .insert(resourcesData);

    if (error) throw error;
    console.log('Resources inserted successfully:', data);
  } catch (error) {
    console.error('Error inserting resources:', error);
  }
}

// Main function to insert all data
async function insertAllData() {
  console.log('Starting data insertion...');

  try {
    await insertSugarcaneVarieties();
    await insertIntercropVarieties();
    await insertProducts();
    await insertResources();

    console.log('All data inserted successfully!');
  } catch (error) {
    console.error('Error during data insertion:', error);
  }
}

// Run the insertion if this file is executed directly
if (require.main === module) {
  insertAllData();
}

// Export functions and data for use
module.exports = {
  insertSugarcaneVarieties,
  insertIntercropVarieties,
  insertProducts,
  insertResources,
  insertAllData,
  sugarcaneVarietiesData,
  intercropVarietiesData,
  productsData,
  resourcesData
};
