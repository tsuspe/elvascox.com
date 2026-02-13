# Deploy en Vercel

## 1) Conectar repositorio
- Importa el repo en Vercel.
- Framework detectado: `Next.js`.
- Build command: `npm run build`.

## 2) Variables de entorno en Vercel
Configura en `Project Settings -> Environment Variables`:
- `NEXT_PUBLIC_SITE_URL=https://www.elvascox.com`
- `SITE_URL=https://www.elvascox.com`
- `DATABASE_URL`
- `DIRECT_URL`
- `ADMIN_PASSWORD`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`
- `CRON_SECRET`
- IA (OpenRouter u Ollama):
  - `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, `OPENROUTER_SITE_URL`, `OPENROUTER_APP_NAME`
  - o `OLLAMA_BASE_URL`, `OLLAMA_MODEL`

## 3) Base de datos y migraciones
Antes del primer deploy productivo:
```bash
npx prisma migrate deploy
npm run seed
```

## 4) Dominio personalizado
- Asocia `www.elvascox.com` en Vercel.
- Recomendado mantener redirección canónica hacia `https://www.elvascox.com`.
- Verifica que `NEXT_PUBLIC_SITE_URL` coincida con el dominio final.

## 5) Cron de reindex
Endpoint:
- `GET/POST /api/cron/reindex`

Auth:
- Header `Authorization: Bearer <CRON_SECRET>`
  o `x-cron-secret: <CRON_SECRET>`

Ejemplo:
```bash
curl -X POST "https://www.elvascox.com/api/cron/reindex" \
  -H "Authorization: Bearer $CRON_SECRET"
```

## 6) Verificación post-deploy
- Home y secciones cargan correctamente.
- `/work` lista contenido publicado.
- `/api/public/meta` responde `ok: true`.
- `/sitemap.xml` y `/robots.txt` accesibles.
- `/admin/login` funciona con `ADMIN_PASSWORD`.
