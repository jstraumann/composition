// Sketch
const canvasWidth = 1280;
const canvasHeight = 920; 

// Artworks
let artworkData = [];
let artworks = [];
let minTimestamp = Infinity;
let maxTimestamp = -Infinity;
let slider;


let selectedArtwork = null;


function preload() {
    // Load the JSON file
    artworkData = loadJSON('data.json', processData);
}

function processData(data) {
    artworkData = data;
    for (let item of artworkData) {
        let artworkImages = [];
        let timestamps = [];
        let sizes = [];  // Array to hold size objects { width, height }
        let positions = [];  // Array to hold position objects { x, y }

        let lastPosition = { x: null, y: null };  // Variable to keep track of the last valid position
        let lastSize = { width: null, height: null };  // Variable to keep track of the last valid size

        // Loop through each artwork in the series
        for (let artwork of item.artworks) {
            // Load the image
            artworkImages.push(loadImage(artwork.image));
            timestamps.push(artwork.timestamp);

            // Handle position: add x, y only for the first artwork
            if (artwork.position !== null) {
                lastPosition = artwork.position; // Set position for the first artwork
            } else {
                artwork.position = lastPosition; // Use previous position for subsequent artworks
            }
            let position = {
                x: artwork.position ? artwork.position.x : lastPosition.x, // Use previous x if null
                y: artwork.position ? artwork.position.y : lastPosition.y  // Use previous y if null
            };
            
            if (artwork.size !== null) {
                lastSize = artwork.size; // Set size for the first artwork
            } else {
                artwork.size = lastSize; // Use previous size for subsequent artworks
            }            
            // Create a size object for width and height
            let size = {
                width: artwork.size ? artwork.size.width : lastSize.width,  // Use previous width if null
                height: artwork.size ? artwork.size.height : lastSize.height // Use previous height if null
            };

            // Add the size and position objects to their respective arrays
            sizes.push(size);
            positions.push(position);
        }

        // Create a new Artwork object with the sizes and positions arrays
        let isDraggable = item.id !== "overview";

        artworks.push(new Artwork(item.id, artworkImages, timestamps, positions, sizes, isDraggable));
        minTimestamp = Math.min(minTimestamp, ...timestamps);
        maxTimestamp = Math.max(maxTimestamp, ...timestamps);
    }
    dataLoaded = true;
}



function setup() {
    let canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent('sketch-container');

    // Mode
    imageMode(CENTER);
    rectMode(CENTER);

    // Controls
    slider = select('#slider');
    slider.attribute('min', minTimestamp);
    slider.attribute('max', maxTimestamp);

    slider.input(updateArtworks);
    frameRate(60);
}



function draw() {
    background(255);
    translate(width / 2, height / 2);
    let currentTimestamp = slider.value();
    for (let artwork of artworks) {
        artwork.update(currentTimestamp);
        artwork.display();
    }
}


function updateArtworks(timestamp) {
    for (let artwork of artworks) {
        artwork.update(timestamp);
        artwork.display();
    }
}


function mousePressed() {
    // Check if any artwork is clicked
    for (let artwork of artworks) {
        artwork.startDrag(mouseX, mouseY);
        if (artwork.isDragging) {
            selectedArtwork = artwork;
            break;
        }
    }
}

function mouseDragged() {
    // If an artwork is being dragged, update its position
    if (selectedArtwork) {
        selectedArtwork.drag(mouseX, mouseY);
    }
}

function mouseReleased() {
    // Stop dragging the selected artwork
    if (selectedArtwork) {
        selectedArtwork.stopDrag();
        selectedArtwork = null;
    }
}

// function saveData() {
//     let jsonData = artworks.map(artwork => ({
//         id: artwork.id,
//         artworks: artwork.timestamps.map((timestamp, index) => ({
//             image: artwork.images[index].src,
//             timestamp: timestamp,
//             position: artwork.positions[index],
//             size: artwork.sizes[index],
//         })),
//     }));

//     saveJSON(jsonData, 'data.json');
// }
function saveData() {
    // Map through each series in artworkData
    const updatedData = artworkData.map(series => {
        return {
            id: series.id,
            artworks: series.artworks.map((artwork, index) => {
                return {
                    image: series.images ? series.images[index] : null, // Ensure images are handled safely
                    timestamp: artwork.timestamp,
                    position: artwork.position ? { ...artwork.position } : null,
                    size: artwork.size ? { ...artwork.size } : null
                };
            })
        };
    });

    // Save the updated JSON to a file
    saveJSON(updatedData, 'updated-data.json');
}

function keyPressed() {
    if (key === 's' || key === 'S') {
        saveData();
    }
}