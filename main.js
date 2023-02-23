import './style.css'
import { gsap } from "gsap";
import * as THREE from 'three'
import * as dat from 'lil-gui'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

const ironmanAnimate = (ironman) => {
  const clock = new THREE.Clock()
  const elapsedTime = clock.getElapsedTime()
  const angle = elapsedTime * 0.5
  ironman.position.x = Math.cos(angle) * 4
  ironman.position.z = Math.sin(angle) * 4
  ironman.position.y = Math.sin(elapsedTime * 3)
  
}

// 鋼鐵人
const ironManMTL = new MTLLoader()
ironManMTL.load('/IronMan.mtl', function (materials) {
    materials.preload()
    const ironManLoader = new OBJLoader();
    ironManLoader.setMaterials(materials)
   // load a resource
    ironManLoader.load(
      // resource URL
      '/IronMan.obj',
      // called when resource is loaded
      function (ironman) {
        scene.add(ironman);
        ironman.scale.set(.01, .01, .01)
        ironman.position.set(0, 2, 7)
        gsap.to(ironman.position,{
          y: 2.1,
          yoyo: true,
          repeat: -1,
          duration: 1
        })
      },
    );
  
}, )
const ironmanLight = new THREE.PointLight('#ffffff', 2.2, 10)
ironmanLight.position.set(0, 5, 8)
ironmanLight.castShadow = true
scene.add(ironmanLight)

//test end
//3D標題
const fontLoader = new FontLoader()
fontLoader.load(
  '/fonts/helvetiker_regular.typeface.json',
  (font) =>
  {
      const textGeometry = new TextGeometry(
          'Haunted House by Sean',
          {
              font: font,
              size: 1,
              height: 0.2,
              curveSegments: 100,
              bevelEnabled: true,
              bevelThickness: 0.03,
              bevelSize: 0.02,
              bevelOffset: 0,
              bevelSegments: 5,
          }
      )
      const textMaterial = new THREE.MeshBasicMaterial()
      const text = new THREE.Mesh(textGeometry, textMaterial)
      scene.add(text)
      text.position.y = 5
      textGeometry.center()
  }
)

// 門 圖片
const textureLoader = new THREE.TextureLoader()
const doorColorTexture = textureLoader.load('/static/textures/door/color.jpg')
const doorAlphaTexture = textureLoader.load('/static/textures/door/alpha.jpg')
const doorAmbientOcclusionTexture = textureLoader.load('/static/textures/door/ambientOcclusion.jpg')
const doorHeightTexture = textureLoader.load('/static/textures/door/height.jpg')
const doorNormalTexture = textureLoader.load('/static/textures/door/normal.jpg')
const doorMetalnessTexture = textureLoader.load('/static/textures/door/metalness.jpg')
const doorRoughnessTexture = textureLoader.load('/static/textures/door/roughness.jpg')

// 房子外層
const house = new THREE.Group()
scene.add(house)

//牆壁
const bricksColorTexture = textureLoader.load('/static/textures/bricks/color.jpg')
const bricksAmbientOcclusionTexture = textureLoader.load('/static/textures/bricks/ambientOcclusion.jpg')
const bricksNormalTexture = textureLoader.load('/static/textures/bricks/normal.jpg')
const bricksRoughnessTexture = textureLoader.load('/static/textures/bricks/roughness.jpg')

const walls = new THREE.Mesh(
  new THREE.BoxGeometry(4, 2.5, 4), //大小
  new THREE.MeshStandardMaterial({
      map: bricksColorTexture,
      aoMap: bricksAmbientOcclusionTexture,
      normalMap: bricksNormalTexture,
      roughnessMap: bricksRoughnessTexture
  })
)
walls.geometry.setAttribute('uv2', new THREE.Float32BufferAttribute(walls.geometry.attributes.uv.array, 2))
walls.position.y = 1.25 //位置
house.add(walls)

//天花板
const roof = new THREE.Mesh(
  new THREE.ConeGeometry(3.5, 1, 4),
  new THREE.MeshStandardMaterial({ color: '#b35f45' })
)
roof.rotation.y = Math.PI * 0.25 // 轉四分之一圈
roof.position.y = 2.5 + 0.5 //牆壁的高度再加上 0.5 單位
house.add(roof)

