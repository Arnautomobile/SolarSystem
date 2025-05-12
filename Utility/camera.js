class Camera {
    constructor(input) {
        this.input = input;
        this.fov = 45;
        this.yaw = 0;
        this.pitch = 0;
        this.speed = 10;
        this.position = new Vector3(0,5,20);
        this.worldMatrix = new Matrix4();

        let lastMouseX = 0;
        let lastMouseY = 0;
        let isDragging = false;


        // -------------------------------------------------------------------------
        document.onmousedown = (evt) => {
            if (evt.button != 0) {
                isDragging = true;
                lastMouseX = evt.pageX;
                lastMouseY = evt.pageY;
            }
        }
        document.onmouseup = () => {
            isDragging = false;
        }

        document.onmousemove = (evt) => {
            if (!isDragging) return;

            this.yaw -= (evt.pageX - lastMouseX) * 0.2;
            this.pitch -= (evt.pageY - lastMouseY) * 0.2;
            this.pitch = Math.min(this.pitch, 85);
            this.pitch = Math.max(this.pitch, -85);

            lastMouseX = evt.pageX;
            lastMouseY = evt.pageY;
        }

        document.onmousewheel = (evt) => {
            this.position.add(this.getDirection().multiplyScalar(evt.wheelDelta * 0.015))
        }
    }


    // -----------------------------------------------------------------------------
    getPosition() {
        return this.position;
    }
    getDirection() {
        const yRotation = new Matrix4().makeRotationY(this.yaw);
        const xRotation = new Matrix4().makeRotationX(this.pitch);
        return yRotation.multiply(xRotation).multiplyVector(new Vector4(0, 0, -1, 0)).getVector3();
    }
    getViewMatrix() {
        return this.worldMatrix.clone().inverse();
    }

    getForward() {
        const angle = this.yaw * Math.PI / 180;
        return new Vector3(-Math.sin(angle), 0, -Math.cos(angle));
    }
    getRight() {
        const angle = (this.yaw - 90) * Math.PI / 180;
        return new Vector3(-Math.sin(angle), 0, -Math.cos(angle));
    }

    
    // -----------------------------------------------------------------------------
    update(deltaTime) {
        this.positionInput(deltaTime * this.speed);
        this.fovInput(deltaTime * 30);
        this.speedInput(deltaTime * 30);

        this.worldMatrix = new Matrix4().makeTranslation(this.position);
        this.worldMatrix.multiply(new Matrix4().makeRotationY(this.yaw));
        this.worldMatrix.multiply(new Matrix4().makeRotationX(this.pitch));
    }


    positionInput(increment) {
        if (this.input.w) {
            this.position.add(this.getForward().multiplyScalar(increment));
        }
        if (this.input.s) {
            this.position.add(this.getForward().multiplyScalar(-increment));
        }
        if (this.input.d) {
            this.position.add(this.getRight().multiplyScalar(increment));
        }
        if (this.input.a) {
            this.position.add(this.getRight().multiplyScalar(-increment));
        }
        if (this.input.e) {
            this.position.add(new Vector3(0, increment, 0));
        }
        if (this.input.q) {
            this.position.add(new Vector3(0, -increment, 0));
        }
    }

    fovInput(increment) {
        if (this.input.t) {
            this.fov -= increment;
            if (this.fov < 5) {
                this.fov = 5;
            }
        }
        if (this.input.g) {
            this.fov += increment;
            if (this.fov > 150) {
                this.fov = 150;
            }
        }
        updateFovDisplay();
    }

    speedInput(increment) {
        if (this.input.r) {
            this.speed += increment;
            if (this.speed > 50) {
                this.speed = 50;
            }
        }
        if (this.input.f) {
            this.speed -= increment;
            if (this.speed < 1) {
                this.speed = 1;
            }
        }
    }
}