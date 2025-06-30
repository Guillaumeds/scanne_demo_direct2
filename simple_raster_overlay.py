#!/usr/bin/env python3
"""
Simple approach: Convert GeoTIFF to PNG with world file for direct Leaflet overlay.
This is simpler than tiling but less performant for large areas.
"""

import rasterio
import numpy as np
from PIL import Image
from pathlib import Path

def normalize_for_display(data, layer_type):
    """Normalize data for RGB display."""
    
    if layer_type == "vegetation":  # NDVI, EVI, SAVI, Agriculture
        # Vegetation indices: create green colormap
        # Clip to reasonable range
        clipped = np.clip(data, -0.2, 1.0)
        normalized = ((clipped + 0.2) / 1.2 * 255).astype(np.uint8)
        
        # Create RGB (green-based)
        rgb = np.zeros((*data.shape, 3), dtype=np.uint8)
        rgb[:, :, 1] = normalized  # Green channel
        rgb[:, :, 0] = normalized // 3  # Some red for variation
        
    elif layer_type == "moisture":  # Moisture indices
        # Moisture: create blue colormap
        clipped = np.clip(data, 0, 1)
        normalized = (clipped * 255).astype(np.uint8)
        
        rgb = np.zeros((*data.shape, 3), dtype=np.uint8)
        rgb[:, :, 2] = normalized  # Blue channel
        rgb[:, :, 0] = normalized // 4  # Slight red tint
        
    elif layer_type == "soil":  # Barren soil
        # Soil: create brown/orange colormap
        clipped = np.clip(data, -6, 5)
        normalized = ((clipped + 6) / 11 * 255).astype(np.uint8)
        
        rgb = np.zeros((*data.shape, 3), dtype=np.uint8)
        rgb[:, :, 0] = normalized  # Red channel
        rgb[:, :, 1] = normalized // 2  # Some green for brown
        
    else:
        # Default grayscale
        min_val, max_val = np.nanpercentile(data, [2, 98])
        clipped = np.clip(data, min_val, max_val)
        if max_val > min_val:
            normalized = ((clipped - min_val) / (max_val - min_val) * 255).astype(np.uint8)
        else:
            normalized = np.zeros_like(clipped, dtype=np.uint8)
        
        rgb = np.stack([normalized, normalized, normalized], axis=2)
    
    return rgb

def create_png_overlay(geotiff_path, output_dir):
    """Convert GeoTIFF to PNG with transparency for Leaflet overlay."""
    
    geotiff_path = Path(geotiff_path)
    layer_name = geotiff_path.stem
    
    # Determine layer type
    if any(keyword in layer_name.upper() for keyword in ["NDVI", "EVI", "SAVI", "AGRICULTURE"]):
        layer_type = "vegetation"
    elif "MOISTURE" in layer_name.upper():
        layer_type = "moisture"
    elif "SOIL" in layer_name.upper():
        layer_type = "soil"
    else:
        layer_type = "default"
    
    print(f"Converting {layer_name} ({layer_type})...")
    
    with rasterio.open(geotiff_path) as src:
        # Read the first band
        data = src.read(1)
        
        # Create RGB image
        rgb_data = normalize_for_display(data, layer_type)
        
        # Create alpha channel (transparency for no-data areas)
        alpha = np.where(np.isnan(data), 0, 255).astype(np.uint8)
        
        # Combine RGB + Alpha
        rgba_data = np.dstack([rgb_data, alpha])
        
        # Create PIL image
        img = Image.fromarray(rgba_data, mode='RGBA')
        
        # Save PNG
        output_path = Path(output_dir) / f"{layer_name}.png"
        img.save(output_path, 'PNG')
        
        # Create bounds info for Leaflet
        bounds = src.bounds
        bounds_info = {
            'filename': f"{layer_name}.png",
            'bounds': [[bounds.bottom, bounds.left], [bounds.top, bounds.right]],
            'layer_name': layer_name,
            'layer_type': layer_type
        }
        
        print(f"  ✅ Created {output_path}")
        print(f"  📍 Bounds: {bounds}")
        
        return bounds_info

def create_leaflet_integration_code(layers_info):
    """Generate JavaScript code for adding layers to Leaflet map."""
    
    js_code = '''
// Add Sentinel-2 raster overlays to your Leaflet map
// Place this code in your MapComponent.tsx or create a new component

const sentinelLayers = {
'''
    
    for layer_info in layers_info:
        layer_id = layer_info['layer_name'].replace('-', '_').replace(' ', '_')
        js_code += f'''
  {layer_id}: {{
    name: "{layer_info['layer_name']}",
    type: "{layer_info['layer_type']}",
    url: "/sentinel_overlays/{layer_info['filename']}",
    bounds: {layer_info['bounds']},
    opacity: 0.7
  }},'''
    
    js_code += '''
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
'''
    
    return js_code

def main():
    """Convert all GeoTIFF files to PNG overlays."""
    
    print("GeoTIFF to PNG Overlay Converter")
    print("=" * 50)
    
    # Find TIFF files
    current_dir = Path.cwd()
    tiff_dir = current_dir / "Browser_images (2)_clean"
    
    if not tiff_dir.exists():
        print(f"Directory not found: {tiff_dir}")
        return
    
    tiff_files = list(tiff_dir.glob("*.tiff")) + list(tiff_dir.glob("*.tif"))
    
    if not tiff_files:
        print(f"No TIFF files found in {tiff_dir}")
        return
    
    # Create output directory
    output_dir = current_dir / "public" / "sentinel_overlays"
    output_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"Converting {len(tiff_files)} files to PNG overlays...")
    print(f"Output directory: {output_dir}")
    print()
    
    layers_info = []
    
    # Process each TIFF file
    for tiff_file in sorted(tiff_files):
        try:
            layer_info = create_png_overlay(tiff_file, output_dir)
            layers_info.append(layer_info)
        except Exception as e:
            print(f"❌ Error processing {tiff_file.name}: {e}")
    
    # Generate integration code
    js_code = create_leaflet_integration_code(layers_info)
    
    # Save integration code
    with open("sentinel_integration.js", "w") as f:
        f.write(js_code)
    
    print(f"\n✅ Created {len(layers_info)} PNG overlays")
    print("✅ Created sentinel_integration.js with Leaflet integration code")
    
    print("\n" + "=" * 50)
    print("NEXT STEPS:")
    print("=" * 50)
    print("1. PNG files are in: public/sentinel_overlays/")
    print("2. Integration code is in: sentinel_integration.js")
    print("3. Add the layers to your MapComponent using the provided code")
    print("4. Layers will be available as image overlays in your Leaflet map")

if __name__ == "__main__":
    main()
