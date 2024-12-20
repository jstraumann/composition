// Sketch
const canvasWidth = 1280;
const canvasHeight = 920;

// Artworks
let artworkData = [];
let artworks = [];
let minTimestamp = Infinity;
let maxTimestamp = -Infinity;
let slider;

let sliderValueDisplay;
let selectedArtwork = null;
let center;

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
        let rotations = [];  // Array to hold position objects { x, y } 

        let lastPosition = { x: null, y: null };  // Variable to keep track of the last valid position
        let lastSize = { width: null, height: null };  // Variable to keep track of the last valid size

        // Loop through each artwork in the series
        for (let artwork of item.artworks) {
            // Load the image
            artworkImages.push(loadImage(artwork.image));
            timestamps.push(artwork.timestamp);
            
            let position = {
                x: artwork.position ? artwork.position.x : lastPosition.x, // Use previous x if null
                y: artwork.position ? artwork.position.y : lastPosition.y  // Use previous y if null
            };
                      
            // Create a size object for width and height
            let size = {
                width: artwork.size ? artwork.size.width : lastSize.width,  // Use previous width if null
                height: artwork.size ? artwork.size.height : lastSize.height // Use previous height if null
            };     

            // Add the size and position objects to their respective arrays
            sizes.push(size);
            positions.push(position);
            rotations.push(artwork.rotation);
        }

        artworks.push(new Artwork(item.id, artworkImages, timestamps, positions, sizes, rotations));
        minTimestamp = Math.min(minTimestamp, ...timestamps);
        maxTimestamp = Math.max(maxTimestamp, ...timestamps);
    }
    console.log(artworkData);
    
    dataLoaded = true;
}



function setup() {
    let canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent('sketch-container');

    // Mode
    imageMode(CENTER);
    rectMode(CENTER);
    angleMode(DEGREES);

    // Controls
    slider = select('#slider');
    slider.attribute('min', minTimestamp);
    slider.attribute('max', maxTimestamp);

    // Create a p tag to display the slider value
    sliderValueDisplay = createP(`Current Timestamp: ${slider.value()}`);
    sliderValueDisplay.parent('sketch-container'); // Append to the same container as the canvas

    slider.input(() => {
        updateArtworks();
        updateSliderDisplay();
    });

    center = createVector(width/2, height/2);
    frameRate(60);
}



function draw() {
    background(255);
    translate(center);
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

function updateSliderDisplay() {
    sliderValueDisplay.html(`Current Timestamp: ${slider.value()}`);
}
