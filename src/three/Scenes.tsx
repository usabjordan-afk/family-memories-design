import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import {
  ContactShadows,
  Environment,
  Float,
  Lightformer,
  PresentationControls,
} from '@react-three/drei'
import * as THREE from 'three'
import { ApparelModel } from './ApparelModel'
import type { PrintStyle, ProductId } from '../lib/products'

function StudioLights() {
  return (
    <>
      <hemisphereLight args={['#f7fafc', '#15202b', 0.7]} />
      <directionalLight
        castShadow
        position={[-3, 4.5, 5]}
        intensity={2.8}
        color="#fff8f2"
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.00015}
        shadow-normalBias={0.02}
      />
      <directionalLight position={[4.2, 2.4, -3.8]} intensity={1.7} color="#b9dcff" />
      <directionalLight position={[0.5, 5, 1.5]} intensity={0.8} color="#ffffff" />
      <spotLight
        position={[0, 5.5, 3]}
        angle={0.4}
        penumbra={0.75}
        intensity={1.35}
        color="#fff4e8"
      />
    </>
  )
}

function SoftEnv() {
  return (
    <Environment resolution={1024} environmentIntensity={0.85}>
      <Lightformer
        form="rect"
        intensity={3}
        position={[0, 5, 3]}
        scale={[10, 4, 1]}
        color="#ffffff"
      />
      <Lightformer
        form="rect"
        intensity={1.8}
        position={[-5, 1.5, 2]}
        scale={[5, 8, 1]}
        color="#9ad7ff"
      />
      <Lightformer
        form="rect"
        intensity={1.4}
        position={[5, 0.8, -1]}
        scale={[4, 7, 1]}
        color="#ffe6cc"
      />
      <Lightformer
        form="ring"
        intensity={0.9}
        position={[0, 0, -5]}
        scale={8}
        color="#e8f2fa"
      />
    </Environment>
  )
}

function configureGl(gl: THREE.WebGLRenderer) {
  gl.toneMapping = THREE.ACESFilmicToneMapping
  gl.toneMappingExposure = 1.12
  gl.outputColorSpace = THREE.SRGBColorSpace
  gl.shadowMap.enabled = true
  gl.shadowMap.type = THREE.PCFSoftShadowMap
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
        dpr={[1.75, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        onCreated={({ gl }) => configureGl(gl)}
        camera={{ position: [0.25, 0.2, 5.7], fov: 26 }}
      >
        <Suspense fallback={null}>
          <StudioLights />
          <SoftEnv />
          <Float speed={0.95} rotationIntensity={0.06} floatIntensity={0.18}>
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
            position={[0, -1.3, 0]}
            opacity={0.58}
            scale={10}
            blur={3.4}
            far={5}
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
        dpr={[1.75, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        onCreated={({ gl }) => configureGl(gl)}
        camera={{ position: [0, 0.15, 5.35], fov: 26 }}
      >
        <Suspense fallback={null}>
          <StudioLights />
          <SoftEnv />
          <PresentationControls
            global
            snap
            rotation={[0.02, 0.2, 0]}
            polar={[-0.16, 0.2]}
            azimuth={[-0.95, 0.95]}
          >
            <Float speed={0.65} rotationIntensity={0.03} floatIntensity={0.12}>
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
            position={[0, -1.28, 0]}
            opacity={0.52}
            scale={9}
            blur={3}
            far={4.5}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
