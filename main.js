import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import { gsap } from "gsap";

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000);

//skybox
let skyboxgeo = new THREE.BoxGeometry(1000, 1000, 1000);
let materialArray = [];

let texture_ft = new THREE.TextureLoader().load("./assets/skybox/front.png");
let texture_bk = new THREE.TextureLoader().load("./assets/skybox/back.png");
let texture_up = new THREE.TextureLoader().load("./assets/skybox/up.png");
let texture_dn = new THREE.TextureLoader().load("./assets/skybox/down.png");
let texture_rt = new THREE.TextureLoader().load("./assets/skybox/right.png");
let texture_lf = new THREE.TextureLoader().load("./assets/skybox/left.png");


materialArray.push(new THREE.MeshBasicMaterial( {map: texture_ft, side: THREE.BackSide}));
materialArray.push(new THREE.MeshBasicMaterial( {map: texture_bk, side: THREE.BackSide}));
materialArray.push(new THREE.MeshBasicMaterial( {map: texture_up, side: THREE.BackSide}));
materialArray.push(new THREE.MeshBasicMaterial( {map: texture_dn, side: THREE.BackSide}));
materialArray.push(new THREE.MeshBasicMaterial( {map: texture_rt, side: THREE.BackSide}));
materialArray.push(new THREE.MeshBasicMaterial( {map: texture_lf, side: THREE.BackSide}));


let skybox = new THREE.Mesh(skyboxgeo, materialArray);
skybox.name = "skybox"
scene.add(skybox);

//models
const islandUrl = new URL('./assets/island.glb', import.meta.url)
const rocksUrl = new URL('./assets/rocks.glb', import.meta.url)
const treehouseUrl = new URL('./assets/treehouse.glb', import.meta.url)
const whaleUrl = new URL('./assets/whale.glb', import.meta.url)
const airplaneUrl = new URL('./assets/airplane.glb', import.meta.url)

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);

renderer.render( scene, camera);

window.addEventListener( 'mousemove',(event) => {
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    //console.log(mouse);
});
window.addEventListener('click', onClick);

const assetLoader = new GLTFLoader();

//loading assets
var objectlist = [];

var island = new THREE.Object3D;
assetLoader.load(islandUrl.href, function(gltf) {
    island = gltf.scene;
    scene.add(island);
    island.name = "island";
    island.userData.clickable = false;
    island.userData.name = "island";
    island.position.set(0, 0, 0);
}, undefined, function(error) {
    console.error(error);
});

var rocks = new THREE.Object3D;
assetLoader.load(rocksUrl.href, function(gltf) {
    rocks = gltf.scene;
    scene.add(rocks);
    rocks.userData.clickable = false;
    rocks.userData.name = "rocks";
    rocks.name = "rocks";
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

var treehouse = new THREE.Object3D;
assetLoader.load(treehouseUrl.href, function(gltf) {
    treehouse = gltf.scene;
    scene.add(treehouse);
    treehouse.userData.clickable = true;
    treehouse.userData.name = "treehouse";
    treehouse.name = "treehouse";
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
    whale.name = "whale";
    //objectlist.push(whale);
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
    //objectlist.push(airplane);
    airplane.userData.clickable = true;
    airplane.userData.name = "airplane";
    airplane.name = "airplane";
    airplane.position.set(0, 0, 0);
}, undefined, function(error) {
    console.error(error);
});

//mouse and raycasting
const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();

//test raycast
var testgeo = new THREE.BoxGeometry(5, 5, 5);
var testmat = new THREE.MeshStandardMaterial({side: THREE.BackSide});
var testobj = new THREE.Mesh(testgeo, testmat);
testobj.position.set(5,5,5);
testobj.name = "testbox";
//scene.add(testobj);

function onClick(event) {
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children);
    console.log(scene.children);

    if (intersects.length > 1 && intersects[0].object.name != undefined) {
        let selected = intersects[0].object.name;
        alert(selected);
        //switch statement with links
        switch(selected) {
            case "Whale": 
                window.open("https://open.spotify.com/user/32yl40xhp98r8uziid81m33xo?si=86f01a2452a14632");
                break;

        }
    }
    /*
    for (var i in scene.children) {
        if (scene.children[i] instanceof THREE.Group) {
          intersects.push(...raycaster.intersectObjects(scene.children[i].children, true));
        } else if (scene.children[i] instanceof THREE.Mesh) {
          intersects.push(raycaster.intersectObject(scene.children[i]));
        }
      }*/
    /*
    let intersects = [];
    raycaster.intersectObjects(scene.children, true, intersects);
    console.log(intersects);

    if (intersects.length > 0) {
        var selected = intersects[0].object.userData.name;
        console.log(selected);
        console.log('clicked in');
    }*/

    /*
    let intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        console.log("clicked in");
        var selected = intersects[0].object;
        console.log(selected);
        if (selected.userData.name) {
            console.log(selected.userData.name);
        }
    }
    */
    console.log(intersects);
    console.log(intersects.length);
    console.log('click!');
}

//lights
const sun = new THREE.DirectionalLight(0xffffff)
sun.position.set(5,50,10)

const ambientLight = new THREE.AmbientLight(0xffffff);

scene.add(sun, ambientLight)

//helper
const lightHelper = new THREE.PointLightHelper(sun)
//const gridHelper = new THREE.GridHelper(200, 50);

scene.add(lightHelper)

const controls = new OrbitControls(camera, renderer.domElement);

controls.maxDistance = 100;
controls.minDistance = 6;
controls.enableDamping = true;
controls.enablePan = false;

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
    //clickMesh();
    renderer.render( scene, camera);
}

animate()