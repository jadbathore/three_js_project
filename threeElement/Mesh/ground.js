const world = new CANNON.World({gravity:new CANNON.Vec3(0,-9.81,0)})

const groundGeo = new THREE.PlaneGeometry(10,10);
const groundphyMat = new CANNON.Material();
const groundMaterial = new THREE.MeshStandardMaterial({
    color:0XFFFFFF,
    side: THREE.DoubleSide
})
const ground = new THREE.Mesh(groundGeo,groundMaterial);
scene.add(ground);
ground.receiveShadow = true;
const groundBody = new CANNON.Body(
    {
        type: CANNON.Body.STATIC,
        shape: new CANNON.Box(new CANNON.Vec3(5,5,0.001)),
        material:groundphyMat
    });
groundBody.quaternion.setFromEuler(-Math.PI / 2,0,0);
world.addBody(groundBody);



const {THREE,CANNON} = require('../../public/versionning/linkFile.js')
