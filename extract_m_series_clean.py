#!/usr/bin/env python3
"""
Clean extraction of M-series sugarcane variety images from PDFs
"""

import fitz  # PyMuPDF
import os
from pathlib import Path
import json

def extract_images_from_pdf(pdf_path, output_dir, variety_name):
    """Extract all images from a PDF and save them to the output directory."""
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
                pix = fitz.Pixmap(doc, xref)
                
                # Create descriptive filename
                img_filename = f"{variety_name}_page{page_num+1:02d}_img{img_index+1:02d}_{pix.width}x{pix.height}.png"
                img_path = output_dir / img_filename
                
                # Extract and save image
                try:
                    if pix.n - pix.alpha < 4:  # GRAY or RGB
                        pix.save(str(img_path))
                    else:  # CMYK: convert to RGB first
                        pix1 = fitz.Pixmap(fitz.csRGB, pix)
                        pix1.save(str(img_path))
                        pix1 = None
                    
                    # Record image info
                    extracted_images.append({
                        'filename': img_filename,
                        'page': page_num + 1,
                        'index': img_index + 1,
                        'width': pix.width,
                        'height': pix.height,
                        'size_bytes': len(pix.tobytes()),
                        'colorspace': pix.colorspace.name if pix.colorspace else 'Unknown'
                    })
                    
                except Exception as e:
                    print(f"Error saving image {img_filename}: {e}")
                
                pix = None  # Free memory
        
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
    pdf_dir = Path("public/sugarcane_varieties_leaflets")
    output_base_dir = Path("extracted_m_series_images")
    
    # Remove existing directory if it exists
    if output_base_dir.exists():
        import shutil
        shutil.rmtree(output_base_dir)
    
    # Find all M-series PDFs (unique list)
    m_series_pdfs = {}  # Use dict to avoid duplicates
    
    # Get all PDF files
    all_pdfs = list(pdf_dir.glob("*.pdf"))
    
    for pdf_file in all_pdfs:
        filename = pdf_file.name
        
        # Check if it's an M-series PDF
        if filename.startswith("M ") or filename.startswith("m"):
            # Normalize variety name
            if filename.startswith("M "):
                variety_name = filename.replace("M ", "M").replace(".pdf", "")
            elif filename.startswith("m"):
                variety_name = filename.replace(".pdf", "").upper()
            
            # Only keep the first occurrence of each variety
            if variety_name not in m_series_pdfs:
                m_series_pdfs[variety_name] = pdf_file
    
    if not m_series_pdfs:
        print("No M-series PDFs found!")
        return
    
    print(f"Found {len(m_series_pdfs)} unique M-series varieties:")
    for variety_name, pdf_file in sorted(m_series_pdfs.items()):
        print(f"  • {variety_name} ({pdf_file.name})")
    
    print("\n" + "="*60)
    print("EXTRACTING IMAGES...")
    print("="*60)
    
    # Process each PDF
    results = []
    for variety_name, pdf_file in sorted(m_series_pdfs.items()):
        print(f"\nProcessing {variety_name}...")
        
        # Create output directory for this variety
        variety_output_dir = output_base_dir / variety_name
        
        # Extract images
        result = extract_images_from_pdf(str(pdf_file), variety_output_dir, variety_name)
        results.append(result)
        
        if result['status'] == 'success':
            print(f"  ✅ Extracted {result['total_images']} images to {variety_output_dir}")
        else:
            print(f"  ❌ Failed: {result['status']}")
    
    # Print summary
    print("\n" + "="*60)
    print("EXTRACTION SUMMARY")
    print("="*60)
    
    successful = [r for r in results if r['status'] == 'success']
    failed = [r for r in results if r['status'] != 'success']
    
    print(f"Successfully processed: {len(successful)} varieties")
    print(f"Failed: {len(failed)} varieties")
    print(f"Total images extracted: {sum(r['total_images'] for r in successful)}")
    
    if successful:
        print(f"\n📁 Images saved to: {output_base_dir}")
        print("\nVariety breakdown:")
        for result in successful:
            print(f"  • {result['variety']}: {result['total_images']} images")
    
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
