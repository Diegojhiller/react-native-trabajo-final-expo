# Biblioteca IPF

Trabajo Práctico N° 4 · Taller Complementario React Native II · Instituto Politécnico Formosa.

App para consultar el catálogo de la biblioteca, reservar libros, recibir un recordatorio de
devolución y, para el personal, entregar los libros respetando el orden de las listas de espera.

- **Expo SDK 58** (`expo ~58.0.26`, `expo-router ~58.0.32`, React Native 0.88.1, React 19.3).
- Creada con `npx create-expo-app@latest`. Paquetes instalados con `npx expo install`.
- Módulos nativos: solo `expo-camera` y `expo-notifications`.
- Probada en Expo Go (iPhone).

## Cómo ejecutarla

```bash
npm install
npx expo start
```

Escaneá el QR con la cámara del iPhone (o con Expo Go en Android). Expo Go tiene que ser la
versión compatible con SDK 58. Si el teléfono no se conecta a la PC, probá con
`npx expo start --tunnel`.

Comprobaciones:

```bash
npx expo lint        # lint
npx tsc --noEmit     # tipos (incluye las rutas tipadas)
```

**Acceso del personal** (link "Personal" en el header del Catálogo): usuario `biblioteca`,
clave `ipf2026`. Están fijos en `src/constants/biblioteca.ts`.

## Árbol de rutas (`src/app`)

```text
src/app/
├── _layout.tsx                  Stack raíz · BibliotecaProvider · Stack.Protected · anchor '(tabs)'
├── +not-found.tsx               cualquier otra URL → 404 que muestra la ruta
├── (tabs)/
│   ├── _layout.tsx              Tabs (expo-router/js-tabs)
│   ├── (catalogo)/              Tab "Catálogo" (el grupo no aparece en la URL)
│   │   ├── _layout.tsx          Stack de la tab · anchor 'index'
│   │   ├── index.tsx            /
│   │   ├── libro/[isbn].tsx     /libro/[isbn]
│   │   └── escanear.tsx         /escanear           (cámara)
│   └── reservas.tsx             /reservas           Tab "Mis reservas" (notificaciones)
├── buscar.tsx                   /buscar?q=          Stack raíz
├── reservar/[isbn].tsx          /reservar/[isbn]    Stack raíz · presentation: 'modal'
├── permisos/[recurso].tsx       /permisos/camara · /permisos/notificaciones · modal
├── login.tsx                    /login              modal · Stack.Protected guard={!sesion}
├── mostrador.tsx                /mostrador          Stack.Protected guard={sesion}
└── reserva.tsx                  /reserva            <Redirect href="/reservas" />
```

Árbol de navegadores: `Stack raíz → Tabs → Stack (catálogo) → index | libro/[isbn] | escanear`.
El Stack raíz se declara en `src/components/navegacion-raiz.tsx`, porque necesita leer la sesión
del Context y `src/app` solo tiene rutas.

## Organización del resto de `src`

| Carpeta | Contenido |
| --- | --- |
| `components/` | Un componente por archivo (botones, tarjetas, estados, zona de cámara…) |
| `hooks/` | `useLibros`, `useBusqueda`, `usePermiso`, `usePermisosNotificaciones`, `useAlVolverAlFrente` |
| `context/` | `BibliotecaContext`: préstamos, listas de espera, recientes, avisos y sesión |
| `estructuras/` | `Pila` y `Cola` con `#items`, `tamanio` y `aArray()` (la Cola no usa `shift()`) |
| `lib/` | API simulada, catálogo, ISBN, fechas, permisos y notificaciones |
| `data/` | `libros.ts`: 17 libros y las listas de espera iniciales |
| `types/` | Tipos compartidos (`Libro`, `Prestamo`, `Aviso`…) |
| `constants/` | `tema.ts` (colores, tamaños, espaciados), reglas de la biblioteca, textos y mensajes |

## Plugins de `app.json` (comentados)

