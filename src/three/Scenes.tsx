import { Suspense, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import {
  ContactShadows,
  Environment,
  Float,
  OrbitControls,
} from '@react-three/drei'
import { EffectComposer, N8AO } from '@react-three/postprocessing'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import * as THREE from 'three'
import { ApparelModel } from './ApparelModel'
import type { PrintStyle, ProductId } from '../lib/products'

declare global {
  interface Window {
    __fmdLenis?: { stop: () => void; start: () => void }
  }
}

function StudioLights() {
  return (
    <>
      <hemisphereLight args={['#ffffff', '#1c2833', 0.55]} />
      <directionalLight
        castShadow
        position={[-3.2, 4.8, 5.2]}
        intensity={2.55}
        color="#fff6f0"
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.00012}
        shadow-normalBias={0.025}
      />
      <directionalLight position={[4.5, 2.6, -4]} intensity={1.65} color="#c3ddff" />
      <directionalLight position={[0, 6, 2]} intensity={0.75} color="#ffffff" />
    </>
  )
}

function configureGl(gl: THREE.WebGLRenderer) {
  gl.toneMapping = THREE.NeutralToneMapping
  gl.toneMappingExposure = 1.05
  gl.outputColorSpace = THREE.SRGBColorSpace
  gl.shadowMap.enabled = true
  gl.shadowMap.type = THREE.PCFShadowMap
}

function Effects() {
  return (
    <EffectComposer multisampling={4}>
      <N8AO
        aoRadius={0.55}
        intensity={1.35}
        distanceFalloff={0.75}
        quality="high"
        halfRes
      />
    </EffectComposer>
  )
}

function GarmentOrbit({ autoRotate = true }: { autoRotate?: boolean }) {
  const controls = useRef<OrbitControlsImpl>(null)

  useEffect(() => {
    const el = controls.current?.domElement
    if (!el) return

    const lockScroll = () => window.__fmdLenis?.stop()
    const unlockScroll = () => {
      window.__fmdLenis?.start()
      // Resume gentle spin after user lets go
      if (controls.current && autoRotate) {
        window.setTimeout(() => {
          if (controls.current) controls.current.autoRotate = true
        }, 2200)
      }
    }
    const pauseSpin = () => {
      lockScroll()
      if (controls.current) controls.current.autoRotate = false
    }

    el.addEventListener('pointerdown', pauseSpin)
    el.addEventListener('pointerup', unlockScroll)
    el.addEventListener('pointercancel', unlockScroll)
    el.addEventListener('pointerleave', unlockScroll)
    window.addEventListener('pointerup', unlockScroll)

    return () => {
      el.removeEventListener('pointerdown', pauseSpin)
      el.removeEventListener('pointerup', unlockScroll)
      el.removeEventListener('pointercancel', unlockScroll)
      el.removeEventListener('pointerleave', unlockScroll)
      window.removeEventListener('pointerup', unlockScroll)
      unlockScroll()
    }
  }, [autoRotate])

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enablePan={false}
      enableZoom={false}
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={0.9}
      autoRotate={autoRotate}
      autoRotateSpeed={1.35}
      minPolarAngle={Math.PI * 0.32}
      maxPolarAngle={Math.PI * 0.62}
      target={[0, 0.05, 0]}
    />
  )
}

function bindCanvasScrollLock(canvas: HTMLCanvasElement) {
  canvas.style.touchAction = 'none'
  const block = (e: Event) => {
    e.preventDefault()
  }
  canvas.addEventListener('wheel', block, { passive: false })
  canvas.addEventListener('touchmove', block, { passive: false })
  return () => {
    canvas.removeEventListener('wheel', block)
    canvas.removeEventListener('touchmove', block)
  }
}

function CanvasShell({
  className,
  camera,
  autoRotate,
  children,
}: {
  className?: string
  camera: { position: [number, number, number]; fov: number }
  autoRotate?: boolean
  children: React.ReactNode
}) {
  return (
    <div
      className={className ?? 'canvas-wrap'}
      data-orbit="true"
      data-lenis-prevent
      data-lenis-prevent-touch
      data-lenis-prevent-wheel
      style={{ width: '100%', height: '100%', touchAction: 'none' }}
      onPointerDown={() => window.__fmdLenis?.stop()}
      onPointerUp={() => window.__fmdLenis?.start()}
      onPointerCancel={() => window.__fmdLenis?.start()}
    >
      <Canvas
        shadows
        dpr={[1.75, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          preserveDrawingBuffer: true,
        }}
        onCreated={({ gl }) => {
          configureGl(gl)
          bindCanvasScrollLock(gl.domElement)
        }}
        camera={camera}
        style={{ touchAction: 'none' }}
        onPointerMissed={() => window.__fmdLenis?.start()}
      >
        <Suspense fallback={null}>
          <StudioLights />
          <Environment
            files="/hdri/studio.hdr"
            environmentIntensity={0.78}
            background={false}
          />
          {children}
          <GarmentOrbit autoRotate={autoRotate} />
          <Effects />
        </Suspense>
      </Canvas>
    </div>
  )
}

export function HeroCanvas({
  product,
  color,
  ink,
  print,
  playerName,
  playerNumber,
}: {
  product: ProductId
  color: string
  ink: string
  print: PrintStyle
  playerName: string
  playerNumber: string
}) {
  return (
    <CanvasShell
      camera={{ position: [0.35, 0.18, 6.1], fov: 26 }}
      autoRotate
    >
      <Float speed={0.9} rotationIntensity={0} floatIntensity={0.14}>
        <ApparelModel
          product={product}
          color={color}
          ink={ink}
          print={print}
          playerName={playerName}
          playerNumber={playerNumber}
          animated={false}
        />
      </Float>
      <ContactShadows
        position={[0, -1.3, 0]}
        opacity={0.5}
        scale={10}
        blur={3.5}
        far={5}
      />
    </CanvasShell>
  )
}

export function StudioCanvas({
  product,
  color,
  ink,
  print,
  playerName,
  playerNumber,
  customLogoUrl = null,
}: {
  product: ProductId
  color: string
  ink: string
  print: PrintStyle
  playerName: string
  playerNumber: string
  customLogoUrl?: string | null
}) {
  return (
    <CanvasShell
      className="canvas-wrap studio-canvas"
      camera={{ position: [0.1, 0.12, 5.6], fov: 26 }}
      autoRotate
    >
      <Float speed={0.55} rotationIntensity={0} floatIntensity={0.08}>
        <ApparelModel
          product={product}
          color={color}
          ink={ink}
          print={print}
          playerName={playerName}
          playerNumber={playerNumber}
          customLogoUrl={customLogoUrl}
        />
      </Float>
      <ContactShadows
        position={[0, -1.28, 0]}
        opacity={0.48}
        scale={9}
        blur={3.1}
        far={4.5}
      />
    </CanvasShell>
  )
}
