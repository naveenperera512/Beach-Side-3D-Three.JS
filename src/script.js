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
        gltf.scene.scale.set(0.02, 0.02, 0.02)
        gltf.scene.position.z = -6
        gltf.scene.position.x = 18
        gltf.scene.rotation.y = -1.6
        scene.add(gltf.scene)   
    }
)

// Water Colors
debugObject.depthColor = '#186691'
debugObject.surfaceColor = '#9bd8ff'

gui.addColor(debugObject, 'depthColor').onChange(() => { waterMaterial.uniforms.uDepthColor.value.set(debugObject.depthColor) })
gui.addColor(debugObject, 'surfaceColor').onChange(() => { waterMaterial.uniforms.uSurfaceColor.value.set(debugObject.surfaceColor) })

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
        uColorOffset: { value: 0.091 },
        uColorMultiplier: { value: 5.76 }
    }
})

gui.add(waterMaterial.uniforms.uBigWavesElevation, 'value').min(0).max(1).step(0.001).name('uBigWavesElevation')
gui.add(waterMaterial.uniforms.uBigWavesFrequency.value, 'x').min(0).max(10).step(0.001).name('uBigWavesFrequencyX')
gui.add(waterMaterial.uniforms.uBigWavesFrequency.value, 'y').min(0).max(10).step(0.001).name('uBigWavesFrequencyY')
gui.add(waterMaterial.uniforms.uBigWavesSpeed, 'value').min(0).max(4).step(0.001).name('uBigWavesSpeed')


gui.add(waterMaterial.uniforms.uSmallWavesElevation, 'value').min(0).max(1).step(0.001).name('uSmallWavesElevation')
gui.add(waterMaterial.uniforms.uSmallWavesFrequency, 'value').min(0).max(30).step(0.001).name('uSmallWavesFrequency')
gui.add(waterMaterial.uniforms.uSmallWavesSpeed, 'value').min(0).max(4).step(0.001).name('uSmallWavesSpeed')
gui.add(waterMaterial.uniforms.uSmallIterations, 'value').min(0).max(5).step(1).name('uSmallIterations')

gui.add(waterMaterial.uniforms.uColorOffset, 'value').min(0).max(1).step(0.001).name('uColorOffset')
gui.add(waterMaterial.uniforms.uColorMultiplier, 'value').min(0).max(10).step(0.001).name('uColorMultiplier')

// Water Mesh
const water = new THREE.Mesh(waterGeometry, waterMaterial)
water.rotation.x = - Math.PI * 0.5
water.rotation.z = - Math.PI * 1
scene.add(water)

//Sphere Texture
const image = new Image()
const texture = new THREE.Texture(image)

image.onload = () =>
{
    texture.needsUpdate = true
}

image.src = '/textures/sun/sun2.jfif'

//Sphere
const geometry = new THREE.SphereGeometry(4, 50, 50)
const material = new THREE.MeshBasicMaterial({ map: texture })
const mesh = new THREE.Mesh(geometry, material)
mesh.position.z = -30
mesh.position.y = 25
scene.add(mesh)

//light
const directionalLight = new THREE.PointLight(0xffffff, 4.5)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 60
directionalLight.shadow.camera.left = -10
directionalLight.shadow.camera.top = 10
directionalLight.shadow.camera.right = 10
directionalLight.shadow.camera.bottom = -10
directionalLight.position.set(0, 10, 35)
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
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
debugObject.clearColor = '#121C24'
renderer.setClearColor(debugObject.clearColor)
/**
 * Animate
 */
const clock = new THREE.Clock()

gsap.to(mesh.position, { duration: 200, y: -5 })

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    //Ship Moving
    if (ship) {
        ship.scene.position.x -= 0.01;
        if (ship.scene.position.x < -25){
            ship.scene.position.x = 7.5
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