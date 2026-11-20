import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet } from 'react-native';

import { colores, tamanos } from '@/constants/tema';
import type { NombreIcono } from '@/types';

type Props = {
  icono: NombreIcono;
  /** Obligatorio: es lo único que lee el lector de pantalla. */
  etiqueta: string;
  onPress: () => void;
};

/** Botón que solo muestra un ícono. */
export function BotonIcono({ icono, etiqueta, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      onPress={onPress}
      style={({ pressed }) => [styles.base, pressed && styles.presionado]}>
      <Ionicons name={icono} size={tamanos.icono} color={colores.textoSecundario} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: tamanos.toqueMinimo,
    height: tamanos.toqueMinimo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presionado: {
    opacity: 0.6,
  },
});
