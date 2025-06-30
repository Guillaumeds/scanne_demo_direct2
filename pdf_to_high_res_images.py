#!/usr/bin/env python3
"""
High-Resolution PDF to Image Converter for MSIRI Sugarcane Pamphlets
Converts PDF pamphlets to high-resolution PNG images suitable for zooming and detailed viewing.
"""

import os
import requests
from pdf2image import convert_from_bytes
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

def pdf_to_high_res_images(pdf_path, output_prefix, dpi=600):
    """
    Convert PDF to high-resolution images.
    
    Args:
        pdf_path: Path to the PDF file
        output_prefix: Prefix for output image files
        dpi: Resolution in DPI (600 = very high quality, 300 = high quality)
    """
    print(f"Converting {pdf_path} to high-resolution images (DPI: {dpi})...")
    
    try:
        # Convert PDF to images with high DPI
        with open(pdf_path, 'rb') as pdf_file:
            pdf_bytes = pdf_file.read()
            
        # Convert first page only (as requested)
        images = convert_from_bytes(
            pdf_bytes, 
            dpi=dpi,
            first_page=1,
            last_page=1,
            fmt='PNG'
        )
        
        if images:
            # Save the first page as high-resolution PNG
            output_filename = f"{output_prefix}_page1_dpi{dpi}.png"
            images[0].save(output_filename, 'PNG', optimize=False, compress_level=0)
            
            # Get image dimensions
            width, height = images[0].size
            file_size = os.path.getsize(output_filename)
            
            print(f"✓ Saved {output_filename}")
            print(f"  Resolution: {width} x {height} pixels")
            print(f"  File size: {file_size / (1024*1024):.1f} MB")
            print(f"  Effective DPI: {dpi}")
            
            return output_filename
        else:
            print(f"✗ No images extracted from {pdf_path}")
            return None
            
    except Exception as e:
        print(f"✗ Error converting {pdf_path}: {e}")
        return None

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
    output_dir = 'high_res_pamphlets'
    os.makedirs(output_dir, exist_ok=True)
    os.chdir(output_dir)
    
    print("=" * 60)
    print("MSIRI Sugarcane Pamphlet High-Resolution Image Converter")
    print("=" * 60)
    
    # Process each PDF
    for pdf_info in pdfs:
        print(f"\nProcessing {pdf_info['prefix']}...")
        print("-" * 40)
        
        # Download PDF
        if download_pdf(pdf_info['url'], pdf_info['filename']):
            
            # Convert to multiple resolutions
            resolutions = [300, 600, 900]  # Standard, High, Very High
            
            for dpi in resolutions:
                print(f"\nConverting at {dpi} DPI...")
                result = pdf_to_high_res_images(
                    pdf_info['filename'], 
                    pdf_info['prefix'], 
                    dpi=dpi
                )
                
                if result:
                    print(f"✓ Created: {result}")
        
        print("-" * 40)
    
    print(f"\n✓ All conversions complete!")
    print(f"Output directory: {os.getcwd()}")
    print("\nGenerated files:")
    for file in os.listdir('.'):
        if file.endswith('.png'):
            size_mb = os.path.getsize(file) / (1024*1024)
            print(f"  {file} ({size_mb:.1f} MB)")

if __name__ == "__main__":
    main()
