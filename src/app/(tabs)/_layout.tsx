import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router/js-tabs';

import { colores } from '@/constants/tema';
import { useBiblioteca } from '@/context/BibliotecaContext';

/** Dos pestañas. Catálogo tiene su propio Stack (carpeta (catalogo)). */
export default function LayoutTabs() {
  const { avisos } = useBiblioteca();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colores.primario,
        tabBarInactiveTintColor: colores.textoSecundario,
        headerTintColor: colores.primario,
      }}>
      <Tabs.Screen
        name="(catalogo)"
        options={{
          title: 'Catálogo',
          headerShown: false,
          tabBarIcon: ({ focused, size }) => (
            <Ionicons name="library" size={size} color={focused ? colores.primario : colores.textoSecundario} />
          ),
        }}
      />
      <Tabs.Screen
        name="reservas"
        options={{
          title: 'Mis reservas',
          tabBarBadge: avisos.length > 0 ? avisos.length : undefined,
          tabBarIcon: ({ focused, size }) => (
            <Ionicons name="bookmarks" size={size} color={focused ? colores.primario : colores.textoSecundario} />
          ),
        }}
      />
    </Tabs>
  );
}
