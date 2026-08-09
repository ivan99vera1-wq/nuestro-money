# NUESTRO MONEY — Base de datos

> PostgreSQL 15+ vía Supabase. Esquema completo en
> `supabase/migrations/0000_init.sql` (una migración idempotente y ordenada).

---

## 1. Principios

1. **Dinero = `bigint` en céntimos** (minor units). Nunca `float`, nunca `numeric` con decimales sueltos.
2. **RLS en todas las tablas.** Sin pertenencia a la pareja no se lee nada.
3. **`created_by` / `updated_by` son solo auditoría.** Se rellenan por trigger
   con `auth.uid()` — el cliente no puede falsificarlos.
4. **Integridad monetaria en la BD**: `SALDO = Σ(ingresos) − Σ(gastos)` y un
   gasto no puede dejar el saldo negativo.
5. **Objetivos y presupuestos son virtuales**: nunca crean ni mueven dinero.

---

## 2. Diagrama de relaciones

```
auth.users (Supabase)
   │ 1:1
   ▼
profiles ──┬──────────────────────────────────────────────┐
           │                                               │
           │ couple_members ── many:1 ──► couples          │
           │   (user_id UNIQUE → 1 pareja por usuario)     │
           │   (max 2 miembros, forzado en accept_invite)  │
           │                                               │
           ▼                                               ▼
      transactions ──► couple_id ───────────────► couples  │
      budgets      ──► couple_id ───────────────► couples  │
      savings_goals──► couple_id ───────────────► couples  │
      notifications──► couple_id ───────────────► couples  │
      invites      ──► couple_id ───────────────► couples  │
      categories (catálogo de referencia, solo lectura)
```

Todas las tablas de dominio cuelgan de `couples` (`couple_id` NOT NULL, FK
`ON DELETE CASCADE`). RLS: `is_couple_member(couple_id)`.

---

## 3. Tablas

### `profiles`
Extiende a `auth.users` (insert por trigger `handle_new_user`).

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | = `auth.users.id` |
| `full_name` | text | Nombre mostrado en el saludo de pareja |
| `avatar_url` | text | Opcional |
| `currency` | text | ISO 4217, default `EUR` |
| `created_at` / `updated_at` | timestamptz | |

### `couples`
La **única cuenta compartida**.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `name` | text | Default `Nuestro Money` |
| `currency` | text | Default `EUR` (arquitectura multi-moneda) |
| `invite_code` | text UNIQUE | Reservado |
| `created_by` | uuid → profiles | Auditoría |
| `created_at` / `updated_at` | timestamptz | |

### `couple_members`
Pertenencia. **Clave del modelo de pareja.**

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `couple_id` | uuid FK → couples | CASCADE |
| `user_id` | uuid FK → profiles | **UNIQUE** → un usuario, una pareja |
| `role` | text | `owner` \| `member` (solo informativo) |
| `joined_at` | timestamptz | |

UNIQUE `(couple_id, user_id)`. Escrituras **solo** vía RPC `create_couple` /
`accept_invite` (no hay políticas INSERT/UPDATE/DELETE → no escalable por el
cliente).

### `categories`
Catálogo de referencia sincronizado con `src/config/constants.ts`.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `type` | text | `income` \| `expense` |
| `key` | text | Clave estable (ej. `salary`, `food`) |
| `label` | text | Texto visible |
| `icon` / `color` | text | Mapeo a lucide/tailwind |
| `sort_order` | int | |

UNIQUE `(type, key)`.

### `transactions`
El corazón de la cuenta compartida.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `couple_id` | uuid FK → couples | CASCADE |
| `type` | text | `income` \| `expense` (CHECK) |
| `amount` | bigint | **Céntimos**, CHECK `amount > 0` |
| `category` | text | Clave de categoría |
| `description` | text | |
| `date` | date | Fecha de negocio (distinta de `created_at`) |
| `note` | text | Opcional |
| `created_by` | uuid FK → profiles | **Auditoría** (trigger) |
| `created_at` | timestamptz | |
| `updated_by` | uuid FK → profiles | **Auditoría** (trigger) |
| `updated_at` | timestamptz | |
| `deleted_at` | timestamptz | Soft-delete (auditoría completa) |

Índices: `(couple_id, date desc)`, `(couple_id, type)`, `(couple_id, category)`,
`(couple_id, deleted_at)`.

**Integridad**: el trigger `enforce_balance_rule` (BEFORE INSERT/UPDATE)
recalcula el balance y lanza `INSUFFICIENT_BALANCE` si un gasto lo dejaría
negativo. El trigger `set_audit_columns` fija `created_by`/`updated_by`.

### `budgets`
Límite mensual virtual por categoría. **No modifica el saldo.**

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `couple_id` | uuid FK → couples | CASCADE |
| `category` | text | |
| `limit` | bigint | Céntimos, CHECK `> 0` |
| `created_at` / `updated_at` | timestamptz | |

UNIQUE `(couple_id, category)`.

### `savings_goals`
Reserva mental dentro del fondo. **No crea dinero.**

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `couple_id` | uuid FK → couples | CASCADE |
| `name` | text | |
| `target_amount` | bigint | Céntimos, CHECK `> 0` |
| `current_amount` | bigint | Céntimos, default 0, CHECK `>= 0` |
| `target_date` | date | Opcional |
| `icon` / `color` | text | Opcional |
| `created_by` / `created_at` / `updated_by` / `updated_at` | | Auditoría |

CHECK `current_amount <= target_amount`. Trigger `savings_goals_achieved_notify`
crea notificación al alcanzar el 100 %.

