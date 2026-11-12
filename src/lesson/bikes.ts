/** Fichas de las motos que se pueden elegir. Cada una es un modelo 3D de Sketchfab con licencia CC BY. */

export interface Credit {
  title: string
  author: string
  url: string
  license: string
  licenseUrl: string
}

export interface BikeSpec {
  id: string
  /** Nombre completo para el selector y la barra inferior. */
  name: string
  /** Tipo según la guía, para el selector. */
  kind: string
  url: string
  /** Largo real aproximado, en metros: el modelo se escala a esta medida. */
  length: number
  /** Nodos de la rueda delantera y la trasera, si el modelo las trae con nombre: fijan hacia dónde mira. */
  wheels?: [string, string]
  /** Es una fotogrametría con un trozo de suelo: la moto se separa por geometría (lo que sobresale del suelo) y se recorta lo demás. */
  scan?: boolean
  /** Aleja (>1) o acerca (<1) la cámara de la vista general, para modelos que se miden de otra forma. */
  viewScale?: number
  /** Sin ruedas con nombre, el modelo se orienta por su eje más largo; true lo gira media vuelta. */
  flip?: boolean
  /** Materiales de piezas que sobran en el modelo (un suelo, por ejemplo). */
  hideMaterials?: string[]
  /** Nodos que sobran en el modelo (una caja de estudio, por ejemplo). */
  hideNodes?: string[]
  /**
   * Qué se resalta en cada tema: nombres de nodo del modelo o «mat:Nombre» para todas las mallas de un material.
   * Un tema que no aparece aquí no tiene pieza que señalar en esta moto.
   */
  nodes: Record<string, string[]>
  /** El modelo trae los mandos como piezas separadas y se pueden animar. */
  gestures: boolean
  credit: Credit
}

const LICENSE = { license: 'CC BY 4.0', licenseUrl: 'https://creativecommons.org/licenses/by/4.0/' }

export const BIKES: BikeSpec[] = [
  {
    id: 'r1',
    name: 'Yamaha R1 2020',
    kind: 'Superdeportiva',
    url: '/models/yamaha_r1.glb',
    length: 2.055,
    wheels: ['Yam_R1_Front_Wheel', 'Yam_R1_Rear_Wheel'],
    gestures: true,
    nodes: {
      chasis: ['Yam_R1_Front_Fender_Forks_0', 'Yam_R1_Rear_Swingarm', 'Yam_R1_Shock_Strut', 'Yam_R1_Spring'],
      motor: ['Yam_R1_Frame_&_Engine', 'Yam_R1_Chain'],
      ruedas: ['Yam_R1_Front_Wheel', 'Yam_R1_Rear_Wheel'],
      frenos: [
        'Yam_R1_Front_Wheel_Brake_Discs_0',
        'Yam_R1_Rear_Wheel_Brake_Discs_0',
        'Yam_R1_Front_Brake_Actuator',
        'Yam_R1_Rear_Brake_Actuator',
      ],
      direccion: ['Yam_R1_Front_Forks_and_Handle_Bars'],
      tablero: ['Yam_R1_Front_End_&_Dash_Display_0', 'Yam_R1_Headlights'],
      throttle: ['Yam_R1_Throttle'],
      frontBrake: ['Yam_R1_Front_Brake_Lever'],
      clutch: ['Yam_R1_Clutch_Lever'],
      shift: ['Yam_R1_Gear_Lever'],
      rearBrake: ['Yam_R1_Brake_Lever'],
      luces: ['Yam_R1_Indicator_Switch', 'Yam_R1_Horn_Switch', 'Yam_R1_Lights_Switches', 'Yam_R1_Highbeam_Flasher'],
      postura: ['Yam_R1_Body_Seats_0', 'Yam_R1_Left_Rider_Footpeg', 'Yam_R1_Right_Rider_Footpeg'],
    },
    credit: {
      title: 'Yamaha R1',
      author: 'ejsnowy',
      url: 'https://sketchfab.com/3d-models/yamaha-r1-7b3343ad0c0f4cbe94238c734e1b731a',
      ...LICENSE,
    },
  },
  {
    id: 'vespa',
    name: 'Vespa clásica',
    kind: 'Scooter',
    url: '/models/vespa.glb',
    length: 1.75,
    wheels: ['Front_Wheel_all_low', 'Back_Wheel_all_low'],
    gestures: false,
    nodes: {
      chasis: ['Hydrolics_Area_Front_low', 'Hydrolics_low'],
      motor: ['Motor_Area_low'],
      ruedas: ['Front_Wheel_all_low', 'Back_Wheel_all_low'],
      direccion: ['Handle_Bars_low'],
      tablero: ['Speedomter_low', 'Front_Light_low'],
      luces: ['Switch_box_low'],
      postura: ['Seat_low', 'Foot_Rest_low'],
    },
    credit: {
      title: 'Worn Out Old School Vespa',
      author: 'Jakob_Forseth',
      url: 'https://sketchfab.com/3d-models/worn-out-old-school-vespa-358a77040c53419b9bb50c462a160e6f',
      ...LICENSE,
    },
  },
  {
    id: 'naked125',
    name: 'Naked 125 cc',
    kind: 'Naked · categoría A1',
    url: '/models/naked125.glb',
    length: 2.0,
    hideMaterials: ['ground'],
    gestures: false,
    nodes: {},
    credit: {
      title: '125cc Naked Motorcycle',
      author: 'Peter Tilley',
      url: 'https://sketchfab.com/3d-models/125cc-naked-motorcycle-c8c2a4c00c464c99969b1fc7503b14d2',
      ...LICENSE,
    },
  },
  {
    id: 'fz16',
    name: 'Yamaha FZ 16',
    kind: 'Naked',
    url: '/models/fz16.glb',
    length: 2.0,
    hideNodes: ['Cube'],
    gestures: false,
    nodes: {
      motor: ['mat:EngineMetal', 'mat:CastIronBlack'],
      ruedas: ['mat:Rubber'],
    },
    credit: {
      title: 'Yamaha Motorcycle Fz 16',
      author: 'Javier.Herrera',
      url: 'https://sketchfab.com/3d-models/yamaha-motorcycle-fz-16-c522b1bae9c2425db12d435ecb5e8783',
      ...LICENSE,
    },
  },
  {
    id: 'ninja650',
    name: 'Kawasaki Ninja 650',
    kind: 'Sport',
    url: '/models/ninja650.glb',
    length: 2.055,
    scan: true,
    viewScale: 1.4,
    gestures: false,
    nodes: {},
    credit: {
      title: 'Kawasaki Ninja 650',
      author: 'alban',
      url: 'https://sketchfab.com/3d-models/kawasaki-ninja-650-a0fcb1b23e6948639a09d804939f7c70',
      ...LICENSE,
    },
  },
]

export const DEFAULT_BIKE = BIKES[0]
