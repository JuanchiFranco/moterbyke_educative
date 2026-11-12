import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer, OrbitControls, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { Bike, type BikeLayout } from './Bike'
import { Stage, type StageLayout } from './Stage'
import type { BikePose } from './scenarios'
import type { Item, Vec3 } from '../lesson/lessons'
import { DEFAULT_BIKE, type BikeSpec } from '../lesson/bikes'

interface SceneProps {
  bike: BikeSpec
  /** Escenario 3D que se muestra: «bike» es la moto sola. */
  stageId: string
  onStageLayout: (layout: StageLayout) => void
  /** Dónde queda la moto en el escenario (null: no sale). */
  bikePose?: BikePose | null
  /** Luz del escenario: 1 es el estudio claro, menos es de noche. */
  dim: number
  /** Tema abierto cuando es de la moto; null en los escenarios. */
  bikeActiveId: string | null
  /** Temas de la lección abierta: cada uno con pieza en la moto tiene su marcador numerado. */
  items: Item[]
  activeId: string | null
  seen: ReadonlySet<string>
  /** Posiciones sacadas del modelo; hasta que carga no hay marcadores. */
  layout: Pick<BikeLayout, 'anchors'> | null
  onLayout: (layout: BikeLayout) => void
  view: { position: Vec3; target: Vec3 }
  reducedMotion: boolean
  onPick: (id: string) => void
}

/** Lleva la cámara al encuadre pedido y cede el mando en cuanto el usuario arrastra. */
function CameraRig({ view, reducedMotion, wide }: Pick<SceneProps, 'view' | 'reducedMotion'> & { wide: boolean }) {
  const controls = useRef<OrbitControlsImpl>(null)
  const camera = useThree((s) => s.camera)
  const aspect = useThree((s) => s.size.width / s.size.height)
  const travelling = useRef(false)
  const goal = useRef({ position: new THREE.Vector3(), target: new THREE.Vector3() })

  useEffect(() => {
    const g = goal.current
    g.target.set(...view.target)
    // En pantallas estrechas la cámara se aleja para que el encuadre quepa a lo ancho.
    const pullBack = Math.min(2, Math.max(1, 1.25 / aspect))
    g.position
      .set(...view.position)
      .sub(g.target)
      .multiplyScalar(pullBack)
      .add(g.target)
    if (reducedMotion && controls.current) {
      camera.position.copy(g.position)
      controls.current.target.copy(g.target)
      controls.current.update()
      travelling.current = false
    } else {
      travelling.current = true
    }
  }, [view, reducedMotion, camera, aspect])

  useFrame((_, dt) => {
    const c = controls.current
    if (!travelling.current || !c) return
    const g = goal.current
    const k = 1 - Math.exp(-4.5 * dt)
    camera.position.lerp(g.position, k)
    c.target.lerp(g.target, k)
    c.update()
    if (camera.position.distanceTo(g.position) < 0.005 && c.target.distanceTo(g.target) < 0.005) {
      travelling.current = false
    }
  })

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enablePan={false}
      minDistance={0.7}
      maxDistance={wide ? 60 : 7}
      maxPolarAngle={Math.PI / 2 - 0.04}
      onStart={() => {
        travelling.current = false
      }}
    />
  )
}

