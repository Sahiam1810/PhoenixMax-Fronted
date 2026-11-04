# StreamStore Frontend

Esqueleto mobile-first de StreamStore: tienda ficticia de cuentas y pantallas de streaming.

## Instalación

1. Copia `.env.example` a `.env` si deseas ajustar la API.
2. Instala dependencias con `npm install`.
3. Inicia el entorno con `npm run dev`.

## Scripts

- `npm run dev`: inicia Vite.
- `npm run build`: comprueba TypeScript y genera la versión de producción.
- `npm run preview`: sirve la compilación local.
- `npm run type-check`: ejecuta `tsc --noEmit`.

La API usa `VITE_API_URL` y, mientras el backend está en construcción, se incluyen datos ficticios y `VITE_USE_MOCKS=true` como referencia.
