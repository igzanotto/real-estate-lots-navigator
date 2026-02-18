# UI/UX Audit Report — Real Estate Explorer

**Date:** 2026-02-17
**Branch:** `building`

---

## Table of Contents

1. [Theme Inconsistency](#1-theme-inconsistency)
2. [Button Styles](#2-button-styles)
3. [Status Colors](#3-status-colors-used-inconsistently)
4. [Header / Navigation Patterns](#4-header--navigation-pattern-mismatch)
5. [Accessibility](#5-accessibility-gaps)
6. [Mobile Responsiveness](#6-mobile-responsiveness-gaps)
7. [Loading & Error States](#7-loading--error-state-inconsistencies)
8. [Component Complexity](#8-component-complexity)
9. [Spacing & Padding](#9-spacing--padding-inconsistencies)
10. [Typography](#10-typography-inconsistencies)
11. [Border Radius](#11-border-radius-inconsistencies)
12. [Shadow Usage](#12-shadow-usage-inconsistencies)
13. [Tailwind Anti-Patterns](#13-tailwind-anti-patterns)
14. [Priority Recommendations](#14-priority-recommendations)

---

## 1. Theme Inconsistency

**Severity: High**

The app switches between dark and light themes with no clear rationale:

| Page | Theme | Background |
|------|-------|------------|
| Home (`app/page.tsx`) | Light | `bg-gray-50` |
| Project Home (`ProjectHomePage`) | Dark | Full-screen dark video |
| Explorer (`ExplorerView`) | Dark | `bg-gray-900` |
| Unit Detail (`UnitPage`) | Light | `bg-gray-50` |
| Admin (`admin/layout.tsx`) | Light | `bg-gray-100` |
| 404 / Error | Light | `bg-gray-50` |

The user navigates: **Home (light) → Project (dark) → Explorer (dark) → Unit Detail (light)**. This back-and-forth creates visual jarring. The Breadcrumb component is styled for dark backgrounds (`text-gray-400`) but also used on light-background UnitPage where contrast differs.

---

## 2. Button Styles

**Severity: High**

There are **8+ distinct button patterns** with no shared abstraction:

| Location | Padding | Radius | Style |
|----------|---------|--------|-------|
| `app/error.tsx:28` | `px-6 py-3` | `rounded-lg` | `bg-blue-600 text-white` |
| `app/not-found.tsx:16` | `px-6 py-3` | `rounded-lg` | `bg-blue-600 text-white` |
| `UnitPage.tsx:167` | `px-4 py-3` | `rounded-lg` | `bg-blue-600 text-white` |
| `UnitPage.tsx:219` | `px-4 py-2` | `rounded-md` | `bg-gray-100 text-gray-600` |
| `ExplorerView.tsx:115` | `px-4 py-1.5` | `rounded-lg` | `bg-white/10 text-gray-300` |
| `ProjectHomePage.tsx:60` | `px-5 py-2` | `rounded-lg` | `bg-white text-gray-900` |
| `Spin360Viewer.tsx:199` | `px-5 py-2.5` | `rounded-full` | `bg-white/90 text-gray-800` |
| `admin/login/page.tsx:77` | `py-2 px-4` | `rounded-md` | `bg-blue-600 text-white` |

No two "primary" buttons are identical. Border-radius alternates between `rounded-md`, `rounded-lg`, and `rounded-full`.

---

## 3. Status Colors Used Inconsistently

**Severity: Medium**

The constants in `lib/constants/status.ts` are well-defined but **not used everywhere**:

- **`app/page.tsx:35-41`** — Hardcodes `bg-green-100 text-green-700` instead of using `STATUS_CLASSES` (which defines `bg-green-100 text-green-800`). The green shade doesn't even match (700 vs 800).
- **`UnitPage.tsx:73`** — Price uses `text-green-600` (arbitrary, not from status system).
- **`UnitPage.tsx:138,144,150`** — Feature checkmarks use `text-green-600` (hardcoded).
- **`InteractiveSVG.tsx:132,143`** — SVG text labels use hardcoded `#333` and `rgba(255,255,255,0.9)`.
- **`Spin360Viewer.tsx:94-114`** — Hardcoded `rgba(74,144,226,0.7)` for markers and `rgba(255,255,255,0.05)` for fills.

---

## 4. Header / Navigation Pattern Mismatch

**Severity: Medium**

Each page type has a completely different header pattern:

| Page | Header Style | Padding | Shadow |
|------|-------------|---------|--------|
| Home | White, `border-b border-gray-200` | `p-6` | `shadow-sm` |
| Admin | White, `border-b border-gray-200` | `px-6 py-3` | None |
| Explorer | Dark, `border-b border-gray-700` | `px-4 py-3` | None |
| UnitPage | White, `border-b border-gray-200` | `p-4` | `shadow-sm` |
| ProjectHome | None | — | — |

### Back Button Behavior

- **ExplorerView**: Bottom bar "← Volver" button (`bg-white/10`)
- **UnitPage**: Footer "← Volver al plano" button (`bg-gray-100`)
- **ProjectHomePage**: **No back button exists**

### Breadcrumb Visibility

- **ExplorerView**: Conditionally hidden when only one item (`breadcrumbs.length > 1`)
- **UnitPage**: Always shown regardless of length
- Inconsistent visibility logic between the two views.

---

## 5. Accessibility Gaps

**Severity: High**

### SVG Maps Not Keyboard Accessible

`InteractiveSVG.tsx` only listens for mouse events (`mouseenter`, `mouseleave`, `click`). No `tabIndex`, no `onKeyDown`, no focus indicators. **Keyboard-only users cannot interact with the primary navigation.**

### Missing ARIA Attributes

- Gallery arrows (`UnitPage.tsx:325-336`) use `←`/`→` symbols with **no `aria-label`**
- No `aria-current="page"` on active breadcrumb items
- No `aria-current` on selected tabs in `ProjectHomePage`, `Spin360Viewer`, `AerialVideoGallery`
- No `aria-live` regions for loading states ("Cargando mapa..." is visual only)

### Color Contrast Concerns

- `text-gray-400` on `bg-gray-900` in Breadcrumb — may fail WCAG AA (4.5:1 for normal text)
- `text-gray-400` on `bg-gray-900` in SiblingNavigator inactive items — borderline
- `text-white/80` on `bg-white/10` in ProjectHomePage tabs — reduced opacity may fail contrast

### Other

- No skip-navigation link
- No visible focus outlines on most interactive elements
- Icon-only buttons have no `sr-only` text or `aria-label`

---

## 6. Mobile Responsiveness Gaps

**Severity: High**

### Limited Responsive Breakpoints

| Breakpoint | Usage |
|-----------|-------|
| `sm:` | UnitPage sibling grid only |
| `md:` | Home page grid |
| `lg:` | UnitPage detail column layout |

Most components assume desktop-first with no mobile adaptation.

### Specific Issues

- **`SiblingNavigator.tsx:32`** — Fixed `w-28` (112px) sidebar with no mobile handling. On small screens, this steals significant space from the SVG map.
- **`ExplorerView.tsx`** — Full-screen flex layout with no mobile breakpoints. SVG + sidebar won't fit on phones.
- **`Breadcrumb.tsx`** — No text truncation; long paths will overflow on mobile.
- **`UnitPage.tsx`** — Gallery uses `style={{ minHeight: 400 }}` (hardcoded pixels instead of responsive classes).
- **No `loading.tsx` files** — No loading UI during server component data fetches.

---

## 7. Loading & Error State Inconsistencies

**Severity: Medium**

| Component | Loading State | Error State | Empty State |
|-----------|:---:|:---:|:---:|
| InteractiveSVG | "Cargando mapa..." | Red error box | N/A |
| VideoPlayer | "Cargando video..." | None | N/A |
| Spin360Viewer SVG | Silent | Silent fail | N/A |
| UnitPage Gallery | Spinner | "Imagen no disponible" (no retry) | Icon + message |
| AerialVideoGallery | None | None | "No hay videos" |
| ExplorerView SVG | Via InteractiveSVG | Via InteractiveSVG | "No hay mapa" |
| Home Page projects | None | None | "No hay proyectos" |

- `Spin360Viewer` silently swallows SVG load errors.
- Gallery image failures show a static message with **no retry option**.
- `app/error.tsx` shows a generic "Algo salió mal" with no error details.

---

## 8. Component Complexity

**Severity: Medium**

- **`UnitPage.tsx`** — 375 lines total (main component + inline Gallery). The Gallery sub-component alone is 140 lines with complex image caching logic (refs, useCallback, useEffect chains). Should be extracted to its own file.
- **`InteractiveSVG.tsx`** — 128-line `setupSVG` callback doing raw DOM manipulation. Fragile and hard to test.
- **`Spin360Viewer.tsx`** — 240+ lines managing video state, SVG overlay injection, and navigation. Multiple concerns in one component.

---

## 9. Spacing & Padding Inconsistencies

**Severity: Low**

### Header Padding

| Component | Padding |
|-----------|---------|
| `ExplorerView.tsx:65` | `px-4 py-3` |
| `UnitPage.tsx:46` | `p-4` |
| `app/page.tsx:16` | `p-6` |
| `ProjectHomePage.tsx:55` | `px-4 py-3` |
| `admin/layout.tsx:11` | `px-6 py-3` |

### Card Padding

| Component | Padding |
|-----------|---------|
| `UnitPage.tsx` (info cards) | `p-5` |
| `app/page.tsx` (project cards) | `p-6` |
| `admin/login/page.tsx` (form card) | `p-8` |

### Gap/Spacing

- Status dots use `gap-1.5` (`ExplorerView.tsx:77`) vs `gap-2` elsewhere.
- Feature list uses `space-y-2` vs `mb-3` in the same component.

---

## 10. Typography Inconsistencies

**Severity: Low**

### Font Weights for Headings

- `UnitPage.tsx:50` uses `font-bold` for h1
- `ExplorerView.tsx:69` uses `font-semibold` for h1
- `admin/page.tsx:3` uses plain text with no font-weight

### Font Sizes

No centralized typography scale. Headings range from `text-lg` to `text-6xl` with no consistent hierarchy:

| Element | Size | Location |
|---------|------|----------|
| 404 heading | `text-6xl` | `not-found.tsx:7` |
| Home title | `text-3xl` | `page.tsx:18` |
| Unit name | `text-2xl` | `UnitPage.tsx:50` |
| Error title | `text-2xl` | `error.tsx:19` |
| Project card | `text-xl` | `page.tsx:43` |
| Explorer title | `text-lg` | `ExplorerView.tsx:69` |

---

## 11. Border Radius Inconsistencies

**Severity: Low**

| Usage | Radius | Location |
|-------|--------|----------|
| Status badges (UnitPage) | `rounded-full` | `UnitPage.tsx:51` |
| Status badges (Home) | `rounded` | `page.tsx:32` |
| Buttons (most) | `rounded-lg` | Various |
| Form inputs | `rounded-md` | `admin/login/page.tsx:52` |
| Pill buttons (Spin360) | `rounded-full` | `Spin360Viewer.tsx:199` |

Status badges should be unified — currently `rounded-full` in some places and `rounded` in others.

---

## 12. Shadow Usage Inconsistencies

**Severity: Low**

| Element | Shadow | Location |
|---------|--------|----------|
| Headers | `shadow-sm` | `page.tsx:16`, `UnitPage.tsx:46` |
| Gallery arrows | `shadow` | `UnitPage.tsx:327,333` |
| Spin360 CTA button | `shadow-lg` | `Spin360Viewer.tsx:199` |
| Project cards hover | `hover:shadow-lg` | `page.tsx:29` |
| Admin login card | `shadow-sm` | `admin/login/page.tsx:37` |

No consistent shadow strategy across similar elements.

---

## 13. Tailwind Anti-Patterns

**Severity: Low**

### Inline Styles Mixed with Tailwind

- `UnitPage.tsx:280,300,314` — `style={{ minHeight: 400 }}` instead of Tailwind `min-h-` classes
- `UnitPage.tsx:184` — `style={{ backgroundImage: ... }}` (necessary for dynamic URLs)
- `Spin360Viewer.tsx:94-95` — `style.fill = 'rgba(...)'` hardcoded in JS

### Inconsistent Class Ordering

- Some use `px-X py-Y`, others `py-X px-Y`
- Some use `bg-X text-Y`, others `text-Y bg-X`
- No consistent ordering pattern

### No Design Tokens

- No Tailwind config customization for colors, spacing, or typography
- Relies entirely on Tailwind defaults with manual overrides

---

## 14. Priority Recommendations

### P0 — Fix Now

| # | Issue | Files |
|---|-------|-------|
| 1 | Standardize button styles (create 2-3 reusable patterns: primary, secondary, ghost) | All component files |
| 2 | Use `STATUS_CLASSES`/`STATUS_COLORS` everywhere instead of hardcoding | `app/page.tsx:35-41` |
| 3 | Add keyboard support to SVG maps (`tabIndex`, `onKeyDown`) | `InteractiveSVG.tsx` |
| 4 | Add `aria-label` to icon-only buttons | `UnitPage.tsx:325-336` |

### P1 — Fix Soon

| # | Issue | Files |
|---|-------|-------|
| 5 | Choose a consistent theme strategy (dark explorer is fine, but make transitions intentional) | `ExplorerView.tsx`, `UnitPage.tsx`, `ProjectHomePage.tsx` |
| 6 | Add mobile breakpoints to SiblingNavigator (hide or convert to bottom sheet) | `SiblingNavigator.tsx:32` |
| 7 | Add `loading.tsx` files for server component routes | `app/p/[projectSlug]/` |
| 8 | Extract Gallery from UnitPage into its own component file | `UnitPage.tsx:233-375` |
| 9 | Standardize header/footer patterns across page types | All layout/page files |

### P2 — Polish

| # | Issue | Files |
|---|-------|-------|
| 10 | Standardize spacing scale (pick 3-4 padding sizes) | All components |
| 11 | Add `aria-current`, `aria-live` regions, skip-nav link | Navigation components |
| 12 | Replace inline `style={}` with Tailwind classes where possible | `UnitPage.tsx`, `Spin360Viewer.tsx` |
| 13 | Add error retry mechanism to image gallery | `UnitPage.tsx` Gallery |
| 14 | Unify border-radius for status badges | `page.tsx`, `UnitPage.tsx` |
| 15 | Extract reusable Tailwind component classes or design tokens | `tailwind.config` |
