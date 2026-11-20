import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/boton';
import { CampoTexto } from '@/components/campo-texto';
import { MENSAJES } from '@/constants/mensajes';
import { colores, espacios, tamanos } from '@/constants/tema';
import { obtenerLibroPorIsbn } from '@/lib/catalogo';
import { esIsbnValido, limpiarIsbn } from '@/lib/isbn';

type Props = {
  onAbrirLibro: (isbn: string) => void;
};

/** Alternativa a la cámara: escribir el ISBN a mano. Siempre está disponible. */
export function IngresoIsbn({ onAbrirLibro }: Props) {
  const [texto, setTexto] = useState('');
  const [error, setError] = useState<string | null>(null);

  function abrir() {
    const isbn = limpiarIsbn(texto);
    if (!esIsbnValido(isbn)) {
      setError(MENSAJES.isbnInvalido);
      return;
    }
    if (!obtenerLibroPorIsbn(isbn)) {
      setError(`No hay ningún libro con ISBN ${isbn} en el catálogo.`);
      return;
    }
    setError(null);
    onAbrirLibro(isbn);
  }

  return (
    <View style={styles.contenedor}>
      <CampoTexto
        etiqueta="O escribí el ISBN (13 números)"
        value={texto}
        onChangeText={setTexto}
        keyboardType="number-pad"
        maxLength={17}
        placeholder="9789871000012"
        onSubmitEditing={abrir}
      />
      {error ? (
        <Text style={styles.error} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
      <Boton titulo="Abrir libro" icono="book" variante="secundario" onPress={abrir} />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    gap: espacios.s,
  },
  error: {
    fontSize: tamanos.texto,
    color: colores.peligro,
  },
});
