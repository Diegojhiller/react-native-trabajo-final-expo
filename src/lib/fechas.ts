const MS_POR_DIA = 24 * 60 * 60 * 1000;

export function sumarDias(desde: number, dias: number): number {
  return desde + dias * MS_POR_DIA;
}

/** Ejemplo: "27 de noviembre". */
export function formatearFecha(ms: number): string {
  return new Date(ms).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' });
}
