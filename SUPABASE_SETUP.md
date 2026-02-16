# Configuración de Supabase

Este documento explica cómo configurar Supabase para el proyecto.

## 📋 Pre-requisitos

- Cuenta de Supabase (crear en https://supabase.com)
- Node.js 18+ instalado

## 🚀 Pasos de Configuración

### 1. Crear Proyecto en Supabase

1. Ve a https://app.supabase.com
2. Click en "New Project"
3. Completa:
   - **Nombre**: `real-estate-lots-navigator` (o el que prefieras)
   - **Database Password**: Guarda esta contraseña de forma segura
   - **Region**: Selecciona la más cercana a tus usuarios
4. Click en "Create new project" (tarda ~2 minutos)

### 2. Obtener Credenciales

Una vez creado el proyecto:

1. Ve a **Project Settings** (⚙️ en sidebar)
2. Click en **API** en el menú izquierdo
3. Copia los siguientes valores:
   - **Project URL**: `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key**: `SUPABASE_SERVICE_ROLE_KEY` (⚠️ mantener secreto!)

### 3. Configurar Variables de Entorno

1. Copia el archivo de ejemplo:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edita `.env.local` y agrega tus credenciales:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
   SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
   ```

### 4. Crear el Esquema de Base de Datos

1. Ve al **SQL Editor** en Supabase
2. Abre el archivo `scripts/supabase/schema.sql`
3. Copia TODO el contenido
4. Pégalo en el SQL Editor de Supabase
5. Click en **Run** (botón verde)

Esto creará:
- ✅ 3 tablas: `zones`, `blocks`, `lots`
- ✅ Índices para performance
- ✅ Triggers para `updated_at`
- ✅ Row Level Security (RLS) habilitado
- ✅ Políticas de lectura pública

### 5. Poblar la Base de Datos (Seed)

Ejecuta el script de seed para insertar los datos iniciales:

```bash
npm run db:seed
```

Este comando:
- Limpia datos existentes
- Crea 3 zonas (A, B, C)
- Crea 14 manzanas (4+4+6)
- Crea 112 lotes (8 por manzana)

**Salida esperada:**
```
🌱 Starting database seed...
🗑️  Clearing existing data...
✅ Existing data cleared

📍 Seeding zones...
✅ Created 3 zones

📦 Seeding blocks for Zona A...
  ✅ Created block zona-a-manzana-1 with 8 lots
  ...
🎉 Database seeded successfully!

📊 Summary:
   Zones: 3
   Blocks: 14
   Lots: 112
```

### 6. Verificar en Supabase

1. Ve a **Table Editor** en Supabase
2. Verifica que existan datos en:
   - `zones` → 3 registros
   - `blocks` → 14 registros
   - `lots` → 112 registros

## ✅ Verificar la Integración

1. Reinicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

2. Abre http://localhost:3000

3. Deberías ver:
   - ✅ Mapa principal con 3 zonas
   - ✅ Click en zona muestra sus manzanas
   - ✅ Click en manzana muestra 8 lotes
   - ✅ Datos cargados desde Supabase

## 🔧 Scripts Disponibles

```bash
# Poblar base de datos con datos iniciales
npm run db:seed

# Ver tablas en Supabase (si tienes CLI instalado)
npx supabase db dump --schema public
```

## 📊 Estructura de Datos

### Zones (Zonas)
```sql
SELECT slug, name, status FROM zones;
```
| slug   | name   | status    |
|--------|--------|-----------|
| zona-a | Zona A | available |
| zona-b | Zona B | available |
| zona-c | Zona C | available |

### Blocks (Manzanas)
```sql
SELECT slug, name, zone_id FROM blocks WHERE zone_id = (SELECT id FROM zones WHERE slug = 'zona-a');
```
| slug              | name      |
|-------------------|-----------|
| zona-a-manzana-1  | Manzana 1 |
| zona-a-manzana-2  | Manzana 2 |
| zona-a-manzana-3  | Manzana 3 |
| zona-a-manzana-4  | Manzana 4 |

### Lots (Lotes)
```sql
SELECT slug, name, status, area, price FROM lots WHERE block_id = (SELECT id FROM blocks WHERE slug = 'zona-a-manzana-1') LIMIT 3;
```
| slug                        | name   | status    | area | price  |
|-----------------------------|--------|-----------|------|--------|
| zona-a-manzana-1-lote-01    | Lote 1 | available | 280  | 25200  |
| zona-a-manzana-1-lote-02    | Lote 2 | available | 290  | 26100  |
| zona-a-manzana-1-lote-03    | Lote 3 | reserved  | 300  | 21000  |

## 🔐 Seguridad (RLS)

Row Level Security está habilitado con políticas de:
- ✅ **Lectura pública**: Cualquiera puede ver zonas, manzanas y lotes
- ❌ **Escritura restringida**: Solo service_role puede modificar datos

Para agregar panel admin con autenticación, puedes agregar políticas como:
```sql
CREATE POLICY "Allow authenticated users to update lots"
  ON lots FOR UPDATE
  USING (auth.role() = 'authenticated');
```

## 🚨 Troubleshooting

### Error: "Missing Supabase credentials"
- Verifica que `.env.local` exista con las 3 variables
- Reinicia el servidor (`npm run dev`)

### Error: "relation 'zones' does not exist"
- Ejecuta el schema SQL en Supabase SQL Editor
- Verifica que las tablas existan en Table Editor

### Error: "Row Level Security: policy violation"
- Verifica que las políticas de lectura estén creadas
- Usa `SUPABASE_SERVICE_ROLE_KEY` para operaciones admin

### Los datos no se ven en la app
- Verifica que el seed se haya ejecutado correctamente
- Revisa los logs del servidor de desarrollo
- Comprueba las tablas en Supabase Table Editor

## 📚 Recursos

- [Supabase Docs](https://supabase.com/docs)
- [Next.js + Supabase](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
