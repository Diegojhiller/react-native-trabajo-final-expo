# Respuestas · TP 4 "Biblioteca IPF"

Las citas usan la forma `archivo:línea` y se refieren al código de este repositorio.

---

## Parte B · Estado, efectos y renderizado

### B1. El ciclo de vida de `useLibros`

**a) Render por render** (`src/hooks/useLibros.ts`)

Cuando sale bien:

| Render | `libros` | `cargando` | `error` | Qué lo provoca |
| --- | --- | --- | --- | --- |
| 1 | `[]` | `true` | `null` | El montaje del Catálogo. Son los valores iniciales de los `useState` (líneas 15 a 17). Después de pintar, corre el efecto (línea 21), que llama a `obtenerLibros()`. |
| 2 | 17 libros | `false` | `null` | Llega la respuesta (800 ms). En `cargar()` se llaman `setLibros`, `setError(null)` y `setCargando(false)` (líneas 30, 31 y 39). React los agrupa (*batching*: junta varios cambios de estado en un solo render), así que hay **un solo** render nuevo. |

Son **2 renders**. En el render 1 el `FlatList` recibe `data=[]` y el `ListEmptyComponent` muestra
"Cargando el catálogo…" (`src/app/(tabs)/(catalogo)/index.tsx:30` y `:36`).

Cuando falla y la persona toca "Reintentar":

| Render | `libros` | `cargando` | `error` | Qué lo provoca |
| --- | --- | --- | --- | --- |
| 1 | `[]` | `true` | `null` | El montaje. El efecto pide el catálogo. |
| 2 | `[]` | `false` | mensaje | `obtenerLibros()` lanza el error. El `catch` hace `setError(MENSAJES.errorCatalogo)` y el `finally` hace `setCargando(false)` (líneas 33 a 40), en un solo render. Se ve "Algo salió mal" con el botón "Reintentar" (`src/components/estado-lista.tsx:19-25`). |
| 3 | `[]` | `true` | `null` | La persona toca "Reintentar": `reintentar` hace `setError(null)`, `setCargando(true)` y `setIntento(+1)` (líneas 50 a 54), agrupados. Como cambió `intento`, después del render React ejecuta la limpieza del efecto anterior y vuelve a correr el efecto. |
| 4 | 17 libros | `false` | `null` | Llega la nueva respuesta (si esta vez no falla). |

Nunca se muestra el texto crudo del error ("No se pudo conectar…"): se muestra el mensaje de
`src/constants/mensajes.ts`.

**b) ¿Se desmonta el Catálogo?**

Lo comprobé poniendo un `console.log('limpieza useLibros')` temporal dentro del `return () => {…}`
del efecto (línea 45), y después lo saqué.

- **Al cambiar a "Mis reservas": no se desmonta.** Las tabs no apilan, pero tampoco desmontan: la
  pantalla de cada pestaña queda montada y oculta. El log no aparece.
- **Al abrir un detalle: tampoco.** `router.push` apila `/libro/[isbn]` arriba del Catálogo en el
  Stack de la pestaña. La pantalla de abajo queda montada (por eso al volver la lista sigue ahí, sin
  recargar). El log no aparece.

La limpieza se ejecuta en dos situaciones reales:
1. **Al reintentar.** Cambia `intento` y, antes de correr el efecto nuevo, React limpia el anterior.
2. **Cuando el Catálogo se desmonta de verdad.** Pasa si se cierra la app o se recarga en
   desarrollo. Si eso ocurre mientras el pedido está en vuelo, `vigente = false` evita hacer
   `setState` sobre un componente que ya no existe.

**c) ¿Por qué no se puede pasar una función `async` a `useEffect`?**

Una función `async` siempre devuelve una `Promise`. `useEffect` espera que el callback devuelva
**nada o una función de limpieza**. Si devuelve una promesa, React la trataría como limpieza (y
avisa con un error): no habría forma de limpiar. Lo resolví declarando una función `async` **dentro**
del efecto, llamándola y devolviendo la limpieza de forma sincrónica:

```ts
// src/hooks/useLibros.ts:21-48
useEffect(() => {
  let vigente = true;
  async function cargar() { /* await obtenerLibros() … */ }
  cargar();
  return () => {
    vigente = false;
  };
}, [intento]);
```

**d) ¿Cómo implementé `reintentar`?**

Con un contador `intento` (línea 19) que está en el array de dependencias del efecto (línea 48).
`reintentar` (líneas 50 a 54) lo incrementa. Como cambió una dependencia, React vuelve a ejecutar el
efecto y eso dispara el pedido de nuevo.

Elegí un contador y no otro valor porque su único significado es "quiero volver a pedir" y cambia
**solo** cuando la persona lo pide:
- Si usara `error` como dependencia, un error que se repite con el mismo texto no cambiaría el
  valor y no volvería a pedir.
- Si usara `cargando` o `libros`, el efecto modificaría su propia dependencia y podría entrar en un
  bucle.

---

### B2. La condición de carrera del buscador

Mi búsqueda está en `src/hooks/useBusqueda.ts` y la pantalla en `src/app/buscar.tsx`.

| Momento | Qué pasa | Sin limpieza: qué se ve | Con mi código: qué se ve |
| --- | --- | --- | --- |
| t = 0 ms | "bor" → `buscarLibros("bor")` (1.400 ms) | "Buscando…" | "Buscando…": `cargando` es `true` porque no hay respuesta para la consulta actual (línea 61). |
| t = 200 ms | "borges" → `buscarLibros("borges")` (300 ms) | Sigue "Buscando…" | Sigue "Buscando…". Antes del efecto nuevo se ejecutó la limpieza del de "bor": su `vigente` pasó a `false`. |
| t = 500 ms | Llega "borges" | Resultados de "borges" | Resultados de "borges" (Ficciones, El Aleph, El libro de arena). |
| t = 1.400 ms | Llega "bor" | **Los resultados de "bor" pisan a los de "borges"**, aunque el campo dice "borges" | Se sigue viendo "borges". La respuesta de "bor" llega con `vigente === false` y se descarta (líneas 36 y 41). |

