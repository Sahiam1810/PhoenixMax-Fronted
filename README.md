# PhoenixMax · Frontend

Tienda de cuentas y pantallas de streaming, IA y edición (reto StreamStore). React + Vite + TypeScript + Tailwind, mobile-first.

## Instalación

1. `npm install`
2. Copia `.env.example` a `.env` y ajusta las variables.
3. `npm run dev`

| Variable | Uso |
| --- | --- |
| `VITE_API_URL` | URL base de la API (`http://localhost:3000/api`) |
| `VITE_USE_MOCKS` | `true` usa el backend simulado en el navegador, `false` llama a la API real |
| `VITE_WHATSAPP_NUMERO` | Número del botón de soporte, con indicativo (`573000000000`) |

## Scripts

- `npm run dev`: servidor de desarrollo.
- `npm run build`: type-check y build de producción.
- `npm run preview`: sirve el build.
- `npm run type-check`: `tsc --noEmit`.

## Usuarios de prueba (modo mock)

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Admin | admin@phoenixmax.test | Admin123 |
| Cliente | cliente@phoenixmax.test | Cliente123 |
| Cliente | andres@phoenixmax.test | Cliente123 |

El cliente semilla tiene servicios que vencen en 1 y 3 días, uno vencido y un carrito con Max cuenta completa (stock 1) para probar la validación.
Los datos mock se guardan en `localStorage` (`phoenixmax-mock-db-v1`); bórrala para volver a la semilla.

## Estructura

```
src/
  components/   UI compartida (Header, tarjetas, admin, ui.tsx)
  context/      AuthContext (único dueño del token) y CartContext
  hooks/        useCarga para peticiones en páginas
  lib/          formato, validación y configuración
  mocks/        backend simulado (semilla, reglas de stock y servicios mock)
  pages/        páginas públicas, cliente y admin
  routes/       rutas y protección por rol
  services/     contrato con la API
  types/        tipos compartidos
```

## Integración con el backend

Los datos simulados están aislados en un solo lugar:

- `src/mocks/`: semilla (`seed.ts`), reglas de stock y asignación (`db.ts`) y una implementación mock por servicio en `src/mocks/servicios/`.
- Cada archivo de `src/services/` define la interfaz del servicio, su versión real (`xxxApi`) y elige entre ambas con `VITE_USE_MOCKS`.

Para integrar basta con poner `VITE_USE_MOCKS=false`. Las páginas no cambian. Cuando ya no se necesiten los mocks, se borra `src/mocks/` y la línea `usarMocks ? xxxMock : xxxApi` de cada servicio.

Notas para el backend:

- Respuestas con forma `{ ok, message, data }`; los errores con `{ ok: false, message }`.
- Los campos se esperan en camelCase (`plataformaId`, `duracionDias`, `fechaVencimiento`...). Si la API responde en snake_case, se adapta en `services/`.
- Endpoints que agrega el front además del contrato del reto: `PATCH /auth/me`, `PATCH /admin/cuentas/:id` (`{ activa }`), `GET|POST /admin/usuarios`, `PATCH /admin/usuarios/:id` (`{ activo }`).
- `Plataforma` incluye `categoria` (`streaming | ia | edicion`) y `color`, y `GET /productos` acepta el filtro `?categoria=`.
