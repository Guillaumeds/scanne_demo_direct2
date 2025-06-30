#!/usr/bin/env python3
"""
Extract SVG Vector Graphics from MSIRI PDF Pamphlets
This script extracts the actual vector content from PDFs as SVG files,
preserving infinite scalability and crisp quality.
"""

import os
import fitz  # PyMuPDF
import xml.etree.ElementTree as ET
from xml.dom import minidom

def extract_svg_from_pdf(pdf_path, output_prefix):
    """
    Extract SVG vector graphics from PDF first page.
    
    Args:
        pdf_path: Path to the PDF file
        output_prefix: Prefix for output SVG files
    """
    print(f"Extracting SVG vector graphics from {pdf_path}...")
    
    try:
        # Open PDF document
        doc = fitz.open(pdf_path)
        
        if len(doc) == 0:
            print(f"✗ PDF {pdf_path} has no pages")
            return None
        
        # Get first page
        page = doc[0]
        
        # Get page dimensions
        rect = page.rect
        width = rect.width
        height = rect.height
        
        print(f"  Page dimensions: {width:.1f} x {height:.1f} points")
        
        # Method 1: Extract as SVG directly
        try:
            svg_text = page.get_svg_image(matrix=fitz.Identity)
            if svg_text:
                output_filename = f"{output_prefix}_vector.svg"
                with open(output_filename, 'w', encoding='utf-8') as f:
                    f.write(svg_text)
                
                file_size = os.path.getsize(output_filename)
                print(f"✓ Saved vector SVG: {output_filename} ({file_size} bytes)")
                
                # Also create a high-DPI version for comparison
                create_high_dpi_svg(svg_text, output_prefix, width, height)
                
                doc.close()
                return output_filename
        except Exception as e:
            print(f"  SVG extraction method failed: {e}")
        
        # Method 2: Extract vector paths and text
        try:
            vector_content = extract_vector_paths(page)
            if vector_content:
                output_filename = f"{output_prefix}_paths.svg"
                create_svg_from_paths(vector_content, output_filename, width, height)
                
                file_size = os.path.getsize(output_filename)
                print(f"✓ Saved path-based SVG: {output_filename} ({file_size} bytes)")
                
                doc.close()
                return output_filename
        except Exception as e:
            print(f"  Path extraction method failed: {e}")
        
        # Method 3: Extract text and images separately
        try:
            text_content = extract_text_with_positions(page)
            images = extract_images(page)
            
            if text_content or images:
                output_filename = f"{output_prefix}_reconstructed.svg"
                create_reconstructed_svg(text_content, images, output_filename, width, height)
                
                file_size = os.path.getsize(output_filename)
                print(f"✓ Saved reconstructed SVG: {output_filename} ({file_size} bytes)")
                
                doc.close()
                return output_filename
        except Exception as e:
            print(f"  Reconstruction method failed: {e}")
        
        doc.close()
        print(f"✗ Could not extract vector content from {pdf_path}")
        return None
        
    except Exception as e:
        print(f"✗ Error processing {pdf_path}: {e}")
        return None

def create_high_dpi_svg(svg_content, output_prefix, original_width, original_height):
    """Create a high-DPI version of the SVG."""
    try:
        # Parse the SVG
        root = ET.fromstring(svg_content)
        
        # Scale up the viewBox for higher DPI
        scale_factor = 4.0
        new_width = original_width * scale_factor
        new_height = original_height * scale_factor
        
        # Update dimensions
        root.set('width', f"{new_width}")
        root.set('height', f"{new_height}")
        root.set('viewBox', f"0 0 {original_width} {original_height}")
        
        # Save high-DPI version
        output_filename = f"{output_prefix}_vector_4x.svg"
        tree = ET.ElementTree(root)
        tree.write(output_filename, encoding='utf-8', xml_declaration=True)
        
        print(f"✓ Saved high-DPI SVG: {output_filename}")
        
    except Exception as e:
        print(f"  Could not create high-DPI version: {e}")

def extract_vector_paths(page):
    """Extract vector paths from the page."""
    try:
        # Get the page's drawing commands
        paths = page.get_drawings()
        return paths
    except:
        return None

def extract_text_with_positions(page):
    """Extract text with precise positioning information."""
    try:
        # Get text with detailed positioning
        text_dict = page.get_text("dict")
        return text_dict
    except:
        return None

def extract_images(page):
    """Extract embedded images from the page."""
    try:
        image_list = page.get_images()
        images = []
        
        for img_index, img in enumerate(image_list):
            xref = img[0]
            pix = fitz.Pixmap(page.parent, xref)
            
            if pix.n - pix.alpha < 4:  # GRAY or RGB
                img_data = pix.tobytes("png")
                images.append({
                    'index': img_index,
                    'data': img_data,
                    'width': pix.width,
                    'height': pix.height
                })
            pix = None
        
        return images
    except:
        return []