Con mis datos, "bor" y "borges" encuentran los mismos tres libros, así que el error no "se nota" a
simple vista. Con un catálogo más grande (por ejemplo, un autor "Borrero"), sin limpieza se verían
resultados que no corresponden a lo escrito.

**a) Qué hace la limpieza y cuándo se ejecuta**

Cada ejecución del efecto crea su propia variable `vigente = true` (línea 32). La limpieza
(líneas 47 a 49) la pone en `false`. El `.then` y el `.catch` solo hacen `setRespuesta` si su
`vigente` sigue en `true`. React ejecuta la limpieza:
- **antes de volver a correr el efecto**, cuando cambia `consulta` o `intento` (después del render
  nuevo);
- **al desmontar** la pantalla.

Así, cuando llega la respuesta vieja, su clausura (*closure*: la función que "recuerda" las
variables del momento en que se creó) ve `vigente === false` y no toca el estado.

Además agregué una segunda defensa: la respuesta se guarda junto con la consulta que la originó
(línea 37). Solo se muestra si coincide con la consulta actual (`alDia`, línea 57), así que nunca
aparecen resultados que no correspondan a lo que está en la URL.

**b) La propuesta `if (texto === q) setResultados(datos)`**

**No funciona.** La función del `.then()` se crea dentro del efecto de un render determinado y
"ve" el `q` de **ese** render, no el actual. Es una clausura: captura las variables del momento en
que se creó.

El efecto de "bor" se creó cuando `q` valía "bor", así que su `.then` compara `"bor" === "bor"`:
siempre da `true` y la respuesta vieja igual se muestra. Para que la comparación sirva, `q` tendría
que leerse de algo que cambie después, como un `useRef` con el último valor. La limpieza resuelve lo
mismo sin esa complicación.

**c) La URL y el botón atrás mientras se escribe**

Cada tecla llama a `router.setParams({ q: nuevo })` (`src/app/buscar.tsx:21`). La URL va cambiando
(`/buscar?q=b`, `/buscar?q=bo`, …), pero **se modifican los parámetros de la misma pantalla**: no se
apilan pantallas nuevas. El botón atrás vuelve directamente a la pantalla anterior (el Catálogo).

Con `router.push`, cada letra apilaría una pantalla `/buscar` nueva:
- para salir habría que tocar atrás una vez por cada letra escrita;
- cada pantalla nueva se monta de cero (el campo pierde el foco y el teclado se cierra);
- cada una lanza su propia búsqueda.

---

### B3. Mutar o reemplazar

**a)** Después de tocar "Anotarme" tres veces, el texto sigue diciendo **0**. `encolar` modifica el
objeto `Cola` por dentro, pero no se llama a ningún `setState`. Para React el estado sigue siendo la
misma referencia: no hay motivo para volver a renderizar y la pantalla muestra el valor del último
render.

**b)** Al escribir en el `TextInput` controlado se llama a su `setState`. La pantalla se vuelve a
renderizar y, al leer `espera.tamanio`, ahora encuentra 3: el número "salta".

Un error que aparece "a veces" es peor que uno que aparece siempre porque depende de algo que no
tiene relación con él (escribir en otro campo). Eso lo hace difícil de reproducir y de explicar. Las
pruebas pueden pasar, y la persona ve datos que cambian sin razón y deja de confiar en la app. Un
error que aparece siempre se detecta enseguida.

**c) Cómo lo resolví en el Context**

En `src/context/BibliotecaContext.tsx` nunca muto una `Cola` o una `Pila` que ya está en el estado.
Cada cambio crea una instancia nueva a partir de la anterior y la reemplaza:

```ts
// Reservar sin ejemplares (líneas 114-116)
const nueva = new Cola(cola?.aArray() ?? []);
nueva.encolar(MI_NOMBRE);
setEsperas((anteriores) => ({ ...anteriores, [libro.isbn]: nueva }));

// Entregar al siguiente (líneas 177-179)
const nueva = new Cola(cola.aArray());
const persona = nueva.desencolar() ?? null;
setEsperas((anteriores) => ({ ...anteriores, [isbn]: nueva }));

// Vistos recientemente (líneas 62-68)
const nueva = new Pila(anterior.aArray());
nueva.push(isbn);
return nueva;
```

Comparación de alternativas:

| Alternativa | Ventaja | Costo |
| --- | --- | --- |
| **Cola nueva a partir de la anterior** (la que usé) | La referencia cambia, así que React siempre re-renderiza. Cada render conserva su propia versión de los datos. Sigo usando mi clase con su API. | Copia el array en cada cambio (O(n)). Con listas de espera de pocas personas es despreciable. |
| **Contador de versión** (mutar y hacer `setVersion(v + 1)`) | No copia nada. | Es fácil olvidarse de incrementar. El objeto mutado es el mismo en todos los renders, así que un valor "viejo" cambia por detrás: se rompen `useMemo` y las comparaciones de React. |
| **`useReducer`** | Todas las transiciones (encolar, desencolar) quedan en un solo lugar, en una función pura fácil de probar. | Más código (acciones, tipos, `switch`). Adentro del reducer igual hay que devolver objetos nuevos: no evita el problema, lo ordena. |

---

### B4. ¿Dónde vive cada dato?

