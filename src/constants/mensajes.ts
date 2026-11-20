/** Mensajes para la persona usuaria. Nunca se muestra el texto crudo de un error técnico. */
export const MENSAJES = {
  errorCatalogo: 'No pudimos cargar el catálogo. Revisá tu conexión e intentá de nuevo.',
  errorBusqueda: 'No pudimos completar la búsqueda. Intentá de nuevo.',
  catalogoVacio: 'Todavía no hay libros en el catálogo.',
  isbnInvalido: 'El ISBN tiene que tener 13 números, sin guiones ni espacios.',
  loginIncorrecto: 'El usuario o la clave no son correctos. Revisalos e intentá de nuevo.',
  sinPermisoNotificaciones:
    'Las notificaciones están desactivadas: los avisos de la biblioteca van a aparecer acá.',
} as const;
