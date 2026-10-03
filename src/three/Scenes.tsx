import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import {
  ContactShadows,
  Environment,
  Float,
  PresentationControls,
} from '@react-three/drei'
import { ApparelModel } from './ApparelModel'
import type { PrintStyle, ProductId } from '../lib/products'

function SceneLights() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight
        castShadow
        position={[3.5, 7, 4]}
        intensity={2.5}
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-5, 3, -2]} intensity={0.9} color="#9ad7ff" />
      <pointLight position={[0, 2.5, 3]} intensity={1.2} color="#fff1d6" />
    </>
  )
}

const sharedProps = {
  shadows: true as const,
  dpr: [1, 1.75] as [number, number],
  gl: {
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance' as const,
  },
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
      <Canvas {...sharedProps} camera={{ position: [0.15, 0.2, 5.8], fov: 28 }}>
        <Suspense fallback={null}>
          <SceneLights />
          <Environment preset="city" environmentIntensity={0.5} />
          <Float speed={1.1} rotationIntensity={0.1} floatIntensity={0.3}>
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
            position={[0, -1.4, 0]}
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
      <Canvas {...sharedProps} camera={{ position: [0, 0.15, 5.4], fov: 28 }}>
        <Suspense fallback={null}>
          <SceneLights />
          <Environment preset="warehouse" environmentIntensity={0.45} />
          <PresentationControls
            global
            snap
            rotation={[0.02, 0.15, 0]}
            polar={[-0.2, 0.25]}
            azimuth={[-0.85, 0.85]}
          >
            <Float speed={0.8} rotationIntensity={0.05} floatIntensity={0.18}>
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
            position={[0, -1.35, 0]}
            opacity={0.45}
            scale={7}
            blur={2.5}
            far={3.5}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
