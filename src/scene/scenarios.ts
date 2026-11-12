import * as THREE from 'three'
import type { Vec3 } from '../lesson/lessons'

/**
 * Escenarios 3D construidos en código: calles, cruces, un patio de prácticas… Son maquetas esquemáticas, no
 * planos a escala real. Los ejes son los de la moto: +x hacia delante, +y arriba, +z a la derecha de quien avanza.
 * La circulación va por la derecha, así que «nuestro» carril está en z > 0.
 */

export interface BikePose {
  position: Vec3
  /** Giro sobre el eje vertical, en radianes; 0 mira hacia +x. */
  rotationY: number
  /** Inclinación hacia delante/atrás (subidas y bajadas). */
  pitch?: number
}

export interface Scenario {
  group: THREE.Group
  /** Grupos con nombre que un tema puede señalar: se rodean con un halo rojo y llevan el marcador. */
  focus: Record<string, THREE.Object3D | THREE.Object3D[]>
  /** Dónde se pone la moto elegida; null si el escenario no la lleva. */
  bike: BikePose | null
  /** Encuadre de la vista general del escenario. */
  view: { position: Vec3; target: Vec3 }
  rain?: boolean
  /** Luz de la escena: 1 es el estudio claro; menos es de noche. */
  dim?: number
}

const COLORS = {
  asphalt: '#575a60',
  asphaltDark: '#34363a',
  curb: '#c7c9cd',
  ground: '#dfe0e2',
  white: '#f3f3f0',
  yellow: '#e8b923',
  red: '#cc0000',
  orange: '#f07d1a',
  glass: '#9fb3c8',
  tire: '#1b1b1d',
}

const std = (color: string, o: THREE.MeshStandardMaterialParameters = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, ...o })

/** Caja con la base en y. */
function slab(w: number, h: number, d: number, color: string, x: number, y: number, z: number, o: THREE.MeshStandardMaterialParameters = {}) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), std(color, o))
  m.position.set(x, y + h / 2, z)
  m.castShadow = true
  m.receiveShadow = true
  return m
}

const named = (g: THREE.Object3D, name: string) => {
  g.name = name
  return g
}

/** Tramo recto de calzada: asfalto, bordillos y suelo alrededor. */
function road(x0: number, x1: number, zA: number, zB: number, color = COLORS.asphalt) {
  const g = new THREE.Group()
  const len = x1 - x0
  const w = zB - zA
  g.add(slab(len, 0.06, w, color, (x0 + x1) / 2, 0, (zA + zB) / 2, color === COLORS.asphaltDark ? { roughness: 0.5 } : {}))
  g.add(slab(len, 0.12, 0.25, COLORS.curb, (x0 + x1) / 2, 0, zA - 0.125))
  g.add(slab(len, 0.12, 0.25, COLORS.curb, (x0 + x1) / 2, 0, zB + 0.125))
  return g
}

function paint(w: number, d: number, color: string, x: number, z: number, y = 0.06) {
  const m = slab(w, 0.006, d, color, x, y, z, { roughness: 0.6 })
  m.castShadow = false
  return m
}

function dashes(x0: number, x1: number, z: number, color = COLORS.white, len = 0.7, gap = 1.1) {
  const g = new THREE.Group()
  for (let x = x0; x + len <= x1; x += len + gap) g.add(paint(len, 0.12, color, x + len / 2, z))
  return g
}

function cone(x: number, z: number) {
  const g = new THREE.Group()
  g.add(slab(0.32, 0.03, 0.32, COLORS.orange, 0, 0, 0))
  const body = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.42, 20), std(COLORS.orange))
  body.position.y = 0.24
  body.castShadow = true
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.095, 0.07, 20), std(COLORS.white))
  band.position.y = 0.22
  g.add(body, band)
  g.position.set(x, 0.06, z)
  return g
}

function wheel(r = 0.33, w = 0.24) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, w, 20), std(COLORS.tire))
  m.rotation.x = Math.PI / 2
  m.castShadow = true
  return m
}

