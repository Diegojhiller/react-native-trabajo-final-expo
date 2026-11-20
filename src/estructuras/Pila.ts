/**
 * Pila (LIFO): el último elemento que entra es el primero que sale.
 * Se trabaja solo por el tope.
 */
export class Pila<T> {
  #items: T[];

  constructor(items: readonly T[] = []) {
    this.#items = [...items];
  }

  push(elemento: T): void {
    this.#items.push(elemento);
  }

  pop(): T | undefined {
    return this.#items.pop();
  }

  tope(): T | undefined {
    return this.#items.at(-1);
  }

  get tamanio(): number {
    return this.#items.length;
  }

  get vacia(): boolean {
    return this.#items.length === 0;
  }

  /** Copia de los elementos, de la base al tope. */
  aArray(): T[] {
    return [...this.#items];
  }
}
