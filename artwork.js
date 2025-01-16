class Artwork {
    constructor(id, images, timestamps, positions, sizes, rotations) {
        this.id = id;
        this.images = images;
        this.timestamps = timestamps;
        this.positions = positions;
        this.sizes = sizes;
        this.rotations = rotations;
        this.currentImage = null;
        this.currentPosition = { x: 0, y: 0 };
        this.targetPosition = { x: 0, y: 0 };
        this.currentSize = { width: 0, height: 0 };
        this.targetSize = { width: 0, height: 0 };
        this.currentRotation = 0.0;
        this.targetRotation = 0.0;
        this.easingTimer = 0;
        this.easingDuration = 2 * 60; // 0.2 seconds in frames

        console.log(this.id, this.rotations);
    }

    update(currentTimestamp) {
        // Find the latest step before or at the current timestamp
        let stepIndex = -1;
        for (let i = 0; i < this.timestamps.length; i++) {
            if (currentTimestamp >= this.timestamps[i]) {
                stepIndex = i;
            } else {
                break;
            }
        }

        if (stepIndex >= 0) {
            let pos = this.positions[stepIndex];
            let size = this.sizes[stepIndex];
            let img = this.images[stepIndex];
            let rot = this.rotations[stepIndex];

            // Update target position and start easing if it changed
            if (this.targetPosition.x !== pos.x || this.targetPosition.y !== pos.y) {
                this.targetPosition = pos;
                this.easingTimer = 0;
            }

            // Update target size and start easing if it changed
            if (this.targetSize.width !== size.width || this.targetSize.height !== size.height) {
                this.targetSize = size;
                this.easingTimer = 0;
            }

            // Update target rotation and start easing if it changed
            if (this.targetRotation !== rot) {
                console.log(this.id, rot, this.targetPosition);
                this.targetRotation = rot;
                this.easingTimer = 0;
            }

            // Update current image
            this.currentImage = img;
        }

        // Easing logic
        if (this.easingTimer < this.easingDuration) {
            this.easingTimer++;
            let progress = this.easingTimer / this.easingDuration;
            this.currentPosition.x = lerp(this.currentPosition.x, this.targetPosition.x, progress);
            this.currentPosition.y = lerp(this.currentPosition.y, this.targetPosition.y, progress);
            this.currentSize.width = lerp(this.currentSize.width, this.targetSize.width, progress);
            this.currentSize.height = lerp(this.currentSize.height, this.targetSize.height, progress);
            this.currentRotation = lerp(this.currentRotation, this.targetRotation, progress);

        } else {
            // Ensure position is set exactly to target when easing is done
            this.currentPosition = { ...this.targetPosition };
            this.currentSize = { ...this.targetSize };
            this.currentRotation = this.targetRotation;
        }
    }

    display() {
        if (this.currentImage) {
            // Display the image

            push();

            translate(this.currentPosition.x, this.currentPosition.y);            
            rotate(this.currentRotation);
            

            image(
                this.currentImage,
                0,0,
                this.currentSize.width,
                this.currentSize.height
            );

            let m = createVector(mouseX - center.x, mouseY - center.y);

            // Check if the mouse is hovering over the artwork
            if (
                m.x > this.currentPosition.x - this.currentSize.width / 2 &&
                m.x < this.currentPosition.x + this.currentSize.width / 2 &&
                m.y > this.currentPosition.y - this.currentSize.height / 2 &&
                m.y < this.currentPosition.y + this.currentSize.height / 2
            ) {
                // Display the ID
                strokeWeight(2);
                stroke(255);
                fill(0); // Black text
                textAlign(CENTER, CENTER);
                let textOutput = this.id + ": " + this.targetPosition.x + " / " + this.targetPosition.y + ": " + this.targetSize.width + " / " + this.targetSize.height;
                text(textOutput, 0, - 10); // Show above the artwork
            }

            pop();
        }
    }
}
