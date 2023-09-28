import '../style.css';
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
const cloudsUrl = new URL('./assets/clouds.glb', import.meta.url)
const treehouseUrl = new URL('./assets/treehouse.glb', import.meta.url)
const researchUrl = new URL('./assets/research.glb', import.meta.url)
const artUrl = new URL('./assets/art.glb', import.meta.url)
const socialsUrl = new URL('./assets/socials.glb', import.meta.url)
const mailboxUrl = new URL('./assets/mailbox.glb', import.meta.url)
const lightbulbUrl = new URL('./assets/lightbulb.glb', import.meta.url)
const gamedevUrl = new URL('./assets/gamedev.glb', import.meta.url)
const whaleUrl = new URL('./assets/whale.glb', import.meta.url)
const airplaneUrl = new URL('./assets/airplane.glb', import.meta.url)

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(15);

renderer.render( scene, camera);

window.addEventListener( 'pointermove',(event) => {
    pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    var vector = new THREE.Vector3(pointer.x, pointer.y, 0.5);
    vector.unproject(camera2);
    var dir = vector.sub(camera.position).normalize();
    var distance = -camera2.position.z / dir.z;
    var pos = camera2.position.clone().add(dir.multiplyScalar(distance));
    //console.log(pointer);
});
window.addEventListener('click', onClick);

window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize(){

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

const loadingManager = new THREE.LoadingManager();

const progressBar = document.getElementById('progress-bar');

loadingManager.onProgress = function(url, loaded, total) {
    progressBar.value = (loaded / total) * 100;
}
const progressBarContainer = document.querySelector('.progress-bar-container');
loadingManager.onLoad = function() {
    progressBarContainer.style.display = 'none';
}

const assetLoader = new GLTFLoader(loadingManager);

//loading assets

//island and decor

var island = new THREE.Object3D;
assetLoader.load(islandUrl.href, function(gltf) {
    island = gltf.scene;
    scene.add(island);
    island.name = "island";
    island.position.set(0, 0, 0);
}, undefined, function(error) {
    console.error(error);
});

var rocks = new THREE.Object3D;
assetLoader.load(rocksUrl.href, function(gltf) {
    rocks = gltf.scene;
    scene.add(rocks);
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

var clouds = new THREE.Object3D;
assetLoader.load(cloudsUrl.href, function(gltf) {
    clouds = gltf.scene;
    scene.add(clouds);
    clouds.name = "clouds";
    clouds.position.set(0, 0, 0);
}, undefined, function(error) {
    console.error(error);
});

//resumetreehouse
var treehouse = new THREE.Object3D;
assetLoader.load(treehouseUrl.href, function(gltf) {
    treehouse = gltf.scene;
    scene.add(treehouse);
    treehouse.name = "treehouse";
}, undefined, function(error) {
    console.error(error);
});

//six options
var research = new THREE.Object3D;
assetLoader.load(researchUrl.href, function(gltf) {
    research = gltf.scene;
    scene.add(research);
    research.name = "research";
}, undefined, function(error) {
    console.error(error);
});

var art = new THREE.Object3D;
assetLoader.load(artUrl.href, function(gltf) {
    art = gltf.scene;
    scene.add(art);
    art.name = "art";
}, undefined, function(error) {
    console.error(error);
});

var socials = new THREE.Object3D;
assetLoader.load(socialsUrl.href, function(gltf) {
    socials = gltf.scene;
    scene.add(socials);
    socials.name = "socials";
}, undefined, function(error) {
    console.error(error);
});

var mailbox = new THREE.Object3D;
assetLoader.load(mailboxUrl.href, function(gltf) {
    mailbox = gltf.scene;
    scene.add(mailbox);
    mailbox.name = "mailbox";
}, undefined, function(error) {
    console.error(error);
});

var lightbulb = new THREE.Object3D;
assetLoader.load(lightbulbUrl.href, function(gltf) {
    lightbulb = gltf.scene;
    scene.add(lightbulb);
    lightbulb.name = "lightbulb";
}, undefined, function(error) {
    console.error(error);
});

var gamedev = new THREE.Object3D;
assetLoader.load(gamedevUrl.href, function(gltf) {
    gamedev = gltf.scene;
    scene.add(gamedev);
    gamedev.name = "gamedev";
}, undefined, function(error) {
    console.error(error);
});

//extras
let whalemixer;
var whale = new THREE.Object3D;
assetLoader.load(whaleUrl.href, function(gltf) {
    whale = gltf.scene;
    scene.add(whale);
    whale.name = "whale";
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
    airplane.name = "airplane";
    airplane.position.set(0, 0, 0);
}, undefined, function(error) {
    console.error(error);
});

//pointer and raycasting
const pointer = new THREE.Vector2();
const raycaster = new THREE.Raycaster();

//test raycast
var testgeo = new THREE.BoxGeometry(5, 5, 5);
var testmat = new THREE.MeshStandardMaterial({side: THREE.BackSide});
var testobj = new THREE.Mesh(testgeo, testmat);
testobj.position.set(5,5,5);
testobj.name = "testbox";
//scene.add(testobj);

function onClick(event) {
    raycaster.setFromCamera(pointer, camera);

    const intersects = raycaster.intersectObjects(scene.children);
    //console.log(scene.children);

    if (intersects.length > 1 && intersects[0].object.name != undefined) {
        let selected = intersects[0].object.name;
        //alert(selected);
        //switch statement with links
        switch(selected) {
            //resume
            case "Plane011":
            case "Plane011_1":
            case "Plane011_2":
            case "Plane011_3":
            case "Plane011_4":
            case "Plane011_5":
            case "Plane011_6":
            case "Plane011_7":
            case "Plane011_8":
            case "Plane011_9":
            case "Plane011_10":
            case "Plane011_11":
            case "Plane011_12":
            case "Plane011_13":
            case "Plane011_14":
                window.open("http://ayangelah.me/attachments/Resume 7_21_23.pdf");
                break;
            //1: research
            case "Cube015":
                window.open("http://ayangelah.me/attachments/The Effects of Citric Acid on Contraction of Mouse Cardiomyocytes.pdf");
                break;
            case "Cube017":
                window.open("http://ayangelah.me/attachments/Illustrations of Ukrainian Phonetics.pdf");
                break;
            case "Cube018":
                window.open("http://ayangelah.me/attachments/Tone Sandhi in Hokkien Taiwanese.pdf");
                break;
            case "Bookshelf":
            case "Label":
                window.open("http://ayangelah.me/research.html");
                break;
            //2: art
            case "art":
            case "art_1":
            case "art_2":
            case "art_3":
            case "art_4":
            case "art_5":
            case "art_6":
                window.open("https://www.artpal.com/jackelope");
                break;
            //3: socials
            case "Cube008":
            case "Cube008_1":
                window.open("https://www.linkedin.com/in/ayangelah");
                break;
            case "Cube009":
            case "Cube009_1":
                window.open("https://www.github.com/ayangelah");
                break;
            case "Cube012":
            case "Cube012_1":
                //discord stuff
                break;
            //4: contact me
            case "Mailbox":
                window.open("mailto:ayangelah@gmail.com");
            //5: devpost/hackathons
            case "lightbulb":
            case "lightbulb_1":
                window.open("https://devpost.com/ayangelah?ref_content=user-portfolio&ref_feature=portfolio&ref_medium=global-nav");
                break;
            //6: gamedev

            //extras
            case "Whale": 
                window.open("https://open.spotify.com/user/32yl40xhp98r8uziid81m33xo?si=86f01a2452a14632");
                break;
            case "Airplane":
                window.open("http://ayangelah.me/blog.html");
                break;

        }
    }
    /*
    console.log(intersects);
    console.log(intersects.length);
    console.log('click!');*/
}

//lights
const sun = new THREE.DirectionalLight(0xffffff)
sun.position.set(5,50,10)

const ambientLight = new THREE.AmbientLight(0xffffff);

scene.add(sun, ambientLight)

//helpers
//const lightHelper = new THREE.PointLightHelper(sun)
//const gridHelper = new THREE.GridHelper(200, 50);

//scene.add(lightHelper)

const controls = new OrbitControls(camera, renderer.domElement);

controls.maxDistance = 100;
controls.minDistance = 6;
controls.enableDamping = true;
controls.enablePan = false;
controls.enableZoom = false;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.5;

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
    if (clouds) {
        clouds.rotateY(0.002);
    }
    controls.update();
    renderer.render( scene, camera);
}

animate()

//second scene

const scene2 = new THREE.Scene()

const camera2 = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer2 = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg2'),
});

