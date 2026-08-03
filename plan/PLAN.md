# Plan de implementación — Wiki servidor ARK

## Stack definido

| Capa | Elección |
|---|---|
| Framework | **Next.js 15 (App Router)** — un solo proyecto, un solo servicio |
| CMS | **Payload 3** montado dentro de la misma app de Next |
| Base de datos | **Postgres** administrado en Railway |
| Imágenes | **Cloudflare R2** vía `@payloadcms/storage-s3` |
| Estilos | **Tailwind CSS v4** |
| Componentes | **shadcn/ui** (copy-paste, adaptados a los tokens del proyecto) |
| Acceso a datos | **Local API** de Payload (`getPayload`), no fetch a la propia API |

Payload 3 vive *dentro* de Next.js: el panel de admin son rutas reales
(`app/(payload)/admin/[[...segments]]/page.tsx`). Por eso no hay separación entre
CMS y frontend, y por eso puedes consultar la base de datos directo desde tus
Server Components sin salto HTTP.

**Modelo de usuarios:** todos los usuarios del panel son administradores. No hay
roles ni permisos diferenciados; el único límite que importa es autenticado vs. público.

---

## Fase 0 — Base técnica

- [x] Scaffold del proyecto — template **blank** (no website), Payload 3.87.0 + Next 16.2.12
- [x] Pegar `payload.config.ts`, `collections/`, `access/` y `hooks/` en `src/`
- [x] Instalar Tailwind v4 (`tailwindcss` + `@tailwindcss/postcss` + `postcss`)
- [x] Inicializar shadcn (`components.json`, `cn()`, puente de variables, `--radius: 0`)
- [x] Base de datos conectada — Postgres 18 **local** por ahora; Railway se pospone al deploy (Fase 8)
- [x] Crear bucket en R2 + API token, llenar las 4 variables de entorno
- [x] Crear el usuario admin en `/admin` — el deploy queda para la Fase 8

**Criterio de salida: CUMPLIDO.** Se subió una imagen desde el admin y aparecieron
4 objetos en el bucket (original + `thumbnail` 400x300 + `card` 768x432 + `og` 1200x630).
Payload los sirve de vuelta por `/api/media/file/<archivo>` con 200 y los bytes
coinciden exactamente con los del bucket.

Como no se activó `disablePayloadAccessControl`, el plugin registra su propio
`staticHandler`: las imágenes las sirve Payload y **el bucket puede quedarse privado**.
No hace falta el dominio r2.dev ni un dominio propio hasta la Fase 8, donde conviene
para que Cloudflare las cachee en vez de que cada petición pase por el servidor.

### Desviaciones respecto a lo planeado (Fase 0)

Todo verificado el 2026-08-03 contra el registry, no contra la memoria del plan:

- **Gestor de paquetes: bun**, no npm. Todos los comandos son `bun` / `bunx`.
- **Next 16.2.12, no 15.** El peer de `@payloadcms/next@3.87.0` es
  `>=15.2.9 <15.3.0 || >=15.3.9 <15.4.0 || >=15.4.11 <15.5.0 || >=16.2.6 <17.0.0`.
  Next 16 es el carril soportado y el que usa el template oficial.
- **Template `blank`, no `website`.** El website arrastra Pages, form-builder,
  redirects, nested-docs y un frontend propio que pelea con este diseño.
  A cambio, hay que cablear a mano el preview, ISR y revalidate de la Fase 3.
- **`create-payload-app` no se pudo usar**: exige TTY (`uv_tty_init returned EBADF`).
  El template se bajó con `giget` desde `gh:payloadcms/payload/templates/blank` y se
  reemplazaron las deps `workspace:*` por las versiones publicadas.
- **shadcn se configuró a mano.** Su CLI nuevo usa presets (`base-nova`) que
  reescriben `globals.css` con su propio tema.
- **Dos correcciones al template oficial**, que viene de `main` y va por delante de 3.87:
  `generatePayloadViewport` no existe en `@payloadcms/next/layouts@3.87`, y
  `access.admin` exige devolver `boolean`, así que no acepta el tipo `Access`
  (que puede devolver un `Where`).

- **`admin.suppressHydrationWarning: true`.** Payload inyecta
  `<style>@layer payload-default, payload;</style>` en el `<head>` del panel y ese nodo
  sale distinto en SSR que en cliente. Es interno de Payload/Next, no de nuestro código;
  la propia config expone la bandera para el caso y solo afecta a las rutas del admin.
  Silencia el aviso, no elimina la diferencia.

