import '../style.css';
import * as THREE from 'three';
import { OrbitControls } from './OrbitControls';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import { gsap } from "gsap";
import { createCertificateIcon } from './certificate';
import { islandLinks, tagIslandLinks, createIslandPicker, IslandTap, openIslandLink } from './island-interactions';

const loadingScreen = document.querySelector('.progress-bar-container');
const progressBar = document.getElementById('progress-bar');
const sceneStatus = document.getElementById('island-status');
const linkList = document.getElementById('island-link-list');
for (const link of Object.values(islandLinks)) {
    const item = document.createElement('li');
    const anchor = document.createElement('a');
    anchor.textContent = link.label;
    anchor.href = link.href;
    if (!link.href.startsWith('#')) {
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
    }
    item.append(anchor);
    linkList.append(item);
}
const islandMenu = document.getElementById('island-links');
function fitLinkMenu() {
    if (!islandMenu.open) return;
    const rect = islandMenu.getBoundingClientRect();
    const openAbove = rect.top > window.innerHeight - rect.bottom;
    linkList.style.bottom = openAbove ? 'calc(100% + 10px)' : 'auto';
    linkList.style.top = openAbove ? 'auto' : 'calc(100% + 10px)';
    linkList.style.maxHeight = `${Math.max(80, Math.min(440,
        (openAbove ? rect.top : window.innerHeight - rect.bottom) - 20))}px`;
}
islandMenu.addEventListener('toggle', fitLinkMenu);
window.addEventListener('resize', fitLinkMenu);
window.addEventListener('scroll', fitLinkMenu, { passive: true });
islandMenu.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
        islandMenu.open = false;
        islandMenu.querySelector('summary').focus();
    }
});
islandMenu.addEventListener('click', event => {
    if (event.target.closest('a')) islandMenu.open = false;
});
document.addEventListener('pointerdown', event => {
    if (!islandMenu.contains(event.target)) islandMenu.open = false;
});
function finishLoading() {
    loadingScreen.style.display = 'none';
    loadingScreen.setAttribute('aria-busy', 'false');
}
document.getElementById('skip-island-loading').addEventListener('click', finishLoading);

try {
    initIsland();
} catch (error) {
    finishLoading();
    document.getElementById('bg').hidden = true;
    document.querySelector('.island-help').hidden = true;
    sceneStatus.textContent = 'The island could not load. You can still explore using Island links or the menu.';
    console.error('Unable to start the 3D island:', error);
}

