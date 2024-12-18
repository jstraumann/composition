import os
import json
import random
from datetime import datetime
from PIL import Image  # We need Pillow to get image sizes

def get_image_timestamp(image_path):
    # This function uses the number in the filename as the timestamp
    filename = os.path.basename(image_path)
    base_name = os.path.splitext(filename)[0]
    number_str = base_name.split('-')[1]  # Extract timestamp from the filename
    return int(number_str)

def get_image_sizes(image_path):
    # Open the image to get its size (width, height)
    with Image.open(image_path) as img:
        width, height = img.size
    return width, height

def generate_json_from_structure(root_dir):
    data = []
    
    # Process directories in the root directory
    for root, dirs, files in os.walk(root_dir):
        # Only process directories with image files
        image_files = [f for f in sorted(files) if f.endswith('.jpg') and f != '.DS_Store']
        
        if not image_files:
            continue
        
        # Sort files by timestamp extracted from the filename
        image_files = sorted(image_files, key=lambda f: get_image_timestamp(os.path.join(root, f)))
        
        # Initialize series object
        series = {
            "id": os.path.basename(root),
            "artworks": []
        }
        
        last_position = None
        last_size = None
        
        # Process each image file
        for file in image_files:
            image_path = os.path.join(root, file)
            timestamp = get_image_timestamp(image_path)
            
            # Get the image sizes
            img_width, img_height = get_image_sizes(image_path)
            
            # Calculate width and height as original image size divided by 10
            width = img_width // 10
            height = img_height // 10
            
            # Position: Random for first image, then inherit for others
            if last_position is None:
                position = {"x": random.randint(-600, 600), "y": random.randint(-400, 400)}
                last_position = position
            else:
                position = None  # Subsequent images have no position
            
            # Size: Random for first image, then inherit for others
            if last_size is None:
                size = {"width": width, "height": height}
                last_size = size
            else:
                size = None  # Subsequent images have no size
            
            # Add artwork info
            series["artworks"].append({
                "image": image_path,
                "timestamp": timestamp,
                "position": position,
                "size": size  # Use dimension instead of size
            })
        
        # Add the series to the data list
        data.append(series)
    
    # Handle special case: Place "overview" series first
    overview_series = [series for series in data if series["id"] == "overview"]
    if overview_series:
        data.remove(overview_series[0])
        data.insert(0, overview_series[0])  # Insert overview at the start
    
    # Get the current date for the filename
    current_time = datetime.now().strftime("%Y-%m-%d-%H%M")
    filename = f"data-{current_time}.json"
    
    # Write the data to a JSON file
    with open(filename, 'w') as f:
        json.dump(data, f, indent=4)
    
    print(f"JSON file generated: {filename}")

# Set the root directory of your images
root_directory = "data"  # Adjust the path as necessary
generate_json_from_structure(root_directory)
