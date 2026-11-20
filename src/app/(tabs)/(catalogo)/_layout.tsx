import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native';

import { EnlacePersonal } from '@/components/enlace-personal';
import { colores } from '@/constants/tema';

/** Con un deep link a /libro/..., el Catálogo queda debajo en la pila de esta pestaña. */
export const unstable_settings = {
  anchor: 'index',
};

/** Stack propio de la pestaña Catálogo: / → /libro/[isbn] y /escanear. */
export default function LayoutCatalogo() {
  return (
    <Stack
      screenOptions={{
        headerBackButtonDisplayMode: 'minimal',
        headerTintColor: colores.primario,
        contentStyle: styles.contenido,
      }}>
      <Stack.Screen
        name="index"
        options={{ title: 'Catálogo', headerRight: () => <EnlacePersonal /> }}
      />
      <Stack.Screen name="libro/[isbn]" options={{ title: 'Libro' }} />
      <Stack.Screen name="escanear" options={{ title: 'Escanear' }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  contenido: {
    backgroundColor: colores.fondo,
  },
});
