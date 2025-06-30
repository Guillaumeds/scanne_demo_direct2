#!/usr/bin/env python3
"""
Script to convert GeoTIFF files to web map tiles for use in Leaflet.
Creates XYZ tile structure that can be served directly or via a simple HTTP server.
"""

import os
import math
import rasterio
from rasterio.warp import calculate_default_transform, reproject, Resampling
from rasterio.windows import Window
from PIL import Image
import numpy as np
from pathlib import Path

def deg2num(lat_deg, lon_deg, zoom):
    """Convert lat/lon to tile numbers."""
    lat_rad = math.radians(lat_deg)
    n = 2.0 ** zoom
    xtile = int((lon_deg + 180.0) / 360.0 * n)
    ytile = int((1.0 - math.asinh(math.tan(lat_rad)) / math.pi) / 2.0 * n)
    return (xtile, ytile)

def num2deg(xtile, ytile, zoom):
    """Convert tile numbers to lat/lon."""
    n = 2.0 ** zoom
    lon_deg = xtile / n * 360.0 - 180.0
    lat_rad = math.atan(math.sinh(math.pi * (1 - 2 * ytile / n)))
    lat_deg = math.degrees(lat_rad)
    return (lat_deg, lon_deg)

def normalize_band_for_display(band_data, band_type="vegetation"):
    """Normalize band data for display (0-255)."""
    
    if band_type == "vegetation":  # NDVI, EVI, SAVI
        # Vegetation indices typically range 0-1, but can have negative values
        # Clip to reasonable range and normalize
        clipped = np.clip(band_data, -0.2, 1.0)
        normalized = ((clipped + 0.2) / 1.2 * 255).astype(np.uint8)
    elif band_type == "moisture":  # Moisture indices
        # Usually 0-1 range
        clipped = np.clip(band_data, 0, 1)
        normalized = (clipped * 255).astype(np.uint8)
    elif band_type == "soil":  # Barren soil index
        # Can have negative values, normalize around 0
        clipped = np.clip(band_data, -6, 5)
        normalized = ((clipped + 6) / 11 * 255).astype(np.uint8)
    else:  # Default
        # Auto-scale based on data range
        min_val, max_val = np.nanpercentile(band_data, [2, 98])  # Use 2-98 percentile
        clipped = np.clip(band_data, min_val, max_val)
        if max_val > min_val:
            normalized = ((clipped - min_val) / (max_val - min_val) * 255).astype(np.uint8)
        else:
            normalized = np.zeros_like(clipped, dtype=np.uint8)
    
    return normalized

