#!/usr/bin/env python3
"""
Convert SVG files to georeferenced GeoJSON for use in Leaflet maps.
This script extracts vector paths from SVG and applies georeferencing.
"""

import json
import xml.etree.ElementTree as ET
from pathlib import Path
import re
from typing import List, Tuple, Dict, Any
import argparse

class SVGToGeoJSON:
    def __init__(self, svg_file: str, bounds: Tuple[float, float, float, float]):
        """
        Initialize SVG to GeoJSON converter.
        
        Args:
            svg_file: Path to SVG file
            bounds: Geographic bounds as (west, south, east, north) in WGS84
        """
        self.svg_file = Path(svg_file)
        self.bounds = bounds  # (west, south, east, north)
        self.svg_width = 0
        self.svg_height = 0
        self.viewbox = None
        
    def parse_svg_dimensions(self) -> None:
        """Parse SVG dimensions and viewBox."""
        tree = ET.parse(self.svg_file)
        root = tree.getroot()
        
        # Remove namespace prefix for easier parsing
        for elem in root.iter():
            if '}' in elem.tag:
                elem.tag = elem.tag.split('}')[1]
        
        # Get viewBox or width/height
        viewbox = root.get('viewBox')
        if viewbox:
            self.viewbox = [float(x) for x in viewbox.split()]
            self.svg_width = self.viewbox[2] - self.viewbox[0]
            self.svg_height = self.viewbox[3] - self.viewbox[1]
        else:
            # Parse width and height (handle units)
            width_str = root.get('width', '0')
            height_str = root.get('height', '0')
            
            self.svg_width = self._parse_dimension(width_str)
            self.svg_height = self._parse_dimension(height_str)
            self.viewbox = [0, 0, self.svg_width, self.svg_height]
    
    def _parse_dimension(self, dim_str: str) -> float:
        """Parse dimension string (e.g., '100px', '50mm') to float."""
        # Remove units and convert to float
        dim_str = re.sub(r'[a-zA-Z%]', '', dim_str)
        return float(dim_str) if dim_str else 0
    
    def svg_to_geo_coords(self, x: float, y: float) -> Tuple[float, float]:
        """
        Convert SVG coordinates to geographic coordinates.
        
        Args:
            x, y: SVG coordinates
            
        Returns:
            (longitude, latitude) in WGS84
        """
        west, south, east, north = self.bounds
        
        # Normalize SVG coordinates to 0-1 range
        if self.viewbox:
            norm_x = (x - self.viewbox[0]) / self.svg_width
            norm_y = (y - self.viewbox[1]) / self.svg_height
        else:
            norm_x = x / self.svg_width
            norm_y = y / self.svg_height
        
        # Convert to geographic coordinates
        # Note: SVG Y increases downward, geographic Y increases upward
        longitude = west + norm_x * (east - west)
        latitude = north - norm_y * (north - south)  # Flip Y axis
        
        return longitude, latitude
    
    def parse_path_data(self, path_data: str) -> List[Tuple[float, float]]:
        """
        Parse SVG path data and extract coordinates.
        Simplified parser for basic paths.
        """
        coordinates = []
        
        # Remove path commands and extract coordinate pairs
        # This is a simplified parser - you may need to enhance for complex paths
        path_data = re.sub(r'[MmLlHhVvCcSsQqTtAaZz]', ' ', path_data)
        numbers = re.findall(r'-?\d+\.?\d*', path_data)
        
        # Group numbers into coordinate pairs
        for i in range(0, len(numbers) - 1, 2):
            try:
                x = float(numbers[i])
                y = float(numbers[i + 1])
                coordinates.append((x, y))
            except (ValueError, IndexError):
                continue
        
        return coordinates
    
    def extract_features(self) -> List[Dict[str, Any]]:
        """Extract vector features from SVG."""
        tree = ET.parse(self.svg_file)
        root = tree.getroot()
        
        # Remove namespace prefix
        for elem in root.iter():
            if '}' in elem.tag:
                elem.tag = elem.tag.split('}')[1]
        
        features = []
        
        # Find all path elements
        for path in root.iter('path'):
            path_data = path.get('d', '')
            if not path_data:
                continue
            
            svg_coords = self.parse_path_data(path_data)
            if len(svg_coords) < 3:  # Need at least 3 points for a polygon
                continue
            
            # Convert to geographic coordinates
            geo_coords = [self.svg_to_geo_coords(x, y) for x, y in svg_coords]
            
            # Close polygon if not already closed
            if geo_coords[0] != geo_coords[-1]:
                geo_coords.append(geo_coords[0])
            
            # Create GeoJSON feature
            feature = {
                "type": "Feature",
                "properties": {
                    "id": path.get('id', f'path_{len(features)}'),
                    "fill": path.get('fill', '#000000'),
                    "stroke": path.get('stroke', '#000000'),
                    "stroke-width": path.get('stroke-width', '1'),
                    "opacity": path.get('opacity', '1')
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [geo_coords]
                }
            }
            features.append(feature)
        
        # Find polygon and rect elements
        for elem in root.iter():
            if elem.tag in ['polygon', 'rect', 'circle', 'ellipse']:
                feature = self._parse_shape_element(elem, len(features))
                if feature:
                    features.append(feature)
        
        return features
    
    def _parse_shape_element(self, elem, feature_id: int) -> Dict[str, Any]:
        """Parse basic SVG shape elements."""
        if elem.tag == 'polygon':
            points_str = elem.get('points', '')
            if not points_str:
                return None
            
            # Parse points
            coords = []
            points = re.findall(r'-?\d+\.?\d*,-?\d+\.?\d*', points_str)
            for point in points:
                x, y = map(float, point.split(','))
                coords.append(self.svg_to_geo_coords(x, y))
            
            if len(coords) < 3:
                return None
            
            # Close polygon
            if coords[0] != coords[-1]:
                coords.append(coords[0])
            
            return {
                "type": "Feature",
                "properties": {
                    "id": elem.get('id', f'polygon_{feature_id}'),
                    "fill": elem.get('fill', '#000000'),
                    "stroke": elem.get('stroke', '#000000')
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [coords]
                }
            }
        
        # Add support for other shapes as needed
        return None
    
    def convert_to_geojson(self, output_file: str = None) -> Dict[str, Any]:
        """Convert SVG to GeoJSON."""
        self.parse_svg_dimensions()
        features = self.extract_features()
        
        geojson = {
            "type": "FeatureCollection",
            "crs": {
                "type": "name",
                "properties": {
                    "name": "EPSG:4326"
                }
            },
            "features": features
        }
        
        if output_file:
            with open(output_file, 'w') as f:
                json.dump(geojson, f, indent=2)
            print(f"✅ GeoJSON saved to {output_file}")
        
        return geojson

def main():
    parser = argparse.ArgumentParser(description='Convert SVG to georeferenced GeoJSON')
    parser.add_argument('svg_file', help='Input SVG file')
    parser.add_argument('--bounds', nargs=4, type=float, required=True,
                       metavar=('WEST', 'SOUTH', 'EAST', 'NORTH'),
                       help='Geographic bounds in WGS84 (west south east north)')
    parser.add_argument('--output', '-o', help='Output GeoJSON file')
    
    args = parser.parse_args()
    
    # Create output filename if not provided
    if not args.output:
        svg_path = Path(args.svg_file)
        args.output = svg_path.with_suffix('.geojson')
    
    # Convert SVG to GeoJSON
    converter = SVGToGeoJSON(args.svg_file, tuple(args.bounds))
    converter.convert_to_geojson(args.output)
    
    print(f"📊 Conversion complete!")
    print(f"📁 Input: {args.svg_file}")
    print(f"📁 Output: {args.output}")
    print(f"🌍 Bounds: {args.bounds}")

if __name__ == "__main__":
    main()
