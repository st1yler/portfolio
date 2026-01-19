// js/3d-viewer.js

let scene, camera, renderer, controls, model = null;
let wireframe = false;
let showLights = true;
let showGrid = true;
let showAxes = true;

// Model database - AJUSTA ESTAS RUTAS A TUS MODELOS
const modelsDatabase = [
    {
        id: 1,
        name: "Modern Building",
        description: "Contemporary architectural design with clean lines",
        category: "b",
        fileName: "static/models/buildings/building1.glb",
        thumbnail: "static/modeling/Buildings/building1.png",
        scale: 1.0,
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 }
    },
    {
        id: 2,
        name: "Japanese House",
        description: "Traditional Japanese architecture with sliding doors",
        category: "b",
        fileName: "static/models/buildings/japanese_house.glb",
        thumbnail: "static/modeling/Japanese/japanese1.png",
        scale: 0.8,
        position: { x: 0, y: -0.5, z: 0 },
        rotation: { x: 0, y: Math.PI/4, z: 0 }
    },
    {
        id: 3,
        name: "Sci-Fi Character",
        description: "Futuristic character with armor and detailed textures",
        category: "c",
        fileName: "static/models/characters/scifi_character.glb",
        thumbnail: "static/modeling/bundles/bundle1.png",
        scale: 1.2,
        position: { x: 0, y: -1, z: 0 },
        rotation: { x: 0, y: 0, z: 0 }
    },
    {
        id: 4,
        name: "Fantasy Warrior",
        description: "Medieval warrior with sword and shield",
        category: "c",
        fileName: "static/models/characters/warrior.glb",
        thumbnail: "static/modeling/bundles/bundle2.png",
        scale: 1.0,
        position: { x: 0, y: -0.8, z: 0 },
        rotation: { x: 0, y: Math.PI/2, z: 0 }
    },
    {
        id: 5,
        name: "Assault Rifle",
        description: "Modern military weapon with detailed mechanics",
        category: "w",
        fileName: "static/models/weapons/assault_rifle.glb",
        thumbnail: "static/modeling/weapons/weapon1.png",
        scale: 0.5,
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: Math.PI/2, y: 0, z: 0 }
    },
    {
        id: 6,
        name: "Sword",
        description: "Medieval sword with intricate handle design",
        category: "w",
        fileName: "static/models/weapons/sword.glb",
        thumbnail: "static/modeling/weapons/weapon2.png",
        scale: 0.3,
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: Math.PI/4, z: 0 }
    },
    {
        id: 7,
        name: "Barrel Prop",
        description: "Wooden barrel for environment decoration",
        category: "p",
        fileName: "static/models/props/barrel.glb",
        thumbnail: "static/modeling/mapping/map1.png",
        scale: 0.7,
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 }
    },
    {
        id: 8,
        name: "Crate",
        description: "Wooden crate for storage and environment",
        category: "p",
        fileName: "static/models/props/crate.glb",
        thumbnail: "static/modeling/mapping/map2.png",
        scale: 0.6,
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: Math.PI/6, z: 0 }
    }
];

function init3DViewer() {
    initScene();
    initLights();
    initGrid();
    initAxes();
    loadModelsList();
    setupEventListeners();
    animate();
    
    // Show welcome notification
    showNotification("Welcome to 3D Model Viewer! Select a model from the sidebar.");
}

function initScene() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0f);
    
    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(5, 3, 5);
    
    // Renderer
    const canvas = document.getElementById('modelCanvas');
    renderer = new THREE.WebGLRenderer({ 
        canvas: canvas,
        antialias: true,
        alpha: true
    });
    renderer.setSize(canvas.parentElement.clientWidth, canvas.parentElement.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // OrbitControls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1;
    controls.maxDistance = 20;
    controls.maxPolarAngle = Math.PI;
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
}

function initLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    // Directional light (main light)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    scene.add(directionalLight);
    
    // Hemisphere light for sky/ground effect
    const hemisphereLight = new THREE.HemisphereLight(0x4488ff, 0x002244, 0.3);
    scene.add(hemisphereLight);
}

function initGrid() {
    const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
    gridHelper.position.y = -0.01; // Slightly below ground to avoid z-fighting
    scene.add(gridHelper);
    gridHelper.visible = showGrid;
}

