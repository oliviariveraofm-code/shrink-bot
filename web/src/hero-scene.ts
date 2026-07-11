import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'

const MODEL_URL = '/models/android_head.glb'
const BG_COLOR = 0x0e0f13

const IDLE_ROTATION_SPEED = 0.003 // rad/frame
const SWAY_AMPLITUDE = THREE.MathUtils.degToRad(2.5)
const SWAY_SPEED = 0.4 // rad/sec (sine)

export function initHeroScene(container: HTMLElement): void {
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  let prefersReducedMotion = reducedMotionQuery.matches

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(BG_COLOR)

  const camera = new THREE.PerspectiveCamera(
    35,
    container.clientWidth / container.clientHeight,
    0.1,
    100,
  )

  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(container.clientWidth, container.clientHeight)
  container.appendChild(renderer.domElement)

  // Lighting: key light, cool rim/fill light, ambient fill.
  const keyLight = new THREE.DirectionalLight(0xffffff, 2)
  keyLight.position.set(2.5, 3, 3)
  scene.add(keyLight)

  const rimLight = new THREE.DirectionalLight(0x9fc4ff, 1)
  rimLight.position.set(-3, 1.5, -2)
  scene.add(rimLight)

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambientLight)

  const headGroup = new THREE.Group()
  scene.add(headGroup)

  const loader = new GLTFLoader()
  loader.setMeshoptDecoder(MeshoptDecoder)
  loader.load(
    MODEL_URL,
    (gltf) => {
      const model = gltf.scene

      // Center the model on its own bounding box so origin/camera math is
      // independent of how the source asset was authored.
      const box = new THREE.Box3().setFromObject(model)
      const center = box.getCenter(new THREE.Vector3())
      const size = box.getSize(new THREE.Vector3())

      model.position.sub(center)
      headGroup.add(model)

      const maxDim = Math.max(size.x, size.y, size.z)
      const fovRad = THREE.MathUtils.degToRad(camera.fov)
      const distance = (maxDim / 2 / Math.tan(fovRad / 2)) * 1.8

      camera.position.set(0, 0, distance)
      camera.lookAt(0, 0, 0)
      camera.near = distance / 100
      camera.far = distance * 100
      camera.updateProjectionMatrix()
    },
    undefined,
    (error) => {
      console.error('Failed to load hero head model:', error)
    },
  )

  function handleResize() {
    const width = container.clientWidth
    const height = container.clientHeight
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
  }

  window.addEventListener('resize', handleResize)
  reducedMotionQuery.addEventListener('change', (event) => {
    prefersReducedMotion = event.matches
  })

  const clock = new THREE.Clock()

  function animate() {
    requestAnimationFrame(animate)

    if (!prefersReducedMotion) {
      const elapsed = clock.getElapsedTime()
      headGroup.rotation.y += IDLE_ROTATION_SPEED
      headGroup.rotation.z = Math.sin(elapsed * SWAY_SPEED) * SWAY_AMPLITUDE
    }

    renderer.render(scene, camera)
  }

  animate()
}