| Dato | Dónde vive en mi app | Por qué ahí y no en otro lugar |
| --- | --- | --- |
| Texto del buscador | **URL** (`?q=`, `src/app/buscar.tsx:13`) y una copia en **estado local** para el campo (línea 15) | En la URL se puede compartir con un link (`bibliotecaipf://buscar?q=borges`) y abrir directo. La copia local evita que el cursor salte mientras se escribe. |
| Préstamos y reservas | **Context** (`prestamos`, `BibliotecaContext.tsx:54`) | Lo leen y modifican varias pantallas de distintos navegadores: detalle, reserva, Mis reservas y mostrador. |
| Listas de espera | **Context** (`esperas: Record<isbn, Cola<string>>`, línea 55) | Las usan el detalle (cuántos esperan), la reserva (posición), Mis reservas y el mostrador (desencolar). |
| Vistos recientemente | **Context** (`Pila<string>`, línea 56) | El detalle hace `push` y el Catálogo lee el tope: son dos pantallas distintas. Si estuviera en el estado local del detalle, se perdería al cerrarlo. |
| Sesión del personal | **Context** (`sesion`, línea 58) | La lee el Stack raíz para `Stack.Protected` (`navegacion-raiz.tsx:32` y `:39`), que está por encima de todas las pantallas. Por eso el Provider envuelve al navegador en el layout raíz. |
| Ejemplares disponibles | **Se calcula** (`disponibles`, líneas 72 a 77): `ejemplares` del libro menos los préstamos que salieron del estante | Si lo guardara aparte, habría dos fuentes del mismo dato que podrían contradecirse (ver E4.d). |
| Estado del permiso de cámara | **Sistema operativo**. La app tiene una copia en el hook `useCameraPermissions` (vía `usePermiso`) | La decisión es de la persona y puede cambiarla en Ajustes en cualquier momento. Por eso no lo guardo en el Context: lo consulto al enfocar la pantalla y al volver de Ajustes. |
| Identificador de la notificación programada | **Context**, dentro de cada préstamo (`Prestamo.recordatorioId`, `src/types/index.ts`). La notificación en sí la guarda el SO | Hace falta para cancelarla al apagar "Recordarme" o al devolver el libro (`BibliotecaContext.tsx:122-130` y `:148-158`). |

**¿Qué se re-renderiza cuando cambia el `value`?** Todos los componentes que llaman a
`useBiblioteca()`: el Catálogo, el detalle, Mis reservas, el mostrador, la pantalla de permisos, el
layout de las tabs (por el contador de avisos), el Stack raíz y el link "Personal".

**Sí:** aunque el Catálogo solo use `recientes`, cuando activo un recordatorio cambia `prestamos`.
El `useMemo` del `value` (línea 218) genera un objeto nuevo y el Catálogo se vuelve a renderizar.

Para evitarlo se puede dividir el Context en varios (uno para recientes, otro para préstamos, otro
para la sesión) o usar una librería con selectores. **En una app de este tamaño no vale la pena:**
son pocas pantallas y renders baratos, y dividir el Context agrega complejidad. Antes de optimizar
lo mediría con el Profiler de React DevTools.

---

## Parte C · Navegación y rutas

### C1. La pila en mi app

| # | Acción | Pilas resultantes (de base a tope) |
| --- | --- | --- |
| 1 | Abre la app. | **Stack raíz:** `[(tabs)]` · **Tabs:** Catálogo activa · **Stack Catálogo:** `[index]` |
| 2 | Toca un libro. | Stack raíz: `[(tabs)]` · Stack Catálogo: `[index, libro/9789…]` |
| 3 | Toca "Reservar". | Stack raíz: `[(tabs), reservar/9789… (modal)]` · Stack Catálogo: `[index, libro/9789…]` |
| 4 | Toca "Confirmar". | Stack raíz: `[(tabs)]` (el modal se sacó) · Tabs: **Mis reservas** activa · Stack Catálogo: `[index, libro/9789…]` (intacto) |
| 5 | Toca atrás (Android). | Stack raíz: `[(tabs)]` · Tabs: vuelve a **Catálogo** (las tabs usan `backBehavior: 'firstRoute'`) · Stack Catálogo: `[index, libro/9789…]`: se ve el detalle |
| 6 | Toca la tab "Catálogo". | Como la pestaña ya está activa y su Stack tiene más de una pantalla, el Stack hace `popToTop`: Stack Catálogo `[index]` |

**a) Método del paso 4.** Usé `router.dismissTo('/reservas')` (`src/app/reservar/[isbn].tsx:58`).
`dismissTo` desapila el Stack raíz hasta encontrar `(tabs)` (saca el modal) y, adentro, cambia a la
pestaña Mis reservas.

- **Con `push`:** el modal está en el tope del Stack raíz, así que se apilaría una segunda instancia
  de `(tabs)` encima: `[(tabs), reservar, (tabs)]`. Al tocar atrás se volvería a la confirmación, y
  se podría reservar dos veces.
- **Con `replace`:** el modal se reemplaza por una `(tabs)` nueva: `[(tabs), (tabs)]`. "Atrás" ya no
  vuelve a la confirmación, pero quedan dos barras de pestañas, una debajo de la otra, y el Catálogo
  de la segunda se monta de nuevo (vuelve a pedir el catálogo).
- **Con `dismissTo`:** la historia queda limpia, `[(tabs)]`, y atrás nunca vuelve a la confirmación.
  Por eso lo elegí.

**b) Paso 6.** Si se llega a la pestaña Catálogo desde otra (por ejemplo, tocando "Catálogo" desde
Mis reservas), se ve **el detalle**: cada pestaña recuerda su propia pila y el Stack del Catálogo
seguía siendo `[index, libro]`.

En mi recorrido, el paso 5 ya dejó la pestaña Catálogo activa (mostrando el detalle). Tocarla otra
vez es tocar la pestaña activa, y el Stack hace `popToTop`: se ve **el Catálogo**.

Me parece correcto: es el comportamiento estándar de las apps (Instagram, la app del banco).
Cambiar de pestaña no hace perder dónde estabas, y tocar la pestaña en la que ya estás funciona como
"volver al inicio de la sección".

### C2. El escáner que dispara de más

**a)** `onBarcodeScanned` se llama en cada cuadro en que la cámara reconoce el código. Si adentro
llamara a `router.push` sin protección, cada llamado agregaría una acción a la **cola de acciones de
navegación** de Expo Router (`routingQueue`, FIFO). Esas acciones se procesan en orden de llegada,
así que se apilarían varias pantallas de detalle iguales. La persona tendría que tocar atrás muchas
veces, y la app haría trabajo de más montando pantallas.

**b)** Usé **`useRef`** (`src/app/(tabs)/(catalogo)/escanear.tsx:19`). Un `useState` puesto en
`true` no alcanza: el cambio de estado recién se ve en el **próximo render**. Los llamados de
`onBarcodeScanned` que llegan antes de ese render usan la función creada en el render anterior, cuya
clausura todavía ve `false`, así que todos pasan el `if`. En cambio, `yaNavego.current = true`
(línea 24) se escribe en el momento, sobre un objeto compartido entre renders, y el siguiente llamado
ya lo ve (línea 30).

