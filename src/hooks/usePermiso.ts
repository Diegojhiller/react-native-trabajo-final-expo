import type { PermissionResponse } from 'expo';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

import { useAlVolverAlFrente } from '@/hooks/useAlVolverAlFrente';
import { estadoDePermiso } from '@/lib/permisos';
import type { EstadoPermiso } from '@/types';

/** Lo que devuelven los hooks de permisos de Expo: [respuesta, pedir, consultar]. */
type HookDePermiso<P extends PermissionResponse> = [P | null, () => Promise<P>, () => Promise<P>];

type Permiso<P extends PermissionResponse> = {
  estado: EstadoPermiso;
  pedir: () => Promise<P>;
};

/**
 * Convierte un hook de permisos de Expo en los cuatro estados de la app
 * (cargando → concedido → preguntable → bloqueado) y lo mantiene al día:
 *  - al volver al primer plano (AppState), por ejemplo después de pasar por Ajustes;
 *  - al recuperar el foco (useFocusEffect), por ejemplo al cerrar el modal /permisos.
 */
export function usePermiso<P extends PermissionResponse>([
  respuesta,
  pedir,
  consultar,
]: HookDePermiso<P>): Permiso<P> {
  const revisar = useCallback(() => {
    consultar();
  }, [consultar]);

  useAlVolverAlFrente(revisar);
  useFocusEffect(revisar);

  return { estado: estadoDePermiso(respuesta), pedir };
}
