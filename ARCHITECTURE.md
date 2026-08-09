# NUESTRO MONEY — Arquitectura

> Banca privada digital para parejas. Una única cuenta de dinero compartida.
> Aplicación privada para Xiomara e Iván — **no** es una cuenta bancaria real,
> **no** se conecta a bancos y **no** realiza transferencias.

---

## 1. Visión general

`Nuestro Money` es una aplicación web privada (PWA) que registra y controla el
**dinero en efectivo común** de una pareja bajo **una única cuenta compartida**.

Regla fundamental que condiciona toda la arquitectura:

> **TODO el dinero pertenece al fondo común.** No existen saldos, aportes ni
> gastos individuales. `created_by` / `updated_by` se registran **exclusivamente
> para auditoría** y **nunca** se usan para repartir, separar o calcular el dinero.

Fórmula de integridad financiera (única fuente de verdad):

```
SALDO = Σ(ingresos) − Σ(gastos)
```

Objetivos y presupuestos son **apartados virtuales**: no crean ni mueven dinero.

---

## 2. Decisiones tecnológicas

| Capa            | Tecnología                                      | Justificación |
|-----------------|-------------------------------------------------|---------------|
| Frontend        | React 19 + TypeScript (strict)                   | Ecosistema maduro, tipado fuerte para datos financieros |
| Build           | Vite 8                                           | Rápido, PWA nativa vía plugin, build estático |
| Estilos         | Tailwind CSS v4 + tema semántico propio          | Design tokens premium, modo oscuro por clase |
| Routing         | React Router 7 (**HashRouter**)                  | 100 % fiable en GitHub Pages sin config de servidor |
| Backend / DB    | **Supabase** (PostgreSQL)                        | Auth + RLS + realtime en una plataforma; sin servidor propio |
| Base de datos   | PostgreSQL 15+                                   | RLS por fila, funciones SQL, integridad monetaria en DB |
| Autenticación   | Supabase Auth (email + contraseña)               | Sesiones seguras, reset de contraseña, JWT |
| Gráficas        | Recharts 3                                       | Componentes React, ligera y suficiente para dashboards |
| Iconos          | lucide-react                                     | Iconos minimalistas premium |
| Fuentes         | @fontsource Inter + Sora (self-hosted)           | Offline (PWA) sin dependencia de Google Fonts |
| PWA             | vite-plugin-pwa (Workbox)                        | Instalable en iOS/Android, offline, splash |
| Exportación     | CSV (nativo) + jsPDF/autotable (PDF)             | Informes descargables sin servidor |
| Testing         | Vitest + Testing Library + jsdom                 | Unit + integración del flujo financiero |
| Despliegue      | **GitHub Pages** vía GitHub Actions              | App 100 % estática; Supabase es externo → no necesita server |

**¿Por qué GitHub Pages y no Vercel?** Toda la lógica sensible vive en Supabase
(PostgreSQL + RLS + Auth). El frontend es un bundle estático sin backend
propio. GitHub Pages satisface el despliegue sin coste y de forma automática.
Vercel solo se contemplaría si la arquitectura exigiera edge/server functions,
que **no** es el caso. (Ver `DEPLOYMENT.md`.)

**¿Por qué HashRouter?** GitHub Pages sirve archivos estáticos sin
reglas de SPA. `HashRouter` evita dependencia de `404.html`/redirecciones y
funciona en cualquier profundidad de ruta. Aplicación privada: el formato
`/#/dashboard` no penaliza nada.

**¿Por qué montos en `bigint` (céntimos)?** Evita los errores de coma flotante
de JavaScript (`0.1 + 0.2 !== 0.3`). Todo se almacena y calcula en **enteros en
céntimos** (`€10,50` → `1050`).

---

## 3. Estructura de carpetas

```
.
├── .github/workflows/ci.yml      # Lint + test + build + deploy GH Pages
├── public/                       # PWA icons, favicon, logo source
├── supabase/
│   ├── migrations/0000_init.sql  # Esquema completo + RLS + triggers + RPC
│   └── functions/                # (reservado para edge functions futuras)
├── src/
│   ├── main.tsx                  # Bootstrap (React root)
│   ├── App.tsx                   # Providers + Router
│   ├── index.css                 # Tailwind + design tokens
│   ├── assets/                   # Imágenes/recursos estáticos
│   ├── styles/                   # Fragmentos de CSS global
│   ├── config/                   # env.ts, constants.ts (categorías, monedas)
│   ├── components/
│   │   ├── ui/                   # Button, Input, Select, Modal, Toast, …
│   │   ├── layout/               # Sidebar, BottomNavigation, TopBar, AppShell
│   │   ├── cards/                # BalanceCard, TransactionCard, GoalCard, BudgetCard
│   │   └── charts/               # AreaChart, DonutChart, BarsChart (Recharts)
│   ├── layouts/                  # AuthLayout, OnboardingLayout, AppLayout
│   ├── pages/
│   │   ├── auth/                 # Login, Register, ForgotPassword, ResetPassword
│   │   ├── onboarding/           # CreateCouple, InvitePartner, AcceptInvite
│   │   └── app/                  # Dashboard, Transactions, Stats, Goals, Budgets, …
│   ├── features/                 # Lógica de dominio agrupada
│   │   ├── auth/  couple/  transactions/  goals/  budgets/  stats/
│   │   └── notifications/  export/
│   ├── hooks/                    # useAuth, useBalance, useTransactions, useTheme…
│   ├── services/
│   │   ├── supabase/client.ts    # Cliente Supabase único
│   │   └── api/                  # Capa de datos (auth, couple, transactions…)
│   ├── contexts/                 # Auth, Couple, Theme, Toast, Balance
│   ├── lib/                      # money.ts, format.ts, calendar.ts (puro, testeable)
│   ├── utils/                    # cn.ts y utilidades puras
│   ├── types/                    # database.ts, supabase.ts, domain.ts
│   └── tests/                    # setup, helpers, mocks
├── ARCHITECTURE.md  DATABASE.md  DEPLOYMENT.md  .env.example
```

