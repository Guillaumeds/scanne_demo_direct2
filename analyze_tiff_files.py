#!/usr/bin/env python3
"""
Script to analyze TIFF files for geospatial information.
Checks if TIFFs are GeoTIFFs with coordinate reference system (CRS) and bounds.
"""

import os
from pathlib import Path

def check_dependencies():
    """Check if required libraries are available."""
    missing_libs = []
    
    try:
        import PIL
        from PIL import Image
        print("✓ PIL/Pillow available")
    except ImportError:
        missing_libs.append("Pillow")
    
    try:
        import rasterio
        print("✓ rasterio available")
    except ImportError:
        missing_libs.append("rasterio")
    
    try:
        import numpy as np
        print("✓ numpy available")
    except ImportError:
        missing_libs.append("numpy")
    
    if missing_libs:
        print(f"\n❌ Missing required libraries: {', '.join(missing_libs)}")
        print("\nTo install missing libraries, run:")
        for lib in missing_libs:
            if lib == "rasterio":
                print(f"  pip install {lib}")
            else:
                print(f"  pip install {lib}")
        return False
    
    return True

def analyze_with_pil(file_path):
    """Analyze TIFF using PIL/Pillow (basic info only)."""
    try:
        from PIL import Image
        from PIL.ExifTags import TAGS
        
        with Image.open(file_path) as img:
            print(f"  📐 Dimensions: {img.size[0]} x {img.size[1]} pixels")
            print(f"  🎨 Mode: {img.mode}")
            print(f"  📊 Format: {img.format}")
            
            # Check for EXIF/metadata
            if hasattr(img, '_getexif') and img._getexif():
                exif = img._getexif()
                print(f"  📋 EXIF data available: {len(exif)} tags")
            
            # Check for GeoTIFF tags
            if hasattr(img, 'tag') and img.tag:
                geotiff_tags = {}
                for tag_id, value in img.tag.items():
                    if tag_id in [33550, 33922, 34735, 34736, 34737]:  # Common GeoTIFF tags
                        geotiff_tags[tag_id] = value
                
                if geotiff_tags:
                    print(f"  🌍 GeoTIFF tags found: {list(geotiff_tags.keys())}")
                else:
                    print(f"  ❌ No GeoTIFF tags found")
            
    except Exception as e:
        print(f"  ❌ PIL analysis failed: {e}")

def analyze_with_rasterio(file_path):
    """Analyze TIFF using rasterio (full geospatial info)."""
    try:
        import rasterio
        from rasterio.crs import CRS
        
        with rasterio.open(file_path) as src:
            print(f"  📐 Dimensions: {src.width} x {src.height} pixels")
            print(f"  📊 Bands: {src.count}")
            print(f"  🔢 Data type: {src.dtypes[0]}")
            
            # Coordinate Reference System
            if src.crs:
                print(f"  🗺️  CRS: {src.crs}")
                print(f"  🗺️  CRS (EPSG): {src.crs.to_epsg() if src.crs.to_epsg() else 'Unknown'}")
            else:
                print(f"  ❌ No CRS information")
            
            # Bounds and transform
            if src.transform:
                print(f"  📍 Transform: {src.transform}")
                bounds = src.bounds
                print(f"  🌍 Bounds (minx, miny, maxx, maxy): {bounds}")
                print(f"  📏 Pixel size: {abs(src.transform[0]):.6f} x {abs(src.transform[4]):.6f}")
                
                # Convert bounds to lat/lon if possible
                if src.crs and src.crs.to_epsg():
                    try:
                        import rasterio.warp
                        bounds_4326 = rasterio.warp.transform_bounds(src.crs, CRS.from_epsg(4326), *bounds)
                        print(f"  🌐 Bounds (WGS84): {bounds_4326}")
                        print(f"     West: {bounds_4326[0]:.6f}°, South: {bounds_4326[1]:.6f}°")
                        print(f"     East: {bounds_4326[2]:.6f}°, North: {bounds_4326[3]:.6f}°")
                    except Exception as e:
                        print(f"  ⚠️  Could not convert bounds to WGS84: {e}")
            else:
                print(f"  ❌ No geospatial transform")
            
            # Check if it covers Mauritius (approximate bounds)
            if src.crs and src.bounds:
                try:
                    import rasterio.warp
                    bounds_4326 = rasterio.warp.transform_bounds(src.crs, CRS.from_epsg(4326), *src.bounds)
                    
                    # Mauritius approximate bounds: 57.3-57.8°E, -20.5 to -19.9°N
                    mauritius_bounds = (57.3, -20.5, 57.8, -19.9)
                    
                    # Check overlap
                    overlaps = (bounds_4326[0] < mauritius_bounds[2] and bounds_4326[2] > mauritius_bounds[0] and
                               bounds_4326[1] < mauritius_bounds[3] and bounds_4326[3] > mauritius_bounds[1])
                    
                    if overlaps:
                        print(f"  ✅ Covers Mauritius region!")
                    else:
                        print(f"  ❌ Does not cover Mauritius region")
                        
                except Exception as e:
                    print(f"  ⚠️  Could not check Mauritius coverage: {e}")
            
            # Statistics for first band
            try:
                band1 = src.read(1)
                import numpy as np
                print(f"  📈 Band 1 stats: min={np.nanmin(band1):.3f}, max={np.nanmax(band1):.3f}, mean={np.nanmean(band1):.3f}")
            except Exception as e:
                print(f"  ⚠️  Could not read band statistics: {e}")
                
    except Exception as e:
        print(f"  ❌ Rasterio analysis failed: {e}")

def main():
    """Main function to analyze TIFF files."""
    
    print("TIFF File Geospatial Analysis")
    print("=" * 50)
    
    # Check dependencies
    if not check_dependencies():
        return
    
    # Find TIFF files
    current_dir = Path.cwd()
    tiff_dir = current_dir / "Browser_images (2)_clean"
    
    if not tiff_dir.exists():
        print(f"Directory not found: {tiff_dir}")
        print("Please run the rename script first to extract the TIFF files.")
        return
    
    tiff_files = list(tiff_dir.glob("*.tiff")) + list(tiff_dir.glob("*.tif"))
    
    if not tiff_files:
        print(f"No TIFF files found in {tiff_dir}")
        return
    
    print(f"\nFound {len(tiff_files)} TIFF files:")
    print("-" * 50)
    
    for i, tiff_file in enumerate(sorted(tiff_files), 1):
        print(f"\n{i}. {tiff_file.name}")
        print("   " + "=" * (len(tiff_file.name) + 3))
        
        # Try rasterio first (more comprehensive)
        try:
            import rasterio
            analyze_with_rasterio(tiff_file)
        except ImportError:
            # Fall back to PIL
            analyze_with_pil(tiff_file)
    
    print("\n" + "=" * 50)
    print("RECOMMENDATIONS:")
    print("=" * 50)
    print("Based on the analysis above:")
    print("1. If files have CRS and bounds → They are proper GeoTIFFs")
    print("2. If they cover Mauritius → Perfect for your farm app")
    print("3. For web display, you'll need to:")
    print("   a) Convert to web-friendly tiles (recommended)")
    print("   b) Or serve as WMS/raster overlay (simpler but less performant)")

if __name__ == "__main__":
    main()
