import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import { gsap } from "gsap";

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000);

//models
const islandUrl = new URL('./assets/island.glb', import.meta.url)
const rocksUrl = new URL('./assets/rocks.glb', import.meta.url)
const treehouseUrl = new URL('./assets/treehouse.glb', import.meta.url)
const whaleUrl = new URL('./assets/whale.glb', import.meta.url)
const airplaneUrl = new URL('./assets/airplane.glb', import.meta.url)

const renderer = new THREE.WebGL1Renderer({
    canvas: document.querySelector('#bg'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);

renderer.render( scene, camera);

//mouse and raycasting
const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();

function onPointerMove( event ) {

	// calculate pointer position in normalized device coordinates
	// (-1 to +1) for both components

	pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}

window.addEventListener( 'mousemove', onPointerMove);

const assetLoader = new GLTFLoader();

//loading assets
assetLoader.load(islandUrl.href, function(gltf) {
    const island = gltf.scene;
    scene.add(island);
    island.userData.clickable = false;
    island.userData.name = "island";
    island.position.set(0, 0, 0);
}, undefined, function(error) {
    console.error(error);
});

var rocks;
assetLoader.load(rocksUrl.href, function(gltf) {
    rocks = gltf.scene;
    scene.add(rocks);
    rocks.userData.clickable = false;
    rocks.userData.name = "rocks";
    rocks.position.set(0, 0, 0);
    gsap.to( rocks.position, {
        duration: 2,
        y: 0.5,
        yoyo: true,
        repeat: -1,
        ease: "power1.inOut"
      } );
}, undefined, function(error) {
    console.error(error);
});

var treehouse;
assetLoader.load(treehouseUrl.href, function(gltf) {
    treehouse = gltf.scene;
    scene.add(treehouse);
    treehouse.userData.clickable = true;
    treehouse.userData.name = "treehouse";
    treehouse.position.set(0, 0, 0);
}, undefined, function(error) {
    console.error(error);
});

let whalemixer;
var whale = new THREE.Object3D;
assetLoader.load(whaleUrl.href, function(gltf) {
    whale = gltf.scene;
    scene.add(whale);
    whale.userData.clickable = true;
    whale.userData.name = "whale";
    whale.position.set(0, 0, 0);
    whalemixer = new THREE.AnimationMixer(whale);
    const clips = gltf.animations;
    clips.forEach(function(clip) {
        const action = whalemixer.clipAction(clip);
        action.play();
    });
}, undefined, function(error) {
    console.error(error);
});

var airplane;
assetLoader.load(airplaneUrl.href, function(gltf) {
    airplane = gltf.scene;
    scene.add(airplane);
    airplane.userData.clickable = true;
    airplane.userData.name = "airplane";
    airplane.position.set(0, 0, 0);
}, undefined, function(error) {
    console.error(error);
});


//lights
const sun = new THREE.DirectionalLight(0xffffff)
sun.position.set(5,5,40)

const ambientLight = new THREE.AmbientLight(0xffffff);

scene.add(sun, ambientLight)

//helper
const lightHelper = new THREE.PointLightHelper(sun)
const gridHelper = new THREE.GridHelper(200, 50);

scene.add(lightHelper, gridHelper)

const controls = new OrbitControls(camera, renderer.domElement);

function clickMesh() {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length != 0 && intersects[0].object.userData.name && intersects[0].object.userData.clickable) {
        found = intersects[0].object
        console.log('found clickable')
    }
}

const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame( animate );
    if(whalemixer)
        whalemixer.update(clock.getDelta());

    if (whale) {
        whale.rotateY(-0.004);
    }
    if (airplane) {
        airplane.rotateY(-0.007);
    }
    controls.update();
    clickMesh();
    renderer.render( scene, camera);
}

animate()