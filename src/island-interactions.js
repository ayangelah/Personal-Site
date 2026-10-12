import * as THREE from 'three';
import { certificateUrl, certificateLabel } from './certificate.js';

export const islandLinks = {
    resume: { label: 'Resume', href: './attachments/Resume.pdf?v=20261012' },
    research: { label: 'Research', href: './research.html' },
    book1: { label: 'Citric acid and cardiomyocytes', href: './attachments/The Effects of Citric Acid on Contraction of Mouse Cardiomyocytes.pdf' },
    book2: { label: 'Ukrainian phonetics', href: './attachments/Illustrations of Ukrainian Phonetics.pdf' },
    book3: { label: 'Tone sandhi in Hokkien Taiwanese', href: './attachments/Tone Sandhi in Hokkien Taiwanese.pdf' },
    art: { label: 'Art gallery', href: 'https://www.artpal.com/jackelope' },
    linkedin: { label: 'LinkedIn', href: 'https://www.linkedin.com/in/ayangelah' },
    github: { label: 'GitHub', href: 'https://github.com/ayangelah' },
    certificate: { label: certificateLabel, href: certificateUrl },
    contact: { label: 'Contact me', href: '#contactme' },
    devpost: { label: 'Hackathon projects on Devpost', href: 'https://devpost.com/ayangelah' },
    spotify: { label: 'Music on Spotify', href: 'https://open.spotify.com/user/32yl40xhp98r8uziid81m33xo' },
    blog: { label: 'Blog', href: './blog.html' },
};

// Tag the authored objects, so every material/mesh beneath them shares a link.
// Individual books override the bookshelf's general research link.
const modelLinks = {
    treehouse: { TreeHouse: 'resume' },
    research: { Bookshelf: 'research', Book1: 'book1', Book2: 'book2', Book3: 'book3' },
    art: { Art: 'art' },
    socials: { Github: 'github', LInkedIn: 'linkedin', BlueDotCertificate: 'certificate' },
    mailbox: { Mailbox: 'contact' },
    lightbulb: { LightBulb: 'devpost' },
    whale: { Whale: 'spotify' },
    airplane: { Airplane: 'blog' },
};

export function tagIslandLinks(model, name) {
    for (const [objectName, key] of Object.entries(modelLinks[name] || {})) {
        const object = model.getObjectByName(objectName);
        if (object) object.userData.islandLink = key;
    }
}

export function getIslandLink(object) {
    for (let node = object; node; node = node.parent) {
        const key = node.userData.islandLink;
        if (islandLinks[key]) return key;
    }
    return null;
}

export function createIslandPicker(scene, camera, canvas) {
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const offsets = [[1, 0], [-1, 0], [0, 1], [0, -1], [.7, .7], [-.7, .7], [.7, -.7], [-.7, -.7]];
    return (clientX, clientY, radius = 0) => {
        const rect = canvas.getBoundingClientRect();
        if (!rect.width || !rect.height || clientX < rect.left || clientY < rect.top ||
            clientX > rect.right || clientY > rect.bottom) return null;
        scene.updateMatrixWorld(true);
        camera.updateMatrixWorld();
        const roots = scene.children.filter(object => object.name !== 'skybox');
        function hitAt(x, y) {
            pointer.set((x - rect.left) / rect.width * 2 - 1, -(y - rect.top) / rect.height * 2 + 1);
            raycaster.setFromCamera(pointer, camera);
            return raycaster.intersectObjects(roots, true).find(hit => {
                for (let node = hit.object; node; node = node.parent) {
                    if (!node.visible) return false;
                }
                return true;
            });
        }
        const center = hitAt(clientX, clientY);
        const direct = center && getIslandLink(center.object);
        if (direct || !radius) return direct || null;
        // A little screen-space padding helps small targets. Never reach past
        // a closer foreground object to select something hidden behind it.
        for (const [x, y] of offsets) {
            const hit = hitAt(clientX + x * radius, clientY + y * radius);
            if (hit && (!center || hit.distance <= center.distance + 0.05)) {
                const key = getIslandLink(hit.object);
                if (key) return key;
            }
        }
        return null;
    };
}

// Track the whole gesture, including excursions that return to the start.
// A scroll cancellation or a second finger must never turn into a link click.
export class IslandTap {
    pointers = new Set();
    gesture = null;

    start(event, key) {
        this.pointers.add(event.pointerId);
        if (this.pointers.size !== 1 || event.button !== 0 || event.isPrimary === false ||
            event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
            this.gesture = null;
            return;
        }
        this.gesture = { id: event.pointerId, x: event.clientX, y: event.clientY, key,
            threshold: event.pointerType === 'touch' ? 10 : 6, dragged: false };
    }

    move(event) {
        const gesture = this.gesture;
        if (gesture?.id === event.pointerId &&
            Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) > gesture.threshold) {
            gesture.dragged = true;
        }
    }

    end(event, key) {
        this.move(event);
        const gesture = this.gesture;
        this.pointers.delete(event.pointerId);
        this.gesture = null;
        return gesture?.id === event.pointerId && !gesture.dragged && gesture.key === key ? key : null;
    }

    cancel(event) {
        this.pointers.delete(event.pointerId);
        this.gesture = null;
    }
}

export function openIslandLink(key) {
    const link = islandLinks[key];
    if (!link) return;
    if (link.href.startsWith('#')) window.location.hash = link.href;
    else window.open(link.href, '_blank', 'noopener,noreferrer');
}
