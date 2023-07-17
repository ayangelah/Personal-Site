import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000);

//models
const islandUrl = new URL('./assets/island.glb', import.meta.url)
const treehouseUrl = new URL('./assets/treehouse.glb', import.meta.url)


const renderer = new THREE.WebGL1Renderer({
    canvas: document.querySelector('#bg'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);

renderer.render( scene, camera);

const geometry = new THREE.TorusGeometry(10, 3, 16, 100)
const material = new THREE.MeshStandardMaterial({color: 0xFF6347});
const torus = new THREE.Mesh(geometry, material);

scene.add(torus)

const assetLoader = new GLTFLoader();

//loading assets
assetLoader.load(islandUrl.href, function(gltf) {
    const model = gltf.scene;
    scene.add(model);
    model.position.set(0, 0, 0);
}, undefined, function(error) {
    console.error(error);
});

assetLoader.load(treehouseUrl.href, function(gltf) {
    const model = gltf.scene;
    scene.add(model);
    model.position.set(0, 0, 0);
}, undefined, function(error) {
    console.error(error);
});

//lights
const sun = new THREE.PointLight(0xffffff)
sun.position.set(5,5,40)

const ambientLight = new THREE.AmbientLight(0xffffff);

scene.add(sun, ambientLight)

//helper
const lightHelper = new THREE.PointLightHelper(sun)
const gridHelper = new THREE.GridHelper(200, 50);

scene.add(lightHelper, gridHelper)

const controls = new OrbitControls(camera, renderer.domElement);

function animate() {
    requestAnimationFrame( animate );
    torus.rotation.x += 0.01;
    torus.rotation.y += 0.005;
    torus.rotation.z += 0.01;

    controls.update();

    renderer.render( scene, camera);
}

animate()