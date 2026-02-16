# Navegador de Lotes Inmobiliarios Interactivos

Aplicación Next.js 14+ para visualización y navegación interactiva de lotes inmobiliarios organizados jerárquicamente en 3 niveles:

- **Mapa Principal** → 3 Zonas
- **Vista de Zona** → 4 Manzanas por zona
- **Vista de Manzana** → 20 Lotes por manzana

**Total: 240 lotes navegables** (3 zonas × 4 manzanas × 20 lotes)

## 🚀 Características

- ✅ **SVGs Interactivos**: Clickeables con hover effects y labels dinámicos
- ✅ **Navegación Jerárquica**: Sistema de navegación en 3 niveles
- ✅ **Estados de Lotes**: Disponible, Reservado, Vendido, No Disponible
- ✅ **Responsive**: Funciona en desktop y móvil
- ✅ **TypeScript**: Type safety completo
- ✅ **Static Generation**: Pre-renderizado de todas las rutas
- ✅ **Panel de Detalle**: Información de lotes con superficie, precio y características

## 📋 Stack Tecnológico

- **Framework**: Next.js 14+ (App Router)
- **Lenguaje**: TypeScript 5+
- **Estilos**: Tailwind CSS 3+
- **Componentes**: React 18+ (Server + Client Components)

## 🚦 Comandos

```bash
# Desarrollo
npm run dev          # http://localhost:3000

# Build
npm run build        # Construcción optimizada
npm run start        # Servidor de producción

# Verificación
npm run lint         # ESLint
npx tsc --noEmit     # Verificar TypeScript
```

## 🗺️ Rutas

- `/` → Mapa principal con 3 zonas
- `/zona/zona-1` → Vista de Zona Norte (4 manzanas)
- `/zona/zona-2` → Vista de Zona Centro (4 manzanas)
- `/zona/zona-3` → Vista de Zona Sur (4 manzanas)
- `/zona/{zoneId}/manzana/{blockId}` → Vista de manzana con 20 lotes

## 📊 Total de Elementos

- **3 Zonas** (Norte, Centro, Sur)
- **12 Manzanas** (4 por zona)
- **240 Lotes** (20 por manzana)