/** Auto sencillo (4,2 m). */
function car(color: string, x: number, z: number, rotY = 0) {
  const g = new THREE.Group()
  g.add(slab(4.2, 0.62, 1.8, color, 0, 0.22, 0, { roughness: 0.4, metalness: 0.3 }))
  g.add(slab(2.2, 0.55, 1.62, COLORS.glass, -0.2, 0.84, 0, { roughness: 0.2 }))
  g.add(slab(2.0, 0.05, 1.7, color, -0.2, 1.39, 0, { roughness: 0.4, metalness: 0.3 }))
  for (const [wx, wz] of [[1.3, 0.9], [1.3, -0.9], [-1.3, 0.9], [-1.3, -0.9]]) {
    const w = wheel()
    w.position.set(wx, 0.33, wz)
    g.add(w)
  }
  g.position.set(x, 0.06, z)
  g.rotation.y = rotY
  return g
}

/** Camión o bus: caja larga y alta. */
function bigVehicle(len: number, height: number, color: string, x: number, z: number, rotY = 0) {
  const g = new THREE.Group()
  g.add(slab(len, height, 2.4, color, 0, 0.45, 0, { roughness: 0.55 }))
  g.add(slab(0.05, 0.7, 2.2, COLORS.glass, len / 2 + 0.01, height - 0.6, 0))
  for (const wx of [len / 2 - 1.3, -len / 2 + 1.6]) {
    for (const wz of [1.2, -1.2]) {
      const w = wheel(0.5, 0.3)
      w.position.set(wx, 0.5, wz)
      g.add(w)
    }
  }
  g.position.set(x, 0.06, z)
  g.rotation.y = rotY
  return g
}

function pedestrian(x: number, z: number, color = '#2456a6') {
  const g = new THREE.Group()
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.17, 1.0, 14), std(color))
  body.position.y = 0.7
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 12), std('#e0b48f'))
  head.position.y = 1.4
  body.castShadow = true
  g.add(body, head)
  g.position.set(x, 0.06, z)
  return g
}

function arrow(x: number, z: number, rotY = 0) {
  const shape = new THREE.Shape()
  shape.moveTo(-1.0, -0.12)
  shape.lineTo(0.3, -0.12)
  shape.lineTo(0.3, -0.38)
  shape.lineTo(1.0, 0)
  shape.lineTo(0.3, 0.38)
  shape.lineTo(0.3, 0.12)
  shape.lineTo(-1.0, 0.12)
  shape.closePath()
  const m = new THREE.Mesh(new THREE.ShapeGeometry(shape), std(COLORS.white, { side: THREE.DoubleSide, roughness: 0.6 }))
  m.rotation.x = -Math.PI / 2
  m.rotation.z = rotY
  m.position.set(x, 0.07, z)
  return m
}

function puddle(x: number, z: number, rx: number, rz: number) {
  const m = new THREE.Mesh(new THREE.CircleGeometry(1, 28), std('#7b9fc7', { roughness: 0.08, metalness: 0.4, transparent: true, opacity: 0.85 }))
  m.rotation.x = -Math.PI / 2
  m.scale.set(rx, rz, 1)
  m.position.set(x, 0.065, z)
  return m
}

function zebra(x: number, zA: number, zB: number) {
  const g = new THREE.Group()
  for (let z = zA + 0.4; z < zB - 0.2; z += 0.9) g.add(paint(2.8, 0.5, COLORS.white, x, z))
  return g
}

