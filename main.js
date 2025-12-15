import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


const canvas = document.getElementById('canvas');
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  1000
);

const light = new THREE.AmbientLight( 0x404040, 10 ); // soft white light
scene.add( light );

// White directional light at half intensity shining from the top.
const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
scene.add( directionalLight );



const loader = new GLTFLoader();

loader.load(
    // resource URL
    './portfolio.glb',

    // onLoad callback: called when the resource is loaded
    function ( gltf ) {
        const model = gltf.scene;
        scene.add( model );

        // compute model bounds
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3()).length();
        const center = box.getCenter(new THREE.Vector3());

        // position camera to fit model
        const fitDistance = size * 0.8;
        camera.position.copy(center).add(new THREE.Vector3(0, 0, fitDistance));
        camera.near = Math.max(0.1, size / 100);
        camera.far = size * 100;
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
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);

function handleResize() {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

window.addEventListener('resize', handleResize);