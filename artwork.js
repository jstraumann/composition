class Artwork {
    constructor(id, images, timestamps, positions) {
        this.id = id;
        this.images = images;
        this.timestamps = timestamps;
        this.positions = positions;
        this.currentImage = null;
        this.currentPosition = { x: 0, y: 0 };
        this.targetPosition = { x: 0, y: 0 };
        this.easingTimer = 0;
        this.easingDuration = 0.2 * 60; // 0.2 seconds in frames
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
            let img = this.images[stepIndex];
            
            // Update target position and start easing if it changed
            if (this.targetPosition.x !== pos.x || this.targetPosition.y !== pos.y) {
                this.targetPosition = pos;
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
        } else {
            // Ensure position is set exactly to target when easing is done
            this.currentPosition = { ...this.targetPosition };
        }
    }
    
    display() {
        if (this.currentImage) {
            image(this.currentImage, this.currentPosition.x, this.currentPosition.y);
        }
    }
}