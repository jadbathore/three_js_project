const { THREE } = require('../../public/versionning/linkFile')

const renderer = new THREE.WebGLRenderer({antialias:true})
const scene = new THREE.Scene()
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth,window.innerHeight);
document.body.appendChild(renderer.domElement);