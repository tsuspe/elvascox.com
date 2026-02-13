# Arquitectura

## Resumen
La plataforma está construida sobre `Next.js App Router` con una arquitectura monolítica moderna:
- UI + rutas públicas
- CMS privado en `/admin`
- API HTTP en `src/app/api/**`
- Capa de dominio en `src/lib/**`
- Persistencia con Prisma + PostgreSQL

## Capas

## 1) Presentación
- `src/app/**/page.tsx`
- `src/components/**`

Incluye páginas públicas, galerías, detalle de works y buscador.

## 2) Aplicación / Dominio
- `src/lib/prisma.ts`: instancia singleton de Prisma.
- `src/lib/siteIndex.ts`: búsqueda de páginas y ranking básico.
- `src/lib/siteIndexReindex.ts`: reconstrucción del índice `SitePageIndex`.
- `src/lib/workRules.ts`: reglas editoriales para clasificación por tags.
- `src/lib/siteUrl.ts`: construcción de URLs canónicas por entorno.

## 3) Datos
Modelo principal en `prisma/schema.prisma`:
- `Work` (core entity)
- `Media`
- `Tag`
- `WorkTag` (N:M)
- `WorkLink` (grafo entre works)
- `SitePageIndex` (índice de búsqueda interna)

También existen modelos legacy (`BlogPost`, `TattooProject`, `Track`, `Artwork`) usados para compatibilidad.

## 4) Interfaces HTTP
### API pública
- `/api/public/meta`
- `/api/public/works`
- `/api/public/works/[slug]`
- `/api/public/search`
- `/api/public/tags`

### API interna
- `/api/ai/chat`
- `/api/cloudinary/sign`
- `/api/cron/reindex`
- `/api/health`

## Seguridad actual
- Protección de rutas admin con `src/proxy.ts`.
- Login admin por cookie `httpOnly` y `ADMIN_PASSWORD`.
- Endpoint cron protegido por `CRON_SECRET` (Bearer o `x-cron-secret`).

## Indexado y búsqueda
Hay dos fuentes:
- Estática generada por `scripts/genSitePages.mjs` -> `src/lib/sitePages.generated.ts`
- Persistida en DB (`SitePageIndex`) vía `reindexSitePages()`

Esto permite búsquedas rápidas y contextualización del asistente IA.

## SEO técnico
- Metadata dinámica por página
- `sitemap.ts` + `sitemap.xml/route.ts`
- `robots.ts`
- `llms.txt/route.ts`
- JSON-LD en layout y páginas clave
