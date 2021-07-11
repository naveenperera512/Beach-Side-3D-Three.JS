import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as dat from 'dat.gui'
import waterVertexShader from './shaders/water/vertex.glsl'
import waterFragmentShader from './shaders/water/fragment.glsl'
import gsap from 'gsap'

/**
 * Base
 */
// Debug
const gui = new dat.GUI({ width: 340 })
const debugObject = {}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

const gltfLoader = new GLTFLoader()

/**
 * Water
 */
// Geometry
const waterGeometry = new THREE.PlaneGeometry(80, 25, 512, 512)

//Ship Model
let ship = null

gltfLoader.load(
    '/models/ship/scene.gltf',
    (gltf) =>
    {
        ship = gltf
        gltf.scene.scale.set(0.025, 0.025, 0.025)
        gltf.scene.position.z = -5
        gltf.scene.position.x = 13
        gltf.scene.rotation.y = -1.6
        gltf.scene.receiveShadow = true
        gltf.scene.traverse( function( node ) {
            if ( node.isMesh ) { node.receiveShadow = true; }
        } );
        scene.add(gltf.scene)   
    }
)

//Boat Model
// let boat = null

// gltfLoader.load(
//     '/models/boat/scene.gltf',
//     (gltf) =>
//     {
//         boat = gltf
//         gltf.scene.scale.set(0.004, 0.004, 0.004)
//         gltf.scene.position.z = -7
//         gltf.scene.position.x = -12
//         gltf.scene.rotation.y = 1.6
//         scene.add(gltf.scene)   
//     }
// )

//Coconut
let coconut = null

gltfLoader.load(
    '/models/coconut/scene.gltf',
    (gltf) =>
    {
        coconut = gltf
        gltf.scene.scale.set(0.0013, 0.0013, 0.0013)
        gltf.scene.position.x = -2
        gltf.scene.position.z = 9.25
        gltf.scene.rotation.z = -0.7
        gltf.scene.receiveShadow = true
        gltf.scene.traverse( function( node ) {
            if ( node.isMesh ) { node.receiveShadow = true; }
        } );
        scene.add(gltf.scene)
    }
)

//Coconut2
let coconut2 = null

gltfLoader.load(
    '/models/coconut2/scene.gltf',
    (gltf) =>
    {
        coconut2 = gltf
        gltf.scene.scale.set(0.0012, 0.0012, 0.0012)
        gltf.scene.position.x = 2
        gltf.scene.position.z = 9.25
        gltf.scene.rotation.z = 0.7
        gltf.scene.receiveShadow = true
        gltf.scene.traverse( function( node ) {
            if ( node.isMesh ) { node.receiveShadow = true; }
        } );
        scene.add(gltf.scene)
    }
)


// Water Colors
debugObject.depthColor = '#186691'
debugObject.surfaceColor = '#9bd8ff'

// gui.addColor(debugObject, 'depthColor').onChange(() => { waterMaterial.uniforms.uDepthColor.value.set(debugObject.depthColor) })
// gui.addColor(debugObject, 'surfaceColor').onChange(() => { waterMaterial.uniforms.uSurfaceColor.value.set(debugObject.surfaceColor) })

// Water Material
const waterMaterial = new THREE.ShaderMaterial({
    vertexShader: waterVertexShader,
    fragmentShader: waterFragmentShader,
    uniforms:
    {
        uTime: { value: 0 },
        
        uBigWavesElevation: { value: 0.083 },
        uBigWavesFrequency: { value: new THREE.Vector2(0.756, 1.526) },
        uBigWavesSpeed: { value: 0.75 },

        uSmallWavesElevation: { value: 0.23 },
        uSmallWavesFrequency: { value: 2.267 },
        uSmallWavesSpeed: { value: 0.2 },
        uSmallIterations: { value: 4 },

        uDepthColor: { value: new THREE.Color(debugObject.depthColor) },
        uSurfaceColor: { value: new THREE.Color(debugObject.surfaceColor) },
        uColorOffset: { value: 0.020 },
        uColorMultiplier: { value: 5.76 }
    }
})

