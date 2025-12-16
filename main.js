import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


const canvas = document.getElementById('canvas');
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};
const scene = new THREE.Scene();
/* const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  1000
); */

const camera = new THREE.OrthographicCamera(-1046.299510122011, 1046.299510122011, 282.6915994144756, -282.6915994144756, 0.1, 85309.73665942113);

const light = new THREE.AmbientLight( 0x404040, 10 ); // soft white light
scene.add( light );

// White directional light at half intensity shining from the top.
const directionalLight = new THREE.DirectionalLight( 0xffffff, 2.5 );
directionalLight.position.set( 1500, 800, 1000 );
directionalLight.castShadow = true;
directionalLight.shadow.camera.left = -2000;
directionalLight.shadow.camera.right = 2000;
directionalLight.shadow.camera.top = 2000;
directionalLight.shadow.camera.bottom = -2000;
directionalLight.shadow.camera.far = 3000;
directionalLight.shadow.camera.near = 0.1;
directionalLight.shadow.mapSize.width = 4096;
directionalLight.shadow.mapSize.height = 4096;
directionalLight.shadow.bias = -0.001;
directionalLight.shadow.blurSamples = 8;
scene.add( directionalLight );



const loader = new GLTFLoader();

loader.load(
    // resource URL
    './portfolio.glb',

    // onLoad callback: called when the resource is loaded
    function ( gltf ) {
        gltf.scene.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        const model = gltf.scene;
        scene.add( model );
        
        // Set camera position, rotation and zoom
        camera.position.set(1132.2776832487332, 450.5223806146788, 766.3330196108404);
        camera.rotation.set(-0.4712768264024995, -0.009486603682195666, -0.0048340090768717965);
        camera.zoom = 2.7895098175162607;

        // compute model bounds
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3()).length();
        const center = box.getCenter(new THREE.Vector3());

        // position camera to fit model
        /*const fitDistance = size * 0.8;
        camera.position.copy(center).add(new THREE.Vector3(0, 0, fitDistance));
        camera.near = 0.1;
        camera.far = size * 100;
        
        // Calculate orthographic camera frustum to fit model on screen
        const vFOV = size / 2;
        const height = 2 * Math.tan(Math.PI / 8) * fitDistance;
        const width = height * (sizes.width / sizes.height);
        
        camera.left = -width / 2;
        camera.right = width / 2;
        camera.top = height / 2;
        camera.bottom = -height / 2;*/
        
        camera.updateProjectionMatrix();

        // set orbit controls target to model center
        controls.target.copy(center);
        controls.update();

        console.log( 'Model loaded and framed', { size, center });
    },

    // onProgress callback: called while loading is in progress
    function ( xhr ) {
        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded');
    },

    // onError callback: called when loading has errors
    function ( error ) {
        console.error( 'An error happened during loading:', error );
    }
);


const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.72;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.update();

camera.position.z = 5;
controls.update();



function animate() {
  controls.update();
  //console.log(camera);
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);

function handleResize() {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    
    // For orthographic camera, adjust frustum based on aspect ratio
    const height = camera.top - camera.bottom;
    const width = height * (sizes.width / sizes.height);
    
    camera.left = -width / 2;
    camera.right = width / 2;
    
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

window.addEventListener('resize', handleResize);