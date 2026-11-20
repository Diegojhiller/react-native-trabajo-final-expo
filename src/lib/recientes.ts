import type { Pila } from '@/estructuras/Pila';

/**
 * Devuelve hasta `cantidad` ISBN desde el tope de la pila (del más reciente al más antiguo).
 * La pila puede repetir un libro más abajo (solo se evita repetir el tope), por eso se
 * saltean los repetidos: así cada ISBN aparece una vez y sirve como key estable.
 */
export function recientesDesdeElTope(pila: Pila<string>, cantidad: number): string[] {
  const resultado: string[] = [];
  const desdeElTope = pila.aArray().reverse();
  for (const isbn of desdeElTope) {
    if (resultado.length === cantidad) {
      break;
    }
    if (!resultado.includes(isbn)) {
      resultado.push(isbn);
    }
  }
  return resultado;
}