**c)** Con `router.replace` (línea 26), el detalle **ocupa el lugar** del escáner en el Stack del
Catálogo (`[index, escanear]` → `[index, libro]`), y atrás lleva al Catálogo.

Con `push` quedaría `[index, escanear, libro]`. Al tocar atrás, la persona volvería a la cámara
abierta, sin haber pedido seguir escaneando; si el libro sigue frente a la cámara, parece que la app
"no la deja salir".

**d)** Si el ISBN no está en el catálogo, muestro un aviso **dentro de la pantalla** (no un `Alert`
que bloquee), con el código leído, y la cámara sigue escaneando (líneas 38 a 41). Para que no aparezca
diez veces, guardo en `ultimoDesconocido` (un `useRef`, línea 20) el último código desconocido. Si
el mismo código sigue frente a la cámara no hago nada; solo un código **distinto** genera un aviso
nuevo.

### C3. Deep links y rutas protegidas

En Expo Go: `exp://<IP>:8081/--/…`.

| Link | Qué ve la persona | Qué queda debajo en la pila | Qué parte de mi código lo decide |
| --- | --- | --- | --- |
| `bibliotecaipf://libro/9789871000012` | El detalle de "Ficciones" | El Catálogo (`index`) en el Stack de la pestaña, y `(tabs)` en el Stack raíz | `libro/[isbn].tsx` y `unstable_settings.anchor = 'index'` en `(catalogo)/_layout.tsx:9` |
| `bibliotecaipf://libro/123` | "Ese ISBN no es válido" y un link "Volver al Catálogo" | Igual que el anterior | `esIsbnValido(isbn)` en `libro/[isbn].tsx:17` |
| `bibliotecaipf://buscar?q=borges` | El buscador con "borges" escrito, "Buscando…" y después los tres libros de Borges | `(tabs)` con el Catálogo | `anchor: '(tabs)'` en `src/app/_layout.tsx:11` y `useLocalSearchParams` en `buscar.tsx:13` |
| `bibliotecaipf://mostrador` (sin sesión) | No se abre el mostrador: se ve la pantalla inicial (el Catálogo) | Nada más | `Stack.Protected guard={sesion}` en `navegacion-raiz.tsx:39`: con `guard` en `false`, la pantalla no está registrada |
| `bibliotecaipf://reserva` | Mis reservas | Las pestañas. `/reserva` no queda en el historial | `<Redirect href="/reservas" />` en `src/app/reserva.tsx:5` |
| `bibliotecaipf://escanear` (cámara bloqueada) | El escáner con "La cámara está desactivada", el botón "Cómo activarla" (lleva a "Abrir Ajustes") y el campo para escribir el ISBN | El Catálogo, por el anchor de la pestaña | `estadoDePermiso` (`src/lib/permisos.ts:18`: `canAskAgain` en `false` → `bloqueado`) y `zona-camara.tsx:51-56` |

**¿Por qué `/libro/123` llega a la pantalla de detalle?** Porque `[isbn]` es un **segmento
dinámico**: el router compara la forma de la URL (`/libro/<algo>`), no los datos. Cualquier valor
coincide, igual que `/libro/hola`. La responsabilidad de responder bien es **de la pantalla, es
decir, nuestra**: validar el formato (13 dígitos) y que el libro exista, y mostrar un mensaje claro
con una salida (`libro/[isbn].tsx:17-44`).

### C4. Foco, montaje y primer plano

**a) Qué evento detecta cada una**
- `useEffect` con `[]`: el **montaje** del componente (una sola vez, cuando aparece por primera vez).
- `useFocusEffect`: cada vez que la pantalla **gana el foco de navegación** (cambiar de pestaña,
  volver de una pantalla apilada, cerrar un modal). Su limpieza corre al perder el foco.
- `AppState`: los cambios de la **app entera** entre primer plano y segundo plano (`active`,
  `inactive`, `background`); por ejemplo, salir a Ajustes y volver.

**b)**
- Ir a Ajustes, habilitar y volver: se entera **`AppState`** (de `background` a `active`). Ni
  `useFocusEffect` ni `useEffect([])`, porque dentro de la app la pantalla nunca perdió el foco ni se
  desmontó.
- Ir a la pestaña Catálogo y volver a Mis reservas: se entera **`useFocusEffect`**. `AppState` no
  (la app nunca salió del primer plano) y `useEffect([])` tampoco (la pestaña sigue montada).

**c)** Usé **las dos** dentro de `usePermiso` (`src/hooks/usePermiso.ts:32-33`), además de la
consulta inicial que hace el hook de Expo al montar:
- `useAlVolverAlFrente` (`AppState`) cubre la vuelta desde Ajustes.
- `useFocusEffect` cubre cuando el permiso cambió desde **otra pantalla de la app**. Por ejemplo, el
  modal `/permisos/notificaciones` pide el permiso con su propia instancia del hook. Cuando se cierra
  el modal, Mis reservas gana el foco y vuelve a consultar.

Si hubiera usado solo `AppState`, Mis reservas seguiría mostrando "las notificaciones están
desactivadas" después de habilitarlas desde el modal, hasta salir y volver a la app.

---

## Parte D · Permisos en mi app

### D1. Recorrido completo de la cámara (Android 14, app recién instalada)

| # | Acción | Qué muestra mi app | `status` | `canAskAgain` |
| --- | --- | --- | --- | --- |
| 1 | Toca "Escanear" por primera vez | El escáner con "Escaneá el código del libro", el botón "Usar la cámara" y el campo para escribir el ISBN. Al tocar "Usar la cámara" se abre `/permisos/camara`, con el beneficio y "Continuar" | `undetermined` | `true` |
| 2 | "Continuar" → "No permitir" | Se cierra el modal y el escáner vuelve a mostrar la explicación con "Usar la cámara" (sigue siendo `preguntable`) y el campo del ISBN | `denied` | `true` |
| 3 | Toca "Escanear" otra vez | Lo mismo: explicación y "Usar la cámara" → `/permisos/camara` con "Continuar" | `denied` | `true` |
| 4 | "Continuar" → "No permitir" | Segundo rechazo: Android lo toma como "no volver a preguntar". El escáner muestra "La cámara está desactivada" con "Cómo activarla" y el campo del ISBN | `denied` | `false` |
| 5 | Toca "Escanear" otra vez | Se ve "La cámara está desactivada". Al tocar "Cómo activarla", `/permisos/camara` muestra el texto de bloqueo y **"Abrir Ajustes"**, sin "Continuar" | `denied` | `false` |
| 6 | "Abrir Ajustes" → habilita → vuelve | Al volver, `AppState` pasa a `active` y se consulta otra vez: el modal muestra "¡Listo! El permiso está activado" con "Volver". El escáner, al recuperar el foco, muestra la cámara | `granted` | `true` |

