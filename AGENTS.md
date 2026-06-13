<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# ElijoCreer — Prode del Mundial 2026

## Stack
- Next.js 16.2.9 (App Router)
- React 19.2.4
- NextAuth v5 (beta) with credentials provider
- Drizzle ORM + PostgreSQL
- Tailwind CSS v4
- TypeScript

## Commands
```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint
npm run db:generate # Drizzle: generate migrations
npm run db:migrate  # Drizzle: run migrations
npm run db:push     # Drizzle: push schema
npm run db:studio   # Drizzle: open GUI
```

## Database

### Local (Docker)
```bash
# Connection: n8n_user:n8n_password@localhost:5432/elijocreer
docker exec -i postgres psql -U n8n_user -d elijocreer
```

### Schema quirks
- **Table name**: `user` (NOT `users`) — Auth.js convention
- Use Drizzle schema exports: `import { users, groups, matches } from "@/lib/db/schema"`
- Drizzle count query: `.select({ value: count() })` NOT `.select({ count: count() })`

### Production
Vercel needs `POSTGRES_URL` environment variable. Without it, all DB queries fail with 500.

## Auth
- Credentials provider with bcrypt comparison
- JWT sessions (strategy: "jwt")
- Session callback adds `user.id` to token
- Admin check: `isAdmin(email)` checks `ADMIN_EMAILS` env var

## Key API Routes
- `/api/admin/*` — Admin panel endpoints (protected by isAdmin)
- `/api/groups/*` — Group management
- `/api/predictions/*` — User predictions
- `/api/matches/*` — Match data
- `/api/auth/*` — NextAuth handlers

## Common Issues
1. **500 on DB queries in production** → Missing POSTGRES_URL in Vercel
2. **Auth failures** → Check account.access_token contains bcrypt hash, not the password
3. **"relation does not exist"** → Using wrong table name (user vs users)
4. **Drizzle count errors** → Wrong syntax, see schema quirks above

## Testing
- Playwright tests in `tests/`
- Vitest available but not heavily used

## Project Structure
```
src/
├── app/              # Next.js App Router pages
│   ├── api/         # API routes
│   ├── admin/       # Admin panel (React client component)
│   └── groups/      # Group pages
├── lib/
│   ├── db/         # Drizzle schema + connection
│   ├── auth/       # NextAuth config
│   └── admin.ts    # isAdmin utility
└── components/      # React components
```
