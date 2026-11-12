import { useEffect, useMemo, useRef } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { ALL_ITEMS, type Gesture, type Vec3 } from '../lesson/lessons'
import type { BikeSpec } from '../lesson/bikes'
import type { BikePose } from './scenarios'
import type { Track } from './rides'

export interface View {
  position: Vec3
  target: Vec3
}

/** Posiciones sacadas del propio modelo, ya orientado: +x delante, +y arriba, +z a la derecha. */
export interface BikeLayout {
  /** Solo los temas que tienen pieza en esta moto. */
  anchors: Record<string, Vec3>
  views: Record<string, View>
  overview: View
  compact: View
}

interface BikeProps {
  bike: BikeSpec
  /** Dónde está la moto: null en un escenario que no la lleva. Sin pose, está en el centro. */
  pose?: BikePose | null
  /** Recorrido que actúa la moto en el escenario (el del tema abierto). */
  track?: Track | null
  /** Tema abierto: sus piezas se resaltan y, si es un mando, hace su gesto. */
  activeId: string | null
  animate: boolean
  onPick: (id: string) => void
  onLayout: (layout: BikeLayout) => void
}

const HIGHLIGHT = new THREE.Color('#ff1a1a')

interface Tint {
  material: THREE.MeshStandardMaterial
  color: THREE.Color
  emissive: THREE.Color
  intensity: number
}

interface Pivot {
  group: THREE.Group
  axis: 'y' | 'z'
  gesture: Gesture
}

const v3 = (v: THREE.Vector3): Vec3 => [v.x, v.y, v.z]

