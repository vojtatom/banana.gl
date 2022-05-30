import { Button, Heading, Pane, Paragraph, SelectMenu } from 'evergreen-ui';
import { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router';
import { toast } from 'react-toastify';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import iaxios from '../../axios';
import { MapControls } from '../../engine/renderer/controls';
import { apiurl } from '../../url';

const CANVASMARGIN = 100;

const legoHIGH = `
# Blender v2.93.5 OBJ File: ''
# www.blender.org
o pCylinder6_Mesh
v 0.057064 0.061065 -0.000001
v 7.942935 0.061065 -0.000001
v 0.057064 7.946936 0.000001
v 7.942935 7.946936 0.000001
v 6.305408 4.965252 9.599999
v 6.489283 4.003999 9.599999
v 6.305408 3.042744 9.599999
v 4.961254 1.698590 9.599999
v 3.038745 1.698590 9.599999
v 2.218222 2.222222 9.599999
v 1.694591 3.042745 9.599999
v 1.510716 4.004000 9.599999
v 1.694591 4.965254 9.599999
v 3.038746 6.309407 9.599999
v 4.000000 6.493282 9.599999
v 4.961255 6.309406 9.599999
v 5.781777 5.785775 9.599999
v 5.697057 5.701054 9.677279
v 4.918441 6.221309 9.677279
v 3.081560 6.221310 9.677279
v 1.782689 4.922440 9.677279
v 1.600000 4.003999 9.677279
v 1.782688 3.085559 9.677279
v 2.302943 2.306943 9.677279
v 3.081559 1.786688 9.677279
v 4.918439 1.786688 9.677279
v 6.217310 3.085558 9.677279
v 6.399999 4.003999 9.677279
v 6.217310 4.922438 9.677279
v 7.899988 0.102690 9.599998
v 7.948085 5.975600 9.599999
v 7.941407 7.945406 9.600000
v 4.000000 7.954429 9.600000
v 0.058592 7.945406 9.600000
v 0.058592 0.062591 9.599998
v 6.399999 4.003998 11.116522
v 6.217310 3.085558 11.116522
v 4.918439 1.786687 11.116522
v 3.999999 1.603998 11.116522
v 3.081559 1.786688 11.116522
v 2.302943 2.306942 11.116522
v 1.782688 3.085559 11.116522
v 1.600000 4.003999 11.116522
v 1.782689 4.922440 11.116522
v 3.081560 6.221310 11.116522
v 4.918441 6.221309 11.116522
v 5.697057 5.701054 11.116522
v 5.636730 5.640727 11.200000
v 4.885792 6.142488 11.200000
v 3.114209 6.142488 11.200000
v 1.861510 4.889791 11.200000
v 1.861509 3.118207 11.200000
v 2.363270 2.367270 11.200000
v 3.999999 1.689313 11.200000
v 4.885791 1.865508 11.200000
v 6.138489 3.118207 11.200000
v 6.314684 4.003998 11.200000
v 0.128480 8.003999 9.475410
v 7.871519 8.003999 9.475410
v 0.128480 8.004000 0.075381
v 7.871519 8.004000 0.075381
v -0.000001 7.888550 0.075381
v -0.000001 0.119451 0.075380
v -0.000001 7.888548 9.475410
v -0.000001 0.119449 9.475408
v 0.081614 0.004000 0.075380
v 7.918385 0.004000 0.075380
v 0.081614 0.003999 9.475408
v 7.918385 0.003999 9.475408
v 8.000000 7.923712 0.075381
v 8.000000 7.923710 9.475410
v 8.000000 0.084287 9.475408
v 8.000000 0.084289 0.075380
s 1
f 46 20 45
f 44 20 21
f 46 50 49
f 2 66 1
f 53 40 54
f 36 27 28
f 40 24 25
f 43 21 22
f 31 30 72
f 26 39 25
f 46 18 19
f 63 64 62
f 27 7 6
f 19 16 15
f 17 18 5
f 21 13 12
f 14 21 20
f 30 68 69
f 16 17 32
f 37 26 27
f 43 42 52
f 56 36 57
f 55 39 38
f 58 61 60
f 51 45 44
f 53 42 41
f 1 62 3
f 9 26 25
f 64 35 34
f 67 68 66
f 72 30 69
f 73 4 70
f 67 2 73
f 62 64 60
f 58 34 33
f 23 24 41
f 71 70 59
f 24 11 10
f 7 26 8
f 66 68 63
f 29 18 47
f 51 55 57
f 35 9 10
f 55 37 56
f 48 46 49
f 61 3 60
f 71 73 70
f 57 47 48
f 46 19 20
f 44 45 20
f 46 45 50
f 2 67 66
f 41 40 53
f 40 39 54
f 36 37 27
f 40 41 24
f 43 44 21
f 72 71 31
f 71 32 31
f 38 39 26
f 39 40 25
f 46 47 18
f 63 65 64
f 5 29 6
f 29 28 6
f 28 27 6
f 14 20 15
f 20 19 15
f 17 16 18
f 16 19 18
f 18 29 5
f 11 23 12
f 23 22 12
f 22 21 12
f 14 13 21
f 30 35 68
f 31 32 17
f 32 33 16
f 33 15 16
f 37 38 26
f 52 51 43
f 51 44 43
f 56 37 36
f 55 54 39
f 58 59 61
f 51 50 45
f 53 52 42
f 1 63 62
f 9 8 26
f 64 65 35
f 67 69 68
f 73 2 4
f 73 72 69
f 69 67 73
f 34 58 64
f 58 60 64
f 60 3 62
f 33 32 59
f 59 58 33
f 41 42 23
f 42 43 23
f 43 22 23
f 4 61 70
f 61 59 70
f 59 32 71
f 24 23 11
f 10 9 24
f 9 25 24
f 7 27 26
f 35 65 68
f 65 63 68
f 63 1 66
f 47 36 29
f 36 28 29
f 57 48 49
f 49 50 51
f 51 52 53
f 53 54 55
f 55 56 57
f 57 49 51
f 51 53 55
f 14 15 33
f 31 17 5
f 31 5 6
f 14 33 34
f 13 14 34
f 30 31 6
f 30 6 7
f 13 34 12
f 34 35 12
f 30 7 8
f 30 8 9
f 11 12 35
f 10 11 35
f 35 30 9
f 55 38 37
f 48 47 46
f 61 4 3
f 71 72 73
f 57 36 47
`;

const legoLOW = `
# Blender v2.93.5 OBJ File: ''
# www.blender.org
o pCylinder6_Mesh
v 0.057064 0.061065 -0.000001
v 7.942935 0.061065 -0.000001
v 0.057064 7.946936 0.000001
v 7.942935 7.946936 0.000001
v 6.305408 4.965252 3.200000
v 6.489283 4.003999 3.199999
v 6.305408 3.042744 3.199999
v 4.961254 1.698590 3.199999
v 3.038745 1.698590 3.199999
v 2.218222 2.222222 3.199999
v 1.694591 3.042745 3.199999
v 1.510716 4.004000 3.199999
v 1.694591 4.965254 3.200000
v 3.038746 6.309408 3.200000
v 4.000000 6.493282 3.200000
v 4.961255 6.309407 3.200000
v 5.781777 5.785775 3.200000
v 5.697057 5.701054 3.277279
v 4.918441 6.221309 3.277279
v 3.081560 6.221310 3.277279
v 1.782689 4.922440 3.277279
v 1.600000 4.003999 3.277278
v 1.782688 3.085559 3.277278
v 2.302943 2.306943 3.277278
v 3.081559 1.786688 3.277278
v 4.918439 1.786688 3.277278
v 6.217310 3.085558 3.277278
v 6.399999 4.003999 3.277278
v 6.217310 4.922438 3.277279
v 7.899988 0.102690 3.199999
v 7.948085 5.975600 3.200000
v 7.941407 7.945406 3.200000
v 4.000000 7.954429 3.200000
v 0.058592 7.945406 3.200000
v 0.058592 0.062591 3.199999
v 6.399999 4.003998 4.716522
v 6.217310 3.085558 4.716522
v 4.918439 1.786688 4.716521
v 3.999999 1.603999 4.716521
v 3.081559 1.786688 4.716521
v 2.302943 2.306942 4.716521
v 1.782688 3.085559 4.716522
v 1.600000 4.003999 4.716522
v 1.782689 4.922440 4.716522
v 3.081560 6.221310 4.716522
v 4.918441 6.221309 4.716522
v 5.697057 5.701054 4.716522
v 5.636730 5.640727 4.800000
v 4.885792 6.142488 4.800000
v 3.114209 6.142488 4.800000
v 1.861510 4.889791 4.800000
v 1.861509 3.118207 4.800000
v 2.363270 2.367270 4.799999
v 3.999999 1.689314 4.799999
v 4.885791 1.865509 4.799999
v 6.138489 3.118207 4.800000
v 6.314684 4.003998 4.800000
v 0.128480 8.003999 3.075409
v 7.871519 8.003999 3.075409
v 0.128480 8.004000 0.075381
v 7.871519 8.004000 0.075381
v -0.000001 7.888550 0.075381
v -0.000001 0.119451 0.075380
v -0.000001 7.888548 3.075409
v -0.000001 0.119449 3.075408
v 0.081614 0.004000 0.075380
v 7.918385 0.004000 0.075380
v 0.081614 0.003999 3.075408
v 7.918385 0.003999 3.075408
v 8.000000 7.923712 0.075381
v 8.000000 7.923710 3.075409
v 8.000000 0.084287 3.075408
v 8.000000 0.084289 0.075380
s 1
f 46 20 45
f 44 20 21
f 46 50 49
f 2 66 1
f 53 40 54
f 36 27 28
f 40 24 25
f 43 21 22
f 31 30 72
f 26 39 25
f 46 18 19
f 63 64 62
f 27 7 6
f 19 16 15
f 17 18 5
f 21 13 12
f 14 21 20
f 30 68 69
f 16 17 32
f 37 26 27
f 43 42 52
f 56 36 57
f 55 39 38
f 58 61 60
f 51 45 44
f 53 42 41
f 1 62 3
f 9 26 25
f 64 35 34
f 67 68 66
f 72 30 69
f 73 4 70
f 67 2 73
f 62 64 60
f 58 34 33
f 23 24 41
f 71 70 59
f 24 11 10
f 7 26 8
f 66 68 63
f 29 18 47
f 51 55 57
f 35 9 10
f 55 37 56
f 48 46 49
f 61 3 60
f 71 73 70
f 57 47 48
f 46 19 20
f 44 45 20
f 46 45 50
f 2 67 66
f 41 40 53
f 40 39 54
f 36 37 27
f 40 41 24
f 43 44 21
f 72 71 31
f 71 32 31
f 38 39 26
f 39 40 25
f 46 47 18
f 63 65 64
f 5 29 6
f 29 28 6
f 28 27 6
f 14 20 15
f 20 19 15
f 17 16 18
f 16 19 18
f 18 29 5
f 11 23 12
f 23 22 12
f 22 21 12
f 14 13 21
f 30 35 68
f 31 32 17
f 32 33 16
f 33 15 16
f 37 38 26
f 52 51 43
f 51 44 43
f 56 37 36
f 55 54 39
f 58 59 61
f 51 50 45
f 53 52 42
f 1 63 62
f 9 8 26
f 64 65 35
f 67 69 68
f 73 2 4
f 73 72 69
f 69 67 73
f 34 58 64
f 58 60 64
f 60 3 62
f 33 32 59
f 59 58 33
f 41 42 23
f 42 43 23
f 43 22 23
f 4 61 70
f 61 59 70
f 59 32 71
f 24 23 11
f 10 9 24
f 9 25 24
f 7 27 26
f 35 65 68
f 65 63 68
f 63 1 66
f 47 36 29
f 36 28 29
f 57 48 49
f 49 50 51
f 51 52 53
f 53 54 55
f 55 56 57
f 57 49 51
f 51 53 55
f 14 15 33
f 31 17 5
f 31 5 6
f 14 33 34
f 13 14 34
f 30 31 6
f 30 6 7
f 13 34 12
f 34 35 12
f 30 7 8
f 30 8 9
f 11 12 35
f 10 11 35
f 35 30 9
f 55 38 37
f 48 47 46
f 61 4 3
f 71 72 73
f 57 36 47
`;

const horizontal_dim = 8;

export const vertex = /* glsl */`
#define PHONG

varying vec3 vViewPosition;
varying float topLayer;
varying float height_color;

uniform float vertical_dim;
uniform float max_layer;
uniform float top_layer;


#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

void main() {

	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>

	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>

	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>

    vec4 mvPosition = vec4( transformed, 1.0 );

    #ifdef USE_INSTANCING

        mvPosition = instanceMatrix * mvPosition;
        height_color = min(float(int(abs(mvPosition.z + vertical_dim / 3.0) * 10.0) / int(vertical_dim * 10.0)) / top_layer + 0.3, 1.0);
        topLayer = float(int(abs(mvPosition.z + vertical_dim / 3.0) * 10.0) / int(vertical_dim * 10.0) / int(top_layer));

    #endif

    mvPosition = modelViewMatrix * mvPosition;

    gl_Position = projectionMatrix * mvPosition;

	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>

	vViewPosition = - mvPosition.xyz;

	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>

}
`;

export const fragment = /* glsl */`
#define PHONG

uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;

varying float height_color;
varying float topLayer;

#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

void main() {

	#include <clipping_planes_fragment>


	vec4 diffuseColor = vec4( diffuse * vec3(height_color, height_color, height_color), opacity );
    if (topLayer > 0.1) {
        diffuseColor = vec4(vec3(0.9, 1.0, 1.0), 1.0);
    }
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;

	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>

	// accumulation
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>

	// modulation
	#include <aomap_fragment>

	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;

	#include <envmap_fragment>
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}
`;


export function legoShader() {

	const customUniforms = THREE.UniformsUtils.merge([
		THREE.ShaderLib.phong.uniforms,
        {
            vertical_dim: { value: 3.2 },
            max_layer: { value: 4 },
            top_layer: { value: 4 },
        }
	]);

	return new THREE.ShaderMaterial({
		uniforms: customUniforms,
		vertexShader: vertex,
		fragmentShader: fragment,
		lights: true,
		side: THREE.DoubleSide,
		name: 'custom-lego-material'
	});
}



class LegoEngine {
    renderer: THREE.WebGLRenderer;
    composer: EffectComposer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    controls: MapControls;
    //csm: CSM;
    layers: THREE.InstancedMesh[];
    shader: THREE.ShaderMaterial;
    changed = false;

    constructor(canvas: HTMLCanvasElement) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / (window.innerHeight - CANVASMARGIN), 0.1, 2000);
        this.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setClearColor(0xeeeeee, 1);
        this.controls = new MapControls(this.camera, this.renderer.domElement);
        this.controls.minDistance = 10;
        this.controls.update();
        const hemilight = new THREE.HemisphereLight(0xffffff, 0xEEEEFF, 0.7);
        const dirlight = new THREE.DirectionalLight(0xffffff, 0.2);
        dirlight.position.set(1, 1, 1);
        this.scene.add(dirlight);
        this.scene.add(hemilight);
        
        this.shader = legoShader();
        this.renderer.setSize(window.innerWidth, window.innerHeight - CANVASMARGIN);
        this.composer = new EffectComposer( this.renderer );
        const renderPass = new RenderPass( this.scene, this.camera );
        this.composer.addPass( renderPass );
        this.layers = [];


        this.controls.addEventListener('change', () => {
            this.changed = true;
        });

        const animate = () => {
            if (!this.changed)
                return;
            
            this.controls.update();
            this.renderer.render(this.scene, this.camera);
            this.changed = false;
        }

        this.renderer.setAnimationLoop(animate);

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / (window.innerHeight - CANVASMARGIN);
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight - CANVASMARGIN);
        }, false);



        animate();
    }

    generateLegoModel(heightmap: number[][], vertical_dim: number, tileSize: number, tileSpacing: number, topLayer: number, setupCamera: boolean = false) {
        let map;
        if (vertical_dim > 3.2) {
            map = this.round2Darray(heightmap);
        } else {
            map = heightmap;
        }
        
        const maxLayer = this.max2Darray(map);
        for (let i = 0; i < maxLayer; i++)
            this.initLayer(map, i, vertical_dim, tileSize, tileSpacing);

        if (setupCamera)
            this.setCamera(map, maxLayer, vertical_dim);

        this.showLayer(topLayer);
        this.shader.uniforms.vertical_dim.value = vertical_dim;
        this.shader.uniforms.max_layer.value = maxLayer;
        this.shader.needsUpdate = true;
        this.changed = true;
        return maxLayer;
    }

    private getInstancedUnitModel(instanceCount: number, vertical_dim: number) {
        //const geometry = new THREE.BoxGeometry(horizontal_dim, horizontal_dim, vertical_dim);


        const loader = new OBJLoader();
        let model;
        if (vertical_dim > 3.2) {
            model = loader.parse(legoHIGH);
        } else {
            model = loader.parse(legoLOW);    
        }

        const material = this.shader;
        const geometry = (model.children[0] as any).geometry.clone();

        model.remove();
        
        const cube = new THREE.InstancedMesh(geometry, material, instanceCount);
        return cube;
    }

    private max2Darray(arr: number[][]) {
        return arr.reduce((acc, cur) => Math.max(acc, cur.reduce((acc, cur) => Math.max(acc, cur), 0)), 0);
    }

    private round2Darray(arr: number[][]) {
        return arr.map(row => row.map(val => Math.round(val / 3)));
    }

    private generatePositionsForLayer(heightmap: number[][], layer: number, vertical_dim: number, tileSize: number, tileSpacing: number) {
        const positions: THREE.Vector3[] = [];
        let xgroupoff, ygroupoff;
        for (let i = 0; i < heightmap.length; i++) {
            for (let j = 0; j < heightmap[i].length; j++) {
                if (heightmap[i][j] >= layer) {
                    xgroupoff = Math.floor(i / tileSize) * tileSpacing * horizontal_dim;
                    ygroupoff = Math.floor(j / tileSize) * tileSpacing * horizontal_dim;
                    positions.push(new THREE.Vector3(j * horizontal_dim + ygroupoff, -i * horizontal_dim - xgroupoff, layer * vertical_dim));
                } 
            }
        }
        return positions;
    }

    private setCamera(heightmap: number[][], maxLayer: number, vertical_dim: number, ) {
        this.camera.position.z = maxLayer * vertical_dim + 100;
        this.camera.position.y = -heightmap.length * horizontal_dim / 2;
        this.camera.position.x = heightmap[0].length * horizontal_dim / 2;
        this.controls.target.set(heightmap[0].length * horizontal_dim / 2, -heightmap.length * horizontal_dim / 2, 0);
    }


    private initLayer(heightmap: number[][], layer: number, vertical_dim: number, tileSize: number, tileSpacing: number) {
        const positions = this.generatePositionsForLayer(heightmap, layer, vertical_dim, tileSize, tileSpacing);
        const instanceModel = this.getInstancedUnitModel(positions.length, vertical_dim);
        this.layers.push(instanceModel);

        var dummy = new THREE.Object3D();
        for (var i = 0; i < positions.length; i++) { // Iterate and offset x pos
            dummy.position.copy(positions[i]);
            dummy.updateMatrix();
            instanceModel.setMatrixAt(i, dummy.matrix);
        }

        instanceModel.instanceMatrix.needsUpdate = true;
        instanceModel.castShadow = true;
        instanceModel.receiveShadow = true;
        this.scene.add(instanceModel);
    }

    showLayer(index: number) {
        for (let i = 0; i < this.layers.length; i++) {
            if (i >= index) {
                this.layers[i].visible = false;
            } else {
                this.layers[i].visible = true;
            }
        }

        this.shader.uniforms.top_layer.value = index;
        this.shader.needsUpdate = true;
        this.changed = true;
    }

    remove() {
        for (let i = 0; i < this.layers.length; i++) {
            this.scene.remove(this.layers[i]);
        }
        this.layers = [];
        this.changed = true;
    }
}