// gui.add(waterMaterial.uniforms.uBigWavesElevation, 'value').min(0).max(1).step(0.001).name('uBigWavesElevation')
// gui.add(waterMaterial.uniforms.uBigWavesFrequency.value, 'x').min(0).max(10).step(0.001).name('uBigWavesFrequencyX')
// gui.add(waterMaterial.uniforms.uBigWavesFrequency.value, 'y').min(0).max(10).step(0.001).name('uBigWavesFrequencyY')
// gui.add(waterMaterial.uniforms.uBigWavesSpeed, 'value').min(0).max(4).step(0.001).name('uBigWavesSpeed')


// gui.add(waterMaterial.uniforms.uSmallWavesElevation, 'value').min(0).max(1).step(0.001).name('uSmallWavesElevation')
// gui.add(waterMaterial.uniforms.uSmallWavesFrequency, 'value').min(0).max(30).step(0.001).name('uSmallWavesFrequency')
// gui.add(waterMaterial.uniforms.uSmallWavesSpeed, 'value').min(0).max(4).step(0.001).name('uSmallWavesSpeed')
// gui.add(waterMaterial.uniforms.uSmallIterations, 'value').min(0).max(5).step(1).name('uSmallIterations')

// gui.add(waterMaterial.uniforms.uColorOffset, 'value').min(0).max(1).step(0.001).name('uColorOffset')
// gui.add(waterMaterial.uniforms.uColorMultiplier, 'value').min(0).max(10).step(0.001).name('uColorMultiplier')

// Water Mesh
const water = new THREE.Mesh(waterGeometry, waterMaterial)
water.rotation.x = - Math.PI * 0.5
water.rotation.z = - Math.PI * 1
scene.receiveShadow = true
        scene.traverse( function( node ) {
            if ( node.isMesh ) { node.receiveShadow = true; }
        } );
scene.add(water)

//Sphere Texture
const image = new Image()
const texture = new THREE.Texture(image)

image.onload = () =>
{
    texture.needsUpdate = true
}

image.src = '/textures/moon/moon.jpg'

//Sphere
const geometry = new THREE.SphereGeometry(4, 50, 50)
const material = new THREE.MeshBasicMaterial({ map: texture })
const mesh = new THREE.Mesh(geometry, material)
mesh.position.z = -30
mesh.position.y = 20
scene.add(mesh)

//Star
const starGeometry = new THREE.BufferGeometry()
const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff
})

const starVertices = []
for (let i = 0; i < 10000; i++)
{
    const x = (Math.random() - 0.5) * 5000
    const y = (Math.random() - 0.5) * 5000
    const z = -Math.random() * 1000
    starVertices.push(x, y, z)
}

console.log(starVertices)

starGeometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(
        starVertices, 3)
)

const stars = new THREE.Points(
    starGeometry, starMaterial)
    scene.add(stars)

//light
const directionalLight = new THREE.PointLight(0xffffff, 20)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 60
directionalLight.shadow.camera.left = -10
directionalLight.shadow.camera.top = 10
directionalLight.shadow.camera.right = 10
directionalLight.shadow.camera.bottom = -10
directionalLight.position.set(0, 10, -35)
scene.add(directionalLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(90, sizes.width / sizes.height, 0.1)
camera.position.set(0, 1, 10)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
debugObject.clearColor = '#121C24'
renderer.setClearColor(debugObject.clearColor)
/**
 * Animate
 */
const clock = new THREE.Clock()

gsap.to(mesh.position, { duration: 200, y: -4 })

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    //Ship Moving
    if (ship) {
        ship.scene.position.x -= 0.009;
        if (ship.scene.position.x < -13){
            ship.scene.position.x = 13
        }
    }

    //Boat Moving
    // if (boat) {
    //     boat.scene.position.x -= -0.009;
    //     if (boat.scene.position.x < -25){
    //         boat.scene.position.x = -7.5
    //     }
    // }

    //Coconut Moving
    if (coconut) {
        coconut.scene.rotation.z -= 0.00025;
        if (coconut.scene.rotation.z < -0.75){
            coconut.scene.rotation.z = -0.7
        }
    }

    //Coconut2 Moving
    if (coconut2) {
        coconut2.scene.rotation.z -= 0.00025;
        if (coconut2.scene.rotation.z < 0.7){
            coconut2.scene.rotation.z = 0.75
        }
    }


    // Water
    waterMaterial.uniforms.uTime.value = elapsedTime

    //Sun Rotation
    mesh.rotation.y += 0.002

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()