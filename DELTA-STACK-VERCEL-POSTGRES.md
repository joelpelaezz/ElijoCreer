# Delta de Stack — Supabase → Vercel Postgres

**Motivo**: uniformidad de plataforma (todo en Vercel)

## Cambios

| Aspecto | Antes (Supabase) | Ahora (Vercel Postgres) |
|---------|------------------|------------------------|
| Base de datos | Supabase Postgres | Vercel Postgres |
| ORM | SQL directo / supabase-js | Drizzle ORM |
| Auth | Supabase Auth | Auth.js (NextAuth v5) |
| RLS | Políticas en DB | Middleware + API + Server Actions |
| Admin UI | Dashboard Supabase | Drizzle Studio + seed scripts |
| Migraciones | Supabase CLI | Drizzle Kit |
| Deploy | Vercel + Supabase Cloud | Solo Vercel |

## Nuevas dependencias principales

```json
{
  "dependencies": {
    "@vercel/postgres": "...",
    "drizzle-orm": "...",
    "next-auth": "...",
    "@auth/core": "...",
    "bcryptjs": "..."
  },
  "devDependencies": {
    "drizzle-kit": "...",
    "@types/bcryptjs": "..."
  }
}
```

## Implicancias arquitectónicas

1. **No hay RLS**: la autorización se implementa en el código de la app
2. **Auth manual**: registro, login, sesión y verificación se resuelven con Auth.js
3. **Seed via script**: los datos del fixture se insertan con scripts de Node
4. **Admin global**: se controla por una columna `role` en la tabla `profiles`

## Archivos a crear/modificar

- `drizzle.config.ts` — configuración de Drizzle Kit
- `src/lib/db/schema.ts` — esquema de Drizzle
- `src/lib/db/index.ts` — cliente de base de datos
- `src/lib/auth/config.ts` — configuración de Auth.js
- `src/lib/auth/actions.ts` — helpers de sesión
- `src/app/api/auth/[...nextauth]/route.ts` — route handler de Auth.js
- `src/app/api/auth/register/route.ts` — endpoint de registro