// 門
const door = new THREE.Mesh(
  new THREE.PlaneGeometry(2, 2, 100, 100),
  new THREE.MeshStandardMaterial({
      map: doorColorTexture,
      transparent: true,
      alphaMap: doorAlphaTexture,
      aoMap: doorAmbientOcclusionTexture,
      displacementMap: doorHeightTexture,
      displacementScale: 0.1,
      normalMap: doorNormalTexture,
      metalnessMap: doorMetalnessTexture,
      roughnessMap: doorRoughnessTexture
  })
)
door.geometry.setAttribute('uv2', new THREE.Float32BufferAttribute(door.geometry.attributes.uv.array, 2))
door.position.y = 1
door.position.z = 2 + 0.01 // +0.01原因: z-fighting  
house.add(door)

//窗戶
const windows = new THREE.Mesh(
  new THREE.PlaneGeometry(.3, 1),
  new THREE.MeshStandardMaterial({ color: '#ff0000' })
)

const paperGeo = new THREE.PlaneGeometry(.3, 1)
const paperMesh = new THREE.MeshStandardMaterial({ color: '#ff0000' })

const paper1 = new THREE.Mesh( paperGeo, paperMesh)
paper1.position.set(1.2, 1.5, 2.01)

const paper2 = new THREE.Mesh( paperGeo, paperMesh)
paper2.position.set(-1.2, 1.5, 2.05)

const paper3 = new THREE.Mesh( paperGeo, paperMesh)
paper3.scale.set(.8, 1, 1)
paper3.position.set(0, 2.2, 2.05)
paper3.rotation.z = Math.PI * 0.5
house.add(paper1, paper2, paper3)

//煙囪
const tubeGeometry = new THREE.CylinderGeometry( 5, 10, 50, 10)
const tubeMaterial = new THREE.MeshBasicMaterial( { color: '#b2b6b1' } )
const tube = new THREE.Mesh( tubeGeometry, tubeMaterial )
tube.scale.set(.03, .03, .03)
tube.position.y = 3
tube.position.x = 1.2
house.add(tube);

//墳墓 使用迴圈
const graves = new THREE.Group()
scene.add(graves)
const graveGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.2)
const graveMaterial = new THREE.MeshStandardMaterial({ color: '#b2b6b1' })

for(let i = 0; i < 50; i++)
{
    const angle = Math.random() * Math.PI * 2 // Random angle
    const radius = 3 + Math.random() * 6      // Random radius
    const x = Math.cos(angle) * radius        // Get the x position using cosinus
    const z = Math.sin(angle) * radius        // Get the z position using sinus

    // Create the mesh
    const grave = new THREE.Mesh(graveGeometry, graveMaterial)

    // Position
    grave.position.set(x, 0.3, z)                              

    // Rotation
    grave.rotation.z = (Math.random() - 0.5) * 0.4
    grave.rotation.y = (Math.random() - 0.5) * 0.4


    //陰影
    grave.castShadow = true
    // Add to the graves container
    graves.add(grave)
}


//草叢
//設定共用材質, 大小
const bushGeometry = new THREE.SphereGeometry(1, 16, 16)
const bushMaterial = new THREE.MeshStandardMaterial({ color: '#89c854' })

const bush1 = new THREE.Mesh(bushGeometry, bushMaterial)
bush1.scale.set(0.5, 0.5, 0.5)
bush1.position.set(0.8, 0.2, 2.2)

const bush2 = new THREE.Mesh(bushGeometry, bushMaterial)
bush2.scale.set(0.25, 0.25, 0.25)
bush2.position.set(1.4, 0.1, 2.1)

const bush3 = new THREE.Mesh(bushGeometry, bushMaterial)
bush3.scale.set(0.4, 0.4, 0.4)
bush3.position.set(- 0.8, 0.1, 2.2)

const bush4 = new THREE.Mesh(bushGeometry, bushMaterial)
bush4.scale.set(0.15, 0.15, 0.15)
bush4.position.set(- 1, 0.05, 2.6)

house.add(bush1, bush2, bush3, bush4)


// 地板
const grassColorTexture = textureLoader.load('/static/textures/grass/color.jpg')
const grassAmbientOcclusionTexture = textureLoader.load('/static/textures/grass/ambientOcclusion.jpg')
const grassNormalTexture = textureLoader.load('/static/textures/grass/normal.jpg')
const grassRoughnessTexture = textureLoader.load('/static/textures/grass/roughness.jpg')

//縮小草地
grassColorTexture.repeat.set(8, 8)
grassAmbientOcclusionTexture.repeat.set(8, 8)
grassNormalTexture.repeat.set(8, 8)
grassRoughnessTexture.repeat.set(8, 8)