```jsonc
"plugins": [
  // Expo Router: rutas a partir de los archivos de src/app.
  "expo-router",
  // Pantalla de carga con el color de la app.
  ["expo-splash-screen", { "backgroundColor": "#1E3A8A", "image": "./assets/images/splash-icon.png", "imageWidth": 76 }],
  ["expo-camera", {
    // iOS: NSCameraUsageDescription, con el molde "Usamos tu [dato] para [beneficio]".
    "cameraPermission": "Usamos tu cámara para leer el código de barras del libro y abrir su ficha al instante.",
    // Mínimo privilegio: no grabamos video con sonido.
    "microphonePermission": false,   // iOS: no se agrega NSMicrophoneUsageDescription
    "recordAudioAndroid": false      // Android: no se agrega RECORD_AUDIO
  }],
  ["expo-notifications", {
    // Canal por defecto de Android: el mismo que crea la app antes de pedir el permiso.
    "defaultChannel": "prestamos",
    "color": "#1E3A8A"
  }]
]
```

Además: `"scheme": "bibliotecaipf"` (deep links), `"experiments": { "typedRoutes": true }`
(rutas tipadas) y `"userInterfaceStyle": "light"`.

## Permisos

| Recurso | Módulo | Cuándo se pide | Alternativa si se niega |
| --- | --- | --- | --- |
| Cámara | `expo-camera` (`useCameraPermissions` + `usePermiso`) | Al tocar "Usar la cámara" en `/escanear`, después de la pantalla previa `/permisos/camara` | Escribir el ISBN a mano en la misma pantalla |
| Notificaciones | `expo-notifications` (`usePermisosNotificaciones` + `usePermiso`) | Solo al activar "Recordarme" en un préstamo, después de `/permisos/notificaciones`. En Android se crea antes el canal `prestamos` | Avisos dentro de la app, en "Mis reservas" |

La app no pide ningún otro permiso y nunca se bloquea por un permiso denegado.

### Justificación de `blockedPermissions` (Android)

`android.blockedPermissions` agrega `tools:node="remove"` en el `AndroidManifest.xml`, así el
permiso no queda declarado aunque lo agregue una librería o la plantilla. Bloqueamos lo que la app
no usa:

| Permiso bloqueado | Motivo |
| --- | --- |
| `RECORD_AUDIO` | El escáner solo usa la imagen; nunca grabamos audio (refuerza `recordAudioAndroid: false`) |
| `SYSTEM_ALERT_WINDOW` | La app no se dibuja encima de otras apps |
| `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE` | No leemos ni guardamos archivos del dispositivo |
| `READ_MEDIA_IMAGES`, `READ_MEDIA_VIDEO` | No accedemos a la galería |
| `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`, `ACCESS_BACKGROUND_LOCATION` | No usamos la ubicación |
| `READ_CONTACTS` | No usamos la agenda |

Los permisos que sí quedan son `CAMERA` (lo agrega `expo-camera`), `POST_NOTIFICATIONS` y
`RECEIVE_BOOT_COMPLETED` (los agrega `expo-notifications`; el segundo vuelve a programar los
recordatorios si el teléfono se reinicia) e `INTERNET` (la plantilla).

## Deep links de prueba

En Expo Go se reemplaza `bibliotecaipf://` por `exp://<IP>:8081/--/` (la IP que muestra
`npx expo start`).

| Link | Qué debería pasar |
| --- | --- |
| `bibliotecaipf://libro/9789871000012` | Detalle de "Ficciones", con el Catálogo debajo |
| `bibliotecaipf://libro/123` | "Ese ISBN no es válido" y un link al Catálogo |
| `bibliotecaipf://buscar?q=borges` | Buscador con "borges" y los libros de Borges; las pestañas quedan debajo |
| `bibliotecaipf://mostrador` (sin sesión) | La ruta no existe sin sesión: no se muestra el mostrador |
| `bibliotecaipf://reserva` | Redirige a "Mis reservas" |
| `bibliotecaipf://escanear` | Escáner (con la cámara bloqueada: explicación, "Abrir Ajustes" e ISBN a mano) |
| `bibliotecaipf://cualquier-cosa` | Pantalla 404 con la ruta inexistente |

Ejemplo con Expo Go: `npx uri-scheme open "exp://192.168.0.10:8081/--/buscar?q=borges" --ios`.

## Libros para probar