renderer2.setPixelRatio(window.devicePixelRatio);
renderer2.setSize(window.innerWidth, window.innerHeight);
camera2.position.setZ(15);

const geometry = new THREE.TorusGeometry(10, 3, 16, 100)
const material = new THREE.MeshStandardMaterial( {color: 0xFF6347} );
const torus = new THREE.Mesh(geometry, material);

scene2.add(torus)

/*
var mailbox2 = new THREE.Object3D;
assetLoader.load(mailboxUrl.href, function(gltf) {
    mailbox2 = gltf.scene;
    scene2.add(mailbox2);
    mailbox2.position.set(0,0,30);
    mailbox2.name = "mailbox2";
}, undefined, function(error) {
    console.error(error);
});

var socials2 = new THREE.Object3D;
assetLoader.load(socialsUrl.href, function(gltf) {
    socials2 = gltf.scene;
    scene2.add(socials2);
    socials2.position.set(0,0,0);
    socials2.name = "socials2";
}, undefined, function(error) {
    console.error(error);
});
*/

//lights
const mouselight = new THREE.PointLight(0xffffff)
mouselight.position.set(5,50,10)

const ambientLight2 = new THREE.AmbientLight(0xffffff);

scene2.add(mouselight, ambientLight2);

function animate2() {
    requestAnimationFrame(animate);
    renderer2.render( scene2, camera2);
}

animate2()

