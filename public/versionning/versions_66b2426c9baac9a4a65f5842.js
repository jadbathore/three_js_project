const gltf = {
Bull:'asset/gltf/Bull.gltf',
Deer:'asset/gltf/Deer.gltf',
}

const img = {
earth_nightmap:'asset/img/earth_nightmap.jpg',
earthbump:'asset/img/earthbump.jpg',
earthmap1k:'asset/img/earthmap1k.jpg',
earthspecular:'asset/img/earthspecular.jpg',
fair_clouds_8k:'asset/img/fair_clouds_8k.jpg',
moonbump4k:'asset/img/moonbump4k.jpg',
moonmap4k:'asset/img/moonmap4k.jpg',
singleStar:'asset/img/singleStar.png',
}

//file: configImport.js
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
//file: RendererSetting.js


const renderer = new THREE.WebGLRenderer({antialias:true})
const scene = new THREE.Scene()
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth,window.innerHeight);
document.body.appendChild(renderer.domElement)
//file: cameraSetting.js

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth/window.innerHeight,
    0.1,
    1000
);

camera.position.set(2,2.5,-5);

const orbit = new OrbitControls(camera,renderer.domElement)
orbit.update();
//file: loader.js
const loader = new THREE.TextureLoader();


//file: earthGroup.js

const earthGroup = new THREE.Group();
earthGroup.rotation.z = -23.4 * Math.PI / 180
scene.add(earthGroup);

const geo = new THREE.IcosahedronGeometry(1,12);
const earthMesh = new THREE.Mesh(
    geo,
    new THREE.MeshPhongMaterial(
        {
            bumpMap: loader.load(img.earthbump),
            specularMap: loader.load(img.earthspecular),
            map: loader.load(img.earthmap1k),
            bumpScale:7,
            shininess:13.0,
            specular: 0xFFFFFF,
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
        lightMap:loader.load(img.earth_nightmap),
        transparent:true,
        opacity:0.2,
        blendAlpha:20,
        reflectivity:1,
        lightMapIntensity:10,
        blending: THREE.AdditiveBlending,
    })
)
earthGroup.add(lightMesh);

const couldsMat = new THREE.MeshBasicMaterial({
    map: loader.load(img.fair_clouds_8k),
    transparent:true,
    opacity:0.1,
    blending: THREE.AdditiveBlending,
})
const cloudMesh = new THREE.Mesh(
    geo,
    couldsMat
)
cloudMesh.scale.setScalar(1.01)
earthGroup.add(cloudMesh);
//file: moon.js

const moonRotation = new THREE.Object3D();
scene.add(moonRotation);

const moonMesh = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.27,12),
    new THREE.MeshPhongMaterial({
        map: loader.load(img.moonmap4k),
        bumpMap: loader.load(img.moonbump4k),
        bumpScale:4,
    })
)
moonRotation.add(moonMesh);
moonMesh.position.x = 8
moonMesh.castShadow = true
//file: fresnel.js


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
//file: getStarField.js


function getStarfield({numStar = 500} = {})
{    
    function randomSpherePoint() {
        const raduis = Math.random() * 25 + 25;
        const u = Math.random();
        const v = Math.random();
        const theta = 2 * Math.PI * u;
        const phi  = Math.acos(2*v-1);
        let x = raduis * Math.sin(phi) * Math.cos(theta); 
        let y = raduis * Math.sin(phi) * Math.sin(theta); 
        let z = raduis * Math.cos(phi); 
        return {
            pos: new THREE.Vector3(x,y,z),
            hue:0.6,
            minDist: raduis,
        }
    }
    const verts = [];
    const colors = [];
    const positions = [];
    let col;
    for(let i = 0;i<numStar;i+=1)
        {
            let p = randomSpherePoint();
            const {pos,hue} = p
            positions.push(p);
            col = new THREE.Color().setHSL(hue,0.2,Math.random());
            verts.push(pos.x,pos.y,pos.z);
            colors.push(col.r,col.g,col.b);
        }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position",new THREE.Float32BufferAttribute(verts,3));
    geo.setAttribute("color",new THREE.Float32BufferAttribute(colors,3));
    const mat = new THREE.PointsMaterial({
        size:0.2,
        vertexColors:true,
        map:new THREE.TextureLoader().load(img.singleStar),
        transparent:true,
    });
    const points = new THREE.Points(geo,mat)
    return points;
}

const star = getStarfield({numStar:2000});
scene.add(star);
//file: sunlight.js


const sunLight = new THREE.DirectionalLight(0xFFFFFF)
scene.add(sunLight);
sunLight.position.set(10,0,0);
sunLight.castShadow = true
sunLight.shadow.mapSize.width = 1024;
sunLight.shadow.mapSize.height = 1024;
//file: animate.js
function animate()
{
    earthMesh.rotateY(0.002)
    lightMesh.rotateY(0.002)
    cloudMesh.rotateY(0.0025)
    glowmesh.rotateY(0.002)
    renderer.render(scene,camera)
    moonMesh.rotateY(0.02)
    moonRotation.rotateY(0.00514)
}

renderer.setAnimationLoop(animate);




//file: resizeSetting.js
window.addEventListener('resize',()=> {
    camera.aspect= window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth,window.innerHeight)
    })
