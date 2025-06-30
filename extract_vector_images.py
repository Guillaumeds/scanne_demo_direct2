#!/usr/bin/env python3
"""
Extract Individual Vector Images from PDF as SVG
This script specifically extracts vector graphics/images as separate SVG files,
not the entire page content.
"""

import os
import fitz  # PyMuPDF
import cairosvg
from PIL import Image
import io
import base64

def extract_vector_images_as_svg(pdf_path, output_prefix):
    """
    Extract individual vector images from PDF and save as separate SVG files.
    
    Args:
        pdf_path: Path to the PDF file
        output_prefix: Prefix for output SVG files
    """
    print(f"Extracting individual vector images from {pdf_path}...")
    
    try:
        # Open PDF document
        doc = fitz.open(pdf_path)
        
        if len(doc) == 0:
            print(f"✗ PDF {pdf_path} has no pages")
            return []
        
        # Get first page
        page = doc[0]
        
        # Method 1: Extract embedded images (including vector images)
        image_list = page.get_images(full=True)
        extracted_files = []
        
        print(f"  Found {len(image_list)} embedded images")
        
        for img_index, img in enumerate(image_list):
            try:
                # Get image data
                xref = img[0]
                base_image = doc.extract_image(xref)
                image_bytes = base_image["image"]
                image_ext = base_image["ext"]
                
                print(f"    Image {img_index}: {image_ext} format, {len(image_bytes)} bytes")
                
                # Save original image
                original_filename = f"{output_prefix}_image_{img_index}.{image_ext}"
                with open(original_filename, "wb") as f:
                    f.write(image_bytes)
                
                # Try to convert to SVG if it's a vector format
                if image_ext.lower() in ['svg', 'eps', 'pdf']:
                    svg_filename = f"{output_prefix}_vector_image_{img_index}.svg"
                    try:
                        # If it's already SVG, just copy
                        if image_ext.lower() == 'svg':
                            with open(svg_filename, "wb") as f:
                                f.write(image_bytes)
                            extracted_files.append(svg_filename)
                            print(f"    ✓ Saved vector SVG: {svg_filename}")
                        else:
                            print(f"    ⚠ {image_ext} format - manual conversion needed")
                    except Exception as e:
                        print(f"    ✗ Could not convert {image_ext} to SVG: {e}")
                
                # For raster images, create SVG wrapper
                elif image_ext.lower() in ['png', 'jpg', 'jpeg']:
                    svg_wrapper_filename = f"{output_prefix}_wrapped_image_{img_index}.svg"
                    create_svg_wrapper_for_image(image_bytes, image_ext, svg_wrapper_filename)
                    extracted_files.append(svg_wrapper_filename)
                    print(f"    ✓ Created SVG wrapper: {svg_wrapper_filename}")
                
            except Exception as e:
                print(f"    ✗ Error extracting image {img_index}: {e}")
        
        # Method 2: Extract vector paths/drawings as separate SVG elements
        drawings = page.get_drawings()
        print(f"  Found {len(drawings)} vector drawings")
        
        for draw_index, drawing in enumerate(drawings):
            try:
                svg_filename = f"{output_prefix}_drawing_{draw_index}.svg"
                if create_svg_from_drawing(drawing, svg_filename, page.rect):
                    extracted_files.append(svg_filename)
                    print(f"    ✓ Saved vector drawing: {svg_filename}")
            except Exception as e:
                print(f"    ✗ Error extracting drawing {draw_index}: {e}")
        
        # Method 3: Extract text blocks as SVG (for text-based graphics)
        text_blocks = page.get_text("dict")
        if extract_text_graphics_as_svg(text_blocks, f"{output_prefix}_text_graphics.svg", page.rect):
            extracted_files.append(f"{output_prefix}_text_graphics.svg")
            print(f"    ✓ Saved text graphics SVG")
        
        doc.close()
        return extracted_files
        
    except Exception as e:
        print(f"✗ Error processing {pdf_path}: {e}")
        return []

def create_svg_wrapper_for_image(image_bytes, image_ext, output_filename):
    """Create an SVG wrapper for a raster image."""
    try:
        # Get image dimensions
        img = Image.open(io.BytesIO(image_bytes))
        width, height = img.size
        
        # Encode image as base64
        img_b64 = base64.b64encode(image_bytes).decode()
        
        # Create SVG wrapper
        svg_content = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" 
     xmlns:xlink="http://www.w3.org/1999/xlink"
     width="{width}" height="{height}" 
     viewBox="0 0 {width} {height}">
  <image x="0" y="0" width="{width}" height="{height}" 
         xlink:href="data:image/{image_ext};base64,{img_b64}"/>