Principios: separación por responsabilidades, lógica financiera **pura** en
`lib/` (testeable sin DOM), capa de datos aislada en `services/api`, UI
reutilizable en `components/ui`.

---

## 4. Flujo de autenticación

```
Login/Registro (Supabase Auth, email+password)
        │
        ▼
onAuthStateChange → sesión JWT persistida (storageKey: "nuestro-money.auth")
        │
        ▼
¿Es miembro de un couple?  (SELECT couple_members WHERE user_id = auth.uid())
        │
   ├── NO ──→ Onboarding: Crear cuenta compartida (RPC create_couple)
   │              │
   │              ├── Invitar pareja por email (RPC invite_partner)
   │              │       └── El partner acepta desde enlace con token
   │              │               └── RPC accept_invite (valida email + token)
   │              └── Cuando hay 2 miembros → Dashboard compartido
   │
   └── SÍ ──→ App shell (dashboard)
```

- **Protección de rutas**: `ProtectedRoute` redirige a `/login` sin sesión;
  `OnboardingGate` redirige al flujo de creación de couple si no es miembro.
- **Recuperación de contraseña**: Supabase `resetPasswordForEmail` +
  `updateUser` con token de recuperación.
- **Sesiones**: auto-refresh de JWT, detección de sesión en URL para el flujo
  de reset. La sesión vive en `localStorage` del propio origen.
- Un usuario sin couple ve **solo** las pantallas de onboarding.

---

## 5. Cuenta compartida (diseño fundamental)

- `couples` = la cuenta. `couple_members` = quiénes la comparten.
- Reglas en BD:
  - `couple_members.user_id` tiene **UNIQUE** → un usuario pertenece a **una**
    sola pareja.
  - `accept_invite` impide superar **2 miembros** (`COUPLE_FULL`).
  - La pertenencia solo cambia vía RPC (`create_couple`, `accept_invite`),
    nunca por INSERT/UPDATE directo (no hay políticas de escritura).
- **Saludo de pareja**: `get_couple_stats(couple_id)` devuelve los dos nombres →
  `"Buenos días, Xiomara e Iván 👋"`.
- Ambos miembros ven **exactamente el mismo saldo**, movimientos, objetivos y
  presupuestos. El sistema solo guarda internamente quién actuó (auditoría).

---

## 6. Gestión de movimientos

| Operación | Ruta de datos | Reglas |
|---|---|---|
| Crear ingreso | `POST /transactions` (tipo `income`) | `amount > 0` en céntimos, categoría válida |
| Crear gasto | `POST /transactions` (tipo `expense`) | `amount > 0`; **balance − gasto ≥ 0** (valida app **y** trigger SQL) |
| Editar | `PATCH /transactions/:id` | Recalcula balance; trigger `enforce_balance_rule` re-valida |
| Eliminar | Soft-delete (`deleted_at = now()`) | Auditoría completa; recuperable |
| Auditoría | `created_by`/`updated_by`/`created_at`/`updated_at` auto por trigger | Nunca separan dinero |

Categorías: catálogo fijo (ver `config/constants.ts`), sincronizado con la
tabla `categories`. Descripción, nota, fecha de negocio (`date`) e iconos.

Validación en **doble capa** (frontend + backend/RLS/trigger): la app muestra
`"No tienes suficiente dinero disponible para registrar este gasto."` y la BD
rechaza el INSERT si se intentara saltar la validación.

---

## 7. Cálculo del saldo

- Función SQL `get_balance(couple_id)` → `{ balance, income, expense }` sobre
  transacciones **activas** (`deleted_at is null`).
- La app mantiene un contexto reactivo (`BalanceProvider`) que re-consulta
  tras cada mutación (y recibe cambios en tiempo real vía Supabase realtime).
- **Invariante verificable en tests**: `SALDO = INGRESOS − GASTOS` siempre.
- Los objetivos/presupuestos **nunca** tocan este cálculo.

