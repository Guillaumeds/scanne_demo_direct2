#!/usr/bin/env python3
"""
Advanced extraction for eRcane PDFs with colorspace issues

This script uses multiple approaches to extract images from problematic PDFs:
1. Direct image extraction with format conversion
2. Page rendering to images
3. Alternative image formats (JPEG, TIFF)
"""

import fitz  # PyMuPDF
import os
from pathlib import Path
import json

def extract_images_advanced(pdf_path, output_dir, variety_name):
    """
    Advanced image extraction with multiple fallback methods.
    """
    try:
        doc = fitz.open(pdf_path)
        
        # Create output directory
        output_dir.mkdir(parents=True, exist_ok=True)
        
        extracted_images = []
        total_images = 0
        
        # Method 1: Try to extract individual images with different formats
        print(f"  Method 1: Extracting individual images...")
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            image_list = page.get_images(full=True)
            
            for img_index, img in enumerate(image_list):
                total_images += 1
                xref = img[0]
                
                try:
                    # Get the image
                    base_image = doc.extract_image(xref)
                    image_bytes = base_image["image"]
                    image_ext = base_image["ext"]
                    
                    # Create filename
                    img_filename = f"{variety_name}_page{page_num+1:02d}_img{img_index+1:02d}_method1.{image_ext}"
                    img_path = output_dir / img_filename
                    
                    # Save the raw image
                    with open(img_path, "wb") as f:
                        f.write(image_bytes)
                    
                    extracted_images.append({
                        'filename': img_filename,
                        'page': page_num + 1,
                        'index': img_index + 1,
                        'method': 'direct_extraction',
                        'format': image_ext,
                        'size_bytes': len(image_bytes)
                    })
                    print(f"    ✅ Extracted: {img_filename}")
                    
                except Exception as e:
                    print(f"    ❌ Method 1 failed for image {img_index+1} on page {page_num+1}: {e}")
        
        # Method 2: Render entire pages as images (fallback)
        print(f"  Method 2: Rendering pages as images...")
        for page_num in range(len(doc)):
            try:
                page = doc.load_page(page_num)
                
                # Render page at high resolution
                mat = fitz.Matrix(2.0, 2.0)  # 2x zoom for better quality
                pix = page.get_pixmap(matrix=mat)
                
                # Create filename
                page_filename = f"{variety_name}_page{page_num+1:02d}_fullpage_method2.png"
                page_path = output_dir / page_filename
                
                # Save page image
                pix.save(str(page_path))
                
                extracted_images.append({
                    'filename': page_filename,
                    'page': page_num + 1,
                    'index': 'full_page',
                    'method': 'page_render',
                    'format': 'png',
                    'width': pix.width,
                    'height': pix.height,
                    'size_bytes': len(pix.tobytes())
                })
                print(f"    ✅ Rendered page: {page_filename}")
                
                pix = None
                
            except Exception as e:
                print(f"    ❌ Method 2 failed for page {page_num+1}: {e}")
        
        # Method 3: Try alternative extraction with different pixmap handling
        print(f"  Method 3: Alternative pixmap extraction...")
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            image_list = page.get_images(full=True)
            
            for img_index, img in enumerate(image_list):
                try:
                    xref = img[0]
                    
                    # Try to get pixmap with different approaches
                    try:
                        pix = fitz.Pixmap(doc, xref)
                        
                        # Try saving as JPEG first (more forgiving)
                        img_filename = f"{variety_name}_page{page_num+1:02d}_img{img_index+1:02d}_method3.jpg"
                        img_path = output_dir / img_filename
                        
                        # Convert to RGB if needed and save as JPEG
                        if pix.n - pix.alpha >= 4:  # CMYK
                            pix_rgb = fitz.Pixmap(fitz.csRGB, pix)
                            pix_rgb.save(str(img_path))
                            pix_rgb = None
                        else:
                            pix.save(str(img_path))
                        
                        extracted_images.append({
                            'filename': img_filename,
                            'page': page_num + 1,
                            'index': img_index + 1,
                            'method': 'pixmap_jpeg',
                            'format': 'jpg',
                            'width': pix.width,
                            'height': pix.height,
                            'size_bytes': len(pix.tobytes()) if pix else 0
                        })
                        print(f"    ✅ Extracted: {img_filename}")
                        
                        pix = None
                        
                    except Exception as e:
                        print(f"    ❌ Method 3 failed for image {img_index+1} on page {page_num+1}: {e}")
                        
                except Exception as e:
                    print(f"    ❌ Method 3 error for image {img_index+1} on page {page_num+1}: {e}")
        
        doc.close()
        
        return {
            'variety': variety_name,
            'status': 'success',
            'total_images_found': total_images,
            'total_extracted': len(extracted_images),
            'extracted_images': extracted_images,
            'output_dir': str(output_dir)
        }
        
    except Exception as e:
        return {
            'variety': variety_name,
            'status': f'error: {str(e)}',
            'total_images_found': 0,
            'total_extracted': 0,
            'extracted_images': [],
            'output_dir': str(output_dir)
        }

def main():
    # Define paths
    pdf_dir = Path("public/sugarcane_varieties_leaflets/eRcane leaflets")
    output_base_dir = Path("extracted_ercane_images_advanced")
    
    # Remove existing directory if it exists
    if output_base_dir.exists():
        import shutil
        shutil.rmtree(output_base_dir)
    
    # Find all PDF files
    pdf_files = list(pdf_dir.glob("*.pdf"))
    
    if not pdf_files:
        print("No PDF files found!")
        return
    
    print(f"Found {len(pdf_files)} eRcane PDFs to process with advanced methods:")
    for pdf_file in sorted(pdf_files):
        variety_name = pdf_file.stem.replace("ercane.re.nathan.re-", "").upper()
        print(f"  • {variety_name} ({pdf_file.name})")
    
    print("\n" + "="*60)
    print("EXTRACTING IMAGES WITH ADVANCED METHODS...")
    print("="*60)
    
    # Process each PDF
    results = []
    for pdf_file in sorted(pdf_files):
        variety_name = pdf_file.stem.replace("ercane.re.nathan.re-", "").upper()
        print(f"\nProcessing {variety_name}...")
        
        # Create output directory for this variety
        variety_output_dir = output_base_dir / variety_name
        
        # Extract images
        result = extract_images_advanced(str(pdf_file), variety_output_dir, variety_name)
        results.append(result)
        
        if result['status'] == 'success':
            print(f"  ✅ Extracted {result['total_extracted']} items from {result['total_images_found']} images found")
        else:
            print(f"  ❌ Failed: {result['status']}")
    
    # Print summary
    print("\n" + "="*60)
    print("ADVANCED EXTRACTION SUMMARY")
    print("="*60)
    
    successful = [r for r in results if r['status'] == 'success']
    total_found = sum(r['total_images_found'] for r in results)
    total_extracted = sum(r['total_extracted'] for r in successful)
    
    print(f"Successfully processed: {len(successful)} varieties")
    print(f"Total images found: {total_found}")
    print(f"Total items extracted: {total_extracted}")
    
    if successful:
        print(f"\n📁 Images saved to: {output_base_dir}")
        print("\nVariety breakdown:")
        for result in successful:
            print(f"  • {result['variety']}: {result['total_extracted']} items extracted")
    
    # Save detailed results
    results_file = output_base_dir / "extraction_results.json"
    output_base_dir.mkdir(parents=True, exist_ok=True)
    
    with open(results_file, 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n📄 Detailed results saved to: {results_file}")
    
    return results

if __name__ == "__main__":
    results = main()
