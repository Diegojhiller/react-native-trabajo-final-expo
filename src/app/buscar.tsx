import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { CampoTexto } from '@/components/campo-texto';
import { EstadoLista } from '@/components/estado-lista';
import { FilaLibro } from '@/components/fila-libro';
import { colores, espacios } from '@/constants/tema';
import { useBusqueda } from '@/hooks/useBusqueda';

/** Ruta "/buscar?q=": la búsqueda vive en la URL, así se puede compartir con un link. */
export default function Buscar() {
  const { q = '' } = useLocalSearchParams<{ q?: string }>();
  // Estado local para que el cursor no salte mientras se escribe.
  const [texto, setTexto] = useState(q);
  const { resultados, cargando, error, reintentar } = useBusqueda(q);

  function cambiarTexto(nuevo: string) {
    setTexto(nuevo);
    // Cambia el parámetro de la pantalla actual sin apilar pantallas nuevas.
    router.setParams({ q: nuevo });
  }

  function abrirLibro(isbn: string) {
    // Vuelve a las pestañas y abre el detalle dentro del Stack del Catálogo.
    router.dismissTo({ pathname: '/libro/[isbn]', params: { isbn } });
  }

  const sinTexto = q.trim() === '';

  return (
    <FlatList
      contentInsetAdjustmentBehavior="automatic"
      style={styles.lista}
      contentContainerStyle={styles.contenido}
      keyboardShouldPersistTaps="handled"
      data={resultados}
      keyExtractor={(libro) => libro.isbn}
      renderItem={({ item }) => <FilaLibro libro={item} onPress={() => abrirLibro(item.isbn)} />}
      ListHeaderComponent={
        <View style={styles.buscador}>
          <CampoTexto
            etiqueta="Título o autor"
            value={texto}
            onChangeText={cambiarTexto}
            placeholder="Por ejemplo: borges"
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
            autoFocus={sinTexto}
          />
        </View>
      }
      ListEmptyComponent={
        <EstadoLista
          cargando={cargando}
          textoCargando="Buscando…"
          error={error}
          onReintentar={reintentar}
          vacio={
            sinTexto
              ? { icono: 'search', titulo: 'Escribí un título o un autor para buscar' }
              : {
                  icono: 'sad-outline',
                  titulo: 'No encontramos libros',
                  texto: `No hay resultados para "${q.trim()}". Probá con otra palabra.`,
                }
          }
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
  buscador: {
    marginBottom: espacios.s,
  },
  contenido: {
    padding: espacios.l,
    gap: espacios.s,
  },
});
