import { LESSON_RUTA, LESSON_FISICA, LESSON_PROTECCION, LESSON_REVISION } from './content/ruta'
import { LESSON_PRACTICA, LESSON_MANIOBRAS } from './content/practica'
import { LESSON_SENALES, LESSON_DEFENSIVA, LESSON_CONDICIONES } from './content/transito'
import { LESSON_CARGA, LESSON_MANTENIMIENTO, LESSON_INCIDENTES, LESSON_CONSULTA } from './content/cuidado'

export type Vec3 = [number, number, number]

/** Gestos animados de los mandos: cada uno tiene su propio pivote en el modelo. */
export type Gesture = 'throttle' | 'frontBrake' | 'clutch' | 'shift' | 'rearBrake'

export interface Section {
  label: string
  text: string
}

export interface Item {
  id: string
  name: string
  /** Línea corta bajo el nombre en la lista (mano o pie, o la familia del tema). */
  tag: string
  /** Subtítulo grande sobre la moto mientras se estudia. */
  where: string
  /** Filas de la ficha: etiqueta y texto. */
  sections: Section[]
  /** Fila extra que solo sale con una moto concreta (por id), con un dato de esa moto. */
  facts?: Record<string, Section>
  /** Desde dónde se mira la pieza, relativo a su centro (x: delante, y: arriba, z: derecha), en metros. */
  view: Vec3
  /** Nombre de la pieza en la etiqueta sobre la moto; si falta, se usa el del tema. */
  part?: string
  /** Es un mando que se mueve: gesto animado y clic directo sobre la moto (solo en motos que traen la pieza separada). */
  gesture?: Gesture
  /** Escenario 3D del tema («bike»: la moto sola). Si falta, el de la lección. */
  stage?: string
  /** En un escenario: grupos con nombre que se resaltan (halo rojo) y llevan el marcador. */
  focus?: string[]
  /** En un escenario: encuadre propio, en coordenadas del escenario. Si falta, se mira el grupo desde `view`. */
  cam?: { position: Vec3; target: Vec3 }
  /** En un escenario: dónde queda la moto en este tema. */
  bikePose?: { position: Vec3; rotationY: number; pitch?: number; travel?: number }
  /** Con qué clave de la ficha de la moto se buscan las piezas (por defecto, el id del tema). */
  nodesKey?: string
}

export interface Lesson {
  id: string
  /** Número en la pestaña de la barra. */
  number: number
  title: string
  intro: string
  /** Escenario por defecto de la lección; si falta, la moto sola. */
  stage?: string
  items: Item[]
}

/** Fuente de los textos de las lecciones. */
export const GUIDE_NAME = 'Guía de estudio y práctica 2026'

// Ejes del modelo ya orientado: +x hacia delante, +y arriba, +z a la derecha del piloto.