function getLayout(exportID: string, box_size: number, callback: (layout: any) => void) {
    iaxios.get(`${apiurl.EXPORTDATA}${exportID}/lego${box_size}.json`).then(res => {
        callback(res.data);
    });
}

export function ExportLego(props: { start: [number, number], end: [number, number], project: string, exportID: string, unit_precision: number, box_filter_size_range: [number, number], box_filter_step: number }) {
    const { start, end, project, exportID, unit_precision, box_filter_size_range, box_filter_step } = props;
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const boxFilterOptions = Array.from(Array(Math.floor((box_filter_size_range[1] - box_filter_size_range[0]) / box_filter_step)), (x, i) => box_filter_size_range[0] + i * box_filter_step);
    const [boxFilter, setBoxFilter] = useState(boxFilterOptions[boxFilterOptions.length - 1]);
    const verticalResolutionOptions = [3.2, 9.6];
    const [verticalResolution, setVerticalResolution] = useState(verticalResolutionOptions[0]);
    const tileSpacingOptions = [0, 1, 2, 4, 8, 16, 32];
    const [tileSpacing, setTileSpacing] = useState(0);
    const tileSizeOptions = [4, 8, 16, 32];
    const [tileSize, setTileSize] = useState(8);
    const [maxLayer, setMaxLayer] = useState(0);
    const [topLayer, setTopLayer] = useState(0);
    const [engine, setEngine] = useState<LegoEngine>();
    let history = useHistory();

    const [legoResolution, setLegoResolution] = useState<any>();
    const [modelSize, setModelSize] = useState<any>();


    useEffect(() => {
        if (canvasRef.current) {
            const engine = new LegoEngine(canvasRef.current);
            setEngine(engine);
            getLayout(exportID, boxFilter, (layout) => {
                if (engine) {
                    engine.remove();
                    const ml = engine.generateLegoModel(layout.map, verticalResolution, tileSize, tileSpacing, topLayer, true);
                    setMaxLayer(ml);
                    setTopLayer(ml + 1);
                    setLegoResolution(layout.lego_size);
                    setModelSize(layout.model_size_mm);
                }
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canvasRef]);


    useEffect(() => {
        getLayout(exportID, boxFilter, (layout) => {
            if (engine) {
                engine.remove();
                const ml = engine.generateLegoModel(layout.map, verticalResolution, tileSize, tileSpacing, topLayer);
                setMaxLayer(ml);
                setTopLayer(ml + 1);
                setLegoResolution(layout.lego_size);
                setModelSize(layout.model_size_mm);
            }
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [verticalResolution, tileSize, tileSpacing]);

    useEffect(() => {
        getLayout(exportID, boxFilter, (layout) => {
            if (engine) {
                engine.remove();
                const ml = engine.generateLegoModel(layout.map, verticalResolution, tileSize, tileSpacing, topLayer);
                setMaxLayer(ml);
                setTopLayer(ml + 1);
                engine.showLayer(topLayer);
                setLegoResolution(layout.lego_size);
                setModelSize(layout.model_size_mm);
            }
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [boxFilter]);


    useEffect(() => {
        if (engine) {
            engine.showLayer(topLayer);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [topLayer]);
    
    const deleteExport = () => {
        iaxios.delete(`${apiurl.EXPORT}${exportID}`).then(res => {
            toast.success("Export deleted");
            history.push(`/`);
        }).catch(err => {
            toast.error("Error deleting export");
        });
    };

    const format = (num: number, decimals=2) => {
        return num.toFixed(decimals);
    };

    return (

        <Pane className="lego-page">
            <Pane className="export-description page">
                <Heading marginBottom={16}>Lego Model {exportID}</Heading>
                <Paragraph marginBottom={16}>Your Lego export is ready.</Paragraph>
                <Button appearance="primary" intent="danger" onClick={deleteExport} marginTop={20} marginBottom={40}>
                    Delete
                </Button>
                <Paragraph marginBottom={16} size={300}>You can also share this export with others, this page is publicly available. Once you don't need it anymore, please consider deleting it from the server and helping us to save disk space. The export might also get deleted after a while automatically.</Paragraph>
                <Pane className="field">
                    <Heading size={100}>Project</Heading>
                    <Pane className="values">
                        {project}
                    </Pane>
                </Pane>
                <Pane className="field">
                    <Heading size={100}>Start coordinate</Heading>
                    <Pane className="values">
                        {format(start[0])} {format(start[1])}
                    </Pane>
                </Pane>
                <Pane className="field">
                    <Heading size={100}>End coordinate</Heading>
                    <Pane className="values">
                        {format(end[0])} {format(end[1])}
                    </Pane>
                </Pane>

                <Heading marginBottom={32} marginTop={32}>Current setup</Heading>
                <Pane className="field">
                    <Heading size={100}>General</Heading>
                    <Pane className="values">
                        1 Lego block is {boxFilter / unit_precision} units (coordinate units)
                    </Pane>
                </Pane>
                <Pane className="field">
                    <Heading size={100}>Model dimensions</Heading>
                    <Pane className="values">
                        {modelSize ? (`${format(modelSize.x)} x ${format(modelSize.y)} x ${format(maxLayer * verticalResolution)} mm`) : "loading..."}
                    </Pane>
                </Pane>
                <Pane className="field">
                    <Heading size={100}>Lego resolution</Heading>
                    <Pane className="values">
                        {legoResolution ? (`${format(legoResolution.x, 0)} x ${format(legoResolution.y, 0)} x ${format(maxLayer, 0)} bricks`) : "loading..."}
                    </Pane>
                </Pane>
            </Pane>  

            <Pane className="lego-controls">
                <SelectMenu
                    title="Lego brick resolution"
                    options={boxFilterOptions.map((value) => ({ label: `1 brick is ${value / unit_precision} units`, value: value }))}
                    selected={`1 brick is ${boxFilter / unit_precision} units`}
                    hasFilter={false}
                    onSelect={(item) => setBoxFilter(item.value as number)}>
                    <Button appearance="minimal">{`Horizontal step: 1 brick is ${boxFilter / unit_precision} units`}</Button>
                </SelectMenu>
                <SelectMenu
                    title="Vertical resolution"
                    options={verticalResolutionOptions.map((value) => ({ label: `${value} mm bricks`, value: value }))}
                    selected={`${verticalResolution} mm bricks`}
                    hasFilter={false}
                    onSelect={(item) => setVerticalResolution(item.value as number)}>
                    <Button appearance="minimal">{`Vertical step: ${verticalResolution} mm bricks`}</Button>
                </SelectMenu>
                <SelectMenu
                    title="Tile spacing"
                    options={tileSpacingOptions.map((value) => ({ label: `${value} bricks`, value: value }))}
                    selected={`${tileSpacing} bricks`}
                    hasFilter={false}
                    onSelect={(item) => setTileSpacing(item.value as number)}>
                        <Button appearance="minimal">{`Tile spacing: ${tileSpacing} bricks`}</Button>
                </SelectMenu>
                <SelectMenu
                    title="Tile size"
                    options={tileSizeOptions.map((value) => ({ label: `${value} bricks`, value: value }))}
                    selected={`${tileSize} bricks`}
                    hasFilter={false}
                    onSelect={(item) => setTileSize(item.value as number)}>
                    <Button appearance="minimal" disabled={tileSpacing === 0}>{`Tile size: ${tileSize} bricks`}</Button> 
                </SelectMenu>
                <SelectMenu
                    title="Show Layer"
                    options={[{label: "All", value: maxLayer + 1}].concat(Array.from(Array(maxLayer), (x, i) => ({ label: `${i + 1}`, value: i + 1 })))}
                    selected={`${topLayer}`}
                    hasFilter={false}
                    onSelect={(item) => setTopLayer(item.value as number)}>
                        <Button appearance="minimal">{`Show layer: ${topLayer}`}</Button>
                </SelectMenu>
            </Pane>          

            <canvas ref={canvasRef}></canvas>

        </Pane>
    )
}
