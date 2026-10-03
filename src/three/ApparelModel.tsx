import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import type { PrintStyle, ProductId } from '../lib/products'

// useDraco=true, useMeshopt=true — garments are meshopt-compressed glbs
useGLTF.preload('/models/crewneck.glb', true, true)
useGLTF.preload('/models/tshirt.glb', true, true)
useGLTF.preload('/models/hoodie.glb', true, true)

const MODEL_URL = {
  crew: '/models/crewneck.glb',
  tee: '/models/tshirt.glb',
  hoodie: '/models/hoodie.glb',
} as const

const PRINT = {
  crew: {
    full: { x: 0, y: 0.33, w: 0.86 },
    left: { x: 0.27, y: 0.6, w: 0.27 },
  },
  tee: {
    full: { x: 0, y: 0.38, w: 0.82 },
    left: { x: 0.3, y: 0.6, w: 0.27 },
  },
  hoodie: {
    full: { x: 0, y: 0.05, w: 0.7 },
    left: { x: 0.26, y: 0.12, w: 0.24 },
  },
} as const

const HEIGHT = 2.3

function kindFromProduct(product: ProductId): keyof typeof MODEL_URL {
  if (product === 'tee') return 'tee'
  if (product === 'hoodie' || product === 'zip') return 'hoodie'
  return 'crew'
}

function makePrintTexture(
  ink: string,
  name: string,
  number: string,
  style: PrintStyle,
  logo: HTMLImageElement | null,
) {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 1024
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, 1024, 1024)

  if (style === 'blank') {
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }

  const left = style === 'left'
  if (logo && logo.naturalWidth) {
    const ar = logo.naturalWidth / logo.naturalHeight
    let w = left ? 1024 * 0.34 : 1024 * 0.7
    let h = w / ar
    const maxH = left ? 1024 * 0.34 : 1024 * 0.7
    if (h > maxH) {
      h = maxH
      w = h * ar
    }
    const cx = left ? 1024 * 0.72 : 512
    const cy = left ? 1024 * 0.28 : 1024 * 0.36
    ctx.drawImage(logo, cx - w / 2, cy - h / 2, w, h)
  } else {
    ctx.fillStyle = ink
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = '800 96px Syne, sans-serif'
    ctx.fillText('FMD', left ? 720 : 512, left ? 320 : 420)
  }

  if (name || number) {
    ctx.fillStyle = ink
    ctx.textAlign = 'center'
    if (number) {
      ctx.font = '800 140px Syne, sans-serif'
      ctx.fillText(number.slice(0, 2), 512, 780)
    }
    if (name) {
      ctx.font = '700 46px Outfit, sans-serif'
      ctx.fillText(name.toUpperCase().slice(0, 12), 512, number ? 870 : 800)
    }
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  tex.needsUpdate = true
  return tex
}

export function ApparelModel({
  product,
  color,
  ink,
  print,
  playerName,
  playerNumber,
  animated = false,
}: {
  product: ProductId
  color: string
  ink: string
  print: PrintStyle
  playerName: string
  playerNumber: string
  animated?: boolean
}) {
  const kind = kindFromProduct(product)
  const gltf = useGLTF(MODEL_URL[kind], true, true)
  const group = useRef<THREE.Group>(null)
  const [logo, setLogo] = useState<HTMLImageElement | null>(null)

  useEffect(() => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => setLogo(img)
    img.src = '/img/logo2x.png'
  }, [])

  const scene = useMemo(() => {
    const root = gltf.scene.clone(true)
    root.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (!mesh.isMesh) return
      const mat = mesh.material as THREE.MeshPhysicalMaterial
      const matName = mat?.name || ''
      if (matName.startsWith('fabric') || matName === 'zip_tape') {
        const next = mat.clone() as THREE.MeshPhysicalMaterial
        next.color = new THREE.Color(color)
        if (matName === 'fabric_rib') next.color.multiplyScalar(0.94)
        if (matName === 'zip_tape') next.color.multiplyScalar(0.8)
        const hsl = { h: 0, s: 0, l: 0 }
        new THREE.Color(color).getHSL(hsl)
        if ('sheen' in next) {
          next.sheen = hsl.l < 0.2 ? 0.6 : 1
          next.sheenColor = new THREE.Color(color).lerp(
            new THREE.Color('#ffffff'),
            0.25 + hsl.l * 0.4,
          )
        }
        mesh.material = next
        mesh.castShadow = true
        mesh.receiveShadow = true
      } else if (mat) {
        mesh.material = Array.isArray(mat) ? mat.map((m) => m.clone()) : mat.clone()
      }
    })

    root.updateMatrixWorld(true)
    const box = new THREE.Box3().setFromObject(root)
    const sizeY = Math.max(0.001, box.max.y - box.min.y)
    root.scale.setScalar(HEIGHT / sizeY)
    root.updateMatrixWorld(true)
    const box2 = new THREE.Box3().setFromObject(root)
    const center = box2.getCenter(new THREE.Vector3())
    root.position.sub(center)
    root.position.y += 0.05
    return root
  }, [gltf.scene, color, kind])

  const printMap = useMemo(
    () => makePrintTexture(ink, playerName, playerNumber, print, logo),
    [ink, playerName, playerNumber, print, logo],
  )

  const place =
    print === 'blank' ? null : PRINT[kind][print === 'left' ? 'left' : 'full']

  useFrame((state) => {
    if (!animated || !group.current) return
    const t = state.clock.elapsedTime
    group.current.rotation.y = 0.2 + Math.sin(t * 0.35) * 0.5
    group.current.position.y = Math.sin(t * 0.85) * 0.04
  })

  return (
    <group ref={group} rotation={animated ? [0, 0, 0] : [0, 0.35, 0]}>
      <primitive object={scene} />
      {place && (
        <mesh position={[place.x, place.y, 0.52]} scale={[place.w, place.w, 1]}>
          <planeGeometry args={[1, 1]} />
          <meshStandardMaterial
            map={printMap}
            transparent
            roughness={0.7}
            metalness={0}
            depthWrite={false}
            polygonOffset
            polygonOffsetFactor={-4}
          />
        </mesh>
      )}
      {animated && (
        <mesh position={[0, -1.28, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.7, 0.95, 64]} />
          <meshBasicMaterial color="#3ad6bf" transparent opacity={0.2} />
        </mesh>
      )}
    </group>
  )
}