function initIsland() {
    loadingScreen.style.display = 'flex';
    loadingScreen.setAttribute('aria-busy', 'true');
    const loadingManager = new THREE.LoadingManager();
    loadingManager.onProgress = (url, loaded, total) => {
        progressBar.value = loaded / total * 100;
    };
    loadingManager.onLoad = finishLoading;
    loadingManager.onError = () => {
        finishLoading();
        sceneStatus.textContent = 'Some island details could not load. All destinations are available in Island links.';
    };

    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000);

    //skybox
    let skyboxgeo = new THREE.BoxGeometry(1000, 1000, 1000);
    let materialArray = [];

    let texture_ft = new THREE.TextureLoader(loadingManager).load("./assets/skybox/front.png");
    let texture_bk = new THREE.TextureLoader(loadingManager).load("./assets/skybox/back.png");
    let texture_up = new THREE.TextureLoader(loadingManager).load("./assets/skybox/up.png");
    let texture_dn = new THREE.TextureLoader(loadingManager).load("./assets/skybox/down.png");
    let texture_rt = new THREE.TextureLoader(loadingManager).load("./assets/skybox/right.png");
    let texture_lf = new THREE.TextureLoader(loadingManager).load("./assets/skybox/left.png");


    materialArray.push(new THREE.MeshBasicMaterial( {map: texture_ft, side: THREE.BackSide}));
    materialArray.push(new THREE.MeshBasicMaterial( {map: texture_bk, side: THREE.BackSide}));
    materialArray.push(new THREE.MeshBasicMaterial( {map: texture_up, side: THREE.BackSide}));
    materialArray.push(new THREE.MeshBasicMaterial( {map: texture_dn, side: THREE.BackSide}));
    materialArray.push(new THREE.MeshBasicMaterial( {map: texture_rt, side: THREE.BackSide}));
    materialArray.push(new THREE.MeshBasicMaterial( {map: texture_lf, side: THREE.BackSide}));


    let skybox = new THREE.Mesh(skyboxgeo, materialArray);
    skybox.name = "skybox"
    scene.add(skybox);

    // Resolve model URLs from the page, since the bundle is served from dist/assets.
    const islandUrl = new URL('./assets/island.glb', document.baseURI)
    const rocksUrl = new URL('./assets/rocks.glb', document.baseURI)
    const cloudsUrl = new URL('./assets/clouds.glb', document.baseURI)
    const treehouseUrl = new URL('./assets/treehouse.glb', document.baseURI)
    const researchUrl = new URL('./assets/research.glb', document.baseURI)
    const artUrl = new URL('./assets/art.glb', document.baseURI)
    const socialsUrl = new URL('./assets/socials.glb', document.baseURI)
    const mailboxUrl = new URL('./assets/mailbox.glb', document.baseURI)
    const lightbulbUrl = new URL('./assets/lightbulb.glb', document.baseURI)
    const gamedevUrl = new URL('./assets/gamedev.glb', document.baseURI)
    const whaleUrl = new URL('./assets/whale.glb', document.baseURI)
    const airplaneUrl = new URL('./assets/airplane.glb', document.baseURI)

    const renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector('#bg'),
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    // Preserve the desktop framing while fitting the island on narrow screens.
    let framingScale = Math.max(1, 0.85 / camera.aspect);
    camera.position.setZ(15 * framingScale);



    const assetLoader = new GLTFLoader(loadingManager);

    //loading assets

    //island and decor

    var island = new THREE.Object3D;
    assetLoader.load(islandUrl.href, function(gltf) {
        island = gltf.scene;
        tagIslandLinks(island, "island");
        scene.add(island);
        needsRender = true;
        island.name = "island";
        island.position.set(0, 0, 0);
    }, undefined, function(error) {
        console.error(error);
    });

    let rocksTween;
    var rocks = new THREE.Object3D;
    assetLoader.load(rocksUrl.href, function(gltf) {
        rocks = gltf.scene;
        tagIslandLinks(rocks, "rocks");
        scene.add(rocks);
        needsRender = true;
        rocks.name = "rocks";
        rocks.position.set(0, 0, 0);
        rocksTween = gsap.to( rocks.position, {
            duration: 2,
            paused: true,
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
        tagIslandLinks(clouds, "clouds");
        scene.add(clouds);
        needsRender = true;
        clouds.name = "clouds";
        clouds.position.set(0, 0, 0);
    }, undefined, function(error) {
        console.error(error);
    });

    //resumetreehouse
    var treehouse = new THREE.Object3D;
    assetLoader.load(treehouseUrl.href, function(gltf) {
        treehouse = gltf.scene;
        tagIslandLinks(treehouse, "treehouse");
        scene.add(treehouse);
        needsRender = true;
        treehouse.name = "treehouse";
    }, undefined, function(error) {
        console.error(error);
    });

    //six options
    var research = new THREE.Object3D;
    assetLoader.load(researchUrl.href, function(gltf) {
        research = gltf.scene;
        tagIslandLinks(research, "research");
        scene.add(research);
        needsRender = true;
        research.name = "research";
    }, undefined, function(error) {
        console.error(error);
    });

    var art = new THREE.Object3D;
    assetLoader.load(artUrl.href, function(gltf) {
        art = gltf.scene;
        tagIslandLinks(art, "art");
        scene.add(art);
        needsRender = true;
        art.name = "art";
    }, undefined, function(error) {
        console.error(error);
    });

    var socials = new THREE.Object3D;
    assetLoader.load(socialsUrl.href, function(gltf) {
        socials = gltf.scene;
        const discord = socials.getObjectByName("Discord");
        if (discord) {
            const certificate = createCertificateIcon();
            certificate.position.copy(discord.position);
            certificate.quaternion.copy(discord.quaternion);
            certificate.rotateZ(-0.08);
            discord.parent.add(certificate);
            discord.removeFromParent();
        }
        tagIslandLinks(socials, "socials");
        scene.add(socials);
        needsRender = true;
        socials.name = "socials";
    }, undefined, function(error) {
        console.error(error);
    });

    var mailbox = new THREE.Object3D;
    assetLoader.load(mailboxUrl.href, function(gltf) {
        mailbox = gltf.scene;
        tagIslandLinks(mailbox, "mailbox");
        scene.add(mailbox);
        needsRender = true;
        mailbox.name = "mailbox";
    }, undefined, function(error) {
        console.error(error);
    });

    var lightbulb = new THREE.Object3D;
    assetLoader.load(lightbulbUrl.href, function(gltf) {
        lightbulb = gltf.scene;
        tagIslandLinks(lightbulb, "lightbulb");
        scene.add(lightbulb);
        needsRender = true;
        lightbulb.name = "lightbulb";
    }, undefined, function(error) {
        console.error(error);
    });

    var gamedev = new THREE.Object3D;
    assetLoader.load(gamedevUrl.href, function(gltf) {
        gamedev = gltf.scene;
        tagIslandLinks(gamedev, "gamedev");
        scene.add(gamedev);
        needsRender = true;
        gamedev.name = "gamedev";
    }, undefined, function(error) {
        console.error(error);
    });

    //extras
    let whalemixer;
    var whale = new THREE.Object3D;
    assetLoader.load(whaleUrl.href, function(gltf) {
        whale = gltf.scene;
        tagIslandLinks(whale, "whale");
        scene.add(whale);
        needsRender = true;
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
        tagIslandLinks(airplane, "airplane");
        scene.add(airplane);
        needsRender = true;
        airplane.name = "airplane";
        airplane.position.set(0, 0, 0);
    }, undefined, function(error) {
        console.error(error);
    });

    //lights
    const sun = new THREE.DirectionalLight(0xffffff)
    sun.position.set(5,50,10)

    const ambientLight = new THREE.AmbientLight(0xffffff);

    scene.add(sun, ambientLight)

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.autoRotateSpeed = 0.5;
    // Keep the island upright and avoid getting trapped beneath it.
    controls.minPolarAngle = Math.PI / 4;
    controls.maxPolarAngle = Math.PI * 0.58;

    const canvas = renderer.domElement;
    const picker = createIslandPicker(scene, camera, canvas);
    const tap = new IslandTap();
    const tooltip = document.getElementById('island-tooltip');
    const motionButton = document.getElementById('island-motion');
    const linkMenu = document.getElementById('island-links');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let motionOverride;
    let hovered = null;
    let pointerPosition = null;
    let pointerMoved = false;
    let needsRender = true;
    let contextLost = false;
    let frameId;
    let lastTime;
    let lastPick = 0;

    function motionPaused() {
        return motionOverride ?? reducedMotion.matches;
    }
    function updateMotionButton() {
        motionButton.textContent = motionPaused() ? 'Resume motion' : 'Pause motion';
    }
    updateMotionButton();
    motionButton.hidden = false;
    motionButton.addEventListener('click', () => {
        motionOverride = !motionPaused();
        updateMotionButton();
        needsRender = true;
    });
    reducedMotion.addEventListener('change', () => {
        updateMotionButton();
        needsRender = true;
    });

    function showHover(key) {
        hovered = key;
        canvas.style.cursor = tap.pointers.size ? 'grabbing' : key ? 'pointer' : 'grab';
        tooltip.hidden = !key;
        if (!key) return;
        tooltip.textContent = islandLinks[key].label;
        const { clientX, clientY } = pointerPosition;
        tooltip.style.left = `${Math.max(8, Math.min(clientX + 16, window.innerWidth - tooltip.offsetWidth - 8))}px`;
        tooltip.style.top = `${Math.max(8, Math.min(clientY + 18, window.innerHeight - tooltip.offsetHeight - 8))}px`;
    }
    function pick(event) {
        return picker(event.clientX, event.clientY, event.pointerType === 'touch' ? 12 : 5);
    }
    canvas.style.cursor = 'grab';
    canvas.addEventListener('pointerdown', event => {
        tap.start(event, pick(event));
        showHover(null);
    });
    canvas.addEventListener('pointermove', event => {
        tap.move(event);
        if (event.pointerType !== 'touch') {
            pointerPosition = { clientX: event.clientX, clientY: event.clientY };
            pointerMoved = true;
        }
    });
    canvas.addEventListener('pointerup', event => {
        // OrbitControls captures the pointer. Releasing over an HTML button must
        // not activate a 3D object underneath it.
        const onCanvas = document.elementFromPoint(event.clientX, event.clientY) === canvas;
        const key = tap.end(event, onCanvas ? pick(event) : null);
        showHover(null);
        pointerMoved = true;
        if (key) openIslandLink(key);
    });
    for (const eventName of ['pointercancel', 'lostpointercapture']) {
        canvas.addEventListener(eventName, event => {
            tap.cancel(event);
            pointerPosition = null;
            showHover(null);
        });
    }
    canvas.addEventListener('pointerleave', () => {
        pointerPosition = null;
        showHover(null);
    });

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        const nextScale = Math.max(1, 0.85 / camera.aspect);
        camera.position.sub(controls.target).multiplyScalar(nextScale / framingScale).add(controls.target);
        framingScale = nextScale;
        camera.updateProjectionMatrix();
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);
        needsRender = true;
        syncAnimation();
    }
    window.addEventListener('resize', onWindowResize);

    function isSceneVisible() {
        return !document.hidden && !contextLost && window.scrollY < window.innerHeight;
    }
    function syncAnimation() {
        if (isSceneVisible()) {
            if (frameId === undefined) {
                lastTime = undefined;
                needsRender = true;
                frameId = requestAnimationFrame(animate);
            }
        } else {
            cancelAnimationFrame(frameId);
            frameId = undefined;
            rocksTween?.pause();
            pointerPosition = null;
            showHover(null);
        }
    }
    document.addEventListener('visibilitychange', syncAnimation);
    window.addEventListener('scroll', syncAnimation, { passive: true });
    canvas.addEventListener('webglcontextlost', event => {
        event.preventDefault();
        contextLost = true;
        finishLoading();
        sceneStatus.textContent = 'The island is taking a break. All destinations are available in Island links.';
        syncAnimation();
    });
    canvas.addEventListener('webglcontextrestored', () => {
        contextLost = false;
        sceneStatus.textContent = '';
        syncAnimation();
    });

    function animate(time) {
        frameId = undefined;
        if (!isSceneVisible()) return;
        const delta = lastTime === undefined ? 0 : Math.min((time - lastTime) / 1000, 0.05);
        lastTime = time;
        const moving = !motionPaused() && !hovered && tap.pointers.size === 0 && !linkMenu.open;
        controls.autoRotate = moving;
        rocksTween?.paused(!moving);
        if (moving) {
            whalemixer?.update(delta);
            whale?.rotateY(-0.24 * delta);
            airplane?.rotateY(-0.42 * delta);
            clouds?.rotateY(0.12 * delta);
        }
        const cameraChanged = controls.update(delta);
        if (pointerPosition && tap.pointers.size === 0 && time - lastPick > 60 &&
            (pointerMoved || moving || cameraChanged || needsRender)) {
            const { clientX, clientY } = pointerPosition;
            showHover(document.elementFromPoint(clientX, clientY) === canvas ? picker(clientX, clientY, 5) : null);
            lastPick = time;
            pointerMoved = false;
        }
        if (moving || cameraChanged || needsRender) renderer.render(scene, camera);
        needsRender = false;
        frameId = requestAnimationFrame(animate);
    }
    syncAnimation();
}