**a) En iOS** el resultado cambia en el **paso 2**. iOS pregunta una sola vez: con el primer "No
permitir" queda `denied` con `canAskAgain: false`. Al volver, mi app ya muestra "La cámara está
desactivada", y en el paso 3 el modal ofrece directamente "Abrir Ajustes". El paso 4 no existe
(no hay otro diálogo). El paso 6 es igual: al volver de Ajustes, `AppState` dispara la consulta.

**b) La línea que decide** (`src/app/permisos/[recurso].tsx:91-92`):

```tsx
{bloqueado ? (
  <Boton titulo="Abrir Ajustes" icono="settings" onPress={() => Linking.openSettings()} />
) : (
  <Boton titulo="Continuar" deshabilitado={pidiendo} onPress={continuar} />
)}
```

`bloqueado` sale de `estadoDePermiso`, que usa el campo **`canAskAgain`** (`src/lib/permisos.ts:18`):
`return respuesta.canAskAgain ? 'preguntable' : 'bloqueado';`.

`status` no alcanza porque vale `'denied'` en los dos casos: cuando el sistema todavía puede mostrar
el diálogo y cuando ya no. Si se pidiera con `canAskAgain: false`, `request…()` volvería al instante
como `denied`, sin mostrar nada, y el botón "Continuar" no haría nada.

**c)** Se entera `useAlVolverAlFrente` (`src/hooks/useAlVolverAlFrente.ts:9-16`), usado por
`usePermiso` (`src/hooks/usePermiso.ts:32`): escucha `AppState` y llama a `consultar` cuando la app
vuelve a `active`.

Sin esa parte, al volver de Ajustes la app seguiría mostrando "Abrir Ajustes" con el permiso ya
habilitado. La persona creería que no funcionó y tendría que cerrar el modal y volver a entrar para
que `useFocusEffect` actualice el estado.

### D2. Notificaciones y consistencia

**a)** Si no cancelara la notificación, a los 15 segundos llegaría "Devolvé tu libro… Se acerca la
fecha de devolución" de un libro que **ya devolvió**. Es información falsa y confunde. Por eso
`devolver` cancela el recordatorio con su identificador antes de olvidarlo
(`BibliotecaContext.tsx:122-130`).

**b)** El identificador se guarda en el **Context, en memoria**, dentro del préstamo
(`recordatorioId`, línea 142).

Si la app se cierra antes de que llegue:
- **La notificación igual llega**, porque la programó el sistema operativo y no depende de que la
  app esté abierta.
- **El identificador se pierde**, junto con todos los préstamos, porque el estado de React vive en
  memoria.

Problema: al volver a abrir, la app no tiene ese préstamo ni forma de cancelar el aviso. Si la
persona "devuelve" algo o apaga el interruptor, el recordatorio huérfano sigue programado.

Lo resolvería así:
1. Guardar préstamos e identificadores con `AsyncStorage` (el almacenamiento persistente de la app)
   y cargarlos al iniciar.
2. Además, al arrancar, conciliar: recorrer `getAllScheduledNotificationsAsync()` y cancelar las
   notificaciones que no correspondan a ningún préstamo guardado. Para eso conviene poner el ISBN en
   `content.data` de cada notificación.

**c)** En Android 13 o superior las notificaciones son el permiso de tiempo de ejecución
`POST_NOTIFICATIONS`. Según la documentación de Expo, el sistema **no muestra el diálogo hasta que
la app tiene al menos un canal**. Si se pide antes, el pedido puede volver denegado sin que la
persona haya visto nada. Por eso `pedirPermisoNotificaciones` llama primero a `crearCanalPrestamos`
(`src/lib/notificaciones.ts:19-26` y `:33-38`). El canal también define la importancia y el nombre
("Préstamos") que la persona ve en Ajustes.

En **Android 12** no existe el permiso de tiempo de ejecución: las notificaciones vienen habilitadas
y `requestPermissionsAsync()` responde `granted` sin mostrar ningún diálogo. El canal sigue siendo
necesario (desde Android 8 toda notificación sale por un canal), pero no condiciona el permiso.

**d)** Si el permiso está denegado, me entero por un **aviso dentro de la app**, en Mis reservas,
que además muestra un número en la pestaña. El código que decide está en `entregarAlSiguiente`
(`BibliotecaContext.tsx:192-196`):

```ts
const titulo = obtenerLibroPorIsbn(isbn)?.titulo ?? 'tu libro';
if (await notificacionesPermitidas()) {
  await avisarEntrega(titulo);
} else {
  agregarAviso(`¡Ya podés retirar "${titulo}"! Te lo prestamos por ${DIAS_PRESTAMO} días.`);
}
```

`notificacionesPermitidas` (`src/lib/notificaciones.ts:41-44`) **consulta el permiso en ese
momento** con `getPermissionsAsync()`; no usa un valor guardado. Importa porque la persona puede
cambiarlo en Ajustes cuando quiera. Con un valor viejo, si lo desactivó la app intentaría notificar
y el aviso se perdería; si lo activó, la app no usaría la notificación que la persona sí quiere.

### D3. Lo que mi app pide y lo que no

