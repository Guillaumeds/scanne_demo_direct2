#!/usr/bin/env python3
"""
PDF Image Extractor for Sugarcane Variety Leaflets

This script analyzes PDF files to extract and count images, with options to:
- Count total images per PDF
- Distinguish between raster and vector images
- Extract images to files for inspection
- Generate a summary table

Requirements: pip install PyMuPDF pandas tabulate
"""

import fitz  # PyMuPDF
import os
import pandas as pd
from tabulate import tabulate
import argparse
from pathlib import Path
import json

def analyze_pdf_images(pdf_path, extract_images=False, output_dir=None):
    """
    Analyze a PDF file to count and optionally extract images.
    
    Args:
        pdf_path (str): Path to the PDF file
        extract_images (bool): Whether to extract images to files
        output_dir (str): Directory to save extracted images
    
    Returns:
        dict: Analysis results including image counts and details
    """
    try:
        doc = fitz.open(pdf_path)
        pdf_name = Path(pdf_path).stem
        
        total_images = 0
        raster_images = 0
        vector_images = 0
        image_details = []
        
        # Create output directory for this PDF if extracting
        if extract_images and output_dir:
            pdf_output_dir = Path(output_dir) / pdf_name
            pdf_output_dir.mkdir(parents=True, exist_ok=True)
        
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
                
                # Get image properties
                img_info = {
                    'page': page_num + 1,
                    'index': img_index,
                    'xref': xref,
                    'width': pix.width,
                    'height': pix.height,
                    'colorspace': pix.colorspace.name if pix.colorspace else 'Unknown',
                    'bpp': pix.n,  # bits per pixel
                    'size_bytes': len(pix.tobytes())
                }
                
                # Determine if it's likely raster or vector based on properties
                # This is a heuristic - true vector detection is complex
                if pix.colorspace and pix.colorspace.name in ['DeviceRGB', 'DeviceCMYK', 'DeviceGray']:
                    if img_info['size_bytes'] > 1000:  # Arbitrary threshold
                        raster_images += 1
                        img_info['type'] = 'raster'
                    else:
                        vector_images += 1
                        img_info['type'] = 'vector'
                else:
                    # Unknown type, assume raster for safety
                    raster_images += 1
                    img_info['type'] = 'raster'
                
                image_details.append(img_info)
                
                # Extract image if requested
                if extract_images and output_dir:
                    try:
                        if pix.n - pix.alpha < 4:  # GRAY or RGB
                            img_filename = f"page_{page_num+1}_img_{img_index}_{img_info['type']}.png"
                            img_path = pdf_output_dir / img_filename
                            pix.save(str(img_path))
                        else:  # CMYK: convert to RGB first
                            pix1 = fitz.Pixmap(fitz.csRGB, pix)
                            img_filename = f"page_{page_num+1}_img_{img_index}_{img_info['type']}.png"
                            img_path = pdf_output_dir / img_filename
                            pix1.save(str(img_path))
                            pix1 = None
                    except Exception as e:
                        print(f"Error extracting image from {pdf_name}: {e}")
                
                pix = None  # Free memory
        
        doc.close()
        
        return {
            'pdf_name': pdf_name,
            'total_images': total_images,
            'raster_images': raster_images,
            'vector_images': vector_images,
            'image_details': image_details,
            'status': 'success'
        }
        
    except Exception as e:
        return {
            'pdf_name': Path(pdf_path).stem,
            'total_images': 0,
            'raster_images': 0,
            'vector_images': 0,
            'image_details': [],
            'status': f'error: {str(e)}'
        }

def analyze_pdf_directory(directory_path, extract_images=False, output_dir=None):
    """
    Analyze all PDF files in a directory.
    
    Args:
        directory_path (str): Path to directory containing PDFs
        extract_images (bool): Whether to extract images
        output_dir (str): Directory to save extracted images
    
    Returns:
        list: List of analysis results for each PDF
    """
    pdf_files = list(Path(directory_path).glob("*.pdf"))
    results = []
    
    print(f"Found {len(pdf_files)} PDF files to analyze...")
    
    for pdf_file in pdf_files:
        print(f"Analyzing: {pdf_file.name}")
        result = analyze_pdf_images(str(pdf_file), extract_images, output_dir)
        results.append(result)
    
    return results

def create_summary_table(results):
    """Create a summary table of the analysis results."""
    table_data = []
    
    for result in results:
        table_data.append([
            result['pdf_name'],
            result['total_images'],
            result['raster_images'],
            result['vector_images'],
            result['status']
        ])
    
    headers = ['PDF Name', 'Total Images', 'Raster Images', 'Vector Images', 'Status']
    return tabulate(table_data, headers=headers, tablefmt='grid')

def main():
    parser = argparse.ArgumentParser(description='Analyze PDF files for image content')
    parser.add_argument('directory', help='Directory containing PDF files')
    parser.add_argument('--extract', action='store_true', help='Extract images to files')
    parser.add_argument('--output-dir', help='Directory to save extracted images (default: ./extracted_images)')
    parser.add_argument('--save-json', help='Save detailed results to JSON file')
    
    args = parser.parse_args()
    
    # Set default output directory
    if args.extract and not args.output_dir:
        args.output_dir = './extracted_images'
    
    # Analyze PDFs
    results = analyze_pdf_directory(args.directory, args.extract, args.output_dir)
    
    # Print summary table
    print("\n" + "="*80)
    print("PDF IMAGE ANALYSIS SUMMARY")
    print("="*80)
    print(create_summary_table(results))
    
    # Calculate totals
    total_pdfs = len(results)
    total_images = sum(r['total_images'] for r in results)
    total_raster = sum(r['raster_images'] for r in results)
    total_vector = sum(r['vector_images'] for r in results)
    
    print(f"\nOVERALL TOTALS:")
    print(f"PDFs analyzed: {total_pdfs}")
    print(f"Total images found: {total_images}")
    print(f"Raster images: {total_raster}")
    print(f"Vector images: {total_vector}")
    
    # Save detailed results if requested
    if args.save_json:
        with open(args.save_json, 'w') as f:
            json.dump(results, f, indent=2)
        print(f"\nDetailed results saved to: {args.save_json}")
    
    if args.extract:
        print(f"\nExtracted images saved to: {args.output_dir}")

if __name__ == "__main__":
    main()
