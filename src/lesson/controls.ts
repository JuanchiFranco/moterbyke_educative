export type ControlId = 'throttle' | 'frontBrake' | 'clutch' | 'shift' | 'rearBrake'

export type Vec3 = [number, number, number]

export interface ControlInfo {
  id: ControlId
  name: string
  /** Mano o pie que lo acciona. */
  limb: string
  /** Nombre de la pieza, para la etiqueta sobre la moto. */
  part: string
  /** Dónde está en la moto. */
  where: string
  /** Qué hace. */
  does: string
  /** El gesto para accionarlo. */
  gesture: string
  /** Nota de seguridad, parte de la lección. */
  safety: string
  /** Dato de la moto de referencia. */
  fact: string
  /** Nodo del modelo 3D que es este mando. */
  node: string
  /** Desde dónde se mira para estudiarlo, relativo al mando (x: delante, y: arriba, z: derecha), en metros. */
  view: Vec3
}

/** Moto del modelo 3D: Yamaha R1 2020, de ejsnowy (CC BY 4.0). */
export const BIKE_NAME = 'Yamaha R1 2020'
export const MODEL_URL = '/models/yamaha_r1.glb'
export const MODEL_CREDIT = {
  title: 'Yamaha R1',
  author: 'ejsnowy',
  url: 'https://sketchfab.com/3d-models/yamaha-r1-7b3343ad0c0f4cbe94238c734e1b731a',
  license: 'CC BY 4.0',
  licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
}

// Ejes del modelo ya orientado: +x hacia delante, +y arriba, +z a la derecha del piloto.
export const CONTROLS: ControlInfo[] = [
  {
    id: 'throttle',
    name: 'Acelerador',
    limb: 'Mano derecha',
    part: 'Puño del acelerador',
    where: 'Puño derecho del manillar',
    does: 'Girar el puño hacia ti da gas: el motor empuja con más fuerza. Al soltarlo vuelve solo a cero.',
    gesture: 'Gira la muñeca hacia ti, poco a poco.',
    safety: 'Agarra con la muñeca baja y recta: así un bache no te hace dar gas sin querer.',
    fact: 'Motor de 998 cc, cuatro cilindros en línea, con unos 199 CV según su ficha pública.',
    node: 'Yam_R1_Throttle',
    view: [-0.55, 0.4, 0.5],
  },
  {
    id: 'frontBrake',
    name: 'Freno delantero',
    limb: 'Mano derecha',
    part: 'Maneta de freno',
    where: 'Maneta derecha, delante del puño del acelerador',
    does: 'Frena la rueda delantera, que es la que aporta la mayor parte de la frenada.',
    gesture: 'Aprieta la maneta con los dedos, de forma progresiva.',
    safety: 'Nunca de golpe: un apretón brusco puede bloquear la rueda delantera y hacerte caer.',
    fact: 'Dos discos delanteros de 320 mm, con ABS.',
    node: 'Yam_R1_Front_Brake_Lever',
    view: [-0.5, 0.4, 0.45],
  },
  {
    id: 'clutch',
    name: 'Embrague',
    limb: 'Mano izquierda',
    part: 'Maneta de embrague',
    where: 'Maneta izquierda del manillar',
    does: 'Al apretar la maneta, el motor deja de empujar la rueda. Se usa para arrancar, parar y cambiar de marcha.',
    gesture: 'Aprieta la maneta hasta el puño y suéltala despacio.',
    safety: 'Suéltalo despacio al arrancar: si lo sueltas de golpe, la moto da un tirón o se cala.',
    fact: 'Embrague multidisco en baño de aceite, con asistencia y antirrebote.',
    node: 'Yam_R1_Clutch_Lever',
    view: [-0.55, 0.4, -0.5],
  },
  {
    id: 'shift',
    name: 'Palanca de cambios',
    limb: 'Pie izquierdo',
    part: 'Palanca de cambios',
    where: 'Delante del estribo izquierdo',
    does: 'Sube y baja de marcha. El patrón habitual es primera hacia abajo, punto muerto, y las demás hacia arriba.',
    gesture: 'Pisa con la puntera para bajar de marcha; levanta con el empeine para subir.',
    safety: 'Cambia con el embrague apretado y sin mirar al pie: la vista sigue en la carretera.',
    fact: 'Caja de 6 velocidades.',
    node: 'Yam_R1_Gear_Lever',
    view: [0.6, 0.2, -0.95],
  },
  {
    id: 'rearBrake',
    name: 'Freno trasero',
    limb: 'Pie derecho',
    part: 'Pedal de freno',
    where: 'Pedal delante del estribo derecho',
    does: 'Frena la rueda trasera. Ayuda a estabilizar la moto y a controlar las maniobras lentas.',
    gesture: 'Pisa el pedal con la puntera del pie derecho.',
    safety: 'Úsalo junto con el delantero: él solo alarga mucho la distancia de frenado.',
    fact: 'Disco trasero de 220 mm, con ABS.',
    node: 'Yam_R1_Brake_Lever',
    view: [0.6, 0.2, 0.95],
  },
]
