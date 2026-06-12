-- Complete World Cup 2026 Seeding
-- Run this entire script in Vercel Postgres SQL Editor

-- Step 1: Tournament
INSERT INTO "tournaments" ("id", "name", "slug", "year", "status", "starts_at", "ends_at")
VALUES ('11111111-1111-1111-1111-111111111111', 'Copa Mundial 2026', 'world-cup-2026', 2026, 'active', '2026-06-11', '2026-07-19')
ON CONFLICT DO NOTHING;

-- Step 2: Clear and insert teams
DELETE FROM "teams" WHERE "tournament_id" = '11111111-1111-1111-1111-111111111111';

INSERT INTO "teams" ("tournament_id", "name", "short_name", "code", "flag_icon") VALUES
('11111111-1111-1111-1111-111111111111', 'Argentina', 'ARG', 'ARG', '🇦🇷'),
('11111111-1111-1111-1111-111111111111', 'México', 'MEX', 'MEX', '🇲🇽'),
('11111111-1111-1111-1111-111111111111', 'Estados Unidos', 'USA', 'USA', '🇺🇸'),
('11111111-1111-1111-1111-111111111111', 'Canadá', 'CAN', 'CAN', '🇨🇦'),
('11111111-1111-1111-1111-111111111111', 'Brasil', 'BRA', 'BRA', '🇧🇷'),
('11111111-1111-1111-1111-111111111111', 'Francia', 'FRA', 'FRA', '🇫🇷'),
('11111111-1111-1111-1111-111111111111', 'Alemania', 'GER', 'GER', '🇩🇪'),
('11111111-1111-1111-1111-111111111111', 'España', 'ESP', 'ESP', '🇪🇸'),
('11111111-1111-1111-1111-111111111111', 'Inglaterra', 'ENG', 'ENG', '🏴󠁧󠁢󠁥󠁮󠁧󠁿'),
('11111111-1111-1111-1111-111111111111', 'Portugal', 'POR', 'POR', '🇵🇹'),
('11111111-1111-1111-1111-111111111111', 'Países Bajos', 'NED', 'NED', '🇳🇱'),
('11111111-1111-1111-1111-111111111111', 'Bélgica', 'BEL', 'BEL', '🇧🇪'),
('11111111-1111-1111-1111-111111111111', 'Italia', 'ITA', 'ITA', '🇮🇹'),
('11111111-1111-1111-1111-111111111111', 'Croacia', 'CRO', 'CRO', '🇭🇷'),
('11111111-1111-1111-1111-111111111111', 'Uruguay', 'URU', 'URU', '🇺🇾'),
('11111111-1111-1111-1111-111111111111', 'Colombia', 'COL', 'COL', '🇨🇴'),
('11111111-1111-1111-1111-111111111111', 'Japón', 'JPN', 'JPN', '🇯🇵'),
('11111111-1111-1111-1111-111111111111', 'Corea del Sur', 'KOR', 'KOR', '🇰🇷'),
('11111111-1111-1111-1111-111111111111', 'Australia', 'AUS', 'AUS', '🇦🇺'),
('11111111-1111-1111-1111-111111111111', 'Arabia Saudita', 'KSA', 'KSA', '🇸🇦'),
('11111111-1111-1111-1111-111111111111', 'Irán', 'IRN', 'IRN', '🇮🇷'),
('11111111-1111-1111-1111-111111111111', 'Suecia', 'SWE', 'SWE', '🇸🇪'),
('11111111-1111-1111-1111-111111111111', 'Suiza', 'SUI', 'SUI', '🇨🇭'),
('11111111-1111-1111-1111-111111111111', 'Turquía', 'TUR', 'TUR', '🇹🇷'),
('11111111-1111-1111-1111-111111111111', 'Marruecos', 'MAR', 'MAR', '🇲🇦'),
('11111111-1111-1111-1111-111111111111', 'Egipto', 'EGY', 'EGY', '🇪🇬'),
('11111111-1111-1111-1111-111111111111', 'Senegal', 'SEN', 'SEN', '🇸🇳'),
('11111111-1111-1111-1111-111111111111', 'Ghana', 'GHA', 'GHA', '🇬🇭'),
('11111111-1111-1111-1111-111111111111', 'Nigeria', 'NGA', 'NGA', '🇳🇬'),
('11111111-1111-1111-1111-111111111111', 'Camerún', 'CMR', 'CMR', '🇨🇲'),
('11111111-1111-1111-1111-111111111111', 'Costa Rica', 'CRC', 'CRC', '🇨🇷'),
('11111111-1111-1111-1111-111111111111', 'Panamá', 'PAN', 'PAN', '🇵🇦'),
('11111111-1111-1111-1111-111111111111', 'Polonia', 'POL', 'POL', '🇵🇱'),
('11111111-1111-1111-1111-111111111111', 'Uzbekistán', 'UZB', 'UZB', '🇺🇿'),
('11111111-1111-1111-1111-111111111111', 'Catar', 'QAT', 'QAT', '🇶🇦'),
('11111111-1111-1111-1111-111111111111', 'Irak', 'IRQ', 'IRQ', '🇮🇶'),
('11111111-1111-1111-1111-111111111111', 'Noruega', 'NOR', 'NOR', '🇳🇴'),
('11111111-1111-1111-1111-111111111111', 'Austria', 'AUT', 'AUT', '🇦🇹'),
('11111111-1111-1111-1111-111111111111', 'Rep. Checa', 'CZE', 'CZE', '🇨🇿'),
('11111111-1111-1111-1111-111111111111', 'Serbia', 'SRB', 'SRB', '🇷🇸'),
('11111111-1111-1111-1111-111111111111', 'Ucranía', 'UKR', 'UKR', '🇺🇦'),
('11111111-1111-1111-1111-111111111111', 'Escocia', 'SCO', 'SCO', '🏴󠁧󠁢󠁳󠁣󠁴󠁿'),
('11111111-1111-1111-1111-111111111111', 'Dinamarca', 'DEN', 'DEN', '🇩🇰'),
('11111111-1111-1111-1111-111111111111', 'Hungría', 'HUN', 'HUN', '🇭🇺'),
('11111111-1111-1111-1111-111111111111', 'Rumania', 'ROU', 'ROU', '🇷🇴'),
('11111111-1111-1111-1111-111111111111', 'Eslovenia', 'SVN', 'SVN', '🇸🇮'),
('11111111-1111-1111-1111-111111111111', 'Eslovaquia', 'SVK', 'SVK', '🇸🇰'),
('11111111-1111-1111-1111-111111111111', 'Irlanda', 'IRL', 'IRL', '🇮🇪');

