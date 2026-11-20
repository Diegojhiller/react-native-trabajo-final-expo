import type { Libro } from '../types';

/**
 * Catálogo de la biblioteca. Los ISBN de ejemplo son EAN-13 válidos (con dígito verificador).
 * Los dos últimos libros son ejemplares reales para probar el escáner con la cámara.
 */
export const LIBROS: Libro[] = [
  { isbn: '9789871000012', titulo: 'Ficciones', autor: 'Jorge Luis Borges', anio: 1944, ejemplares: 2 },
  { isbn: '9789871000029', titulo: 'El Aleph', autor: 'Jorge Luis Borges', anio: 1949, ejemplares: 0 },
  { isbn: '9789871000036', titulo: 'El libro de arena', autor: 'Jorge Luis Borges', anio: 1975, ejemplares: 1 },
  { isbn: '9789871000043', titulo: 'Rayuela', autor: 'Julio Cortázar', anio: 1963, ejemplares: 3 },
  { isbn: '9789871000050', titulo: 'Bestiario', autor: 'Julio Cortázar', anio: 1951, ejemplares: 1 },
  { isbn: '9789871000067', titulo: 'Cien años de soledad', autor: 'Gabriel García Márquez', anio: 1967, ejemplares: 0 },
  { isbn: '9789871000074', titulo: 'El túnel', autor: 'Ernesto Sabato', anio: 1948, ejemplares: 2 },
  { isbn: '9789871000081', titulo: 'Martín Fierro', autor: 'José Hernández', anio: 1872, ejemplares: 4 },
  { isbn: '9789871000098', titulo: 'Don Segundo Sombra', autor: 'Ricardo Güiraldes', anio: 1926, ejemplares: 1 },
  { isbn: '9789871000104', titulo: 'Pedro Páramo', autor: 'Juan Rulfo', anio: 1955, ejemplares: 0 },
  { isbn: '9789871000111', titulo: 'La ciudad y los perros', autor: 'Mario Vargas Llosa', anio: 1963, ejemplares: 2 },
  { isbn: '9789871000128', titulo: 'Facundo', autor: 'Domingo F. Sarmiento', anio: 1845, ejemplares: 1 },
  { isbn: '9789871000135', titulo: 'Cuentos de la selva', autor: 'Horacio Quiroga', anio: 1918, ejemplares: 3 },
  { isbn: '9789871000142', titulo: 'El principito', autor: 'Antoine de Saint-Exupéry', anio: 1943, ejemplares: 0 },
  { isbn: '9789871000159', titulo: 'Código limpio', autor: 'Robert C. Martin', anio: 2008, ejemplares: 1 },
  { isbn: '9789871000166', titulo: 'Libro real 1 (a reemplazar)', autor: 'Autor a completar', anio: 2020, ejemplares: 1 },
  { isbn: '9789871000173', titulo: 'Libro real 2 (a reemplazar)', autor: 'Autor a completar', anio: 2020, ejemplares: 0 },
];

/** Personas que ya esperaban al iniciar la app, en orden de llegada (ISBN → nombres). */
export const ESPERAS_INICIALES: Record<string, string[]> = {
  '9789871000029': ['Ana', 'Bruno'],
  '9789871000067': ['Carla'],
  '9789871000142': ['Diego', 'Eva'],
};