- ISBN de ejemplo: `9789871000012` (Ficciones, 2 ejemplares) y `9789871000043` (Rayuela).
- Sin ejemplares y con lista de espera: El Aleph (Ana, Bruno), Cien años de soledad (Carla) y
  El principito (Diego, Eva).
- Sin ejemplares y sin espera: Pedro Páramo.
- Los dos últimos libros de `src/data/libros.ts` son ejemplares reales para probar el escáner.

## Salida de lint y tipos

```text
$ npx expo lint
(sin errores ni advertencias, código de salida 0)

$ npx tsc --noEmit
(sin errores, código de salida 0)
```

## Capturas

Las capturas están en la carpeta [`capturas/`](capturas/). Se sacaron de la **versión web** de la
app (`npx expo start --web`) en Chrome, con el tamaño de pantalla de un iPhone (390 × 844), porque
el teléfono de prueba no estuvo disponible.

| # | Pantalla | Archivo |
| --- | --- | --- |
| 1 | Catálogo cargando | [`01-catalogo-cargando.png`](capturas/01-catalogo-cargando.png) |
| 2 | Catálogo con error y "Reintentar" | [`02-catalogo-error.png`](capturas/02-catalogo-error.png) |
| 3 | Catálogo con datos | [`03-catalogo-datos.png`](capturas/03-catalogo-datos.png) |
| 4 | Buscador (`/buscar?q=borges`) | [`04-buscador.png`](capturas/04-buscador.png) |
| 5 | Detalle inexistente (`/libro/123`) | [`05-detalle-inexistente.png`](capturas/05-detalle-inexistente.png) |
| 6 | Detalle de un libro | [`06-detalle-libro.png`](capturas/06-detalle-libro.png) |
| 7 | Reserva con ejemplares (préstamo por 7 días) | [`07-reserva-con-ejemplares.png`](capturas/07-reserva-con-ejemplares.png) |
| 8 | Reserva sin ejemplares (posición en la espera) | [`08-reserva-sin-ejemplares.png`](capturas/08-reserva-sin-ejemplares.png) |
| 9 | Mis reservas (préstamo y espera) | [`09-mis-reservas.png`](capturas/09-mis-reservas.png) |
| 10 | Vistos recientemente (Pila) | [`10-vistos-recientemente.png`](capturas/10-vistos-recientemente.png) |
| 11 | Pantalla previa al permiso de notificaciones | [`11-permiso-previo-notificaciones.png`](capturas/11-permiso-previo-notificaciones.png) |
| 12 | Login con clave incorrecta | [`12-login-incorrecto.png`](capturas/12-login-incorrecto.png) |
| 13 | Mostrador antes de "Entregar al siguiente" | [`13-mostrador-antes.png`](capturas/13-mostrador-antes.png) |
| 14 | Mostrador después de "Entregar al siguiente" | [`14-mostrador-despues.png`](capturas/14-mostrador-despues.png) |
| 15 | Escáner: cargando | [`15-escaner-cargando.png`](capturas/15-escaner-cargando.png) |
| 16 | Escáner: preguntable | [`16-escaner-preguntable.png`](capturas/16-escaner-preguntable.png) |
| 17 | Pantalla previa al permiso de cámara | [`17-permiso-previo-camara.png`](capturas/17-permiso-previo-camara.png) |
| 18 | Pantalla 404 | [`18-pantalla-404.png`](capturas/18-pantalla-404.png) |

Aclaraciones:

- **Escáner cargando (15):** en un teléfono la consulta del permiso dura milisegundos y el estado no
  llega a verse. Para capturarlo, el navegador de prueba demoró 2 segundos la respuesta de
  `navigator.permissions.query`; el código de la app no se modificó.
- **Pendientes para el teléfono:** el escáner **concedido** (cámara funcionando), el escáner
  **bloqueado** y la **notificación recibida** no se pueden mostrar en la versión web:
  - En web, `expo-camera` siempre informa `canAskAgain: true`, así que el estado "bloqueado" no
    existe en el navegador.
  - El lector de códigos web descarga un componente desde internet que la red de prueba bloqueó.
  - `expo-notifications` no programa notificaciones locales en web.

  En Expo Go (iPhone), la cámara se abrió correctamente cuando el permiso estaba concedido.
