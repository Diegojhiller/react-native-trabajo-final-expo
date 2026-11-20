import type { PermissionResponse } from 'expo';

import { RECURSOS } from '@/constants/permisos';
import type { EstadoPermiso, Recurso } from '@/types';

/**
 * Traduce la respuesta de Expo a los cuatro estados de la app.
 * `status` solo no alcanza: "denied" puede ser "se puede volver a pedir" o "bloqueado";
 * lo que los distingue es `canAskAgain`.
 */
export function estadoDePermiso(respuesta: PermissionResponse | null): EstadoPermiso {
  if (respuesta === null) {
    return 'cargando';
  }
  if (respuesta.granted) {
    return 'concedido';
  }
  return respuesta.canAskAgain ? 'preguntable' : 'bloqueado';
}

export function esRecurso(valor: string | undefined): valor is Recurso {
  return RECURSOS.some((recurso) => recurso === valor);
}
