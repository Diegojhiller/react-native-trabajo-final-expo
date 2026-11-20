import { StyleSheet, View } from 'react-native';

import { AvisoEnApp } from '@/components/aviso-en-app';
import { MENSAJES } from '@/constants/mensajes';
import { espacios } from '@/constants/tema';
import type { Aviso } from '@/types';

type Props = {
  avisos: Aviso[];
  notificacionesBloqueadas: boolean;
  onDescartar: (id: string) => void;
};

/** Avisos dentro de la app: la alternativa a las notificaciones del sistema. */
export function AvisosReservas({ avisos, notificacionesBloqueadas, onDescartar }: Props) {
  if (avisos.length === 0 && !notificacionesBloqueadas) {
    return null;
  }
  return (
    <View style={styles.contenedor}>
      {notificacionesBloqueadas ? <AvisoEnApp texto={MENSAJES.sinPermisoNotificaciones} /> : null}
      {avisos.map((aviso) => (
        <AvisoEnApp key={aviso.id} texto={aviso.texto} onDescartar={() => onDescartar(aviso.id)} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    gap: espacios.s,
    marginBottom: espacios.s,
  },
});
