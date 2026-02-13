# API Pública (Read-Only)

Base URL recomendada:
- `https://www.elvascox.com`

Todos los endpoints responden JSON y exponen solo contenido `PUBLISHED`.

## `GET /api/public/meta`
Metadatos del API y descubrimiento de endpoints.

Ejemplo:
```bash
curl -s https://www.elvascox.com/api/public/meta
```

## `GET /api/public/works`
Listado paginado de works.

Query params:
- `type`: `TATTOO | MUSIC | FILM | ART | DEV | JOURNAL`
- `tag`: slug de tag
- `q`: búsqueda por texto en título/excerpt/content
- `page`: 1-based (default `1`)
- `pageSize`: máximo `50` (default `12`)

Ejemplos:
```bash
curl -s "https://www.elvascox.com/api/public/works?page=1&pageSize=12"
curl -s "https://www.elvascox.com/api/public/works?type=MUSIC"
curl -s "https://www.elvascox.com/api/public/works?tag=blackout"
```

## `GET /api/public/works/{slug}`
Detalle de un work publicado por slug.

Ejemplo:
```bash
curl -s "https://www.elvascox.com/api/public/works/mi-slug"
```

## `GET /api/public/search`
Búsqueda pública paginada en contenido y tags.

Query params:
- `q` (requerido)
- `page` (default `1`)
- `pageSize` (max `50`)

Ejemplo:
```bash
curl -s "https://www.elvascox.com/api/public/search?q=techno"
```

## `GET /api/public/tags`
Listado de tags con conteo de works relacionados.

Ejemplo:
```bash
curl -s "https://www.elvascox.com/api/public/tags"
```

## Códigos de estado típicos
- `200`: respuesta correcta
- `400`: parámetros inválidos (por ejemplo slug vacío)
- `404`: recurso no encontrado o no publicado

## Caché
Los endpoints públicos incluyen `cache-control` con TTL corto (`60s` o `300s`) para balancear frescura y rendimiento.
