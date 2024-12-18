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