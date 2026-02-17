# Navegador de Lotes Inmobiliarios

Aplicacion Next.js para navegacion interactiva de lotes inmobiliarios organizados en 3 niveles jerarquicos con SVGs clickeables.

## Arquitectura

```
Mapa Principal (3 zonas)
  -> Zona A (4 manzanas)   -> 8 lotes c/u
  -> Zona B (4 manzanas)   -> 8 lotes c/u
  -> Zona C (6 manzanas)   -> 8 lotes c/u

Total: 3 zonas, 14 manzanas, 112 lotes
```

### Stack

- **Next.js 16** (App Router, Server Components, Static Generation)
- **React 19** (Client Components para interactividad SVG)
- **TypeScript 5** (strict mode)
- **Tailwind CSS 4** (via PostCSS)
- **Supabase** (PostgreSQL + Storage para imagenes)

### Rutas

| Ruta | Descripcion |
|------|-------------|
| `/` | Mapa principal con 3 zonas clickeables |
| `/zona/zona-a` | Zona A con 4 manzanas clickeables |
| `/zona/zona-a/manzana/zona-a-manzana-1` | Manzana con 8 lotes y panel de detalle |

## Setup

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar Supabase

Crear proyecto en [supabase.com](https://supabase.com) y configurar las credenciales:

```bash
cp .env.local.example .env.local
# Editar .env.local con tus credenciales
```

### 3. Crear esquema de base de datos

Ejecutar `SETUP_SCHEMA.sql` en el SQL Editor de Supabase. Esto crea las tablas `zones`, `blocks` y `lots` con indices, triggers y RLS.

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
  page.tsx                                Mapa principal (Server Component)
  error.tsx                               Error boundary
  not-found.tsx                           Pagina 404
  zona/[zoneId]/
    page.tsx                              Vista de zona
    manzana/[blockId]/
      page.tsx                            Vista de manzana

components/
  svg/InteractiveSVG.tsx                  Carga SVG, agrega interactividad via DOM
  views/MapView.tsx                       Vista mapa (Client Component)
  views/ZoneView.tsx                      Vista zona (Client Component)
  views/BlockView.tsx                     Vista manzana con panel lateral de lote
  navigation/Breadcrumb.tsx               Navegacion breadcrumb

lib/
  data/lots-repository.ts                 Fetch de datos (server client, cookies)
  data/lots-repository-admin.ts           Fetch de datos (admin client, sin cookies)
  data/transform.ts                       Transforma rows de DB a jerarquia tipada
  supabase/server.ts                      Cliente Supabase para Server Components
  supabase/admin.ts                       Cliente Supabase con service role key
  utils/slug-helpers.ts                   Extraccion de IDs de SVG desde slugs

types/
  hierarchy.types.ts                      Zone, Block, Lot, HierarchyData
  navigation.types.ts                     BreadcrumbItem

scripts/supabase/
  seed.ts                                 Poblar DB con datos de ejemplo

public/svgs/
  mapa-principal.svg                      Mapa con 3 zonas (zona-a, zona-b, zona-c)
  zonas/zona-{a,b,c}.svg                  Zonas con manzanas (manzana-1, manzana-2, ...)
  manzanas/zona-{x}-manzana-{n}.svg       Manzanas con lotes (lote-01, lote-02, ...)
```

## Convencion de IDs

Los IDs deben coincidir exactamente entre datos, SVGs y rutas:

| Nivel | Slug en DB | ID en SVG | Ruta |
|-------|-----------|-----------|------|
| Zona | `zona-a` | `zona-a` | `/zona/zona-a` |
| Manzana | `zona-a-manzana-1` | `manzana-1` | `/zona/zona-a/manzana/zona-a-manzana-1` |
| Lote | `zona-a-manzana-1-lote-01` | `lote-01` | _(panel lateral)_ |

Las funciones `blockSvgId()` y `lotSvgId()` en `lib/utils/slug-helpers.ts` extraen el segmento final del slug para matchear con el SVG.

## Patron de datos

Las paginas son Server Components que hacen fetch de Supabase y pasan datos como props a Client Components:

```
page.tsx (Server)  ->  getHierarchyData()  ->  ViewComponent (Client)
```

`getHierarchyData()` ejecuta 3 queries en paralelo (`zones`, `blocks`, `lots`) y `transformToHierarchy()` construye el arbol tipado.

Para `generateStaticParams` (build time), se usa `getHierarchyDataAdmin()` que opera con `SUPABASE_SERVICE_ROLE_KEY` sin depender de cookies.

## Scripts

```bash
npm run dev              # Servidor de desarrollo
npm run build            # Build de produccion
npm run lint             # ESLint
npm run db:seed          # Poblar DB (3 zonas, 14 manzanas, 112 lotes)
```

## Esquema de base de datos

Ver [`SETUP_SCHEMA.sql`](./SETUP_SCHEMA.sql) para el esquema completo. Resumen:

- **zones**: id, slug, name, label, status, svg_path
- **blocks**: id, zone_id, slug, name, label, status, svg_path
- **lots**: id, block_id, zone_id, slug, name, label, status, area, price, is_corner, description, front_meters, depth_meters, orientation, features, image_url, buyer_*

RLS habilitado con lectura publica. Escritura solo via service role key.
