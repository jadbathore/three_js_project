const loader = new RGBELoader();
loader.load(hdr.NaturalStudio,(texture)=>{
    texture.mapping = THREE.EquirectangularReflectionMapping;
    // scene.background = texture;
    // scene.environment = texture;
    const sphere =  new THREE.Mesh(
        new THREE.SphereGeometry(3,50,50),
        new THREE.MeshStandardMaterial({
            roughness:0,
            metalness:0.5,
            color: 0x41c63c,
            envMap:texture
        })
    )
    scene.add(sphere);;
    const sphere2 =  new THREE.Mesh(
        new THREE.SphereGeometry(3,50,50),
        new THREE.MeshStandardMaterial({
            roughness:0,
            metalness:0.5,
            color: 0x433cc6,
            envMap:texture
        })
    )
    scene.add(sphere2);
    sphere2.position.x = -10
});

const {gltf,img,renderer,scene,camera,orbit,earthGroup,earthMesh,lightMesh,couldsMat,cloudMesh,moonRotation,moonMesh,getFresnelMat,getStarfield,randomSpherePoint,animate,THREE} = require('../../public/versionning/linkFile.js')