**Estado verificado:** `tsc --noEmit` y `eslint` en verde; `/` responde 200 con los
tokens, la utilidad `.panel` y el puente de shadcn compilados; `/admin` responde 200
contra Postgres local, con el primer usuario creado.

**El gotcha del preflight quedó comprobado:** `/admin` carga un solo CSS (768 KB, los
estilos propios de Payload — tiene `--theme-elevation`) sin `polygon()`, sin
`--color-obsidian`, sin `feTurbulence` y sin el reset de Tailwind. La opción A del plan
funciona.

**Accesos: verificados (ver Fase 2.1).**

**Pendiente antes de producción:** `WARN: No email adapter provided` — sin adapter, el
correo de recuperar contraseña se imprime en consola y nadie podría recuperar su cuenta.

### ⚠️ Gotcha crítico: Tailwind rompe el admin de Payload

El *preflight* de Tailwind (su reset de estilos base) se filtra a las rutas del admin
de Payload y le desarma el layout. Es el error más común al combinar estos dos.

Dos formas de resolverlo, elige una:

**A. Separar los CSS por route group** (recomendado)
Payload ya organiza las rutas en `app/(payload)/` y tu sitio en `app/(frontend)/`.
Cada route group tiene su propio `layout.tsx`, así que importa tu `globals.css`
con Tailwind **solo** en `app/(frontend)/layout.tsx`, nunca en un layout raíz compartido.

**B. Desactivar preflight y usar un prefijo**
Más frágil y te obliga a escribir `tw-` en cada clase. Solo si la opción A no te alcanza.

Verifica que funcionó abriendo `/admin` después de configurar Tailwind. Si los
campos del admin se ven desalineados, el CSS se está filtrando.

---

## Fase 1 — Cerrar el modelo de contenido

Lo que ya tienes cubre el 80%. Faltan estas piezas:

### Global `ServerInfo`
Un *global* (un solo registro, no colección) para todo lo del landing que quieres
cambiar sin tocar código:

| Campo | Tipo | Para qué |
|---|---|---|
| `serverName` | text | Wordmark y `<title>` |
| `tagline` | text | Titular del héroe |
| `description` | textarea | Párrafo del héroe |
| `ip` | text | La lectura de HUD del héroe |
| `discordUrl` | text | CTA principal |
| `mapCount` / `modCount` | number | Eyebrow del héroe |
| `rates` | array (`label`, `value`) | La tira de rates, editable |

Ponle `admin: { group: 'Configuración' }` para que quede separado del contenido
en el menú lateral.

### Ajustes a `Categories`
- [x] `description` (text) — se muestra en la tarjeta del índice
- [x] `tier` (select: `basico` / `intermedio` / `avanzado` / `obligatorio`) — controla la franja de color
- [x] `order` (number) — para ordenar el índice a mano
- [x] `slug` con el hook `formatSlug('title')`, igual que en Posts
- [x] `admin: { group: 'Contenido' }`
- [x] Global `ServerInfo` creado en `src/globals/ServerInfo.ts` y registrado en la config

**Notas de la migración de esquema:**

- Las columnas nuevas se aplicaron solas al reiniciar el dev server, sin perder datos.
  La categoría que ya existía **sí recibió los valores por defecto** (`tier: 'basico'`,
  `order: 0`): Drizzle los puso como DEFAULT de columna, no solo como default de Payload,
  así que no quedaron nulos que rompieran el frontend.
- `slug` en `Categories` dejó de ser `required`: ahora lo genera `formatSlug` desde el
  nombre. Verificado con acentos y ñ — `Configuración del Servidor` →
  `configuracion-del-servidor`, `Diseño & Construcción ÑU` → `diseno-construccion-nu`.
- `defaultSort: 'order'` en la colección, para que el índice salga ordenado sin pedirlo.
- Los campos `tier`, `order` y `slug` van al sidebar, para que el nombre y la descripción
  se queden con el ancho completo.

**Criterio de salida:** creas un artículo de dino completo, con imágenes dentro del
rich text y su bloque de stats, sin tocar código.

---

## Fase 2 — Panel de administración

### 2.1 Accesos

Sin roles, el control de acceso es de dos estados y vive en `access/index.ts`:

| Colección | Lectura pública | Escritura |
|---|---|---|
| `posts` | Solo publicados | Autenticado |
| `categories` | Sí | Autenticado |
| `media` | Sí | Autenticado |
| `users` | **Nunca** | Autenticado |

- [x] `GET /api/users` sin sesión devuelve **403**, no la lista de usuarios
- [x] `GET /api/posts` sin sesión no devuelve borradores
- [x] Comprobado por HTTP directo, no desde el panel

