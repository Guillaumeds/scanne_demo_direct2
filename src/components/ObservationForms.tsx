'use client'

import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  BlocObservation,
  ObservationCategory,
  ObservationStatus,
  SoilObservationData,
  WaterObservationData,
  PlantMorphologicalData,
  GrowthStageData,
  PestDiseaseData,
  WeedObservationData,
  SugarcaneYieldQualityData,
  IntercropYieldQualityData,
} from '@/types/observations'
import { BlocAttachment, AttachmentCategory } from '@/types/attachments'
import { useCropCyclePermissions, useCropCycleInfo, useCropCycleValidation } from '@/contexts/CropCycleContext'
import { ConfigurationService } from '@/services/configurationService'
import AttachmentUploader, { AttachmentFile } from './AttachmentUploader'

// Measurement guidelines for each observation category
const MEASUREMENT_GUIDELINES = {
  soil: {
    title: "Soil Observation Guidelines",
    guidelines: [
      "pH Measurement: Use calibrated digital pH meter (±0.1 accuracy). Sample at 10-15cm depth using zigzag pattern across field. Take 15-20 subsamples, mix thoroughly, measure 3 replicates. Calibrate meter with pH 4.0 and 7.0 buffers before use.",
      "Organic Matter: Collect 15-20 subsamples from 0-20cm depth using soil auger. Follow W-pattern sampling across field. Air dry samples for 24-48 hours, remove debris, sieve through 2mm mesh. Use Walkley-Black method or loss-on-ignition for analysis.",
      "Nutrient Analysis (N-P-K): Sample at 0-15cm depth for nitrogen, 0-20cm for P&K. Avoid areas within 15m of fertilizer application, field edges, or unusual spots. Collect 15-20 subsamples per 10-hectare area. Use Mehlich-3 or Olsen extraction methods.",
      "Soil Temperature: Measure at 10cm depth using digital soil thermometer. Take readings at same time daily (8-10 AM recommended). Record at 5 locations per field, avoid direct sunlight exposure during measurement.",
      "Moisture Content: Use calibrated soil moisture meter or gravimetric method (105°C oven-dry for 24h). Sample at 0-15cm and 15-30cm depths. Take readings at 10 locations per field, calculate field capacity percentage.",
      "Compaction Assessment: Use cone penetrometer to measure soil resistance (kPa). Take readings every 2.5cm to 30cm depth. Sample in wheel tracks, between rows, and undisturbed areas. Optimal range: <2000 kPa for root growth."
    ]
  },
  water: {
    title: "Water Observation Guidelines",
    guidelines: [
      "pH Measurement: Use waterproof digital pH meter (±0.01 accuracy). Calibrate with pH 4.0, 7.0, and 10.0 buffers. Rinse electrode with distilled water between samples. Take 3 readings per sample location, record average. Measure at 15cm depth from surface.",
      "Electrical Conductivity (EC): Use calibrated EC meter to measure salinity (dS/m or μS/cm). Calibrate with 1413 μS/cm standard solution. Take readings at same depth as pH. Record temperature-compensated values. Optimal range for sugarcane: 0.7-3.0 dS/m.",
      "Water Temperature: Use digital thermometer with 0.1°C precision. Measure at 15cm depth, avoid surface temperature variations. Record at consistent time (early morning recommended). Take readings at multiple points for large water bodies.",
      "Turbidity Assessment: Use portable turbidity meter (NTU units) or visual scale. For visual: 0=crystal clear, 1=slightly cloudy, 2=moderately turbid, 3=very turbid, 4=opaque. Collect samples in clear containers, measure within 24 hours.",
      "Water Level Monitoring: Establish permanent reference point (benchmark). Use measuring tape or staff gauge. Record to nearest centimeter. Take readings at same time daily. Install piezometers for groundwater monitoring.",
      "Flow Rate Measurement: Use flow meter or velocity-area method. For channels: measure cross-sectional area, use float method (multiply surface velocity by 0.85). Record in L/s or m³/h. Take multiple measurements across channel width."
    ]
  },
  'plant-morphological': {
    title: "Plant Morphological Observation Guidelines",
    guidelines: [
      "Plant Height: Use measuring tape/ruler from soil surface to highest leaf tip (not including inflorescence). Measure 20 plants per plot in diagonal pattern. Record to nearest centimeter. Measure at consistent time (morning) to avoid diurnal variation.",
      "Stem Diameter: Use digital calipers at 30cm above ground level for sugarcane. Take 2 perpendicular measurements per stem, record average. Measure 15-20 stems per plot. Clean stem surface of debris before measurement. Record to nearest 0.1mm.",
      "Leaf Count: Count all fully expanded green leaves (>50% green area) per plant. Include leaves with visible dewlap. Exclude dead, yellowing (<50% green), or emerging leaves. Count 20 plants per plot, calculate average per plant.",
      "Leaf Area Index (LAI): Use LI-COR LAI-2200 meter or destructive sampling. For destructive method: harvest all leaves from 1m² area, measure individual leaf area using leaf area meter, calculate LAI = total leaf area/ground area. Take 5 samples per plot.",
      "SPAD Chlorophyll Reading: Use SPAD-502 Plus meter on youngest fully expanded leaf. Take 3 readings per leaf (avoid midrib), 10 leaves per plot. Measure between 9-11 AM. Clean leaf surface, ensure full contact. Record average SPAD value.",
      "Tiller Count: Count all tillers >10cm height emerging from main plant base. Include primary and secondary tillers. Count 20 plants per plot at 60, 90, and 120 days after planting. Record tillers per plant and per linear meter."
    ]
  },
  'growth-stage': {
    title: "Growth Stage Observation Guidelines",
    guidelines: [
      "Emergence Stage: Record when 50% of planted setts show visible shoots >2cm above soil surface. Monitor daily from 7-21 days after planting. Document emergence percentage weekly. Note any uneven emergence patterns across field.",
      "Tillering Stage: Begin monitoring at 45-60 days after planting. Record when 50% of plants show secondary shoots >5cm from main stem base. Count primary tillers (from main stem) and secondary tillers (from primary tillers). Peak tillering occurs at 90-120 days.",
      "Grand Growth Phase: Identify when plants show maximum height increment (>2cm/day). Typically occurs 4-8 months after planting. Monitor weekly height measurements. Characterized by rapid leaf production (1 new leaf every 7-10 days) and maximum LAI.",
      "Maturation/Sugar Accumulation: Begins when height growth rate decreases to <0.5cm/day. Monitor Brix levels weekly using refractometer. Leaves begin yellowing from bottom upward. Internodes become harder and more fibrous.",
      "Flowering (Arrow Formation): Record when inflorescence emerges from leaf whorl in >10% of plants. Typically occurs 8-12 months after planting. Note flowering percentage weekly. Flowering reduces sugar content - monitor Brix closely.",
      "Ripening/Harvest Maturity: Assess when Brix reaches >18% and Pol >14%. Lower leaves turn yellow/brown. Stems produce metallic sound when tapped. Growth completely stops. Optimal harvest window: 12-18 months depending on variety."
    ]
  },
  'yield-quality': {
    title: "Yield and Quality Observation Guidelines",
    guidelines: [
      "Cane Yield Assessment: Harvest 10m row length from 3 representative areas per plot. Weigh fresh canes immediately using calibrated scale. Remove trash and dead leaves. Calculate: Yield (t/ha) = (Plot weight × 10,000) / (Plot area in m² × 1000). Record millable canes only.",
      "Brix Measurement: Use digital refractometer (0-32% range, ±0.1% accuracy). Extract juice from 3rd internode from top of 20 representative canes. Mix juice thoroughly, place 2-3 drops on prism. Take 3 readings per sample, record average. Calibrate with distilled water (0% Brix).",
      "Pol Analysis (Sucrose Content): Use polarimeter for laboratory analysis. Prepare clarified juice using lead acetate solution. Filter through Whatman filter paper. Read polarization at 20°C. Calculate Pol% = (Polarimeter reading × 26) / 100. Minimum 20 cane samples per plot.",
      "Purity Calculation: Purity% = (Pol / Brix) × 100. Optimal purity for sugarcane: >85%. Higher purity indicates better sugar recovery potential. Record both apparent purity (direct calculation) and true purity (corrected for non-sucrose solids).",
      "Fiber Content Analysis: Collect bagasse after juice extraction from hydraulic press. Dry at 105°C for 24 hours until constant weight. Fiber% = (Dry bagasse weight / Fresh cane weight) × 100. Typical range: 11-16%. Higher fiber reduces juice extraction efficiency.",
      "Commercial Cane Sugar (CCS): Calculate using formula: CCS = [Pol% - 0.4 × (Brix% - Pol%)] × 0.73. This represents recoverable sugar percentage. Minimum acceptable CCS: 10%. Premium quality: CCS >12%. Record for payment calculations."
    ]
  },
  'pest-disease': {
    title: "Pest and Disease Observation Guidelines",
    guidelines: [
      "Visual Disease Assessment: Inspect 100 plants per hectare using W-pattern sampling. Record symptoms: leaf spots, wilting, discoloration, stunting. Use 0-9 severity scale: 0=no symptoms, 1=1-10% affected, 3=11-25%, 5=26-50%, 7=51-75%, 9=>75% plant affected. Photograph representative symptoms.",
      "Pest Population Monitoring: Use standardized sampling: 20 plants per hectare for foliar pests, 10 plants for stem borers. Count insects at weekly intervals during critical growth stages. Record pest species, life stage, and population density per plant or per m².",
      "Damage Severity Rating: Use 1-5 scale for economic assessment: 1=no visible damage (<5%), 2=slight damage (5-15%), 3=moderate damage (16-35%), 4=severe damage (36-65%), 5=very severe damage (>65%). Assess leaf area loss, stem damage, and yield impact.",
      "Disease Incidence Calculation: Disease Incidence% = (Number of infected plants / Total plants assessed) × 100. Sample minimum 100 plants per field. Record separately for different diseases. Monitor weekly during favorable weather conditions.",
      "Beneficial Insect Survey: Count natural enemies during early morning (7-9 AM). Record predators (ladybirds, spiders, lacewings) and parasitoids. Use beat sheet method for foliar beneficials. Calculate predator:pest ratio for biological control assessment.",
      "Trap-Based Monitoring: Install pheromone traps for stem borer moths (1 trap/2 hectares). Yellow sticky traps for aphids and whiteflies (5 traps/hectare). Check traps weekly, record catch numbers. Replace lures every 4-6 weeks. Map trap locations with GPS."
    ]
  },
  weed: {
    title: "Weed Observation Guidelines",
    guidelines: [
      "Weed Density Assessment: Use 0.5m × 0.5m quadrats (0.25m²) at 20 random locations per hectare. Count individual weeds by species within each quadrat. Calculate density as weeds/m². Record separately for grasses, broadleaves, and sedges. Sample monthly during growing season.",
      "Species Identification & Abundance: Identify weeds to species level using field guides. Record dominant species (>20% of total weed population), common species (5-20%), and occasional species (<5%). Use herbarium specimens for difficult identifications. Photograph unknown species.",
      "Ground Coverage Assessment: Estimate percentage ground cover using visual scale in 1m² areas. Use reference charts: 0-5% = trace, 6-25% = low, 26-50% = moderate, 51-75% = high, 76-100% = very high. Take digital photos for verification and training.",
      "Weed Height Measurement: Measure height of 10 tallest weeds per species using ruler. Record from soil surface to highest growing point. Measure separately for each dominant species. Record average, minimum, and maximum heights per species.",
      "Growth Stage Documentation: Use standardized growth stages: 1=seedling (cotyledons visible), 2=vegetative (true leaves developing), 3=stem elongation, 4=flowering/heading, 5=seed formation, 6=seed dispersal. Record percentage of each species at each stage.",
      "Spatial Distribution Mapping: Use GPS to map weed patches >5m². Record coordinates of heavy infestation areas. Note association with field conditions (wet spots, compacted areas, field edges). Create weed maps for targeted management. Update maps seasonally."
    ]
  },
  'intercrop-yield': {
    title: "Intercrop Yield Observation Guidelines",
    guidelines: [
      "Yield Sampling: Harvest representative 1m² areas from 5 locations per field. Weigh fresh produce immediately using calibrated scale. Record separately by intercrop type. Calculate yield per hectare: (Sample weight × 10,000) / Sample area in m².",
      "Quality Assessment: Grade produce according to market standards. Record percentage in each grade category (Premium, Grade A, Grade B, Reject). Measure key quality parameters: size, color, firmness, sugar content (Brix for fruits).",
      "Maturity Evaluation: Document harvest timing and maturity indicators. Record days from planting to harvest. Note optimal harvest window and post-harvest handling requirements. Monitor sugar content development for sweet crops.",
      "Intercrop Performance: Compare intercrop yield with monoculture benchmarks. Calculate Land Equivalent Ratio (LER) = (Intercrop yield/Monoculture yield) + (Main crop yield with intercrop/Main crop monoculture yield). LER >1.0 indicates intercropping advantage.",
      "Economic Analysis: Record all costs (seeds, labor, inputs) and revenues. Calculate gross margin per hectare. Compare profitability with alternative cropping systems. Include opportunity costs and risk factors in analysis."
    ]
  },
  'sugarcane-yield': {
    title: "Sugarcane Yield Observation Guidelines (MANDATORY)",
    guidelines: [
      "Total Yield Measurement: Harvest complete rows from 3 representative 10m sections per field. Weigh all millable canes using calibrated truck scale or platform scale. Remove all trash, dead leaves, and non-millable portions. Record gross weight and calculate tons per hectare.",
      "Quality Grading: Separate canes by quality: Grade A (straight, mature, >2m length), Grade B (slightly bent, adequate maturity), Grade C (short, immature, damaged). Record percentage and weight of each grade. Only include millable canes in yield calculations.",
      "Moisture Content: Determine moisture percentage using oven-dry method on representative samples. Fresh weight vs dry weight at 105°C for 24 hours. Typical moisture content: 70-75%. Adjust yield calculations to standard moisture content for accurate comparisons.",
      "Harvest Date Documentation: Record exact harvest date, time, and weather conditions. Note days from planting to harvest (cycle length). Document any delays due to weather, equipment, or market conditions. This data is critical for cycle closure validation.",
      "Field Mapping: Use GPS to record harvest areas and create yield maps. Document any areas with significantly different yields. Note factors affecting yield: soil type, irrigation, pest damage, lodging. Calculate yield per bloc and per hectare accurately."
    ]
  },
  'sugar-yield': {
    title: "Sugar Yield Observation Guidelines (MANDATORY)",
    guidelines: [
      "Sugar Content Analysis: Collect juice samples from 50 representative canes across the field. Use hydraulic press or mill for juice extraction. Measure Brix using digital refractometer (±0.1% accuracy). Conduct Pol analysis using polarimeter for sucrose content.",
      "Commercial Cane Sugar (CCS): Calculate CCS using formula: CCS = [Pol% - 0.4 × (Brix% - Pol%)] × 0.73. This represents recoverable sugar percentage. Record CCS for payment calculations and cycle profitability analysis. Minimum acceptable: 10%, Premium: >12%.",
      "Sugar Recovery Rate: Calculate actual sugar extracted vs theoretical maximum. Record mill extraction efficiency, juice purity, and processing losses. Document sugar yield in tons per hectare: (Cane yield × CCS%) / 100.",
      "Quality Parameters: Measure juice purity (Pol/Brix × 100), fiber content, and reducing sugars. Record color and clarity of juice. Document any quality issues affecting sugar recovery. Optimal purity: >85% for good sugar recovery.",
      "Revenue Documentation: Record sugar price per ton, payment terms, and quality premiums/penalties. Calculate total sugar revenue: Sugar yield (t/ha) × Price per ton. Include any bonuses for high CCS or penalties for low quality. This data is mandatory for cycle closure."
    ]
  },
  'electricity-yield': {
    title: "Electricity Yield Observation Guidelines (OPTIONAL)",
    guidelines: [
      "Bagasse Yield Measurement: Weigh bagasse immediately after juice extraction. Record moisture content (typically 45-55%). Calculate dry bagasse yield: Wet weight × (100 - moisture%)/100. Typical bagasse yield: 25-35% of fresh cane weight.",
      "Trash and Leaf Yield: Collect and weigh all field trash, tops, and leaves during harvest. Separate green leaves from dry trash. Measure moisture content of each fraction. Calculate total biomass available for energy generation.",
      "Calorific Value Testing: Determine heating value of biomass using bomb calorimeter. Typical values: Bagasse 7,500-8,500 kJ/kg (dry basis), Trash 12,000-15,000 kJ/kg. Record ash content and moisture for energy calculations.",
      "Power Generation Potential: Calculate theoretical electricity generation: kWh = (Biomass weight × Calorific value × Conversion efficiency) / 3.6. Typical conversion efficiency: 20-25% for small plants, 30-35% for large efficient plants.",
      "Revenue Calculation: Record biomass selling price or electricity tariff rates. Calculate revenue from biomass sales or power generation. Include transportation costs and processing fees. Revenue can be zero if biomass is not utilized commercially."
    ]
  },
  'revenue-tracking': {
    title: "Revenue Tracking Observation Guidelines (MANDATORY)",
    guidelines: [
      "Sugarcane Revenue: Record total payment received for sugarcane delivery. Include base price, CCS bonuses, quality premiums, and any deductions. Document payment date, buyer details, and invoice numbers. Calculate revenue per ton and per hectare.",
      "Sugar Revenue: If processing own sugar, record sugar sales revenue. Include wholesale/retail prices, packaging costs, and marketing expenses. Document sugar grades sold and respective prices. Calculate net sugar revenue after all processing costs.",
      "Intercrop Revenue: Record all income from intercrop sales. Include market prices, transportation costs, and post-harvest losses. Document buyer information and payment terms. Calculate intercrop contribution to total farm revenue. Revenue can be zero if no intercrop planted.",
      "Electricity/Biomass Revenue: Record income from bagasse or biomass sales to power plants or other buyers. Include transportation and handling costs. Document contracts and payment terms. Revenue can be zero if biomass not sold or used for own energy needs.",
      "Total Revenue Calculation: Sum all revenue streams: Sugarcane + Sugar + Intercrop + Electricity/Biomass + Other income. Calculate revenue per hectare for profitability analysis. This total revenue is mandatory for cycle closure validation and financial reporting."
    ]
  }
}