const LESSON_MOTO: Lesson = {
  id: 'moto',
  number: 1,
  title: 'Conoce la motocicleta',
  intro: 'Entiende lo que vas a manejar antes de poner el motor en marcha: sus tipos y sus partes.',
  items: [
    {
      id: 'tipos',
      name: 'Tipos de moto',
      tag: 'Cinco familias',
      where: 'Cada tipo pide precauciones distintas',
      view: [0, 0, 0],
      sections: [
        { label: 'Urbana / commuter', text: 'Ligera y económica; ideal para dominar técnicas básicas, pero sigue siendo vulnerable al viento y al piso mojado.' },
        { label: 'Scooter automática', text: 'Generalmente sin embrague manual; controla muy bien el acelerador y ambas manetas de freno.' },
        { label: 'Semiautomática', text: 'Cambios de marcha sin embrague manual convencional; consulta el patrón y el funcionamiento.' },
        { label: 'Naked / sport / touring / trail', text: 'Varían la geometría, la altura, la potencia, el peso y la posición: familiarízate antes de circular.' },
        { label: 'Eléctrica', text: 'Entrega el par rápidamente, puede ser silenciosa y requiere precauciones específicas con la batería de alta tensión.' },
      ],
      facts: {
        r1: { label: 'La del modelo 3D', text: 'La Yamaha R1 es una moto deportiva (sport).' },
        vespa: { label: 'La del modelo 3D', text: 'Es una scooter Vespa clásica.' },
        fz16: { label: 'La del modelo 3D', text: 'Es una naked (Yamaha FZ 16).' },
      },
    },
    {
      id: 'chasis',
      name: 'Chasis y suspensión',
      tag: 'Estructura',
      where: 'Mantienen la moto en pie y las llantas en el suelo',
      part: 'Suspensión',
      view: [0.6, 0.3, 1.7],
      sections: [
        { label: 'Qué hacen', text: 'Mantienen la estructura y ayudan al contacto de las llantas con el suelo.' },
        { label: 'Qué vigilar', text: 'Unos amortiguadores defectuosos alteran la estabilidad y la frenada.' },
      ],
      facts: {
        r1: { label: 'En el modelo', text: 'Se resaltan la horquilla delantera, el basculante y el amortiguador trasero con su muelle.' },
      },
    },
    {
      id: 'motor',
      name: 'Motor y transmisión',
      tag: 'Fuerza',
      where: 'Generan la fuerza y la llevan a la rueda trasera',
      part: 'Motor',
      view: [0.5, 0.3, 1.3],
      sections: [
        { label: 'Qué hacen', text: 'Generan y transmiten la fuerza. Pueden usar cadena, correa o eje; muchos modelos usan embrague y caja de cambios.' },
      ],
      facts: {
        r1: { label: 'En la R1', text: 'Motor de 998 cc, cuatro cilindros en línea, con transmisión por cadena y caja de 6 velocidades.' },
      },
    },
    {
      id: 'ruedas',
      name: 'Ruedas y llantas',
      tag: 'Contacto con el piso',
      where: 'Son el contacto real con el suelo',
      part: 'Ruedas',
      view: [0.4, 0.3, 1.9],
      sections: [
        { label: 'Qué hacen', text: 'Son el contacto real con el suelo. El estado, el compuesto, la presión y el dibujo afectan la tracción.' },
        { label: 'Qué revisar', text: 'La presión en frío según el manual, el dibujo, los cortes, los clavos y las deformaciones.' },
        { label: 'No salgas si', text: 'Hay pérdida de aire, grietas o el dibujo es insuficiente.' },
      ],
    },
    {
      id: 'frenos',
      name: 'Frenos',
      tag: 'Delantero y trasero',
      where: 'Delantero y trasero, de disco o de tambor',
      part: 'Frenos',
      view: [0.4, 0.3, 1.9],
      sections: [
        { label: 'Qué son', text: 'Delantero y trasero; pueden ser de disco o de tambor. Algunos incorporan ABS (evita el bloqueo) o CBS (reparte la acción de frenado).' },
        { label: 'Qué revisar', text: 'La respuesta de la maneta y del pedal, el nivel y las fugas, los discos y las pastillas.' },
        { label: 'No salgas si', text: 'El freno está esponjoso, hay una fuga o falta eficacia.' },
      ],
      facts: {
        r1: { label: 'En la R1', text: 'Dos discos delanteros de 320 mm y uno trasero de 220 mm, con ABS.' },
      },
    },
    {
      id: 'direccion',
      name: 'Dirección y manillar',
      tag: 'Orientan la moto',
      where: 'La fuerza de giro cambia mucho con la velocidad',
      part: 'Manillar',
      view: [0.8, 0.3, 1.0],
      sections: [
        { label: 'Qué hacen', text: 'Orientan la moto. La fuerza de giro cambia mucho con la velocidad.' },
        { label: 'A poca velocidad', text: 'El equilibrio se logra con la mirada, la postura, una aceleración suave y un control preciso.' },
        { label: 'Al ir más rápido', text: 'Para iniciar un giro se aplica una presión breve sobre el puño del lado hacia el que quieres inclinar (contramanillar).' },
        { label: 'Cuidado', text: 'Esta técnica se practica primero en clases, no de forma brusca ni improvisada en el tráfico.' },
      ],
    },
    {
      id: 'cilindrada',
      name: 'Cilindrada, potencia y peso',
      tag: 'Qué significan',
      where: 'Los números de la ficha técnica',
      view: [0, 0, 0],
      sections: [
        { label: 'Cilindrada (cm³)', text: 'Es el volumen desplazado por el motor térmico; no equivale directamente a potencia.' },
        { label: 'Potencia', text: 'Influye en el desempeño a velocidad.' },
        { label: 'Torque', text: 'Es la fuerza disponible.' },
        { label: 'Peso y altura', text: 'El peso y la altura del asiento afectan la facilidad de control.' },
        { label: 'Para empezar', text: 'Prioriza una moto que puedas sostener y maniobrar con confianza, además de su estado técnico.' },
        { label: 'Licencias', text: 'La categoría A1 es para motos de hasta 125 cm³; la A2, para las de mayor cilindrada.' },
      ],
      facts: {
        r1: { label: 'En la R1', text: '998 cc, unos 199 CV y 203 kg con líquidos y gasolina, según su ficha pública.' },
      },
    },
    {
      id: 'tablero',
      name: 'Tablero y testigos',
      tag: 'Avisos de la moto',
      where: 'Alertan de combustible, temperatura, aceite y ABS',
      part: 'Tablero',
      view: [-0.7, 0.4, 0.55],
      sections: [
        { label: 'Para qué sirve', text: 'El tablero, las luces, la batería y los sensores alertan de combustible, temperatura, aceite, ABS y otros estados.' },
        { label: 'Luz de neutral (N)', text: 'Indica que la caja no tiene una marcha engranada, si el sistema está correcto.' },
        { label: 'Aceite o temperatura', text: 'Si alertan una condición crítica, detén el motor en un lugar seguro y consulta el manual.' },
        { label: 'ABS', text: 'Algunos tableros encienden el testigo en el autochequeo; si permanece encendido de forma anormal, pide un diagnóstico.' },
        { label: 'Otros testigos', text: 'Combustible, batería, motor y direccionales: aprende el significado específico de tu modelo.' },
      ],
    },
  ],
}

