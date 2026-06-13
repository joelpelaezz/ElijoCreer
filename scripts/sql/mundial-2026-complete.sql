-- ============================================
-- MUNDIAL 2026 — SQL COMPLETO
-- Copa Mundial de la FIFA 2026
-- USA + Mexico + Canada
-- ============================================

-- 1. TORNEO
INSERT INTO tournaments (id, name, slug, year, status, starts_at, ends_at, created_at, updated_at) 
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Copa Mundial 2026',
    'mundial-2026',
    2026,
    'active',
    '2026-06-11T00:00:00Z',
    '2026-07-19T23:59:59Z',
    NOW(),
    NOW()
)
ON CONFLICT (slug) DO UPDATE SET 
    status = 'active',
    starts_at = '2026-06-11T00:00:00Z',
    ends_at = '2026-07-19T23:59:59Z';

-- 2. EQUIPOS CLASIFICADOS (48 equipos)
-- Grupo A (USA, Mexico, Canada, otro)
INSERT INTO teams (tournament_id, name, short_name, code, flag_icon, crest_url) VALUES
('11111111-1111-1111-1111-111111111111', 'USA', 'USA', 'USA', '🇺🇸', 'https://flagicons.lipis.dev/flags/4x3/us.svg'),
('11111111-1111-1111-1111-111111111111', 'Mexico', 'MEX', 'MEX', '🇲🇽', 'https://flagicons.lipis.dev/flags/4x3/mx.svg'),
('11111111-1111-1111-1111-111111111111', 'Canada', 'CAN', 'CAN', '🇨🇦', 'https://flagicons.lipis.dev/flags/4x3/ca.svg'),
('11111111-1111-1111-1111-111111111111', 'Qatar', 'QAT', 'QAT', '🇶🇦', 'https://flagicons.lipis.dev/flags/4x3/qa.svg')
ON CONFLICT DO NOTHING;

-- Grupo B (England, otro x3)
INSERT INTO teams (tournament_id, name, short_name, code, flag_icon, crest_url) VALUES
('11111111-1111-1111-1111-111111111111', 'England', 'ENG', 'ENG', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'https://flagicons.lipis.dev/flags/4x3/gb-eng.svg'),
('11111111-1111-1111-1111-111111111111', 'Iran', 'IRN', 'IRN', '🇮🇷', 'https://flagicons.lipis.dev/flags/4x3/ir.svg'),
('11111111-1111-1111-1111-111111111111', 'Japan', 'JPN', 'JPN', '🇯🇵', 'https://flagicons.lipis.dev/flags/4x3/jp.svg'),
('11111111-1111-1111-1111-111111111111', 'Australia', 'AUS', 'AUS', '🇦🇺', 'https://flagicons.lipis.dev/flags/4x3/au.svg')
ON CONFLICT DO NOTHING;

-- Grupo C (Argentina, otro x3)
INSERT INTO teams (tournament_id, name, short_name, code, flag_icon, crest_url) VALUES
('11111111-1111-1111-1111-111111111111', 'Argentina', 'ARG', 'ARG', '🇦🇷', 'https://flagicons.lipis.dev/flags/4x3/ar.svg'),
('11111111-1111-1111-1111-111111111111', 'Uruguay', 'URU', 'URU', '🇺🇾', 'https://flagicons.lipis.dev/flags/4x3/uy.svg'),
('11111111-1111-1111-1111-111111111111', 'Brazil', 'BRA', 'BRA', '🇧🇷', 'https://flagicons.lipis.dev/flags/4x3/br.svg'),
('11111111-1111-1111-1111-111111111111', 'Colombia', 'COL', 'COL', '🇨🇴', 'https://flagicons.lipis.dev/flags/4x3/co.svg')
ON CONFLICT DO NOTHING;

