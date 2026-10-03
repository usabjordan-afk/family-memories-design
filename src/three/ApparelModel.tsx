import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { PrintStyle, ProductId } from '../lib/products'

function makeCrestTexture(
  colorInk: string,
  name: string,
  number: string,
  style: PrintStyle,
) {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 1024
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, 1024, 1024)

  if (style === 'blank') {
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 8
    return tex
  }

  const cx = style === 'left' ? 300 : 512
  const cy = style === 'left' ? 340 : 400
  const scale = style === 'left' ? 0.52 : 1

  ctx.save()
  ctx.translate(cx, cy)
  ctx.scale(scale, scale)

  // Soft glow plate
  const glow = ctx.createRadialGradient(0, 0, 20, 0, 0, 190)
  glow.addColorStop(0, hexToRgba(colorInk, 0.18))
  glow.addColorStop(1, hexToRgba(colorInk, 0))
  ctx.fillStyle = glow
  ctx.beginPath()
  ctx.arc(0, 0, 190, 0, Math.PI * 2)
  ctx.fill()

  ctx.beginPath()
  ctx.arc(0, 0, 168, 0, Math.PI * 2)
  ctx.strokeStyle = colorInk
  ctx.lineWidth = 9
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(0, 0, 148, 0, Math.PI * 2)
  ctx.strokeStyle = colorInk
  ctx.globalAlpha = 0.4
  ctx.lineWidth = 2.5
  ctx.stroke()
  ctx.globalAlpha = 1

  // Crest shield
  ctx.beginPath()
  ctx.moveTo(0, -108)
  ctx.bezierCurveTo(78, -108, 108, -42, 108, 12)
  ctx.bezierCurveTo(108, 78, 50, 122, 0, 148)
  ctx.bezierCurveTo(-50, 122, -108, 78, -108, 12)
  ctx.bezierCurveTo(-108, -42, -78, -108, 0, -108)
  ctx.closePath()
  ctx.fillStyle = hexToRgba(colorInk, 0.14)
  ctx.fill()
  ctx.strokeStyle = colorInk
  ctx.lineWidth = 7
  ctx.stroke()

  ctx.fillStyle = colorInk
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = '800 62px Syne, sans-serif'
  ctx.fillText('FMD', 0, -18)

  ctx.font = '600 20px Outfit, sans-serif'
  ctx.letterSpacing = '5px'
  ctx.fillText('FAMILY MEMORIES', 0, 38)
  ctx.font = '500 16px Outfit, sans-serif'
  ctx.fillText('DESIGN', 0, 62)
  ctx.restore()

  if (name || number) {
    ctx.fillStyle = colorInk
    ctx.textAlign = 'center'
    if (number) {
      ctx.font = '800 130px Syne, sans-serif'
      ctx.fillText(number.slice(0, 2), 512, 730)
    }
    if (name) {
      ctx.font = '700 46px Outfit, sans-serif'
      ctx.letterSpacing = '6px'
      ctx.fillText(name.toUpperCase().slice(0, 12), 512, number ? 818 : 760)
    }
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  tex.needsUpdate = true
  return tex
}