const LESSON_MANDOS: Lesson = {
  id: 'mandos',
  number: 2,
  title: 'Mandos y postura',
  intro: 'La coordinación entre manos, pies, mirada y equilibrio es la base de todo lo demás.',
  items: [
    {
      id: 'throttle',
      name: 'Acelerador',
      tag: 'Mano derecha',
      where: 'Puño derecho del manillar',
      part: 'Puño del acelerador',
      gesture: 'throttle',
      view: [-0.55, 0.4, 0.5],
      sections: [
        { label: 'Qué hace', text: 'Girar el puño hacia ti da gas: el motor empuja con más fuerza. Al soltarlo vuelve solo a cero.' },
        { label: 'El gesto', text: 'Gira la muñeca hacia ti, poco a poco.' },
        { label: 'Seguridad', text: 'Agarra con la muñeca baja y recta: así un bache no te hace dar gas sin querer.' },
      ],
      facts: {
        r1: { label: 'En la R1', text: 'Motor de 998 cc, cuatro cilindros en línea, con unos 199 CV según su ficha pública.' },
      },
    },
    {
      id: 'frontBrake',
      name: 'Freno delantero',
      tag: 'Mano derecha',
      where: 'Maneta derecha, delante del puño del acelerador',
      part: 'Maneta de freno',
      gesture: 'frontBrake',
      view: [-0.5, 0.4, 0.45],
      sections: [
        { label: 'Qué hace', text: 'Frena la rueda delantera, que es la que aporta la mayor parte de la frenada.' },
        { label: 'El gesto', text: 'Aprieta la maneta con los dedos, de forma progresiva.' },
        { label: 'Seguridad', text: 'Nunca de golpe: un apretón brusco puede bloquear la rueda delantera y hacerte caer.' },
      ],
      facts: {
        r1: { label: 'En la R1', text: 'Dos discos delanteros de 320 mm, con ABS.' },
      },
    },
    {
      id: 'clutch',
      name: 'Embrague',
      tag: 'Mano izquierda',
      where: 'Maneta izquierda del manillar',
      part: 'Maneta de embrague',
      gesture: 'clutch',
      view: [-0.55, 0.4, -0.5],
      sections: [
        { label: 'Qué hace', text: 'Acopla y desacopla el motor y la transmisión. Se usa para arrancar, parar y cambiar de marcha.' },
        { label: 'El gesto', text: 'Aprieta la maneta hasta el puño y suéltala despacio.' },
        { label: 'Seguridad', text: 'Suéltalo despacio al arrancar: si lo sueltas de golpe, la moto da un tirón o se cala.' },
      ],
      facts: {
        r1: { label: 'En la R1', text: 'Embrague multidisco en baño de aceite, con asistencia y antirrebote.' },
      },
    },
    {
      id: 'shift',
      name: 'Palanca de cambios',
      tag: 'Pie izquierdo',
      where: 'Delante del estribo izquierdo',
      part: 'Palanca de cambios',
      gesture: 'shift',
      view: [0.6, 0.2, -0.95],
      sections: [
        { label: 'Qué hace', text: 'Selecciona las marchas. El patrón común es 1 – N – 2 – 3…: primera hacia abajo, punto muerto y las demás hacia arriba.' },
        { label: 'El gesto', text: 'Pisa con la puntera para bajar de marcha; levanta con el empeine para subir.' },
        { label: 'Seguridad', text: 'Cambia con el embrague apretado y sin mirar al pie: la vista sigue en la carretera.' },
      ],
      facts: {
        r1: { label: 'En la R1', text: 'Caja de 6 velocidades.' },
      },
    },
    {
      id: 'rearBrake',
      name: 'Freno trasero',
      tag: 'Pie derecho',
      where: 'Pedal delante del estribo derecho',
      part: 'Pedal de freno',
      gesture: 'rearBrake',
      view: [0.6, 0.2, 0.95],
      sections: [
        { label: 'Qué hace', text: 'Complementa la frenada y estabiliza la moto a baja velocidad.' },
        { label: 'El gesto', text: 'Pisa el pedal con la puntera del pie derecho.' },
        { label: 'Seguridad', text: 'Úsalo junto con el delantero: él solo alarga mucho la distancia de frenado.' },
      ],
      facts: {
        r1: { label: 'En la R1', text: 'Disco trasero de 220 mm, con ABS.' },
      },
    },
    {
      id: 'luces',
      name: 'Direccionales, pito y luces',
      tag: 'Mando izquierdo',
      where: 'Los interruptores del puño izquierdo',
      part: 'Interruptores',
      view: [-0.5, 0.4, -0.55],
      sections: [
        { label: 'Qué hacen', text: 'Comunican las maniobras y alertan cuando corresponde.' },
        { label: 'Dónde están', text: 'Suelen estar en el mando izquierdo.' },
        { label: 'Ojo', text: 'No todos los modelos distribuyen los controles igual. En muchas scooters, por ejemplo, la maneta izquierda controla el freno trasero y no existe embrague de mano. Revisa el manual antes de conducir una moto distinta.' },
      ],
    },
    {
      id: 'postura',
      name: 'Postura de conducción',
      tag: 'Cómo sentarte',
      where: 'La mirada conduce la trayectoria',
      part: 'Asiento y estriberas',
      view: [0.3, 0.5, 1.8],
      sections: [
        { label: 'Cabeza y mirada', text: 'Cabeza erguida, mirada lejos y hacia la ruta que deseas seguir; evita fijarte en el obstáculo.' },
        { label: 'Brazos', text: 'Relajados y con los codos ligeramente flexionados; sujeta el manillar sin rigidez.' },
        { label: 'Tronco y piernas', text: 'Tronco estable y espalda cómoda; aprieta suavemente el depósito con las piernas en los modelos que lo permitan.' },
        { label: 'Pies', text: 'Sobre los apoyapiés durante la marcha; nunca los arrastres ni dejes los dedos permanentemente sobre los frenos.' },
        { label: 'Espejos', text: 'Ajústalos sentado en tu postura real y comprueba el punto ciego girando la cabeza cuando sea seguro.' },
        { label: 'Evita este error', text: 'Mirar al suelo o a la rueda delantera: pierdes información de la vía y dificulta el equilibrio.' },
      ],
    },
  ],
}

/** Cada tema lleva ya resuelto su escenario: el suyo, el de su lección o la moto sola. */
const withStage = (l: Lesson): Lesson => ({ ...l, items: l.items.map((i) => ({ ...i, stage: i.stage ?? l.stage ?? 'bike' })) })

export const LESSONS: Lesson[] = [
  LESSON_MOTO,
  LESSON_MANDOS,
  LESSON_RUTA,
  LESSON_FISICA,
  LESSON_PROTECCION,
  LESSON_REVISION,
  LESSON_PRACTICA,
  LESSON_MANIOBRAS,
  LESSON_SENALES,
  LESSON_DEFENSIVA,
  LESSON_CONDICIONES,
  LESSON_CARGA,
  LESSON_MANTENIMIENTO,
  LESSON_INCIDENTES,
  LESSON_CONSULTA,
].map(withStage)

/** Todos los temas de todas las lecciones: el modelo 3D se prepara una sola vez para todos. */
export const ALL_ITEMS: Item[] = LESSONS.flatMap((l) => l.items)
