import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { DecalGeometry } from 'three/examples/jsm/geometries/DecalGeometry.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import * as THREE from 'three'
import type { PrintStyle, ProductId } from '../lib/products'

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
    back: { x: 0, y: 0.45, w: 0.85 },
  },
  tee: {
    full: { x: 0, y: 0.38, w: 0.82 },
    left: { x: 0.3, y: 0.6, w: 0.27 },
    back: { x: 0, y: 0.42, w: 0.9 },
  },
  hoodie: {
    full: { x: 0, y: 0.05, w: 0.7 },
    left: { x: 0.26, y: 0.12, w: 0.24 },
    back: { x: 0, y: 0.1, w: 0.85 },
  },
} as const

const HEIGHT = 2.3

function kindFromProduct(product: ProductId): keyof typeof MODEL_URL {
  if (product === 'tee') return 'tee'
  if (product === 'hoodie' || product === 'zip') return 'hoodie'
  return 'crew'
}

function toFloat(attr: THREE.BufferAttribute | THREE.InterleavedBufferAttribute) {
  const out = new Float32Array(attr.count * attr.itemSize)
  for (let i = 0; i < attr.count; i++) {
    for (let k = 0; k < attr.itemSize; k++) {
      out[i * attr.itemSize + k] = attr.getComponent(i, k)
    }
  }
  return new THREE.BufferAttribute(out, attr.itemSize)
}

function weaveNormalMap() {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const img = ctx.createImageData(size, size)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4
      // Fine knit pattern → fake tangent-space normal
      const wx = Math.sin(x * 0.55) * 0.5 + 0.5
      const wy = Math.sin(y * 0.55) * 0.5 + 0.5
      const nx = (wx - 0.5) * 0.35 + 0.5
      const ny = (wy - 0.5) * 0.35 + 0.5
      img.data[i] = Math.floor(nx * 255)
      img.data[i + 1] = Math.floor(ny * 255)
      img.data[i + 2] = 255
      img.data[i + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(48, 48)
  tex.anisotropy = 16
  tex.colorSpace = THREE.NoColorSpace
  return tex
}

const sharedWeave = weaveNormalMap()

function fabricFrom(orig: THREE.Material, color: string, matName: string) {
  const m = new THREE.MeshPhysicalMaterial()
  THREE.MeshStandardMaterial.prototype.copy.call(
    m,
    orig as THREE.MeshStandardMaterial,
  )
  m.type = 'MeshPhysicalMaterial'
  // Keep weave detail (normal / AO), drop baked color so we can dye cleanly
  m.map = null
  m.color = new THREE.Color(color)
  // Soft fleece / jersey response
  m.roughness = 0.78
  m.metalness = 0
  m.sheen = 1.2
  m.sheenRoughness = 0.38
  m.sheenColor = new THREE.Color('#ffffff')
  m.clearcoat = 0.015
  m.clearcoatRoughness = 0.85
  m.side = THREE.DoubleSide
  m.envMapIntensity = 0.9

  if (m.normalMap && m.normalMap !== sharedWeave) {
    m.normalScale = new THREE.Vector2(1.65, 1.65)
    m.normalMap.anisotropy = 16
  } else {
    m.normalMap = sharedWeave
    m.normalScale = new THREE.Vector2(1.1, 1.1)
  }
  if (m.aoMap) m.aoMapIntensity = 1.35

  if (matName === 'fabric_rib') {
    m.color.multiplyScalar(0.93)
    m.roughness = 0.86
    m.sheenRoughness = 0.48
    m.normalScale = new THREE.Vector2(2.0, 2.0)
  }
  if (matName === 'zip_tape') m.color.multiplyScalar(0.8)

  const hsl = { h: 0, s: 0, l: 0 }
  new THREE.Color(color).getHSL(hsl)
  m.sheen = hsl.l < 0.2 ? 0.7 : 1.25
  m.sheenColor = new THREE.Color(color).lerp(
    new THREE.Color('#ffffff'),
    0.38 + hsl.l * 0.45,
  )

  // Slightly darker interior so cloth reads thicker
  m.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <color_fragment>',
      `#include <color_fragment>
       if (!gl_FrontFacing) { diffuseColor.rgb *= 0.55; }`,
    )
  }
  m.customProgramCacheKey = () => 'fmd-fabric-v3'
  return m
}