def create_svg_from_paths(paths, output_filename, width, height):
    """Create SVG from extracted vector paths."""
    svg_content = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" 
     width="{width}" height="{height}" 
     viewBox="0 0 {width} {height}">
'''
    
    for path in paths:
        try:
            # Convert path to SVG path element
            if 'items' in path:
                svg_path = convert_path_to_svg(path)
                if svg_path:
                    svg_content += f'  {svg_path}\n'
        except:
            continue
    
    svg_content += '</svg>'
    
    with open(output_filename, 'w', encoding='utf-8') as f:
        f.write(svg_content)

def convert_path_to_svg(path_data):
    """Convert PyMuPDF path data to SVG path element."""
    try:
        # This is a simplified conversion - would need more work for complex paths
        if 'items' in path_data and path_data['items']:
            # Extract basic path information
            stroke = path_data.get('stroke', None)
            fill = path_data.get('fill', None)
            width = path_data.get('width', 1)
            
            # Build SVG attributes
            attrs = []
            if stroke:
                attrs.append(f'stroke="rgb({stroke[0]*255:.0f},{stroke[1]*255:.0f},{stroke[2]*255:.0f})"')
            if fill:
                attrs.append(f'fill="rgb({fill[0]*255:.0f},{fill[1]*255:.0f},{fill[2]*255:.0f})"')
            attrs.append(f'stroke-width="{width}"')
            
            # For now, create a simple placeholder
            return f'<path {" ".join(attrs)} d="M 0 0"/>'
    except:
        pass
    return None

def create_reconstructed_svg(text_content, images, output_filename, width, height):
    """Create SVG by reconstructing text and images."""
    svg_content = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" 
     xmlns:xlink="http://www.w3.org/1999/xlink"
     width="{width}" height="{height}" 
     viewBox="0 0 {width} {height}">
'''
    
    # Add text elements
    if text_content and 'blocks' in text_content:
        for block in text_content['blocks']:
            if 'lines' in block:
                for line in block['lines']:
                    if 'spans' in line:
                        for span in line['spans']:
                            text = span.get('text', '').strip()
                            if text:
                                x = span.get('bbox', [0, 0, 0, 0])[0]
                                y = span.get('bbox', [0, 0, 0, 0])[1]
                                size = span.get('size', 12)
                                
                                svg_content += f'  <text x="{x}" y="{y}" font-size="{size}">{text}</text>\n'
    
    # Add images (as embedded data URLs)
    for i, img in enumerate(images):
        # For simplicity, place images at origin - would need more work for proper positioning
        import base64
        img_b64 = base64.b64encode(img['data']).decode()
        svg_content += f'  <image x="0" y="0" width="{img["width"]}" height="{img["height"]}" xlink:href="data:image/png;base64,{img_b64}"/>\n'
    
    svg_content += '</svg>'
    
    with open(output_filename, 'w', encoding='utf-8') as f:
        f.write(svg_content)

def main():
    """Main function to extract SVG from MSIRI pamphlets."""
    
    # PDF files (assuming they're already downloaded)
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
    output_dir = 'svg_extracts'
    os.makedirs(output_dir, exist_ok=True)
    os.chdir(output_dir)
    
    print("=" * 60)
    print("MSIRI Pamphlet SVG Vector Graphics Extractor")
    print("Extracting infinite-resolution vector content")
    print("=" * 60)
    
    results = []
    
    # Process each PDF
    for pdf_info in pdfs:
        print(f"\nProcessing {pdf_info['prefix']}...")
        print("-" * 40)
        
        pdf_path = f"../{pdf_info['filename']}"
        if os.path.exists(pdf_path):
            result = extract_svg_from_pdf(pdf_path, pdf_info['prefix'])
            if result:
                results.append(result)
        else:
            print(f"✗ PDF not found: {pdf_path}")
        
        print("-" * 40)
    
    print(f"\n✓ SVG extraction complete!")
    print(f"Output directory: {os.getcwd()}")
    print("\nGenerated SVG files:")
    print("=" * 40)
    
    for file in sorted(os.listdir('.')):
        if file.endswith('.svg'):
            size_kb = os.path.getsize(file) / 1024
            print(f"🎨 {file} ({size_kb:.1f} KB)")
    
    print("\n🎯 SVG files provide infinite scalability!")
    print("🔍 Open in web browser or vector graphics software for best quality")

if __name__ == "__main__":
    main()
