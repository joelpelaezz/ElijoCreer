-- ============================================
-- INIT SQL — Copa Mundial 2026
-- Uso: psql -U user -d db -f init.sql
-- ============================================

-- Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TORNEO
-- ============================================
INSERT INTO tournaments (id, name, slug, year, status, starts_at, ends_at) 
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'Copa Mundial de la FIFA 2026',
    'mundial-2026',
    2026,
    'active',
    '2026-06-11T00:00:00Z',
    '2026-07-19T23:59:59Z'
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- EQUIPOS (112 equipos, 48 con flag_icon)
-- ============================================
INSERT INTO teams (tournament_id, name, short_name, code, flag_icon, crest_url) VALUES
('a0000000-0000-0000-0000-000000000001', 'Mexico', 'MEX', 'MEX', '🇲🇽', 'https://flagicons.lipis.dev/flags/4x3/mx.svg'),
('a0000000-0000-0000-0000-000000000001', 'South Africa', 'RSA', 'RSA', '🇿🇦', 'https://flagicons.lipis.dev/flags/4x3/za.svg'),
('a0000000-0000-0000-0000-000000000001', 'South Korea', 'KOR', 'KOR', '🇰🇷', 'https://flagicons.lipis.dev/flags/4x3/kr.svg'),
('a0000000-0000-0000-0000-000000000001', 'Czech Republic', 'CZE', 'CZE', '🇨🇿', 'https://flagicons.lipis.dev/flags/4x3/cz.svg'),
('a0000000-0000-0000-0000-000000000001', 'Canada', 'CAN', 'CAN', '🇨🇦', 'https://flagicons.lipis.dev/flags/4x3/ca.svg'),
('a0000000-0000-0000-0000-000000000001', 'Bosnia & Herzegovina', 'BIH', 'BIH', '🇧🇦', 'https://flagicons.lipis.dev/flags/4x3/ba.svg'),
('a0000000-0000-0000-0000-000000000001', 'Qatar', 'QAT', 'QAT', '🇶🇦', 'https://flagicons.lipis.dev/flags/4x3/qa.svg'),
('a0000000-0000-0000-0000-000000000001', 'Switzerland', 'SUI', 'SUI', '🇨🇭', 'https://flagicons.lipis.dev/flags/4x3/ch.svg'),
('a0000000-0000-0000-0000-000000000001', 'Brazil', 'BRA', 'BRA', '🇧🇷', 'https://flagicons.lipis.dev/flags/4x3/br.svg'),
('a0000000-0000-0000-0000-000000000001', 'Morocco', 'MAR', 'MAR', '🇲🇦', 'https://flagicons.lipis.dev/flags/4x3/ma.svg'),
('a0000000-0000-0000-0000-000000000001', 'Haiti', 'HAI', 'HAI', '🇭🇹', 'https://flagicons.lipis.dev/flags/4x3/ht.svg'),
('a0000000-0000-0000-0000-000000000001', 'England', 'ENG', 'ENG', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'https://flagicons.lipis.dev/flags/4x3/gb-eng.svg'),
('a0000000-0000-0000-0000-000000000001', 'USA', 'USA', 'USA', '🇺🇸', 'https://flagicons.lipis.dev/flags/4x3/us.svg'),
('a0000000-0000-0000-0000-000000000001', 'Paraguay', 'PAR', 'PAR', '🇵🇾', 'https://flagicons.lipis.dev/flags/4x3/py.svg'),
('a0000000-0000-0000-0000-000000000001', 'Australia', 'AUS', 'AUS', '🇦🇺', 'https://flagicons.lipis.dev/flags/4x3/au.svg'),
('a0000000-0000-0000-0000-000000000001', 'Turkey', 'TUR', 'TUR', '🇹🇷', 'https://flagicons.lipis.dev/flags/4x3/tr.svg'),
('a0000000-0000-0000-0000-000000000001', 'Germany', 'GER', 'GER', '🇩🇪', 'https://flagicons.lipis.dev/flags/4x3/de.svg'),
('a0000000-0000-0000-0000-000000000001', 'Curaçao', 'CUW', 'CUW', '🇨🇼', 'https://flagicons.lipis.dev/flags/4x3/cw.svg'),
('a0000000-0000-0000-0000-000000000001', 'Ivory Coast', 'CIV', 'CIV', '🇨🇮', 'https://flagicons.lipis.dev/flags/4x3/ci.svg'),
('a0000000-0000-0000-0000-000000000001', 'Ecuador', 'ECU', 'ECU', '🇪🇨', 'https://flagicons.lipis.dev/flags/4x3/ec.svg'),
('a0000000-0000-0000-0000-000000000001', 'Netherlands', 'NED', 'NED', '🇳🇱', 'https://flagicons.lipis.dev/flags/4x3/nl.svg'),
('a0000000-0000-0000-0000-000000000001', 'Japan', 'JPN', 'JPN', '🇯🇵', 'https://flagicons.lipis.dev/flags/4x3/jp.svg'),
('a0000000-0000-0000-0000-000000000001', 'Sweden', 'SWE', 'SWE', '🇸🇪', 'https://flagicons.lipis.dev/flags/4x3/se.svg'),
('a0000000-0000-0000-0000-000000000001', 'Tunisia', 'TUN', 'TUN', '🇹🇳', 'https://flagicons.lipis.dev/flags/4x3/tn.svg'),
('a0000000-0000-0000-0000-000000000001', 'Belgium', 'BEL', 'BEL', '🇧🇪', 'https://flagicons.lipis.dev/flags/4x3/be.svg'),
('a0000000-0000-0000-0000-000000000001', 'Egypt', 'EGY', 'EGY', '🇪🇬', 'https://flagicons.lipis.dev/flags/4x3/eg.svg'),
('a0000000-0000-0000-0000-000000000001', 'Iran', 'IRN', 'IRN', '🇮🇷', 'https://flagicons.lipis.dev/flags/4x3/ir.svg'),
('a0000000-0000-0000-0000-000000000001', 'New Zealand', 'NZL', 'NZL', '🇳🇿', 'https://flagicons.lipis.dev/flags/4x3/nz.svg'),
('a0000000-0000-0000-0000-000000000001', 'Spain', 'ESP', 'ESP', '🇪🇸', 'https://flagicons.lipis.dev/flags/4x3/es.svg'),
('a0000000-0000-0000-0000-000000000001', 'Cape Verde', 'CPV', 'CPV', '🇨🇻', 'https://flagicons.lipis.dev/flags/4x3/cv.svg'),
('a0000000-0000-0000-0000-000000000001', 'Saudi Arabia', 'KSA', 'KSA', '🇸🇦', 'https://flagicons.lipis.dev/flags/4x3/sa.svg'),
('a0000000-0000-0000-0000-000000000001', 'Uruguay', 'URU', 'URU', '🇺🇾', 'https://flagicons.lipis.dev/flags/4x3/uy.svg'),
('a0000000-0000-0000-0000-000000000001', 'France', 'FRA', 'FRA', '🇫🇷', 'https://flagicons.lipis.dev/flags/4x3/fr.svg'),
('a0000000-0000-0000-0000-000000000001', 'Senegal', 'SEN', 'SEN', '🇸🇳', 'https://flagicons.lipis.dev/flags/4x3/sn.svg'),
('a0000000-0000-0000-0000-000000000001', 'Iraq', 'IRQ', 'IRQ', '🇮🇶', 'https://flagicons.lipis.dev/flags/4x3/iq.svg'),
('a0000000-0000-0000-0000-000000000001', 'Norway', 'NOR', 'NOR', '🇳🇴', 'https://flagicons.lipis.dev/flags/4x3/no.svg'),
('a0000000-0000-0000-0000-000000000001', 'Argentina', 'ARG', 'ARG', '🇦🇷', 'https://flagicons.lipis.dev/flags/4x3/ar.svg'),
('a0000000-0000-0000-0000-000000000001', 'Algeria', 'ALG', 'ALG', '🇩🇿', 'https://flagicons.lipis.dev/flags/4x3/dz.svg'),
('a0000000-0000-0000-0000-000000000001', 'Austria', 'AUT', 'AUT', '🇦🇹', 'https://flagicons.lipis.dev/flags/4x3/at.svg'),
('a0000000-0000-0000-0000-000000000001', 'Jordan', 'JOR', 'JOR', '🇯🇴', 'https://flagicons.lipis.dev/flags/4x3/jo.svg'),
('a0000000-0000-0000-0000-000000000001', 'Portugal', 'POR', 'POR', '🇵🇹', 'https://flagicons.lipis.dev/flags/4x3/pt.svg'),
('a0000000-0000-0000-0000-000000000001', 'DR Congo', 'COD', 'COD', '🇨🇩', 'https://flagicons.lipis.dev/flags/4x3/cd.svg'),
('a0000000-0000-0000-0000-000000000001', 'Uzbekistan', 'UZB', 'UZB', '🇺🇿', 'https://flagicons.lipis.dev/flags/4x3/uz.svg'),
('a0000000-0000-0000-0000-000000000001', 'Colombia', 'COL', 'COL', '🇨🇴', 'https://flagicons.lipis.dev/flags/4x3/co.svg'),
('a0000000-0000-0000-0000-000000000001', 'Croatia', 'CRO', 'CRO', '🇭🇷', 'https://flagicons.lipis.dev/flags/4x3/hr.svg'),
('a0000000-0000-0000-0000-000000000001', 'Ghana', 'GHA', 'GHA', '🇬🇭', 'https://flagicons.lipis.dev/flags/4x3/gh.svg'),
('a0000000-0000-0000-0000-000000000001', 'Panama', 'PAN', 'PAN', '🇵🇦', 'https://flagicons.lipis.dev/flags/4x3/pa.svg'),
('a0000000-0000-0000-0000-000000000001', 'Scotland', 'SCO', 'SCO', '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'https://flagicons.lipis.dev/flags/4x3/gb-sct.svg')
ON CONFLICT DO NOTHING;

-- Equipos sin flag (64 equipos)
INSERT INTO teams (tournament_id, name, short_name, code, flag_icon, crest_url) VALUES
('a0000000-0000-0000-0000-000000000001', '1A', '1A', '1A', NULL, NULL),
('a0000000-0000-0000-0000-000000000001', '1B', '1B', '1B', NULL, NULL),
('a0000000-0000-0000-0000-000000000001', '1C', '1C', '1C', NULL, NULL),
('a0000000-0000-0000-0000-000000000001', '1D', '1D', '1D', NULL, NULL),
('a0000000-0000-0000-0000-000000000001', '1E', '1E', '1E', NULL, NULL),
('a0000000-0000-0000-0000-000000000001', '1F', '1F', '1F', NULL, NULL),
('a0000000-0000-0000-0000-000000000001', '1G', '1G', '1G', NULL, NULL),
('a0000000-0000-0000-0000-000000000001', '1H', '1H', '1H', NULL, NULL),
('a0000000-0000-0000-0000-000000000001', '1I', '1I', '1I', NULL, NULL),
('a0000000-0000-0000-0000-000000000001', '1J', '1J', '1J', NULL, NULL),
('a0000000-0000-0000-0000-000000000001', '1K', '1K', '1K', NULL, NULL),
('a0000000-0000-0000-0000-000000000001', '1L', '1L', '1L', NULL, NULL),
('a0000000-0000-0000-0000-000000000001', '2A', '2A', '2A', NULL, NULL),
('a0000000-0000-0000-0000-000000000001', '2B', '2B', '2B', NULL, NULL),
('a0000000-0000-0000-0000-000000000001', '2C', '2C', '2C', NULL, NULL),
('a0000000-0000-0000-0000-000000000001', '2D', '2D', '2D', NULL, NULL),
('a0000000-0000-0000-0000-000000000001', '2E', '2E', '2E', NULL, NULL),
('a0000000-0000-0000-0000-000000000001', '2F', '2F', '2F', NULL, NULL),
('a0000000-0000-0000-0000-000000000001', '2G', '2G', '2G', NULL, NULL),
('a0000000-0000-0000-0000-000000000001', '2H', '2H', '2H', NULL, NULL),
('a0000000-0000-0000-0000-000000000001', '2I', '2I', '2I', NULL, NULL),
('a0000000-0000-0000-0000-000000000001', '2J', '2J', '2J', NULL, NULL),
('a0000000-0000-0000-0000-000000000001', '2K', '2K', '2K', NULL, NULL),
('a0000000-0000-0000-0000-000000000001', '2L', '2L', '2L', NULL, NULL),
('a0000000-0000-0000-0000-000000000001', '3A/B/C/D/F', '3A/B/C/D/F', '3A/B/C/D/F', NULL, NULL),
('a0000000-0000-0000-0000-000000000001', '3A/E/H/I/J', '3A/E/H/I/J', '3A/E/H/I/J', NULL, NULL),
('a0000000-0000-0000-0000-000000000001', '3B/E/F/I/J', '3B/E/F/I/J', '3B/E/F/I/J', NULL, NULL),
('a0000000-0000-0000-0000-000000000001', '3C/D/F/G/H', '3C/D/F/G/H', '3C/D/F/G/H', NULL, NULL),
('a0000000-0000-0000-0000-000000000001', '3C/E/F/H/I', '3C/E/F/H/I', '3C/E/F/H/I', NULL, NULL),
('a0000000-0000-0000-0000-000000000001', '3D/E/I/J/L', '3D/E/I/J/L', '3D/E/I/J/L', NULL, NULL),
('a0000000-0000-0000-0000-000000000001', '3E/F/G/I/J', '3E/F/G/I/J', '3E/F/G/I/J', NULL, NULL),
('a0000000-0000-0000-0000-000000000001', '3E/H/I/J/K', '3E/H/I/J/K', '3E/H/I/J/K', NULL, NULL),
('a0000000-0000-0000-0000-000000000001', 'L101', 'L101', 'L101', NULL, NULL),
('a0000000-0000-0000-0000-000000000001', 'L102', 'L102', 'L102', NULL, NULL),
('a0000000-0000-0000-0000-000000000001', 'W73', 'W73', 'W73', NULL, NULL),
('a0000000-0000-0000-0000-000000000001', 'W74', 'W74', 'W74', NULL, NULL),
('a0000000-0000-0000-0000-000000000001', 'W75', 'W75', 'W75', NULL, NULL),
('a0000000-0000-0000-0000-000000000001', 'W76', 'W76', 'W76', NULL, NULL),
('a0000000-0000-0000-0000-000000000001', 'W77', 'W77', 'W77', NULL, NULL),
('a0000000-0000-0000-0000-000000000001', 'W78', 'W78', 'W78', NULL, NULL),
('a0000000-0000-0000-0000-000000000001', 'W79', 'W79', 'W79', NULL, NULL),
('a0000000-0000-0000-0000-000000000001', 'W80', 'W80', 'W80', NULL, NULL),
('a0000000-0000-0000-0000-000000000001', 'W81', 'W81', 'W81', NULL, NULL),
('a0000000-0000-0000-0000-000000000001', 'W82', 'W82', 'W82', NULL, NULL),
('a0000000-0000-0000-0000-000000000001', 'W83', 'W83', 'W83', NULL, NULL),
('a0000000-0000-0000-0000-000000000001', 'W84', 'W84', 'W84', NULL, NULL),
('a0000000-0000-0000-0000-000000000001', 'W85', 'W85', 'W85', NULL, NULL),
('a0000000-0000-0000-0000-000000000001', 'W86', 'W86', 'W86', NULL, NULL),
('a0000000-0000-0000-0000-000000000001', 'W87', 'W87', 'W87', NULL, NULL),
('a0000000-0000-0000-0000-000000000001', 'W88', 'W88', 'W88', NULL, NULL),
('a0000000-0000-0000-0000-000000000001', 'W89', 'W89', 'W89', NULL, NULL),
('a0000000-0000-0000-0000-000000000001', 'W90', 'W90', 'W90', NULL, NULL),
('a0000000-0000-0000-0000-000000000001', 'W91', 'W91', 'W91', NULL, NULL),
('a0000000-0000-0000-0000-000000000001', 'W92', 'W92', 'W92', NULL, NULL),
('a0000000-0000-0000-0000-000000000001', 'W93', 'W93', 'W93', NULL, NULL),
('a0000000-0000-0000-0000-000000000001', 'W94', 'W94', 'W94', NULL, NULL),
('a0000000-0000-0000-0000-000000000001', 'W95', 'W95', 'W95', NULL, NULL),
('a0000000-0000-0000-0000-000000000001', 'W96', 'W96', 'W96', NULL, NULL),
('a0000000-0000-0000-0000-000000000001', 'W97', 'W97', 'W97', NULL, NULL),
('a0000000-0000-0000-0000-000000000001', 'W98', 'W98', 'W98', NULL, NULL),
('a0000000-0000-0000-0000-000000000001', 'W99', 'W99', 'W99', NULL, NULL),
('a0000000-0000-0000-0000-000000000001', 'W100', 'W100', 'W100', NULL, NULL),
('a0000000-0000-0000-0000-000000000001', 'W101', 'W101', 'W101', NULL, NULL),
('a0000000-0000-0000-0000-000000000001', 'W102', 'W102', 'W102', NULL, NULL)
ON CONFLICT DO NOTHING;

\echo 'Init SQL cargado: 1 torneo + 112 equipos (48 con flag_icon)'

-- =============================================
-- ADMIN USER
-- Email: admin@elijocreer.com / Password: admin123
-- =============================================

INSERT INTO "user" (id, name, email, "emailVerified", image)
VALUES ('admin-0000-0000-0000-000000000001', 'Admin', 'admin@elijocreer.com', NOW(), NULL)
ON CONFLICT (email) DO UPDATE SET name = 'Admin';

INSERT INTO account ("userId", type, provider, "providerAccountId", access_token)
VALUES ('admin-0000-0000-0000-000000000001', 'credentials', 'credentials', 'admin@elijocreer.com',
        '$2b$10$PWPxy0z1WC3MZNcZkqNpNeTYc44aQO8iO.iKnzL1mJECSr7uXZncy');

INSERT INTO profiles (id, display_name, avatar_url, role)
VALUES ('admin-0000-0000-0000-000000000001', 'Admin', NULL, 'admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin', display_name = 'Admin';

\echo 'Admin user creado: admin@elijocreer.com / admin123'