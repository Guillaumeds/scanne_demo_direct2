
// Add Sentinel-2 raster overlays to your Leaflet map
// Place this code in your MapComponent.tsx or create a new component

const sentinelLayers = {

  2019_06_03_00_00_2019_06_03_23_59_Sentinel_2_L2A_Agriculture: {
    name: "2019-06-03-00-00_2019-06-03-23-59_Sentinel-2_L2A_Agriculture",
    type: "vegetation",
    url: "/sentinel_overlays/2019-06-03-00-00_2019-06-03-23-59_Sentinel-2_L2A_Agriculture.png",
    bounds: [[-20.520584, 57.546387], [-20.384847, 57.731781]],
    opacity: 0.7
  },
  2019_06_03_00_00_2019_06_03_23_59_Sentinel_2_L2A_Barren_Soil: {
    name: "2019-06-03-00-00_2019-06-03-23-59_Sentinel-2_L2A_Barren_Soil",
    type: "soil",
    url: "/sentinel_overlays/2019-06-03-00-00_2019-06-03-23-59_Sentinel-2_L2A_Barren_Soil.png",
    bounds: [[-20.520584, 57.546387], [-20.384847, 57.731781]],
    opacity: 0.7
  },
  2019_06_03_00_00_2019_06_03_23_59_Sentinel_2_L2A_EVI: {
    name: "2019-06-03-00-00_2019-06-03-23-59_Sentinel-2_L2A_EVI",
    type: "vegetation",
    url: "/sentinel_overlays/2019-06-03-00-00_2019-06-03-23-59_Sentinel-2_L2A_EVI.png",
    bounds: [[-20.520584, 57.546387], [-20.384847, 57.731781]],
    opacity: 0.7
  },
  2019_06_03_00_00_2019_06_03_23_59_Sentinel_2_L2A_Moisture_Index: {
    name: "2019-06-03-00-00_2019-06-03-23-59_Sentinel-2_L2A_Moisture_Index",
    type: "moisture",
    url: "/sentinel_overlays/2019-06-03-00-00_2019-06-03-23-59_Sentinel-2_L2A_Moisture_Index.png",
    bounds: [[-20.520584, 57.546387], [-20.384847, 57.731781]],
    opacity: 0.7
  },
  2019_06_03_00_00_2019_06_03_23_59_Sentinel_2_L2A_Moisture_Stress: {
    name: "2019-06-03-00-00_2019-06-03-23-59_Sentinel-2_L2A_Moisture_Stress",
    type: "moisture",
    url: "/sentinel_overlays/2019-06-03-00-00_2019-06-03-23-59_Sentinel-2_L2A_Moisture_Stress.png",
    bounds: [[-20.520584, 57.546387], [-20.384847, 57.731781]],
    opacity: 0.7
  },
  2019_06_03_00_00_2019_06_03_23_59_Sentinel_2_L2A_NDVI: {
    name: "2019-06-03-00-00_2019-06-03-23-59_Sentinel-2_L2A_NDVI",
    type: "vegetation",
    url: "/sentinel_overlays/2019-06-03-00-00_2019-06-03-23-59_Sentinel-2_L2A_NDVI.png",
    bounds: [[-20.520584, 57.546387], [-20.384847, 57.731781]],
    opacity: 0.7
  },
  2019_06_03_00_00_2019_06_03_23_59_Sentinel_2_L2A_SAVI: {
    name: "2019-06-03-00-00_2019-06-03-23-59_Sentinel-2_L2A_SAVI",
    type: "vegetation",
    url: "/sentinel_overlays/2019-06-03-00-00_2019-06-03-23-59_Sentinel-2_L2A_SAVI.png",
    bounds: [[-20.520584, 57.546387], [-20.384847, 57.731781]],
    opacity: 0.7
  },
}

// Function to add a Sentinel layer to the map
function addSentinelLayer(map, layerId) {
  const layerInfo = sentinelLayers[layerId]
  if (!layerInfo) return null
  
  const imageOverlay = L.imageOverlay(layerInfo.url, layerInfo.bounds, {
    opacity: layerInfo.opacity,
    interactive: false
  })
  
  imageOverlay.addTo(map)
  return imageOverlay
}

// Example usage in your MapComponent:
// const ndviLayer = addSentinelLayer(mapInstance, 'NDVI')

// Layer control example:
const overlayMaps = {}
Object.keys(sentinelLayers).forEach(layerId => {
  const layerInfo = sentinelLayers[layerId]
  overlayMaps[layerInfo.name] = L.imageOverlay(layerInfo.url, layerInfo.bounds, {
    opacity: layerInfo.opacity,
    interactive: false
  })
})

// Add to layer control
L.control.layers(null, overlayMaps).addTo(map)
