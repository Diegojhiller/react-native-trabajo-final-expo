import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Boton } from '@/components/boton';
import { VistosRecientemente } from '@/components/vistos-recientemente';
import { espacios } from '@/constants/tema';
import type { Libro } from '@/types';

type Props = {
  recientes: Libro[];
  onAbrirLibro: (isbn: string) => void;
};

/** Parte de arriba del Catálogo: vistos recientemente y accesos a Buscar y Escanear. */
export function EncabezadoCatalogo({ recientes, onAbrirLibro }: Props) {
  return (
    <View style={styles.contenedor}>
      <VistosRecientemente libros={recientes} onAbrirLibro={onAbrirLibro} />
      <View style={styles.accesos}>
        <View style={styles.acceso}>
          <Boton titulo="Buscar" icono="search" onPress={() => router.push('/buscar')} />
        </View>
        <View style={styles.acceso}>
          <Boton
            titulo="Escanear"
            icono="barcode"
            variante="secundario"
            onPress={() => router.push('/escanear')}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    gap: espacios.l,
    marginBottom: espacios.s,
  },
  accesos: {
    flexDirection: 'row',
    gap: espacios.s,
  },
  acceso: {
    flex: 1,
  },
});
