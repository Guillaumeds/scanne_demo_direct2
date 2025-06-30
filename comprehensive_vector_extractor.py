#!/usr/bin/env python3
"""
Comprehensive Vector Extractor for PDF Files
Tries multiple methods and libraries to extract vector graphics as SVG.
"""

import os
import sys
import fitz  # PyMuPDF
import pdfplumber
from PIL import Image
import io
import base64

def method1_pymupdf_images(pdf_path, output_prefix):
    """Method 1: Extract embedded images using PyMuPDF."""
    print("Method 1: PyMuPDF embedded image extraction...")
    extracted = []
    
    try:
        doc = fitz.open(pdf_path)
        page = doc[0]
        
        # Get embedded images
        image_list = page.get_images(full=True)
        print(f"  Found {len(image_list)} embedded images")
        
        for img_index, img in enumerate(image_list):
            try:
                xref = img[0]
                base_image = doc.extract_image(xref)
                image_bytes = base_image["image"]
                image_ext = base_image["ext"]
                
                # Save original
                filename = f"{output_prefix}_method1_img{img_index}.{image_ext}"
                with open(filename, "wb") as f:
                    f.write(image_bytes)
                
                extracted.append(filename)
                print(f"    ✓ Extracted: {filename} ({len(image_bytes)} bytes)")
                
                # If it's SVG, we're done!
                if image_ext.lower() == 'svg':
                    print(f"    🎯 Found native SVG!")
                
            except Exception as e:
                print(f"    ✗ Error with image {img_index}: {e}")
        
        doc.close()
        
    except Exception as e:
        print(f"  ✗ Method 1 failed: {e}")
    
    return extracted

def method2_pymupdf_drawings(pdf_path, output_prefix):
    """Method 2: Extract vector drawings using PyMuPDF."""
    print("Method 2: PyMuPDF vector drawings extraction...")
    extracted = []
    
    try:
        doc = fitz.open(pdf_path)
        page = doc[0]
        
        # Get vector drawings
        drawings = page.get_drawings()
        print(f"  Found {len(drawings)} vector drawings")
        
        for draw_index, drawing in enumerate(drawings):
            try:
                filename = f"{output_prefix}_method2_drawing{draw_index}.svg"
                
                # Create simple SVG from drawing
                svg_content = create_simple_svg_from_drawing(drawing, page.rect)
                
                if svg_content:
                    with open(filename, 'w', encoding='utf-8') as f:
                        f.write(svg_content)
                    
                    extracted.append(filename)
                    print(f"    ✓ Created: {filename}")
                
            except Exception as e:
                print(f"    ✗ Error with drawing {draw_index}: {e}")
        
        doc.close()
        
    except Exception as e:
        print(f"  ✗ Method 2 failed: {e}")
    
    return extracted

def method3_full_page_svg(pdf_path, output_prefix):
    """Method 3: Extract full page as SVG using PyMuPDF."""
    print("Method 3: Full page SVG extraction...")
    extracted = []
    
    try:
        doc = fitz.open(pdf_path)
        page = doc[0]
        
        # Get full page as SVG
        svg_text = page.get_svg_image(matrix=fitz.Identity)
        
        if svg_text:
            filename = f"{output_prefix}_method3_fullpage.svg"
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(svg_text)
            
            extracted.append(filename)
            print(f"    ✓ Created: {filename} ({len(svg_text)} chars)")
        
        doc.close()
        
    except Exception as e:
        print(f"  ✗ Method 3 failed: {e}")
    
    return extracted

def method4_pdfplumber_objects(pdf_path, output_prefix):
    """Method 4: Extract objects using pdfplumber."""
    print("Method 4: pdfplumber object extraction...")
    extracted = []
    
    try:
        with pdfplumber.open(pdf_path) as pdf:
            page = pdf.pages[0]
            
            # Extract different object types
            objects = {
                'images': page.images,
                'lines': page.lines,
                'rects': page.rects,
                'curves': page.curves,
                'chars': page.chars[:50]  # Limit chars for performance
            }
            
            for obj_type, obj_list in objects.items():
                if obj_list:
                    print(f"    Found {len(obj_list)} {obj_type}")
                    
                    filename = f"{output_prefix}_method4_{obj_type}.svg"
                    svg_content = create_svg_from_pdfplumber_objects(obj_list, obj_type, page.width, page.height)
                    
                    if svg_content:
                        with open(filename, 'w', encoding='utf-8') as f:
                            f.write(svg_content)
                        
                        extracted.append(filename)
                        print(f"    ✓ Created: {filename}")
        
    except Exception as e:
        print(f"  ✗ Method 4 failed: {e}")
    
    return extracted

def create_simple_svg_from_drawing(drawing, page_rect):
    """Create a simple SVG from PyMuPDF drawing data."""
    try:
        width = page_rect.width
        height = page_rect.height
        
        svg_lines = [
            f'<?xml version="1.0" encoding="UTF-8"?>',
            f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">'
        ]
        
        # Extract basic properties
        items = drawing.get('items', [])
        if not items:
            return None
        
        # Build a simple path
        path_commands = []
        for item in items:
            if len(item) >= 2:
                cmd = item[0]
                if cmd == 'm' and hasattr(item[1], 'x'):  # Move to
                    path_commands.append(f"M {item[1].x:.2f} {item[1].y:.2f}")
                elif cmd == 'l' and hasattr(item[1], 'x'):  # Line to
                    path_commands.append(f"L {item[1].x:.2f} {item[1].y:.2f}")
        
        if path_commands:
            path_d = " ".join(path_commands)
            svg_lines.append(f'  <path d="{path_d}" stroke="black" fill="none" stroke-width="1"/>')
        
        svg_lines.append('</svg>')
        
        return "\n".join(svg_lines)
        
    except Exception as e:
        print(f"    Error creating SVG from drawing: {e}")
        return None

