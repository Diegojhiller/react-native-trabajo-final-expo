import { router } from 'expo-router';
import { FlatList, StyleSheet } from 'react-native';

import { EncabezadoCatalogo } from '@/components/encabezado-catalogo';
import { EstadoLista } from '@/components/estado-lista';
import { FilaLibro } from '@/components/fila-libro';
import { MENSAJES } from '@/constants/mensajes';
import { colores, espacios } from '@/constants/tema';
import { useBiblioteca } from '@/context/BibliotecaContext';
import { useLibros } from '@/hooks/useLibros';
import { obtenerLibroPorIsbn } from '@/lib/catalogo';
import type { Libro } from '@/types';

const esLibro = (libro: Libro | undefined): libro is Libro => libro !== undefined;

function abrirLibro(isbn: string) {
  router.push({ pathname: '/libro/[isbn]', params: { isbn } });
}

/** Ruta "/": catálogo con estados de carga, error y vacío. */
export default function Catalogo() {
  const { libros, cargando, error, reintentar } = useLibros();
  const { recientes } = useBiblioteca();
  const librosRecientes = recientes.map((isbn) => obtenerLibroPorIsbn(isbn)).filter(esLibro);

  return (
    <FlatList
      contentInsetAdjustmentBehavior="automatic"
      style={styles.lista}
      contentContainerStyle={styles.contenido}
      data={cargando || error ? [] : libros}
      keyExtractor={(libro) => libro.isbn}
      renderItem={({ item }) => <FilaLibro libro={item} onPress={() => abrirLibro(item.isbn)} />}
      ListHeaderComponent={
        <EncabezadoCatalogo recientes={librosRecientes} onAbrirLibro={abrirLibro} />
      }
      ListEmptyComponent={
        <EstadoLista
          cargando={cargando}
          textoCargando="Cargando el catálogo…"
          error={error}
          onReintentar={reintentar}
          vacio={{ icono: 'library-outline', titulo: MENSAJES.catalogoVacio }}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  lista: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  contenido: {
    padding: espacios.l,
    gap: espacios.s,
  },
});