**Cómo se verificó** (2026-08-03, con un artículo publicado y uno en borrador):

| Petición sin sesión | Resultado |
|---|---|
| `GET /api/users` | **403** |
| `GET /api/posts` | 200 — solo el publicado (la Local API con `overrideAccess` ve los 2) |
| `GET /api/posts/<id-del-borrador>` | **404** |
| `GET /api/posts/<id-del-borrador>?draft=true` | **404** — no se puede forzar |
| `GET /api/posts?where[slug][equals]=<slug-del-borrador>` | 200 con lista vacía |

El caso del ID directo importa más de lo que parece: con Postgres los IDs son enteros
secuenciales (el borrador era el `2`), así que son triviales de adivinar. Repetir esta
tabla si alguna vez se toca `publishedOrAuthenticated` en `access/index.ts`.

### 2.2 Protección del panel

- [ ] `maxLoginAttempts: 5` + `lockTime` ya configurados en `Users`
- [ ] `PAYLOAD_SECRET` largo y aleatorio, **nunca** en el repositorio
- [ ] `tokenExpiration` acotado (8 h en la config)
- [ ] Como todos los usuarios pueden borrar contenido, los **backups de Postgres importan más**: activarlos en Railway desde el inicio, no al final

### 2.3 Experiencia editorial

Lo que hace la diferencia entre un panel que la gente usa y uno que abandonan:

- [ ] **Slug automático** — el hook `formatSlug` lo genera desde el título y maneja acentos y ñ. El editor solo escribe el título.
- [ ] **Drafts con autosave** — ya configurado en `Posts`. Se guarda mientras escriben, sin publicar.
- [ ] **Panel en español** — `i18n` con `fallbackLanguage: 'es'`
- [ ] **Grupos en el menú** — `Contenido` (Posts, Categories, Media), `Configuración` (ServerInfo), `Administración` (Users). Sin esto el menú es una lista plana confusa.
- [ ] **Columnas útiles en la lista** — `defaultColumns` con `_status` visible
- [ ] **`description` en cada campo** — el texto de ayuda debajo del input. Es lo más barato que puedes hacer para que alguien no técnico no se atore.
- [ ] **Labels en español** — `labels: { singular, plural }` por colección
- [ ] **Campos en el sidebar** — slug y categoría van a `admin: { position: 'sidebar' }` para que el contenido tenga el ancho completo

### 2.4 Branding y vista previa

- [ ] Crear `components/admin/Logo.tsx` y `components/admin/Icon.tsx` y referenciarlos en `admin.components.graphics`
- [ ] Ruta `/wiki/preview` que lea el draft con `draft: true`
- [ ] `admin.preview` en `Posts` (ya está el esqueleto en el archivo)

**Criterio de salida:** creas un usuario, le pasas la contraseña a alguien de la
tribu, y esa persona puede escribir un artículo completo con imágenes sin
preguntarte nada.

---

## Fase 3 — Rutas

```
app/
├── (payload)/          ← no lo toques, lo genera Payload
│   └── admin/...
└── (frontend)/
    ├── layout.tsx      ← aquí y SOLO aquí importas globals.css
    ├── page.tsx                          /
    └── wiki/
        ├── page.tsx                      /wiki
        └── [categoria]/
            ├── page.tsx                  /wiki/mods
            └── [slug]/page.tsx           /wiki/mods/structures-plus
```

- [x] `generateStaticParams` + ISR para que las páginas sean estáticas y rápidas
- [x] Hook `afterChange` en Posts que dispare `revalidatePath` — al publicar, el sitio se actualiza solo
- [x] `not-found.tsx` con copy en la voz del sitio, no un 404 genérico
- [x] `generateMetadata` por artículo usando `excerpt` y el tamaño `og` de la imagen

**Lo que confirmó `next build`** (no solo el dev server):

```
○ /wiki                              1h   ← estática
● /wiki/[categoria]                  1h   ← SSG
  └ /wiki/categoria-test
● /wiki/[categoria]/[slug]           1h   ← SSG
  └ /wiki/categoria-test/lorem-ipsum
```

El artículo en borrador **no** se prerenderizó, y `/admin` y `/api` siguen dinámicos.

| Ruta | Estado |
|---|---|
| `/wiki`, `/wiki/categoria-test`, `.../lorem-ipsum` | 200 |
| `.../test1` (borrador) | **404** |
| `/wiki/no-existe`, `/wiki/categoria-test/no-existe` | **404** |

