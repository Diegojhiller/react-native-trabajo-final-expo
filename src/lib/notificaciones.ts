import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { CANAL_PRESTAMOS, SEGUNDOS_RECORDATORIO } from '@/constants/biblioteca';

/** Muestra las notificaciones también con la app abierta. Se llama una vez al iniciar. */
export function configurarNotificaciones(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

/** En Android 13+ el diálogo del permiso no aparece si no existe al menos un canal. */
async function crearCanalPrestamos(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CANAL_PRESTAMOS, {
      name: 'Préstamos',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

export function obtenerPermisoNotificaciones() {
  return Notifications.getPermissionsAsync();
}

export async function pedirPermisoNotificaciones() {
  await crearCanalPrestamos();
  return Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: true, allowSound: true },
  });
}

/** Consulta el permiso en este momento (no usa un valor guardado: pudo cambiar en Ajustes). */
export async function notificacionesPermitidas(): Promise<boolean> {
  const permiso = await Notifications.getPermissionsAsync();
  return permiso.granted;
}

/** Programa el recordatorio de devolución y devuelve su identificador para poder cancelarlo. */
export async function programarRecordatorio(titulo: string): Promise<string> {
  await crearCanalPrestamos();
  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Devolvé tu libro',
      body: `Se acerca la fecha de devolución de "${titulo}".`,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: SEGUNDOS_RECORDATORIO,
      channelId: CANAL_PRESTAMOS,
    },
  });
}

export function cancelarRecordatorio(id: string): Promise<void> {
  return Notifications.cancelScheduledNotificationAsync(id);
}

/** Aviso inmediato cuando el mostrador te entrega un libro que esperabas. */
export async function avisarEntrega(titulo: string): Promise<void> {
  await crearCanalPrestamos();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '¡Tu libro está listo!',
      body: `Ya podés retirar "${titulo}" en el mostrador de la biblioteca.`,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 1,
      channelId: CANAL_PRESTAMOS,
    },
  });
}
