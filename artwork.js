class Artwork {
    constructor(id, images, timestamps, positions, sizes, isDraggable = true) {
        this.id = id;
        this.images = images;
        this.timestamps = timestamps;
        this.positions = positions;
        this.sizes = sizes;
        this.currentImage = null;
        this.currentPosition = { x: 0, y: 0 };
        this.targetPosition = { x: 0, y: 0 };
        this.currentSize = { width: 0, height: 0 };
        this.targetSize = { width: 0, height: 0 };
        this.easingTimer = 0;
        this.easingDuration = 0.2 * 60; // 0.2 seconds in frames
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.isDraggable = isDraggable; // Flag to indicate if the artwork is draggable
    }

    update(currentTimestamp) {
        if (!this.isDragging) {
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
            } else {
                // Ensure position is set exactly to target when easing is done
                this.currentPosition = { ...this.targetPosition };
                this.currentSize = { ...this.targetSize };
            }
        }
    }

    display() {
        if (this.currentImage) {
            image(
                this.currentImage,
                this.currentPosition.x,
                this.currentPosition.y,
                this.currentSize.width,
                this.currentSize.height
            );
        }
    }

    startDrag(mouseX, mouseY) {
        // Do nothing if not draggable
        if (!this.isDraggable) return;

        // Adjust mouse coordinates to account for the center translation
        const adjustedMouseX = mouseX - width / 2;
        const adjustedMouseY = mouseY - height / 2;

        // Check if the mouse is over the artwork
        if (
            adjustedMouseX > this.currentPosition.x - this.currentSize.width / 2 &&
            adjustedMouseX < this.currentPosition.x + this.currentSize.width / 2 &&
            adjustedMouseY > this.currentPosition.y - this.currentSize.height / 2 &&
            adjustedMouseY < this.currentPosition.y + this.currentSize.height / 2
        ) {
            this.isDragging = true;
            this.dragOffset = {
                x: this.currentPosition.x - adjustedMouseX,
                y: this.currentPosition.y - adjustedMouseY,
            };
        }
    }

    drag(mouseX, mouseY) {
        if (this.isDragging) {
            // Adjust mouse coordinates to account for the center translation
            const adjustedMouseX = mouseX - width / 2;
            const adjustedMouseY = mouseY - height / 2;

            this.currentPosition.x = adjustedMouseX + this.dragOffset.x;
            this.currentPosition.y = adjustedMouseY + this.dragOffset.y;
        }
    }

    stopDrag() {
        if (this.isDragging) {
            this.isDragging = false;
            // Update position in the positions array
            this.positions[0] = { ...this.currentPosition }; // Update the first position for simplicity
        }
    }
}