**Trampa que hay que recordar:** la Local API corre con `overrideAccess: true`, así que
**no** aplica `publishedOrAuthenticated`. Si una consulta de `posts` para el sitio público
olvida `_status: 'published'`, los borradores se publican solos. Por eso el filtro vive en
`src/lib/payload.ts` como `onlyPublished`, para usarlo siempre en vez de reescribirlo.

**`metadataBase`:** sin él, `next build` avisa que las imágenes de Open Graph se resuelven
contra `localhost:3000` y las previews al compartir salen rotas. Se resuelve con
`NEXT_PUBLIC_SERVER_URL`, que en Railway debe apuntar al dominio real con `https`.

**Imágenes:** la portada se muestra con `next/image` usando el tamaño `card` en el
artículo y `thumbnail` en el listado — nunca la original, que puede pesar 1 MB. Funciona
gracias a `images.localPatterns` en `next.config.ts`, que ya venía apuntando a
`/api/media/file/**`. Las imágenes *dentro* del rich text las resuelve el converter por
defecto de Payload, que genera un `<picture>` con un `<source>` por tamaño, pero con
`<img>` nativo en vez de `next/image`: eso se cambia en la Fase 5. Requiere `depth >= 1`
en la consulta, o el nodo llega como id y el converter lo ignora en silencio.

**Pendiente de verificar en vivo:** el hook de `revalidatePath` está implementado y
typecheckeado, pero no se ha comprobado publicando desde el panel y viendo la página
actualizarse sin esperar la hora del ISR.

**Criterio de salida:** navegas de landing → categoría → artículo con datos reales de la DB.

---

## Fase 4 — Sistema de diseño en Tailwind v4

Tailwind v4 se configura en CSS con `@theme`, ya no en `tailwind.config.js`:

```css
/* app/(frontend)/globals.css */
@import "tailwindcss";

@theme {
  --color-obsidian: #0B0E0D;
  --color-basalt:   #141A17;
  --color-basalt-2: #1B231E;
  --color-moss:     #2C3830;
  --color-element:  #57E0D2;
  --color-torch:    #E2913A;
  --color-bone:     #DDD6C6;
  --color-bone-dim: #8E8B7F;

  --font-display: "Big Shoulders Display", sans-serif;
  --font-body:    "Barlow", sans-serif;
  --font-hud:     "JetBrains Mono", monospace;

  --radius: 0rem;
}

@utility panel {
  clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px));
}
```

- [ ] Cargar las 3 fuentes con `next/font/google` (evita el flash de fuente sin estilo)
- [ ] Utilidad `.panel` — **es el elemento firma**, reutilízalo en tarjetas, dossier y la caja de IP
- [ ] Overlay de grano como pseudo-elemento fijo en el layout del frontend
- [ ] Piso de calidad: responsive a móvil, `focus-visible` visible, `prefers-reduced-motion` respetado

**Criterio de salida:** una página de prueba con un panel, un titular y un dato mono se ve igual que el mockup.

---

## Fase 5 — Componentes

### Cómo usar shadcn aquí

shadcn te copia el código fuente a `components/ui/` y **tú eres el dueño**. Eso es
justo lo que necesitas, porque el diseño pelea con los defaults de shadcn en dos puntos:

1. **Bordes redondeados.** El diseño usa esquinas *recortadas* (`clip-path`), no radios. Pon `--radius: 0rem` y quita `rounded-*` de los componentes que copies.
2. **Paleta neutral.** Remapea las variables de shadcn a tus colores en `globals.css` — menos trabajo que editar cada componente.

No instales toda la librería. Estos ganan su lugar:

| Componente | Para qué |
|---|---|
| `button` | Base del CTA ámbar y del botón "Copiar" |
| `badge` | Chips de tier y de categoría |
| `separator` | Divisores entre secciones |
| `sheet` | Menú de navegación en móvil |
| `breadcrumb` | Ruta en los artículos (`Wiki / Dinos / Rex alfa`) |
| `accordion` | Lista larga de mods, FAQ de reglas |
| `table` | IDs de mods, tabla de rates |
| `command` + `dialog` | Búsqueda tipo ⌘K (déjalo para la Fase 7) |
| `tooltip` | Explicar stats abreviados en el dossier |

**No uses `card`** — tu panel con esquina recortada es el elemento firma y merece
un componente propio, no un `Card` maquillado.

### Componentes propios

1. `<Panel>` — el wrapper con la esquina recortada
2. `<HudReadout>` — etiqueta mono + valor, con variante de botón copiar (client component)
3. `<CategoryCard>` — panel + franja de tier + conteo de artículos
4. `<RichText>` — el converter de Lexical a JSX (**el más importante**, ver abajo)
5. `<Dossier>` — bloque de stats con barras, alimentado por el array `stats`
6. `<PostCard>` — para los listados de categoría
7. `<Nav>` / `<Footer>`

