class Time {
    constructor() {
        this.seconds = 0;
        this.lastTime = 0;
        this.deltaTime = 0;
    }

    update(speed) {
        // speed only affects seconds
        const currentTime = performance.now();
        if (this.lastTime !== 0) {
            this.deltaTime = (currentTime - this.lastTime) / 1000.0;
            this.seconds += this.deltaTime * speed;
        }
        this.lastTime = currentTime;
    }
}