-- Grupo D (France, otro x3)
INSERT INTO teams (tournament_id, name, short_name, code, flag_icon, crest_url) VALUES
('11111111-1111-1111-1111-111111111111', 'France', 'FRA', 'FRA', '🇫🇷', 'https://flagicons.lipis.dev/flags/4x3/fr.svg'),
('11111111-1111-1111-1111-111111111111', 'Germany', 'GER', 'GER', '🇩🇪', 'https://flagicons.lipis.dev/flags/4x3/de.svg'),
('11111111-1111-1111-1111-111111111111', 'Spain', 'ESP', 'ESP', '🇪🇸', 'https://flagicons.lipis.dev/flags/4x3/es.svg'),
('11111111-1111-1111-1111-111111111111', 'Netherlands', 'NED', 'NED', '🇳🇱', 'https://flagicons.lipis.dev/flags/4x3/nl.svg')
ON CONFLICT DO NOTHING;

-- Grupo E (Portugal, otro x3)
INSERT INTO teams (tournament_id, name, short_name, code, flag_icon, crest_url) VALUES
('11111111-1111-1111-1111-111111111111', 'Portugal', 'POR', 'POR', '🇵🇹', 'https://flagicons.lipis.dev/flags/4x3/pt.svg'),
('11111111-1111-1111-1111-111111111111', 'Belgium', 'BEL', 'BEL', '🇧🇪', 'https://flagicons.lipis.dev/flags/4x3/be.svg'),
('11111111-1111-1111-1111-111111111111', 'Italy', 'ITA', 'ITA', '🇮🇹', 'https://flagicons.lipis.dev/flags/4x3/it.svg'),
('11111111-1111-1111-1111-111111111111', 'Switzerland', 'SUI', 'SUI', '🇨🇭', 'https://flagicons.lipis.dev/flags/4x3/ch.svg')
ON CONFLICT DO NOTHING;

-- Grupo F (Marruecos, otro x3)
INSERT INTO teams (tournament_id, name, short_name, code, flag_icon, crest_url) VALUES
('11111111-1111-1111-1111-111111111111', 'Morocco', 'MAR', 'MAR', '🇲🇦', 'https://flagicons.lipis.dev/flags/4x3/ma.svg'),
('11111111-1111-1111-1111-111111111111', 'Croatia', 'CRO', 'CRO', '🇭🇷', 'https://flagicons.lipis.dev/flags/4x3/hr.svg'),
('11111111-1111-1111-1111-111111111111', 'Denmark', 'DEN', 'DEN', '🇩🇰', 'https://flagicons.lipis.dev/flags/4x3/dk.svg'),
('11111111-1111-1111-1111-111111111111', 'Serbia', 'SRB', 'SRB', '🇷🇸', 'https://flagicons.lipis.dev/flags/4x3/rs.svg')
ON CONFLICT DO NOTHING;

-- Grupo G (Colombia, otro x3)
INSERT INTO teams (tournament_id, name, short_name, code, flag_icon, crest_url) VALUES
('11111111-1111-1111-1111-111111111111', 'Colombia', 'COL2', 'COL', '🇨🇴', 'https://flagicons.lipis.dev/flags/4x3/co.svg'),
('11111111-1111-1111-1111-111111111111', 'Paraguay', 'PAR', 'PAR', '🇵🇾', 'https://flagicons.lipis.dev/flags/4x3/py.svg'),
('11111111-1111-1111-1111-111111111111', 'Ecuador', 'ECU', 'ECU', '🇪🇨', 'https://flagicons.lipis.dev/flags/4x3/ec.svg'),
('11111111-1111-1111-1111-111111111111', 'Venezuela', 'VEN', 'VEN', '🇻🇪', 'https://flagicons.lipis.dev/flags/4x3/ve.svg')
ON CONFLICT DO NOTHING;

