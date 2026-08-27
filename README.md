# Control de Extintores

Plataforma web para el control e inspección de extintores de una institución
educativa. Responsive (desktop, tablet y celular), pensada para que cada
extintor físico tenga un código QR que abra directamente su ficha en
`/extintor/[codigo]`.

## Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS v4**
- **PostgreSQL** + **Prisma ORM** (v6)
- **qrcode** para generar los códigos QR
- **zod** para validación de datos
- Autenticación propia con JWT en cookie `httpOnly` (`jose` + `bcryptjs`) —
  ver la nota en [Decisiones de arquitectura](#decisiones-de-arquitectura)

## Requisitos previos

- Node.js 20 o superior
- Una base de datos PostgreSQL (local, Docker o en la nube)

## 1. Instalar dependencias

```bash
npm install
```

## 2. Configurar PostgreSQL

Cualquiera de estas opciones sirve:

**Opción A — Docker (recomendado para desarrollo local):**

```bash
docker run --name extintores-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=extintores -p 5432:5432 -d postgres:16
```

**Opción B — PostgreSQL instalado localmente:** crear una base de datos vacía,
por ejemplo `extintores`.

**Opción C — Servicio en la nube** (Supabase, Neon, Railway, RDS, etc.): copiar
la cadena de conexión que provee el servicio.

## 3. Configurar variables de entorno

Copiar el archivo de ejemplo:

```bash
cp .env.example .env
```

Y completar `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/extintores?schema=public"
AUTH_SECRET="generar-uno-con-openssl-rand--base64-32"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
CRON_SECRET=""
```

- `DATABASE_URL`: cadena de conexión a PostgreSQL.
- `AUTH_SECRET`: secreto para firmar las cookies de sesión. Generarlo con
  `openssl rand -base64 32` (o cualquier string largo y aleatorio).
- `NEXT_PUBLIC_APP_URL`: URL pública de la app. Se usa para construir el
  contenido de los QR (`https://tu-dominio.com/extintor/EXT-001`). En
  desarrollo dejar `http://localhost:3000`.
- `CRON_SECRET`: opcional, protege el endpoint `/api/cron/alertas` cuando se
  configure un scheduler externo.

## 4. Ejecutar migraciones de Prisma

```bash
npx prisma migrate dev --name init
```

Esto crea las tablas en la base de datos y genera el cliente de Prisma.

## 5. Cargar datos de prueba (seed)

```bash
npm run prisma:seed
```

Crea:

- Un usuario **administrador**: `admin@escuela.edu` / `admin123`
- Un usuario **inspector**: `inspector@escuela.edu` / `inspector123`
- 3 ubicaciones (Edificio A, B y C)
- 5 extintores de ejemplo:
  - `EXT-001`: el extintor de ejemplo del enunciado (CO2, 4.5 kg, vigente)
  - `EXT-002`: vigente
  - `EXT-003`: próximo a vencer (vence en 15 días)
  - `EXT-004`: vencido
  - `EXT-005`: requiere mantenimiento (detectado en una inspección)
- 2 inspecciones históricas de ejemplo

## 6. Ejecutar el proyecto

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000). Redirige a `/login`.
Iniciar sesión con cualquiera de los usuarios del seed.

Para escanear un QR de prueba sin celular: ir a
`/dashboard/extintores/EXT-001/qr` y usar la lectura de código QR del celular
apuntando a la pantalla, o simplemente navegar a `/extintor/EXT-001`.

---

## Arquitectura

