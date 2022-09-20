import * as THREE from 'three';

const vertex = /* glsl */`

//BEGIN BananaGL Attributes and Uniforms
attribute vec3 lineStart;
attribute vec3 lineEnd;
uniform float zoffset;
uniform float thickness;
//END BananaGL Attributes and Uniforms

#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
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
	#include <morphcolor_vertex>

	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )

		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>

	#endif

	#include <begin_vertex>  //variable "transformed" contains location

    //BEGIN BananaGL extension
    vec3 dir = lineEnd - lineStart;
    float dist = length(dir);
    mat4 rot = getRotationMat(dir);
	float end = float(transformed.x >= 0.9);
	transformed.x = end * (dist + (transformed.x - 1.0) * thickness) + (1.0 - end) * transformed.x * thickness; //subtract one because its the original length of the template line
	transformed.y *= thickness;
    transformed = lineStart + (rot * vec4(transformed, 1.0)).xyz;
	transformed.z += zoffset;
    //END BananaGL extension

	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>

	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>

}
`;

const fragment = /* glsl */`
uniform vec3 diffuse;
uniform float opacity;

#ifndef FLAT_SHADED

	varying vec3 vNormal;

#endif

#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

void main() {

	#include <clipping_planes_fragment>

	vec4 diffuseColor = vec4( diffuse, opacity );

	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <specularmap_fragment>

	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );

	// accumulation (baked indirect lighting only)
	#ifdef USE_LIGHTMAP

		vec4 lightMapTexel = texture2D( lightMap, vUv2 );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;

	#else

		reflectedLight.indirectDiffuse += vec3( 1.0 );

	#endif

	// modulation
	#include <aomap_fragment>

	reflectedLight.indirectDiffuse *= diffuseColor.rgb;

	vec3 outgoingLight = reflectedLight.indirectDiffuse;

	#include <envmap_fragment>

	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>

}
`;


export function lineMaterial() {
	const customUniforms = THREE.UniformsUtils.merge([
		THREE.ShaderLib.basic.uniforms,
		{ zoffset: { value: 1 } },
		{ thickness: { value: 1 } },
	]);

	return new THREE.ShaderMaterial({
		uniforms: customUniforms,
		vertexShader: vertex,
		fragmentShader: fragment,
		side: THREE.DoubleSide,
		//lights: true,
		name: 'custom-line-material'
	});
}