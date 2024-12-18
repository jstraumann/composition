let artworks = [];
let slider;
let minTimestamp = 11734516825;
let maxTimestamp = 0;
const canvasWidth = 1200;
const canvasHeight = 800;  // Adjust as needed
let artworkData;


function preload() {
    // Load the JSON file
    artworkData = loadJSON('data-2024-12-18-1313.json', processData);
}

function processData(data) {
    // Process the loaded JSON data
    artworkData = data;
    for (let item of artworkData) {
        let artworkImages = item.images.map(img => loadImage(img));
        artworks.push(new Artwork(item.id, artworkImages, item.timestamps, item.positions));
        minTimestamp = Math.min(minTimestamp, ...item.timestamps);
        maxTimestamp = Math.max(maxTimestamp, ...item.timestamps);
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
    console.log(minTimestamp, maxTimestamp);
    
    slider.input(updateArtworks);
    frameRate(60);
}



function draw() {
    background(255);
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
