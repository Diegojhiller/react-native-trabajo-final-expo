import { Stack } from 'expo-router';

import { colores } from '@/constants/tema';
import { useBiblioteca } from '@/context/BibliotecaContext';

/**
 * Stack raíz. /login y /mostrador solo existen según haya sesión del personal:
 * cuando `guard` cambia, la pantalla aparece o desaparece del historial sola.
 */
export function NavegacionRaiz() {
  const { sesion } = useBiblioteca();

  return (
    <Stack
      screenOptions={{
        headerBackButtonDisplayMode: 'minimal',
        headerTintColor: colores.primario,
        contentStyle: { backgroundColor: colores.fondo },
      }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="buscar" options={{ title: 'Buscar' }} />
      <Stack.Screen
        name="reservar/[isbn]"
        options={{ presentation: 'modal', title: 'Confirmar reserva' }}
      />
      <Stack.Screen
        name="permisos/[recurso]"
        options={{ presentation: 'modal', title: 'Permiso' }}
      />

      <Stack.Protected guard={!sesion}>
        <Stack.Screen
          name="login"
          options={{ presentation: 'modal', title: 'Ingreso del personal' }}
        />
      </Stack.Protected>

      <Stack.Protected guard={sesion}>
        <Stack.Screen name="mostrador" options={{ title: 'Mostrador' }} />
      </Stack.Protected>

      <Stack.Screen name="+not-found" options={{ title: 'Página no encontrada' }} />
    </Stack>
  );
}
