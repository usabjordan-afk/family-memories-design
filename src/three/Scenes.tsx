import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import {
  ContactShadows,
  Environment,
  Float,
  PresentationControls,
} from '@react-three/drei'
import { EffectComposer, N8AO } from '@react-three/postprocessing'
import * as THREE from 'three'
import { ApparelModel } from './ApparelModel'
import type { PrintStyle, ProductId } from '../lib/products'

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
        camera={{ position: [0.35, 0.18, 6.1], fov: 26 }}
      >
        <Suspense fallback={null}>
          <StudioLights />
          <Environment
            files="/hdri/studio.hdr"
            environmentIntensity={0.75}
            background={false}
          />
          <Float speed={0.9} rotationIntensity={0.05} floatIntensity={0.16}>
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
            opacity={0.5}
            scale={10}
            blur={3.5}
            far={5}
          />
          <Effects />
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
        camera={{ position: [0.1, 0.12, 5.6], fov: 26 }}
      >
        <Suspense fallback={null}>
          <StudioLights />
          <Environment
            files="/hdri/studio.hdr"
            environmentIntensity={0.8}
            background={false}
          />
          <PresentationControls
            global
            snap
            rotation={[0.02, 0.22, 0]}
            polar={[-0.15, 0.2]}
            azimuth={[-1, 1]}
          >
            <Float speed={0.6} rotationIntensity={0.03} floatIntensity={0.1}>
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
            opacity={0.48}
            scale={9}
            blur={3.1}
            far={4.5}
          />
          <Effects />
        </Suspense>
      </Canvas>
    </div>
  )
}
