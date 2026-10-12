import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from '../src/OrbitControls.js';
import { createCertificateIcon } from '../src/certificate.js';
import { islandLinks, tagIslandLinks, getIslandLink, createIslandPicker, IslandTap } from '../src/island-interactions.js';

async function loadModel(name) {
    const bytes = await readFile(new URL(`../assets/${name}.glb`, import.meta.url));
    // Geometry and hierarchy are real; image decoding is not needed for picking.
    const loader = new GLTFLoader().register(() => ({
        name: 'test-without-image-decoding', loadTexture: () => Promise.resolve(null),
    }));
    return (await loader.parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), '')).scene;
}

test('every surface of every real research book opens its own paper', async () => {
    const model = await loadModel('research');
    tagIslandLinks(model, 'research');
    for (const [nodeName, key] of [['Book1', 'book1'], ['Book2', 'book2'], ['Book3', 'book3']]) {
        let meshes = 0;
        model.getObjectByName(nodeName).traverse(node => {
            if (node.isMesh) { assert.equal(getIslandLink(node), key); meshes++; }
        });
        assert.equal(meshes, 3);
    }
    assert.equal(getIslandLink(model.getObjectByName('Label')), 'research');
});

test('all existing model links survive GLTF child-mesh names', async () => {
    for (const [name, key] of Object.entries({ treehouse: 'resume', art: 'art', mailbox: 'contact',
        lightbulb: 'devpost', whale: 'spotify', airplane: 'blog' })) {
        const model = await loadModel(name);
        tagIslandLinks(model, name);
        let meshes = 0;
        model.traverse(node => {
            if (node.isMesh) { assert.equal(getIslandLink(node), key, `${name}: ${node.name}`); meshes++; }
        });
        assert.ok(meshes > 0);
    }
});

test('socials and both certificate faces have the correct destinations', async () => {
    const model = await loadModel('socials');
    model.getObjectByName('Discord').removeFromParent();
    model.add(createCertificateIcon());
    tagIslandLinks(model, 'socials');
    for (const [name, key] of [['Github', 'github'], ['LInkedIn', 'linkedin'], ['BlueDotCertificate', 'certificate']]) {
        model.getObjectByName(name).traverse(node => {
            if (node.isMesh) assert.equal(getIslandLink(node), key);
        });
    }
    assert.equal(model.getObjectByName('Discord'), undefined);
});

const pointer = (overrides = {}) => ({ pointerId: 1, button: 0, isPrimary: true,
    pointerType: 'mouse', clientX: 100, clientY: 100, ...overrides });

test('a steady tap activates once, with tolerance for small hand movement', () => {
    const tap = new IslandTap();
    tap.start(pointer(), 'resume');
    assert.equal(tap.end(pointer({ clientX: 103 }), 'resume'), 'resume');
    assert.equal(tap.end(pointer(), 'resume'), null);
});

test('dragging out and back, or releasing on a different target, cannot activate a link', () => {
    const tap = new IslandTap();
    tap.start(pointer(), 'resume');
    tap.move(pointer({ clientX: 130 }));
    assert.equal(tap.end(pointer(), 'resume'), null);
    tap.start(pointer(), 'resume');
    assert.equal(tap.end(pointer(), 'research'), null);
    tap.start(pointer(), 'resume');
    assert.equal(tap.end(pointer({ clientY: 140 }), 'resume'), null);
});

test('touch scrolling, pointer capture loss, and multi-touch never open a link', () => {
    const tap = new IslandTap();
    const touch = pointer({ pointerType: 'touch' });
    tap.start(touch, 'contact');
    tap.cancel(touch);
    assert.equal(tap.end(touch, 'contact'), null);
    tap.start(touch, 'contact');
    const second = pointer({ pointerId: 2, pointerType: 'touch', isPrimary: false });
    tap.start(second, 'contact');
    assert.equal(tap.end(second, 'contact'), null);
    assert.equal(tap.end(touch, 'contact'), null);
    tap.start(touch, 'contact');
    assert.equal(tap.end(pointer({ pointerType: 'touch', clientX: 108 }), 'contact'), 'contact');
});

test('right clicks and modified clicks do not activate canvas links', () => {
    for (const overrides of [{ button: 2 }, { ctrlKey: true }, { metaKey: true }]) {
        const tap = new IslandTap();
        tap.start(pointer(overrides), 'resume');
        assert.equal(tap.end(pointer(overrides), 'resume'), null);
    }
});

function pickingFixture() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 2, .1, 100);
    camera.position.z = 5;
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(.4, .4, .4), new THREE.MeshBasicMaterial());
    mesh.userData.islandLink = 'resume';
    scene.add(mesh);
    const canvas = { getBoundingClientRect: () => ({ left: 100, top: 50, right: 900, bottom: 450, width: 800, height: 400 }) };
    return { scene, mesh, pick: createIslandPicker(scene, camera, canvas) };
}

test('picking uses canvas bounds and a small margin around visible targets', () => {
    const { pick } = pickingFixture();
    assert.equal(pick(500, 250), 'resume');
    assert.equal(pick(518, 250), null);
    assert.equal(pick(518, 250, 5), 'resume');
    assert.equal(pick(800, 250, 12), null);
    assert.equal(pick(10, 10, 12), null);
});

test('foreground geometry blocks links behind it, including padded picking', () => {
    const { scene, mesh, pick } = pickingFixture();
    const blocker = new THREE.Mesh(new THREE.BoxGeometry(2, 2, .2), new THREE.MeshBasicMaterial());
    blocker.position.z = 1;
    scene.add(blocker);
    assert.equal(pick(500, 250, 12), null);
    blocker.visible = false;
    assert.equal(pick(500, 250), 'resume');
    mesh.visible = false;
    assert.equal(pick(500, 250, 12), null);
});

test('auto rotation travels the same angle at 30, 60, and 120 fps', () => {
    function rotation(fps) {
        const camera = new THREE.PerspectiveCamera();
        camera.position.z = 15;
        const element = { style: {}, addEventListener() {}, removeEventListener() {}, getRootNode() { return this; } };
        const controls = new OrbitControls(camera, element);
        controls.autoRotate = true;
        controls.autoRotateSpeed = .5;
        for (let frame = 0; frame < fps * 2; frame++) controls.update(1 / fps);
        const angle = controls.getAzimuthalAngle();
        controls.dispose();
        return angle;
    }
    assert.ok(Math.abs(rotation(30) - rotation(120)) < 1e-10);
    assert.ok(Math.abs(rotation(60) + Math.PI / 30) < 1e-10);
});

test('all local island link destinations exist', async () => {
    for (const { href } of Object.values(islandLinks)) {
        if (href.startsWith('./')) await access(new URL(`../${href.split('?')[0].slice(2)}`, import.meta.url));
    }
});
