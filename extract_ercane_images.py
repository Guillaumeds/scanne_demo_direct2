#!/usr/bin/env python3
"""
Extract all images from eRcane sugarcane variety PDFs into organized folders

This script handles the colorspace issues that were encountered with eRcane PDFs
and extracts images with multiple fallback methods.
"""

import fitz  # PyMuPDF
import os
from pathlib import Path
import json

def extract_images_from_pdf(pdf_path, output_dir, variety_name):
    """
    Extract all images from a PDF and save them to the output directory.
    Uses multiple methods to handle different colorspace issues.
    """
    try:
        doc = fitz.open(pdf_path)
        
        # Create output directory
        output_dir.mkdir(parents=True, exist_ok=True)
        
        extracted_images = []
        total_images = 0
        
        # Iterate through all pages
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            
            # Get list of images on this page
            image_list = page.get_images(full=True)
            
            for img_index, img in enumerate(image_list):
                total_images += 1
                
                # Extract image information
                xref = img[0]  # xref number
                
                try:
                    # Try to get the pixmap
                    pix = fitz.Pixmap(doc, xref)
                    
                    # Create descriptive filename
                    img_filename = f"{variety_name}_page{page_num+1:02d}_img{img_index+1:02d}_{pix.width}x{pix.height}.png"
                    img_path = output_dir / img_filename
                    
                    # Try multiple extraction methods
                    success = False
                    
                    # Method 1: Direct save (works for most images)
                    try:
                        if pix.n - pix.alpha < 4:  # GRAY or RGB
                            pix.save(str(img_path))
                            success = True
                        else:  # CMYK: convert to RGB first
                            pix1 = fitz.Pixmap(fitz.csRGB, pix)
                            pix1.save(str(img_path))
                            pix1 = None
                            success = True
                    except Exception as e1:
                        print(f"  Method 1 failed for {img_filename}: {e1}")
                    
                    # Method 2: Force RGB conversion if method 1 failed
                    if not success:
                        try:
                            if pix.colorspace:
                                pix_rgb = fitz.Pixmap(fitz.csRGB, pix)
                                pix_rgb.save(str(img_path))
                                pix_rgb = None
                                success = True
                            else:
                                # No colorspace - try to save as grayscale
                                pix.save(str(img_path))
                                success = True
                        except Exception as e2:
                            print(f"  Method 2 failed for {img_filename}: {e2}")
                    
                    # Method 3: Extract raw image data and save with PIL
                    if not success:
                        try:
                            import io
                            from PIL import Image
                            
                            # Get raw image data
                            img_data = pix.tobytes("png")
                            
                            # Save using PIL
                            with open(img_path, 'wb') as f:
                                f.write(img_data)
                            success = True
                        except Exception as e3:
                            print(f"  Method 3 failed for {img_filename}: {e3}")
                    
                    if success:
                        # Record image info
                        extracted_images.append({
                            'filename': img_filename,
                            'page': page_num + 1,
                            'index': img_index + 1,
                            'width': pix.width,
                            'height': pix.height,
                            'size_bytes': len(pix.tobytes()) if pix else 0,
                            'colorspace': pix.colorspace.name if pix and pix.colorspace else 'Unknown'
                        })
                        print(f"    ✅ Extracted: {img_filename}")
                    else:
                        print(f"    ❌ Failed to extract: {img_filename}")
                    
                    pix = None  # Free memory
                    
                except Exception as e:
                    print(f"  Error processing image {img_index+1} on page {page_num+1}: {e}")
        
        doc.close()
        
        return {
            'variety': variety_name,
            'status': 'success',
            'total_images': total_images,
            'extracted_images': extracted_images,
            'output_dir': str(output_dir)
        }
        
    except Exception as e:
        return {
            'variety': variety_name,
            'status': f'error: {str(e)}',
            'total_images': 0,
            'extracted_images': [],
            'output_dir': str(output_dir)
        }

def main():
    # Define paths
    pdf_dir = Path("public/sugarcane_varieties_leaflets/eRcane leaflets")
    output_base_dir = Path("extracted_ercane_images")
    
    # Remove existing directory if it exists
    if output_base_dir.exists():
        import shutil
        shutil.rmtree(output_base_dir)
    
    # Find all PDF files in the eRcane directory
    pdf_files = list(pdf_dir.glob("*.pdf"))
    
    if not pdf_files:
        print("No PDF files found in the eRcane leaflets directory!")
        return
    
    print(f"Found {len(pdf_files)} eRcane PDFs to process:")
    for pdf_file in sorted(pdf_files):
        # Create variety name from filename
        variety_name = pdf_file.stem.replace("ercane.re.nathan.re-", "").upper()
        print(f"  • {variety_name} ({pdf_file.name})")
    
    print("\n" + "="*60)
    print("EXTRACTING IMAGES...")
    print("="*60)
    
    # Process each PDF
    results = []
    for pdf_file in sorted(pdf_files):
        variety_name = pdf_file.stem.replace("ercane.re.nathan.re-", "").upper()
        print(f"\nProcessing {variety_name}...")
        
        # Create output directory for this variety
        variety_output_dir = output_base_dir / variety_name
        
        # Extract images
        result = extract_images_from_pdf(str(pdf_file), variety_output_dir, variety_name)
        results.append(result)
        
        if result['status'] == 'success':
            extracted_count = len(result['extracted_images'])
            print(f"  ✅ Successfully extracted {extracted_count}/{result['total_images']} images to {variety_output_dir}")
        else:
            print(f"  ❌ Failed: {result['status']}")
    
    # Print summary
    print("\n" + "="*60)
    print("EXTRACTION SUMMARY")
    print("="*60)
    
    successful = [r for r in results if r['status'] == 'success']
    failed = [r for r in results if r['status'] != 'success']
    
    total_found = sum(r['total_images'] for r in results)
    total_extracted = sum(len(r['extracted_images']) for r in successful)
    
    print(f"Successfully processed: {len(successful)} varieties")
    print(f"Failed: {len(failed)} varieties")
    print(f"Total images found: {total_found}")
    print(f"Total images extracted: {total_extracted}")
    
    if successful:
        print(f"\n📁 Images saved to: {output_base_dir}")
        print("\nVariety breakdown:")
        for result in successful:
            extracted_count = len(result['extracted_images'])
            print(f"  • {result['variety']}: {extracted_count}/{result['total_images']} images")
    
    if failed:
        print(f"\n❌ Failed varieties:")
        for result in failed:
            print(f"  • {result['variety']}: {result['status']}")
    
    # Save detailed results
    results_file = output_base_dir / "extraction_results.json"
    output_base_dir.mkdir(parents=True, exist_ok=True)
    
    with open(results_file, 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n📄 Detailed results saved to: {results_file}")
    
    return results

if __name__ == "__main__":
    results = main()