def create_tiles_for_geotiff(geotiff_path, output_dir, min_zoom=10, max_zoom=16):
    """Create XYZ tiles from a GeoTIFF file."""
    
    geotiff_path = Path(geotiff_path)
    layer_name = geotiff_path.stem
    
    # Determine band type for proper normalization
    if "NDVI" in layer_name or "EVI" in layer_name or "SAVI" in layer_name or "Agriculture" in layer_name:
        band_type = "vegetation"
    elif "Moisture" in layer_name:
        band_type = "moisture"
    elif "Soil" in layer_name:
        band_type = "soil"
    else:
        band_type = "default"
    
    print(f"Processing {layer_name} (type: {band_type})...")
    
    with rasterio.open(geotiff_path) as src:
        bounds = src.bounds
        
        # Create output directory structure
        layer_dir = Path(output_dir) / layer_name
        layer_dir.mkdir(parents=True, exist_ok=True)
        
        for zoom in range(min_zoom, max_zoom + 1):
            print(f"  Creating zoom level {zoom}...")
            
            # Calculate tile bounds for this zoom level
            min_tile_x, max_tile_y = deg2num(bounds.top, bounds.left, zoom)
            max_tile_x, min_tile_y = deg2num(bounds.bottom, bounds.right, zoom)
            
            zoom_dir = layer_dir / str(zoom)
            zoom_dir.mkdir(exist_ok=True)
            
            for tile_x in range(min_tile_x, max_tile_x + 1):
                x_dir = zoom_dir / str(tile_x)
                x_dir.mkdir(exist_ok=True)
                
                for tile_y in range(min_tile_y, max_tile_y + 1):
                    # Calculate tile bounds in geographic coordinates
                    north, west = num2deg(tile_x, tile_y, zoom)
                    south, east = num2deg(tile_x + 1, tile_y + 1, zoom)
                    
                    # Check if tile intersects with raster bounds
                    if (east < bounds.left or west > bounds.right or 
                        north < bounds.bottom or south > bounds.top):
                        continue
                    
                    try:
                        # Read data for this tile extent
                        window = rasterio.windows.from_bounds(
                            west, south, east, north, src.transform
                        )
                        
                        # Read the first band (main data)
                        data = src.read(1, window=window)
                        
                        if data.size == 0 or np.all(np.isnan(data)):
                            continue
                        
                        # Resize to 256x256 (standard tile size)
                        if data.shape != (256, 256):
                            # Use PIL for resizing
                            img_data = normalize_band_for_display(data, band_type)
                            img = Image.fromarray(img_data, mode='L')
                            img = img.resize((256, 256), Image.Resampling.LANCZOS)
                            tile_data = np.array(img)
                        else:
                            tile_data = normalize_band_for_display(data, band_type)
                        
                        # Create RGB image (grayscale to RGB for vegetation indices)
                        if band_type == "vegetation":
                            # Create a green-scale colormap for vegetation
                            rgb_data = np.zeros((256, 256, 3), dtype=np.uint8)
                            rgb_data[:, :, 1] = tile_data  # Green channel
                            rgb_data[:, :, 0] = tile_data // 2  # Some red for mixed colors
                        elif band_type == "moisture":
                            # Create a blue-scale colormap for moisture
                            rgb_data = np.zeros((256, 256, 3), dtype=np.uint8)
                            rgb_data[:, :, 2] = tile_data  # Blue channel
                            rgb_data[:, :, 0] = tile_data // 3  # Some red
                        else:
                            # Grayscale
                            rgb_data = np.stack([tile_data, tile_data, tile_data], axis=2)
                        
                        # Save as PNG
                        tile_path = x_dir / f"{tile_y}.png"
                        img = Image.fromarray(rgb_data, mode='RGB')
                        img.save(tile_path, 'PNG')
                        
                    except Exception as e:
                        print(f"    Error creating tile {zoom}/{tile_x}/{tile_y}: {e}")
                        continue
            
            print(f"    Completed zoom level {zoom}")
    
    print(f"✅ Completed tiles for {layer_name}")
    return layer_dir

def create_simple_tile_server():
    """Create a simple Python HTTP server script for serving tiles."""
    
    server_script = '''#!/usr/bin/env python3
"""
Simple tile server for serving XYZ tiles locally.
Run this script and access tiles at: http://localhost:8000/{layer_name}/{z}/{x}/{y}.png
"""

import http.server
import socketserver
import os
from pathlib import Path

PORT = 8000
TILES_DIR = Path(__file__).parent / "tiles"

class TileHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(TILES_DIR), **kwargs)
    
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

if __name__ == "__main__":
    os.chdir(TILES_DIR)
    with socketserver.TCPServer(("", PORT), TileHandler) as httpd:
        print(f"Serving tiles at http://localhost:{PORT}")
        print(f"Tiles directory: {TILES_DIR}")
        print("Available layers:")
        for layer_dir in TILES_DIR.iterdir():
            if layer_dir.is_dir():
                print(f"  - {layer_dir.name}")
                print(f"    URL: http://localhost:{PORT}/{layer_dir.name}/{{z}}/{{x}}/{{y}}.png")
        print("\\nPress Ctrl+C to stop the server")
        httpd.serve_forever()
'''
    
    with open("tile_server.py", "w") as f:
        f.write(server_script)
    
    print("✅ Created tile_server.py")

def main():
    """Main function to create tiles from all GeoTIFF files."""
    
    print("GeoTIFF to Web Tiles Converter")
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
    tiles_dir = current_dir / "tiles"
    tiles_dir.mkdir(exist_ok=True)
    
    print(f"Creating tiles for {len(tiff_files)} files...")
    print(f"Output directory: {tiles_dir}")
    print()
    
    # Process each TIFF file
    for tiff_file in sorted(tiff_files):
        try:
            create_tiles_for_geotiff(tiff_file, tiles_dir, min_zoom=12, max_zoom=16)
        except Exception as e:
            print(f"❌ Error processing {tiff_file.name}: {e}")
    
    # Create tile server script
    create_simple_tile_server()
    
    print("\n" + "=" * 50)
    print("NEXT STEPS:")
    print("=" * 50)
    print("1. Run the tile server: python tile_server.py")
    print("2. Add layers to your Leaflet app using URLs like:")
    print("   http://localhost:8000/{layer_name}/{z}/{x}/{y}.png")
    print("3. Available layers will be shown when you start the server")

if __name__ == "__main__":
    main()