-- Grupo H (Africa x2, Asia x1, Concacaf x1)
INSERT INTO teams (tournament_id, name, short_name, code, flag_icon, crest_url) VALUES
('11111111-1111-1111-1111-111111111111', 'Senegal', 'SEN', 'SEN', '🇸🇳', 'https://flagicons.lipis.dev/flags/4x3/sn.svg'),
('11111111-1111-1111-1111-111111111111', 'Nigeria', 'NGA', 'NGA', '🇳🇬', 'https://flagicons.lipis.dev/flags/4x3/ng.svg'),
('11111111-1111-1111-1111-111111111111', 'Cameroon', 'CMR', 'CMR', '🇨🇲', 'https://flagicons.lipis.dev/flags/4x3/cm.svg'),
('11111111-1111-1111-1111-111111111111', 'South Africa', 'RSA', 'RSA', '🇿🇦', 'https://flagicons.lipis.dev/flags/4x3/za.svg')
ON CONFLICT DO NOTHING;

-- Equipos adicionales clasificados (Europa playoff)
INSERT INTO teams (tournament_id, name, short_name, code, flag_icon, crest_url) VALUES
('11111111-1111-1111-1111-111111111111', 'Poland', 'POL', 'POL', '🇵🇱', 'https://flagicons.lipis.dev/flags/4x3/pl.svg'),
('11111111-1111-1111-1111-111111111111', 'Scotland', 'SCO', 'SCO', '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'https://flagicons.lipis.dev/flags/4x3/gb-sct.svg'),
('11111111-1111-1111-1111-111111111111', 'Wales', 'WAL', 'WAL', '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'https://flagicons.lipis.dev/flags/4x3/gb-wls.svg'),
('11111111-1111-1111-1111-111111111111', 'Ukraine', 'UKR', 'UKR', '🇺🇦', 'https://flagicons.lipis.dev/flags/4x3/ua.svg')
ON CONFLICT DO NOTHING;

-- Equipos adicionales (Asia playoffs)
INSERT INTO teams (tournament_id, name, short_name, code, flag_icon, crest_url) VALUES
('11111111-1111-1111-1111-111111111111', 'South Korea', 'KOR', 'KOR', '🇰🇷', 'https://flagicons.lipis.dev/flags/4x3/kr.svg'),
('11111111-1111-1111-1111-111111111111', 'Saudi Arabia', 'KSA', 'KSA', '🇸🇦', 'https://flagicons.lipis.dev/flags/4x3/sa.svg'),
('11111111-1111-1111-1111-111111111111', 'Iraq', 'IRQ', 'IRQ', '🇮🇶', 'https://flagicons.lipis.dev/flags/4x3/iq.svg'),
('11111111-1111-1111-1111-111111111111', 'UAE', 'UAE', 'UAE', '🇦🇪', 'https://flagicons.lipis.dev/flags/4x3/ae.svg')
ON CONFLICT DO NOTHING;

-- Equipos adicionales (Concacaf, Africa, etc)
INSERT INTO teams (tournament_id, name, short_name, code, flag_icon, crest_url) VALUES
('11111111-1111-1111-1111-111111111111', 'Costa Rica', 'CRC', 'CRC', '🇨🇷', 'https://flagicons.lipis.dev/flags/4x3/cr.svg'),
('11111111-1111-1111-1111-111111111111', 'Panama', 'PAN', 'PAN', '🇵🇦', 'https://flagicons.lipis.dev/flags/4x3/pa.svg'),
('11111111-1111-1111-1111-111111111111', 'Honduras', 'HON', 'HON', '🇭🇳', 'https://flagicons.lipis.dev/flags/4x3/hn.svg'),
('11111111-1111-1111-1111-111111111111', 'Jamaica', 'JAM', 'JAM', '🇯🇲', 'https://flagicons.lipis.dev/flags/4x3/jm.svg')
ON CONFLICT DO NOTHING;

-- Equipos Africa restantes
INSERT INTO teams (tournament_id, name, short_name, code, flag_icon, crest_url) VALUES
('11111111-1111-1111-1111-111111111111', 'Algeria', 'ALG', 'ALG', '🇩🇿', 'https://flagicons.lipis.dev/flags/4x3/dz.svg'),
('11111111-1111-1111-1111-111111111111', 'Egypt', 'EGY', 'EGY', '🇪🇬', 'https://flagicons.lipis.dev/flags/4x3/eg.svg'),
('11111111-1111-1111-1111-111111111111', 'Tunisia', 'TUN', 'TUN', '🇹🇳', 'https://flagicons.lipis.dev/flags/4x3/tn.svg'),
('11111111-1111-1111-1111-111111111111', 'Ghana', 'GHA', 'GHA', '🇬🇭', 'https://flagicons.lipis.dev/flags/4x3/gh.svg')
ON CONFLICT DO NOTHING;

-- Equipos Sudamerica restantes
INSERT INTO teams (tournament_id, name, short_name, code, flag_icon, crest_url) VALUES
('11111111-1111-1111-1111-111111111111', 'Chile', 'CHI', 'CHI', '🇨🇱', 'https://flagicons.lipis.dev/flags/4x3/cl.svg'),
('11111111-1111-1111-1111-111111111111', 'Peru', 'PER', 'PER', '🇵🇪', 'https://flagicons.lipis.dev/flags/4x3/pe.svg'),
('11111111-1111-1111-1111-111111111111', 'Bolivia', 'BOL', 'BOL', '🇧🇴', 'https://flagicons.lipis.dev/flags/4x3/bo.svg')
ON CONFLICT DO NOTHING;

-- Equipos Oceania/Asia
INSERT INTO teams (tournament_id, name, short_name, code, flag_icon, crest_url) VALUES
('11111111-1111-1111-1111-111111111111', 'New Zealand', 'NZL', 'NZL', '🇳🇿', 'https://flagicons.lipis.dev/flags/4x3/nz.svg'),
('11111111-1111-1111-1111-111111111111', 'Indonesia', 'IDN', 'IDN', '🇮🇩', 'https://flagicons.lipis.dev/flags/4x3/id.svg')
ON CONFLICT DO NOTHING;

-- Equipos Europa restantes
INSERT INTO teams (tournament_id, name, short_name, code, flag_icon, crest_url) VALUES
('11111111-1111-1111-1111-111111111111', 'Sweden', 'SWE', 'SWE', '🇸🇪', 'https://flagicons.lipis.dev/flags/4x3/se.svg'),
('11111111-1111-1111-1111-111111111111', 'Austria', 'AUT', 'AUT', '🇦🇹', 'https://flagicons.lipis.dev/flags/4x3/at.svg'),
('11111111-1111-1111-1111-111111111111', 'Hungary', 'HUN', 'HUN', '🇭🇺', 'https://flagicons.lipis.dev/flags/4x3/hu.svg'),
('11111111-1111-1111-1111-111111111111', 'Czech Republic', 'CZE', 'CZE', '🇨🇿', 'https://flagicons.lipis.dev/flags/4x3/cz.svg'),
('11111111-1111-1111-1111-111111111111', 'Romania', 'ROU', 'ROU', '🇷🇴', 'https://flagicons.lipis.dev/flags/4x3/ro.svg'),
('11111111-1111-1111-1111-111111111111', 'Slovakia', 'SVK', 'SVK', '🇸🇰', 'https://flagicons.lipis.dev/flags/4x3/sk.svg')
ON CONFLICT DO NOTHING;

-- Equipos CONMEBOL playoff
INSERT INTO teams (tournament_id, name, short_name, code, flag_icon, crest_url) VALUES
('11111111-1111-1111-1111-111111111111', 'Chile', 'CHI2', 'CHI', '🇨🇱', 'https://flagicons.lipis.dev/flags/4x3/cl.svg')
ON CONFLICT DO NOTHING;

\echo 'Equipos cargados: Mundial 2026'

-- ============================================
-- 3. PARTIDOS — Fase de Grupos (48 partidos)
-- ============================================

-- JORNADA 1 (11-14 Junio)
INSERT INTO matches (tournament_id, stage, round_label, home_team_id, away_team_id, starts_at, status, venue) VALUES
-- Grupo A
('11111111-1111-1111-1111-111111111111', 'group', 'USA vs Qatar',
  (SELECT id FROM teams WHERE short_name = 'USA' LIMIT 1),
  (SELECT id FROM teams WHERE short_name = 'QAT' LIMIT 1),
  '2026-06-11T18:00:00Z', 'scheduled', 'Estadio MetLife, New Jersey'),
('11111111-1111-1111-1111-111111111111', 'group', 'Mexico vs Canada',
  (SELECT id FROM teams WHERE short_name = 'MEX' LIMIT 1),
  (SELECT id FROM teams WHERE short_name = 'CAN' LIMIT 1),
  '2026-06-11T21:00:00Z', 'scheduled', 'Estadio Azteca, Mexico City'),
-- Grupo B
('11111111-1111-1111-1111-111111111111', 'group', 'England vs Iran',
  (SELECT id FROM teams WHERE short_name = 'ENG' LIMIT 1),
  (SELECT id FROM teams WHERE short_name = 'IRN' LIMIT 1),
  '2026-06-12T16:00:00Z', 'scheduled', 'Estadio SoFi, Los Angeles'),
('11111111-1111-1111-1111-111111111111', 'group', 'USA vs Australia',
  (SELECT id FROM teams WHERE short_name = 'USA' LIMIT 1),
  (SELECT id FROM teams WHERE short_name = 'AUS' LIMIT 1),
  '2026-06-12T19:00:00Z', 'scheduled', 'Estadio SoFi, Los Angeles'),
-- Grupo C
('11111111-1111-1111-1111-111111111111', 'group', 'Argentina vs Saudi Arabia',
  (SELECT id FROM teams WHERE short_name = 'ARG' LIMIT 1),
  (SELECT id FROM teams WHERE short_name = 'KSA' LIMIT 1),
  '2026-06-12T16:00:00Z', 'scheduled', 'Estadio MetLife, New Jersey'),
('11111111-1111-1111-1111-111111111111', 'group', 'Mexico vs Canada',
  (SELECT id FROM teams WHERE short_name = 'MEX' LIMIT 1),
  (SELECT id FROM teams WHERE short_name = 'CAN' LIMIT 1),
  '2026-06-12T19:00:00Z', 'scheduled', 'Estadio Azteca, Mexico City'),
-- Grupo D
('11111111-1111-1111-1111-111111111111', 'group', 'France vs Argentina',
  (SELECT id FROM teams WHERE short_name = 'FRA' LIMIT 1),
  (SELECT id FROM teams WHERE short_name = 'ARG' LIMIT 1),
  '2026-06-13T16:00:00Z', 'scheduled', 'Estadio MetLife, New Jersey'),
('11111111-1111-1111-1111-111111111111', 'group', 'Germany vs Japan',
  (SELECT id FROM teams WHERE short_name = 'GER' LIMIT 1),
  (SELECT id FROM teams WHERE short_name = 'JPN' LIMIT 1),
  '2026-06-13T19:00:00Z', 'scheduled', 'Estadio SoFi, Los Angeles')
ON CONFLICT DO NOTHING;

-- Continuar con más partidos...
\echo 'Partidos cargados: Jornada 1'

-- Mostrar conteos
SELECT 'Torneo: ' || COUNT(*) || ' registros' FROM tournaments WHERE slug = 'mundial-2026';
SELECT 'Equipos: ' || COUNT(*) || ' registros' FROM teams WHERE tournament_id = '11111111-1111-1111-1111-111111111111';
SELECT 'Partidos: ' || COUNT(*) || ' registros' FROM matches WHERE tournament_id = '11111111-1111-1111-1111-111111111111';