const { THREE,
	OrbitControls, glb, gltf,
	hdr, img, renderer,
	scene, camera, orbit,
	loader, earthGroup, geo,
	earthMesh, lightMesh, couldsMat,
	cloudMesh, __moon__, moonRotation,
	moonMesh, fresnel, glowmesh,
	star, sunLight, getFresnelMat,
	getStarfield, } = require('../../../public/versionning/linkfile.js')

const earthGroup = new THREE.Group();
earthGroup.rotation.z = -23.4 * Math.PI / 180
scene.add(earthGroup);

const geo = new THREE.IcosahedronGeometry(1,12);
const earthMesh = new THREE.Mesh(
    geo,
    new THREE.MeshPhongMaterial(
        {
            bumpMap:loader.load(img.marsbump1k),
            // specularMap:loader.load(img.marsmap1k),
            map:loader.load(img.mars_1k_color),
            bumpScale:7,
            // shininess:13.0,
            // specular: 0xFFFFFF,
            opacity:2,
        blending: THREE.AdditiveBlending,
        }
    )
)
earthGroup.add(earthMesh)
earthMesh.receiveShadow = true
const lightMesh = new THREE.Mesh(
    geo,
    new THREE.MeshBasicMaterial({
        map:loader.load(img.marsmap1k),
        transparent:true,
        opacity:0.2,
        blendAlpha:20,
        reflectivity:1,
        lightMapIntensity:20,
        blending: THREE.AdditiveBlending,
    })
)
earthGroup.add(lightMesh);

const couldsMat = new THREE.MeshBasicMaterial({
    map:loader.load(img.fair_clouds_8k),
    transparent:true,
    opacity:0.1,
    blending: THREE.AdditiveBlending,
})
const cloudMesh = new THREE.Mesh(
    geo,
    couldsMat
)
// cloudMesh.scale.setScalar(1.01)
// earthGroup.add(cloudMesh);