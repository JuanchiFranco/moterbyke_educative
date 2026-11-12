import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ALL_ITEMS, type Vec3 } from '../lesson/lessons'
import { SCENARIOS, type BikePose } from './scenarios'
import type { View } from './Bike'

/** Lo que el escenario cuenta a la aplicación: dónde van los marcadores, las cámaras y la moto. */
export interface StageLayout {
  /** Escenario al que pertenece: así no se mezclan los datos de uno con los de otro al cambiar. */
  id: string
  anchors: Record<string, Vec3>
  views: Record<string, View>
  overview: View
  compact: View
  bike: BikePose | null
  dim: number
}

function build(id: string) {
  const scenario = (SCENARIOS[id] ?? SCENARIOS.road)()
  const { group } = scenario
  group.updateMatrixWorld(true)

  const anchors: Record<string, Vec3> = {}
  const views: Record<string, View> = {}
  const halos: { itemId: string; mesh: THREE.Group }[] = []

  for (const item of ALL_ITEMS.filter((i) => i.stage === id)) {
    const objs = (item.focus ?? []).flatMap((name) => {
      const f = scenario.focus[name]
      return f ? (Array.isArray(f) ? f : [f]) : []
    })
    if (item.focus?.length && !objs.length) console.warn(`[escenario] ${id}/«${item.id}»: no existen los grupos`, item.focus.join(', '))
    const halo = new THREE.Group()
    halo.visible = false
    const all = new THREE.Box3()
    for (const o of objs) {
      const b = new THREE.Box3().setFromObject(o)
      if (b.isEmpty()) continue
      all.union(b)
      const size = b.getSize(new THREE.Vector3()).addScalar(0.18)
      const c = b.getCenter(new THREE.Vector3())
      const fill = new THREE.Mesh(
        new THREE.BoxGeometry(size.x, size.y, size.z),
        new THREE.MeshBasicMaterial({ color: '#ff1a1a', transparent: true, opacity: 0.16, depthWrite: false }),
      )
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(fill.geometry), new THREE.LineBasicMaterial({ color: '#ff1a1a' }))
      fill.position.copy(c)
      edges.position.copy(c)
      halo.add(fill, edges)
    }
    group.add(halo)
    halos.push({ itemId: item.id, mesh: halo })

    if (!all.isEmpty()) {
      const c = all.getCenter(new THREE.Vector3())
      anchors[item.id] = [c.x, all.max.y + 0.35, c.z]
      if (item.cam) views[item.id] = item.cam
      else {
        // Encuadre automático: mismo ángulo que la vista general, a una distancia que depende del tamaño de lo resaltado.
        const s = all.getSize(new THREE.Vector3())
        const dir = new THREE.Vector3(...scenario.view.position).sub(new THREE.Vector3(...scenario.view.target)).normalize()
        const dist = THREE.MathUtils.clamp(s.length() * 1.7 + 5, 8, 48)
        views[item.id] = {
          position: [c.x + dir.x * dist, Math.max(c.y + dir.y * dist, 1.2), c.z + dir.z * dist],
          target: [c.x, c.y, c.z],
        }
      }
    } else if (item.cam) views[item.id] = item.cam
  }

  const rain = scenario.rain ? makeRain() : null
  if (rain) group.add(rain.points)

  const layout: StageLayout = {
    id,
    anchors,
    views,
    overview: scenario.view,
    compact: scenario.view,
    bike: scenario.bike,
    dim: scenario.dim ?? 1,
  }
  return { group, halos, rain, layout }
}

/** Gotas de lluvia: segmentos que caen y vuelven a empezar arriba. */
function makeRain() {
  const N = 900
  const pos = new Float32Array(N * 6)
  const seeds = new Float32Array(N * 3)
  for (let i = 0; i < N; i++) {
    seeds[i * 3] = (Math.random() - 0.5) * 36
    seeds[i * 3 + 1] = Math.random() * 9
    seeds[i * 3 + 2] = (Math.random() - 0.5) * 16
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  const points = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: '#7aa0c8', transparent: true, opacity: 0.6 }))
  points.frustumCulled = false
  return { points, seeds, pos, geo, N }
}

interface StageProps {
  id: string
  activeId: string | null
  onLayout: (layout: StageLayout) => void
}

export function Stage({ id, activeId, onLayout }: StageProps) {
  const built = useMemo(() => build(id), [id])

  useEffect(() => {
    onLayout(built.layout)
  }, [built, onLayout])

  useEffect(() => {
    built.halos.forEach((h) => (h.mesh.visible = h.itemId === activeId))
  }, [built, activeId])

  useFrame((_, dt) => {
    const r = built.rain
    if (!r) return
    for (let i = 0; i < r.N; i++) {
      r.seeds[i * 3 + 1] -= dt * 11
      if (r.seeds[i * 3 + 1] < 0) r.seeds[i * 3 + 1] = 9
      const x = r.seeds[i * 3]
      const y = r.seeds[i * 3 + 1]
      const z = r.seeds[i * 3 + 2]
      r.pos.set([x, y, z, x - 0.04, y + 0.45, z], i * 6)
    }
    r.geo.attributes.position.needsUpdate = true
  })

  return <primitive object={built.group} />
}
