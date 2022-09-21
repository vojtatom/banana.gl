import * as THREE from 'three';


const vs3D = `
//BEGIN BananaGL Attributes and Uniforms
attribute vec3 positionStart;
attribute vec3 positionEnd;
uniform float time;
uniform float timeStart;
uniform float timeEnd;
//END BananaGL Attributes and Uniforms

void main(){
	fscolor = color;
	vec3 transformed = position;
	
	//BEGIN BananaGL extension
    vec3 dir = positionEnd - positionStart;
    float t = (time - timeStart) / (timeEnd - timeStart);
    transformed += positionStart + t * dir;
    //END BananaGL extension
	
	gl_Position = projectionMatrix * (modelViewMatrix * vec4( transformed, 1.0));
}`;

const fs3D = `
void main() {
	gl_FragColor = vec4(1.0, 1.0, 1.0, 0.9);
}`;


export function agentMaterial() {
	return new THREE.ShaderMaterial({
		uniforms: {
            time: { value: 0 },
            timeStart: { value: 0 },
            timeEnd: { value: 1 },
		},
		vertexShader: vs3D,
		fragmentShader: fs3D,
		side: THREE.DoubleSide,
		transparent: false
	});
}