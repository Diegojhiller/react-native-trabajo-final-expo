import { LARGO_ISBN } from '@/constants/biblioteca';

const SOLO_DIGITOS = new RegExp(`^\\d{${LARGO_ISBN}}$`);

/** true si el texto tiene exactamente 13 dígitos (formato EAN-13 de la contratapa). */
export function esIsbnValido(texto: string | undefined): texto is string {
  return texto !== undefined && SOLO_DIGITOS.test(texto);
}

/** Quita guiones y espacios de un ISBN escrito a mano. */
export function limpiarIsbn(texto: string): string {
  return texto.replace(/[\s-]/g, '');
}