-- Step 3: Clear and insert matches (key matches only)
DELETE FROM "matches" WHERE "tournament_id" = '11111111-1111-1111-1111-111111111111';

-- Group A
INSERT INTO "matches" ("tournament_id", "stage", "round_label", "match_number", "home_team_id", "away_team_id", "starts_at", "status", "venue") VALUES
('11111111-1111-1111-1111-111111111111', 'group', 'Matchday 1', 1,
  (SELECT "id" FROM "teams" WHERE "code" = 'MEX'),
  (SELECT "id" FROM "teams" WHERE "code" = 'RSA'),
  '2026-06-11 17:00:00+00', 'scheduled', 'Mexico City'),

('11111111-1111-1111-1111-111111111111', 'group', 'Matchday 1', 2,
  (SELECT "id" FROM "teams" WHERE "code" = 'KOR'),
  (SELECT "id" FROM "teams" WHERE "code" = 'CZE'),
  '2026-06-11 20:00:00+00', 'scheduled', 'Guadalajara'),

('11111111-1111-1111-1111-111111111111', 'group', 'Matchday 8', 3,
  (SELECT "id" FROM "teams" WHERE "code" = 'CZE'),
  (SELECT "id" FROM "teams" WHERE "code" = 'RSA'),
  '2026-06-18 14:00:00+00', 'scheduled', 'Atlanta'),

('11111111-1111-1111-1111-111111111111', 'group', 'Matchday 8', 4,
  (SELECT "id" FROM "teams" WHERE "code" = 'MEX'),
  (SELECT "id" FROM "teams" WHERE "code" = 'KOR'),
  '2026-06-18 23:00:00+00', 'scheduled', 'Guadalajara'),

('11111111-1111-1111-1111-111111111111', 'group', 'Matchday 14', 5,
  (SELECT "id" FROM "teams" WHERE "code" = 'CZE'),
  (SELECT "id" FROM "teams" WHERE "code" = 'MEX'),
  '2026-06-24 23:00:00+00', 'scheduled', 'Mexico City'),

('11111111-1111-1111-1111-111111111111', 'group', 'Matchday 14', 6,
  (SELECT "id" FROM "teams" WHERE "code" = 'RSA'),
  (SELECT "id" FROM "teams" WHERE "code" = 'KOR'),
  '2026-06-24 23:00:00+00', 'scheduled', 'Monterrey');

