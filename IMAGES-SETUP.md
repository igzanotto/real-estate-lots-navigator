# 📸 Configuración de Imágenes con Supabase Storage

Guía completa para configurar y usar imágenes con Progressive Loading.

---

## 🎯 Lo que implementamos

✅ **Progressive Loading**: Las imágenes se cargan solo cuando el usuario clickea un lote
✅ **Prefetch Inteligente**: Precarga lotes adyacentes en background
✅ **Supabase Storage**: Almacenamiento de imágenes en CDN
✅ **Optimización automática**: Cleanup de memory cuando se cierra el panel

---

## 📋 Paso 1: Crear Bucket en Supabase

1. Ve a: https://supabase.com/dashboard/project/wjarjmsswpphqvslzozy/storage/buckets

2. Click en **"New bucket"**

3. Configuración:
   - Name: `lot-images`
   - ✅ **Public bucket** (importante!)
   - Click **"Create bucket"**

---

## 🔐 Paso 2: Configurar Políticas de Acceso

Ve a: **SQL Editor** en Supabase y ejecuta:

```sql
-- Permitir lectura pública de imágenes
CREATE POLICY "Public read access for lot images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'lot-images');

-- Permitir subida autenticada (opcional para admin)
CREATE POLICY "Authenticated upload access"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'lot-images'
    AND auth.role() = 'authenticated'
  );

-- Permitir eliminación autenticada (opcional para admin)
CREATE POLICY "Authenticated delete access"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'lot-images'
    AND auth.role() = 'authenticated'
  );
```

---

## 📁 Paso 3: Estructura de Carpetas

Las imágenes deben subirse con esta estructura:

```
lot-images/
├── zona-a/
│   ├── manzana-1/
│   │   ├── lote-01-main.jpg
│   │   ├── lote-02-main.jpg
│   │   ├── lote-03-main.jpg
│   │   └── ...
│   ├── manzana-2/
│   │   └── ...
│   └── ...
├── zona-b/
│   └── ...
└── zona-c/
    └── ...
```

**Formato del nombre:**
- `{zona-X}/{manzana-Y}/{lote-ZZ}-main.jpg`
- Ejemplo: `zona-a/manzana-1/lote-01-main.jpg`

---

## 🖼️ Paso 4: Subir Imágenes

### Opción A: Desde el Dashboard (Manual)

1. Ve a: https://supabase.com/dashboard/project/wjarjmsswpphqvslzozy/storage/buckets/lot-images

2. Crea las carpetas:
   - Click **"New folder"** → `zona-a`
   - Entra a `zona-a` → **"New folder"** → `manzana-1`
   - Repite para todas las zonas y manzanas

3. Sube las imágenes:
   - Entra a cada carpeta de manzana
   - Click **"Upload file"**
   - Sube las imágenes con el nombre correcto

### Opción B: Con la API (Programático)

```typescript
// scripts/upload-images.ts (crear este archivo si necesitas)
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function uploadImage(filePath: string, storagePath: string) {
  const file = readFileSync(filePath);

  const { data, error } = await supabase.storage
    .from('lot-images')
    .upload(storagePath, file, {
      contentType: 'image/jpeg',
      upsert: true, // Sobrescribir si existe
    });

  if (error) throw error;
  console.log(`✅ Uploaded: ${storagePath}`);
}

// Ejemplo de uso:
uploadImage(
  './imagenes-lotes/lote-01.jpg',
  'zona-a/manzana-1/lote-01-main.jpg'
);
```

---

## 🔗 Paso 5: Vincular Imágenes a la Base de Datos

Una vez que subiste imágenes a Supabase Storage, vincula las URLs:

```bash
npm run db:add-images
```

Este script:
1. Busca todas las imágenes en Supabase Storage
2. Genera las URLs públicas
3. Actualiza el campo `image_url` en la tabla `lots`

**Output esperado:**
```
📸 Linking Supabase Storage images to lots...

  ✅ Lote 1 → zona-a/manzana-1/lote-01-main.jpg
  ✅ Lote 2 → zona-a/manzana-1/lote-02-main.jpg
  ⏭️  Lote 3 - no image in storage
  ...

📊 Results:
   ✅ Linked: 15 lots
   ⏭️  Not found: 97 lots
```

---

## 🧪 Paso 6: Probar Progressive Loading

1. Inicia el servidor:
   ```bash
   npm run dev
   ```

