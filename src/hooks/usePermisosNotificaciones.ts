import { createPermissionHook } from 'expo';

import { obtenerPermisoNotificaciones, pedirPermisoNotificaciones } from '@/lib/notificaciones';

/**
 * Hook de permisos de notificaciones con la misma forma que useCameraPermissions:
 * [respuesta, pedir, consultar]. Pedir crea antes el canal "prestamos" en Android.
 */
export const usePermisosNotificaciones = createPermissionHook({
  getMethod: obtenerPermisoNotificaciones,
  requestMethod: pedirPermisoNotificaciones,
});
