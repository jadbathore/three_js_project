
const mouse = new THREE.Vector2();
const intersectPoint = new THREE.Vector3();
const planeNormal = new THREE.Vector3();
const plane = new THREE.Plane();
const raycaster = new THREE.Raycaster();

window.addEventListener('mousemove',(event)=>{
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    planeNormal.copy(camera.position).normalize();
    plane.setFromNormalAndCoplanarPoint(planeNormal, /*new THREE.Vector3(0,0,0)*/ planeNormal);
    raycaster.setFromCamera(mouse,camera);
    raycaster.ray.intersectPlane(plane,intersectPoint);
})

const meshes = [];
const bodies = [];

window.addEventListener('click',()=>{
    const sphereGeometry = new THREE.SphereGeometry(0.125,30,30);
    const sphereMat =  new THREE.MeshStandardMaterial({
        color: Math.random() * 0xFFFFFFF,
        metalness:0,
        roughness:0
    })
    const sphere = new THREE.Mesh(sphereGeometry,sphereMat);
    scene.add(sphere);
    sphere.castShadow = true;
    const spherephyMaterial = new CANNON.Material();
    const sphereBody = new CANNON.Body({
        mass:0.3,
        shape: new CANNON.Sphere(0.125),
        position: new CANNON.Vec3(intersectPoint.x,intersectPoint.y,intersectPoint.z),
        material: spherephyMaterial
    })
    world.addBody(sphereBody);

    const planeSpherecontactmat = new CANNON.ContactMaterial(
        groundphyMat,
        spherephyMaterial,
        {restitution:0.9}
    )
    world.addContactMaterial(planeSpherecontactmat);
    meshes.push(sphere);
    bodies.push(sphereBody);
})
const timestep = 1/60;
const {THREE,} = require('../../public/versionning/linkFile.js')
