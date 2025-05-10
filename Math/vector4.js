class Vector4 {
    constructor(x, y, z, w) {
        this.set(x, y, z, w);
    }

    //----------------------------------------------------------------------------- 
    set(x, y, z, w) {
        this.x = Number.isFinite(x) ? x : 0;
        this.y = Number.isFinite(y) ? y : 0;
        this.z = Number.isFinite(z) ? z : 0;
        this.w = Number.isFinite(w) ? w : 0;
        return this;
    }

    clone() {
        return new Vector4(this.x, this.y, this.z, this.w);
    }

    copy(other) {
        if (!(other instanceof Vector4)) 
            throw new Error("Argument must be an instance of Vector4");

        this.x = other.x;
        this.y = other.y;
        this.z = other.z;
        this.w = other.w;
        return this;
    }

    getVector3() {
        return new Vector3(this.x, this.y, this.z);
    }


    //----------------------------------------------------------------------------- 
    add(v) {
        if (!(v instanceof Vector4)) 
            throw new Error("Argument must be an instance of Vector4");

        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        this.w += v.w;
        return this;
    }

    subtract(v) {
        if (!(v instanceof Vector4)) 
            throw new Error("Argument must be an instance of Vector4");

        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;
        this.w -= v.w;
        return this;
    }

    negate() {
        this.x = -this.x;
        this.y = -this.y;
        this.z = -this.z;
        this.w = -this.w;
        return this;
    }


    //----------------------------------------------------------------------------- 
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
    }

    lengthSqr() {
        return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
    }


    //----------------------------------------------------------------------------- 
    normalize() {
        let magnitude = this.length();
        if (magnitude > 0) {
            this.x /= magnitude;
            this.y /= magnitude;
            this.z /= magnitude;
            this.w /= magnitude;
        }
        return this;
    }

    multiplyScalar(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;
        this.w *= scalar;
        return this;
    }

    rescale(newScale) {
        let len = this.length();
        if (len > 0) {
            len = newScale / len;
            this.x *= len;
            this.y *= len;
            this.z *= len;
            this.w *= len;
        }
        return this;
    }


    //-----------------------------------------------------------------------------
    distance(other) {
        let x = this.x - other.x;
        let y = this.y - other.y;
        let z = this.z - other.z;
        return Math.sqrt(x*x + y*y + z*z);
    }

    //-----------------------------------------------------------------------------
    toString() {
        return "(" + this.x + ", " + this.y + ", " + this.z + ", " + this.w + ")";
    }



    //----------------------------------------------------------------------------- 
    static dot(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z + v1.w * v2.w;
    }

    static cross(v1, v2) {
        return new Vector4(
            v1.y * v2.z - v1.z * v2.y,
            v1.z * v2.x - v1.x * v2.z,
            v1.x * v2.y - v1.y * v2.x,
            0
        );
    }

    //----------------------------------------------------------------------------- 
    static fromTo(fromPoint, toPoint) {
        return toPoint.clone().subtract(fromPoint);
    }

    //----------------------------------------------------------------------------- 
    static project(vectorToProject, otherVector) {
        if (!(vectorToProject instanceof Vector4) || !(otherVector instanceof Vector4)) 
            throw new Error("Both arguments must be instances of Vector4");

        const other01 = otherVector.clone().normalize();
        const projectionLength = vectorToProject.dot(other01);
        return other01.multiplyScalar(projectionLength);
    }
}
