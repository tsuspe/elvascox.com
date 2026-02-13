# Checklist para abrir el repo públicamente

## Seguridad
- Revisar historial para asegurar que no existan secretos commiteados.
- Rotar credenciales actuales (DB, Cloudinary, OpenRouter, etc.) antes de hacerlo público.
- Confirmar que `.env` no está versionado.
- Si un secreto entra en el historial Git, se considera comprometido: hay que purgar historial y rotarlo inmediatamente.

## Presentación
- Verificar que `README.md` refleja el estado real del proyecto.
- Añadir capturas o GIFs del producto en producción (opcional, recomendado).
- Completar descripción del repo y topics en GitHub.
- Revisar screenshots antes de commitear para evitar datos sensibles en imágenes.

## Calidad técnica
- Ejecutar:
```bash
npm run lint
npm run build
```
- Validar rutas principales y API pública en producción.

## Licencia
- Elegir y añadir licencia (`MIT`, `Apache-2.0`, etc.) según cómo quieras que se reutilice.

## CV / Portfolio
- Enlazar:
  - repo público
  - web en producción (`https://www.elvascox.com`)
  - este proyecto como caso fullstack en tu CV y perfil de LinkedIn/GitHub
