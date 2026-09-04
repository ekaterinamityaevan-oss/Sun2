export interface CelestialBody {
  id: string;
  name: string;
  kindLabel: string;
  kindShort: string;
  orderLabel: string;
  /** [светлая сторона, базовый тон, тень] — для сферической shading-модели на канвасе */
  colors: [string, string, string];
  diameterKm: number;
  periodDays: number;
  orbitFrac: number;
  radiusPx: number;
  startAngle: number;
  hasRings?: boolean;
  hasMoon?: boolean;
  stats: {
    diameter: string;
    distance: string;
    distanceAu: string;
    period: string;
    periodNote?: string;
    rotation: string;
    moons: string;
  };
  fact: string;
}

export const EARTH_DIAMETER_KM = 12742;
export const JUPITER_RATIO = 10.97;

export const SUN: CelestialBody = {
  id: "sun",
  name: "Солнце",
  kindLabel: "Жёлтый карлик · звезда класса G2V",
  kindShort: "Звезда",
  orderLabel: "Центр системы",
  colors: ["#fff6d8", "#ffc84d", "#f07f16"],
  diameterKm: 1392700,
  periodDays: 0,
  orbitFrac: 0,
  radiusPx: 26,
  startAngle: 0,
  stats: {
    diameter: "1 392 700 км",
    distance: "—",
    distanceAu: "центр системы",
    period: "225–250 млн лет",
    periodNote: "вокруг центра Галактики",
    rotation: "25–35 сут",
    moons: "8 планет",
  },
  fact: "Солнце содержит 99,86 % всей массы Солнечной системы. Внутри него поместилось бы около 1,3 миллиона планет размером с Землю.",
};

