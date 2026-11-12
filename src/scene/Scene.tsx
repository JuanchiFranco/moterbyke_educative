import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { Bike, type BikeLayout } from './Bike'
import type { Item, Vec3 } from '../lesson/lessons'

interface SceneProps {
  /** Temas de la lección abierta: cada uno con pieza en la moto tiene su marcador numerado. */
  items: Item[]
  activeId: string | null
  seen: ReadonlySet<string>
  /** Posiciones sacadas del modelo; hasta que carga no hay marcadores. */
  layout: BikeLayout | null
  onLayout: (layout: BikeLayout) => void
  view: { position: Vec3; target: Vec3 }
  reducedMotion: boolean
  onPick: (id: string) => void
}

/** Lleva la cámara al encuadre pedido y cede el mando en cuanto el usuario arrastra. */
function CameraRig({ view, reducedMotion }: Pick<SceneProps, 'view' | 'reducedMotion'>) {
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
      maxDistance={7}
      maxPolarAngle={Math.PI / 2 - 0.04}
      onStart={() => {
        travelling.current = false
      }}
    />
  )
}

/** Proyecta el ancla de cada mando a la pantalla y coloca ahí su marcador numerado. */
function MarkerProjector({ slots, layout, items }: { slots: React.RefObject<(HTMLDivElement | null)[]>; layout: BikeLayout | null; items: Item[] }) {
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

export function Scene({ items, activeId, seen, layout, onLayout, view, reducedMotion, onPick }: SceneProps) {
  const slots = useRef<(HTMLDivElement | null)[]>([])
  return (
    <>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: view.position, fov: 34, near: 0.1, far: 50 }}
        gl={{ antialias: true, alpha: true }}
        aria-label="Moto en 3D. Arrastra para girarla y toca un mando para estudiarlo."
        role="img"
      >
        <hemisphereLight args={['#ffffff', '#b9babd', 0.9]} />
        <directionalLight position={[3, 5, 2.5]} intensity={2} castShadow shadow-mapSize={[1024, 1024]} />
        <directionalLight position={[-2, 2.5, -4]} intensity={1.2} />

        {/* Estudio hecho en código: paneles de luz que el cromado y el esmalte reflejan. */}
        <Environment resolution={256} frames={1}>
          <color attach="background" args={['#dfe0e2']} />
          <Lightformer form="rect" intensity={4} position={[0, 5, 0]} rotation-x={Math.PI / 2} scale={[8, 3, 1]} />
          <Lightformer form="rect" intensity={2.5} position={[4, 1.5, 3]} rotation-y={-Math.PI / 3} scale={[4, 2, 1]} />
          <Lightformer form="rect" intensity={1.8} position={[-4, 1.5, -3]} rotation-y={(2 * Math.PI) / 3} scale={[4, 2, 1]} />
          <Lightformer form="rect" intensity={1.2} color="#ffffff" position={[-3, 0.6, 4]} rotation-y={Math.PI / 4} scale={[3, 0.5, 1]} />
        </Environment>

        <Suspense fallback={null}>
          <Bike activeId={activeId} animate={!reducedMotion} onPick={onPick} onLayout={onLayout} />
        </Suspense>

        <ContactShadows position={[0, 0, 0]} scale={5} blur={2.4} far={1.6} opacity={0.38} />
        <CameraRig view={view} reducedMotion={reducedMotion} />
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
