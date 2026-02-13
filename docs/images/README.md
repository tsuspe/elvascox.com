# Screenshots

Estas capturas forman parte del portfolio y se versionan en el repo.

## Regenerar screenshots
```bash
npm run screenshots
```

Modo URL externa (sin build/start/migrate/seed):
```bash
SCREENSHOT_BASE_URL="http://127.0.0.1:3000" npm run screenshots
```

El script:
- ejecuta `prisma migrate deploy`
- ejecuta `npm run seed`
- hace `npm run build`
- arranca `next start` en `http://127.0.0.1:3100`
- captura las rutas públicas definidas en `scripts/takeScreenshots.mjs`
- guarda PNGs en `docs/images/`

Si `SCREENSHOT_BASE_URL` existe, entra en modo externo:
- no ejecuta migraciones
- no ejecuta seed
- no ejecuta build
- no arranca servidor
- captura contra la URL indicada

## Rutas y salidas actuales
Desktop (1440x900):
- `/` -> `home-desktop.png`
- `/work` -> `work-desktop.png`
- `/tattoo` -> `tattoo-desktop.png`
- `/musica` -> `musica-desktop.png`
- `/film` -> `film-desktop.png`
- `/journal` -> `journal-desktop.png`
- `/bio` -> `bio-desktop.png`

Mobile (390x844):
- `/` -> `home-mobile.png`
- `/work` -> `work-mobile.png`

## Requisitos
- PostgreSQL accesible para `DATABASE_URL` y `DIRECT_URL`.
- Si no se definen, el script usa por defecto:
  - `postgresql://postgres:postgres@127.0.0.1:5432/elvascox?schema=public`

## Nota de seguridad
Revisa siempre las capturas antes de commitear para evitar exponer datos sensibles.
