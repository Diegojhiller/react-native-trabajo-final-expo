import { Link, usePathname } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { MensajeEstado } from '@/components/mensaje-estado';
import { colores, espacios, pesos, radios, tamanos } from '@/constants/tema';

/** Pantalla 404: se muestra cuando ninguna ruta coincide con la URL. */
export default function NoEncontrada() {
  const ruta = usePathname();

  return (
    <View style={styles.pantalla}>
      <MensajeEstado
        icono="compass-outline"
        titulo="Esta página no existe"
        texto="No encontramos ninguna pantalla para esta dirección:">
        <Text style={styles.ruta}>{ruta}</Text>
        <Link href="/" dismissTo style={styles.enlace}>
          Ir al Catálogo
        </Link>
      </MensajeEstado>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: colores.fondo,
  },
  ruta: {
    alignSelf: 'center',
    paddingHorizontal: espacios.m,
    paddingVertical: espacios.xs,
    borderRadius: radios.s,
    backgroundColor: colores.borde,
    fontSize: tamanos.texto,
    color: colores.texto,
  },
  enlace: {
    minHeight: tamanos.toqueMinimo,
    paddingVertical: espacios.m,
    fontSize: tamanos.textoGrande,
    fontWeight: pesos.negrita,
    color: colores.primario,
    textAlign: 'center',
  },
});