interface ObservationFormProps {
  observation: BlocObservation | null
  category?: ObservationCategory
  blocArea: number
  onSave: (observation: BlocObservation) => void
  onCancel: () => void
}

export default function ObservationForm({
  observation,
  category,
  blocArea,
  onSave,
  onCancel
}: ObservationFormProps) {
  // Crop cycle context hooks
  const permissions = useCropCyclePermissions()
  const { getActiveCycleInfo } = useCropCycleInfo()
  const validation = useCropCycleValidation()

  // Get active cycle info
  const activeCycleInfo = getActiveCycleInfo()

  const selectedCategory = category || observation?.category || 'soil'
  const [observationCategories, setObservationCategories] = useState<any[]>([])
  const [configLoading, setConfigLoading] = useState(true)
  const [showInfoModal, setShowInfoModal] = useState(false)

  // Load observation categories from database
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setConfigLoading(true)
        const config = await ConfigurationService.getAllConfiguration()
        setObservationCategories(config.observationCategories.map(cat => ({
          id: cat.category_id,
          name: cat.name,
          description: cat.description,
          color: cat.color,
          icon: cat.icon
        })))
      } catch (error) {
        console.error('Error loading observation categories:', error)
        setObservationCategories([])
      } finally {
        setConfigLoading(false)
      }
    }

    loadCategories()
  }, [])

  const categoryInfo = observationCategories.find(c => c.id === selectedCategory)

  const [formData, setFormData] = useState({
    name: observation?.name || categoryInfo?.name || '',
    description: observation?.description || '',
    category: selectedCategory,
    status: observation?.status || 'planned' as ObservationStatus,
    observationDate: observation?.observationDate || new Date().toISOString().split('T')[0],
    actualDate: observation?.actualDate || '',
    numberOfSamples: observation?.numberOfSamples || undefined,
    numberOfPlants: observation?.numberOfPlants || undefined,
    notes: observation?.notes || '',
    data: observation?.data || {}
  })

  const [attachments, setAttachments] = useState<BlocAttachment[]>(observation?.attachments || [])
  const [showAttachmentModal, setShowAttachmentModal] = useState(false)
  const [attachmentFiles, setAttachmentFiles] = useState<AttachmentFile[]>([])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!observation && !activeCycleInfo) {
      alert('No active crop cycle found. Please create a crop cycle first.')
      return
    }

    const newObservation: BlocObservation = {
      id: observation?.id || Date.now().toString(),
      name: formData.name,
      description: formData.description,
      category: formData.category,
      status: formData.status,
      cropCycleId: observation?.cropCycleId || activeCycleInfo!.id,
      cropCycleType: observation?.cropCycleType || activeCycleInfo!.type,
      observationDate: formData.observationDate,
      actualDate: formData.actualDate || undefined,
      numberOfSamples: formData.numberOfSamples,
      numberOfPlants: formData.numberOfPlants,
      notes: formData.notes,
      data: formData.data,
      attachments: attachments,
      createdAt: observation?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: observation?.createdBy || 'user'
    }

    onSave(newObservation)
  }

  const updateDataField = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      data: {
        ...prev.data,
        [field]: value === '' ? undefined : value
      }
    }))
  }

  const handleAttachmentUpload = (newAttachments: BlocAttachment[]) => {
    setAttachments(prev => [...prev, ...newAttachments])
    setShowAttachmentModal(false)
  }

  const handleRemoveAttachment = (attachmentId: string) => {
    setAttachments(prev => prev.filter(att => att.id !== attachmentId))
  }

  const renderCategorySpecificFields = () => {
    switch (selectedCategory) {
      case 'soil':
        return <SoilObservationFields data={formData.data as SoilObservationData} updateField={updateDataField} />
      case 'water':
        return <WaterObservationFields data={formData.data as WaterObservationData} updateField={updateDataField} />
      case 'plant-morphological':
        return <PlantMorphologicalFields data={formData.data as PlantMorphologicalData} updateField={updateDataField} />
      case 'growth-stage':
        return <GrowthStageFields data={formData.data as GrowthStageData} updateField={updateDataField} />
      case 'sugarcane-yield-quality':
        return <SugarcaneYieldQualityFields data={formData.data as SugarcaneYieldQualityData} updateField={updateDataField} blocArea={blocArea} />
      case 'pest-disease':
        return <PestDiseaseFields data={formData.data as PestDiseaseData} updateField={updateDataField} />
      case 'weed':
        return <WeedObservationFields data={formData.data as WeedObservationData} updateField={updateDataField} />
      case 'intercrop-yield-quality':
        return <IntercropYieldQualityFields data={formData.data as IntercropYieldQualityData} updateField={updateDataField} blocArea={blocArea} />
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <span className="text-2xl mr-3">{categoryInfo?.icon}</span>
                {observation ? 'Edit Observation' : 'Add New Observation'}
              </h2>
              <p className="text-gray-600 mt-1">{categoryInfo?.name}</p>
            </div>
            <div className="flex items-center space-x-3">
              {/* Information Icon */}
              <button
                type="button"
                onClick={() => setShowInfoModal(true)}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Measurement guidelines"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M9,9h0a3,3,0,0,1,6,0c0,2-3,3-3,3"/>
                  <path d="M12,17h0"/>
                </svg>
              </button>

              <button
                type="button"
                onClick={onCancel}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observation Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Weekly soil pH measurement"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as ObservationStatus })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="planned">Planned</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Brief description of the observation"
              />
            </div>

            {/* Scheduling */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date *
              </label>
              <input
                type="date"
                required
                value={formData.observationDate}
                onChange={(e) => setFormData({ ...formData, observationDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                title="Observation date"
              />
            </div>

            {/* Sample Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(selectedCategory === 'soil' || selectedCategory === 'water' || selectedCategory === 'weed') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Samples
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.numberOfSamples || ''}
                    onChange={(e) => setFormData({ ...formData, numberOfSamples: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., 5"
                  />
                </div>
              )}

              {(selectedCategory === 'plant-morphological' || selectedCategory === 'growth-stage') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Plants Sampled
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.numberOfPlants || ''}
                    onChange={(e) => setFormData({ ...formData, numberOfPlants: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., 20"
                  />
                </div>
              )}
            </div>

            {/* Category-specific fields */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">{categoryInfo?.icon}</span>
                {categoryInfo?.name} Measurements
              </h3>
              {renderCategorySpecificFields()}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Additional observations, weather conditions, or other relevant notes..."
              />
            </div>
          </div>

          {/* Attachments Section */}
          <div className="border-t border-gray-200 pt-6 px-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Attachments</h3>
              <button
                type="button"
                onClick={() => setShowAttachmentModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2"
                title="Add attachment"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                <span>Add Files</span>
              </button>
            </div>

            {attachments.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500 text-sm">
                No attachments yet. Click "Add Files" to upload files.
              </div>
            ) : (
              <div className="space-y-2">
                {attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {attachment.fileType?.startsWith('image/') ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21,15 16,10 5,21"/>
                          </svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
                            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{attachment.name}</p>
                        <p className="text-xs text-gray-500">
                          {attachment.category} • {(attachment.fileSize / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(attachment.id)}
                      className="text-red-400 hover:text-red-600 p-1"
                      title="Remove attachment"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* New Attachment Uploader */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add New Attachments
              </label>
              <AttachmentUploader
                onFilesChange={setAttachmentFiles}
                maxFiles={10}
                maxSize={50}
                className="mt-2"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              Save Observation
            </button>
          </div>
        </form>
      </div>

      {/* Information Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {(MEASUREMENT_GUIDELINES as any)[selectedCategory]?.title || 'Measurement Guidelines'}
              </h3>
              <button
                type="button"
                onClick={() => setShowInfoModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {((MEASUREMENT_GUIDELINES as any)[selectedCategory]?.guidelines || []).map((guideline: string, index: number) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">{guideline}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attachment Upload Modal */}
      {showAttachmentModal && (
        <AttachmentUploadModal
          onClose={() => setShowAttachmentModal(false)}
          onUpload={handleAttachmentUpload}
          activeCycleInfo={activeCycleInfo}
        />
      )}
    </div>
  )
}

// Soil Observation Fields
function SoilObservationFields({ data, updateField }: { data: SoilObservationData, updateField: (field: string, value: any) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Soil Texture</label>
        <input
          type="text"
          value={data.soilTexture || ''}
          onChange={(e) => updateField('soilTexture', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="e.g., Clay loam"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Soil pH (pH units)</label>
        <input
          type="number"
          step="0.1"
          min="0"
          max="14"
          value={data.soilPH || ''}
          onChange={(e) => updateField('soilPH', e.target.value ? parseFloat(e.target.value) : undefined)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="6.5"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Electrical Conductivity (dS/m)</label>
        <input
          type="number"
          step="0.1"
          min="0"
          value={data.electricalConductivity || ''}
          onChange={(e) => updateField('electricalConductivity', e.target.value ? parseFloat(e.target.value) : undefined)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="1.2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Soil Organic Matter (%)</label>
        <input
          type="number"
          step="0.1"
          min="0"
          value={data.soilOrganicMatter || ''}
          onChange={(e) => updateField('soilOrganicMatter', e.target.value ? parseFloat(e.target.value) : undefined)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="3.5"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Soil Organic Carbon (%)</label>
        <input
          type="number"
          step="0.1"
          min="0"
          value={data.soilOrganicCarbon || ''}
          onChange={(e) => updateField('soilOrganicCarbon', e.target.value ? parseFloat(e.target.value) : undefined)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="2.0"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Bulk Density (g/cm³)</label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={data.bulkDensity || ''}
          onChange={(e) => updateField('bulkDensity', e.target.value ? parseFloat(e.target.value) : undefined)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="1.35"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Soil Moisture (%)</label>
        <input
          type="number"
          step="0.1"
          min="0"
          max="100"
          value={data.soilMoisture || ''}
          onChange={(e) => updateField('soilMoisture', e.target.value ? parseFloat(e.target.value) : undefined)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="25.0"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Soil Temperature (°C)</label>
        <input
          type="number"
          step="0.1"
          value={data.soilTemperature || ''}
          onChange={(e) => updateField('soilTemperature', e.target.value ? parseFloat(e.target.value) : undefined)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="28.5"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Available Nitrogen (mg/kg)</label>
        <input
          type="number"
          step="0.1"
          min="0"
          value={data.availableNitrogen || ''}
          onChange={(e) => updateField('availableNitrogen', e.target.value ? parseFloat(e.target.value) : undefined)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="45.0"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phosphorus (mg/kg)</label>
        <input
          type="number"
          step="0.1"
          min="0"
          value={data.phosphorus || ''}
          onChange={(e) => updateField('phosphorus', e.target.value ? parseFloat(e.target.value) : undefined)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="15.0"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Potassium (mg/kg)</label>
        <input
          type="number"
          step="0.1"
          min="0"
          value={data.potassium || ''}
          onChange={(e) => updateField('potassium', e.target.value ? parseFloat(e.target.value) : undefined)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="120.0"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">CEC (cmol/kg)</label>
        <input
          type="number"
          step="0.1"
          min="0"
          value={data.cationExchangeCapacity || ''}
          onChange={(e) => updateField('cationExchangeCapacity', e.target.value ? parseFloat(e.target.value) : undefined)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="18.5"
        />
      </div>
    </div>
  )
}

// Water Observation Fields
function WaterObservationFields({ data, updateField }: { data: WaterObservationData, updateField: (field: string, value: any) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Irrigation Water EC (dS/m)</label>
        <input
          type="number"
          step="0.1"
          min="0"
          value={data.irrigationWaterEC || ''}
          onChange={(e) => updateField('irrigationWaterEC', e.target.value ? parseFloat(e.target.value) : undefined)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="0.8"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Water pH (pH units)</label>
        <input
          type="number"
          step="0.1"
          min="0"
          max="14"
          value={data.waterPH || ''}
          onChange={(e) => updateField('waterPH', e.target.value ? parseFloat(e.target.value) : undefined)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="7.2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Water Source Type</label>
        <select
          value={data.waterSourceType || ''}
          onChange={(e) => updateField('waterSourceType', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">Select source</option>
          <option value="borehole">Borehole</option>
          <option value="river">River</option>
          <option value="reservoir">Reservoir</option>
          <option value="canal">Canal</option>
          <option value="rainwater">Rainwater</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Water Availability (L/min)</label>
        <input
          type="number"
          step="1"
          min="0"
          value={data.waterAvailability || ''}
          onChange={(e) => updateField('waterAvailability', e.target.value ? parseFloat(e.target.value) : undefined)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="150"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Water Use Efficiency (%)</label>
        <input
          type="number"
          step="0.1"
          min="0"
          max="100"
          value={data.waterUseEfficiency || ''}
          onChange={(e) => updateField('waterUseEfficiency', e.target.value ? parseFloat(e.target.value) : undefined)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="85.0"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Drainage Status</label>
        <select
          value={data.drainageStatus || ''}
          onChange={(e) => updateField('drainageStatus', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">Select status</option>
          <option value="excellent">Excellent</option>
          <option value="good">Good</option>
          <option value="fair">Fair</option>
          <option value="poor">Poor</option>
          <option value="waterlogged">Waterlogged</option>
        </select>
      </div>
    </div>
  )
}

// Plant Morphological Fields
function PlantMorphologicalFields({ data, updateField }: { data: PlantMorphologicalData, updateField: (field: string, value: any) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Plant Height (cm)</label>
        <input
          type="number"
          step="0.1"
          min="0"
          value={data.plantHeight || ''}
          onChange={(e) => updateField('plantHeight', e.target.value ? parseFloat(e.target.value) : undefined)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="180.5"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Stalk Diameter (mm)</label>
        <input
          type="number"
          step="0.1"
          min="0"
          value={data.stalkDiameter || ''}
          onChange={(e) => updateField('stalkDiameter', e.target.value ? parseFloat(e.target.value) : undefined)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="25.0"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tillers per Stool</label>
        <input
          type="number"
          step="1"
          min="0"
          value={data.numberOfTillersPerStool || ''}
          onChange={(e) => updateField('numberOfTillersPerStool', e.target.value ? parseInt(e.target.value) : undefined)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="8"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Leaf Length (cm)</label>
        <input
          type="number"
          step="0.1"
          min="0"
          value={data.leafLength || ''}
          onChange={(e) => updateField('leafLength', e.target.value ? parseFloat(e.target.value) : undefined)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="120.0"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Leaf Width (cm)</label>
        <input
          type="number"
          step="0.1"
          min="0"
          value={data.leafWidth || ''}
          onChange={(e) => updateField('leafWidth', e.target.value ? parseFloat(e.target.value) : undefined)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="4.5"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Leaf Area Index</label>
        <input
          type="number"
          step="0.1"
          min="0"
          value={data.leafAreaIndex || ''}
          onChange={(e) => updateField('leafAreaIndex', e.target.value ? parseFloat(e.target.value) : undefined)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="3.2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Internode Length (cm)</label>
        <input
          type="number"
          step="0.1"
          min="0"
          value={data.internodeLength || ''}
          onChange={(e) => updateField('internodeLength', e.target.value ? parseFloat(e.target.value) : undefined)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="12.5"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Number of Internodes</label>
        <input
          type="number"
          step="1"
          min="0"
          value={data.numberOfInternodes || ''}
          onChange={(e) => updateField('numberOfInternodes', e.target.value ? parseInt(e.target.value) : undefined)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="15"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Stalk Weight Fresh (g)</label>
        <input
          type="number"
          step="1"
          min="0"
          value={data.stalkWeightFresh || ''}
          onChange={(e) => updateField('stalkWeightFresh', e.target.value ? parseFloat(e.target.value) : undefined)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="1200"
        />
      </div>
    </div>
  )
}

// Growth Stage Fields
function GrowthStageFields({ data, updateField }: { data: GrowthStageData, updateField: (field: string, value: any) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Emergence Date</label>
        <input
          type="date"
          value={data.emergenceDate || ''}
          onChange={(e) => updateField('emergenceDate', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Germination Percentage (%)</label>
        <input
          type="number"
          step="0.1"
          min="0"
          max="100"
          value={data.germinationPercentage || ''}
          onChange={(e) => updateField('germinationPercentage', e.target.value ? parseFloat(e.target.value) : undefined)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="85.0"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tillering Stage</label>
        <select
          value={data.tilleringStage || ''}
          onChange={(e) => updateField('tilleringStage', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">Select stage</option>
          <option value="early">Early Tillering</option>
          <option value="active">Active Tillering</option>
          <option value="peak">Peak Tillering</option>
          <option value="late">Late Tillering</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Elongation Stage</label>
        <select
          value={data.elongationStage || ''}
          onChange={(e) => updateField('elongationStage', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">Select stage</option>
          <option value="early">Early Elongation</option>
          <option value="active">Active Elongation</option>
          <option value="late">Late Elongation</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Maturity Stage</label>
        <select
          value={data.maturityStage || ''}
          onChange={(e) => updateField('maturityStage', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">Select stage</option>
          <option value="immature">Immature</option>
          <option value="maturing">Maturing</option>
          <option value="mature">Mature</option>
          <option value="over-mature">Over-mature</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Flowering Date</label>
        <input
          type="date"
          value={data.floweringDate || ''}
          onChange={(e) => updateField('floweringDate', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Brix (%)</label>
        <input
          type="number"
          step="0.1"
          min="0"
          value={data.brix || ''}
          onChange={(e) => updateField('brix', e.target.value ? parseFloat(e.target.value) : undefined)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="18.5"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">CCS (%)</label>
        <input
          type="number"
          step="0.1"
          min="0"
          value={data.ccs || ''}
          onChange={(e) => updateField('ccs', e.target.value ? parseFloat(e.target.value) : undefined)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="12.8"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">SPAD Reading</label>
        <input
          type="number"
          step="0.1"
          min="0"
          value={data.spad || ''}
          onChange={(e) => updateField('spad', e.target.value ? parseFloat(e.target.value) : undefined)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="45.2"
        />
      </div>
    </div>
  )
}

// Yield Quality Fields
function YieldQualityFields({ data, updateField }: { data: any, updateField: (field: string, value: any) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Cane Yield (t/ha)</label>
        <input
          type="number"
          step="0.1"
          min="0"
          value={data.caneYield || ''}
          onChange={(e) => updateField('caneYield', e.target.value ? parseFloat(e.target.value) : undefined)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="85.5"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Juice Brix (%)</label>
        <input
          type="number"
          step="0.1"
          min="0"
          value={data.juiceBrix || ''}
          onChange={(e) => updateField('juiceBrix', e.target.value ? parseFloat(e.target.value) : undefined)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="19.2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Commercial Cane Sugar (%)</label>
        <input
          type="number"
          step="0.1"
          min="0"
          value={data.commercialCaneSugar || ''}
          onChange={(e) => updateField('commercialCaneSugar', e.target.value ? parseFloat(e.target.value) : undefined)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="13.5"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Fiber Content (%)</label>
        <input
          type="number"
          step="0.1"
          min="0"
          value={data.fiberContent || ''}
          onChange={(e) => updateField('fiberContent', e.target.value ? parseFloat(e.target.value) : undefined)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="12.8"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Pol % (Sucrose)</label>
        <input
          type="number"
          step="0.1"
          min="0"
          value={data.polPercent || ''}
          onChange={(e) => updateField('polPercent', e.target.value ? parseFloat(e.target.value) : undefined)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="16.8"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Purity (%)</label>
        <input
          type="number"
          step="0.1"
          min="0"
          max="100"
          value={data.purity || ''}
          onChange={(e) => updateField('purity', e.target.value ? parseFloat(e.target.value) : undefined)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="87.5"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Trash Percentage (%)</label>
        <input
          type="number"
          step="0.1"
          min="0"
          max="100"
          value={data.trashPercentage || ''}
          onChange={(e) => updateField('trashPercentage', e.target.value ? parseFloat(e.target.value) : undefined)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="8.2"
        />
      </div>
    </div>
  )
}

// Pest Disease Fields
function PestDiseaseFields({ data, updateField }: { data: PestDiseaseData, updateField: (field: string, value: any) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Pest Species</label>
        <input
          type="text"
          value={data.pestSpecies || ''}
          onChange={(e) => updateField('pestSpecies', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="e.g., Sugarcane borer"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Disease Type</label>
        <input
          type="text"
          value={data.diseaseType || ''}
          onChange={(e) => updateField('diseaseType', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="e.g., Rust, Smut, Leaf scald"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Pest Incidence (%)</label>
        <input
          type="number"
          step="0.1"
          min="0"
          max="100"
          value={data.pestIncidence || ''}
          onChange={(e) => updateField('pestIncidence', e.target.value ? parseFloat(e.target.value) : undefined)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="15.5"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Pest Severity (1-5 scale)</label>
        <select
          value={data.pestSeverity || ''}
          onChange={(e) => updateField('pestSeverity', e.target.value ? parseInt(e.target.value) : undefined)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">Select severity</option>
          <option value="1">1 - Very Low</option>
          <option value="2">2 - Low</option>
          <option value="3">3 - Moderate</option>
          <option value="4">4 - High</option>
          <option value="5">5 - Very High</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Infestation Level (%)</label>
        <input
          type="number"
          step="0.1"
          min="0"
          max="100"
          value={data.infestationLevel || ''}
          onChange={(e) => updateField('infestationLevel', e.target.value ? parseFloat(e.target.value) : undefined)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="8.2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Disease Symptoms</label>
        <textarea
          value={data.diseaseSymptoms || ''}
          onChange={(e) => updateField('diseaseSymptoms', e.target.value)}
          rows={2}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Describe visible symptoms..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Damage Assessment</label>
        <textarea
          value={data.damageAssessment || ''}
          onChange={(e) => updateField('damageAssessment', e.target.value)}
          rows={2}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Assess economic impact and damage level..."
        />
      </div>
    </div>
  )
}

// Weed Observation Fields
function WeedObservationFields({ data, updateField }: { data: WeedObservationData, updateField: (field: string, value: any) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Weed Species</label>
        <input
          type="text"
          value={data.weedSpecies || ''}
          onChange={(e) => updateField('weedSpecies', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="e.g., Cynodon dactylon, Cyperus rotundus"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Weed Density (plants/m²)</label>
        <input
          type="number"
          step="0.1"
          min="0"
          value={data.weedDensity || ''}
          onChange={(e) => updateField('weedDensity', e.target.value ? parseFloat(e.target.value) : undefined)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="25.5"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Weed Coverage (%)</label>
        <input
          type="number"
          step="0.1"
          min="0"
          max="100"
          value={data.weedCoveragePercentage || ''}
          onChange={(e) => updateField('weedCoveragePercentage', e.target.value ? parseFloat(e.target.value) : undefined)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="35.0"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Weed Biomass (g/m²)</label>
        <input
          type="number"
          step="0.1"
          min="0"
          value={data.weedBiomass || ''}
          onChange={(e) => updateField('weedBiomass', e.target.value ? parseFloat(e.target.value) : undefined)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="150.5"
        />
      </div>
    </div>
  )
}

// Intercrop Yield Fields
function IntercropYieldFields({ data, updateField }: { data: any, updateField: (field: string, value: any) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Intercrop Type</label>
        <select
          value={data.intercropType || ''}
          onChange={(e) => updateField('intercropType', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">Select intercrop</option>
          <option value="beans">Beans</option>
          <option value="maize">Maize</option>
          <option value="potato">Potato</option>
          <option value="onion">Onion</option>
          <option value="tomato">Tomato</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Intercrop Yield (t/ha)</label>
        <input
          type="number"
          step="0.1"
          min="0"
          value={data.intercropYield || ''}
          onChange={(e) => updateField('intercropYield', e.target.value ? parseFloat(e.target.value) : undefined)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="12.5"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Intercrop Quality</label>
        <select
          value={data.intercropQuality || ''}
          onChange={(e) => updateField('intercropQuality', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">Select quality</option>
          <option value="excellent">Excellent</option>
          <option value="good">Good</option>
          <option value="fair">Fair</option>
          <option value="poor">Poor</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Intercrop Brix (%)</label>
        <input
          type="number"
          step="0.1"
          min="0"
          value={data.intercropBrix || ''}
          onChange={(e) => updateField('intercropBrix', e.target.value ? parseFloat(e.target.value) : undefined)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="8.5"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Intercrop Moisture (%)</label>
        <input
          type="number"
          step="0.1"
          min="0"
          max="100"
          value={data.intercropMoisture || ''}
          onChange={(e) => updateField('intercropMoisture', e.target.value ? parseFloat(e.target.value) : undefined)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="75.0"
        />
      </div>
    </div>
  )
}

// Sugarcane Yield Quality Fields (MANDATORY)
function SugarcaneYieldQualityFields({ data, updateField, blocArea }: { data: SugarcaneYieldQualityData, updateField: (field: string, value: any) => void, blocArea?: number }) {

  // Auto-calculate yield per hectare when total yield changes
  const handleTotalYieldChange = (value: string) => {
    const totalYield = value ? parseFloat(value) : undefined
    updateField('totalYieldTons', totalYield)

    if (totalYield && blocArea && blocArea > 0) {
      const yieldPerHa = totalYield / blocArea
      updateField('yieldPerHectare', parseFloat(yieldPerHa.toFixed(2)))

      // Update price per tonne if total revenue is set
      if (data.sugarcaneRevenue && data.sugarcaneRevenue > 0) {
        const pricePerTonne = data.sugarcaneRevenue / totalYield
        updateField('pricePerTonne', parseFloat(pricePerTonne.toFixed(2)))
      }
    }
  }

  // Auto-calculate total yield when yield per hectare changes
  const handleYieldPerHaChange = (value: string) => {
    const yieldPerHa = value ? parseFloat(value) : undefined
    updateField('yieldPerHectare', yieldPerHa)

    if (yieldPerHa && blocArea && blocArea > 0) {
      const totalYield = yieldPerHa * blocArea
      updateField('totalYieldTons', parseFloat(totalYield.toFixed(2)))

      // Update revenue calculations if price per tonne is set
      if (data.pricePerTonne && data.pricePerTonne > 0) {
        const totalRevenue = data.pricePerTonne * totalYield
        updateField('sugarcaneRevenue', parseFloat(totalRevenue.toFixed(2)))

        // Update revenue per hectare
        const revenuePerHa = totalRevenue / blocArea
        updateField('revenuePerHa', parseFloat(revenuePerHa.toFixed(2)))
      }
    }
  }

  // Auto-calculate revenue per hectare when total revenue changes
  const handleTotalRevenueChange = (value: string) => {
    const totalRevenue = value ? parseFloat(value) : undefined
    updateField('sugarcaneRevenue', totalRevenue)

    if (totalRevenue && blocArea && blocArea > 0) {
      const revenuePerHa = totalRevenue / blocArea
      updateField('revenuePerHa', parseFloat(revenuePerHa.toFixed(2)))
    }
  }

  // Auto-calculate total revenue when revenue per hectare changes
  const handleRevenuePerHaChange = (value: string) => {
    const revenuePerHa = value ? parseFloat(value) : undefined
    updateField('revenuePerHa', revenuePerHa)

    if (revenuePerHa && blocArea && blocArea > 0) {
      const totalRevenue = revenuePerHa * blocArea
      updateField('sugarcaneRevenue', parseFloat(totalRevenue.toFixed(2)))

      // Update price per tonne if total yield is set
      if (data.totalYieldTons && data.totalYieldTons > 0) {
        const pricePerTonne = totalRevenue / data.totalYieldTons
        updateField('pricePerTonne', parseFloat(pricePerTonne.toFixed(2)))
      }
    }
  }

  // Auto-calculate total revenue when price per tonne changes
  const handlePricePerTonneChange = (value: string) => {
    const pricePerTonne = value ? parseFloat(value) : undefined
    updateField('pricePerTonne', pricePerTonne)

    if (pricePerTonne && data.totalYieldTons && data.totalYieldTons > 0) {
      const totalRevenue = pricePerTonne * data.totalYieldTons
      updateField('sugarcaneRevenue', parseFloat(totalRevenue.toFixed(2)))

      // Also update revenue per hectare
      if (blocArea && blocArea > 0) {
        const revenuePerHa = totalRevenue / blocArea
        updateField('revenuePerHa', parseFloat(revenuePerHa.toFixed(2)))
      }
    }
  }

  // Auto-calculate price per tonne when total revenue changes (update existing function)
  const handleTotalRevenueChangeWithPrice = (value: string) => {
    const totalRevenue = value ? parseFloat(value) : undefined
    updateField('sugarcaneRevenue', totalRevenue)

    if (totalRevenue && blocArea && blocArea > 0) {
      const revenuePerHa = totalRevenue / blocArea
      updateField('revenuePerHa', parseFloat(revenuePerHa.toFixed(2)))
    }

    // Calculate price per tonne
    if (totalRevenue && data.totalYieldTons && data.totalYieldTons > 0) {
      const pricePerTonne = totalRevenue / data.totalYieldTons
      updateField('pricePerTonne', parseFloat(pricePerTonne.toFixed(2)))
    }
  }
  return (
    <div className="space-y-6">
      {/* Required for Cycle Closure */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-800 mb-3">Required for Cycle Closure</h4>
        <p className="text-xs text-blue-700 mb-3">These fields must be completed before the crop cycle can be closed.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Yield (tons) *</label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={data.totalYieldTons || ''}
              onChange={(e) => handleTotalYieldChange(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="120.5"
              title="Total yield in tons - will auto-calculate yield per hectare"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Yield per Hectare (t/ha) *</label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={data.yieldPerHectare || ''}
              onChange={(e) => handleYieldPerHaChange(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="85.5"
              title="Yield per hectare - will auto-calculate total yield"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Actual Harvest Date</label>
            <input
              type="date"
              value={data.harvestDate || ''}
              onChange={(e) => updateField('harvestDate', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              title="Actual harvest date"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brix (%)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="30"
              value={data.brix || ''}
              onChange={(e) => updateField('brix', e.target.value ? parseFloat(e.target.value) : undefined)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="18.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sugar Content (%)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="20"
              value={data.sugarContent || ''}
              onChange={(e) => updateField('sugarContent', e.target.value ? parseFloat(e.target.value) : undefined)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="12.8"
            />
          </div>
        </div>
      </div>

      {/* Revenue Section */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-green-800 mb-3">Revenue Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Sugarcane Revenue (MUR)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={data.sugarcaneRevenue || ''}
              onChange={(e) => handleTotalRevenueChangeWithPrice(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="450000"
              title="Total sugarcane revenue - will auto-calculate revenue per hectare and price per tonne"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Revenue / ha (MUR/ha)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={data.revenuePerHa || ''}
              onChange={(e) => handleRevenuePerHaChange(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="300000"
              title="Revenue per hectare - will auto-calculate total revenue"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price per Tonne (MUR/t)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={data.pricePerTonne || ''}
              onChange={(e) => handlePricePerTonneChange(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="3600"
              title="Price per tonne - will auto-calculate total revenue"
            />
          </div>
        </div>
      </div>

      {/* Quality Metrics */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-800 mb-3">Quality Metrics</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brix (%)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="30"
              value={data.brix || ''}
              onChange={(e) => updateField('brix', e.target.value ? parseFloat(e.target.value) : undefined)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="18.5"
              title="Brix percentage - measure of sugar content"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sugar Content (%)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="25"
              value={data.sugarContent || ''}
              onChange={(e) => updateField('sugarContent', e.target.value ? parseFloat(e.target.value) : undefined)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="15.2"
              title="Sugar content percentage"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Intercrop Yield Quality Fields (MANDATORY if intercrop planted)
function IntercropYieldQualityFields({ data, updateField, blocArea }: { data: IntercropYieldQualityData, updateField: (field: string, value: any) => void, blocArea?: number }) {

  // Auto-calculate yield per hectare when total yield changes
  const handleTotalYieldChange = (value: string) => {
    const totalYield = value ? parseFloat(value) : undefined
    updateField('totalYieldTons', totalYield)

    if (totalYield && blocArea && blocArea > 0) {
      const yieldPerHa = totalYield / blocArea
      updateField('yieldPerHectare', parseFloat(yieldPerHa.toFixed(2)))
    }
  }

  // Auto-calculate total yield when yield per hectare changes
  const handleYieldPerHaChange = (value: string) => {
    const yieldPerHa = value ? parseFloat(value) : undefined
    updateField('yieldPerHectare', yieldPerHa)

    if (yieldPerHa && blocArea && blocArea > 0) {
      const totalYield = yieldPerHa * blocArea
      updateField('totalYieldTons', parseFloat(totalYield.toFixed(2)))
    }
  }

  // Auto-calculate total revenue when price per tonne changes
  const handlePricePerTonneChange = (value: string) => {
    const pricePerTonne = value ? parseFloat(value) : undefined
    updateField('pricePerTonne', pricePerTonne)

    if (pricePerTonne && data.totalYieldTons && data.totalYieldTons > 0) {
      const totalRevenue = pricePerTonne * data.totalYieldTons
      updateField('intercropRevenue', parseFloat(totalRevenue.toFixed(2)))
    }
  }

  // Auto-calculate price per tonne when total revenue changes
  const handleTotalRevenueChange = (value: string) => {
    const totalRevenue = value ? parseFloat(value) : undefined
    updateField('intercropRevenue', totalRevenue)

    if (totalRevenue && data.totalYieldTons && data.totalYieldTons > 0) {
      const pricePerTonne = totalRevenue / data.totalYieldTons
      updateField('pricePerTonne', parseFloat(pricePerTonne.toFixed(2)))
    }
  }
  return (
    <div className="space-y-6">
      {/* Required for Cycle Closure */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-800 mb-3">Required for Cycle Closure</h4>
        <p className="text-xs text-blue-700 mb-3">These fields must be completed before the crop cycle can be closed.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Intercrop Type</label>
            <select
              value={data.intercropType || ''}
              onChange={(e) => updateField('intercropType', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              title="Select intercrop type"
            >
              <option value="">Select intercrop type</option>
              <option value="beans">Beans</option>
              <option value="maize">Maize</option>
              <option value="potato">Potato</option>
              <option value="onion">Onion</option>
              <option value="tomato">Tomato</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Planned Harvest Date</label>
            <input
              type="date"
              value={data.harvestDate || ''}
              onChange={(e) => updateField('harvestDate', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              title="Planned harvest date"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Yield (tons) *</label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={data.totalYieldTons || ''}
              onChange={(e) => handleTotalYieldChange(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="15.5"
              title="Total yield in tons - will auto-calculate yield per hectare"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Yield per Hectare (t/ha) *</label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={data.yieldPerHectare || ''}
              onChange={(e) => handleYieldPerHaChange(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="12.5"
              title="Yield per hectare - will auto-calculate total yield"
              required
            />
          </div>
        </div>
      </div>

      {/* Revenue Section */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-green-800 mb-3">Revenue Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Intercrop Revenue (MUR)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={data.intercropRevenue || ''}
              onChange={(e) => handleTotalRevenueChange(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="75000"
              title="Total intercrop revenue - will auto-calculate price per tonne"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price per Tonne (MUR/t)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={data.pricePerTonne || ''}
              onChange={(e) => handlePricePerTonneChange(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="6000"
              title="Price per tonne - will auto-calculate total revenue"
            />
          </div>
        </div>
      </div>

      {/* Quality Metrics */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-800 mb-3">Quality Metrics</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Moisture Content (%)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={data.moistureContent || ''}
              onChange={(e) => updateField('moistureContent', e.target.value ? parseFloat(e.target.value) : undefined)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="14.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quality Grade</label>
            <input
              type="text"
              value={data.qualityGrade || ''}
              onChange={(e) => updateField('qualityGrade', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Grade A, Premium, etc."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Harvest Method</label>
            <select
              value={data.harvestMethod || ''}
              onChange={(e) => updateField('harvestMethod', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select method</option>
              <option value="manual">Manual</option>
              <option value="mechanical">Mechanical</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}

// Attachment Upload Modal Component
function AttachmentUploadModal({
  onClose,
  onUpload,
  activeCycleInfo
}: {
  onClose: () => void
  onUpload: (attachments: BlocAttachment[]) => void
  activeCycleInfo: any
}) {
  const [selectedCategory, setSelectedCategory] = useState<AttachmentCategory>('other')
  const [description, setDescription] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [errors, setErrors] = useState<string[]>([])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      setErrors([])
      setUploadedFiles(prev => [...prev, ...acceptedFiles])
    },
    multiple: true
  })

  const handleUpload = () => {
    if (uploadedFiles.length === 0) return

    if (!activeCycleInfo) {
      alert('No active crop cycle found. Please create a crop cycle first.')
      return
    }

    const newAttachments: BlocAttachment[] = uploadedFiles.map(file => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: file.name,
      originalName: file.name,
      category: selectedCategory,
      fileType: file.type,
      fileSize: file.size,
      uploadDate: new Date().toISOString(),
      description: description || undefined,
      tags: [],
      cropCycleId: activeCycleInfo.id,
      cropCycleType: activeCycleInfo.type,
      mimeType: file.type,
      extension: '.' + file.name.split('.').pop()?.toLowerCase(),
      url: URL.createObjectURL(file),
      thumbnailUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      uploadedBy: 'user',
      lastModified: new Date().toISOString()
    }))

    onUpload(newAttachments)
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Upload Files</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as AttachmentCategory)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              title="Select attachment category"
            >
              <option value="other">Other</option>
              <option value="photo">Photo</option>
              <option value="document">Document</option>
              <option value="report">Report</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              rows={3}
              placeholder="Add a description for these files..."
            />
          </div>

          {/* File Upload Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Files</label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-green-400 bg-green-50'
                  : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'
              }`}
            >
              <input {...getInputProps()} />
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="mt-2 text-sm text-gray-600">
                {isDragActive ? 'Drop files here...' : 'Drag & drop files here, or click to select'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Supports images, documents, and other file types
              </p>
            </div>
          </div>

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Files ({uploadedFiles.length})</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <svg className="h-5 w-5 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-gray-900 truncate">{file.name}</span>
                      <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-red-400 hover:text-red-600 p-1"
                      title="Remove file"
                    >
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <h4 className="text-sm font-medium text-red-800 mb-1">Upload Errors:</h4>
              <ul className="text-sm text-red-700 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={uploadedFiles.length === 0}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            Upload {uploadedFiles.length > 0 ? `${uploadedFiles.length} File${uploadedFiles.length > 1 ? 's' : ''}` : 'Files'}
          </button>
        </div>
      </div>
    </div>
  )
}
