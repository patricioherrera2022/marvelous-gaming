# Marvelous Gaming — E-commerce Pokémon TCG & Gaming

Tienda e-commerce desarrollada con **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, **TCGdex API v2** y **Supabase** para la venta de:
- **Cartas sueltas Pokémon TCG** organizadas por Series/Eras y Expansiones con sus logos oficiales.
- **Productos sellados TCG** (ETBs, Booster Boxes, Sobres, Tins, Sleeves, Toploaders).
- **Juegos PS4, PS5 y Accesorios** (con modo *Próximamente* activable/desactivable desde el Dashboard).

---

## 1. Inicio rápido en local (sin configurar Supabase todavía)

```bash
npm install
npm run dev
```

La tienda queda disponible en `http://localhost:3000`.
Sin credenciales de Supabase configuradas, funciona automáticamente en **Modo Local + TCGdex en vivo**, persistiendo tus cambios del Dashboard en `data/local-store.json`.

---

## 2. Acceso al Dashboard Oculto (`/adminfacu`)

- Ruta oculta sin enlaces en la tienda pública y bloqueada para buscadores (`robots.txt` + `X-Robots-Tag: noindex, nofollow`).
- URL: `http://localhost:3000/adminfacu`
- Credenciales por defecto en Modo Local (configurables en `.env.local`):
  - **Email:** `facu@marvelousgaming.com` (o `admin@marvelousgaming.com`)
  - **Contraseña:** `marvelous2026` (`LOCAL_ADMIN_PASSWORD`)

---

## 3. Conectar Supabase + Importar las ~20.000+ cartas de todas las expansiones

1. Copiá `.env.example` a `.env.local` y completá:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_ALLOWED_EMAILS=facu@marvelousgaming.com,tuemail@gmail.com`
   - `ADMIN_SESSION_SECRET` (una clave larga aleatoria)
2. En tu proyecto de Supabase → **SQL Editor**, ejecutá completo el archivo `supabase/schema.sql`.
3. En **Authentication → Users** de Supabase, creá los usuarios para vos y tu cliente, y registralos en la tabla `admin_users`:
   ```sql
   insert into public.admin_users (email, name) values
   ('facu@marvelousgaming.com', 'Facu'),
   ('tuemail@gmail.com', 'Dev');
   ```
4. Importá todas las Series, Expansiones (con logos/símbolos) y Cartas desde TCGdex hacia Supabase:
   ```bash
   npm run sync:tcgdex
   ```
   *(Podés probar con una sola expansión primero usando `node scripts/sync-tcgdex.mjs --set=sv03.5 --details`)*

---

## 4. Configurar Mercado Pago

Agregá en `.env.local`:
```env
MERCADOPAGO_ACCESS_TOKEN=tu_access_token_de_mercadopago
NEXT_PUBLIC_SITE_URL=https://tudominio.com
```
> **Importante:** Nunca subas `.env.local` ni tokens reales al repositorio Git. Si habías usado un token en versiones anteriores, rotalo desde Mercado Pago Developers.
