import { ESPERAS_INICIALES, LIBROS } from '@/data/libros';
import { Cola } from '@/estructuras/Cola';
import type { Libro } from '@/types';

/**
 * Único punto de acceso síncrono a los datos del catálogo
 * (detalle, reserva, escáner, mostrador). Si el catálogo pasara a una API real,
 * este archivo y src/lib/api.ts son los que cambian.
 */
export function obtenerLibroPorIsbn(isbn: string): Libro | undefined {
  return LIBROS.find((libro) => libro.isbn === isbn);
}

/** Arma una Cola por cada libro que ya tenía lista de espera al iniciar la app. */
export function crearEsperasIniciales(): Record<string, Cola<string>> {
  const esperas: Record<string, Cola<string>> = {};
  for (const [isbn, personas] of Object.entries(ESPERAS_INICIALES)) {
    esperas[isbn] = new Cola(personas);
  }
  return esperas;
}