```
prisma/
  schema.prisma        Modelos de datos y relaciones
  seed.ts               Datos de prueba

src/
  app/
    login/              Página de inicio de sesión
    dashboard/           Zona protegida (requiere sesión)
      layout.tsx          Nav + verificación de sesión
      page.tsx            Dashboard con tarjetas y alertas
      extintores/
        page.tsx           Listado + filtros + buscador
        nuevo/              Alta de extintor (solo ADMIN)
        [codigo]/
          editar/            Edición (solo ADMIN)
          qr/                Ver / descargar / imprimir QR
      usuarios/            Gestión de usuarios (solo ADMIN)
    extintor/[codigo]/
      page.tsx            Ficha pública, mobile-first (la URL del QR)
      inspeccion/           Formulario de inspección (requiere sesión)
    api/                  Route Handlers (API REST)
      auth/{login,logout,me}/
      extintores/
        route.ts            GET (lista) / POST (crear)
        [codigo]/
          route.ts            GET / PUT / DELETE
          qr/route.ts          GET → imagen PNG del QR
          inspecciones/route.ts GET (historial) / POST (nueva inspección)
      ubicaciones/route.ts
      usuarios/{route.ts,[id]/route.ts}
      dashboard/route.ts    Estadísticas agregadas
      alertas/route.ts      Extintores por vencer / vencidos / con problemas
      cron/alertas/route.ts Endpoint para scheduler externo (ver más abajo)
    proxy.ts              (antes "middleware") protege /dashboard/**

  components/
    ui/                  Button, Input, Select, Textarea, Card, Badge
    layout/              Navegación del panel
    dashboard/           Tarjetas de estadísticas, filtros, tabla
    extintor/            EstadoBadge, formulario y QR, checklist de
                          inspección, historial
    usuarios/            Gestión de usuarios

  lib/
    prisma.ts            Cliente de Prisma (singleton)
    auth.ts              Sesión (JWT), hash de contraseñas
    estado.ts            Cálculo del estado del extintor (VERDE/AMARILLO/ROJO)
    qr.ts                 Generación de códigos QR
    constants.ts          Enums de UI, checklist de inspección
    api-helpers.ts        Helpers de autorización y manejo de errores en API
    services/             Lógica de negocio reutilizada por páginas y API
    validations/           Esquemas zod
```

### Relaciones de base de datos

- Una **Ubicación** tiene muchos **Extintores** (1—N).
- Un **Extintor** tiene muchas **Inspecciones** (1—N). Nunca se eliminan: al
  "eliminar" un extintor desde el panel se hace una baja lógica (`activo =
  false`) para preservar el historial.
- Un **Usuario** realiza muchas **Inspecciones** (1—N).
- Una **Inspección** pertenece a un único Extintor y un único Usuario
  (inspector), y tiene muchas **RespuestasInspeccion** (una por pregunta del
  checklist).

### Cálculo del estado (`src/lib/estado.ts`)

El estado **nunca** se guarda como texto libre. Se calcula en el backend a
partir de `fechaVencimiento` y del flag `requiereMantenimiento`:

- `requiereMantenimiento = true` → **Requiere mantenimiento** (⚠️, tiene
  prioridad sobre el semáforo de vencimiento)
- vencimiento pasado → **Vencido** (🔴)
- vencimiento en ≤ 30 días → **Próximo a vencer** (🟡)
- en cualquier otro caso → **Vigente** (🟢)

`requiereMantenimiento` se activa automáticamente cuando una inspección
responde "mal" alguna de las preguntas críticas del checklist (ver
`src/lib/services/inspeccion.service.ts` → `detectaProblema`).

### Roles y permisos

| Acción                          | Sin sesión | Inspector | Administrador |
| -------------------------------- | :--------: | :-------: | :------------: |
| Ver ficha pública del extintor    | ✅         | ✅        | ✅              |
| Ver historial de inspecciones     | ✅         | ✅        | ✅              |
| Realizar una inspección           | ❌         | ✅        | ✅              |
| Ver dashboard / listado           | ❌         | ✅        | ✅              |
| Crear / editar / dar de baja      | ❌         | ❌        | ✅              |
| Ver / descargar / imprimir QR     | ❌         | ✅        | ✅              |
| Administrar usuarios              | ❌         | ❌        | ✅              |

La autorización se aplica en **dos capas**: `src/proxy.ts` (antes
`middleware.ts`) redirige en el borde de rutas de página, y cada Route
Handler vuelve a validar sesión/rol con `exigirSesion` / `exigirRol` — nunca
se confía solo en el frontend.

