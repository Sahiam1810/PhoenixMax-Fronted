# PhoenixMax · Frontend

Tienda de cuentas y pantallas de streaming, IA y edición (reto StreamStore). React + Vite + TypeScript + Tailwind, mobile-first.

## Instalación

1. `npm install`
2. Copia `.env.example` a `.env` y ajusta las variables.
3. `npm run dev`

| Variable | Uso |
| --- | --- |
| `VITE_API_URL` | URL base de la API (`http://localhost:3000/api`) |
| `VITE_USE_MOCK` | Solo `true` activa explícitamente los datos de prueba. Con `false` o sin la variable, la aplicación usa la API y avisa si el servicio no está disponible. |
| `VITE_WHATSAPP_NUMERO` | Número del botón de soporte, con indicativo (`573000000000`) |

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

Con datos de prueba (`VITE_USE_MOCK=true`):

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Admin | admin@phoenixmax.test | Admin123 |
| Cliente | cliente@phoenixmax.test | Cliente123 |
| Cliente | andres@phoenixmax.test | Cliente123 |

El cliente semilla tiene servicios que vencen en 1 y 3 días, uno vencido y un carrito con Max cuenta completa (stock 1) para probar la validación.
Los datos mock se guardan en `localStorage` (`phoenixmax-mock-db-v2`); bórrala para volver a la semilla.

## Imágenes y logos

No hay imágenes, fuentes ni íconos de terceros: la tipografía es la del sistema, los íconos y el logo del fénix son SVG propios.

- `public/img/hero.jpg`: fondo de la portada. Si no existe la sección queda en negro.
- `public/img/auth.jpg`: fondo del panel de login y registro, también negro si no existe.
- `public/logos/<plataforma>.svg` (`netflix.svg`, `disney.svg`, `primevideo.svg`, `max.svg`, `chatgptplus.svg`, `canvapro.svg`, `capcutpro.svg`): logos de cada servicio. Si el archivo falta se muestra un monograma con el color de la plataforma. Los logos de marcas son propiedad de cada empresa: usa solo archivos con permiso (por ejemplo, de su kit de prensa) o imágenes propias. En producción el logo llega en `logoUrl` desde la API.

## Licencias

Las dependencias son de código abierto con licencias permisivas: React, React Router, Vite y Tailwind (MIT) y TypeScript (Apache-2.0, solo en desarrollo). No se cargan recursos desde CDNs externos.

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

El contrato está en `ContratoApi.md`. Cada archivo de `src/services/` tiene su versión real (`xxxApi`) y su versión mock; `src/services/modo.ts` decide cuál usar.

El front usa la API por defecto. Solo `VITE_USE_MOCK=true` activa los datos de prueba; un fallo o demora de `GET /health` nunca cambia automáticamente a mock. Si la API no está disponible se muestra un aviso claro abajo a la izquierda y el front vuelve a comprobar su disponibilidad cada 8 segundos, sin recargar la página. Las respuestas de la API se convierten a los tipos del front en `src/services/api/adaptadores.ts`:

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