function build(source: THREE.Object3D, bike: BikeSpec) {
  const model = source.clone(true)
  const holder = new THREE.Group()
  holder.add(model)

  // Fuera lo que sobra del modelo (una caja de estudio, por ejemplo): no cuenta ni para medir ni para dibujar.
  bike.hideNodes?.forEach((name) => holder.getObjectByName(name)?.removeFromParent())
  model.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) o.castShadow = true
  })

  /** Piezas por nombre de nodo, o «mat:Nombre» para todas las mallas que usan un material. */
  const resolve = (spec: string): THREE.Object3D[] => {
    if (spec.startsWith('mat:')) {
      const wanted = spec.slice(4)
      const found: THREE.Object3D[] = []
      holder.traverse((o) => {
        const m = (o as THREE.Mesh).material as THREE.Material | undefined
        if ((o as THREE.Mesh).isMesh && m && m.name === wanted) found.push(o)
      })
      return found
    }
    const o = holder.getObjectByName(spec)
    return o ? [o] : []
  }
  const centerOf = (b: THREE.Box3) => b.getCenter(new THREE.Vector3())
  const boxOfNode = (name: string) => {
    const o = holder.getObjectByName(name)
    return o ? new THREE.Box3().setFromObject(o) : null
  }

  // Orientar: delante pasa a ser +x.
  holder.updateMatrixWorld(true)
  const front = bike.wheels ? boxOfNode(bike.wheels[0]) : null
  const rear = bike.wheels ? boxOfNode(bike.wheels[1]) : null
  if (front && rear) {
    // Con las ruedas a la vista, la línea de la trasera a la delantera marca el rumbo.
    const f = centerOf(front)
    const r = centerOf(rear)
    holder.rotation.y = Math.atan2(f.z - r.z, f.x - r.x)
  } else {
    // Sin ruedas con nombre, el eje horizontal más largo es el de la moto; `flip` decide cuál es el frente.
    const size = new THREE.Box3().setFromObject(holder).getSize(new THREE.Vector3())
    holder.rotation.y = (size.z > size.x ? Math.PI / 2 : 0) + (bike.flip ? Math.PI : 0)
  }
  holder.updateMatrixWorld(true)

  // Escalar a la medida real y apoyar las ruedas en el suelo, centrada.
  let box = new THREE.Box3().setFromObject(holder)
  holder.scale.setScalar(bike.length / (box.max.x - box.min.x))
  holder.updateMatrixWorld(true)

  // Si el modelo viniera reflejado, el acelerador (derecha) quedaría en -z: se corrige.
  const throttleName = bike.nodes.throttle?.[0]
  const throttleBox = throttleName ? boxOfNode(throttleName) : null
  if (throttleBox && centerOf(throttleBox).z < 0) holder.scale.z *= -1
  holder.updateMatrixWorld(true)

  box = new THREE.Box3().setFromObject(holder)
  holder.position.set(-(box.min.x + box.max.x) / 2, -box.min.y, -(box.min.z + box.max.z) / 2)
  holder.updateMatrixWorld(true)
  box = new THREE.Box3().setFromObject(holder)

  const anchors: Record<string, Vec3> = {}
  const views: Record<string, View> = {}
  const pivots: Record<string, Pivot> = {}
  const hits: { id: string; center: Vec3; size: Vec3 }[] = []
  /** Materiales propios de cada malla, para resaltar una pieza sin teñir todo lo que comparte textura. */
  const tints = new Map<THREE.Mesh, Tint>()
  const tintsOf: Record<string, Tint[]> = {}

  const tintMeshes = (root: THREE.Object3D, into: Tint[]) => {
    root.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (!mesh.isMesh || Array.isArray(mesh.material)) return
      let tint = tints.get(mesh)
      if (!tint) {
        const mat = mesh.material.clone() as THREE.MeshStandardMaterial
        mesh.material = mat
        // Algunos modelos usan materiales sin brillo propio: entonces solo se tiñe el color.
        tint = {
          material: mat,
          color: mat.color.clone(),
          emissive: mat.emissive ? mat.emissive.clone() : new THREE.Color(0),
          intensity: mat.emissiveIntensity ?? 1,
        }
        tints.set(mesh, tint)
      }
      into.push(tint)
    })
  }

  for (const item of ALL_ITEMS) {
    if (item.stage !== 'bike') continue
    const specs = bike.nodes[item.nodesKey ?? item.id]
    if (!specs?.length) continue
    const found = specs.flatMap(resolve)
    const missing = specs.filter((s) => !resolve(s).length)
    if (missing.length) console.warn(`[moto] ${bike.id}/«${item.id}»: no están en el modelo ->`, missing.join(', '))
    if (!found.length) continue

    const b = new THREE.Box3()
    found.forEach((o) => b.expandByObject(o))
    const center = centerOf(b)
    const side = center.z >= 0 ? 1 : -1

    // Un mando que se mueve gira sobre su propio eje: se cuelga de un pivote donde está su articulación.
    if (item.gesture && bike.gestures) {
      let pivotAt = center.clone()
      let axis: 'y' | 'z' = 'z'
      if (item.gesture === 'frontBrake' || item.gesture === 'clutch') {
        pivotAt = new THREE.Vector3(center.x, center.y, side > 0 ? b.min.z : b.max.z)
        axis = 'y'
      } else if (item.gesture === 'shift' || item.gesture === 'rearBrake') {
        pivotAt = new THREE.Vector3(b.min.x, center.y, center.z)
      }
      const group = new THREE.Group()
      group.position.copy(holder.worldToLocal(pivotAt.clone()))
      holder.add(group)
      group.updateMatrixWorld(true)
      group.attach(found[0])
      pivots[item.id] = { group, axis, gesture: item.gesture }

      const size = b.getSize(new THREE.Vector3())
      hits.push({
        id: item.id,
        center: v3(center),
        size: [Math.max(size.x, 0.1) + 0.06, Math.max(size.y, 0.1) + 0.06, Math.max(size.z, 0.1) + 0.06],
      })
    }

    const own: Tint[] = []
    found.forEach((o) => tintMeshes(o, own))
    tintsOf[item.id] = own

    // El marcador va sobre la primera pieza (no en el centro del conjunto, que a veces cae en medio de la moto).
    anchors[item.id] = v3(centerOf(new THREE.Box3().setFromObject(found[0])))
    views[item.id] = {
      position: [center.x + item.view[0], center.y + item.view[1], center.z + item.view[2]],
      // La cámara mira algo por encima de la pieza: así la moto queda bajo el título de la pantalla.
      target: [center.x, center.y + 0.13, center.z],
    }
  }

  // Ruedas que giran al avanzar: cada una se cuelga de un pivote en su centro, con el eje transversal de la moto.
  const wheelSpin: { group: THREE.Group; axis: THREE.Vector3; radius: number }[] = []
  if (bike.wheels) {
    holder.updateMatrixWorld(true)
    const inv = holder.matrixWorld.clone().invert()
    // Hacia delante (+x del mundo) la rueda gira en sentido -z; en el marco del modelo, el espejo ya está incluido.
    const axis = new THREE.Vector3(0, 0, -1).transformDirection(inv)
    for (const name of bike.wheels) {
      const node = holder.getObjectByName(name)
      const wb = boxOfNode(name)
      if (!node || !wb) continue
      const group = new THREE.Group()
      group.position.copy(holder.worldToLocal(centerOf(wb)))
      holder.add(group)
      group.updateMatrixWorld(true)
      group.attach(node)
      wheelSpin.push({ group, axis: axis.clone(), radius: Math.max((wb.max.y - wb.min.y) / 2, 0.1) })
    }
  }

  const L = bike.length
  const c = centerOf(box)
  const layout: BikeLayout = {
    anchors,
    views,
    overview: { position: [c.x + 1.0 * L, c.y + 0.38 * L, c.z + 1.2 * L], target: [c.x, c.y + 0.12 * L, c.z] },
    compact: { position: [c.x + 0.8 * L, c.y + 0.2 * L, c.z + 1.05 * L], target: [c.x, c.y + 0.1 * L, c.z] },
  }
  return { holder, pivots, hits, tints, tintsOf, layout, wheelSpin }
}

