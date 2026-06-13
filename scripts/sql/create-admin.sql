-- =============================================
-- create-admin.sql — Crea usuario administrador
-- 
-- Credenciales:
--   Email:    admin@elijocreer.com
--   Password: admin123
--
-- Uso: docker exec -i postgres psql -U n8n_user -d elijocreer < scripts/sql/create-admin.sql
-- También requiere ADMIN_EMAILS="admin@elijocreer.com" en .env.local
-- =============================================

-- 1. Crear usuario en tabla Auth.js
INSERT INTO "user" (id, name, email, "emailVerified", image)
VALUES (
  'admin-0000-0000-0000-000000000001',
  'Admin',
  'admin@elijocreer.com',
  NOW(),
  NULL
)
ON CONFLICT (email) DO UPDATE SET name = 'Admin';

-- 2. Crear cuenta credentials con bcrypt hash de "admin123"
INSERT INTO account ("userId", type, provider, "providerAccountId", access_token)
VALUES (
  'admin-0000-0000-0000-000000000001',
  'credentials',
  'credentials',
  'admin@elijocreer.com',
  '$2b$10$PWPxy0z1WC3MZNcZkqNpNeTYc44aQO8iO.iKnzL1mJECSr7uXZncy'
)
ON CONFLICT (provider, "providerAccountId") 
DO UPDATE SET access_token = '$2b$10$PWPxy0z1WC3MZNcZkqNpNeTYc44aQO8iO.iKnzL1mJECSr7uXZncy';

-- 3. Crear perfil con rol admin
INSERT INTO profiles (id, display_name, avatar_url, role)
VALUES (
  'admin-0000-0000-0000-000000000001',
  'Admin',
  NULL,
  'admin'
)
ON CONFLICT (id) DO UPDATE SET role = 'admin', display_name = 'Admin';

-- Verificación
SELECT '✅ Admin listo' as status,
  u.email,
  u.name,
  p.role,
  'admin123' as password
FROM "user" u
JOIN profiles p ON p.id = u.id
JOIN account a ON a."userId" = u.id AND a.provider = 'credentials'
WHERE u.email = 'admin@elijocreer.com';
