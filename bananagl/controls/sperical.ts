import { vec3 } from 'gl-matrix';

function clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, value));
}

export class Spherical {
    constructor(public radius = 1, public phi = 0, public theta = 0) {
        this.radius = radius;
        this.phi = phi; // polar angle
        this.theta = theta; // azimuthal angle
        return this;
    }

    set(radius: number, phi: number, theta: number) {
        this.radius = radius;
        this.phi = phi;
        this.theta = theta;
        return this;
    }

    copy(other: Spherical) {
        this.radius = other.radius;
        this.phi = other.phi;
        this.theta = other.theta;
        return this;
    }

    // restrict phi to be between EPS and PI-EPS
    makeSafe() {
        const EPS = 0.000001;
        this.phi = Math.max(EPS, Math.min(Math.PI - EPS, this.phi));
        return this;
    }

    setFromVector3(v: vec3) {
        return this.setFromCartesianCoords(v[0], v[1], v[2]);
    }

    setFromCartesianCoords(x: number, y: number, z: number) {
        this.radius = Math.sqrt(x * x + y * y + z * z);

        if (this.radius === 0) {
            this.theta = 0;
            this.phi = 0;
        } else {
            this.theta = Math.atan2(x, z);
            this.phi = Math.acos(clamp(y / this.radius, -1, 1));
        }

        return this;
    }

    clone() {
        return new Spherical(this.radius, this.phi, this.theta);
    }
}