function initAxes() {
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);
    axesHelper.visible = showAxes;
}

function loadModelsList() {
    const modelList = document.getElementById('modelList');
    modelList.innerHTML = '';
    
    // Count models per category
    const counts = { all: modelsDatabase.length };
    ['b', 'c', 'p', 'w'].forEach(cat => {
        counts[cat] = modelsDatabase.filter(m => m.category === cat).length;
        document.getElementById(`count-${cat}`).textContent = counts[cat];
    });
    document.getElementById('count-all').textContent = counts.all;
    
    // Create model cards
    modelsDatabase.forEach(modelData => {
        const modelCard = document.createElement('div');
        modelCard.className = 'model-card';
        modelCard.dataset.id = modelData.id;
        modelCard.dataset.category = modelData.category;
        
        modelCard.innerHTML = `
            <div class="model-card-thumbnail">
                <img src="${modelData.thumbnail || 'assets/default-thumbnail.jpg'}" 
                     alt="${modelData.name}"
                     onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 fill=%22%23222%22/><text x=%2250%22 y=%2260%22 font-family=%22Arial%22 font-size=%2214%22 fill=%22%23fff%22 text-anchor=%22middle%22>3D</text></svg>'">
            </div>
            <div class="model-card-info">
                <h4>${modelData.name}</h4>
                <p>${modelData.description}</p>
                <div class="model-card-meta">
                    <span class="model-category">${getCategoryName(modelData.category)}</span>
                    <span class="model-size">${modelData.fileName.split('.').pop().toUpperCase()}</span>
                </div>
            </div>
        `;
        
        modelCard.addEventListener('click', () => loadModel(modelData));
        modelList.appendChild(modelCard);
    });
}

function getCategoryName(categoryCode) {
    const categories = {
        'b': 'Building',
        'c': 'Character',
        'p': 'Prop',
        'w': 'Weapon'
    };
    return categories[categoryCode] || 'Other';
}

function loadModel(modelData) {
    showLoading(true);
    
    // Remove previous model
    if (model) {
        scene.remove(model);
        model = null;
    }
    
    // Update UI
    document.getElementById('modelTitle').textContent = modelData.name;
    document.getElementById('modelDescription').textContent = modelData.description;
    
    document.getElementById('detailFileName').textContent = modelData.fileName.split('/').pop();
    document.getElementById('detailCategory').textContent = getCategoryName(modelData.category);
    document.getElementById('detailTextures').textContent = 'Yes';
    document.getElementById('detailAnimations').textContent = 'None';
    document.getElementById('detailLoaded').textContent = new Date().toLocaleTimeString();
    
    // Load the 3D model
    const loader = new THREE.GLTFLoader();
    
    // Optional: Add DRACO decompression support
    // const dracoLoader = new THREE.DRACOLoader();
    // dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
    // loader.setDRACOLoader(dracoLoader);
    
    loader.load(
        modelData.fileName,
        (gltf) => {
            model = gltf.scene;
            
            // Scale and position
            model.scale.set(modelData.scale, modelData.scale, modelData.scale);
            model.position.set(modelData.position.x, modelData.position.y, modelData.position.z);
            model.rotation.set(modelData.rotation.x, modelData.rotation.y, modelData.rotation.z);
            
            // Enable shadows
            model.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    
                    // Apply wireframe if enabled
                    if (wireframe) {
                        child.material.wireframe = true;
                    }
                }
            });
            
            scene.add(model);
            
            // Calculate stats
            let vertices = 0;
            let faces = 0;
            
            model.traverse((child) => {
                if (child.isMesh) {
                    vertices += child.geometry.attributes.position.count;
                    faces += child.geometry.index ? child.geometry.index.count / 3 : child.geometry.attributes.position.count / 3;
                }
            });
            
            document.getElementById('vertexCount').textContent = vertices.toLocaleString();
            document.getElementById('faceCount').textContent = faces.toLocaleString();
            document.getElementById('modelScale').textContent = `${modelData.scale}x`;
            
            // Focus camera on model
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            
            const maxDim = Math.max(size.x, size.y, size.z);
            const fov = camera.fov * (Math.PI / 180);
            let cameraZ = Math.abs(maxDim / Math.tan(fov / 2));
            
            camera.position.copy(center);
            camera.position.z += cameraZ * 1.5;
            camera.lookAt(center);
            controls.target.copy(center);
            controls.update();
            
            showLoading(false);
            showNotification(`Loaded: ${modelData.name}`);
            
            // Update active model card
            document.querySelectorAll('.model-card').forEach(card => {
                card.classList.remove('active');
                if (parseInt(card.dataset.id) === modelData.id) {
                    card.classList.add('active');
                }
            });
        },
        (progress) => {
            // Loading progress
            const percent = (progress.loaded / progress.total * 100).toFixed(1);
            document.querySelector('.loader-text').textContent = `Loading Model... ${percent}%`;
        },
        (error) => {
            console.error('Error loading model:', error);
            showLoading(false);
            showNotification('Error loading model. Please check console.', 'error');
            
            // Create placeholder cube
            const geometry = new THREE.BoxGeometry(2, 2, 2);
            const material = new THREE.MeshStandardMaterial({ 
                color: 0x6366f1,
                wireframe: true
            });
            model = new THREE.Mesh(geometry, material);
            scene.add(model);
        }
    );
}