/** Placa pedagógica dibujada en un lienzo (esquemas, no la forma legal exacta). */
function signTexture(kind: 'pare' | 'ceda' | 'limite' | 'peligro' | 'info' | 'obras') {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const x = c.getContext('2d')!
  x.clearRect(0, 0, 256, 256)
  x.textAlign = 'center'
  x.textBaseline = 'middle'
  const poly = (pts: [number, number][], fill: string, stroke?: string, lw = 10) => {
    x.beginPath()
    pts.forEach(([px, py], i) => (i ? x.lineTo(px, py) : x.moveTo(px, py)))
    x.closePath()
    x.fillStyle = fill
    x.fill()
    if (stroke) {
      x.strokeStyle = stroke
      x.lineWidth = lw
      x.stroke()
    }
  }
  if (kind === 'pare') {
    const pts: [number, number][] = []
    for (let i = 0; i < 8; i++) pts.push([128 + 118 * Math.cos(Math.PI / 8 + (i * Math.PI) / 4), 128 + 118 * Math.sin(Math.PI / 8 + (i * Math.PI) / 4)])
    poly(pts, '#cc0000', '#ffffff', 10)
    x.fillStyle = '#fff'
    x.font = 'bold 64px sans-serif'
    x.fillText('PARE', 128, 132)
  } else if (kind === 'ceda') {
    poly([[18, 40], [238, 40], [128, 232]], '#ffffff', '#cc0000', 22)
    x.fillStyle = '#cc0000'
    x.font = 'bold 22px sans-serif'
    x.fillText('CEDA EL', 128, 82)
    x.fillText('PASO', 128, 108)
  } else if (kind === 'limite') {
    x.beginPath()
    x.arc(128, 128, 112, 0, Math.PI * 2)
    x.fillStyle = '#fff'
    x.fill()
    x.lineWidth = 22
    x.strokeStyle = '#cc0000'
    x.stroke()
    x.fillStyle = '#111'
    x.font = 'bold 96px sans-serif'
    x.fillText('60', 128, 134)
  } else if (kind === 'peligro') {
    poly([[128, 10], [246, 128], [128, 246], [10, 128]], '#f2c230', '#111', 8)
    x.strokeStyle = '#111'
    x.lineWidth = 16
    x.lineCap = 'round'
    x.beginPath()
    x.moveTo(110, 200)
    x.quadraticCurveTo(110, 120, 170, 84)
    x.stroke()
    poly([[170, 60], [204, 100], [150, 100]], '#111')
  } else if (kind === 'obras') {
    poly([[128, 10], [246, 128], [128, 246], [10, 128]], '#f07d1a', '#111', 8)
    x.fillStyle = '#111'
    x.font = 'bold 40px sans-serif'
    x.fillText('OBRAS', 128, 130)
  } else {
    x.fillStyle = '#1f7a4d'
    x.fillRect(8, 56, 240, 144)
    x.strokeStyle = '#fff'
    x.lineWidth = 6
    x.strokeRect(14, 62, 228, 132)
    x.fillStyle = '#fff'
    x.font = 'bold 34px sans-serif'
    x.fillText('DESTINO', 128, 102)
    x.font = 'bold 28px sans-serif'
    x.fillText('12 km →', 128, 152)
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

function sign(kind: Parameters<typeof signTexture>[0], x: number, z: number, rotY = 0) {
  const g = new THREE.Group()
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.3, 10), std('#8a8d92', { metalness: 0.5 }))
  post.position.y = 1.15
  post.castShadow = true
  const plate = new THREE.Mesh(
    new THREE.PlaneGeometry(1.1, 1.1),
    new THREE.MeshStandardMaterial({ map: signTexture(kind), transparent: true, side: THREE.DoubleSide, roughness: 0.5 }),
  )
  plate.position.set(0, 2.15, 0.06)
  g.add(post, plate)
  g.position.set(x, 0, z)
  g.rotation.y = rotY
  return g
}

function trafficLight(x: number, z: number, rotY = 0) {
  const g = new THREE.Group()
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.2, 10), std('#3a3d42'))
  post.position.y = 1.6
  g.add(post, slab(0.36, 1.0, 0.3, '#222428', 0, 2.7, 0))
  ;[
    [COLORS.red, 3.0],
    ['#f5b400', 2.7],
    ['#27a844', 2.4],
  ].forEach(([c, y], i) => {
    const l = new THREE.Mesh(new THREE.SphereGeometry(0.1, 14, 10), new THREE.MeshStandardMaterial({ color: c as string, emissive: c as string, emissiveIntensity: i === 0 ? 1.1 : 0.15 }))
    l.position.set(0.19, y as number, 0)
    g.add(l)
  })
  g.position.set(x, 0.06, z)
  g.rotation.y = rotY
  return g
}

function building(x: number, z: number, w: number, d: number, h: number, color = '#c9ccd2') {
  return slab(w, h, d, color, x, 0, z, { roughness: 0.9 })
}

const finish = (group: THREE.Group, focus: Scenario['focus']) => {
  group.updateMatrixWorld(true)
  return { group, focus }
}

type Builder = () => Scenario

/** Calzada recta de dos carriles con línea central amarilla y rayas de borde. */
function straight(len = 40): THREE.Group {
  const g = new THREE.Group()
  g.add(road(-len / 2, len / 2, -3.2, 3.2))
  g.add(paint(len, 0.12, COLORS.yellow, 0, -0.1), paint(len, 0.12, COLORS.yellow, 0, 0.1))
  g.add(paint(len, 0.1, COLORS.white, 0, -2.95), paint(len, 0.1, COLORS.white, 0, 2.95))
  return g
}

