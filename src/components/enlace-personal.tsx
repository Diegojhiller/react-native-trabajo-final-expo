import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';

import { colores, espacios, pesos, tamanos } from '@/constants/tema';
import { useBiblioteca } from '@/context/BibliotecaContext';

/** Link del header del Catálogo: va al login o, si ya hay sesión, al mostrador. */
export function EnlacePersonal() {
  const { sesion } = useBiblioteca();
  return (
    <Link
      href={sesion ? '/mostrador' : '/login'}
      accessibilityLabel="Acceso del personal de biblioteca"
      style={styles.enlace}>
      Personal
    </Link>
  );
}

const styles = StyleSheet.create({
  enlace: {
    minHeight: tamanos.toqueMinimo,
    paddingHorizontal: espacios.s,
    paddingVertical: espacios.m,
    fontSize: tamanos.texto,
    fontWeight: pesos.negrita,
    color: colores.primario,
  },
});
