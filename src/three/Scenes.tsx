import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import {
  ContactShadows,
  Environment,
  Float,
  Lightformer,
  PresentationControls,
  SoftShadows,
} from '@react-three/drei'
import * as THREE from 'three'
import { ApparelModel } from './ApparelModel'
import type { PrintStyle, ProductId } from '../lib/products'

function StudioLights() {
  return (
    <>
      <hemisphereLight args={['#f3f7fb', '#1a2430', 0.55]} />
      <directionalLight
        castShadow
        position={[-2.8, 4.2, 4.5]}
        intensity={2.6}
        color="#fff6f0"
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0002}
      />
      <directionalLight
        position={[3.8, 2.2, -3.5]}
        intensity={1.55}
        color="#cfe8ff"
      />
      <directionalLight
        position={[0, 3.5, 2]}
        intensity={0.65}
        color="#ffffff"
      />
    </>
  )
}

function SoftEnv() {
  return (
    <Environment resolution={512} environmentIntensity={0.7}>
      <Lightformer
        form="rect"
        intensity={2.2}
        position={[0, 4, 2]}
        scale={[8, 3, 1]}
        color="#ffffff"
      />
      <Lightformer
        form="rect"
        intensity={1.4}
        position={[-4, 1, 1]}
        scale={[4, 6, 1]}
        color="#9ad7ff"
      />
      <Lightformer
        form="rect"
        intensity={1.1}
        position={[4, 0.5, -1]}
        scale={[3, 5, 1]}
        color="#ffe2c4"
      />
      <Lightformer
        form="ring"
        intensity={0.6}
        position={[0, 0, -4]}
        scale={6}
        color="#d7e8f5"
      />
    </Environment>
  )
}

const sharedGl = {
  antialias: true,
  alpha: true,
  powerPreference: 'high-performance' as const,
  toneMapping: THREE.ACESFilmicToneMapping,
  toneMappingExposure: 1.05,
  outputColorSpace: THREE.SRGBColorSpace,
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
    <div className="canvas-wrap" style={{ width: '100%', height: '100%' }}>
      <Canvas
        shadows
        dpr={[1.5, 2]}
        gl={sharedGl}
        camera={{ position: [0.2, 0.22, 5.9], fov: 27 }}
      >
        <Suspense fallback={null}>
          <SoftShadows size={18} samples={16} focus={0.85} />
          <StudioLights />
          <SoftEnv />
          <Float speed={1} rotationIntensity={0.08} floatIntensity={0.22}>
            <ApparelModel
              product={product}
              color={color}
              ink={ink}
              print={print}
              playerName={playerName}
              playerNumber={playerNumber}
              animated
            />
          </Float>
          <ContactShadows
            position={[0, -1.32, 0]}
            opacity={0.55}
            scale={9}
            blur={3.2}
            far={4.5}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}

export function StudioCanvas({
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
    <div className="canvas-wrap studio-canvas">
      <Canvas
        shadows
        dpr={[1.5, 2]}
        gl={sharedGl}
        camera={{ position: [0, 0.18, 5.5], fov: 27 }}
      >
        <Suspense fallback={null}>
          <SoftShadows size={16} samples={14} focus={0.9} />
          <StudioLights />
          <SoftEnv />
          <PresentationControls
            global
            snap
            rotation={[0.02, 0.18, 0]}
            polar={[-0.18, 0.22]}
            azimuth={[-0.9, 0.9]}
          >
            <Float speed={0.7} rotationIntensity={0.04} floatIntensity={0.14}>
              <ApparelModel
                product={product}
                color={color}
                ink={ink}
                print={print}
                playerName={playerName}
                playerNumber={playerNumber}
              />
            </Float>
          </PresentationControls>
          <ContactShadows
            position={[0, -1.3, 0]}
            opacity={0.5}
            scale={8}
            blur={2.8}
            far={4}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