### `notifications`
Notificaciones internas, en lenguaje de pareja.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `couple_id` | uuid FK → couples | CASCADE |
| `user_id` | uuid FK → profiles | `NULL` = para toda la pareja |
| `type` | text | `transaction` \| `goal` \| `budget` \| `invite` \| `system` |
| `title` / `body` | text | |
| `icon` | text | |
| `payload` | jsonb | Datos estructurados (id tx, importe, …) |
| `read_at` | timestamptz | Marca de leída |
| `created_at` | timestamptz | |

Las crea la BD (triggers) y la app (invites/sistema). RLS: legibles por la
pareja; `user_id` filtra las personales.

### `invites`
Invitaciones por email al fondo compartido.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `couple_id` | uuid FK → couples | CASCADE |
| `inviter_id` | uuid FK → profiles | |
| `email` | text | Normalizado a minúsculas |
| `token` | text UNIQUE | `encode(gen_random_bytes(24),'hex')` |
| `status` | text | `pending` \| `accepted` \| `expired` \| `cancelled` |
| `created_at` / `expires_at` | timestamptz | Expira a los 7 días |
| `accepted_by` / `accepted_at` | | |

---

## 4. RLS (Row Level Security)

Todas las tablas: `enable row level security`. Helper:

```sql
is_couple_member(_couple_id uuid) → existe couple_members con auth.uid()
```

| Tabla | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `profiles` | propios o de mi pareja | propios | propios | — |
| `couples` | miembros | — | miembros | — |
| `couple_members` | miembros | — (RPC) | — | — |
| `categories` | autenticados | — | — | — |
| `transactions` | miembros | miembros | miembros | miembros |
| `budgets` | miembros | miembros | miembros | miembros |
| `savings_goals` | miembros | miembros | miembros | miembros |
| `notifications` | miembros (filtra `user_id`) | — | miembros (solo `read_at`) | — |
| `invites` | miembros **o** email del JWT | — | — | — |

Nunca hay políticas de escritura en `couple_members`/`invites`: la pertenencia
solo cambia por RPC `SECURITY DEFINER` (`create_couple`, `accept_invite`) con
validaciones autoritativas (sesión, cupo de 2, coincidencia de email, caducidad).

---

## 5. RPC (funciones)

| Función | Devuelve | Propósito |
|---|---|---|
| `create_couple(name, currency)` | `uuid` | Crea `couples` + `couple_members` (owner) |
| `invite_partner(email)` | `void` | Genera invitación pendiente (7 días) |
| `accept_invite(token)` | `uuid` | Valida token+email, añade 2º miembro, marca aceptada |
| `get_balance(couple_id)` | `{balance, income, expense}` | Agregado de transacciones activas |
| `get_couple_stats(couple_id)` | `{member_count, first_name, second_name}` | Nombres para el saludo |

`get_balance` y `get_couple_stats` son `SECURITY INVOKER` (respetan RLS):
un usuario solo ve datos de su pareja.

---

## 6. Triggers

| Trigger | Tabla | Efecto |
|---|---|---|
| `on_auth_user_created` | auth.users | Crea el perfil al registrarse |
| `*_set_updated_at` | couples, profiles, budgets | Mantiene `updated_at` |
| `transactions_audit` | transactions | Fija `created_by`/`updated_by`/timestamps |
| `transactions_balance_rule` | transactions | Bloquea gastos que quiebren el saldo |
| `transactions_notify` | transactions | Crea notificación de ingreso/gasto |
| `savings_goals_audit` | savings_goals | Auditoría |
| `savings_goals_achieved_notify` | savings_goals | Notifica al alcanzar el objetivo |

---

## 7. Consultas de negocio (servicio SQL)

- **Balance**: `SELECT * FROM get_balance(couple_id)`.
- **Resumen del mes**: en la app, filtrando transacciones por rango de fechas y
  agregando con `sumSigned`.
- **Gastos por categoría**: agregado de `transactions` por `category`.
- **Gastos del mes por categoría** (para presupuestos): `WHERE type='expense'
  AND date >= inicio_mes` agrupado por `category`.
- **Evolución del saldo**: en la app se calcula el saldo acumulado por día
  (serie temporal desde `get_balance` + movimientos del rango).

---

## 8. Multi-moneda

El esquema guarda `currency` (ISO 4217) en `couples` y `profiles`. Los montos
siempre se almacenan en **minor units** de esa moneda (`digits`: EUR 2, USD 2,
COP 0, PYG 0, GBP 2). El formateo usa `Intl.NumberFormat`. La app soporta hoy
`EUR` como moneda principal y la arquitectura queda lista para añadir el resto.

---

## 9. Testing de la base de datos

- Los invariantes financieros (saldo, rechazo de sobregasto, objetivos que no
  crean dinero) se cubren con tests unitarios en la app **y** scripts SQL de
  verificación en `supabase/tests/` (pgTAP) para ejecutar contra el proyecto.
- RLS se valida con scripts SQL: intentar SELECT de otra pareja debe devolver
  0 filas; INSERT directo en `couple_members` debe fallar (sin política).
- Documento de ejecución en `DATABASE.md` → se aplican con el SQL Editor de
  Supabase o CLI (`supabase db push`).

---

## 10. Cómo aplicar el esquema

**Opción A (SQL Editor de Supabase):** abrir el proyecto → SQL Editor → pegar
`supabase/migrations/0000_init.sql` → Run.

**Opción B (Supabase CLI, requiere token):** `supabase link --project-ref <ref>`
→ `supabase db push`.

Después de aplicar, la app solo necesita `VITE_SUPABASE_URL` y
`VITE_SUPABASE_ANON_KEY` (públicas, protegidas por RLS).