function makeFrontTexture(
  style: PrintStyle,
  logo: HTMLImageElement | null,
  ink: string,
) {
  const size = 2048
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, size, size)
  if (style === 'blank') {
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 16
    return tex
  }
  const left = style === 'left'
  if (logo?.naturalWidth) {
    const ar = logo.naturalWidth / logo.naturalHeight
    let w = left ? size * 0.9 : size * 0.88
    let h = w / ar
    const maxH = left ? size * 0.9 : size * 0.88
    if (h > maxH) {
      h = maxH
      w = h * ar
    }
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(logo, (size - w) / 2, (size - h) / 2, w, h)
  } else {
    ctx.fillStyle = ink
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = `800 ${size * 0.18}px Syne, sans-serif`
    ctx.fillText('FMD', size / 2, size / 2)
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 16
  tex.needsUpdate = true
  return tex
}

function makeBackTexture(name: string, number: string, garmentHex: string) {
  const size = 2048
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, size, size)
  const n = name.toUpperCase().trim()
  const num = number.trim()
  if (!n && !num) {
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }

  const c = Number.parseInt(garmentHex.replace('#', ''), 16)
  const r = (c >> 16) & 255
  const g = (c >> 8) & 255
  const b = c & 255
  const light = 0.299 * r + 0.587 * g + 0.114 * b > 140
  const ink = light ? '#1a2430' : '#f4f7fa'

  ctx.fillStyle = ink
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  if (n) {
    let fs = size * 0.11
    ctx.font = `800 ${fs}px Outfit, sans-serif`
    while (ctx.measureText(n).width > size * 0.82 && fs > 24) {
      fs -= 4
      ctx.font = `800 ${fs}px Outfit, sans-serif`
    }
    ctx.fillText(n, size / 2, size * 0.28)
  }
  if (num) {
    let fs = size * 0.42
    ctx.font = `800 ${fs}px Syne, sans-serif`
    while (ctx.measureText(num).width > size * 0.7 && fs > 40) {
      fs -= 8
      ctx.font = `800 ${fs}px Syne, sans-serif`
    }
    ctx.lineJoin = 'round'
    ctx.lineWidth = size * 0.012
    ctx.strokeStyle = light ? 'rgba(0,0,0,0.18)' : 'rgba(0,0,0,0.35)'
    const y = n ? size * 0.58 : size * 0.48
    ctx.strokeText(num, size / 2, y)
    ctx.fillText(num, size / 2, y)
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 16
  tex.needsUpdate = true
  return tex
}

function decalMaterial(map: THREE.Texture) {
  return new THREE.MeshStandardMaterial({
    map,
    transparent: true,
    roughness: 0.72,
    metalness: 0,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -4,
    polygonOffsetUnits: -4,
  })
}

function surfacePoint(
  target: THREE.Mesh,
  x: number,
  y: number,
  side: 1 | -1,
) {
  const ray = new THREE.Raycaster(
    new THREE.Vector3(x, y, side * 10),
    new THREE.Vector3(0, 0, -side),
  )
  const hit = ray.intersectObject(target, false)[0]
  return hit?.point ?? null
}

function placeDecal(
  target: THREE.Mesh,
  parent: THREE.Group,
  slot: string,
  existing: Record<string, THREE.Mesh | null>,
  spec: { x: number; y: number; w: number } | null,
  side: 1 | -1,
  w: number,
  h: number,
  mat: THREE.Material,
) {
  if (existing[slot]) {
    parent.remove(existing[slot]!)
    existing[slot]!.geometry.dispose()
    existing[slot] = null
  }
  if (!spec || !w) return
  const p = surfacePoint(target, spec.x, spec.y, side)
  if (!p) return
  const geo = new DecalGeometry(
    target,
    p,
    new THREE.Euler(0, side > 0 ? 0 : Math.PI, 0),
    new THREE.Vector3(w, h, 0.45),
  )
  const mesh = new THREE.Mesh(geo, mat)
  mesh.renderOrder = 2
  parent.add(mesh)
  existing[slot] = mesh
}