| Plataforma | Permiso o clave declarada | Función de la app que lo justifica | ¿Quién lo agrega? |
| --- | --- | --- | --- |
| Android | `android.permission.CAMERA` | Escanear el código de barras del libro | El plugin y el manifiesto de `expo-camera` |
| Android | `android.permission.POST_NOTIFICATIONS` | Recordatorio de devolución y aviso de entrega | El manifiesto de `expo-notifications` |
| Android | `android.permission.RECEIVE_BOOT_COMPLETED` | Que los recordatorios programados sobrevivan a un reinicio del teléfono | El manifiesto de `expo-notifications` |
| Android | `android.permission.INTERNET` | Conexión con el servidor de desarrollo y, en el futuro, con la API real | La plantilla de Expo (permiso normal, sin diálogo) |
| iOS | `NSCameraUsageDescription` = "Usamos tu cámara para leer el código de barras del libro y abrir su ficha al instante." | Escáner | El plugin `expo-camera` (`cameraPermission` en `app.json`) |
| iOS | (sin clave) Notificaciones | Recordatorio y aviso de entrega | No llevan texto en el Info.plist: se piden con `requestPermissionsAsync` |

**a)** `expo-camera` agrega `RECORD_AUDIO` por defecto (para grabar video con sonido), pero mi app
solo lee códigos. Lo evito de dos formas: `recordAudioAndroid: false` en el plugin (no lo agrega)
y, por si alguna librería lo sumara, `RECORD_AUDIO` en `blockedPermissions`, que genera
`tools:node="remove"`. `microphonePermission: false` hace lo mismo en iOS con
`NSMicrophoneUsageDescription`.

```json
["expo-camera", {
  "cameraPermission": "Usamos tu cámara para leer el código de barras del libro y abrir su ficha al instante.",
  "microphonePermission": false,
  "recordAudioAndroid": false
}]
```

```json
"android": {
  "blockedPermissions": ["android.permission.RECORD_AUDIO", "…"]
}
```

**b)** Usaría `expo-image-picker` con `launchImageLibraryAsync()`. Abre el **selector del sistema**:
la persona elige la foto y la app recibe solo esa imagen, **sin pedir permiso de galería** ni en
Android (Photo Picker) ni en iOS (PHPicker). En el plugin pondría `cameraPermission: false` y
`microphonePermission: false`, porque solo elegimos de la galería.

**No alcanza con una actualización OTA** (*over the air*: un cambio de JavaScript que se descarga sin
pasar por la tienda). `expo-image-picker` trae código nativo que hoy no está en el binario
instalado, y su plugin modifica el manifiesto y el Info.plist. Hace falta **una build nueva** y
pasar otra vez por la tienda.

**c)** No pude verificar en Expo Go:
- **El texto de propósito de la cámara.** Expo Go es una app ya compilada con su propio Info.plist:
  el diálogo muestra el texto de Expo Go, no el mío.
- **`blockedPermissions` y el manifiesto final.** Expo Go tiene su propio AndroidManifest, con
  muchos más permisos.
- **El canal "prestamos" de Android.** Probé en iPhone, así que la parte de Android quedó sin
  probar en un dispositivo.
- **El nombre de la app en los diálogos** (dice "Expo Go").

Cómo los verificaría:
- Con `npx expo prebuild --clean`, revisando el `AndroidManifest.xml` y el `Info.plist` generados.
- Con una development build (`eas build --profile development` o `npx expo run:ios|android`), donde
  se ven mis textos y solo los permisos declarados.
- Para el canal, en un Android 13 o superior: Ajustes → Apps → Biblioteca IPF → Notificaciones.

---

## Parte E · Buenas prácticas y decisiones de diseño

### E1. Revisión de código

**a) Problemas encontrados**

| # | Línea | Tipo | Por qué sucede | Cómo lo corregiría |
| --- | --- | --- | --- | --- |
| 1 | 10 (y 22) | Mala práctica | `any` desactiva TypeScript: un error de tipeo en `libro.titulo` no se detecta | `useState<Libro[]>([])` y `{ libro: Libro }` |
| 2 | 13-16 | Mala práctica (UX y tiendas) | Pide cámara y notificaciones al abrir, sin contexto, antes de que la persona sepa para qué. Entrena el "No permitir" y Apple lo rechaza (5.1.1) | Pedir cada permiso al usar la función, con pantalla previa (`/permisos/[recurso]`) |
| 3 | 16 | Advertencia | Falta `pedirPermiso` en el array de dependencias (`react-hooks/exhaustive-deps`) | Se va al quitar ese efecto (punto 2) |
| 4 | 15 | Error de ejecución en Android 13+ | Pide notificaciones sin crear antes un canal: el diálogo no aparece. Además la promesa no se espera ni se maneja | Crear el canal y después pedir, desde la acción "Recordarme" |
| 5 | 18-20 | Rendimiento (bucle) | El efecto no tiene array de dependencias: corre después de **cada** render, y `setLibros` provoca otro render | `[]` o un contador `intento`, como en `useLibros` |
| 6 | 19 | Error de ejecución | Sin `catch`: `obtenerLibros()` falla 1 de cada 5 veces y queda una promesa rechazada sin manejar. Tampoco hay estados de carga, error ni vacío | `try/catch` con `error` y un botón "Reintentar" |
| 7 | 19 | Advertencia | Sin limpieza: si la pantalla se desmonta o llega una respuesta vieja, igual se hace `setLibros` | Bandera `vigente` en la limpieza |
| 8 | 22-30 | Rendimiento y mala práctica | `Fila` se declara **dentro** de `Catalogo`: en cada render es un componente distinto y React desmonta y monta todas las filas | Declararla a nivel de módulo, en su propio archivo (`FilaLibro`) |
| 9 | 24 | Mala práctica | La ruta se arma concatenando texto: no la controlan las rutas tipadas y es fácil romperla | `router.push({ pathname: '/libro/[isbn]', params: { isbn } })` |
| 10 | 25 | Mala práctica | Estilos en línea con colores y tamaños sueltos | `StyleSheet.create` con valores de `tema.ts` |
| 11 | 33-36 | Rendimiento | `ScrollView` + `map` renderiza todos los elementos de una vez | `FlatList` (virtualiza) con `ListEmptyComponent` |
| 12 | 35 | Advertencia y mala práctica | `key={i}`: si la lista cambia de orden, React confunde las filas | `keyExtractor={(l) => l.isbn}` |
| 13 | 24 y 37-39 | Accesibilidad | `Pressable` sin `accessibilityRole="button"`. El botón de la cámara es solo un ícono, sin `accessibilityLabel`, y mide 28 px (menos de 44 × 44) | Rol, etiqueta ("Escanear") y área táctil de 44 × 44 |
| 14 | 11 | Advertencia (lint) | `permiso` se declara y no se usa | Quitarlo junto con el pedido al abrir |

