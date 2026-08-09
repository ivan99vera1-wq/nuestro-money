# NUESTRO MONEY 💚

Banca privada digital para parejas. **Una única cuenta compartida** para
controlar vuestro dinero en efectivo. Privada, segura y premium — para
Xiomara e Iván.

> Esta aplicación **no** es una cuenta bancaria real: no se conecta a bancos,
> no realiza transferencias. Es un registro y control del dinero común.

## Regla fundamental

Todo el dinero pertenece al fondo común: **no existen saldos, aportes ni gastos
individuales**. `created_by`/`updated_by` se guardan únicamente por auditoría.

```
SALDO = Σ(ingresos) − Σ(gastos)
```

Objetivos y presupuestos son apartados virtuales: nunca crean ni mueven dinero.

## Tecnologías

React 19 · TypeScript (strict) · Vite 8 · Tailwind CSS v4 · Supabase
(PostgreSQL + Auth + RLS) · Recharts · PWA · GitHub Pages · Vitest.

## Documentación

| Documento | Contenido |
|---|---|
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | Arquitectura completa, decisiones, estructura |
| [`DATABASE.md`](DATABASE.md) | Modelo de datos, RLS, triggers, RPC |
| [`DEPLOYMENT.md`](DEPLOYMENT.md) | Estrategia de despliegue y puesta en marcha |
| [`.env.example`](.env.example) | Variables de entorno necesarias |
| [`supabase/migrations/`](supabase/migrations/) | Esquema SQL con RLS |

## Puesta en marcha

```bash
npm install
cp .env.example .env.local   # rellena VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
npm run dev
```

Scripts:

```bash
npm run dev            # servidor de desarrollo
npm run build          # typecheck + build de producción
npm run typecheck      # TypeScript estricto
npm run lint           # oxlint
npm run test:run       # tests (Vitest)
npm run pwa:generate   # regenera los iconos PWA desde public/logo-source.svg
```

El despliegue a GitHub Pages es automático vía GitHub Actions al hacer push a
`main` (ver `DEPLOYMENT.md`).

## Estado del proyecto

- **FASE 1 (completada):** arquitectura, base de datos con RLS, despliegue,
  estructura del proyecto y configuración.
- **FASE 2 (en curso):** implementación completa de la aplicación.
