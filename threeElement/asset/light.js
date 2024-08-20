const dirLight = new THREE.DirectionalLight(0xFFFFFFF,0.8)
scene.add(dirLight);
dirLight.position.set(0,50,0);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 1024;
dirLight.shadow.mapSize.height = 1024;;

const {glb,gltf,hdr,img,renderer,scene,camera,orbit,world,groundGeo,groundphyMat,groundMaterial,ground,groundBody,dirLight,mouse,intersectPoint,planeNormal,plane,raycaster,meshes,bodies,sphereGeometry,sphereMat,sphere,spherephyMaterial,sphereBody,planeSpherecontactmat,animate,} = require('../../public/versionning/linkFile.js')