function showLoading(show) {
    const loadingOverlay = document.getElementById('loadingOverlay');
    loadingOverlay.style.display = show ? 'flex' : 'none';
}

function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');
    
    notificationText.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'flex';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 5000);
}

function setupEventListeners() {
    // Category filtering
    document.querySelectorAll('.category').forEach(category => {
        category.addEventListener('click', () => {
            const categoryType = category.dataset.category;
            
            // Update active category
            document.querySelectorAll('.category').forEach(c => c.classList.remove('active'));
            category.classList.add('active');
            
            // Filter model cards
            document.querySelectorAll('.model-card').forEach(card => {
                if (categoryType === 'all' || card.dataset.category === categoryType) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
    
    // Control buttons
    document.getElementById('resetView').addEventListener('click', () => {
        camera.position.set(5, 3, 5);
        controls.target.set(0, 0, 0);
        controls.update();
    });
    
    document.getElementById('toggleWireframe').addEventListener('click', () => {
        wireframe = !wireframe;
        if (model) {
            model.traverse((child) => {
                if (child.isMesh) {
                    child.material.wireframe = wireframe;
                }
            });
        }
        showNotification(wireframe ? 'Wireframe enabled' : 'Wireframe disabled');
    });
    
    document.getElementById('toggleLights').addEventListener('click', () => {
        showLights = !showLights;
        scene.traverse((child) => {
            if (child.isLight) {
                child.visible = showLights;
            }
        });
        showNotification(showLights ? 'Lights enabled' : 'Lights disabled');
    });
    
    document.getElementById('toggleGrid').addEventListener('click', () => {
        showGrid = !showGrid;
        scene.traverse((child) => {
            if (child.isGridHelper) {
                child.visible = showGrid;
            }
        });
        showNotification(showGrid ? 'Grid enabled' : 'Grid disabled');
    });
    
    document.getElementById('toggleAxes').addEventListener('click', () => {
        showAxes = !showAxes;
        scene.traverse((child) => {
            if (child.isAxesHelper) {
                child.visible = showAxes;
            }
        });
        showNotification(showAxes ? 'Axes enabled' : 'Axes disabled');
    });
    
    // Zoom controls
    document.getElementById('zoomIn').addEventListener('click', () => {
        camera.position.multiplyScalar(0.9);
    });
    
    document.getElementById('zoomOut').addEventListener('click', () => {
        camera.position.multiplyScalar(1.1);
    });
    
    // Rotation controls
    document.getElementById('rotateLeft').addEventListener('click', () => {
        if (model) {
            model.rotation.y += Math.PI / 8;
        }
    });
    
    document.getElementById('rotateRight').addEventListener('click', () => {
        if (model) {
            model.rotation.y -= Math.PI / 8;
        }
    });
    
    // Close notification
    document.getElementById('closeNotification').addEventListener('click', () => {
        document.getElementById('notification').style.display = 'none';
    });
}

function onWindowResize() {
    const canvas = document.getElementById('modelCanvas');
    const container = canvas.parentElement;
    
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}