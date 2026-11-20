/**
 * Cola (FIFO): el primero que llega es el primero que sale.
 * No usa shift() (que corre todo el array y es O(n)): guarda el índice del frente
 * y avanza ese índice al desencolar, así sacar un elemento es O(1).
 */
export class Cola<T> {
  #items: T[];
  #inicio = 0;

  constructor(items: readonly T[] = []) {
    this.#items = [...items];
  }

  encolar(elemento: T): void {
    this.#items.push(elemento);
  }

  desencolar(): T | undefined {
    if (this.vacia) {
      return undefined;
    }
    const frente = this.#items[this.#inicio];
    this.#inicio += 1;
    if (this.vacia) {
      this.#items = [];
      this.#inicio = 0;
    }
    return frente;
  }

  frente(): T | undefined {
    return this.vacia ? undefined : this.#items[this.#inicio];
  }

  get tamanio(): number {
    return this.#items.length - this.#inicio;
  }

  get vacia(): boolean {
    return this.tamanio === 0;
  }

  /** Copia de los elementos, del frente al final. */
  aArray(): T[] {
    return this.#items.slice(this.#inicio);
  }
}
