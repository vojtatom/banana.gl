import * as THREE from 'three';

export const PHONG_SELECT_VERT = `
#define PHONG

varying vec3 vViewPosition;

uniform vec4 selectedID;

attribute vec4 objectID;
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

    vec3 marked = vec3(0.5 * float(varyingObjectID > 0.5));

	vec4 diffuseColor = vec4( diffuse + marked, opacity );
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
		name: 'custom-polygon-material'
	});
}

export const PHONG_LINE_VERT = `
#define PHONG

varying vec3 vViewPosition;

attribute vec3 lineStart;
attribute vec3 lineEnd;
uniform float zoffset;

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
	float c = dot(f, unit);
	float oc = 1.0 - c;
	return mat4(oc * a.x * a.x + c,        oc * a.x * a.y - a.z * s,  oc * a.z * a.x + a.y * s,  0.0,
                oc * a.x * a.y + a.z * s,  oc * a.y * a.y + c,        oc * a.y * a.z - a.x * s,  0.0,
                oc * a.z * a.x - a.y * s,  oc * a.y * a.z + a.x * s,  oc * a.z * a.z + c,        0.0,
                0.0,                       0.0,                       0.0,                       1.0);

}

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

	vec3 dir = lineEnd - lineStart;
    float dist = length(dir);
    mat4 rot = getRotationMat(dir);

	const float thickness = 1.0;
	float end = float(transformed.x >= 0.9);
	transformed.x = end * (dist - 1.0 + transformed.x) + (1.0 - end) * transformed.x; //subtract one because its the original length of the template line
	transformed.y *= thickness;

    transformed = lineStart + (rot * vec4(transformed, 1.0)).xyz;
	transformed.z += zoffset;

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


export const PHONG_LINE_FRAG = `
#define PHONG

uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;

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

	vec4 diffuseColor = vec4( diffuse, opacity );
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


export function line_material() {

	const customUniforms = THREE.UniformsUtils.merge([
		THREE.ShaderLib.phong.uniforms,
		{ zoffset: { value: 1 } }
	]);

	return new THREE.ShaderMaterial({
		uniforms: customUniforms,
		vertexShader: PHONG_LINE_VERT,
		fragmentShader: PHONG_LINE_FRAG,
		side: THREE.DoubleSide,
		lights: true,
		name: 'custom-line-material'
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
		side: THREE.DoubleSide,
		name: 'custom-picking-material'
	});
}