import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
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

function SlowSpin({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.28
  })
  return <group ref={ref}>{children}</group>
}

function SceneLights() {
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight
        castShadow
        position={[4, 8, 3]}
        intensity={2.2}
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-4, 2, -2]} intensity={0.55} color="#7fd7ff" />
      <spotLight
        position={[0, 6, 4]}
        angle={0.45}
        penumbra={0.7}
        intensity={1.4}
        color="#fff4df"
      />
    </>
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
        dpr={[1, 1.75]}
        camera={{ position: [0, 0.4, 4.2], fov: 35 }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['#00000000']} />
        <Suspense fallback={null}>
          <SceneLights />
          <Environment resolution={256}>
            <Lightformer
              intensity={2}
              position={[0, 4, -2]}
              scale={[8, 2, 1]}
              color="#9edfff"
            />
            <Lightformer
              intensity={1.2}
              position={[4, 0, 2]}
              scale={[4, 4, 1]}
              color="#3ad6bf"
            />
            <Lightformer
              intensity={0.8}
              position={[-4, 1, 1]}
              scale={[3, 5, 1]}
              color="#e8b84a"
            />
          </Environment>
          <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.45}>
            <SlowSpin>
              <ApparelModel
                product={product}
                color={color}
                ink={ink}
                print={print}
                playerName={playerName}
                playerNumber={playerNumber}
                animated
              />
            </SlowSpin>
          </Float>
          <ContactShadows
            position={[0, -1.35, 0]}
            opacity={0.45}
            scale={8}
            blur={2.6}
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
      <Canvas
        shadows
        dpr={[1, 1.75]}
        camera={{ position: [0, 0.2, 3.8], fov: 36 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <SceneLights />
          <Environment preset="city" environmentIntensity={0.55} />
          <PresentationControls
            global
            snap
            rotation={[0.05, 0.25, 0]}
            polar={[-0.3, 0.35]}
            azimuth={[-0.75, 0.75]}
          >
            <Float speed={0.9} rotationIntensity={0.08} floatIntensity={0.25}>
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
            opacity={0.4}
            scale={7}
            blur={2.4}
            far={3.5}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