grassColorTexture.wrapS = THREE.RepeatWrapping
grassAmbientOcclusionTexture.wrapS = THREE.RepeatWrapping
grassNormalTexture.wrapS = THREE.RepeatWrapping
grassRoughnessTexture.wrapS = THREE.RepeatWrapping

grassColorTexture.wrapT = THREE.RepeatWrapping
grassAmbientOcclusionTexture.wrapT = THREE.RepeatWrapping
grassNormalTexture.wrapT = THREE.RepeatWrapping
grassRoughnessTexture.wrapT = THREE.RepeatWrapping

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({
      map: grassColorTexture,
      aoMap: grassAmbientOcclusionTexture,
      normalMap: grassNormalTexture,
      roughnessMap: grassRoughnessTexture
  })
)
floor.geometry.setAttribute('uv2', new THREE.Float32BufferAttribute(floor.geometry.attributes.uv.array, 2))
floor.rotation.x = - Math.PI * 0.5
floor.position.y = 0
scene.add(floor)

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight('#b9d5ff', 0.12)
gui.add(ambientLight, 'intensity').min(0).max(1).step(0.001)
scene.add(ambientLight)

// Directional light
const moonLight = new THREE.DirectionalLight('#b9d5ff', 0.12)
moonLight.position.set(4, 5, - 2)
gui.add(moonLight, 'intensity').min(0).max(1).step(0.001)
gui.add(moonLight.position, 'x').min(- 5).max(5).step(0.001)
gui.add(moonLight.position, 'y').min(- 5).max(5).step(0.001)
gui.add(moonLight.position, 'z').min(- 5).max(5).step(0.001)
scene.add(moonLight)

//門口 燈
const doorLight = new THREE.PointLight('#ff7d46', 1, 7)
doorLight.position.set(0, 2.2, 2.7)
house.add(doorLight)



//霧
const fog = new THREE.Fog('#262837', 1, 15)
scene.fog = fog

//鬼
/**
 * Ghosts
 */
const ghost1 = new THREE.PointLight('#ffffff', 2, 3)
scene.add(ghost1)

const ghost2 = new THREE.PointLight('#f0f0f0', 2, 3)
scene.add(ghost2)

const ghost3 = new THREE.PointLight('#e8e8e8', 2, 3)
scene.add(ghost3)

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
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 4
camera.position.y = 2
camera.position.z = 5
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor('#262837')
walls.castShadow = true
bush1.castShadow = true
bush2.castShadow = true
bush3.castShadow = true
bush4.castShadow = true
floor.receiveShadow = true

// 陰影
renderer.shadowMap.enabled = true //啟動陰影
moonLight.castShadow = true
doorLight.castShadow = true
ghost1.castShadow = true
ghost2.castShadow = true
ghost3.castShadow = true

moonLight.shadow.mapSize.width = 256
moonLight.shadow.mapSize.height = 256
moonLight.shadow.camera.far = 15

doorLight.shadow.mapSize.width = 256
doorLight.shadow.mapSize.height = 256
doorLight.shadow.camera.far = 7

ghost1.shadow.mapSize.width = 256
ghost1.shadow.mapSize.height = 256
ghost1.shadow.camera.far = 7

ghost2.shadow.mapSize.width = 256
ghost2.shadow.mapSize.height = 256
ghost2.shadow.camera.far = 7

ghost3.shadow.mapSize.width = 256
ghost3.shadow.mapSize.height = 256
ghost3.shadow.camera.far = 7

renderer.shadowMap.type = THREE.PCFSoftShadowMap

/**
 * Animate
 */
const clock = new THREE.Clock()
const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    //鬼 動畫
    // Ghosts
    const ghost1Angle = elapsedTime * 0.5
    ghost1.position.x = Math.cos(ghost1Angle) * 4
    ghost1.position.z = Math.sin(ghost1Angle) * 4
    ghost1.position.y = Math.sin(elapsedTime * 3)

    const ghost2Angle = - elapsedTime * 0.32
    ghost2.position.x = Math.cos(ghost2Angle) * 5
    ghost2.position.z = Math.sin(ghost2Angle) * 5
    ghost2.position.y = Math.sin(elapsedTime * 4) + Math.sin(elapsedTime * 2.5)

    const ghost3Angle = - elapsedTime * 0.18
    ghost3.position.x = Math.cos(ghost3Angle) * (7 + Math.sin(elapsedTime * 0.32))
    ghost3.position.z = Math.sin(ghost3Angle) * (7 + Math.sin(elapsedTime * 0.5))
    ghost3.position.y = Math.sin(elapsedTime * 4) + Math.sin(elapsedTime * 2.5)

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()