/** Proyecta el ancla de cada mando a la pantalla y coloca ahí su marcador numerado. */
function MarkerProjector({ slots, layout, items }: { slots: React.RefObject<(HTMLDivElement | null)[]>; layout: Pick<BikeLayout, 'anchors'> | null; items: Item[] }) {
  const v = useMemo(() => new THREE.Vector3(), [])
  useFrame(({ camera, size }) => {
    items.forEach((item, i) => {
      const el = slots.current[i]
      if (!el) return
      const anchor = layout?.anchors[item.id]
      if (!anchor) {
        el.style.visibility = 'hidden'
        return
      }
      v.set(...anchor).project(camera)
      const x = (v.x * 0.5 + 0.5) * size.width
      const y = (-v.y * 0.5 + 0.5) * size.height
      el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`
      el.style.visibility = v.z < 1 ? 'visible' : 'hidden'
      // Los mandos del lado contrario a la cámara se atenúan: están detrás de la moto.
      el.style.opacity = anchor[2] * camera.position.z < -0.05 ? '0.45' : '1'
    })
  })
  return null
}

export function Scene({ bike, stageId, onStageLayout, bikePose, dim, bikeActiveId, items, activeId, seen, layout, onLayout, view, reducedMotion, onPick }: SceneProps) {
  const slots = useRef<(HTMLDivElement | null)[]>([])
  return (
    <>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: view.position, fov: 34, near: 0.1, far: 140 }}
        gl={{ antialias: true, alpha: true }}
        aria-label="Moto en 3D. Arrastra para girarla y toca un mando para estudiarlo."
        role="img"
      >
        <hemisphereLight args={['#ffffff', '#b9babd', 0.9 * dim]} />
        <directionalLight
          position={[3, 5, 2.5]}
          intensity={2 * dim}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-26}
          shadow-camera-right={26}
          shadow-camera-top={26}
          shadow-camera-bottom={-26}
          shadow-camera-far={80}
        />
        <directionalLight position={[-2, 2.5, -4]} intensity={1.2 * dim} />

        {/* Estudio hecho en código: paneles de luz que el cromado y el esmalte reflejan. */}
        <Environment resolution={256} frames={1} environmentIntensity={dim}>
          <color attach="background" args={['#dfe0e2']} />
          <Lightformer form="rect" intensity={4} position={[0, 5, 0]} rotation-x={Math.PI / 2} scale={[8, 3, 1]} />
          <Lightformer form="rect" intensity={2.5} position={[4, 1.5, 3]} rotation-y={-Math.PI / 3} scale={[4, 2, 1]} />
          <Lightformer form="rect" intensity={1.8} position={[-4, 1.5, -3]} rotation-y={(2 * Math.PI) / 3} scale={[4, 2, 1]} />
          <Lightformer form="rect" intensity={1.2} color="#ffffff" position={[-3, 0.6, 4]} rotation-y={Math.PI / 4} scale={[3, 0.5, 1]} />
        </Environment>

        <Suspense fallback={null}>
          <Bike key={bike.id} bike={bike} pose={bikePose} activeId={bikeActiveId} animate={!reducedMotion} onPick={onPick} onLayout={onLayout} />
        </Suspense>

        {stageId !== 'bike' && <Stage key={stageId} id={stageId} activeId={activeId} onLayout={onStageLayout} />}

        <ContactShadows position={[0, 0, 0]} scale={5} blur={2.4} far={1.6} opacity={0.38} />
        <CameraRig view={view} reducedMotion={reducedMotion} wide={stageId !== 'bike'} />
        <MarkerProjector slots={slots} layout={layout} items={items} />
      </Canvas>
      <div className="markers">
        {items.map((item, i) => {
          if (!layout?.anchors[item.id]) return null
          const state = item.id === activeId ? 'active' : seen.has(item.id) ? 'learned' : 'pending'
          return (
            <div
              key={item.id}
              className="markers__slot"
              ref={(el) => {
                slots.current[i] = el
              }}
            >
              <button
                type="button"
                className="marker"
                data-state={state}
                aria-label={`${i + 1}. ${item.name}`}
                aria-current={state === 'active' ? 'step' : undefined}
                onClick={() => onPick(item.id)}
              >
                {i + 1}
              </button>
              {state === 'active' && <span className="marker__tag">{item.part ?? item.name}</span>}
            </div>
          )
        })}
      </div>    </>
  )
}

// La moto de inicio se descarga mientras carga la página; las demás, al elegirlas.
useGLTF.preload(DEFAULT_BIKE.url)
