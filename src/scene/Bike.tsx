import { useEffect, useMemo, useRef } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { ALL_ITEMS, type Gesture, type Vec3 } from '../lesson/lessons'
import type { BikeSpec } from '../lesson/bikes'

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

/**
 * En una fotogrametría la moto viene pegada a un trozo de suelo. Lo que sobresale del suelo es la moto:
 * de esos puntos salen su eje (el más largo), su largo, su ancho y su centro.
 */
function scanFootprint(root: THREE.Object3D) {
  root.updateMatrixWorld(true)
  const box = new THREE.Box3().setFromObject(root)
  const extent = Math.max(box.max.x - box.min.x, box.max.z - box.min.z)
  const cut = box.min.y + 0.05 * extent
  const v = new THREE.Vector3()
  const xs: number[] = []
  const zs: number[] = []
  root.traverse((o) => {
    const mesh = o as THREE.Mesh
    const pos = mesh.isMesh ? mesh.geometry.attributes.position : null
    if (!pos) return
    for (let i = 0; i < pos.count; i += 2) {
      v.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld)
      if (v.y > cut) {
        xs.push(v.x)
        zs.push(v.z)
      }
    }
  })
  const n = xs.length || 1
  const mx = xs.reduce((a, b) => a + b, 0) / n
  const mz = zs.reduce((a, b) => a + b, 0) / n
  let sxx = 0
  let szz = 0
  let sxz = 0
  for (let i = 0; i < xs.length; i++) {
    const dx = xs[i] - mx
    const dz = zs[i] - mz
    sxx += dx * dx
    szz += dz * dz
    sxz += dx * dz
  }
  const angle = 0.5 * Math.atan2(2 * sxz, sxx - szz)
  const ax = Math.cos(angle)
  const az = Math.sin(angle)
  const along = xs.map((x, i) => (x - mx) * ax + (zs[i] - mz) * az).sort((a, b) => a - b)
  const across = xs.map((x, i) => -(x - mx) * az + (zs[i] - mz) * ax).sort((a, b) => a - b)
  const q = (arr: number[], f: number) => arr[Math.min(arr.length - 1, Math.max(0, Math.floor(f * arr.length)))]
  const a0 = q(along, 0.01)
  const a1 = q(along, 0.99)
  const c0 = q(across, 0.01)
  const c1 = q(across, 0.99)
  const ca = (a0 + a1) / 2
  const cc = (c0 + c1) / 2
  return {
    angle,
    length: a1 - a0,
    width: c1 - c0,
    cx: mx + ca * ax - cc * az,
    cz: mz + ca * az + cc * ax,
    minY: box.min.y,
  }
}
function build(source: THREE.Object3D, bike: BikeSpec) {
  const model = source.clone(true)
  const holder = new THREE.Group()
  holder.add(model)

  // Fuera lo que sobra del modelo (un suelo, por ejemplo): no cuenta ni para medir ni para dibujar.
  if (bike.hideMaterials?.length) {
    const drop: THREE.Object3D[] = []
    model.traverse((o) => {
      const m = (o as THREE.Mesh).material as THREE.Material | undefined
      if ((o as THREE.Mesh).isMesh && m && bike.hideMaterials!.includes(m.name)) drop.push(o)
    })
    drop.forEach((o) => o.removeFromParent())
  }
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
  const scan = bike.scan ? scanFootprint(holder) : null
  const front = bike.wheels ? boxOfNode(bike.wheels[0]) : null
  const rear = bike.wheels ? boxOfNode(bike.wheels[1]) : null
  if (scan) {
    holder.rotation.y = scan.angle + (bike.flip ? Math.PI : 0)
  } else if (front && rear) {
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
  holder.scale.setScalar(scan ? bike.length / scan.length : bike.length / (box.max.x - box.min.x))
  holder.updateMatrixWorld(true)

  // Si el modelo viniera reflejado, el acelerador (derecha) quedaría en -z: se corrige.
  const throttleName = bike.nodes.throttle?.[0]
  const throttleBox = throttleName ? boxOfNode(throttleName) : null
  if (throttleBox && centerOf(throttleBox).z < 0) holder.scale.z *= -1
  holder.updateMatrixWorld(true)

  if (scan) {
    // El centro de la moto al origen y el suelo a y = 0; lo que queda fuera de su huella se recorta.
    const c = new THREE.Vector3(scan.cx, scan.minY, scan.cz).applyMatrix4(holder.matrixWorld)
    holder.position.set(-c.x, -c.y, -c.z)
    holder.updateMatrixWorld(true)
    const s = holder.scale.x
    const halfL = bike.length / 2 + 0.35
    const halfW = (scan.width * s) / 2 + 0.35
    const planes = [
      new THREE.Plane(new THREE.Vector3(1, 0, 0), halfL),
      new THREE.Plane(new THREE.Vector3(-1, 0, 0), halfL),
      new THREE.Plane(new THREE.Vector3(0, 0, 1), halfW),
      new THREE.Plane(new THREE.Vector3(0, 0, -1), halfW),
    ]
    model.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (!mesh.isMesh || Array.isArray(mesh.material)) return
      mesh.material = mesh.material.clone()
      mesh.material.clippingPlanes = planes
      mesh.material.clipShadows = true
    })
    // La caja medida ya es la de la moto, no la del suelo.
    box = new THREE.Box3(new THREE.Vector3(-bike.length / 2, 0, -halfW + 0.35), new THREE.Vector3(bike.length / 2, bike.length * 0.52, halfW - 0.35))
  } else {
    box = new THREE.Box3().setFromObject(holder)
    holder.position.set(-(box.min.x + box.max.x) / 2, -box.min.y, -(box.min.z + box.max.z) / 2)
    holder.updateMatrixWorld(true)
    box = new THREE.Box3().setFromObject(holder)
  }

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
    const specs = bike.nodes[item.id]
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

  const L = bike.length * (bike.viewScale ?? 1)
  const c = centerOf(box)
  const layout: BikeLayout = {
    anchors,
    views,
    overview: { position: [c.x + 1.0 * L, c.y + 0.38 * L, c.z + 1.2 * L], target: [c.x, c.y + 0.12 * L, c.z] },
    compact: { position: [c.x + 0.8 * L, c.y + 0.2 * L, c.z + 1.05 * L], target: [c.x, c.y + 0.1 * L, c.z] },
  }
  return { holder, pivots, hits, tints, tintsOf, layout }
}

export function Bike({ bike, activeId, animate, onPick, onLayout }: BikeProps) {
  const gltf = useGLTF(bike.url)
  const built = useMemo(() => build(gltf.scene, bike), [gltf.scene, bike])
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