</svg>'''
        
        with open(output_filename, 'w', encoding='utf-8') as f:
            f.write(svg_content)
        
        return True
    except Exception as e:
        print(f"    Error creating SVG wrapper: {e}")
        return False

def create_svg_from_drawing(drawing, output_filename, page_rect):
    """Create SVG from a vector drawing."""
    try:
        width = page_rect.width
        height = page_rect.height
        
        # Start SVG
        svg_content = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" 
     width="{width}" height="{height}" 
     viewBox="0 0 {width} {height}">
'''
        
        # Extract drawing properties
        items = drawing.get('items', [])
        if not items:
            return False
        
        # Build path data
        path_data = []
        for item in items:
            if item[0] == 'l':  # Line to
                path_data.append(f"L {item[1].x} {item[1].y}")
            elif item[0] == 'm':  # Move to
                path_data.append(f"M {item[1].x} {item[1].y}")
            elif item[0] == 'c':  # Curve to
                path_data.append(f"C {item[1].x} {item[1].y} {item[2].x} {item[2].y} {item[3].x} {item[3].y}")
            elif item[0] == 're':  # Rectangle
                rect = item[1]
                path_data.append(f"M {rect.x0} {rect.y0} L {rect.x1} {rect.y0} L {rect.x1} {rect.y1} L {rect.x0} {rect.y1} Z")
        
        if not path_data:
            return False
        
        # Get drawing style
        stroke_color = drawing.get('stroke', None)
        fill_color = drawing.get('fill', None)
        line_width = drawing.get('width', 1)
        
        # Build style attributes
        style_attrs = []
        if stroke_color:
            r, g, b = [int(c * 255) for c in stroke_color[:3]]
            style_attrs.append(f'stroke="rgb({r},{g},{b})"')
        else:
            style_attrs.append('stroke="none"')
        
        if fill_color:
            r, g, b = [int(c * 255) for c in fill_color[:3]]
            style_attrs.append(f'fill="rgb({r},{g},{b})"')
        else:
            style_attrs.append('fill="none"')
        
        style_attrs.append(f'stroke-width="{line_width}"')
        
        # Create path element
        svg_content += f'  <path d="{" ".join(path_data)}" {" ".join(style_attrs)}/>\n'
        svg_content += '</svg>'
        
        with open(output_filename, 'w', encoding='utf-8') as f:
            f.write(svg_content)
        
        return True
        
    except Exception as e:
        print(f"    Error creating drawing SVG: {e}")
        return False

def extract_text_graphics_as_svg(text_dict, output_filename, page_rect):
    """Extract text elements that might be part of graphics/diagrams."""
    try:
        if not text_dict or 'blocks' not in text_dict:
            return False
        
        width = page_rect.width
        height = page_rect.height
        
        svg_content = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" 
     width="{width}" height="{height}" 
     viewBox="0 0 {width} {height}">
'''
        
        text_elements = []
        
        for block in text_dict['blocks']:
            if 'lines' in block:
                for line in block['lines']:
                    if 'spans' in line:
                        for span in line['spans']:
                            text = span.get('text', '').strip()
                            if text and len(text) < 50:  # Likely labels/captions
                                bbox = span.get('bbox', [0, 0, 0, 0])
                                x, y = bbox[0], bbox[1]
                                font_size = span.get('size', 12)
                                
                                # Clean text for SVG
                                text = text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
                                
                                text_elements.append(f'  <text x="{x}" y="{y}" font-size="{font_size}" font-family="Arial">{text}</text>')
        
        if not text_elements:
            return False
        
        svg_content += '\n'.join(text_elements)
        svg_content += '\n</svg>'
        
        with open(output_filename, 'w', encoding='utf-8') as f:
            f.write(svg_content)
        
        return True
        
    except Exception as e:
        print(f"    Error extracting text graphics: {e}")
        return False

def main():
    """Main function to extract vector images from MSIRI pamphlets."""
    
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
    output_dir = 'vector_images_extracted'
    os.makedirs(output_dir, exist_ok=True)
    os.chdir(output_dir)
    
    print("=" * 70)
    print("MSIRI Pamphlet Individual Vector Image Extractor")
    print("Extracting separate vector graphics as individual SVG files")
    print("=" * 70)
    
    all_extracted = []
    
    # Process each PDF
    for pdf_info in pdfs:
        print(f"\nProcessing {pdf_info['prefix']}...")
        print("-" * 50)
        
        pdf_path = f"../{pdf_info['filename']}"
        if os.path.exists(pdf_path):
            extracted = extract_vector_images_as_svg(pdf_path, pdf_info['prefix'])
            all_extracted.extend(extracted)
        else:
            print(f"✗ PDF not found: {pdf_path}")
        
        print("-" * 50)
    
    print(f"\n✓ Vector image extraction complete!")
    print(f"Output directory: {os.getcwd()}")
    print("\nExtracted vector images:")
    print("=" * 50)
    
    for file in sorted(os.listdir('.')):
        if file.endswith('.svg'):
            size_kb = os.path.getsize(file) / 1024
            print(f"🎨 {file} ({size_kb:.1f} KB)")
        elif file.endswith(('.png', '.jpg', '.jpeg')):
            size_kb = os.path.getsize(file) / 1024
            print(f"🖼️ {file} ({size_kb:.1f} KB)")
    
    print(f"\n📊 Total files extracted: {len(os.listdir('.'))}")
    print("🎯 Each vector image can be scaled infinitely!")

if __name__ == "__main__":
    main()
