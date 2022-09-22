import * as THREE from 'three';


const vs3D = `
//BEGIN BananaGL Attributes and Uniforms
attribute vec3 color;
varying vec3 fscolor;
attribute vec3 lineStart;
attribute vec3 lineEnd;
uniform float thickness;
//END BananaGL Attributes and Uniforms

/**
 * Create rotation matrix from field vector.
 * The returned matrix can rotate vector (1, 0, 0)
 * into the desired setup.
 */
mat4 getRotationMat(vec3 vector)
{
	vec3 unit = vec3(1, 0, 0);
	vec3 f = normalize(vector);
	vec3 cross = cross(f, unit);
	vec3 a = normalize(cross);
	float s = length(cross);

	if (s == 0.0)
	{
		if (f.x == -1.0)
			return mat4(-1.0, 0.0, 0.0, 0.0,
						0.0, -1.0, 0.0, 0.0,
						0.0, 0.0, 1.0, 0.0,
						0.0, 0.0, 0.0, 1.0);
		return mat4(1.0);
	}


	float c = dot(f, unit);
	float oc = 1.0 - c;
	return mat4(oc * a.x * a.x + c,        oc * a.x * a.y - a.z * s,  oc * a.z * a.x + a.y * s,  0.0,
                oc * a.x * a.y + a.z * s,  oc * a.y * a.y + c,        oc * a.y * a.z - a.x * s,  0.0,
                oc * a.z * a.x - a.y * s,  oc * a.y * a.z + a.x * s,  oc * a.z * a.z + c,        0.0,
                0.0,                       0.0,                       0.0,                       1.0);
}

void main(){
	fscolor = color;
	vec3 transformed = position;
	
	//BEGIN BananaGL extension
    vec3 dir = lineEnd - lineStart;
    float dist = length(dir);
    mat4 rot = getRotationMat(dir);
	float end = float(transformed.x >= 0.9);
	float thickness_half = thickness * 0.5;
	transformed.x = end * (dist + (transformed.x - 1.0) * thickness_half) + ((1.0 - end) * transformed.x * thickness_half); //subtract one because its the original length of the template line
	//offset a little to the right
	transformed.y *= thickness_half;
	transformed.y += thickness_half;
    //transformed = lineStart + (vec4(transformed, 1.0)).xyz;
	transformed = lineStart + (rot * vec4(transformed, 1.0)).xyz;
    //END BananaGL extension
	
	gl_Position = projectionMatrix * (modelViewMatrix * vec4( transformed, 1.0));
}`;

const fs3D = `
varying vec3 fscolor;

void main() {
	gl_FragColor = vec4(fscolor, 0.5);
}`;


export function lineMaterial() {
	return new THREE.ShaderMaterial({
		uniforms: {
			zoffset: { value: 1 },
			thickness: { value: 10 }
		},
		vertexShader: vs3D,
		fragmentShader: fs3D,
		side: THREE.DoubleSide,
		transparent: true
	});
}