import type Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

import type { Recurso } from '@/types';

type TextosPermiso = {
  titulo: string;
  beneficio: string;
  bloqueado: string;
  icono: ComponentProps<typeof Ionicons>['name'];
};

/** Textos de la pantalla previa a cada permiso. */
export const TEXTOS_PERMISO: Record<Recurso, TextosPermiso> = {
  camara: {
    titulo: 'Escaneá el código del libro',
    beneficio: 'Usamos la cámara para leer el código de barras de la contratapa y abrir el libro al instante.',
    bloqueado:
      'La cámara está desactivada para esta app. Podés activarla en Ajustes o escribir el ISBN a mano.',
    icono: 'camera',
  },
  notificaciones: {
    titulo: 'Recordatorio de devolución',
    beneficio: 'Te mandamos un aviso antes de que venza tu préstamo, para que no te olvides de devolverlo.',
    bloqueado:
      'Las notificaciones están desactivadas para esta app. Podés activarlas en Ajustes; mientras tanto, los avisos aparecen en Mis reservas.',
    icono: 'notifications',
  },
};

export const RECURSOS: readonly Recurso[] = ['camara', 'notificaciones'];
