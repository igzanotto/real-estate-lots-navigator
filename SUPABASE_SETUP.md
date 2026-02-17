# Configuracion de Supabase

## Pre-requisitos

- Cuenta de Supabase (crear en https://supabase.com)
- Node.js 18+

## 1. Crear Proyecto en Supabase

1. Ve a https://app.supabase.com
2. Click en "New Project"
3. Completa nombre, password y region
4. Espera a que se cree (~2 minutos)

## 2. Obtener Credenciales

1. Ve a **Project Settings** > **API**
2. Copia:
   - **Project URL** -> `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** -> `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** -> `SUPABASE_SERVICE_ROLE_KEY`

## 3. Configurar Variables de Entorno

```bash
cp .env.local.example .env.local
```

Edita `.env.local` con tus credenciales:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

## 4. Crear Esquema de Base de Datos

1. Ve al **SQL Editor** en Supabase
2. Pega el contenido de [`SETUP_SCHEMA.sql`](./SETUP_SCHEMA.sql)
3. Click en **Run**

Esto crea:

- 3 tablas: `zones`, `blocks`, `lots`
- Indices para performance
- Triggers para `updated_at`
- Row Level Security con lectura publica

## 5. Poblar la Base de Datos

```bash
npm run db:seed
```

Resultado esperado:

```
Zones: 3
Blocks: 14
Lots: 112
```

## 6. Configurar Supabase Storage (imagenes)

1. Ve a **Storage** en el dashboard de Supabase
2. Crea un bucket llamado `images`
3. Marcalo como **Public**

Luego sube las imagenes:

```bash
npm run db:upload-all    # Sube backgrounds (18) + fotos de lotes (112)
npm run db:add-images    # Vincula las fotos a los registros en DB
npm run db:verify-images # Verifica que todo este OK
```

Estructura del bucket:

```
images/
  backgrounds/
    mapa-principal.jpg
    zona-a.jpg
    zona-b.jpg
    zona-c.jpg
    zona-a-manzana-1.jpg
    ...
  zona-a/
    manzana-1/
      lote-01-main.jpg
      lote-02-main.jpg
      ...
    manzana-2/
      ...
  zona-b/
    ...
  zona-c/
    ...
```

## 7. Verificar

```bash
npm run dev
```

Abrir http://localhost:3000 y verificar:

- Mapa principal con 3 zonas clickeables
- Click en zona muestra sus manzanas
- Click en manzana muestra lotes con panel de detalle
- Imagenes de fondo detras de los SVGs
- Fotos de lotes en el panel lateral

## Estructura de Datos

### zones

| slug | name | status |
|------|------|--------|
| zona-a | Zona A | available |
| zona-b | Zona B | available |
| zona-c | Zona C | available |

### blocks (14 total: 4 + 4 + 6)

| slug | name | zone |
|------|------|------|
| zona-a-manzana-1 | Manzana 1 | Zona A |
| zona-a-manzana-2 | Manzana 2 | Zona A |
| ... | ... | ... |
| zona-c-manzana-6 | Manzana 6 | Zona C |

### lots (112 total: 8 por manzana)

| slug | name | status | area | price |
|------|------|--------|------|-------|
| zona-a-manzana-1-lote-01 | Lote 1 | available | 280 | 25200 |
| zona-a-manzana-1-lote-02 | Lote 2 | available | 290 | 26100 |
| zona-a-manzana-1-lote-03 | Lote 3 | reserved | 300 | 21000 |

## Seguridad (RLS)

- Lectura publica: cualquiera puede ver zonas, manzanas y lotes
- Escritura restringida: solo `service_role` key puede modificar datos

## Troubleshooting

### Error: "Missing Supabase credentials"
Verificar que `.env.local` tenga las 3 variables. Reiniciar el servidor.

### Error: "relation 'zones' does not exist"
Ejecutar `SETUP_SCHEMA.sql` en el SQL Editor de Supabase.

### Error TLS en WSL2
El script `dev` ya incluye `NODE_TLS_REJECT_UNAUTHORIZED=0`. Si otros scripts fallan, agregar el mismo prefijo.

### Imagenes no se ven
1. Verificar que el bucket `images` sea publico
2. Ejecutar `npm run db:verify-images` para verificar integridad
3. Si hay imagenes faltantes: `npm run db:upload-all && npm run db:add-images`
