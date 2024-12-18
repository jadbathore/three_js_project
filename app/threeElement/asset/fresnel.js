const { THREE,
	OrbitControls, glb, gltf,
	hdr, img, renderer,
	scene, camera, orbit,
	loader, earthGroup, geo,
	earthMesh, lightMesh, couldsMat,
	cloudMesh, __moon__, moonRotation,
	moonMesh, fresnel, glowmesh,
	star, sunLight, getFresnelMat,
	getStarfield, } = require('../../public/versionning/linkFile.js')


function getFresnelMat({rimHex = 0x0088ff,facingHax = 0x000000} = {})
{
    const uniforms = {
        color1: {value: new THREE.Color(rimHex)},
        color2: {value: new THREE.Color(facingHax)},
        fresnelBias:{value:0.1},
        fresnelScale:{value:1.0},
        fresnelPower:{value:4.0},
    };
    const vs = `
uniform float fresnelBias;
uniform float fresnelScale;
uniform float fresnelPower;

varying float vReflectionFactor;

void main() {
vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
vec4 worldPosition = modelMatrix * vec4( position, 1.0 );

vec3 worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );

vec3 I = worldPosition.xyz - cameraPosition;

vReflectionFactor = fresnelBias + fresnelScale * pow( 1.0 + dot( normalize( I ), worldNormal ), fresnelPower );

gl_Position = projectionMatrix * mvPosition;
}
`;
const fs = `
uniform vec3 color1;
uniform vec3 color2;

varying float vReflectionFactor;

void main() {
float f = clamp( vReflectionFactor, 0.0, 1.0 );
gl_FragColor = vec4(mix(color2, color1, vec3(f)), f);
}
`;
const fresnelMat = new THREE.ShaderMaterial({
uniforms: uniforms,
vertexShader: vs,
fragmentShader: fs,
transparent: true,
blending: THREE.AdditiveBlending,
// wireframe: true,
});
return fresnelMat;
}

const fresnel = getFresnelMat();
const glowmesh = new THREE.Mesh(geo,fresnel);
scene.add(glowmesh);
glowmesh.scale.setScalar(1.02)