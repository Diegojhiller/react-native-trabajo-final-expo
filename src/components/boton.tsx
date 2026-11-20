import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colores, espacios, pesos, radios, tamanos } from '@/constants/tema';
import type { NombreIcono } from '@/types';

type Variante = 'primario' | 'secundario' | 'peligro';

type Props = {
  titulo: string;
  onPress: () => void;
  variante?: Variante;
  icono?: NombreIcono;
  deshabilitado?: boolean;
};

const COLOR_CONTENIDO: Record<Variante, string> = {
  primario: colores.sobrePrimario,
  secundario: colores.primario,
  peligro: colores.peligro,
};

/** Botón con texto (y un ícono opcional). Área táctil mínima de 44 × 44. */
export function Boton({ titulo, onPress, variante = 'primario', icono, deshabilitado = false }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: deshabilitado }}
      disabled={deshabilitado}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[variante],
        deshabilitado && styles.deshabilitado,
        pressed && styles.presionado,
      ]}>
      {icono ? <Ionicons name={icono} size={tamanos.icono} color={COLOR_CONTENIDO[variante]} /> : null}
      <Text style={[styles.texto, textos[variante]]}>{titulo}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: tamanos.toqueMinimo,
    minWidth: tamanos.toqueMinimo,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: espacios.s,
    paddingVertical: espacios.m,
    paddingHorizontal: espacios.l,
    borderRadius: radios.m,
  },
  primario: {
    backgroundColor: colores.primario,
  },
  secundario: {
    backgroundColor: colores.primarioSuave,
  },
  peligro: {
    backgroundColor: colores.peligroSuave,
  },
  deshabilitado: {
    opacity: 0.4,
  },
  presionado: {
    opacity: 0.8,
  },
  texto: {
    fontSize: tamanos.texto,
    fontWeight: pesos.negrita,
  },
});

const textos = StyleSheet.create({
  primario: {
    color: COLOR_CONTENIDO.primario,
  },
  secundario: {
    color: COLOR_CONTENIDO.secundario,
  },
  peligro: {
    color: COLOR_CONTENIDO.peligro,
  },
});