export const PLANETS: CelestialBody[] = [
  {
    id: "mercury",
    name: "Меркурий",
    kindLabel: "Каменистая планета",
    kindShort: "Каменистая",
    orderLabel: "1-я планета от Солнца",
    colors: ["#d8c8b8", "#a8968a", "#5f544b"],
    diameterKm: 4879,
    periodDays: 87.97,
    orbitFrac: 0.16,
    radiusPx: 3.7,
    startAngle: 0.9,
    stats: {
      diameter: "4 879 км",
      distance: "57,9 млн км",
      distanceAu: "0,39 а.е.",
      period: "88 сут",
      rotation: "58,6 сут",
      moons: "0",
    },
    fact: "Солнечные сутки на Меркурии длятся 176 земных суток — вдвое дольше местного года: планета вращается вокруг оси очень медленно.",
  },
  {
    id: "venus",
    name: "Венера",
    kindLabel: "Каменистая планета",
    kindShort: "Каменистая",
    orderLabel: "2-я планета от Солнца",
    colors: ["#ffe9c4", "#e8c07a", "#a5793e"],
    diameterKm: 12104,
    periodDays: 224.7,
    orbitFrac: 0.23,
    radiusPx: 6,
    startAngle: 2.3,
    stats: {
      diameter: "12 104 км",
      distance: "108,2 млн км",
      distanceAu: "0,72 а.е.",
      period: "224,7 сут",
      rotation: "243 сут · ретроградное",
      moons: "0",
    },
    fact: "Самая горячая планета: +465 °C из-за парникового эффекта плотной атмосферы. Венера вращается в обратную сторону — Солнце здесь восходит на западе.",
  },
  {
    id: "earth",
    name: "Земля",
    kindLabel: "Каменистая планета",
    kindShort: "Каменистая",
    orderLabel: "3-я планета от Солнца",
    colors: ["#bfe3ff", "#4f94e0", "#173d75"],
    diameterKm: 12742,
    periodDays: 365.25,
    orbitFrac: 0.3,
    radiusPx: 6.5,
    startAngle: 3.7,
    hasMoon: true,
    stats: {
      diameter: "12 742 км",
      distance: "149,6 млн км",
      distanceAu: "1,00 а.е.",
      period: "365,2 сут",
      rotation: "23,9 ч",
      moons: "1",
    },
    fact: "Единственное известное место во Вселенной, где есть жизнь. Океаны покрывают 71 % поверхности планеты.",
  },
  {
    id: "mars",
    name: "Марс",
    kindLabel: "Каменистая планета",
    kindShort: "Каменистая",
    orderLabel: "4-я планета от Солнца",
    colors: ["#ffb08a", "#d1603d", "#7c2f1c"],
    diameterKm: 6779,
    periodDays: 686.98,
    orbitFrac: 0.37,
    radiusPx: 4.7,
    startAngle: 5.2,
    stats: {
      diameter: "6 779 км",
      distance: "227,9 млн км",
      distanceAu: "1,52 а.е.",
      period: "687 сут",
      rotation: "24,6 ч",
      moons: "2",
    },
    fact: "Здесь находится Олимп — самый высокий вулкан Солнечной системы (21,9 км). Сейчас Марс исследуют сразу несколько работающих роверов.",
  },
  {
    id: "jupiter",
    name: "Юпитер",
    kindLabel: "Газовый гигант",
    kindShort: "Газовый гигант",
    orderLabel: "5-я планета от Солнца",
    colors: ["#f5dcae", "#d9a066", "#8d5a2b"],
    diameterKm: 139820,
    periodDays: 4332.6,
    orbitFrac: 0.52,
    radiusPx: 15,
    startAngle: 0.5,
    stats: {
      diameter: "139 820 км",
      distance: "778,5 млн км",
      distanceAu: "5,20 а.е.",
      period: "11,9 года",
      rotation: "9,9 ч",
      moons: "95",
    },
    fact: "Большое Красное Пятно — ураган размером больше Земли — бушует в атмосфере Юпитера уже более 350 лет.",
  },
  {
    id: "saturn",
    name: "Сатурн",
    kindLabel: "Газовый гигант",
    kindShort: "Газовый гигант",
    orderLabel: "6-я планета от Солнца",
    colors: ["#f7e3b8", "#e3c584", "#99794a"],
    diameterKm: 116460,
    periodDays: 10759,
    orbitFrac: 0.66,
    radiusPx: 12.6,
    startAngle: 2.0,
    hasRings: true,
    stats: {
      diameter: "116 460 км",
      distance: "1 434 млн км",
      distanceAu: "9,58 а.е.",
      period: "29,5 года",
      rotation: "10,7 ч",
      moons: "146",
    },
    fact: "Средняя плотность Сатурна ниже плотности воды — теоретически он мог бы плавать. Кольца состоят из миллиардов ледяных и каменных обломков.",
  },
  {
    id: "uranus",
    name: "Уран",
    kindLabel: "Ледяной гигант",
    kindShort: "Ледяной гигант",
    orderLabel: "7-я планета от Солнца",
    colors: ["#dcf6f6", "#8fd6dc", "#437f8c"],
    diameterKm: 50724,
    periodDays: 30688,
    orbitFrac: 0.8,
    radiusPx: 9,
    startAngle: 4.4,
    stats: {
      diameter: "50 724 км",
      distance: "2 871 млн км",
      distanceAu: "19,2 а.е.",
      period: "84 года",
      rotation: "17,2 ч",
      moons: "28",
    },
    fact: "Планета вращается «лёжа на боку» — наклон оси составляет 98°. Уран — первая планета, открытая в Новое время (Уильям Гершель, 1781 год).",
  },
  {
    id: "neptune",
    name: "Нептун",
    kindLabel: "Ледяной гигант",
    kindShort: "Ледяной гигант",
    orderLabel: "8-я планета от Солнца",
    colors: ["#a8c4ff", "#4a6fd4", "#22357c"],
    diameterKm: 49244,
    periodDays: 60182,
    orbitFrac: 0.93,
    radiusPx: 8.6,
    startAngle: 5.9,
    stats: {
      diameter: "49 244 км",
      distance: "4 495 млн км",
      distanceAu: "30,1 а.е.",
      period: "164,8 года",
      rotation: "16,1 ч",
      moons: "16",
    },
    fact: "Самые быстрые ветры Солнечной системы — до 2 100 км/ч. Нептун открыли «на кончике пера»: сначала вычислили на бумаге, затем увидели в телескоп.",
  },
];

export const ALL_BODIES: CelestialBody[] = [SUN, ...PLANETS];

export function formatSimDays(d: number): string {
  if (d < 365) return `${d.toLocaleString("ru-RU")} сут`;
  const y = Math.floor(d / 365.25);
  const rest = Math.floor(d - y * 365.25);
  return `${y.toLocaleString("ru-RU")} г ${rest} сут`;
}
