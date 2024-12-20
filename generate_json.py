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
            return int(parts[2])
        except ValueError:
            print(f"Error parsing timestamp from filename: {filename}")
            return 0
    else:
        print(f"Unexpected filename format: {filename}")
        return 0

def get_image_sizes(image_path):
    try:
        with Image.open(image_path) as img:
            width, height = img.size
        return width, height
    except Exception as e:
        print(f"Error opening image {image_path}: {e}")
        return 120, 120  # Default size in case of error


def parse_svg(svg_path):
    try:
        tree = ET.parse(svg_path)
        root = tree.getroot()
        namespace = {'svg': 'http://www.w3.org/2000/svg'}
        
        positions_and_sizes = {}
        
        for rect in root.findall(".//svg:rect", namespace):
            series_id = rect.attrib.get('id')
            if series_id:
                x = float(rect.attrib.get('x', 0))
                y = float(rect.attrib.get('y', 0))
                width = float(rect.attrib.get('width', 100))
                height = float(rect.attrib.get('height', 100))
                
                positions_and_sizes[series_id] = {
                    "position": {"x": x, "y": y},
                    "size": {"width": width, "height": height}
                }
        return positions_and_sizes
    except ET.ParseError as e:
        print(f"Error parsing SVG {svg_path}: {e}")
        return {}
    except Exception as e:
        print(f"Unexpected error processing SVG {svg_path}: {e}")
        return {}


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
        last_position = {"x": 0, "y": 0}
        last_size = {"width": 100, "height": 100}

        # Sort the image files by the timestamp extracted from the filename
        image_files_sorted = sorted(image_files, key=lambda f: get_image_timestamp(os.path.join(series_path, f)))

        # Create a list of all timestamps
        all_timestamps = [get_image_timestamp(os.path.join(series_path, f)) for f in image_files_sorted]
        all_timestamps = sorted(set(all_timestamps))

        # Fill in missing timestamps
        for timestamp in range(1, 29):  # For timestamps 1 to 28
            # Check for SVG updates
            if timestamp in svg_files:
                svg_data = parse_svg(svg_files[timestamp])
                svg_entry = svg_data.get(series_dir, {})
                if svg_entry:
                    last_position = svg_entry.get("position", last_position)
                    last_size = svg_entry.get("size", last_size)
                    # Center adjustments
                    last_position["x"] += last_size["width"] / 2 - 600
                    last_position["y"] += last_size["height"] / 2 - 417

            if timestamp in all_timestamps:
                file = image_files_sorted[all_timestamps.index(timestamp)]
                image_path = os.path.join(series_path, file)
                img_width, img_height = get_image_sizes(image_path)

                series["artworks"].append({
                    "image": image_path,
                    "timestamp": timestamp,
                    "position": last_position,
                    "size": last_size
                })
            else:
                # Use the last valid image and SVG data
                series["artworks"].append({
                    "image": series["artworks"][-1]["image"],  # Repeat the last image
                    "timestamp": timestamp,
                    "position": last_position,
                    "size": last_size
                })

        data.append(series)

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
root_directory = "data"
positions_directory = os.path.join(root_directory, "positions")
images_directory = os.path.join(root_directory, "images")
generate_json_from_structure(images_directory, positions_directory)