const OURS = 1.6

export const SCENARIOS: Record<string, Builder> = {
  /** Calle recta: el escenario de base. */
  road: () => {
    const group = new THREE.Group()
    group.add(straight())
    group.add(car('#8a99ad', 14, -1.6, Math.PI))
    return { ...finish(group, {}), bike: { position: [0, 0.06, OURS], rotationY: 0 }, view: { position: [5.5, 2.6, 7.5], target: [1.5, 0.7, 0.5] } }
  },

  /** Superficies con menos adherencia en nuestro carril. */
  surfaces: () => {
    const group = new THREE.Group()
    group.add(straight(34))
    const mk = (name: string, x: number, color: string, o: THREE.MeshStandardMaterialParameters = {}) => {
      const g = named(new THREE.Group(), name)
      g.add(paint(2.4, 2.6, color, x, OURS, 0.066))
      ;(g.children[0] as THREE.Mesh).material = std(color, { roughness: 0.9, ...o })
      group.add(g)
      return g
    }
    const gravel = mk('gravel', 4, '#a89886')
    const oil = mk('oil', 7.5, '#1d1d20', { roughness: 0.05, metalness: 0.5 })
    const wet = mk('wet', 11, '#7b9fc7', { roughness: 0.08, metalness: 0.4 })
    const sand = mk('sand', 14.5, '#d9c08a')
    const pav = mk('paint', 18, '#f3f3f0', { roughness: 0.3 })
    return { ...finish(group, { gravel, oil, wet, sand, paint: pav }), bike: { position: [-4, 0.06, OURS], rotationY: 0 }, view: { position: [8, 4.5, 8.5], target: [10, 0, 0.8] } }
  },

  /** Distancia de reacción + distancia de frenado, con el doble de velocidad. */
  braking: () => {
    const group = new THREE.Group()
    group.add(straight(46))
    // Nuestro carril: velocidad normal. Carril contrario: el doble (esquema, no medidas reales).
    const s1 = named(new THREE.Group(), 'speed1')
    const r1 = named(new THREE.Group(), 'reaction1')
    r1.add(paint(4, 2.8, '#f5d04a', 3, OURS, 0.066))
    const b1 = named(new THREE.Group(), 'braking1')
    b1.add(paint(6, 2.8, '#d8584a', 8, OURS, 0.066))
    s1.add(r1, b1)
    const s2 = named(new THREE.Group(), 'speed2')
    const r2 = named(new THREE.Group(), 'reaction2')
    r2.add(paint(8, 2.8, '#f5d04a', 4, -OURS, 0.066))
    const b2 = named(new THREE.Group(), 'braking2')
    b2.add(paint(24, 2.8, '#d8584a', 20, -OURS, 0.066))
    s2.add(r2, b2)
    group.add(s1, s2)
    group.add(car('#8a99ad', 16, OURS, 0))
    return { ...finish(group, { speed1: s1, speed2: s2, reaction1: r1, braking1: b1, reaction2: r2, braking2: b2, reaction: r1, braking: b1 }), bike: { position: [-0.6, 0.06, OURS], rotationY: 0 }, view: { position: [9, 9, 9], target: [10, 0, 0] } }
  },

  /** Distancia de seguimiento con un punto de referencia. */
  following: () => {
    const group = new THREE.Group()
    group.add(straight())
    group.add(car('#b5473a', 11, OURS, 0))
    const gap = named(new THREE.Group(), 'gap')
    gap.add(paint(8.5, 2.8, '#f5d04a', 5.5, OURS, 0.066))
    const mark = named(new THREE.Group(), 'point')
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.2, 12), std(COLORS.red))
    post.position.set(5.5, 0.66, 3.5)
    mark.add(post)
    group.add(gap, mark, car('#8a99ad', 16, -OURS, Math.PI))
    return { ...finish(group, { gap, point: mark }), bike: { position: [0.4, 0.06, OURS], rotationY: 0 }, view: { position: [6, 3.2, 8.2], target: [6, 0.6, 0.8] } }
  },

  /** Patio de prácticas con cuatro ejercicios señalados con conos. */
  yard: () => {
    const group = new THREE.Group()
    group.add(slab(36, 0.06, 22, COLORS.asphalt, 0, 0, 0), slab(36.6, 0.1, 0.3, COLORS.curb, 0, 0, 11.15), slab(36.6, 0.1, 0.3, COLORS.curb, 0, 0, -11.15))
    group.add(paint(36, 0.12, COLORS.white, 0, 10.6), paint(36, 0.12, COLORS.white, 0, -10.6))

    const slalom = named(new THREE.Group(), 'slalom')
    for (let i = 0; i < 6; i++) slalom.add(cone(-12 + i * 3, -7 + (i % 2 ? 0.9 : -0.9)))
    const gate = named(new THREE.Group(), 'gate')
    for (let i = 0; i < 5; i++) {
      gate.add(cone(-2 + i * 2.2, 5.6))
      gate.add(cone(-2 + i * 2.2, 7.4))
    }
    const eight = named(new THREE.Group(), 'eight')
    for (let k = 0; k < 2; k++) {
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2
        eight.add(cone(12 + 3.4 * Math.cos(a), -5 + k * 7.2 + 3.4 * Math.sin(a)))
      }
    }
    const circle = named(new THREE.Group(), 'circle')
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2
      circle.add(cone(-9 + 5.2 * Math.cos(a), 4.5 + 5.2 * Math.sin(a)))
    }
    const start = named(new THREE.Group(), 'start')
    start.add(paint(0.3, 4, COLORS.white, -15, 0), cone(-15, -2), cone(-15, 2), paint(0.3, 4, COLORS.red, 15, 0), cone(15, -2), cone(15, 2))
    group.add(slalom, gate, eight, circle, start)
    return { ...finish(group, { slalom, gate, eight, circle, start }), bike: { position: [-15, 0.06, 0], rotationY: 0 }, view: { position: [0, 26, 18], target: [0, 0, 1] } }
  },

  /** Panel con las señales verticales. */
  signs: () => {
    const group = new THREE.Group()
    group.add(slab(22, 0.08, 6, COLORS.ground, 0, 0, 0))
    const kinds: [string, Parameters<typeof sign>[0]][] = [['pare', 'pare'], ['ceda', 'ceda'], ['limite', 'limite'], ['peligro', 'peligro'], ['info', 'info'], ['obras', 'obras']]
    const focus: Record<string, THREE.Object3D> = {}
    kinds.forEach(([name, kind], i) => {
      const s = named(sign(kind, -8.5 + i * 3.4, 0), name)
      group.add(s)
      focus[name] = s
    })
    const families: Scenario['focus'] = {
      ...focus,
      reglamentarias: [focus.pare, focus.ceda, focus.limite],
      preventivas: focus.peligro,
      informativas: focus.info,
      transitorias: focus.obras,
    }
    return { ...finish(group, families), bike: null, view: { position: [0, 3.2, 10.5], target: [0, 1.6, 0] } }
  },

  /** Demarcaciones del pavimento. */
  markings: () => {
    const group = new THREE.Group()
    group.add(road(-20, 20, -3.2, 3.2))
    group.add(paint(40, 0.1, COLORS.white, 0, -2.95), paint(40, 0.1, COLORS.white, 0, 2.95))
    const cont = named(new THREE.Group(), 'continuous')
    cont.add(paint(12, 0.12, COLORS.yellow, -14, -0.1), paint(12, 0.12, COLORS.yellow, -14, 0.1))
    const seg = named(new THREE.Group(), 'dashed')
    seg.add(dashes(-8, 6, 0, COLORS.yellow))
    const cross = named(new THREE.Group(), 'crosswalk')
    cross.add(zebra(10, -3.1, 3.1))
    const stop = named(new THREE.Group(), 'stopline')
    stop.add(paint(0.4, 3.0, COLORS.white, 7, OURS))
    const arrows = named(new THREE.Group(), 'arrows')
    arrows.add(arrow(-4, OURS))
    const lane = named(new THREE.Group(), 'exclusive')
    lane.add(paint(8, 3.0, '#b43a32', 15, OURS, 0.064))
    group.add(cont, seg, cross, stop, arrows, lane, pedestrian(10, -3.6))
    return { ...finish(group, { continuous: cont, dashed: seg, crosswalk: cross, stopline: stop, arrows, exclusive: lane }), bike: { position: [-17, 0.06, OURS], rotationY: 0 }, view: { position: [2, 13, 9], target: [0, 0, 0] } }
  },

  /** Cruce con semáforos. */
  intersection: () => {
    const group = new THREE.Group()
    group.add(road(-22, 22, -3.2, 3.2), slab(6.4, 0.06, 44, COLORS.asphalt, 0, 0, 0))
    const box = named(new THREE.Group(), 'box')
    box.add(paint(6.2, 6.2, '#ffffff', 0, 0, 0.0625))
    ;((box.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial).opacity = 0
    ;((box.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial).transparent = true
    const lights = named(new THREE.Group(), 'lights')
    lights.add(trafficLight(-4.2, 3.7, 0), trafficLight(4.2, -3.7, Math.PI))
    const cw = named(new THREE.Group(), 'crosswalks')
    cw.add(zebra(-5.2, -3.1, 3.1), zebra(5.2, -3.1, 3.1))
    const stops = named(new THREE.Group(), 'stopline')
    stops.add(paint(0.4, 3.0, COLORS.white, -3.9, OURS))
    group.add(box, lights, cw, stops, car('#6d8f6a', -9, -OURS, Math.PI), car('#b5473a', 3, 9, Math.PI / 2), building(-10, 9, 8, 8, 6), building(10, 9, 8, 8, 8), building(-10, -9, 8, 8, 5), building(10, -9, 8, 8, 7))
    return { ...finish(group, { box, lights, crosswalks: cw, stopline: stops }), bike: { position: [-8, 0.06, OURS], rotationY: 0 }, view: { position: [-14, 9, 13], target: [0, 0.5, 0] } }
  },

  /** Glorieta. */
  roundabout: () => {
    const group = new THREE.Group()
    const ring = new THREE.Mesh(new THREE.RingGeometry(5.5, 11.5, 64), std(COLORS.asphalt))
    ring.rotation.x = -Math.PI / 2
    ring.position.y = 0.03
    ring.receiveShadow = true
    const island = new THREE.Mesh(new THREE.CylinderGeometry(5.2, 5.2, 0.2, 48), std('#9bb89a'))
    island.position.y = 0.1
    group.add(ring, island, road(-26, -10.5, -3.2, 3.2), road(10.5, 26, -3.2, 3.2))
    const inside = named(new THREE.Group(), 'inside')
    inside.add(car('#b5473a', 0, 8.5, Math.PI), car('#8a99ad', -8.5, 0, -Math.PI / 2))
    const entry = named(new THREE.Group(), 'entry')
    entry.add(paint(0.5, 3.0, COLORS.white, -11.2, OURS), sign('ceda', -13, 4.2, Math.PI / 2))
    group.add(inside, entry)
    return { ...finish(group, { inside, entry }), bike: { position: [-18, 0.06, OURS], rotationY: 0 }, view: { position: [-12, 22, 18], target: [0, 0, 0] } }
  },

  /** Tráfico: punto ciego, puertas, peatones y zona de escape. */
  traffic: () => {
    const group = new THREE.Group()
    group.add(straight(46))
    group.add(slab(46, 0.1, 2.4, COLORS.ground, 0, 0, 5.4))
    const parked = car('#6d8f6a', 4, 4.8, 0)
    const door = named(new THREE.Group(), 'door')
    door.add(paint(1.6, 1.6, '#f5d04a', 4.4, 3.4, 0.066))
    ;((door.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial).opacity = 0.7
    const blind = named(new THREE.Group(), 'blind')
    blind.add(bigVehicle(9, 3.2, '#f0f0ee', 14, OURS, 0))
    const blindZone = new THREE.Mesh(new THREE.BoxGeometry(7, 0.02, 2.4), new THREE.MeshStandardMaterial({ color: '#cc0000', transparent: true, opacity: 0.35 }))
    blindZone.position.set(8.5, 0.09, OURS - 2.7)
    blind.add(blindZone)
    const ped = named(new THREE.Group(), 'pedestrian')
    ped.add(pedestrian(9, 5.4, '#c2562b'), pedestrian(9.6, 5.6, '#2456a6'))
    const escape = named(new THREE.Group(), 'escape')
    escape.add(paint(10, 1.2, '#4aa86a', -6, 2.2, 0.066))
    group.add(parked, door, blind, ped, escape, car('#8a99ad', 14, -OURS, Math.PI))
    return { ...finish(group, { door, blind, pedestrian: ped, escape }), bike: { position: [-8, 0.06, OURS], rotationY: 0 }, view: { position: [-2, 7.5, 11.5], target: [5, 0.6, 1.5] } }
  },

  /** Cambio de carril: dos carriles en el mismo sentido. */
  lanechange: () => {
    const group = new THREE.Group()
    group.add(road(-24, 24, -3.2, 3.2))
    group.add(paint(48, 0.1, COLORS.white, 0, -2.95), paint(48, 0.1, COLORS.white, 0, 2.95), dashes(-24, 24, 0, COLORS.white))
    const target = named(new THREE.Group(), 'target')
    target.add(paint(8, 3.0, '#4aa86a', 4, -1.6, 0.066))
    ;((target.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial).opacity = 0.6
    ;((target.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial).transparent = true
    const behind = named(new THREE.Group(), 'behind')
    behind.add(car('#b5473a', -12, -1.6, 0))
    const blind = named(new THREE.Group(), 'blindspot')
    blind.add(paint(5, 3.0, '#f5d04a', -4.5, -1.6, 0.066))
    ;((blind.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial).transparent = true
    ;((blind.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial).opacity = 0.7
    group.add(target, behind, blind, car('#8a99ad', 16, OURS, 0))
    return { ...finish(group, { target, behind, blindspot: blind }), bike: { position: [0, 0.06, OURS], rotationY: 0 }, view: { position: [-9, 8, 9.5], target: [-1, 0.4, 0] } }
  },

  /** Curva a la izquierda de 90°. */
  curve: () => {
    const group = new THREE.Group()
    const R = 14
    const ring = new THREE.Mesh(new THREE.RingGeometry(R - 3.2, R + 3.2, 72, 1, -Math.PI / 2, Math.PI / 2), std(COLORS.asphalt))
    ring.rotation.x = -Math.PI / 2
    ring.position.set(0, 0.03, -R)
    ring.receiveShadow = true
    group.add(ring, road(-14, 0, -3.2, 3.2), paint(14, 0.12, COLORS.yellow, -7, -0.1), paint(14, 0.12, COLORS.yellow, -7, 0.1))
    for (let i = 1; i < 18; i++) {
      const th = (i / 18) * (Math.PI / 2)
      const d = paint(0.5, 0.12, COLORS.yellow, R * Math.sin(th), -R + R * Math.cos(th))
      d.rotation.y = th
      group.add(d)
    }
    const mk = (name: string, a0: number, a1: number, color: string) => {
      const g = named(new THREE.Group(), name)
      const m = new THREE.Mesh(new THREE.RingGeometry(R + 0.1, R + 3.1, 24, 1, -Math.PI / 2 + a0, a1 - a0), new THREE.MeshStandardMaterial({ color, transparent: true, opacity: 0.55 }))
      m.rotation.x = -Math.PI / 2
      m.position.set(0, 0.075, -R)
      g.add(m)
      group.add(g)
      return g
    }
    const entry = mk('entry', 0, 0.45, '#f5d04a')
    const apex = mk('apex', 0.55, 1.0, '#d8584a')
    const exit = mk('exit', 1.1, Math.PI / 2, '#4aa86a')
    group.add(sign('peligro', -8, 4.4, 0))
    return { ...finish(group, { entry, apex, exit }), bike: { position: [-6, 0.06, OURS], rotationY: 0 }, view: { position: [-14, 12, 16], target: [4, 0, -4] } }
  },

  /** Subida: calzada inclinada. */
  slope: () => {
    const group = new THREE.Group()
    const slopeG = new THREE.Group()
    slopeG.add(straight(40))
    slopeG.rotation.z = 0.14
    group.add(slopeG)
    group.add(slab(60, 0.1, 12, COLORS.ground, 0, -0.1, 0))
    const up = named(new THREE.Group(), 'uphill')
    const upM = paint(10, 3.0, '#f5d04a', 8, OURS, 0.066)
    ;(upM.material as THREE.MeshStandardMaterial).transparent = true
    ;(upM.material as THREE.MeshStandardMaterial).opacity = 0.6
    up.add(upM)
    up.rotation.z = 0.14
    group.add(up)
    return { ...finish(group, { uphill: up }), bike: { position: [0, 0.06, OURS], rotationY: 0, pitch: 0.14 }, view: { position: [6, 3.6, 9], target: [4, 1, 0.8] } }
  },

  /** Lluvia y charcos. */
  rain: () => {
    const group = new THREE.Group()
    group.add(road(-20, 20, -3.2, 3.2, COLORS.asphaltDark))
    group.add(paint(40, 0.12, COLORS.yellow, 0, -0.1), paint(40, 0.12, COLORS.yellow, 0, 0.1), paint(40, 0.1, COLORS.white, 0, -2.95), paint(40, 0.1, COLORS.white, 0, 2.95))
    const pud = named(new THREE.Group(), 'puddle')
    pud.add(puddle(7, OURS, 2.4, 1.2), puddle(12, OURS - 0.4, 1.6, 0.9))
    const slick = named(new THREE.Group(), 'first')
    slick.add(paint(10, 3.0, '#6f7a88', 3, OURS, 0.066))
    ;((slick.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial).transparent = true
    ;((slick.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial).opacity = 0.5
    group.add(slick, pud, car('#8a99ad', 14, -OURS, Math.PI))
    return { ...finish(group, { puddle: pud, first: slick }), bike: { position: [-6, 0.06, OURS], rotationY: 0 }, rain: true, dim: 0.75, view: { position: [-2, 4.2, 8.5], target: [6, 0.4, 0.8] } }
  },

  /** Noche: faro encendido y prenda reflectiva. */
  night: () => {
    const group = new THREE.Group()
    group.add(road(-20, 22, -3.2, 3.2, COLORS.asphaltDark))
    group.add(paint(42, 0.12, COLORS.yellow, 0, -0.1), paint(42, 0.12, COLORS.yellow, 0, 0.1), paint(42, 0.1, COLORS.white, 0, -2.95), paint(42, 0.1, COLORS.white, 0, 2.95))
    const beam = named(new THREE.Group(), 'beam')
    const cone3 = new THREE.Mesh(new THREE.ConeGeometry(2.4, 11, 28, 1, true), new THREE.MeshBasicMaterial({ color: '#fff3c4', transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false }))
    cone3.rotation.z = -Math.PI / 2
    cone3.position.set(6.6, 0.8, OURS)
    beam.add(cone3)
    const refl = named(new THREE.Group(), 'reflective')
    refl.add(slab(0.5, 1.0, 0.12, '#d7f03a', 13, 0.06, 4.1, { emissive: '#aacc10', emissiveIntensity: 0.6 }))
    group.add(beam, refl, sign('peligro', 10, 4.4, 0))
    return { ...finish(group, { beam, reflective: refl }), bike: { position: [0, 0.06, OURS], rotationY: 0 }, dim: 0.4, view: { position: [-4, 3, 7], target: [5, 0.8, 1] } }
  },

  /** Incidente: zona de choque, señalización y zona segura. */
  incident: () => {
    const group = new THREE.Group()
    group.add(straight(40))
    group.add(slab(40, 0.1, 2.4, COLORS.ground, 0, 0, 5.4))
    const danger = named(new THREE.Group(), 'danger')
    danger.add(car('#b5473a', 6, OURS, 0.35))
    const hazard = paint(8, 3.0, '#cc0000', 6, OURS, 0.066)
    ;(hazard.material as THREE.MeshStandardMaterial).transparent = true
    ;(hazard.material as THREE.MeshStandardMaterial).opacity = 0.45
    danger.add(hazard)
    const warning = named(new THREE.Group(), 'warning')
    for (let i = 0; i < 4; i++) warning.add(cone(-2 - i * 1.6, OURS + (i % 2 ? 0.4 : -0.4)))
    const safe = named(new THREE.Group(), 'safe')
    safe.add(paint(12, 2.0, '#4aa86a', -8, 5.4, 0.11))
    safe.add(pedestrian(-8, 5.5, '#2456a6'))
    group.add(danger, warning, safe)
    return { ...finish(group, { danger, warning, safe }), bike: { position: [-12, 0.06, OURS], rotationY: 0 }, view: { position: [-10, 7.5, 12], target: [-1, 0.4, 2] } }
  },
}

export const SCENARIO_IDS = Object.keys(SCENARIOS)
