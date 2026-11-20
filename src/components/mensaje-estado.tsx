import Ionicons from '@expo/vector-icons/Ionicons';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colores, espacios, pesos, tamanos } from '@/constants/tema';
import type { NombreIcono } from '@/types';

type Props = {
  icono: NombreIcono;
  titulo: string;
  texto?: string;
  /** Acciones para salir del estado (reintentar, volver, abrir Ajustes…). */
  children?: ReactNode;
};

/** Mensaje centrado para estados de error, vacío o sin permiso. */
export function MensajeEstado({ icono, titulo, texto, children }: Props) {
  return (
    <View style={styles.contenedor}>
      <Ionicons name={icono} size={tamanos.iconoGrande} color={colores.primario} />
      <Text style={styles.titulo} accessibilityRole="header">
        {titulo}
      </Text>
      {texto ? <Text style={styles.texto}>{texto}</Text> : null}
      {children ? <View style={styles.acciones}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    alignItems: 'center',
    gap: espacios.m,
    paddingVertical: espacios.xl,
    paddingHorizontal: espacios.l,
  },
  titulo: {
    fontSize: tamanos.textoGrande,
    fontWeight: pesos.negrita,
    color: colores.texto,
    textAlign: 'center',
  },
  texto: {
    fontSize: tamanos.texto,
    color: colores.textoSecundario,
    textAlign: 'center',
  },
  acciones: {
    alignSelf: 'stretch',
    gap: espacios.s,
    marginTop: espacios.s,
  },
});