---

## 8. Objetivos y presupuestos (virtuales)

- `savings_goals`: `current_amount` es una **reserva mental** del propio fondo.
  No mueve el saldo. Progreso = `current_amount / target_amount`.
  Trigger de notificación al alcanzar el 100 %.
- `budgets`: límite mensual por categoría. Progreso = gasto del mes / límite.
  Advertencias al 80 % (acercándose), 100 % (alcanzado) y >100 % (superado).
  **Nunca modifican el saldo.**

---

## 9. Estadísticas

Calculadas en el cliente a partir de transacciones (consultas agregadas):
- Evolución del saldo (7d / 30d / 3m / 6m / 1a) — gráfico de área.
- Ingresos vs gastos — barras.
- Gastos por categoría — donut.
- Resumen anual: totales, promedios mensuales, mejor/peor mes, categoría top.
- Calendario financiero por día (ingresos, gastos, balance).

---

## 10. Seguridad

| Riesgo | Mitigación |
|---|---|
| Acceso externo | **RLS en todas las tablas**; sin políticas de lectura sin ser miembro |
| Secretos | Solo variables `VITE_*` públicas; service key **nunca** en el repo |
| Elevación de privilegios | Pertenencias solo vía RPC con validaciones; `WITH CHECK` en políticas |
| Gastos que quiebren el saldo | Trigger `enforce_balance_rule` a nivel de DB |
| Auditoría falsificada | Triggers fijan `created_by`/`updated_by` con `auth.uid()` |
| XSS | React escapa por defecto; sin `dangerouslySetInnerHTML` |
| Validación | Zod-like en servicios + checks de negocio en `lib/` |
| Sesiones | Supabase Auth con JWT auto-refresh, storage propio del origen |

Flujo de autorización en RLS: `is_couple_member(couple_id)` comprueba que
`auth.uid()` esté en `couple_members` de la pareja antes de permitir cualquier
lectura/escritura.

---

## 11. Estado global (frontend)

- `AuthContext` — sesión Supabase + perfil.
- `CoupleContext` — pareja activa, moneda, miembros, stats de saludo.
- `BalanceContext` — saldo reactivo (income/expense/balance) + realtime.
- `ThemeContext` — claro/oscuro, persistido en `localStorage`.
- `ToastContext` — notificaciones UI (feedback de acciones).
- Sin librería de estado global: **Context + hooks** es suficiente y mantiene
  la superficie pequeña. Los datos financieros siempre pasan por los servicios.

---

## 12. PWA

- `vite-plugin-pwa` con `registerType: 'autoUpdate'`.
- Manifiesto: `display: standalone`, colores de marca, iconos 192/512 +
  maskable, apple-touch-icon.
- Offline: precache del bundle (`globPatterns`) — la app se abre sin red.
- Iconos generados desde `public/logo-source.svg` con
  `npm run pwa:generate` (splash/icono de instalación).
- Al ser privada, se desaconseja exponerla a indexado.

---

## 13. Testing

Ver `DATABASE.md` y `DEPLOYMENT.md` para RLS y despliegue. Estrategia:

| Nivel | Qué cubre | Herramienta |
|---|---|---|
| Unit (lib) | `money.ts` (parseo a céntimos, signos, sumas), `format.ts`, filtros, progreso objetivos, progreso presupuestos | Vitest |
| Componentes | Formularios de ingreso/gasto, validación de saldo, ConfirmDialog, estados vacíos | Testing Library |
| Integración | Flujo "ingreso → sube saldo", "gasto → baja saldo", "gasto > saldo → rechazado", "objetivo no crea dinero", autenticación (mock Supabase) | Vitest + mocks |
| RLS (SQL) | Scripts pgTAP en `supabase/tests/` para validar políticas contra una instancia real | pgTAP (manual/CI opcional) |

Comandos: `npm run test` (watch) / `npm run test:run` (CI). Umbral mínimo de
cobertura para la lógica financiera: **90 %**.

---

## 14. Despliegue

Resumen — detalle completo en `DEPLOYMENT.md`:

1. Crear proyecto Supabase, aplicar `supabase/migrations/0000_init.sql`.
2. Crear repositorio GitHub, habilitar **Pages → Deploy from a branch** (Actions).
3. Definir variables públicas del repo: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
4. `git push origin main` → GitHub Actions ejecuta lint, typecheck, tests,
   build y despliega en `https://<owner>.github.io/<repo>/`.
5. La app detecta `base` automáticamente desde `GITHUB_REPOSITORY`.

---

## 15. Hoja de ruta FASE 2 (implementación)

La implementación sigue este documento como plano: bootstrap → tema premium →
auth → cuenta compartida → ingresos/gastos → dashboard → movimientos/filtros →
estadísticas → objetivos → presupuestos → calendario → notificaciones →
exportación → PWA → tests → despliegue. Cualquier desviación se documenta aquí
antes de implementarse.
