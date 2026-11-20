import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { BotonIcono } from '@/components/boton-icono';
import { colores, espacios, radios, tamanos } from '@/constants/tema';

type Props = {
  texto: string;
  onDescartar?: () => void;
};

/** Aviso dentro de la app: la alternativa cuando no hay notificaciones. */
export function AvisoEnApp({ texto, onDescartar }: Props) {
  return (
    <View style={styles.aviso} accessibilityRole="alert">
      <Ionicons name="information-circle" size={tamanos.icono} color={colores.alerta} />
      <Text style={styles.texto}>{texto}</Text>
      {onDescartar ? <BotonIcono icono="close" etiqueta="Descartar aviso" onPress={onDescartar} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  aviso: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacios.s,
    paddingLeft: espacios.m,
    paddingVertical: espacios.xs,
    borderRadius: radios.m,
    backgroundColor: colores.alertaSuave,
  },
  texto: {
    flex: 1,
    paddingVertical: espacios.s,
    fontSize: tamanos.texto,
    color: colores.alerta,
  },
});
