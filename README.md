# PhoenixMax · Frontend

Tienda de cuentas y pantallas de streaming, IA y edición (reto StreamStore). React + Vite + TypeScript + Tailwind, mobile-first.

## Instalación

1. `npm install`
2. Copia `.env.example` a `.env` y ajusta las variables.
3. `npm run dev`

| Variable | Uso |
| --- | --- |
| `VITE_API_URL` | URL base de la API (`http://localhost:3000/api`) |

## Scripts

- `npm run dev`: servidor de desarrollo.
- `npm run build`: type-check y build de producción.
- `npm run preview`: sirve el build.
- `npm run type-check`: `tsc --noEmit`.

## Usuarios de prueba

Con el backend (semilla de `PhoenixMax-Backend`):

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Admin | admin@streamstore.test | Admin123* |
| Cliente | cliente1@streamstore.test | Cliente123* |
| Cliente | cliente2@streamstore.test | Cliente123* |

## Estructura

```
src/
  components/   UI compartida (Header, tarjetas, admin, ui.tsx)
  context/      AuthContext (único dueño del token) y CartContext
  hooks/        useCarga para peticiones en páginas
  lib/          formato, validación y configuración
  pages/        páginas públicas, cliente y admin
  routes/       rutas y protección por rol
  services/     comunicación con la API
  types/        tipos compartidos
```

## Integración con el backend

El contrato está en `ContratoApi.md`. Las respuestas de la API se convierten a los tipos del front en `src/services/api/adaptadores.ts`:

- Respuestas `{ message, data }` y errores `{ error, errors }`; los `errors` por campo se muestran junto al mensaje.
- El dinero llega como string y se convierte a número.
- Las listas aceptan arreglo o respuesta paginada (`data.data`).
- Carrito, compras y servicios traen la plataforma resumida; el front la completa con `GET /plataformas` (caché de 1 minuto).
- Tras el registro el front llama a `/auth/login`.
- Un 401 con sesión activa cierra la sesión.

Campos que el front usa y la API aún no envía (tienen valor por defecto):

- `Plataforma.categoria` (`streaming | ia | edicion`) y `Plataforma.color`: se deducen del nombre.
- `Plataforma.logoUrl`: si llega `null` se usa `/logos/<nombre>.svg`.
- `Usuario.activo` y `Usuario.createdAt`.

Endpoints que el front llama y no están en el contrato (deseables para el backend):

- `PATCH /auth/me` con `{ nombre, telefono }` (editar perfil).
- `PATCH /admin/cuentas/:id/estado` con `{ estado: "disponible" | "inactiva" }` (activar o desactivar una cuenta).
- `PATCH /admin/plataformas/:id/estado` y `PATCH /admin/productos/:id/estado` con `{ activo }`; los demás cambios van por `PATCH /:id`.
- `GET /admin/usuarios` (`?rol=&activo=&q=`), `POST /admin/usuarios` y `PATCH /admin/usuarios/:id/estado` con `{ activo }` (gestión de usuarios).
- `GET /admin/resumen` se espera como `{ ventasHoy, ventasMes, comprasHoy, comprasMes, clientes, stock: [{ plataforma, stockCuentas, stockPantallas }] }`.
- `GET /admin/compras` acepta `?estado=&desde=&hasta=&page=&limit=` y cada compra puede traer `usuario: { nombre }`.