-- Group B
INSERT INTO "matches" ("tournament_id", "stage", "round_label", "match_number", "home_team_id", "away_team_id", "starts_at", "status", "venue") VALUES
('11111111-1111-1111-1111-111111111111', 'group', 'Matchday 2', 7,
  (SELECT "id" FROM "teams" WHERE "code" = 'CAN'),
  (SELECT "id" FROM "teams" WHERE "code" = 'BIH'),
  '2026-06-12 17:00:00+00', 'scheduled', 'Toronto'),

('11111111-1111-1111-1111-111111111111', 'group', 'Matchday 3', 8,
  (SELECT "id" FROM "teams" WHERE "code" = 'QAT'),
  (SELECT "id" FROM "teams" WHERE "code" = 'SUI'),
  '2026-06-12 20:00:00+00', 'scheduled', 'San Francisco');

-- Key matches - Argentina
INSERT INTO "matches" ("tournament_id", "stage", "round_label", "match_number", "home_team_id", "away_team_id", "starts_at", "status", "venue") VALUES
('11111111-1111-1111-1111-111111111111', 'group', 'Matchday 6', 48,
  (SELECT "id" FROM "teams" WHERE "code" = 'ARG'),
  (SELECT "id" FROM "teams" WHERE "code" = 'ALG'),
  '2026-06-16 23:00:00+00', 'scheduled', 'Kansas City'),

('11111111-1111-1111-1111-111111111111', 'group', 'Matchday 12', 49,
  (SELECT "id" FROM "teams" WHERE "code" = 'ARG'),
  (SELECT "id" FROM "teams" WHERE "code" = 'AUT'),
  '2026-06-22 17:00:00+00', 'scheduled', 'Dallas'),

('11111111-1111-1111-1111-111111111111', 'group', 'Matchday 17', 50,
  (SELECT "id" FROM "teams" WHERE "code" = 'JOR'),
  (SELECT "id" FROM "teams" WHERE "code" = 'ARG'),
  '2026-06-27 23:00:00+00', 'scheduled', 'Dallas');

-- Key matches - USA
INSERT INTO "matches" ("tournament_id", "stage", "round_label", "match_number", "home_team_id", "away_team_id", "starts_at", "status", "venue") VALUES
('11111111-1111-1111-1111-111111111111', 'group', 'Matchday 2', 25,
  (SELECT "id" FROM "teams" WHERE "code" = 'USA'),
  (SELECT "id" FROM "teams" WHERE "code" = 'PAR'),
  '2026-06-17 23:00:00+00', 'scheduled', 'Los Angeles'),

('11111111-1111-1111-1111-111111111111', 'group', 'Matchday 9', 26,
  (SELECT "id" FROM "teams" WHERE "code" = 'USA'),
  (SELECT "id" FROM "teams" WHERE "code" = 'AUS'),
  '2026-06-19 19:00:00+00', 'scheduled', 'Seattle'),

('11111111-1111-1111-1111-111111111111', 'group', 'Matchday 15', 27,
  (SELECT "id" FROM "teams" WHERE "code" = 'TUR'),
  (SELECT "id" FROM "teams" WHERE "code" = 'USA'),
  '2026-06-26 00:00:00+00', 'scheduled', 'Los Angeles');

-- Key matches - Mexico
INSERT INTO "matches" ("tournament_id", "stage", "round_label", "match_number", "home_team_id", "away_team_id", "starts_at", "status", "venue") VALUES
('11111111-1111-1111-1111-111111111111', 'group', 'Matchday 1', 1,
  (SELECT "id" FROM "teams" WHERE "code" = 'MEX'),
  (SELECT "id" FROM "teams" WHERE "code" = 'RSA'),
  '2026-06-11 17:00:00+00', 'scheduled', 'Mexico City'),

('11111111-1111-1111-1111-111111111111', 'group', 'Matchday 8', 4,
  (SELECT "id" FROM "teams" WHERE "code" = 'MEX'),
  (SELECT "id" FROM "teams" WHERE "code" = 'KOR'),
  '2026-06-18 23:00:00+00', 'scheduled', 'Guadalajara');

-- Verify
SELECT 
  (SELECT count(*) FROM "tournaments") as tournaments,
  (SELECT count(*) FROM "teams") as teams,
  (SELECT count(*) FROM "matches") as matches;