### Sobre `<RichText>`

Es donde se van la mitad de los bugs de este tipo de proyecto. Payload devuelve un
JSON de Lexical, no HTML. Usa `RichText` de `@payloadcms/richtext-lexical/react`
con un objeto `converters` personalizado para:

- Mapear `h2`/`h3`/`h4` a tus clases de Tailwind (el `h1` queda para el título del artículo)
- Renderizar los nodos `upload` con `next/image` y el tamaño `card`, no la imagen full
- Estilizar `blockquote` con la regla vertical ámbar
- Añadir `target="_blank"` y `rel="noopener noreferrer"` a links externos

Ojo: Tailwind no estiliza HTML que no controlas. O escribes converters explícitos
(más trabajo, control total) o instalas `@tailwindcss/typography` con `prose prose-invert`.
Para este diseño te recomiendo converters explícitos: el plugin typography va a
pelear con tu escala tipográfica condensada.

**Criterio de salida:** un artículo con títulos, negritas, listas, cita, dos imágenes
y un link renderiza correctamente y sin CLS.

---

## Fase 6 — Landing

- [ ] Héroe: eyebrow con datos del global, titular, párrafo, caja de IP con copiar, CTA a Discord
- [ ] Tira de rates desde el array del global
- [ ] Índice de categorías (las mismas tarjetas que `/wiki`)
- [ ] Sección de últimos artículos publicados (4 más recientes)
- [ ] Footer con el disclaimer de sitio no oficial

**Criterio de salida:** un jugador nuevo copia la IP y entra al Discord en menos de 5 segundos.

---

## Fase 7 — Wiki

- [ ] `/wiki` con las categorías ordenadas por `order`
- [ ] `/wiki/[categoria]` con paginación (Payload la trae en la respuesta)
- [ ] `/wiki/[categoria]/[slug]` con el layout de dos columnas (prosa + dossier)
- [ ] Búsqueda: empieza con `command` de shadcn filtrando en cliente sobre los títulos ya cargados. Solo si crece, agrega `@payloadcms/plugin-search`
- [ ] Tabla de contenidos derivada de los headings (opcional, útil en guías largas)

**Criterio de salida:** encuentras cualquier artículo en dos clics desde el landing.

---

## Fase 8 — Pulido y producción

- [ ] Dominio propio en Railway + dominio público en R2 para las imágenes
- [ ] `next.config.js` con el dominio de R2 en `images.remotePatterns` (si no, `next/image` falla)
- [ ] `sitemap.ts` y `robots.ts`
- [ ] Repasar el checklist de accesos de la Fase 2.1 una última vez
- [ ] Backups automáticos de Postgres activados en Railway
- [ ] Lighthouse: apunta a >90 en performance; con ISR debería salir casi solo

---

## Advertencias

**Seguridad.** El modelo sin roles es una decisión válida para un equipo chico y de
confianza, pero cambia dónde está el riesgo: cualquiera con acceso al panel puede
borrar todo el contenido. Por eso los **backups de Postgres pasan de "buena
práctica" a requisito**, y conviene activarlos en la Fase 0, no al final. Los dos
límites que sí debes verificar por HTTP directo (no solo desde el panel, porque el
panel puede ocultar un botón mientras el endpoint sigue abierto) son que `users`
no tenga lectura pública y que los borradores de `posts` no se filtren. El
`PAYLOAD_SECRET` y las credenciales de R2 deben vivir solo en variables de entorno,
nunca en el repositorio.

**Sobre este plan.** Es una propuesta generada por IA, no una validación técnica.
El código de ejemplo y el mockup son referencia: no están auditados, ni probados
en todos los navegadores, ni revisados para producción. Todo debe pasar por tu
revisión y pruebas antes de desplegarse. Payload, Next.js y Tailwind cambian de
API entre versiones con frecuencia y mi información llega hasta mayo de 2026, así
que confirma cada patrón contra la documentación oficial vigente antes de
implementarlo. La decisión final y la validación técnica son tuyas.

**Sobre el juego.** ARK: Survival Ascended y sus marcas son propiedad de Studio
Wildcard. El diseño se inspira en el lenguaje visual del juego pero no usa sus
logos ni sus assets. Si publicas el sitio, incluye el disclaimer de sitio no
oficial y verifica los términos de uso de contenido de fans antes de subir arte
extraído del juego.
