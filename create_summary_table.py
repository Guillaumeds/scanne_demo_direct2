#!/usr/bin/env python3
"""
Create a comprehensive summary table from the PDF analysis results
"""

import json
import pandas as pd
from tabulate import tabulate

def create_comprehensive_summary():
    # Load the analysis results
    with open('pdf_analysis_results.json', 'r') as f:
        results = json.load(f)

    # Create summary data
    summary_data = []

    for result in results:
        pdf_name = result['pdf_name']

        # Determine PDF type
        if pdf_name.startswith('M '):
            pdf_type = 'MSIRI (M-series)'
        elif pdf_name.startswith('ercane'):
            pdf_type = 'eRcane (R-series)'
        elif pdf_name.startswith('m'):
            pdf_type = 'MSIRI (m-series)'
        else:
            pdf_type = 'Other'

        # Extract variety name
        if pdf_name.startswith('M '):
            variety = pdf_name.replace('M ', 'M')
        elif pdf_name.startswith('ercane.re.nathan.re-'):
            variety = pdf_name.replace('ercane.re.nathan.re-', '').upper()
        elif pdf_name.startswith('m'):
            variety = pdf_name.upper()
        else:
            variety = pdf_name

        # Analyze image resolutions
        resolutions = []
        large_images = 0
        small_images = 0

        for img in result.get('image_details', []):
            width = img['width']
            height = img['height']
            resolution = f"{width}x{height}"
            resolutions.append(resolution)

            # Categorize by size (arbitrary thresholds)
            if width >= 200 or height >= 200:
                large_images += 1
            else:
                small_images += 1

        # Get unique resolutions and most common
        unique_resolutions = list(set(resolutions))
        most_common_res = max(set(resolutions), key=resolutions.count) if resolutions else "N/A"

        summary_data.append({
            'Variety': variety,
            'PDF Type': pdf_type,
            'Total Images': result['total_images'],
            'Raster Images': result['raster_images'],
            'Vector Images': result['vector_images'],
            'Large Images (≥200px)': large_images,
            'Small Images (<200px)': small_images,
            'Unique Resolutions': len(unique_resolutions),
            'Most Common Resolution': most_common_res,
            'Status': result['status']
        })
    
    # Create DataFrame and sort
    df = pd.DataFrame(summary_data)
    df = df.sort_values(['PDF Type', 'Variety'])
    
    # Print comprehensive table
    print("="*100)
    print("COMPREHENSIVE PDF IMAGE ANALYSIS SUMMARY")
    print("="*100)
    print(tabulate(df, headers='keys', tablefmt='grid', showindex=False))
    
    # Print statistics by type
    print("\n" + "="*60)
    print("STATISTICS BY PDF TYPE")
    print("="*60)
    
    stats_by_type = df.groupby('PDF Type').agg({
        'Total Images': ['count', 'sum', 'mean'],
        'Raster Images': 'sum',
        'Vector Images': 'sum'
    }).round(1)
    
    stats_by_type.columns = ['PDF Count', 'Total Images', 'Avg Images/PDF', 'Total Raster', 'Total Vector']
    print(tabulate(stats_by_type, headers='keys', tablefmt='grid'))
    
    # Print successful vs failed
    print("\n" + "="*60)
    print("SUCCESS/FAILURE ANALYSIS")
    print("="*60)
    
    success_stats = df.groupby('Status').size().reset_index(name='Count')
    print(tabulate(success_stats, headers='keys', tablefmt='grid', showindex=False))
    
    # Print overall totals
    print("\n" + "="*60)
    print("OVERALL TOTALS")
    print("="*60)
    
    successful_pdfs = df[df['Status'] == 'success']
    failed_pdfs = df[df['Status'] != 'success']
    
    print(f"Total PDFs analyzed: {len(df)}")
    print(f"Successful extractions: {len(successful_pdfs)}")
    print(f"Failed extractions: {len(failed_pdfs)}")
    print(f"Total images found: {successful_pdfs['Total Images'].sum()}")
    print(f"Total raster images: {successful_pdfs['Raster Images'].sum()}")
    print(f"Total vector images: {successful_pdfs['Vector Images'].sum()}")
    
    # List all varieties found
    print("\n" + "="*60)
    print("ALL SUGARCANE VARIETIES IDENTIFIED")
    print("="*60)
    
    successful_varieties = successful_pdfs['Variety'].tolist()
    failed_varieties = failed_pdfs['Variety'].tolist()
    
    print("✅ VARIETIES WITH SUCCESSFUL IMAGE EXTRACTION:")
    for variety in sorted(successful_varieties):
        print(f"   • {variety}")
    
    if failed_varieties:
        print("\n❌ VARIETIES WITH EXTRACTION ISSUES:")
        for variety in sorted(failed_varieties):
            print(f"   • {variety}")
    
    print(f"\nTotal unique varieties: {len(successful_varieties) + len(failed_varieties)}")
    
    return df

def show_detailed_resolutions():
    """Show detailed resolution analysis for each PDF"""
    with open('pdf_analysis_results.json', 'r') as f:
        results = json.load(f)

    print("\n" + "="*80)
    print("DETAILED RESOLUTION ANALYSIS BY PDF")
    print("="*80)

    for result in results:
        if result['status'] != 'success' or result['total_images'] == 0:
            continue

        pdf_name = result['pdf_name']
        variety = pdf_name.replace('M ', 'M') if pdf_name.startswith('M ') else pdf_name

        print(f"\n📄 {variety} ({result['total_images']} images)")
        print("-" * 50)

        # Collect all resolutions
        resolution_counts = {}
        for img in result['image_details']:
            resolution = f"{img['width']}x{img['height']}"
            resolution_counts[resolution] = resolution_counts.get(resolution, 0) + 1

        # Sort by frequency
        sorted_resolutions = sorted(resolution_counts.items(), key=lambda x: x[1], reverse=True)

        for resolution, count in sorted_resolutions:
            percentage = (count / result['total_images']) * 100
            print(f"   {resolution:>12} : {count:>2} images ({percentage:>5.1f}%)")

def show_sample_images_info():
    """Show detailed info for first few images of each PDF"""
    with open('pdf_analysis_results.json', 'r') as f:
        results = json.load(f)

    print("\n" + "="*80)
    print("SAMPLE IMAGE DETAILS (First 3 images per PDF)")
    print("="*80)

    for result in results:
        if result['status'] != 'success' or result['total_images'] == 0:
            continue

        pdf_name = result['pdf_name']
        variety = pdf_name.replace('M ', 'M') if pdf_name.startswith('M ') else pdf_name

        print(f"\n📄 {variety}")
        print("-" * 40)

        # Show first 3 images
        for i, img in enumerate(result['image_details'][:3]):
            size_kb = img['size_bytes'] / 1024
            print(f"   Image {i+1}: {img['width']}x{img['height']} px, "
                  f"{img['colorspace']}, {size_kb:.1f} KB")

        if len(result['image_details']) > 3:
            print(f"   ... and {len(result['image_details']) - 3} more images")

if __name__ == "__main__":
    df = create_comprehensive_summary()
    show_detailed_resolutions()
    show_sample_images_info()
