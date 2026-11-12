import { useEffect, useMemo, useRef } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { ALL_ITEMS, MODEL_URL, type Gesture, type Vec3 } from '../lesson/lessons'

export interface View {
  position: Vec3
  target: Vec3
}

/** Posiciones sacadas del propio modelo, ya orientado: +x delante, +y arriba, +z a la derecha. */
export interface BikeLayout {
  /** Solo los temas que tienen pieza en la moto. */
  anchors: Record<string, Vec3>
  views: Record<string, View>
  overview: View
  compact: View
}

interface BikeProps {
  /** Tema abierto: sus piezas se resaltan y, si es un mando, hace su gesto. */
  activeId: string | null
  animate: boolean
  onPick: (id: string) => void
  onLayout: (layout: BikeLayout) => void
}

/** Largo real de la moto (ficha pública de la R1: 2.055 m). */
const LENGTH = 2.055
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

function build(source: THREE.Object3D) {
  const model = source.clone(true)
  const holder = new THREE.Group()
  holder.add(model)
  model.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) o.castShadow = true
  })

  const boxOf = (root: THREE.Object3D, name: string) => {
    const o = root.getObjectByName(name)
    return o ? new THREE.Box3().setFromObject(o) : null
  }
  const centerOf = (b: THREE.Box3) => b.getCenter(new THREE.Vector3())

  // Orientar: el eje trasera → delantera pasa a ser +x.
  holder.updateMatrixWorld(true)
  const front = boxOf(holder, 'Yam_R1_Front_Wheel')
  const rear = boxOf(holder, 'Yam_R1_Rear_Wheel')
  if (front && rear) {
    const f = centerOf(front)
    const r = centerOf(rear)
    holder.rotation.y = Math.atan2(f.z - r.z, f.x - r.x)
  }
  holder.updateMatrixWorld(true)

  // Escalar a las medidas reales y apoyar las ruedas en el suelo, centrada.
  let box = new THREE.Box3().setFromObject(holder)
  holder.scale.setScalar(LENGTH / (box.max.x - box.min.x))
  holder.updateMatrixWorld(true)

  // Si el modelo viniera reflejado, el acelerador (derecha) quedaría en -z: se corrige.
  const throttleBox = boxOf(holder, 'Yam_R1_Throttle')
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
      if (!mesh.isMesh) return
      let tint = tints.get(mesh)
      if (!tint) {
        const mat = (mesh.material as THREE.MeshStandardMaterial).clone()
        mesh.material = mat
        tint = { material: mat, color: mat.color.clone(), emissive: mat.emissive.clone(), intensity: mat.emissiveIntensity }
        tints.set(mesh, tint)
      }
      into.push(tint)
    })
  }

  for (const item of ALL_ITEMS) {
    if (!item.nodes.length) continue
    const found = item.nodes
      .map((name) => holder.getObjectByName(name))
      .filter((o): o is THREE.Object3D => !!o)
    if (found.length < item.nodes.length) {
      const missing = item.nodes.filter((n) => !holder.getObjectByName(n))
      console.warn(`[moto] «${item.id}»: no están en el modelo ->`, missing.join(', '))
    }
    if (!found.length) continue

    const b = new THREE.Box3()
    found.forEach((o) => b.expandByObject(o))
    const center = centerOf(b)
    const side = center.z >= 0 ? 1 : -1

    // Un mando que se mueve gira sobre su propio eje: se cuelga de un pivote donde está su articulación.
    if (item.gesture) {
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

  const L = LENGTH
  const c = centerOf(box)
  const layout: BikeLayout = {
    anchors,
    views,
    overview: { position: [c.x + 1.0 * L, c.y + 0.38 * L, c.z + 1.2 * L], target: [c.x, c.y + 0.12 * L, c.z] },
    compact: { position: [c.x + 0.8 * L, c.y + 0.2 * L, c.z + 1.05 * L], target: [c.x, c.y + 0.1 * L, c.z] },
  }
  return { holder, pivots, hits, tints, tintsOf, layout }
}

export function Bike({ activeId, animate, onPick, onLayout }: BikeProps) {
  const gltf = useGLTF(MODEL_URL)
  const built = useMemo(() => build(gltf.scene), [gltf.scene])
  const { holder, pivots, hits, tints, tintsOf, layout } = built

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
        t.material.emissive.copy(HIGHLIGHT)
        t.material.emissiveIntensity = 0.7
      } else {
        t.material.color.copy(t.color)
        t.material.emissive.copy(t.emissive)
        t.material.emissiveIntensity = t.intensity
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
  })

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

  return (
    <group>
      <primitive object={holder} />
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

useGLTF.preload(MODEL_URL)
