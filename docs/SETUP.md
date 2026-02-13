# Setup Local

## Requisitos
- Node.js `20+`
- npm `10+`
- PostgreSQL accesible desde tu entorno local

## 1) Instalar dependencias
```bash
npm install
```

## 2) Configurar entorno
```bash
cp .env.example .env
```

Completa al menos:
- `DATABASE_URL`
- `DIRECT_URL`
- `ADMIN_PASSWORD`
- `NEXT_PUBLIC_SITE_URL`

Si usarás media y asistente IA, configura también Cloudinary/OpenRouter u Ollama.

## 3) Base de datos
Aplicar migraciones:
```bash
npx prisma migrate deploy
```

Cargar seed base (vocabulario de tags):
```bash
npm run seed
```

## 4) Ejecutar en desarrollo
```bash
npm run dev
```

La app quedará en `http://localhost:3000`.

## 5) Build local de verificación
```bash
npm run build
```

## Flujos útiles
- Regenerar índice estático de páginas:
```bash
npm run gen:sitepages
```

- Abrir panel admin:
  - `/admin/login`
  - contraseña: `ADMIN_PASSWORD`

## Troubleshooting rápido
- Error de Prisma en runtime:
  - revisa `DATABASE_URL` y `DIRECT_URL`
  - ejecuta `npx prisma generate`
- `/admin` redirige a login todo el rato:
  - verifica `ADMIN_PASSWORD` y cookie `admin`
- Upload de imágenes falla:
  - revisa `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` y `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`
- Asistente IA no responde:
  - OpenRouter: revisar `OPENROUTER_API_KEY`
  - Ollama: revisar `OLLAMA_BASE_URL` y que el servicio esté levantado
