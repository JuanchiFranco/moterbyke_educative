import * as THREE from 'three'

/**
 * Recorridos de la moto en los escenarios: cada tema tiene el suyo y la moto lo actúa (frena en la zona roja,
 * esquiva los conos, toma la curva…). Un recorrido es una trayectoria suave por puntos, con la velocidad que
 * lleva en cada uno y, si hace falta, una pausa. Las coordenadas son las del escenario (+x adelante, +z a la derecha).
 */

/** [x, z, velocidad en m/s, pausa en segundos al llegar]. */
export type RidePoint = [x: number, z: number, speed: number, pause?: number]

export interface RideSpec {
  points: RidePoint[]
  /** Segundos quieta al final antes de repetir (por defecto 1,4). */
  hold?: number
}

export interface RideSample {
  x: number
  z: number
  /** Giro sobre el eje vertical: 0 mira a +x. */
  heading: number
  speed: number
  /** Cuánto gira la trayectoria por metro (rad/m); positivo hacia la izquierda. */
  curvature: number
}

export interface Track {
  length: number
  at: (s: number) => RideSample
  /** Posiciones (en metros recorridos) donde se detiene y por cuánto tiempo. El final es la última. */
  pauses: { s: number; t: number }[]
}

const FLOOR = 0.35

/** Convierte una lista de puntos en una trayectoria continua (spline de Catmull-Rom) con perfil de velocidad. */
export function buildTrack(spec: RideSpec): Track {
  const pts = spec.points
  const v3 = pts.map(([x, z]) => new THREE.Vector3(x, 0, z))
  const curve = pts.length > 2 ? new THREE.CatmullRomCurve3(v3, false, 'centripetal') : new THREE.LineCurve3(v3[0], v3[1])
  const N = Math.max(60, pts.length * 20)
  const samples = curve.getSpacedPoints(N)
  const cum = [0]
  for (let i = 1; i < samples.length; i++) cum.push(cum[i - 1] + samples[i].distanceTo(samples[i - 1]))
  const length = cum[cum.length - 1]

  // Metros recorridos en cada punto de paso: se busca el punto de la curva más cercano.
  const wp: number[] = pts.map((_, i) => {
    if (i === 0) return 0
    if (i === pts.length - 1) return length
    let best = 0
    let bd = Infinity
    for (let k = 0; k < samples.length; k++) {
      const d = samples[k].distanceToSquared(v3[i])
      if (d < bd) {
        bd = d
        best = k
      }
    }
    return cum[best]
  })

  const pos = (s: number) => {
    const c = Math.min(Math.max(s, 0), length)
    let lo = 0
    let hi = cum.length - 1
    while (hi - lo > 1) {
      const m = (lo + hi) >> 1
      if (cum[m] <= c) lo = m
      else hi = m
    }
    const span = cum[hi] - cum[lo] || 1
    const u = (c - cum[lo]) / span
    return { p: samples[lo].clone().lerp(samples[hi], u), a: samples[lo], b: samples[hi] }
  }
  const headingAt = (s: number) => {
    const { a, b } = pos(s)
    return Math.atan2(-(b.z - a.z), b.x - a.x)
  }
  const speedAt = (s: number) => {
    let k = 0
    while (k < wp.length - 2 && s > wp[k + 1]) k++
    const span = wp[k + 1] - wp[k] || 1
    const u = Math.min(Math.max((s - wp[k]) / span, 0), 1)
    const v0 = pts[k][2]
    const v1 = pts[k + 1][2]
    // v² varía linealmente con el camino: eso es una aceleración o frenada constante.
    return Math.max(Math.sqrt(Math.max(v0 * v0 + (v1 * v1 - v0 * v0) * u, 0)), FLOOR)
  }

  const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a))
  const pauses: Track['pauses'] = []
  pts.forEach((p, i) => {
    if (i > 0 && i < pts.length - 1 && p[3]) pauses.push({ s: wp[i], t: p[3] })
  })
  pauses.push({ s: length, t: spec.hold ?? 1.4 })

  return {
    length,
    pauses,
    at: (s) => {
      const { p } = pos(s)
      const h = headingAt(s)
      const d = 0.7
      const curvature = wrap(headingAt(Math.min(s + d, length)) - headingAt(Math.max(s - d, 0))) / (Math.min(s + d, length) - Math.max(s - d, 0) || 1)
      return { x: p.x, z: p.z, heading: h, speed: speedAt(s), curvature }
    },
  }
}

const L = 1.6
const cruise = (x0: number, x1: number, v = 3.5, z = L): RideSpec => ({ points: [[x0, z, v], [x1, z, v]], hold: 0.6 })

/** Frena hasta detenerse: reacción a velocidad constante y después frenada. */
const brakeTo = (x0: number, xReact: number, xStop: number, v: number, z = L): RideSpec => ({
  points: [[x0, z, v], [xReact, z, v], [xStop, z, 0]],
})

/** Puntos sobre un arco de circunferencia. */
const arc = (cx: number, cz: number, r: number, a0: number, a1: number, n: number, v: number): RidePoint[] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / n
    return [cx + r * Math.cos(a), cz + r * Math.sin(a), v] as RidePoint
  })

// Ejercicios del patio -------------------------------------------------------------------------------------------

const startRun: RideSpec = { points: [[-15, 0, 1], [-12, 0, 4], [10, 0, 4], [15, 0, 0]] }

const slalom: RideSpec = {
  points: [
    [-14, -7, 2.4],
    ...Array.from({ length: 6 }, (_, i) => [-12 + i * 3 + 1.5, -7 + (i % 2 ? 1.1 : -1.1), 2.4] as RidePoint),
    [8, -7, 2.4],
  ],
}