2. Navega a una manzana con imágenes:
   ```
   http://localhost:3000/zona/zona-a/manzana/zona-a-manzana-1
   ```

3. Abre **DevTools** (F12) → pestaña **Console**

4. Haz click en un lote

5. Deberías ver:
   - 📸 Spinner de carga mientras se descarga la imagen
   - 🖼️ Imagen renderizada cuando termina
   - 📊 Logs en consola: `📸 Image cache: 1 loaded, 0 loading`

6. Haz click en otro lote y verás:
   - 📸 Cache stats actualizados: `📸 Image cache: 2 loaded, 0 loading`
   - ⚡ Si haces click en el lote anterior, la imagen aparece **instantáneamente** (desde cache)

---

## 📊 Verificar Performance

### Network Tab (DevTools)

1. Abre **DevTools** → pestaña **Network**
2. Filtra por **Img**
3. Click en lotes y observa:
   - Primera vez: `200` - descarga completa
   - Segunda vez: `(memory cache)` - instantáneo

### Memory Usage

El Progressive Loading mantiene en memoria solo:
- Imágenes de lotes clickeados
- ~200KB por imagen × N lotes vistos
- Ejemplo: 10 lotes = ~2MB en RAM ✅

---

## 🛠️ Comandos Útiles

```bash
# Vincular imágenes de Supabase Storage a DB
npm run db:add-images

# Desvincular todas las imágenes (no las borra de Storage)
npm run db:remove-images

# Re-sembrar base de datos
npm run db:seed
```

---

## 🎨 Recomendaciones de Imágenes

### Tamaño y Formato

- **Resolución**: 1200x800px o 1600x1200px
- **Formato**: JPEG (mejor compresión) o WebP (mejor calidad/tamaño)
- **Peso**: 100-300KB por imagen (usa compresión)
- **Aspect ratio**: 3:2 o 4:3

### Herramientas de Optimización

```bash
# ImageMagick (comprimir JPEGs)
convert input.jpg -quality 85 -resize 1200x800 output.jpg

# Squoosh.app (online)
https://squoosh.app

# TinyPNG (online)
https://tinypng.com
```

---

## 🔄 Actualizar Imágenes

### Opción 1: Reemplazar en Supabase Storage

1. Ve al bucket en Supabase Dashboard
2. Navega a la imagen
3. Click en **"⋮"** → **"Replace"**
4. Sube la nueva imagen

### Opción 2: Upload con `upsert: true`

```typescript
await supabase.storage
  .from('lot-images')
  .upload('zona-a/manzana-1/lote-01-main.jpg', newFile, {
    upsert: true, // Reemplaza si existe
  });
```

La URL pública no cambia, pero el contenido sí.

---

## 🐛 Troubleshooting

### "Sin imagen disponible"

**Problema**: El lote no muestra imagen.

**Solución**:
1. Verifica que la imagen existe en Storage
2. Verifica que el nombre coincide exactamente: `lote-01-main.jpg`
3. Corre `npm run db:add-images` para re-vincular

### "Failed to load image"

**Problema**: Error 404 al cargar imagen.

**Solución**:
1. Verifica que el bucket `lot-images` es **público**
2. Verifica las políticas de RLS (Paso 2)
3. Verifica la URL en la consola del navegador

### "Image cache not updating"

**Problema**: La imagen no aparece después de subirla.

**Solución**:
1. Hard refresh: `Ctrl+Shift+R` (Windows/Linux) o `Cmd+Shift+R` (Mac)
2. Limpia el cache del navegador
3. Corre `npm run db:add-images` de nuevo

---

## 📚 Archivos Relacionados

- `components/views/BlockView.tsx` - Implementación de Progressive Loading
- `lib/storage/image-helpers.ts` - Helpers para URLs de Supabase Storage
- `scripts/supabase/add-sample-images.ts` - Script para vincular imágenes
- `scripts/supabase/remove-sample-images.ts` - Script para desvincular

---

## ✨ Próximos Pasos (Opcional)

Una vez que funciona el Progressive Loading básico, puedes agregar:

1. **Galería de imágenes** (múltiples fotos por lote)
2. **Lightbox/Modal** para ver imágenes en grande
3. **Lazy loading de thumbnails** en la vista de manzana
4. **Image transformations** (resize, crop, format conversion)
5. **Upload directo desde el admin** (formulario de carga)

¿Necesitas ayuda con alguno de estos? 🚀
