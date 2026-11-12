import { useEffect, useMemo, useRef } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { CONTROLS, MODEL_URL, type ControlId, type Vec3 } from '../lesson/controls'

export interface View {
  position: Vec3
  target: Vec3
}

/** Posiciones sacadas del propio modelo, ya orientado: +x delante, +y arriba, +z a la derecha. */
export interface BikeLayout {
  anchors: Record<ControlId, Vec3>
  views: Record<ControlId, View>
  overview: View
  compact: View
}

interface BikeProps {
  /** Mando resaltado y en movimiento; null en la vista general y en el repaso. */
  activeId: ControlId | null
  /** Permite apagar el resaltado del mando activo. */
  showState: boolean
  animate: boolean
  onPick: (id: ControlId) => void
  onLayout: (layout: BikeLayout) => void
}

/** Largo real de la moto (ficha pública de la R1: 2.055 m). */
const LENGTH = 2.055
const HIGHLIGHT = new THREE.Color('#ff1a1a')

interface Rig {
  pivot: THREE.Group
  axis: 'y' | 'z'
  materials: { material: THREE.MeshStandardMaterial; color: THREE.Color; emissive: THREE.Color; intensity: number }[]
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

  const rigs = {} as Record<ControlId, Rig>
  const anchors = {} as Record<ControlId, Vec3>
  const views = {} as Record<ControlId, View>
  const hits: { id: ControlId; center: Vec3; size: Vec3 }[] = []

  for (const c of CONTROLS) {
    const node = holder.getObjectByName(c.node)
    if (!node) continue
    const b = new THREE.Box3().setFromObject(node)
    const center = centerOf(b)
    const side = center.z >= 0 ? 1 : -1

    // Cada mando gira sobre su propio eje: se cuelga de un pivote colocado donde está su articulación.
    let pivotAt = center.clone()
    let axis: 'y' | 'z' = 'z'
    if (c.id === 'frontBrake' || c.id === 'clutch') {
      pivotAt = new THREE.Vector3(center.x, center.y, side > 0 ? b.min.z : b.max.z)
      axis = 'y'
    } else if (c.id === 'shift' || c.id === 'rearBrake') {
      pivotAt = new THREE.Vector3(b.min.x, center.y, center.z)
    }
    const pivot = new THREE.Group()
    pivot.position.copy(holder.worldToLocal(pivotAt.clone()))
    holder.add(pivot)
    pivot.updateMatrixWorld(true)
    pivot.attach(node)

    // Materiales propios, para resaltar solo este mando y no todo lo que comparte textura.
    const materials: Rig['materials'] = []
    node.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (!mesh.isMesh) return
      const mat = (mesh.material as THREE.MeshStandardMaterial).clone()
      mesh.material = mat
      materials.push({ material: mat, color: mat.color.clone(), emissive: mat.emissive.clone(), intensity: mat.emissiveIntensity })
    })

    rigs[c.id] = { pivot, axis, materials }
    anchors[c.id] = v3(center)
    views[c.id] = {
      position: [center.x + c.view[0], center.y + c.view[1], center.z + c.view[2]],
      // La cámara mira algo por encima del mando: así la moto queda bajo el título de la pantalla.
      target: [center.x, center.y + 0.13, center.z],
    }
    const size = b.getSize(new THREE.Vector3())
    hits.push({
      id: c.id,
      center: v3(center),
      size: [Math.max(size.x, 0.1) + 0.06, Math.max(size.y, 0.1) + 0.06, Math.max(size.z, 0.1) + 0.06],
    })
  }

  const L = LENGTH
  const c = centerOf(box)
  const layout: BikeLayout = {
    anchors,
    views,
    overview: { position: [c.x + 1.0 * L, c.y + 0.38 * L, c.z + 1.2 * L], target: [c.x, c.y + 0.12 * L, c.z] },
    compact: { position: [c.x + 0.8 * L, c.y + 0.2 * L, c.z + 1.05 * L], target: [c.x, c.y + 0.1 * L, c.z] },
  }
  return { holder, rigs, hits, layout }
}

export function Bike({ activeId, showState, animate, onPick, onLayout }: BikeProps) {
  const gltf = useGLTF(MODEL_URL)
  const built = useMemo(() => build(gltf.scene), [gltf.scene])
  const { holder, rigs, hits, layout } = built

  const layoutRef = useRef(onLayout)
  layoutRef.current = onLayout
  useEffect(() => {
    layoutRef.current(layout)
  }, [layout])

  // El mando activo se pinta de rojo.
  useEffect(() => {
    for (const c of CONTROLS) {
      const rig = rigs[c.id]
      if (!rig) continue
      const on = showState && c.id === activeId
      for (const m of rig.materials) {
        if (on) {
          m.material.color.copy(HIGHLIGHT)
          m.material.emissive.copy(HIGHLIGHT)
          m.material.emissiveIntensity = 0.7
        } else {
          m.material.color.copy(m.color)
          m.material.emissive.copy(m.emissive)
          m.material.emissiveIntensity = m.intensity
        }
      }
    }
  }, [rigs, activeId, showState])

  // Cada explicación va acompañada de su demostración: el mando activo hace su gesto.
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime
    const press = animate ? (Math.sin(t * 2.4) + 1) / 2 : 0.6
    const k = 1 - Math.exp(-10 * dt)
    const goal: Record<ControlId, number> = {
      throttle: press * 0.9,
      frontBrake: -press * 0.28,
      clutch: press * 0.28,
      shift: animate ? Math.sin(t * 2.4) * 0.2 : 0.2,
      rearBrake: -press * 0.24,
    }
    for (const c of CONTROLS) {
      const rig = rigs[c.id]
      if (!rig) continue
      const to = c.id === activeId ? goal[c.id] : 0
      rig.pivot.rotation[rig.axis] += (to - rig.pivot.rotation[rig.axis]) * k
    }
  })

  const pick = (id: ControlId) => ({
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
      {/* Zona de toque generosa: las manetas y pedales reales son finos. */}
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
