#!/usr/bin/env python3
"""
Convert CSV file with WKT polygons to GeoJSON format
"""

import csv
import json
from shapely.wkt import loads
from shapely.geometry import mapping

def csv_to_geojson(csv_file_path, output_file_path):
    """
    Convert CSV file with WKT polygons to GeoJSON format
    
    Args:
        csv_file_path (str): Path to input CSV file
        output_file_path (str): Path to output GeoJSON file
    """
    
    # Initialize GeoJSON structure
    geojson = {
        "type": "FeatureCollection",
        "features": []
    }
    
    # Read CSV file and convert each row to a GeoJSON feature
    with open(csv_file_path, 'r', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        
        for row in reader:
            try:
                # Parse WKT geometry
                geometry = loads(row['wkt'])
                
                # Create GeoJSON feature
                feature = {
                    "type": "Feature",
                    "properties": {
                        "id": row['id'],
                        "osm_id": int(row['osm_id']) if row['osm_id'].isdigit() else row['osm_id']
                    },
                    "geometry": mapping(geometry)
                }
                
                geojson["features"].append(feature)
                
            except Exception as e:
                print(f"Error processing row with ID {row.get('id', 'unknown')}: {e}")
                continue
    
    # Write GeoJSON to file
    with open(output_file_path, 'w', encoding='utf-8') as outfile:
        json.dump(geojson, outfile, indent=2)
    
    print(f"Successfully converted {len(geojson['features'])} features to GeoJSON")
    print(f"Output saved to: {output_file_path}")

def main():
    """Main function to run the conversion"""
    csv_file = "estate_fields.csv"
    geojson_file = "estate_fields.geojson"
    
    try:
        csv_to_geojson(csv_file, geojson_file)
    except FileNotFoundError:
        print(f"Error: Could not find file '{csv_file}'")
        print("Make sure the CSV file is in the same directory as this script")
    except Exception as e:
        print(f"Error during conversion: {e}")

if __name__ == "__main__":
    main()
