class Vector3
{
    constructor(x, y, z) {
        this.set(x, y, z);
    }
    
    static zero = new Vector3(0,0,0);
    static up = new Vector3(0,1,0);
    static down = new Vector3(0,-1,0);
    static right = new Vector3(1,0,0);
    static left = new Vector3(-1,0,0);
    static forward = new Vector3(0,0,1);
    static back = new Vector3(0,0,-1);


    //-----------------------------------------------------------------------------
    set(x, y, z) {
        this.x = Number.isFinite(x) ? x : 0;
        this.y = Number.isFinite(y) ? y : 0;
        this.z = Number.isFinite(z) ? z : 0;
        return this;
    }

    clone() {
        return new Vector3(this.x, this.y, this.z);
    }

    copy(other) {
        this.x = other.x;
        this.y = other.y;
        this.z = other.z;
        return this;
    }

    getVector4(w) {
        return new Vector4(this.x, this.y, this.z, w);
    }


    //-----------------------------------------------------------------------------
    negate() {
        this.x = -this.x;
        this.y = -this.y;
        this.z = -this.z;
        return this;
    }

    add(v) {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        return this;
    }

    subtract(v) {
        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;
        return this;
    }


    //-----------------------------------------------------------------------------
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    lengthSqr() {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }


    //-----------------------------------------------------------------------------
    normalize() {
        let magnitude = this.length();
        if (magnitude > 0) {
            this.x /= magnitude;
            this.y /= magnitude;
            this.z /= magnitude;
        }
        return this;
    }

    multiplyScalar(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;
        return this;
    }

    rescale(newScale) {
        let len = this.length();
        if (len > 0) {
            len = newScale / len;
            this.x *= len;
            this.y *= len;
            this.z *= len;
        }
        return this;
    }


    //-----------------------------------------------------------------------------
    toString() {
        return "(" + this.x + ", " + this.y + ", " + this.z + ")";
    }



    //-----------------------------------------------------------------------------
    static distance(v1, v2) {
        let x = v1.x - v2.x;
        let y = v1.y - v2.y;
        let z = v1.z - v2.z;
        return Math.sqrt(x*x + y*y + z*z);
    }
    

    //-----------------------------------------------------------------------------
    static dot(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    }

    static cross(v1, v2) {
        return new Vector3(
            v1.y * v2.z - v1.z * v2.y,
            v1.z * v2.x - v1.x * v2.z,
            v1.x * v2.y - v1.y * v2.x
        );
    }


    //-----------------------------------------------------------------------------
    static fromTo(fromPoint, toPoint) {
        return new Vector3(toPoint.x - fromPoint.x, toPoint.y - fromPoint.y, toPoint.z - fromPoint.z);
    }

    static fromToNormalized(fromPoint, toPoint) {
        let distance = distance(fromPoint, toPoint);
        let x = (toPoint.x - fromPoint.x) / distance;
        let y = (toPoint.y - fromPoint.y) / distance;
        let z = (toPoint.z - fromPoint.z) / distance;
        return new Vector3(x, y, z);
    }


    //-----------------------------------------------------------------------------
    static angle(v1, v2) {
        var length = v1.length() * v2.length();
        if (length <= 0) return 0;
        return Math.acos(this.dot(v1, v2) / length) * 180/Math.PI;
    }

    static project(vectorToProject, otherVector) {
        let length = otherVector.length();
        if (length <= 0)
            return null;
        length = this.dot(vectorToProject, otherVector) / length;
        return otherVector.clone().rescale(length);
    }


    //-----------------------------------------------------------------------------
    static reflect(vectorIn, normal) {
        let factor = 2 * this.dot(vectorIn, normal);
        return vectorIn.clone().subtract(normal.clone().multiplyScalar(factor));
    }

    static refract(vectorIn, normal, eta) {
        let cosTheta = Math.max(-1, Math.min(1, this.dot(vectorIn, normal)));
        let rOutPerp, rOutParallel;
        
        if (cosTheta < 0) {
            cosTheta = -cosTheta;
        } else {
            normal = normal.clone().negate();
        }

        let rOutPerpFactor = eta;
        let rOutParallelFactor = 1 - rOutPerpFactor * rOutPerpFactor * (1 - cosTheta * cosTheta);

        if (rOutParallelFactor < 0) {
            return null;
        }

        rOutPerp = vectorIn.clone().add(normal.clone().multiplyScalar(cosTheta)).multiplyScalar(rOutPerpFactor);
        rOutParallel = normal.clone().multiplyScalar(-Math.sqrt(rOutParallelFactor));
        return rOutPerp.add(rOutParallel);
    }


    //-----------------------------------------------------------------------------
    static randomUnitVector() {
        let theta = Math.random() * 2 * Math.PI;
        let z = Math.random() * 2 - 1;
        let r = Math.sqrt(1 - z * z);
        let x = r * Math.cos(theta);
        let y = r * Math.sin(theta);
        return new Vector3(x, y, z);
    }

    static randomHemisphere(normal) {
        let randomVec = Vector3.randomUnitVector();
        if (this.dot(randomVec, normal) < 0) {
            randomVec = randomVec.negate();
        }
        return randomVec;
    }
}