function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace('#', '')
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h
  const n = Number.parseInt(full, 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function useFabric(color: string, darker = 0) {
  return useMemo(() => {
    const c = new THREE.Color(color)
    if (darker) c.offsetHSL(0, 0, darker)
    return new THREE.MeshPhysicalMaterial({
      color: c,
      roughness: 0.78,
      metalness: 0.04,
      sheen: 1,
      sheenRoughness: 0.48,
      sheenColor: new THREE.Color('#ffffff'),
      clearcoat: 0.04,
      clearcoatRoughness: 0.85,
    })
  }, [color, darker])
}

function RoundedTorso({
  width,
  height,
  depth,
  material,
}: {
  width: number
  height: number
  depth: number
  material: THREE.Material
}) {
  const geo = useMemo(() => {
    const g = new THREE.BoxGeometry(width, height, depth, 8, 10, 4)
    const pos = g.attributes.position
    const v = new THREE.Vector3()
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i)
      // Soften sides into a body-like taper
      const yNorm = (v.y + height / 2) / height
      const taper = 1 - Math.pow(1 - yNorm, 1.4) * 0.08
      const belly = 1 + Math.sin(yNorm * Math.PI) * 0.035
      v.x *= taper * belly
      v.z *= 0.92 + Math.sin(yNorm * Math.PI) * 0.08
      // Round corners slightly
      const edge = Math.min(1, Math.abs(v.x) / (width * 0.5))
      v.z *= 1 - edge * 0.08
      pos.setXYZ(i, v.x, v.y, v.z)
    }
    g.computeVertexNormals()
    return g
  }, [width, height, depth])

  return (
    <mesh geometry={geo} material={material} castShadow receiveShadow />
  )
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
  const group = useRef<THREE.Group>(null)
  const fabric = useFabric(color)
  const rib = useFabric(color, -0.05)
  const lining = useFabric(color, -0.08)

  const printMap = useMemo(
    () => makeCrestTexture(ink, playerName, playerNumber, print),
    [ink, playerName, playerNumber, print],
  )

  const printMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        map: printMap,
        transparent: true,
        roughness: 0.65,
        metalness: 0,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    [printMap],
  )

  useFrame((state) => {
    if (!animated || !group.current) return
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.9) * 0.04
  })

  const isHoodie = product === 'hoodie' || product === 'zip'
  const isTee = product === 'tee'
  const torsoW = isTee ? 1.5 : 1.68
  const torsoH = isTee ? 1.5 : 1.72
  const torsoD = isTee ? 0.46 : 0.56
  const sleeveL = isTee ? 0.42 : 0.92
  const sleeveR = isTee ? 0.2 : 0.24

  return (
    <group ref={group} position={[0, isHoodie ? -0.1 : 0, 0]}>
      <group position={[0, 0.12, 0]}>
        <RoundedTorso
          width={torsoW}
          height={torsoH}
          depth={torsoD}
          material={fabric}
        />

        {/* Neck opening fill */}
        <mesh position={[0, torsoH / 2 - 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.26, 0.09, 12, 28]} />
          <primitive object={rib} attach="material" />
        </mesh>

        {/* Shoulders */}
        <mesh
          castShadow
          position={[-0.72, torsoH / 2 - 0.28, 0]}
          rotation={[0, 0, 0.42]}
        >
          <capsuleGeometry args={[0.24, 0.28, 8, 16]} />
          <primitive object={fabric} attach="material" />
        </mesh>
        <mesh
          castShadow
          position={[0.72, torsoH / 2 - 0.28, 0]}
          rotation={[0, 0, -0.42]}
        >
          <capsuleGeometry args={[0.24, 0.28, 8, 16]} />
          <primitive object={fabric} attach="material" />
        </mesh>

        {/* Sleeves */}
        <mesh
          castShadow
          position={[-1.02, isTee ? 0.42 : 0.18, 0]}
          rotation={[0.08, 0, 0.62]}
        >
          <capsuleGeometry args={[sleeveR, sleeveL, 8, 18]} />
          <primitive object={fabric} attach="material" />
        </mesh>
        <mesh
          castShadow
          position={[1.02, isTee ? 0.42 : 0.18, 0]}
          rotation={[0.08, 0, -0.62]}
        >
          <capsuleGeometry args={[sleeveR, sleeveL, 8, 18]} />
          <primitive object={fabric} attach="material" />
        </mesh>

        {/* Cuffs */}
        {!isTee && (
          <>
            <mesh
              castShadow
              position={[-1.28, -0.42, 0.05]}
              rotation={[0.1, 0, 0.62]}
            >
              <capsuleGeometry args={[0.23, 0.08, 6, 14]} />
              <primitive object={rib} attach="material" />
            </mesh>
            <mesh
              castShadow
              position={[1.28, -0.42, 0.05]}
              rotation={[0.1, 0, -0.62]}
            >
              <capsuleGeometry args={[0.23, 0.08, 6, 14]} />
              <primitive object={rib} attach="material" />
            </mesh>
          </>
        )}

        {/* Hem */}
        <mesh castShadow position={[0, -torsoH / 2 + 0.06, 0]}>
          <boxGeometry args={[torsoW * 0.98, 0.13, torsoD * 1.04]} />
          <primitive object={rib} attach="material" />
        </mesh>

        {isHoodie && (
          <group>
            <mesh castShadow position={[-0.2, torsoH / 2 + 0.18, -0.12]} rotation={[0.55, 0.25, 0.1]}>
              <sphereGeometry args={[0.3, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.7]} />
              <primitive object={lining} attach="material" />
            </mesh>
            <mesh castShadow position={[0.2, torsoH / 2 + 0.18, -0.12]} rotation={[0.55, -0.25, -0.1]}>
              <sphereGeometry args={[0.3, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.7]} />
              <primitive object={lining} attach="material" />
            </mesh>
            <mesh castShadow position={[0, torsoH / 2 + 0.05, -0.22]}>
              <torusGeometry args={[0.22, 0.1, 10, 20, Math.PI * 1.2]} />
              <primitive object={fabric} attach="material" />
            </mesh>
            <mesh castShadow position={[0, -0.2, torsoD / 2 + 0.02]}>
              <boxGeometry args={[0.95, 0.42, 0.1]} />
              <primitive object={rib} attach="material" />
            </mesh>
            {product === 'zip' && (
              <mesh position={[0, 0.05, torsoD / 2 + 0.03]}>
                <boxGeometry args={[0.05, torsoH * 0.85, 0.02]} />
                <meshStandardMaterial
                  color="#2c343c"
                  metalness={0.7}
                  roughness={0.3}
                />
              </mesh>
            )}
            {/* Drawstrings */}
            <mesh position={[-0.08, torsoH / 2 - 0.15, torsoD / 2 + 0.02]}>
              <cylinderGeometry args={[0.015, 0.015, 0.45, 8]} />
              <meshStandardMaterial color={ink} roughness={0.6} />
            </mesh>
            <mesh position={[0.08, torsoH / 2 - 0.15, torsoD / 2 + 0.02]}>
              <cylinderGeometry args={[0.015, 0.015, 0.45, 8]} />
              <meshStandardMaterial color={ink} roughness={0.6} />
            </mesh>
          </group>
        )}

        {print !== 'blank' && (
          <mesh
            position={
              print === 'left'
                ? [-0.36, 0.42, torsoD / 2 + 0.015]
                : [0, 0.22, torsoD / 2 + 0.015]
            }
            scale={print === 'left' ? 0.52 : 1}
          >
            <planeGeometry args={[1.2, 1.2]} />
            <primitive object={printMat} attach="material" />
          </mesh>
        )}
      </group>

      {animated && (
        <mesh position={[0, -1.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.5, 0.78, 64]} />
          <meshBasicMaterial color="#3ad6bf" transparent opacity={0.16} />
        </mesh>
      )}
    </group>
  )
}
