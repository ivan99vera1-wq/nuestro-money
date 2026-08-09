# NUESTRO MONEY — Despliegue

> Estrategia de despliegue en producción.

---

## 1. Decisión

**GitHub Pages** (opción 1 de prioridad), porque:

- La aplicación es un **frontend 100 % estático** (React SPA + PWA).
- Toda la lógica sensible, datos y autenticación viven en **Supabase**
  (PostgreSQL + RLS + Auth), un servicio externo.
- **No existe backend propio** → no se necesitan funciones de servidor ni edge
  functions → no se necesita Vercel/Netlify.
- Coste cero, despliegue automático por GitHub Actions, dominio
  `https://<owner>.github.io/<repo>/`.

Vercel solo se adoptaría si en el futuro se requirieran edge functions o un
backend propio; hoy añadiría complejidad sin beneficio.

---

## 2. Topología

```
Browser (PWA instalable)
   │
   ├── GitHub Pages (bundle estático + service worker)
   └── Supabase (REST + Auth + Realtime + PostgreSQL/RLS)
          │
          └── Supabase Auth (email/password, JWT)
```

El `base` del build se calcula automáticamente desde `GITHUB_REPOSITORY`
(variable que GitHub Actions expone), así `vite build` genera rutas correctas
para `/<repo>/`.

---

## 3. Variables de entorno (públicas, seguras para frontend)

| Variable | Dónde se define | Nota |
|---|---|---|
| `VITE_SUPABASE_URL` | Repo → Settings → **Variables** | Pública (RLS protege los datos) |
| `VITE_SUPABASE_ANON_KEY` | Repo → Settings → **Variables** | Anon key, pública por diseño |
| `VITE_APP_VERSION` | Repo → Settings → **Variables** | Opcional |

> Al ser variables `VITE_*`, viajan en el bundle **a propósito**: son las claves
> públicas del proyecto Supabase. La seguridad real la aporta el RLS. La clave
> **service_role** y las contraseñas **nunca** deben configurarse aquí ni en
> `.env`.

Local: `.env.local` (ver `.env.example`). El `define` de `vite.config.ts`
inyecta las variables en el cliente.

---

## 4. Pipeline (GitHub Actions)

Fichero: `.github/workflows/ci.yml`.

```
push / PR → [quality] npm ci → lint → typecheck → tests → build
                       │
          push a main  ▼
        ┌─── [deploy] build (con variables reales) → upload artifact → deploy-pages
```

- `quality`: corre en **todo push y PR** (puerta de calidad).
- `deploy`: corre **solo en push a `main`** y después de que `quality` pase.
- Permisos: `pages: write`, `id-token: write` (deploy con OIDC).
- `actions/configure-pages`, `upload-pages-artifact`, `deploy-pages`.

---

## 5. Guía de puesta en marcha (una vez)

### 5.1 Supabase
1. Crear proyecto en https://supabase.com.
2. Aplicar `supabase/migrations/0000_init.sql` (SQL Editor o CLI).
3. Copiar `Project URL` y `anon public key` desde Settings → API.

### 5.2 GitHub
1. Subir el repositorio a GitHub (rama `main`).
2. **Settings → Pages → Source: GitHub Actions**.
3. **Settings → Secrets and variables → Actions → Variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_APP_VERSION` (opcional)

### 5.3 Push
```bash
git push origin main
```
El workflow despliega automáticamente. URL final:
`https://<owner>.github.io/<repo>/`.

---

## 6. SPA routing en GitHub Pages

Se usa **HashRouter**: las rutas viven bajo `/#/` (`/#/dashboard`,
`/#/login`…). GitHub Pages no necesita reglas de reescritura y el refresh
profundo funciona siempre. Para la app privada este formato de URL es óptimo.

---

## 7. PWA en GitHub Pages

- `manifest.webmanifest` y los iconos (192/512, maskable, apple-touch-icon) se
  generan en `public/` desde `npm run pwa:generate`.
- Workbox precachea el bundle → la app abre offline tras la primera visita.
- Instalable en iOS (Safari → Compartir → Añadir a pantalla de inicio) y
  Android/desktop (prompt de instalación).
- Para una PWA instalable se recomienda **HTTPS** (GitHub Pages lo proporciona).

---

## 8. Seguridad del despliegue

- Sin secretos en el repositorio (`.gitignore` protege `.env*`).
- RLS es la frontera real: aunque el bundle sea público, sin sesión autorizada
  no hay datos.
- Dominio público `.github.io`: los datos viajan por HTTPS; la sesión vive solo
  en el origen del usuario.
- **Recomendación futura**: dominio propio + `Custom domain` en GitHub Pages
  para reforzar privacidad y marca.

---

## 9. Despliegues futuros (estrategia de versiones)

- Cada merge a `main` que supere `quality` genera un **despliegue automático**.
- Las regresiones se detectan antes de desplegar (lint, typecheck, tests, build).
- Rollback: GitHub Pages conserva el historial del artifact; se puede redeployar
  un commit anterior con `git revert`.

---

## 10. Checklist de producción

- [ ] Migración SQL aplicada en Supabase.
- [ ] Variables del repo configuradas (URL + anon key).
- [ ] Pages habilitado con fuente **GitHub Actions**.
- [ ] Build local: `npm run build` OK.
- [ ] Login/registro + creación de pareja + invitación OK en producción.
- [ ] RLS verificado (usuario externo no ve datos).
- [ ] PWA instalable y offline OK.
- [ ] Sin `.env` ni secretos en el historial de git.
