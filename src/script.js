import * as THREE from 'https://cdn.skypack.dev/three@0.136.0';
import { RGBELoader  } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/loaders/RGBELoader.js';
import { EffectComposer } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/postprocessing/RenderPass.js';
import { AfterimagePass } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/postprocessing/AfterimagePass.js'
import { UnrealBloomPass } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/postprocessing/ShaderPass.js';
import { PixelShader } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/shaders/PixelShader.js';
import { FBXLoader } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/loaders/FBXLoader.js';

let composer;

var renderer = new THREE.WebGLRenderer({ canvas : document.getElementById('canvas'), antialias:true});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
// default bg canvas color //
renderer.setClearColor(0x24131A);

//  use device aspect ratio //
renderer.setPixelRatio(window.devicePixelRatio);

// set size of canvas within window //
renderer.setSize(window.innerWidth, window.innerHeight);

var scene = new THREE.Scene();

const hdrEquirect = new RGBELoader()
	.setPath( 'https://miroleon.github.io/daily-assets/' )
	.load( 'gradient_5_comp.hdr', function () {

  hdrEquirect.mapping = THREE.EquirectangularReflectionMapping;
} );

scene.environment = hdrEquirect;

scene.fog = new THREE.Fog( 0x11151c, 1, 100 );
scene.fog = new THREE.FogExp2(0x11151c, 0.45);

var theta = 0;

var camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 0.1, 1000 );

camera.position.set(0, 0, 10);

const textureLoader = new THREE.TextureLoader();

var surf_imp2 = textureLoader.load( 'https://miroleon.github.io/daily-assets/surf_imp_02.jpg' );
surf_imp2.wrapT = THREE.RepeatWrapping;
surf_imp2.wrapS = THREE.RepeatWrapping;

var wall_mat = new THREE.MeshPhysicalMaterial({
  color: 0x606060,
  roughness: 0.2,
  metalness: 1,
  roughnessMap: surf_imp2,
  envMap: hdrEquirect,
  envMapIntensity: 4
});

const loader = new FBXLoader();
loader.load( 'https://miroleon.github.io/daily-assets/two_hands_01.fbx', function ( object ) {

object.traverse( function ( child ) {

	if ( child.isMesh ) {
		child.castShadow = true;
		child.receiveShadow = true;
    child.material = wall_mat;
}

object.position.set( 0, 0, 0);
object.scale.setScalar( 0.05 );
} );

scene.add( object );
  
} );

// POST PROCESSING
const renderScene = new RenderPass( scene, camera );

const afterimagePass = new AfterimagePass();
afterimagePass.uniforms[ 'damp' ].value = 0.9;

const bloomparams = {
	exposure: 1,
	bloomStrength: 1.75,
	bloomThreshold: 0.1,
	bloomRadius: 1
};

const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
bloomPass.threshold = bloomparams.bloomThreshold;
bloomPass.strength = bloomparams.bloomStrength;
bloomPass.radius = bloomparams.bloomRadius;

const pixelPass = new ShaderPass( PixelShader );
pixelPass.uniforms[ 'resolution' ].value = new THREE.Vector2( window.innerWidth, window.innerHeight );
pixelPass.uniforms[ 'resolution' ].value.multiplyScalar( window.devicePixelRatio );
pixelPass.uniforms[ 'pixelSize' ].value =5;

composer = new EffectComposer( renderer );
composer.addPass( renderScene );
composer.addPass( afterimagePass );
composer.addPass( bloomPass );

// RESIZE
window.addEventListener( 'resize', onWindowResize );


var update = function() {
  theta += 0.005;

  camera.position.x = Math.sin(theta)*3;
  camera.position.z = Math.cos(theta)*3;
  camera.position.y = Math.sin(theta);

  camera.lookAt(0,0,0);
}


function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}


function animate() {
  update();
  composer.render();
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);