// Círculo de conos de centro (-9, 4,5): dos vueltas sin bajar el ritmo.
const circle: RideSpec = { points: arc(-9, 4.5, 4.2, Math.PI, Math.PI - Math.PI * 4, 56, 2.8), hold: 0.2 }

// Ocho de conos: dos círculos tangentes alrededor de (12, -1,4).
const eight: RideSpec = {
  points: Array.from({ length: 49 }, (_, i) => {
    const t = Math.PI / 2 + (i / 48) * Math.PI * 2
    return [12 + 5.8 * Math.sin(t) * Math.cos(t), -1.4 + 6.2 * Math.cos(t), 2.8] as RidePoint
  }),
  hold: 0.2,
}

const gate: RideSpec = { points: [[-4.4, 6.5, 2], [7.2, 6.5, 2], [9.5, 6.5, 0]] }

// Calle ------------------------------------------------------------------------------------------------------------

const laneChange: RideSpec = { points: [[-10, L, 4], [-2, L, 4], [3, 0, 4], [8, -L, 4], [15, -L, 4]], hold: 1 }

const R = 14
// Curva a la izquierda: entra por fuera, pasa por dentro y sale por fuera, frenando antes de inclinar.
const curveRide: RideSpec = {
  points: [
    [-14, L, 5],
    [-6, L + 0.3, 5],
    [-1, 2.3, 4],
    ...Array.from({ length: 11 }, (_, i) => {
      const th = 0.1 + (i / 10) * (Math.PI / 2 - 0.1)
      const r = 16.4 - 1.8 * Math.sin(2 * th)
      const v = th < Math.PI / 4 ? 3.2 + 0.8 * (1 - th / (Math.PI / 4)) : 3.2 + 2.2 * ((th - Math.PI / 4) / (Math.PI / 4))
      return [r * Math.sin(th), -R + r * Math.cos(th), v] as RidePoint
    }),
  ],
}

// La calzada sube a 0,14 rad: la z es la del carril y la altura la pone la moto.
const slopeRide: RideSpec = { points: [[0, L, 3], [14, L, 3], [17, L, 0]] }

export const RIDES: Record<string, RideSpec> = {
  // Física sencilla
  fis_adherencia: cruise(-4, 22, 2.2),
  fis_reaccion: brakeTo(-0.6, 5, 11, 5),
  fis_doble: brakeTo(-0.6, 8, 32, 10, -L),
  fis_seguimiento: { points: [[-13, L, 4], [-5, L, 4], [1, L, 0]] },
  fis_frenar: brakeTo(-14, -2, 6, 5),

  // Práctica y maniobras
  pra_n4: startRun,
  pra_n6: circle,
  pra_n7: brakeTo(-0.6, 5, 11, 5),
  man_franja: gate,
  man_eslalon: slalom,
  man_ocho: eight,
  man_emergencia: brakeTo(-0.6, 5, 11, 5),
  man_carril: laneChange,
  man_curva: curveRide,
  man_pendiente: slopeRide,
  man_procedimiento: startRun,

  // Señales y demarcaciones
  sen_continuas: cruise(-18, 19, 3.2),
  sen_segmentadas: { points: [[-10, L, 3.4], [-4, L, 3.4], [2, 0.2, 3.4], [8, 0.2, 3.4], [12, L, 3.4]], hold: 1 },
  sen_peatonal: { points: [[-17, L, 4], [2, L, 4], [6.3, L, 0, 2.4], [8, L, 2], [13, L, 3.2], [19, L, 3.6]] },
  sen_exclusivos: cruise(-18, 19, 3.2),
  sen_semaforos: { points: [[-16, L, 4], [-8, L, 3.8], [-4.6, L, 0, 2.6], [-2, L, 2.2], [8, L, 3.6], [20, L, 4]] },
  sen_intersecciones: { points: [[-16, L, 3.6], [-8, L, 3], [-4.6, L, 1.6], [0, L, 2], [6, L, 2.4], [20, L, 3.6]] },

  // Conducción defensiva
  def_observacion: { points: [[-8, L, 4], [1, 1.2, 3.5], [4, 0.9, 3], [7.4, 1.2, 0, 1.6]] },
  def_carril: { points: [[-18, 1.4, 4], [-4, 1.4, 4], [4, 1.4, 3.6]], hold: 0.8 },
  def_distancia: { points: [[-14, L, 4], [-5, L, 3], [4.2, L, 0, 1.6]] },
  def_cambio: laneChange,
  def_vulnerables: { points: [[-10, L, 4], [1, 1.4, 3], [5, 0.8, 1.8], [7.6, 0.8, 0, 1.6]] },

  // Curvas, pendientes, lluvia y noche
  con_curvas: curveRide,
  con_pendientes: slopeRide,
  con_lluvia: { points: [[-6, L, 3.2], [-2, L, 2.2], [20, L, 2.2]] },
  con_noche: cruise(-9, 20, 3),

  // Incidentes
  inc_pas: { points: [[-18, L, 4], [-15, L, 3], [-13, 3, 1.5], [-10.5, 4.8, 0, 3]] },
  inc_no: { points: [[-18, L, 3.6], [-9.5, L, 0, 2.8]] },

  // Consulta
  cns_carril: laneChange,
  cns_clase: startRun,
}

const cache = new Map<string, Track>()
/** Recorrido del tema, o null si no tiene uno propio (la moto hace entonces un trayecto sencillo). */
export function trackFor(id: string | undefined): Track | null {
  if (!id || !RIDES[id]) return null
  let t = cache.get(id)
  if (!t) {
    t = buildTrack(RIDES[id])
    cache.set(id, t)
  }
  return t
}