**b) El efecto sin array de dependencias, paso a paso**

1. Primer render: `libros = []`. Corre el efecto y pide el catálogo.
2. A los 800 ms llega un array **nuevo** (la API devuelve copias). `setLibros` lo guarda y, como la
   referencia es distinta, React re-renderiza.
3. Después de ese render el efecto vuelve a correr (no tiene dependencias) y pide de nuevo.
4. Se repite cada ~0,8 s, **para siempre**: unos 75 pedidos y 75 renders en el primer minuto.
   Además, cerca de 15 de esos pedidos fallan y quedan como promesas rechazadas sin manejar. La
   lista parpadea y la app consume batería y datos sin parar.

**Si `obtenerLibros()` devolviera siempre el mismo array**, el bucle se cortaría: el primer
`setLibros` cambia de `[]` al array (re-render y otro pedido). El segundo `setLibros` recibe la
**misma referencia**; React compara con `Object.is`, ve que no cambió y no re-renderiza, así que el
efecto no vuelve a correr. Quedarían 2 pedidos. El problema sigue existiendo, solo queda oculto.

**c) La pantalla reescrita con mis hooks, componentes y constantes**

```tsx
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

export default function Catalogo() {
  const { libros, cargando, error, reintentar } = useLibros();
  const { recientes } = useBiblioteca();
  const librosRecientes = recientes.map((isbn) => obtenerLibroPorIsbn(isbn)).filter(esLibro);

  return (
    <FlatList
      style={styles.lista}
      contentContainerStyle={styles.contenido}
      data={cargando || error ? [] : libros}
      keyExtractor={(libro) => libro.isbn}
      renderItem={({ item }) => <FilaLibro libro={item} onPress={() => abrirLibro(item.isbn)} />}
      ListHeaderComponent={<EncabezadoCatalogo recientes={librosRecientes} onAbrirLibro={abrirLibro} />}
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
  lista: { flex: 1, backgroundColor: colores.fondo },
  contenido: { padding: espacios.l, gap: espacios.s },
});
```

Es la misma pantalla que entregué (`src/app/(tabs)/(catalogo)/index.tsx`). El botón de escanear
pasa a `EncabezadoCatalogo`, como `Boton` con texto y rol. La cámara no se pide al abrir: se pide
en `/escanear`, después de `/permisos/camara`.

**d)**
- **Rechazo en la tienda:** pedir la cámara y las notificaciones **al abrir** (líneas 13 a 16), sin
  que la persona haya usado ninguna función que las necesite. La pauta 5.1.1 de Apple exige que el
  pedido tenga un propósito claro y no fuerce a aceptar. Una app que arranca pidiendo la cámara sin
  explicar para qué es motivo típico de rechazo en la revisión.
- **Desinstalación:** el **bucle de pedidos** de las líneas 18 a 20. La lista parpadea, el teléfono
  se calienta y consume datos y batería sin que la persona haga nada. Junto con la cascada de
  diálogos al abrir, es la primera impresión, y una mala primera impresión es la causa más común de
  desinstalación.

### E2. Organización y acoplamiento

**a) Qué carpetas importan a cuáles** (lo revisé con `grep` sobre los `import`):

```text
app          → components, hooks, context, lib, constants, types
components   → components, context, lib, constants, types
hooks        → hooks, lib, constants, types
context      → estructuras, lib, constants, types
lib          → data, estructuras, constants, types
data         → types
constants    → types
estructuras  → (nada)
types        → (nada)
```

**No hay importaciones "hacia arriba"**: ningún archivo importa de `src/app`. Las dependencias van
de lo más específico (pantallas) a lo más general (tipos y estructuras). Si un hook importara algo
de `src/app` sería un problema por tres motivos:
1. Cada archivo de `src/app` es una ruta: importarlo ejecuta y acopla una pantalla a la lógica.
2. Se pueden formar ciclos de importación.
3. Mover o renombrar una pantalla (que cambia la URL) rompería código que no tiene nada que ver con
   la navegación.

**b) Si el catálogo viniera de una API real** cambiarían:
- `src/lib/api.ts` (pedidos con `fetch`);
- `src/lib/catalogo.ts`, porque `obtenerLibroPorIsbn` hoy es **sincrónica** y lee `src/data/libros.ts`;
- todas las pantallas que la usan de forma sincrónica (detalle, reservar, escáner, `IngresoIsbn`,
  Mis reservas, mostrador y los recientes del Catálogo), porque tendrían que manejar "cargando" y
  "error";
- `src/data/libros.ts`, que dejaría de usarse.

Son más de dos archivos. Eso me dice que el **acceso a los datos de un libro está repartido** y
depende de que los datos estén en memoria. Lo mejoraría con un hook `useLibro(isbn)` (con sus
estados) o con un caché del catálogo en el Context, cargado una vez. Así un cambio de origen de
datos tocaría solo `api.ts` y ese hook.

**c) `<ConPermiso recurso="camara">`**
- **Ganaría:** menos código repetido en cada pantalla y la misma interfaz para todos los permisos.
  Si el permiso falta, se muestra la explicación en lugar de los hijos.
- **Perdería:** flexibilidad. En el escáner, la parte del ISBN escrito a mano tiene que funcionar
  **sin** permiso, y el componente envolvería todo o nada. Además el pedido quedaría atado a
  **renderizar** la pantalla (se pediría al abrir), y la pantalla previa dejaría de ser una ruta
  propia (`/permisos/camara`) a la que se puede llegar con un link.
- **Para las notificaciones no sirve.** Se piden como reacción a una **acción** (activar
  "Recordarme"), no al mostrar algo. Ahí hace falta una función imperativa (`pedir()`) y el estado
  para decidir. Eso es lo que da `usePermiso`, que sirve para los dos casos.

### E3. Mapa de fallas