### Alertas y tareas programadas

`GET /api/alertas` calcula en vivo los extintores próximos a vencer, vencidos
y con mantenimiento pendiente, y se usa en el dashboard.

Para automatizar esto diariamente ya existe `GET /api/cron/alertas`, pensado
para ser llamado por un scheduler externo (Vercel Cron, cron-job.org, un cron
de servidor, etc.). Hoy solo registra un resumen en el log del servidor; el
punto de extensión para agregar **envío de correo electrónico o
notificaciones** está marcado con un `TODO` en
`src/app/api/cron/alertas/route.ts`. Ejemplo de configuración en Vercel
(`vercel.json`):

```json
{ "crons": [{ "path": "/api/cron/alertas", "schedule": "0 7 * * *" }] }
```

## Endpoints principales

```
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

GET    /api/extintores                 ?busqueda=&edificio=&estado=&tipoAgente=
POST   /api/extintores                 (ADMIN)
GET    /api/extintores/:codigo
PUT    /api/extintores/:codigo         (ADMIN)
DELETE /api/extintores/:codigo         (ADMIN, baja lógica)

GET    /api/extintores/:codigo/inspecciones
POST   /api/extintores/:codigo/inspecciones   (requiere sesión)

GET    /api/extintores/:codigo/qr      (imagen PNG)

GET    /api/ubicaciones
POST   /api/ubicaciones                (ADMIN)

GET    /api/usuarios                   (ADMIN)
POST   /api/usuarios                   (ADMIN)
PUT    /api/usuarios/:id               (ADMIN)
DELETE /api/usuarios/:id               (ADMIN, baja lógica)

GET    /api/dashboard
GET    /api/alertas
GET    /api/cron/alertas               (para scheduler externo)
```

## Decisiones de arquitectura

- **Autenticación propia en vez de NextAuth/Auth.js**: el proyecto corre
  sobre Next.js 16 y React 19, versiones muy recientes al momento de crear
  este proyecto. Para evitar el riesgo de incompatibilidades de una librería
  de terceros con un framework tan nuevo, la sesión se implementó con un JWT
  firmado (`jose`, compatible con el runtime de Proxy) guardado en una cookie
  `httpOnly`, y `bcryptjs` para el hash de contraseñas. Es un enfoque estándar
  y con menos piezas móviles. Si más adelante se prefiere Auth.js, la lógica
  está aislada en `src/lib/auth.ts` y `src/proxy.ts`, lo que facilita el
  reemplazo.
- **Prisma 6.19.3 (no 7.x)**: al iniciar el proyecto, `prisma@latest` resolvía
  a un release candidate de la versión 7, que además introduce un cambio
  incompatible (ya no permite `url` en el `datasource` del schema, exige
  "driver adapters" configurados en `prisma.config.ts`). Se fijó la versión
  estable `6.19.3` para mantener el flujo tradicional de Prisma
  (`schema.prisma` + `DATABASE_URL` + `prisma migrate`).
- **Fotografías como URL, no upload de archivos**: el campo `foto` guarda una
  URL (por ejemplo, a un bucket S3/Cloudinary). No se implementó subida de
  binarios porque el enunciado no especificó un proveedor de almacenamiento;
  agregar un endpoint de upload es un paso natural antes de producción.
- **Baja lógica, no DELETE físico**: extintores y usuarios se desactivan
  (`activo = false`) en vez de borrarse, para no perder el historial de
  inspecciones asociado.

## Próximos pasos sugeridos para producción

1. Subida de fotografías (S3, Cloudinary, o Vercel Blob) en vez de URL manual.
2. Envío de correo electrónico desde `/api/cron/alertas` (Resend, SES, etc.).
3. Rate limiting en `/api/auth/login`.
4. Tests automatizados (Vitest/Playwright).
5. Rotar `AUTH_SECRET` real en el entorno de despliegue (nunca commitear `.env`).
