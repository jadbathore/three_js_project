import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'


//----|Class_Content|----
//----|testor|----
class testor{
    "test class100"
    methodgay(){
        console.log("you gay")
    }
}
//&endClass

//----|testor3|----
class testor3{
    "test class233_11"
    methodgay(){
        console.log("you gay")
    }
}
//&endClass
//----|testor2|----
class testor2{
    "test class"
    methodgay(){
        console.log("you gay")
    }
}
//&endClass
//&end
class Content {
static glb = {
donus:'asset/glb/donus.glb',
earth:'asset/glb/earth.glb',

}
static gltf = {
Bull:'asset/gltf/Bull.gltf',
Deer:'asset/gltf/Deer.gltf',

}
static hdr = {
NaturalStudio:'asset/hdr/NaturalStudio.hdr',

}
static img = {
earth_nightmap:'asset/img/earth_nightmap.jpg',
earthbump:'asset/img/earthbump.jpg',
earthmap1k:'asset/img/earthmap1k.jpg',
earthspecular:'asset/img/earthspecular.jpg',
fair_clouds_8k:'asset/img/fair_clouds_8k.jpg',
moonbump4k:'asset/img/moonbump4k.jpg',
moonmap4k:'asset/img/moonmap4k.jpg',
singleStar:'asset/img/singleStar.png',

}
constructor(){

document.addEventListener('load',this.file_RendererSetting())
document.addEventListener('load',this.file_cameraSetting())
document.addEventListener('load',this.file_loader())
document.addEventListener('load',this.file_earthGroup())
document.addEventListener('load',this.file_moon())
document.addEventListener('load',this.file_test())
document.addEventListener('load',this.file_fresnel())
document.addEventListener('load',this.file_getStarField())
document.addEventListener('load',this.file_sunlight())
document.addEventListener('load',this.file_animate())
document.addEventListener('load',this.file_resizeSetting())
}

file_RendererSetting(){
//----|RendererSetting.js|----



this.renderer = new THREE.WebGLRenderer({antialias:true})
this.scene = new THREE.Scene()
this.renderer.shadowMap.enabled = true;
this.renderer.setSize(window.innerWidth,window.innerHeight);
document.body.appendChild(this.renderer.domElement)
//&end

}


file_cameraSetting(){
//----|cameraSetting.js|----


this.camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth/window.innerHeight,
    0.1,
    1000
);

this.camera.position.set(2,2.5,-5);

this.orbit = new OrbitControls(this.camera,this.renderer.domElement)
this.orbit.update();
//&end

}


file_loader(){
//----|loader.js|----
this.loader = new THREE.TextureLoader();
this.test = "this.test"






//&end

}


file_earthGroup(){
//----|earthGroup.js|----


this.earthGroup = new THREE.Group();
this.earthGroup.rotation.z = -23.4 * Math.PI / 180
this.scene.add(this.earthGroup);

this.geo = new THREE.IcosahedronGeometry(1,12);
this.earthMesh = new THREE.Mesh(
    this.geo,
    new THREE.MeshPhongMaterial(
        {
            bumpMap: this.loader.load(Content.img.earthbump),
            specularMap: this.loader.load(Content.img.earthspecular),
            map: this.loader.load(Content.img.earthmap1k),
            bumpScale:7,
            shininess:13.0,
            specular: 0xFFFFFF,
            opacity:2,
        blending: THREE.AdditiveBlending,

        }
    )
)
this.earthGroup.add(this.earthMesh)
this.earthMesh.receiveShadow = true
this.lightMesh = new THREE.Mesh(
    this.geo,
    new THREE.MeshBasicMaterial({
        lightMap:this.loader.load(Content.img.earth_nightmap),
        transparent:true,
        opacity:0.2,
        blendAlpha:20,
        reflectivity:1,
        lightMapIntensity:10,
        blending: THREE.AdditiveBlending,
    })
)
this.earthGroup.add(this.lightMesh);

this.couldsMat = new THREE.MeshBasicMaterial({
    map: this.loader.load(Content.img.fair_clouds_8k),
    transparent:true,
    opacity:0.1,
    blending: THREE.AdditiveBlending,
})
this.cloudMesh = new THREE.Mesh(
    this.geo,
    this.couldsMat
)
this.cloudMesh.scale.setScalar(1.01)
this.earthGroup.add(this.cloudMesh);
//&end

}


file_moon(){
//----|moon.js|----


this.moonRotation = new THREE.Object3D();
this.scene.add(this.moonRotation);




this.moonMesh = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.27,12),
    new THREE.MeshPhongMaterial({
        map: this.loader.load(Content.img.moonmap4k),
        bumpMap: this.loader.load(Content.img.moonbump4k),
        bumpScale:4,
    })
)
this.moonRotation.add(this.moonMesh);
this.moonMesh.position.x = 8
this.moonMesh.castShadow = true
this.b = 2
this.c = 2
this.booleana = 4
//&end

}


file_test(){
//----|test.js|----

//&end

}


file_fresnel(){
//----|fresnel.js|----



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



this.fresnel = getFresnelMat();
this.glowmesh = new THREE.Mesh(this.geo,this.fresnel);
this.scene.add(this.glowmesh);
this.glowmesh.scale.setScalar(1.02)
//&end

}


file_getStarField(){
//----|getStarField.js|----



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
        map:new THREE.TextureLoader().load(Content.img.singleStar),
        transparent:true,
    });
    const points = new THREE.Points(geo,mat)
    return points;
}






this.star = getStarfield({numStar:2000});
this.scene.add(this.star);
//&end

}


file_sunlight(){
//----|sunlight.js|----



this.sunLight = new THREE.DirectionalLight(0xFFFFFF)
this.scene.add(this.sunLight);
this.sunLight.position.set(10,0,0);
this.sunLight.castShadow = true
this.sunLight.shadow.mapSize.width = 1024;
this.sunLight.shadow.mapSize.height = 1024;

//&end

}


file_animate(){
//----|animate.js|----
requestAnimationFrame(()=>{
    this.earthMesh.rotateY(0.002)
    this.lightMesh.rotateY(0.002)
    this.cloudMesh.rotateY(0.0025)
    this.glowmesh.rotateY(0.002)
    this.moonMesh.rotateY(0.02)
    this.moonRotation.rotateY(0.00514)
    this.renderer.render(this.scene,this.camera)
    this.file_animate()
})






//&end

}


file_resizeSetting(){
//----|resizeSetting.js|----

window.addEventListener('resize',()=> {
    this.camera.aspect= window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth,window.innerHeight)
    })



//&end

}


}

window.onload = () => {
	new Content()
}