| Situación | Qué ve la persona | Dónde se maneja |
| --- | --- | --- |
| `obtenerLibros()` falla | "Algo salió mal" con un mensaje claro y un botón **Reintentar** | `src/hooks/useLibros.ts:33-36`, `src/components/estado-lista.tsx:19-25`, `src/app/(tabs)/(catalogo)/index.tsx:36-44` |
| Se abre `/libro/abc` | "Ese ISBN no es válido: tiene que tener 13 números" y el link **Volver al Catálogo** | `src/app/(tabs)/(catalogo)/libro/[isbn].tsx:17-44` |
| Se escanea un ISBN que no está en el catálogo | Un aviso en la pantalla con el código leído; la cámara sigue escaneando y el aviso no se repite | `src/app/(tabs)/(catalogo)/escanear.tsx:38-41` |
| La cámara está bloqueada | "La cámara está desactivada", el botón **Cómo activarla** (lleva a **Abrir Ajustes**) y el campo para escribir el ISBN | `src/components/zona-camara.tsx:51-56`, `src/app/permisos/[recurso].tsx:91-92`, `src/components/ingreso-isbn.tsx` |
| Las notificaciones están denegadas | En Mis reservas: "Las notificaciones están desactivadas: los avisos de la biblioteca van a aparecer acá", y los avisos dentro de la app | `src/app/(tabs)/reservas.tsx:82-86`, `src/app/permisos/[recurso].tsx:50`, `src/context/BibliotecaContext.tsx:192-196` |
| Se intenta reservar un libro ya reservado | "Ya reservaste este libro… No se puede reservar dos veces", con **Ver mis reservas** y **Cerrar** | `src/app/reservar/[isbn].tsx:34-45`, `src/context/BibliotecaContext.tsx:99-101` |
| "Entregar al siguiente" con la lista vacía | El libro deja de aparecer en el mostrador (solo se listan colas con personas). Si no queda ninguno: "No hay libros con lista de espera". Si se llegara a llamar con la cola vacía, devuelve `null` y se muestra "ya no tiene personas esperando" | `src/context/BibliotecaContext.tsx:174-176`, `src/app/mostrador.tsx:36-37` |
| Login con clave incorrecta | "El usuario o la clave no son correctos. Revisalos e intentá de nuevo." El modal sigue abierto | `src/app/login.tsx:21-22` |

### E4. Decisiones con argumentos

**a) Identificador: ISBN.** Lo uso como parámetro de ruta y como `key`:
- Es el dato que trae el mundo real: el escáner lee el EAN-13 de la contratapa y con eso abro
  `/libro/<isbn>` sin traducir nada.
- El deep link es legible y estable.
- `useLocalSearchParams` siempre devuelve **texto** (lo vimos en el E1 del TP 2), y el ISBN lo
  trato como texto desde el tipo (`isbn: string`). Un id numérico propio obligaría a hacer
  `Number(id)` en cada pantalla y es fácil olvidarlo. Un ISBN como número además perdería los ceros
  iniciales y no entra en un entero seguro.
- **Dos ediciones del mismo título** tienen ISBN distinto, y está bien: son ejemplares distintos
  (otro año, otra paginación).
- **Libros sin ISBN** (donaciones o ediciones viejas): asignaría un código interno de 13 dígitos (un
  EAN de uso interno, con prefijo 200 a 299) e imprimiría una etiqueta con su código de barras. Así
  siguen siendo escaneables y no cambia el modelo.

**b) Estructuras: clase `Pila` con `#items`.** La clase me dio:
- **encapsulamiento** (desde afuera no se puede tocar el medio ni "colarse" en la fila);
- un vocabulario claro (`push`, `tope`, `encolar`, `desencolar`);
- en la `Cola`, un `desencolar` O(1) sin `shift()`.

Al combinarla con React me complicó que **es mutable**: tuve que copiarla en cada cambio
(`new Cola(cola.aArray())`, B3.c) y nunca mutar la instancia que está en el estado. Con un array y
`[...pila, x]` / `slice`, la inmutabilidad sale "gratis" y React lo entiende directo, pero cualquiera
puede hacer `pila[0]` o `splice` y romper la regla LIFO. Me quedo con la clase por lo que garantiza,
aceptando ese costo, que es chico.

**c) Memorización.** Uso `useMemo` y `useCallback` en el Context:
- **Donde aportan:** el `value` (`BibliotecaContext.tsx:218`). Sin `useMemo`, cada render del
  Provider crearía un objeto nuevo y **todos** los consumidores se re-renderizarían aunque nada haya
  cambiado. Las funciones con `useCallback` (por ejemplo `registrarVisto`, línea 61) son estables y
  por eso puedo ponerlas en el array de dependencias del `useEffect` del detalle
  (`libro/[isbn].tsx:26`) sin que se dispare en cada render.
- **Donde serían ruido:** `cerrarSesion = useCallback(() => setSesion(false), [])` (línea 211) por
  sí sola no ahorra nada; solo importa porque forma parte del `value`. Lo mismo pasaría en un
  `useCallback` de un `onPress` de un botón simple. Además, el proyecto tiene activado el **React
  Compiler** (`"reactCompiler": true` en `app.json`), que memoriza automáticamente: buena parte de
  la memorización manual es redundante.
- **Cómo comprobarlo:** con el **Profiler de React DevTools** (abriendo las DevTools desde el menú
  de desarrollo de Expo con `j`), grabando una interacción (por ejemplo, activar "Recordarme") y
  viendo qué componentes se renderizan y cuánto tardan, con y sin la memorización.

**d) Datos duplicados.** Los ejemplares disponibles **se calculan**, no se guardan:
`libro.ejemplares - préstamos que salieron del estante` (`BibliotecaContext.tsx:72-77`).

Si estuvieran guardados en el estado y además existieran los préstamos, el mismo hecho viviría en
dos lugares. Bastaría con olvidarse de actualizar uno (por ejemplo, en `devolver`) para que el
detalle diga "1 disponible" mientras el préstamo sigue activo, o al revés.

Al derivarlo de una sola fuente (la lista de préstamos), cualquier cambio en los préstamos se
refleja solo en el número. Los préstamos que vienen del mostrador tienen `origen: 'mostrador'` y no
se descuentan, porque ese ejemplar es uno que otra persona devolvió.
