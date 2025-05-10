class OrbitCamera {
    constructor(input) {
        this.input = input;
        this.fov = 45;
        this.yaw = 0;
        this.pitch = -45;
        this.zoomScale = 1;
        this.minDistance = 1;
        this.maxDistance = 30;
        this.worldMatrix = new Matrix4();
        this.target = new Vector4(0, 0, 0, 1);

        let lastMouseX = 0;
        let lastMouseY = 0;
        let isDragging = false;


        // ---------------------------------------------------------------------
        document.onmousedown = (evt) => {
            if (evt.button == 0) {
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

            this.yaw -= (evt.pageX - lastMouseX) * 0.5;
            this.pitch -= (evt.pageY - lastMouseY) * 0.5;
            this.pitch = Math.min(this.pitch, 85);
            this.pitch = Math.max(this.pitch, -85);

            lastMouseX = evt.pageX;
            lastMouseY = evt.pageY;
        }

        document.onmousewheel = (evt) => {
            this.zoomScale -= evt.wheelDelta * 0.001;
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
        const tether = new Vector4(0, 0, this.minDistance + (this.maxDistance - this.minDistance) * this.zoomScale, 0);
        const yaw = new Matrix4().makeRotationY(this.yaw);
        const pitch = new Matrix4().makeRotationX(this.pitch);
        
        let transformedTether = pitch.multiplyVector(tether);
        transformedTether = yaw.multiplyVector(transformedTether);

        const position = this.target.clone().add(transformedTether);
        this.lookAt(position, new Vector4(0, 0, 0, 1));

        this.fovInput(deltaTime * 30);
    }


    lookAt(eyePos, targetPos) {
        const worldUp = new Vector4(0, 1, 0, 0);
        this.worldMatrix.makeIdentity();

        const forward = targetPos.clone().subtract(eyePos).normalize();
        const right = Vector4.cross(forward, worldUp).normalize();
        const up = Vector4.cross(right, forward);

        const e = this.worldMatrix.elements;
        e[0] = right.x; e[1] = up.x; e[2] = -forward.x; e[3] = eyePos.x;
        e[4] = right.y; e[5] = up.y; e[6] = -forward.y; e[7] = eyePos.y;
        e[8] = right.z; e[9] = up.z; e[10] = -forward.z; e[11] = eyePos.z;
        e[12] = 0; e[13] = 0; e[14] = 0; e[15] = 1;

        return this;
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
    }
}