/** Velocidad de la moto en los escenarios, en metros por segundo. */
const RIDE_SPEED = 2.4

export function Bike({ bike, pose, track = null, activeId, animate, onPick, onLayout }: BikeProps) {
  const gltf = useGLTF(bike.url)
  const built = useMemo(() => build(gltf.scene, bike), [gltf.scene, bike])
  const { holder, pivots, hits, tints, tintsOf, layout, wheelSpin } = built
  const ride = useRef<THREE.Group>(null)
  const rolled = useRef(0)
  const run = useRef({ s: 0, wait: 0, lean: 0 })

  const layoutRef = useRef(onLayout)
  layoutRef.current = onLayout
  useEffect(() => {
    layoutRef.current(layout)
  }, [layout])

  // Las piezas del tema abierto se pintan de rojo; el resto vuelve a su aspecto original.
  useEffect(() => {
    const on = new Set<Tint>(activeId ? (tintsOf[activeId] ?? []) : [])
    tints.forEach((t) => {
      if (on.has(t)) {
        t.material.color.copy(HIGHLIGHT)
        if (t.material.emissive) {
          t.material.emissive.copy(HIGHLIGHT)
          t.material.emissiveIntensity = 0.7
        }
      } else {
        t.material.color.copy(t.color)
        if (t.material.emissive) {
          t.material.emissive.copy(t.emissive)
          t.material.emissiveIntensity = t.intensity
        }
      }
    })
  }, [tints, tintsOf, activeId])

  // Cada explicación va acompañada de su demostración: el mando activo hace su gesto.
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime
    const press = animate ? (Math.sin(t * 2.4) + 1) / 2 : 0.6
    const k = 1 - Math.exp(-10 * dt)
    const goal: Record<Gesture, number> = {
      throttle: press * 0.9,
      frontBrake: -press * 0.28,
      clutch: press * 0.28,
      shift: animate ? Math.sin(t * 2.4) * 0.2 : 0.2,
      rearBrake: -press * 0.24,
    }
    for (const id in pivots) {
      const p = pivots[id]
      const to = id === activeId ? goal[p.gesture] : 0
      p.group.rotation[p.axis] += (to - p.group.rotation[p.axis]) * k
    }

    // En un escenario la moto actúa el tema: sigue su recorrido, frena, se inclina y las ruedas giran con ella.
    const g = ride.current
    if (!g || !pose) return
    // En desarrollo las pruebas pueden acelerar el reloj (window.__rideScale) para no esperar a la moto.
    const scale = import.meta.env.DEV ? ((window as unknown as { __rideScale?: number }).__rideScale ?? 1) : 1
    const step = Math.min(dt, 0.05) * scale

    if (!track) {
      // Sin recorrido propio: un trayecto sencillo en bucle por su carril.
      g.rotation.set(0, 0, 0)
      if (!animate) {
        g.position.set(0, 0, 0)
        return
      }
      const travel = pose.travel ?? 6
      if (travel > 0) {
        rolled.current = (rolled.current + RIDE_SPEED * step) % travel
        g.position.set(Math.cos(pose.rotationY) * rolled.current, 0, -Math.sin(pose.rotationY) * rolled.current)
      } else {
        g.position.set(0, 0, 0)
        rolled.current += RIDE_SPEED * step
      }
      for (const w of wheelSpin) w.group.quaternion.setFromAxisAngle(w.axis, (rolled.current / w.radius) % (Math.PI * 2))
      return
    }

    const r = run.current
    let moved = 0
    if (animate) {
      if (r.wait > 0) {
        r.wait -= step
        if (r.wait <= 0 && r.s >= track.length - 1e-6) r.s = 0
      } else {
        const ds = track.at(r.s).speed * step
        const next = r.s + ds
        const stop = track.pauses.find((p) => p.s > r.s + 1e-6 && p.s <= next + 1e-6)
        if (stop) {
          moved = stop.s - r.s
          r.s = stop.s
          r.wait = stop.t
        } else {
          moved = ds
          r.s = next
        }
      }
    } else r.s = 0
    const here = track.at(r.s)
    // Inclinación hacia el lado de la curva: lo que pide la aceleración lateral a esa velocidad (algo exagerada para que se vea).
    const moving = r.wait <= 0 && animate
    const lean = moving ? -Math.atan((here.speed * here.speed * here.curvature) / 9.8) * 2.6 : 0
    r.lean += (Math.max(-0.5, Math.min(0.5, lean)) - r.lean) * (1 - Math.exp(-6 * step))
    const slope = pose.pitch ?? 0
    g.rotation.set(r.lean, here.heading, slope, 'YXZ')
    g.position.set(here.x, pose.position[1] + (slope ? here.x * Math.tan(slope) : 0), here.z)
    rolled.current += moved
    // Solo en desarrollo: las pruebas de extremo a extremo leen de aquí por dónde va la moto.
    if (import.meta.env.DEV) {
      ;(window as unknown as Record<string, unknown>).__ride = { x: here.x, z: here.z, yaw: g.rotation.y, lean: r.lean, s: r.s, len: track.length, wait: r.wait, speed: here.speed, wheels: wheelSpin.length, spin: wheelSpin[0]?.group.rotation.toArray() }
    }
    for (const w of wheelSpin) w.group.quaternion.setFromAxisAngle(w.axis, (rolled.current / w.radius) % (Math.PI * 2))
  })

  // Cada tema empieza su recorrido desde el principio.
  useEffect(() => {
    run.current = { s: 0, wait: 0, lean: 0 }
  }, [track])

  const pick = (id: string) => ({
    onClick: (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation()
      onPick(id)
    },
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation()
      document.body.style.cursor = 'pointer'
    },
    onPointerOut: () => {
      document.body.style.cursor = ''
    },
  })

  // Con recorrido, la moto se coloca sola en el mundo: la pose solo aporta la altura y la inclinación.
  const at = track ? { position: [0, 0, 0] as Vec3, rotationY: 0, pitch: 0 } : (pose ?? { position: [0, 0, 0] as Vec3, rotationY: 0, pitch: 0 })
  return (
    <group position={at.position} rotation={[0, at.rotationY, at.pitch ?? 0]} visible={pose !== null}>
      <group ref={ride}>
        <primitive object={holder} />
      </group>
      {/* Zona de toque generosa en los mandos: las manetas y pedales reales son finos. */}
      {hits.map((h) => (
        <mesh key={h.id} position={h.center} {...pick(h.id)}>
          <boxGeometry args={h.size} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}
