// ============================================================
// PESTAÑAS & CEJAS — CONFIGURACIÓN DEL NEGOCIO (repo oficial)
// ============================================================
// Sale de la plantilla de landing de Gothan: todo lo del negocio
// vive en este archivo y el resto del código no se toca.
//
// PRECIOS: se guardan SOLO en USD (precioUSD), tal como los pasó
// la dueña en su lista oficial del 2026-10-29
// (docs/precios-oficiales-2026-10-29.jpg: «Pago en CUP al cambio»).
// La página los muestra en CUP convirtiendo con la tasa USD/CUP
// de elTOQUE del día (ver src/lib/tasa.ts). Así, si el CUP se
// mueve, NO hay que tocar esta lista: se mueve sola.
//
// WhatsApp oficial (de esa misma lista): 63 28 72 39 → con el 53
// de Cuba delante: 5363287239.
// ============================================================

/** Un precio fijo (3) o un rango según el caso (retoque: [0.9, 2]). */
export type PrecioUSD = number | [number, number];

export const negocio = {
  nombre: "Pestañas & Cejas",
  rubro: "Cejas y pestañas",
  slogan: "Cejas y pestañas hechas con calma, a tu medida",
  descripcion:
    "Servicios de cejas y pestañas con cita previa. Eliges el servicio, escribes por WhatsApp y te confirmamos el turno en el mismo chat. Pago en CUP, al cambio del día.",

  heroTitulo: {
    antes: "La mirada",
    italica: "también",
    despues: "se diseña",
  },
  notaHero: "citas disponibles · pago en CUP al cambio del día",

  // Contacto oficial
  whatsapp: "5363287239", // solo dígitos, con código de país (53 + 63287239)
  zona: "Por confirmar",
  horario: "Citas disponibles · escríbenos por WhatsApp",

  tema: {
    colores: {
      papel: "#faf6ff", // fondo lavanda muy claro
      crema: "#efe6fa", // bloques suaves morados
      tinta: "#2e0a4e", // morado profundo (texto y bloques oscuros)
      acento: "#8a1c7c", // magenta/morado de su lista de precios
      dorado: "#b9862f", // dorado (cifras y detalles, tono realeza)
      linea: "#dccdf0", // reglas y bordes
    },
    fuente: "editorial" as const,
    animacion: "editorial" as const,
  },

  // Fotos de AMBIENTE (public/fondos/): ilustran el tipo de servicio,
  // NUNCA se presentan como trabajos del negocio. Los trabajos reales
  // van solo en la galería (public/fotos/).
  fondos: {
    hero: "/fondos/hero.jpg",
    detalle: "/fondos/cejas.jpg",
  },

  cinta: ["Pestañas de punto", "Cejas 4K", "Laminado", "Tinte", "Retoque", "Cita previa", "Pago en CUP al cambio"],

  // Moneda y conversión automática USD → CUP
  moneda: {
    // Tasa de respaldo: solo se usa si la API de elTOQUE no responde
    // o si todavía no hay token configurado (ver .env.example).
    // Valor de referencia elTOQUE del 2026-10-29: 1 USD = 860 CUP.
    tasaFallbackUSD: 860,
    tasaFallbackFecha: "29 de octubre de 2026",
    // Los CUP se redondean a la decena más cercana (774 → 770):
    // nadie cobra 774 pesos exactos y el precio se ve limpio.
    redondeoCUP: 10,
    notaPago: "Pago en CUP al cambio del día (tasa de referencia de elTOQUE).",
  },

  // Servicios OFICIALES, en USD. Duración: la dueña aún no la pasa,
  // por eso va en "" y la página lo marca «por confirmar».
  servicios: [
    {
      id: "desmaquillar",
      nombre: "Desmaquillar",
      descripcion: "Retirada del maquillaje antes del servicio, para trabajar sobre la zona limpia.",
      precioUSD: 0.5 as PrecioUSD,
      duracion: "",
    },
    {
      id: "pestanas-de-punto",
      nombre: "Pestañas de punto",
      descripcion: "Aplicación de pestañas de punto, un resultado bonito sin cargar la mirada.",
      precioUSD: 3 as PrecioUSD,
      duracion: "",
    },
    {
      id: "retoque",
      nombre: "Retoque de pestañas",
      descripcion: "Retoque para mantenerlas completas y parejas. El precio varía según el estado (0.90–2 USD).",
      precioUSD: [0.9, 2] as PrecioUSD,
      duracion: "",
    },
    {
      id: "retiro",
      nombre: "Retiro de pestañas",
      descripcion: "Retirada de las pestañas con cuidado, sin maltratar las tuyas.",
      precioUSD: 0.7 as PrecioUSD,
      duracion: "",
    },
    {
      id: "depilacion-cejas",
      nombre: "Depilación de cejas",
      descripcion: "Limpieza y forma de la ceja para que se vea definida y natural.",
      precioUSD: 0.9 as PrecioUSD,
      duracion: "",
    },
    {
      id: "tinte",
      nombre: "Tinte de cejas",
      descripcion: "Tinte para dar color y presencia a la ceja.",
      precioUSD: 0.7 as PrecioUSD,
      duracion: "",
    },
    {
      id: "laminado",
      nombre: "Laminado de cejas",
      descripcion: "Laminado para que la ceja se vea peinada, llena y en su sitio.",
      precioUSD: 2 as PrecioUSD,
      duracion: "",
    },
    {
      id: "cejas-4k",
      nombre: "Cejas 4K",
      descripcion: "El trabajo completo de cejas, con acabado definido de alta precisión.",
      precioUSD: 3 as PrecioUSD,
      duracion: "",
    },
  ],

  pasos: [
    {
      titulo: "Elige el servicio",
      texto: "Toca «Reservar» en el servicio que quieres y bajas directo al formulario con ese servicio ya elegido.",
    },
    {
      titulo: "Escribe por WhatsApp",
      texto: "El formulario arma el mensaje por ti: servicio, día y hora. Solo tienes que darle enviar al 63 28 72 39.",
    },
    {
      titulo: "Te confirman el turno",
      texto: "Te respondemos en el mismo chat y dejamos la cita cerrada. Sin cuentas ni contraseñas.",
    },
  ],

  frase: "Un turno a la vez, sin correr. Así se hace un trabajo que dura.",
  fraseAutor: "La forma de trabajar del estudio",

  galeria: [
    { src: "", alt: "Trabajo de cejas", pie: "Diseño de cejas", formato: "vertical" as const },
    { src: "", alt: "Trabajo de pestañas", pie: "Pestañas de punto", formato: "horizontal" as const },
    { src: "", alt: "Combo de cejas y pestañas", pie: "Combo completo", formato: "vertical" as const },
    { src: "", alt: "Detalle de un trabajo", pie: "Detalle", formato: "horizontal" as const },
  ],

  retoques: [
    { servicio: "Pestañas", cada: "15–20 días" },
    { servicio: "Cejas", cada: "≈ 1 mes" },
  ],

  redes: {
    instagram: "",
    facebook: "",
  },

  secciones: {
    hero: true,
    cinta: true,
    servicios: true,
    galeria: true,
    comoReservar: true,
    frase: true,
    reservar: true,
    retoques: true,
  },
};

export type Negocio = typeof negocio;
export type Servicio = (typeof negocio.servicios)[number];
