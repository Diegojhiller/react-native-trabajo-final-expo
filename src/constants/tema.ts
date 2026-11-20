/** Colores, tamaños y espaciados de toda la app. Ninguna pantalla usa valores sueltos. */
export const colores = {
  primario: '#1E3A8A',
  primarioSuave: '#DBEAFE',
  sobrePrimario: '#FFFFFF',
  fondo: '#F5F7FB',
  superficie: '#FFFFFF',
  texto: '#0F172A',
  textoSecundario: '#475569',
  borde: '#E2E8F0',
  exito: '#047857',
  exitoSuave: '#D1FAE5',
  alerta: '#92400E',
  alertaSuave: '#FEF3C7',
  peligro: '#B91C1C',
  peligroSuave: '#FEE2E2',
  camara: '#000000',
  interruptorApagado: '#CBD5E1',
} as const;

export const espacios = {
  xs: 4,
  s: 8,
  m: 12,
  l: 16,
  xl: 24,
  xxl: 32,
} as const;

export const tamanos = {
  textoChico: 13,
  texto: 15,
  textoGrande: 17,
  subtitulo: 13,
  titulo: 22,
  tituloGrande: 26,
  icono: 22,
  iconoGrande: 48,
  /** Área táctil mínima recomendada (44 × 44). */
  toqueMinimo: 44,
  alturaCamara: 320,
  anchoReciente: 140,
  borde: 1,
  bordeGrueso: 2,
} as const;

export const radios = {
  s: 8,
  m: 12,
  l: 16,
} as const;

export const pesos = {
  normal: '400',
  semi: '600',
  negrita: '700',
  extra: '800',
} as const;
