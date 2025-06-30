#!/usr/bin/env python3
"""
High-Resolution PDF to Image Converter using PyMuPDF
Converts MSIRI sugarcane pamphlets to ultra-high-resolution PNG images.
"""

import os
import requests
import fitz  # PyMuPDF
from PIL import Image
import io

def download_pdf(url, filename):
    """Download PDF from URL and save to file."""
    print(f"Downloading {filename} from {url}...")
    
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        
        with open(filename, 'wb') as f:
            f.write(response.content)
        
        print(f"✓ Successfully downloaded {filename} ({len(response.content)} bytes)")
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"✗ Error downloading {filename}: {e}")
        return False

def pdf_to_ultra_high_res_image(pdf_path, output_prefix, zoom_factor=6.0):
    """
    Convert PDF first page to ultra-high-resolution image using PyMuPDF.
    
    Args:
        pdf_path: Path to the PDF file
        output_prefix: Prefix for output image files
        zoom_factor: Zoom factor (6.0 = ~1800 DPI equivalent)
    """
    print(f"Converting {pdf_path} to ultra-high-resolution image (zoom: {zoom_factor}x)...")
    
    try:
        # Open PDF document
        doc = fitz.open(pdf_path)
        
        if len(doc) == 0:
            print(f"✗ PDF {pdf_path} has no pages")
            return None
        
        # Get first page
        page = doc[0]
        
        # Create transformation matrix for high resolution
        mat = fitz.Matrix(zoom_factor, zoom_factor)
        
        # Render page to pixmap with high resolution
        pix = page.get_pixmap(matrix=mat, alpha=False)
        
        # Convert to PNG bytes
        png_data = pix.tobytes("png")
        
        # Save as PNG file
        output_filename = f"{output_prefix}_zoom{zoom_factor}x.png"
        with open(output_filename, 'wb') as f:
            f.write(png_data)
        
        # Get image info
        width = pix.width
        height = pix.height
        file_size = os.path.getsize(output_filename)
        equivalent_dpi = int(72 * zoom_factor)  # 72 DPI is PDF default
        
        print(f"✓ Saved {output_filename}")
        print(f"  Resolution: {width} x {height} pixels")
        print(f"  File size: {file_size / (1024*1024):.1f} MB")
        print(f"  Equivalent DPI: ~{equivalent_dpi}")
        print(f"  Zoom factor: {zoom_factor}x")
        
        # Clean up
        pix = None
        doc.close()
        
        return output_filename
        
    except Exception as e:
        print(f"✗ Error converting {pdf_path}: {e}")
        return None

def create_multiple_resolutions(pdf_path, output_prefix):
    """Create multiple resolution versions of the PDF."""
    zoom_factors = [
        (2.0, "Standard (144 DPI)"),
        (4.0, "High (288 DPI)"), 
        (6.0, "Very High (432 DPI)"),
        (8.0, "Ultra High (576 DPI)"),
        (10.0, "Maximum (720 DPI)")
    ]
    
    results = []
    
    for zoom, description in zoom_factors:
        print(f"\nCreating {description}...")
        result = pdf_to_ultra_high_res_image(pdf_path, output_prefix, zoom)
        if result:
            results.append(result)
    
    return results

def main():
    """Main function to process MSIRI pamphlets."""
    
    # PDF URLs and filenames
    pdfs = [
        {
            'url': 'http://www.msiri.mu/UserFiles/File/sugarcane%20pamphlets/M%201392-00.pdf',
            'filename': 'M1392-00.pdf',
            'prefix': 'M1392-00'
        },
        {
            'url': 'http://www.msiri.mu/UserFiles/File/sugarcane%20pamphlets/M%202283-98.pdf',
            'filename': 'M2283-98.pdf', 
            'prefix': 'M2283-98'
        }
    ]
    
    # Create output directory
    output_dir = 'ultra_high_res_pamphlets'
    os.makedirs(output_dir, exist_ok=True)
    os.chdir(output_dir)
    
    print("=" * 70)
    print("MSIRI Sugarcane Pamphlet Ultra-High-Resolution Image Converter")
    print("Using PyMuPDF for Vector-Quality Rendering")
    print("=" * 70)
    
    all_results = []
    
    # Process each PDF
    for pdf_info in pdfs:
        print(f"\nProcessing {pdf_info['prefix']}...")
        print("-" * 50)
        
        # Download PDF
        if download_pdf(pdf_info['url'], pdf_info['filename']):
            
            # Create multiple resolution versions
            results = create_multiple_resolutions(
                pdf_info['filename'], 
                pdf_info['prefix']
            )
            all_results.extend(results)
        
        print("-" * 50)
    
    print(f"\n✓ All conversions complete!")
    print(f"Output directory: {os.getcwd()}")
    print("\nGenerated high-resolution images:")
    print("=" * 50)
    
    for file in sorted(os.listdir('.')):
        if file.endswith('.png'):
            size_mb = os.path.getsize(file) / (1024*1024)
            
            # Get image dimensions
            try:
                with Image.open(file) as img:
                    width, height = img.size
                    print(f"📄 {file}")
                    print(f"   Size: {width} x {height} pixels")
                    print(f"   File: {size_mb:.1f} MB")
                    print()
            except:
                print(f"📄 {file} ({size_mb:.1f} MB)")
    
    print("🎯 Recommendation: Use zoom 6.0x or 8.0x files for best quality/size balance")
    print("🔍 These images can be zoomed extensively while maintaining crisp quality")

if __name__ == "__main__":
    main()
