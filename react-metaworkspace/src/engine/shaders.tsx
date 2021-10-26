import * as THREE from 'three';

export const PHONG_SELECT_VERT = `
#define PHONG

varying vec3 vViewPosition;

uniform vec4 selectedID;

attribute vec4 objectID;
varying vec4 objectIDColor;
varying float varyingObjectID;

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

    int marked = 1;

    for(int i = 0; i < 4; ++i)
        marked *= int(floor(selectedID[i] * 255.0 + 0.5) == floor(objectID[i] * 255.0 + 0.5));

    varyingObjectID = float(marked);
    objectIDColor = objectID;

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
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>

	vViewPosition = - mvPosition.xyz;

	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}
`;


export const PHONG_SELECT_FRAG = `
#define PHONG

uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;

varying float varyingObjectID;
varying vec4 objectIDColor;

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

    vec3 marked = vec3(1.0 * float(varyingObjectID > 0.5));

	vec4 diffuseColor = vec4( diffuse + marked, opacity );
	//vec4 diffuseColor = vec4( objectIDColor.xyz, opacity );
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


export function select_phong_material() {

    const customUniforms = THREE.UniformsUtils.merge([
        THREE.ShaderLib.phong.uniforms,
        { selectedID: { value: [-1, -1, -1, -1] } }
      ]);
    
    return new THREE.ShaderMaterial({
        uniforms: customUniforms,
        vertexShader: PHONG_SELECT_VERT,
        fragmentShader: PHONG_SELECT_FRAG,
        lights: true,
        side: THREE.DoubleSide,
        name: 'custom-material'
    });
}

export const PICK_VERT = `
attribute vec4 objectID;
varying vec4 objectIDColor;

void main() {
    objectIDColor = objectID;
    gl_Position = projectionMatrix * (modelViewMatrix * vec4( position, 1.0 ));
}
`;


export const PICK_FRAG = `
varying vec4 objectIDColor;

void main() {
	gl_FragColor = vec4(objectIDColor);
}
`;


export function picking_material() {

    const customUniforms = THREE.UniformsUtils.merge([]);
    
    return new THREE.ShaderMaterial({
        uniforms: customUniforms,
        vertexShader: PICK_VERT,
        fragmentShader: PICK_FRAG,
        depthTest: true,
        side: THREE.DoubleSide,
        name: 'custom-picking-material'
    });
}