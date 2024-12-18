import os
import json
import random
from datetime import datetime
from PIL import Image
from PIL.ExifTags import TAGS

# Function to extract the numerical part of the filename and treat it as the timestamp
def extract_number_from_filename(filename):
    try:
        # Extract the number from the filename, assuming format 'snapshot-N-0.jpg'
        base_name = os.path.basename(filename)
        number = int(base_name.split('-')[1])  # Extract the number after 'snapshot-'
        return number  # Treat this number as the timestamp
    except Exception as e:
        print(f"Error extracting number from {filename}: {e}")
        return 0  # Default to 0 if error occurs

# Function to generate a random x and y position between 0 and 600
def generate_random_position():
    return {"x": random.randint(100, 1100), "y": random.randint(100, 700)}

# Function to organize the data
def create_json_from_images(base_dir):
    artworks = []
    
    for root, dirs, files in os.walk(base_dir):
        if not dirs and root.startswith(base_dir):  
            art_id = os.path.basename(root)
            images = []
            timestamps = []
            positions = []

            valid_files = [f for f in files if f.lower().endswith(('.jpg', '.jpeg', '.png')) and f != '.DS_Store']
            sorted_files = sorted(valid_files, key=extract_number_from_filename)

            random_position = generate_random_position()

            for file in sorted_files:
                image_path = os.path.join(root, file)
                timestamp = extract_number_from_filename(file)  # Use the number in the filename as the timestamp
                images.append(image_path)
                timestamps.append(timestamp)  # Use the extracted number as the timestamp
                positions.append(random_position)  # Use the same random position for all images in the series

            artworks.append({
                "id": art_id,
                "images": images,
                "timestamps": timestamps,
                "positions": positions
            })
    
    return artworks

# Main function to write the output to a JSON file
def write_json_to_file(data, filename):
    with open(filename, 'w') as f:
        json.dump(data, f, indent=4)

# Generate JSON filename based on current date
def generate_filename():
    current_time = datetime.now().strftime("%Y-%m-%d-%H%M")
    return f"data-{current_time}.json"

# Main script logic
if __name__ == "__main__":
    base_directory = 'data'  # Adjust the base directory path as needed
    json_filename = generate_filename()

    artwork_data = create_json_from_images(base_directory)
    write_json_to_file(artwork_data, json_filename)

    print(f"JSON file '{json_filename}' generated successfully!")
