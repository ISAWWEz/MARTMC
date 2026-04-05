// --- DEĞİŞKENLERİ GÜNCELLE ---
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();
const clock = new THREE.Clock();

// --- ETKİLEŞİM İÇİN RAYCASTER ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// --- OYUN MANTIĞI GÜNCELLEMELERİ ---

function onKeyDown(e) {
    switch (e.code) {
        case 'KeyW': moveForward = true; break;
        case 'KeyS': moveBackward = true; break;
        case 'KeyA': moveLeft = true; break;
        case 'KeyD': moveRight = true; break;
        case 'Digit1': selectedBlockType = "stone"; updateUI(); break;
        case 'Digit2': selectedBlockType = "dirt"; updateUI(); break;
        case 'Digit3': selectedBlockType = "wood"; updateUI(); break;
    }
}

function onKeyUp(e) {
    switch (e.code) {
        case 'KeyW': moveForward = false; break;
        case 'KeyS': moveBackward = false; break;
        case 'KeyA': moveLeft = false; break;
        case 'KeyD': moveRight = false; break;
    }
}

function updateUI() {
    document.querySelectorAll('.slot').forEach(s => 
        s.classList.toggle('selected', s.dataset.type === selectedBlockType)
    );
}

// Blok Koyma ve Kırma Fonksiyonu
function onMouse(e) {
    if (!controls || !controls.isLocked) return;

    raycaster.setFromCamera(new THREE.Vector2(0,0), camera);
    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        const intersect = intersects[0];
        
        if (e.button === 0) { // Sol Tık: Kır
            if (intersect.object.type === "Mesh" && intersect.object !== waterMesh) {
                // Eğer bu bir yerleştirilen bloksa sil, terrain ise vertex rengini değiştir (kazma efekti)
                if (intersect.object.name === "userBlock") {
                    scene.remove(intersect.object);
                }
            }
        } 
        else if (e.button === 2) { // Sağ Tık: Koy
            const geo = new THREE.BoxGeometry(1, 1, 1);
            let col = selectedBlockType === "stone" ? 0x888888 : (selectedBlockType === "dirt" ? 0x8B4513 : 0xDEB887);
            const mat = new THREE.MeshLambertMaterial({ color: col });
            const block = new THREE.Mesh(geo, mat);
            
            // Bloğu tam yanına yerleştir
            block.position.copy(intersect.point).add(intersect.face.normal);
            block.position.divideScalar(1).floor().addScalar(0.5);
            block.name = "userBlock";
            block.castShadow = true;
            block.receiveShadow = true;
            scene.add(block);
        }
    }
}

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    if (controls && controls.isLocked) {
        // Hareket Fiziği
        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.normalize();

        if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
        if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

        controls.moveRight(-velocity.x * delta);
        controls.moveForward(-velocity.z * delta);

        // El Sallanma Efekti (Yürürken)
        if (handMesh && (moveForward || moveBackward || moveLeft || moveRight)) {
            handMesh.position.y += Math.sin(Date.now() * 0.01) * 0.015;
            handMesh.rotation.z = Math.sin(Date.now() * 0.005) * 0.1;
        }
    }

    // Su ve Partikül animasyonların burada kalabilir...
    if (waterMesh) waterMesh.position.y = 1.5 + Math.sin(Date.now() * 0.001) * 0.05;

    renderer.render(scene, camera);
}

// Event Listener'ları güncelle
document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);
                                              
