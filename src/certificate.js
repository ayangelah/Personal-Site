import * as THREE from 'three';

export const certificateUrl = 'https://bluedot.org/certification?id=recBVEeBncDGWmws1';
export const certificateLabel = 'Future of AI certificate · BlueDot Impact';

export function createCertificateIcon() {
    const certificate = new THREE.Group();
    certificate.name = 'BlueDotCertificate';

    const paper = new THREE.MeshStandardMaterial({ color: 0xfff3dc, roughness: 0.9 });
    const edge = new THREE.MeshStandardMaterial({ color: 0xd9bc91, roughness: 0.9 });
    const ink = new THREE.MeshStandardMaterial({ color: 0x9185b0, roughness: 0.85 });
    const blue = new THREE.MeshStandardMaterial({ color: 0x668ec8, roughness: 0.75 });
    const lightBlue = new THREE.MeshStandardMaterial({ color: 0xb7d6ec, roughness: 0.75 });

    function roundedRectangle(width, height, radius) {
        const shape = new THREE.Shape();
        const x = -width / 2, y = -height / 2;
        shape.moveTo(x + radius, y);
        shape.lineTo(x + width - radius, y);
        shape.quadraticCurveTo(x + width, y, x + width, y + radius);
        shape.lineTo(x + width, y + height - radius);
        shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        shape.lineTo(x + radius, y + height);
        shape.quadraticCurveTo(x, y + height, x, y + height - radius);
        shape.lineTo(x, y + radius);
        shape.quadraticCurveTo(x, y, x + radius, y);
        return shape;
    }

    const sheet = new THREE.ExtrudeGeometry(roundedRectangle(1.5, 1.08, 0.055), {
        depth: 0.055, bevelEnabled: true, bevelSize: 0.02,
        bevelThickness: 0.015, bevelSegments: 1, steps: 1, curveSegments: 4,
    });
    sheet.translate(0, 0, -0.0275);
    certificate.add(new THREE.Mesh(sheet, paper));

    // Raised details on both sides keep the icon legible as the island turns.
    for (const side of [1, -1]) {
        const face = new THREE.Group();
        face.rotation.y = side === 1 ? 0 : Math.PI;
        certificate.add(face);

        function bar(width, height, x, y, material = ink) {
            const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, 0.012), material);
            mesh.position.set(x, y, 0.052);
            face.add(mesh);
        }

        bar(1.28, 0.018, 0, 0.425, edge);
        bar(1.28, 0.018, 0, -0.425, edge);
        bar(0.018, 0.85, -0.64, 0, edge);
        bar(0.018, 0.85, 0.64, 0, edge);
        bar(0.65, 0.055, 0, 0.24);
        bar(0.9, 0.027, 0, 0.105);
        bar(0.72, 0.027, 0, 0.015);
        bar(0.36, 0.022, -0.24, -0.235);

        for (const direction of [-1, 1]) {
            const ribbonShape = new THREE.Shape();
            ribbonShape.moveTo(-0.06, 0);
            ribbonShape.lineTo(0.06, 0);
            ribbonShape.lineTo(0.065, -0.28);
            ribbonShape.lineTo(0, -0.23);
            ribbonShape.lineTo(-0.065, -0.28);
            ribbonShape.closePath();
            const ribbon = new THREE.Mesh(new THREE.ExtrudeGeometry(ribbonShape, {
                depth: 0.014, bevelEnabled: false,
            }), blue);
            ribbon.position.set(0.37 + direction * 0.045, -0.16, 0.065);
            ribbon.rotation.z = direction * 0.22;
            face.add(ribbon);
        }

        const seal = new THREE.Mesh(new THREE.CylinderGeometry(0.135, 0.135, 0.045, 12), blue);
        seal.rotation.x = Math.PI / 2;
        seal.position.set(0.37, -0.16, 0.105);
        face.add(seal);

        const sealCenter = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.012, 16), lightBlue);
        sealCenter.rotation.x = Math.PI / 2;
        sealCenter.position.set(0.37, -0.16, 0.134);
        face.add(sealCenter);
    }

    certificate.traverse(object => {
        if (object.isMesh) object.name = 'Certificate';
    });
    return certificate;
}