export function ApparelModel({
  product,
  color,
  ink,
  print,
  playerName,
  playerNumber,
  animated = false,
  customLogoUrl = null,
}: {
  product: ProductId
  color: string
  ink: string
  print: PrintStyle
  playerName: string
  playerNumber: string
  animated?: boolean
  customLogoUrl?: string | null
}) {
  const kind = kindFromProduct(product)
  const gltf = useGLTF(MODEL_URL[kind], true, true)
  const group = useRef<THREE.Group>(null)
  const decalsRef = useRef<Record<string, THREE.Mesh | null>>({})
  const [logo, setLogo] = useState<HTMLImageElement | null>(null)

  useEffect(() => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => setLogo(img)
    img.onerror = () => setLogo(null)
    img.src = customLogoUrl || '/img/logo2x.png'
  }, [customLogoUrl])

  const prepared = useMemo(() => {
    const holder = new THREE.Group()
    const root = gltf.scene.clone(true)

    root.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (!mesh.isMesh) return
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      const next = mats.map((mat) => {
        const name = mat?.name || ''
        if (name.startsWith('fabric') || name === 'zip_tape') {
          return fabricFrom(mat, color, name)
        }
        return mat.clone()
      })
      mesh.material = Array.isArray(mesh.material) ? next : next[0]
      mesh.castShadow = true
      mesh.receiveShadow = true
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
    holder.add(root)
    holder.updateMatrixWorld(true)

    // Merged fabric surface for accurate print projection
    const parts: THREE.BufferGeometry[] = []
    root.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (!mesh.isMesh) return
      const mat = mesh.material as THREE.Material
      if (!(mat as THREE.MeshPhysicalMaterial).isMeshPhysicalMaterial) return
      const g = new THREE.BufferGeometry()
      g.setAttribute('position', toFloat(mesh.geometry.attributes.position))
      g.setAttribute('normal', toFloat(mesh.geometry.attributes.normal))
      if (mesh.geometry.index) {
        g.setIndex(Array.from(mesh.geometry.index.array))
      }
      g.applyMatrix4(mesh.matrixWorld)
      parts.push(g.index ? g.toNonIndexed() : g)
    })

    const merged = mergeGeometries(parts)
    const target = new THREE.Mesh(
      merged ?? new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, visible: false }),
    )
    target.updateMatrixWorld(true)

    return { holder, target }
  }, [gltf.scene, color, kind])

  const frontTex = useMemo(
    () => makeFrontTexture(print, logo, ink),
    [print, logo, ink],
  )
  const backTex = useMemo(
    () => makeBackTexture(playerName, playerNumber, color),
    [playerName, playerNumber, color],
  )

  useEffect(() => {
    const { holder, target } = prepared
    const cfg = PRINT[kind]
    const frontMat = decalMaterial(frontTex)
    const backMat = decalMaterial(backTex)

    // Clear old decals owned by previous effect
    for (const key of Object.keys(decalsRef.current)) {
      const m = decalsRef.current[key]
      if (m) {
        holder.remove(m)
        m.geometry.dispose()
        decalsRef.current[key] = null
      }
    }

    if (print !== 'blank') {
      const spec = print === 'left' ? cfg.left : cfg.full
      const aspect =
        frontTex.image && (frontTex.image as HTMLCanvasElement).height
          ? (frontTex.image as HTMLCanvasElement).height /
            (frontTex.image as HTMLCanvasElement).width
          : 1
      const w = spec.w
      const h = w * Math.min(aspect, 1.35)
      placeDecal(
        target,
        holder,
        'front',
        decalsRef.current,
        spec,
        1,
        w,
        h,
        frontMat,
      )
    }

    const hasBack = playerName.trim() || playerNumber.trim()
    if (hasBack) {
      placeDecal(
        target,
        holder,
        'back',
        decalsRef.current,
        cfg.back,
        -1,
        cfg.back.w,
        cfg.back.w,
        backMat,
      )
    }

    return () => {
      frontMat.dispose()
      backMat.dispose()
    }
  }, [prepared, kind, print, frontTex, backTex, playerName, playerNumber])

  useFrame((state) => {
    if (!animated || !group.current) return
    const t = state.clock.elapsedTime
    group.current.rotation.y = 0.18 + Math.sin(t * 0.32) * 0.48
    group.current.position.y = Math.sin(t * 0.9) * 0.035
  })

  return (
    <group ref={group} rotation={animated ? [0, 0, 0] : [0, 0.32, 0]}>
      <primitive object={prepared.holder} />
      {animated && (
        <mesh position={[0, -1.28, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.72, 0.98, 64]} />
          <meshBasicMaterial color="#3ad6bf" transparent opacity={0.16} />
        </mesh>
      )}
    </group>
  )
}
