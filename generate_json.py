import os
import json
import xml.etree.ElementTree as ET
from datetime import datetime
from PIL import Image

def get_image_timestamp(image_path):
    filename = os.path.basename(image_path)
    parts = filename.split('-')
    
    if len(parts) >= 4 and parts[0] == "snapshot":
        try:
            # The timestamp is the second element (index 2) after series ID
            return int(parts[2])
        except ValueError:
            print(f"Error parsing timestamp from filename: {filename}")
            return 0
    else:
        print(f"Unexpected filename format: {filename}")
        return 0

def get_image_sizes(image_path):
    with Image.open(image_path) as img:
        width, height = img.size
    return width, height

def parse_svg(svg_path):
    tree = ET.parse(svg_path)
    root = tree.getroot()
    namespace = {'svg': 'http://www.w3.org/2000/svg'}
    
    positions_and_sizes = {}
    
    for rect in root.findall(".//svg:rect", namespace):
        series_id = rect.attrib.get('id')
        if series_id:
            x = float(rect.attrib.get('x', 0))
            y = float(rect.attrib.get('y', 0))
            width = float(rect.attrib.get('width', 0))
            height = float(rect.attrib.get('height', 0))
            positions_and_sizes[series_id] = {
                "position": {"x": x, "y": y},
                "size": {"width": width, "height": height}
            }
    return positions_and_sizes

def generate_json_from_structure(images_dir, positions_dir):
    data = []
    
    # Map timestamp to SVG files
    svg_files = {int(svg.split('-')[1].split('.')[0]): os.path.join(positions_dir, svg) 
                 for svg in os.listdir(positions_dir) if svg.endswith('.svg')}
    
    # Process directories in the images folder
    for series_dir in sorted(os.listdir(images_dir)):
        series_path = os.path.join(images_dir, series_dir)
        if not os.path.isdir(series_path):
            continue

        image_files = [f for f in sorted(os.listdir(series_path)) if f.endswith('.jpg') and f != '.DS_Store']
        if not image_files:
            continue

        # Initialize series object
        series = {
            "id": series_dir,
            "artworks": []
        }
        
        # Initialize variables to store the last known position and size
        last_position = {"x": 0, "y": 0}  # Default position if no timestamp
        last_size = {"width": 100, "height": 100}  # Default size if no timestamp

        for file in image_files:
            image_path = os.path.join(series_path, file)
            timestamp = get_image_timestamp(image_path)
            img_width, img_height = get_image_sizes(image_path)

            # Set the default position and size for the first image or if no timestamp is found
            if timestamp == 1:  # Assuming the first image has timestamp 1
                last_position = {"x": 0, "y": 0}  # Default position if no timestamp
                last_size = {"width": 100, "height": 100}  # Default size if no timestamp
            else:
                last_position = last_position if last_position else {"x": 0, "y": 0}
                last_size = last_size if last_size else {"width": 100, "height": 100}
            
            if timestamp in svg_files:
                # Parse the SVG file for the timestamp
                svg_data = parse_svg(svg_files[timestamp])
                svg_entry = svg_data.get(series_dir, {})
                position = svg_entry.get("position", {"x": 0,   "y": 0})
                size = svg_entry.get("size", {"width": img_width, "height": img_height})  # Use the full size directly from the SVG
                
                # Update the position and size based on SVG values
                # The `x` and `y` from the SVG are for the top-left corner, but you need the center
                position["x"] += size["width"] / 2  # Offset by half the image width for centering
                position["y"] += size["height"] / 2 # Offset by half the image height for centering
                position["x"] -= 600  # Offset by half the artboard width for centering
                position["y"] -= 417  # Offset by half the artboard height for centering
                

                # Update the last known position and size
                last_position = position
                last_size = size
            else:
                # If no timestamp, use the last known values
                position = last_position
                size = last_size

                # Default size fallback if size wasn't set before
                if not size:
                    size = {"width": img_width, "height": img_height}
                
            # Append to the series
            series["artworks"].append({
                "image": image_path,
                "timestamp": timestamp,
                "position": position,
                "size": size  
            })

        
        data.append(series)
    
    # Handle special case: Place "overview" series first
    overview_series = [series for series in data if series["id"] == "overview"]
    if overview_series:
        data.remove(overview_series[0])
        data.insert(0, overview_series[0])  # Insert overview at the start
    
    # Save the file with timestamp
    current_time = datetime.now().strftime("%Y-%m-%d-%H%M")
    timestamped_filename = f"data-{current_time}.json"
    with open(timestamped_filename, 'w') as f:
        json.dump(data, f, indent=4)
    print(f"Timestamped JSON file generated: {timestamped_filename}")
    
    # Save/replace the "data.json" file
    with open("data.json", 'w') as f:
        json.dump(data, f, indent=4)
    print("Replaced 'data.json' with the latest JSON data.")

# Set the root directory and positions directory
root_directory = "data"  # Adjust the path as necessary
positions_directory = os.path.join(root_directory, "positions")
images_directory = os.path.join(root_directory, "images")
generate_json_from_structure(images_directory, positions_directory)