def create_svg_from_pdfplumber_objects(objects, obj_type, width, height):
    """Create SVG from pdfplumber objects."""
    try:
        svg_lines = [
            f'<?xml version="1.0" encoding="UTF-8"?>',
            f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">'
        ]
        
        if obj_type == 'lines':
            for line in objects:
                x1, y1 = line.get('x0', 0), line.get('y0', 0)
                x2, y2 = line.get('x1', 0), line.get('y1', 0)
                svg_lines.append(f'  <line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="black" stroke-width="1"/>')
        
        elif obj_type == 'rects':
            for rect in objects:
                x, y = rect.get('x0', 0), rect.get('y0', 0)
                w = rect.get('x1', 0) - x
                h = rect.get('y1', 0) - y
                svg_lines.append(f'  <rect x="{x}" y="{y}" width="{w}" height="{h}" stroke="black" fill="none" stroke-width="1"/>')
        
        elif obj_type == 'chars':
            for char in objects:
                x, y = char.get('x0', 0), char.get('y0', 0)
                text = char.get('text', '').replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
                size = char.get('size', 12)
                if text.strip():
                    svg_lines.append(f'  <text x="{x}" y="{y}" font-size="{size}" font-family="Arial">{text}</text>')
        
        svg_lines.append('</svg>')
        
        return "\n".join(svg_lines)
        
    except Exception as e:
        print(f"    Error creating SVG from {obj_type}: {e}")
        return None

def analyze_pdf_structure(pdf_path):
    """Analyze PDF structure to understand what vector content is available."""
    print(f"Analyzing PDF structure: {pdf_path}")
    
    try:
        # PyMuPDF analysis
        doc = fitz.open(pdf_path)
        page = doc[0]
        
        print(f"  Page size: {page.rect.width:.1f} x {page.rect.height:.1f} points")
        print(f"  Images: {len(page.get_images())}")
        print(f"  Drawings: {len(page.get_drawings())}")
        print(f"  Text blocks: {len(page.get_text('dict')['blocks'])}")
        
        doc.close()
        
        # pdfplumber analysis
        with pdfplumber.open(pdf_path) as pdf:
            page = pdf.pages[0]
            print(f"  pdfplumber - Images: {len(page.images)}")
            print(f"  pdfplumber - Lines: {len(page.lines)}")
            print(f"  pdfplumber - Rectangles: {len(page.rects)}")
            print(f"  pdfplumber - Curves: {len(page.curves)}")
        
    except Exception as e:
        print(f"  Analysis failed: {e}")

def main():
    """Main function to try all extraction methods."""
    
    # PDF files
    pdfs = [
        {
            'filename': 'ultra_high_res_pamphlets/M1392-00.pdf',
            'prefix': 'M1392-00'
        },
        {
            'filename': 'ultra_high_res_pamphlets/M2283-98.pdf', 
            'prefix': 'M2283-98'
        }
    ]
    
    # Create output directory
    output_dir = 'comprehensive_vector_extraction'
    os.makedirs(output_dir, exist_ok=True)
    os.chdir(output_dir)
    
    print("=" * 80)
    print("Comprehensive Vector Graphics Extraction from MSIRI PDFs")
    print("Trying multiple methods and libraries")
    print("=" * 80)
    
    all_extracted = []
    
    for pdf_info in pdfs:
        print(f"\n🔍 Processing {pdf_info['prefix']}...")
        print("=" * 60)
        
        pdf_path = f"../{pdf_info['filename']}"
        if not os.path.exists(pdf_path):
            print(f"✗ PDF not found: {pdf_path}")
            continue
        
        # Analyze PDF first
        analyze_pdf_structure(pdf_path)
        print()
        
        # Try all methods
        methods = [
            method1_pymupdf_images,
            method2_pymupdf_drawings,
            method3_full_page_svg,
            method4_pdfplumber_objects
        ]
        
        for method in methods:
            try:
                extracted = method(pdf_path, pdf_info['prefix'])
                all_extracted.extend(extracted)
                print()
            except Exception as e:
                print(f"  ✗ {method.__name__} failed: {e}\n")
    
    # Summary
    print("=" * 80)
    print("📊 EXTRACTION SUMMARY")
    print("=" * 80)
    
    print(f"Total files extracted: {len(all_extracted)}")
    print("\nExtracted files:")
    
    for file in sorted(os.listdir('.')):
        if os.path.isfile(file):
            size = os.path.getsize(file)
            if file.endswith('.svg'):
                print(f"🎨 {file} ({size:,} bytes)")
            else:
                print(f"🖼️ {file} ({size:,} bytes)")
    
    print(f"\n📁 Output directory: {os.getcwd()}")
    print("🎯 Check SVG files for vector graphics that can be scaled infinitely!")

if __name__ == "__main__":
    main()
