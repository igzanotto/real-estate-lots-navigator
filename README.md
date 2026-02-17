# Explorador Inmobiliario

Aplicacion Next.js para navegacion interactiva de proyectos inmobiliarios (loteos y edificios) con SVGs clickeables y profundidad variable de exploracion.

## Stack

- **Next.js 16** (App Router, Server Components, Static Generation)
- **React 19** (Client Components para interactividad SVG)
- **TypeScript 5** (strict mode)
- **Tailwind CSS 4** (via PostCSS)
- **Supabase** (PostgreSQL + Storage para imagenes)

## Arquitectura

Esquema generico de 3 tablas (`projects`, `layers`, `media`) que soporta tanto loteos como edificios con hasta 4 niveles de exploracion:

```
Edificio (project)
  -> Torre A, Torre B (layers depth=0)
    -> Pisos 1-4 (layers depth=1)
      -> Unidades (layers depth=2, leaf)

Loteo (project)
  -> Zonas (layers depth=0)
    -> Manzanas (layers depth=1)
      -> Lotes (layers depth=2, leaf)
```

## Rutas

| Ruta | Descripcion |
|------|-------------|
| `/` | Listado de proyectos |
| `/p/[projectSlug]` | Vista raiz del proyecto (SVG interactivo) |
| `/p/[projectSlug]/[...layers]` | Exploracion por capas (profundidad variable) |

## Setup

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar Supabase

```bash
cp .env.local.example .env.local
# Editar .env.local con tus credenciales
```

### 3. Crear esquema de base de datos

Ejecutar [`SETUP_SCHEMA_V2.sql`](./SETUP_SCHEMA_V2.sql) en el SQL Editor de Supabase.

### 4. Poblar la base de datos

```bash
npm run db:seed
```

### 5. Iniciar servidor de desarrollo

```bash
npm run dev
```

Ver [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md) para la guia completa.

## Estructura del Proyecto

```
app/
  layout.tsx                              Root layout (lang="es")
  page.tsx                                Listado de proyectos
  error.tsx                               Error boundary
  not-found.tsx                           Pagina 404
  p/[projectSlug]/
    page.tsx                              Vista raiz del proyecto
    [...layers]/
      page.tsx                            Exploracion por capas

components/
  svg/InteractiveSVG.tsx                  Carga SVG, agrega interactividad via DOM
  views/ExplorerView.tsx                  Vista de exploracion generica
  views/UnitPage.tsx                      Vista de unidad/lote con galeria
  navigation/Breadcrumb.tsx               Navegacion breadcrumb
  navigation/SiblingNavigator.tsx         Navegador entre capas hermanas

lib/
  constants/status.ts                     Constantes de estado compartidas
  data/repository.ts                      Fetch de datos (server client, cookies)
  data/repository-admin.ts                Fetch de datos (admin client, sin cookies)
  data/transform.ts                       Transforma rows de DB a jerarquia tipada
  supabase/server.ts                      Cliente Supabase para Server Components
  supabase/admin.ts                       Cliente Supabase con service role key
  utils/slug-helpers.ts                   Extraccion de IDs de SVG desde slugs

types/
  hierarchy.types.ts                      Project, Layer, Media, BreadcrumbItem

scripts/supabase/
  seed.ts                                 Poblar DB con datos de ejemplo
  upload-images.ts                        Subir imagenes de galeria
  upload-backgrounds.ts                   Subir imagenes de fondo

public/svgs/                              SVGs interactivos por proyecto
```

## Patron de datos

Las paginas son Server Components que hacen fetch de Supabase y pasan datos como props a Client Components:

```
page.tsx (Server)  ->  repository.ts  ->  transform.ts  ->  ExplorerView (Client)
```

`buildExplorerPageData()` recibe el proyecto, todas las capas y media, y construye el `ExplorerPageData` tipado para la vista. `isLeafLevel` determina si se navega a la siguiente capa o se muestra la pagina de detalle.

Para `generateStaticParams` (build time), se usa `repository-admin.ts` que opera con `SUPABASE_SERVICE_ROLE_KEY` sin depender de cookies.

## Esquema de base de datos

Ver [`SETUP_SCHEMA_V2.sql`](./SETUP_SCHEMA_V2.sql) para el esquema completo. Resumen:

- **projects**: id, slug, name, type, status, layer_labels, max_depth, svg_path
- **layers**: id, project_id, parent_id, depth, slug, name, status, svg_path, properties (JSONB)
- **media**: id, project_id, layer_id, type, purpose, storage_path, url

`layer.properties` almacena campos especificos por tipo (area, precio, dormitorios, etc.).

## Scripts

```bash
npm run dev                # Servidor de desarrollo
npm run build              # Build de produccion
npm run lint               # ESLint
npm run db:seed            # Poblar DB con proyecto de ejemplo
npm run db:upload-images   # Subir imagenes de galeria
```
