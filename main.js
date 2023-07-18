import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000);

//models
const islandUrl = new URL('./assets/island.glb', import.meta.url)
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
    const model = gltf.scene;
    scene.add(model);
    model.userData.clickable = false;
    model.userData.name = "island";
    model.position.set(0, 0, 0);
}, undefined, function(error) {
    console.error(error);
});

assetLoader.load(treehouseUrl.href, function(gltf) {
    const model = gltf.scene;
    scene.add(model);
    model.userData.clickable = true;
    model.userData.name = "treehouse";
    model.position.set(0, 0, 0);
}, undefined, function(error) {
    console.error(error);
});

let mixer;
var whale = new THREE.Object3D;
assetLoader.load(whaleUrl.href, function(gltf) {
    const model = gltf.scene;
    whale = model;
    scene.add(model);
    model.userData.clickable = true;
    model.userData.name = "whale";
    model.position.set(0, 0, 0);
    mixer = new THREE.AnimationMixer(model);
    const clips = gltf.animations;
    clips.forEach(function(clip) {
        const action = mixer.clipAction(clip);
        action.play();
    });
}, undefined, function(error) {
    console.error(error);
});

var airplane;
assetLoader.load(airplaneUrl.href, function(gltf) {
    const model = gltf.scene;
    airplane = model;
    scene.add(model);
    model.userData.clickable = true;
    model.userData.name = "airplane";
    model.position.set(0, 0, 0);
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
    if (intersects.length != 0 && intersects[0].object.name == "whale") {
        alert("hi")
    }
}

const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame( animate );
    if(mixer)
        mixer.update(clock.getDelta());

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