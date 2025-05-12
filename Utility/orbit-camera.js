class OrbitCamera {
    constructor(input, targetGeometry = null) {
        this.fov = 45;
        this.yaw = 0;
        this.pitch = -45;
        this.speed = 0.5;
        this.zoomScale = 0.5;
        this.baseMinDistance = 80;
        this.baseMaxDistance = 1000;

        this.input = input;
        this.worldMatrix = new Matrix4();
        this.changeTarget(targetGeometry);

        let lastMouseX = 0;
        let lastMouseY = 0;
        let isDragging = false;


        // ---------------------------------------------------------------------
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

            this.yaw -= (evt.pageX - lastMouseX) * this.speed;
            this.pitch -= (evt.pageY - lastMouseY) * this.speed;
            this.pitch = Math.min(this.pitch, 85);
            this.pitch = Math.max(this.pitch, -85);

            lastMouseX = evt.pageX;
            lastMouseY = evt.pageY;
        }

        document.onmousewheel = (evt) => {
            this.zoomScale -= evt.wheelDelta * 0.0003;
            this.zoomScale = Math.min(this.zoomScale, 1);
            this.zoomScale = Math.max(this.zoomScale, 0);
        }
    }


    // -------------------------------------------------------------------------
    getViewMatrix() {
        return this.worldMatrix.clone().inverse();
    }

    getPosition() {
        return new Vector3(
            this.worldMatrix.elements[3],
            this.worldMatrix.elements[7],
            this.worldMatrix.elements[11]
        );
    }

    getDirection() {
        const yRotation = new Matrix4().makeRotationY(this.yaw);
        const xRotation = new Matrix4().makeRotationX(this.pitch);
        return yRotation.multiply(xRotation).multiplyVector(new Vector4(0, 0, -1, 0)).getVector3();
    }


    // -----------------------------------------------------------------------------
    update(deltaTime) {
        this.speedInput(deltaTime);
        this.fovInput(deltaTime * 30);

        const tether = new Vector4(0, 0, this.minDistance + (this.maxDistance - this.minDistance) * this.zoomScale, 0);
        const yaw = new Matrix4().makeRotationY(this.yaw);
        const pitch = new Matrix4().makeRotationX(this.pitch);
        
        let transformedTether = pitch.multiplyVector(tether);
        transformedTether = yaw.multiplyVector(transformedTether);

        const targetPos = this.targetGeometry.getPosition();
        const position = targetPos.clone().add(transformedTether);
        this.lookAt(position, targetPos);
    }


    lookAt(eyePos, targetPos) {
        const forward = targetPos.subtract(eyePos).normalize();
        const right = Vector4.cross(forward, Vector4.up).normalize();
        const up = Vector4.cross(right, forward);

        const e = this.worldMatrix.elements;
        e[0] = right.x; e[1] = up.x; e[2] = -forward.x; e[3] = eyePos.x;
        e[4] = right.y; e[5] = up.y; e[6] = -forward.y; e[7] = eyePos.y;
        e[8] = right.z; e[9] = up.z; e[10] = -forward.z; e[11] = eyePos.z;
        e[12] = 0; e[13] = 0; e[14] = 0; e[15] = 1;

        return this;
    }


    // -----------------------------------------------------------------------------
    speedInput(increment) {
        if (this.input.r) {
            this.speed += increment;
            if (this.speed > 0.8) {
                this.speed = 0.8;
            }
        }
        if (this.input.f) {
            this.speed -= increment;
            if (this.speed < 0.1) {
                this.speed = 0.1;
            }
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


    changeTarget(targetGeometry) {
        this.targetGeometry = targetGeometry;
        if (targetGeometry == null) return;

        this.minDistance = this.baseMinDistance * targetGeometry.getScale();
        this.maxDistance = this.baseMaxDistance * targetGeometry.getScale();
    }
}