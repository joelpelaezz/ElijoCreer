-- World Cup 2026 Complete Matches (FIXED)
-- Run in Vercel Postgres SQL Editor
-- Uses only teams that exist in our seed data

DO $$
DECLARE 
  t_id uuid := '11111111-1111-1111-1111-111111111111';
BEGIN
  -- === GROUP A (Mexico host) ===
  INSERT INTO "matches" ("tournament_id", "stage", "round_label", "match_number", "home_team_id", "away_team_id", "starts_at", "status", "venue") VALUES
  (t_id, 'group', 'Matchday 1', 1,
    (SELECT "id" FROM "teams" WHERE "code" = 'MEX' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'KSA' AND "tournament_id" = t_id),
    '2026-06-11 17:00:00+00', 'scheduled', 'Mexico City'),
  
  (t_id, 'group', 'Matchday 1', 2,
    (SELECT "id" FROM "teams" WHERE "code" = 'KOR' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'SWE' AND "tournament_id" = t_id),
    '2026-06-11 20:00:00+00', 'scheduled', 'Guadalajara'),

  (t_id, 'group', 'Matchday 8', 3,
    (SELECT "id" FROM "teams" WHERE "code" = 'SWE' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'KSA' AND "tournament_id" = t_id),
    '2026-06-18 14:00:00+00', 'scheduled', 'Atlanta'),

  (t_id, 'group', 'Matchday 8', 4,
    (SELECT "id" FROM "teams" WHERE "code" = 'MEX' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'KOR' AND "tournament_id" = t_id),
    '2026-06-18 23:00:00+00', 'scheduled', 'Guadalajara'),

  (t_id, 'group', 'Matchday 14', 5,
    (SELECT "id" FROM "teams" WHERE "code" = 'SWE' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'MEX' AND "tournament_id" = t_id),
    '2026-06-24 23:00:00+00', 'scheduled', 'Mexico City'),

  (t_id, 'group', 'Matchday 14', 6,
    (SELECT "id" FROM "teams" WHERE "code" = 'KSA' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'KOR' AND "tournament_id" = t_id),
    '2026-06-24 23:00:00+00', 'scheduled', 'Monterrey');

  -- === GROUP B (USA/Canada) ===
  INSERT INTO "matches" ("tournament_id", "stage", "round_label", "match_number", "home_team_id", "away_team_id", "starts_at", "status", "venue") VALUES
  (t_id, 'group', 'Matchday 2', 7,
    (SELECT "id" FROM "teams" WHERE "code" = 'CAN' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'MAR' AND "tournament_id" = t_id),
    '2026-06-12 17:00:00+00', 'scheduled', 'Toronto'),

  (t_id, 'group', 'Matchday 3', 8,
    (SELECT "id" FROM "teams" WHERE "code" = 'QAT' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'SUI' AND "tournament_id" = t_id),
    '2026-06-12 20:00:00+00', 'scheduled', 'San Francisco'),

  (t_id, 'group', 'Matchday 8', 9,
    (SELECT "id" FROM "teams" WHERE "code" = 'SUI' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'MAR' AND "tournament_id" = t_id),
    '2026-06-18 19:00:00+00', 'scheduled', 'Los Angeles'),

  (t_id, 'group', 'Matchday 8', 10,
    (SELECT "id" FROM "teams" WHERE "code" = 'CAN' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'QAT' AND "tournament_id" = t_id),
    '2026-06-18 22:00:00+00', 'scheduled', 'Vancouver'),

  (t_id, 'group', 'Matchday 14', 11,
    (SELECT "id" FROM "teams" WHERE "code" = 'SUI' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'CAN' AND "tournament_id" = t_id),
    '2026-06-24 19:00:00+00', 'scheduled', 'Vancouver'),

  (t_id, 'group', 'Matchday 14', 12,
    (SELECT "id" FROM "teams" WHERE "code" = 'MAR' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'QAT' AND "tournament_id" = t_id),
    '2026-06-24 19:00:00+00', 'scheduled', 'Seattle');

  -- === GROUP C (Brasil) ===
  INSERT INTO "matches" ("tournament_id", "stage", "round_label", "match_number", "home_team_id", "away_team_id", "starts_at", "status", "venue") VALUES
  (t_id, 'group', 'Matchday 3', 13,
    (SELECT "id" FROM "teams" WHERE "code" = 'BRA' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'EGY' AND "tournament_id" = t_id),
    '2026-06-13 20:00:00+00', 'scheduled', 'New York'),

  (t_id, 'group', 'Matchday 3', 14,
    (SELECT "id" FROM "teams" WHERE "code" = 'IRL' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'SCO' AND "tournament_id" = t_id),
    '2026-06-13 23:00:00+00', 'scheduled', 'Boston'),

  (t_id, 'group', 'Matchday 9', 15,
    (SELECT "id" FROM "teams" WHERE "code" = 'SCO' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'EGY' AND "tournament_id" = t_id),
    '2026-06-19 20:00:00+00', 'scheduled', 'Boston'),

  (t_id, 'group', 'Matchday 9', 16,
    (SELECT "id" FROM "teams" WHERE "code" = 'BRA' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'IRL' AND "tournament_id" = t_id),
    '2026-06-19 22:30:00+00', 'scheduled', 'Philadelphia'),

  (t_id, 'group', 'Matchday 14', 17,
    (SELECT "id" FROM "teams" WHERE "code" = 'SCO' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'BRA' AND "tournament_id" = t_id),
    '2026-06-24 20:00:00+00', 'scheduled', 'Miami'),

  (t_id, 'group', 'Matchday 14', 18,
    (SELECT "id" FROM "teams" WHERE "code" = 'EGY' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'IRL' AND "tournament_id" = t_id),
    '2026-06-24 20:00:00+00', 'scheduled', 'Atlanta');

  -- === GROUP D (USA host) ===
  INSERT INTO "matches" ("tournament_id", "stage", "round_label", "match_number", "home_team_id", "away_team_id", "starts_at", "status", "venue") VALUES
  (t_id, 'group', 'Matchday 2', 19,
    (SELECT "id" FROM "teams" WHERE "code" = 'USA' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'IRN' AND "tournament_id" = t_id),
    '2026-06-17 23:00:00+00', 'scheduled', 'Los Angeles'),

  (t_id, 'group', 'Matchday 3', 20,
    (SELECT "id" FROM "teams" WHERE "code" = 'AUS' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'TUR' AND "tournament_id" = t_id),
    '2026-06-18 02:00:00+00', 'scheduled', 'Vancouver'),

  (t_id, 'group', 'Matchday 9', 21,
    (SELECT "id" FROM "teams" WHERE "code" = 'USA' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'AUS' AND "tournament_id" = t_id),
    '2026-06-19 19:00:00+00', 'scheduled', 'Seattle'),

  (t_id, 'group', 'Matchday 9', 22,
    (SELECT "id" FROM "teams" WHERE "code" = 'TUR' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'IRN' AND "tournament_id" = t_id),
    '2026-06-20 01:00:00+00', 'scheduled', 'San Francisco'),

  (t_id, 'group', 'Matchday 15', 23,
    (SELECT "id" FROM "teams" WHERE "code" = 'TUR' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'USA' AND "tournament_id" = t_id),
    '2026-06-26 00:00:00+00', 'scheduled', 'Los Angeles'),

  (t_id, 'group', 'Matchday 15', 24,
    (SELECT "id" FROM "teams" WHERE "code" = 'IRN' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'AUS' AND "tournament_id" = t_id),
    '2026-06-26 00:00:00+00', 'scheduled', 'San Francisco');

  -- === GROUP E (Germany) ===
  INSERT INTO "matches" ("tournament_id", "stage", "round_label", "match_number", "home_team_id", "away_team_id", "starts_at", "status", "venue") VALUES
  (t_id, 'group', 'Matchday 4', 25,
    (SELECT "id" FROM "teams" WHERE "code" = 'GER' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'CRO' AND "tournament_id" = t_id),
    '2026-06-14 15:00:00+00', 'scheduled', 'Houston'),

  (t_id, 'group', 'Matchday 4', 26,
    (SELECT "id" FROM "teams" WHERE "code" = 'JPN' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'NED' AND "tournament_id" = t_id),
    '2026-06-14 22:00:00+00', 'scheduled', 'Philadelphia'),

  (t_id, 'group', 'Matchday 10', 27,
    (SELECT "id" FROM "teams" WHERE "code" = 'GER' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'JPN' AND "tournament_id" = t_id),
    '2026-06-20 18:00:00+00', 'scheduled', 'Toronto'),

  (t_id, 'group', 'Matchday 10', 28,
    (SELECT "id" FROM "teams" WHERE "code" = 'NED' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'CRO' AND "tournament_id" = t_id),
    '2026-06-20 21:00:00+00', 'scheduled', 'Kansas City'),

  (t_id, 'group', 'Matchday 15', 29,
    (SELECT "id" FROM "teams" WHERE "code" = 'CRO' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'JPN' AND "tournament_id" = t_id),
    '2026-06-25 18:00:00+00', 'scheduled', 'Philadelphia'),

  (t_id, 'group', 'Matchday 15', 30,
    (SELECT "id" FROM "teams" WHERE "code" = 'NED' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'GER' AND "tournament_id" = t_id),
    '2026-06-25 18:00:00+00', 'scheduled', 'New York');

  -- === GROUP F ===
  INSERT INTO "matches" ("tournament_id", "stage", "round_label", "match_number", "home_team_id", "away_team_id", "starts_at", "status", "venue") VALUES
  (t_id, 'group', 'Matchday 4', 31,
    (SELECT "id" FROM "teams" WHERE "code" = 'BEL' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'SVK' AND "tournament_id" = t_id),
    '2026-06-14 17:00:00+00', 'scheduled', 'Dallas'),

  (t_id, 'group', 'Matchday 4', 32,
    (SELECT "id" FROM "teams" WHERE "code" = 'ITA' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'SVN' AND "tournament_id" = t_id),
    '2026-06-15 00:00:00+00', 'scheduled', 'Monterrey'),

  (t_id, 'group', 'Matchday 10', 33,
    (SELECT "id" FROM "teams" WHERE "code" = 'BEL' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'ITA' AND "tournament_id" = t_id),
    '2026-06-20 15:00:00+00', 'scheduled', 'Houston'),

  (t_id, 'group', 'Matchday 10', 34,
    (SELECT "id" FROM "teams" WHERE "code" = 'SVN' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'SVK' AND "tournament_id" = t_id),
    '2026-06-21 02:00:00+00', 'scheduled', 'Monterrey'),

  (t_id, 'group', 'Matchday 15', 35,
    (SELECT "id" FROM "teams" WHERE "code" = 'SVK' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'ITA' AND "tournament_id" = t_id),
    '2026-06-25 21:00:00+00', 'scheduled', 'Dallas'),

  (t_id, 'group', 'Matchday 15', 36,
    (SELECT "id" FROM "teams" WHERE "code" = 'SVN' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'BEL' AND "tournament_id" = t_id),
    '2026-06-25 21:00:00+00', 'scheduled', 'Kansas City');

  -- === GROUP G ===
  INSERT INTO "matches" ("tournament_id", "stage", "round_label", "match_number", "home_team_id", "away_team_id", "starts_at", "status", "venue") VALUES
  (t_id, 'group', 'Matchday 5', 37,
    (SELECT "id" FROM "teams" WHERE "code" = 'FRA' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'EGY' AND "tournament_id" = t_id),
    '2026-06-15 19:00:00+00', 'scheduled', 'Seattle'),

  (t_id, 'group', 'Matchday 5', 38,
    (SELECT "id" FROM "teams" WHERE "code" = 'IRN' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'IRQ' AND "tournament_id" = t_id),
    '2026-06-16 01:00:00+00', 'scheduled', 'Los Angeles'),

  (t_id, 'group', 'Matchday 11', 39,
    (SELECT "id" FROM "teams" WHERE "code" = 'FRA' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'IRN' AND "tournament_id" = t_id),
    '2026-06-21 19:00:00+00', 'scheduled', 'Los Angeles'),

  (t_id, 'group', 'Matchday 11', 40,
    (SELECT "id" FROM "teams" WHERE "code" = 'IRQ' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'EGY' AND "tournament_id" = t_id),
    '2026-06-22 01:00:00+00', 'scheduled', 'Vancouver'),

  (t_id, 'group', 'Matchday 16', 41,
    (SELECT "id" FROM "teams" WHERE "code" = 'EGY' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'IRN' AND "tournament_id" = t_id),
    '2026-06-27 02:00:00+00', 'scheduled', 'Seattle'),

  (t_id, 'group', 'Matchday 16', 42,
    (SELECT "id" FROM "teams" WHERE "code" = 'IRQ' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'FRA' AND "tournament_id" = t_id),
    '2026-06-27 02:00:00+00', 'scheduled', 'Vancouver');

  -- === GROUP H (Spain) ===
  INSERT INTO "matches" ("tournament_id", "stage", "round_label", "match_number", "home_team_id", "away_team_id", "starts_at", "status", "venue") VALUES
  (t_id, 'group', 'Matchday 5', 43,
    (SELECT "id" FROM "teams" WHERE "code" = 'ESP' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'SEN' AND "tournament_id" = t_id),
    '2026-06-15 15:00:00+00', 'scheduled', 'Atlanta'),

  (t_id, 'group', 'Matchday 5', 44,
    (SELECT "id" FROM "teams" WHERE "code" = 'KSA' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'URU' AND "tournament_id" = t_id),
    '2026-06-15 22:00:00+00', 'scheduled', 'Miami'),

  (t_id, 'group', 'Matchday 11', 45,
    (SELECT "id" FROM "teams" WHERE "code" = 'ESP' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'KSA' AND "tournament_id" = t_id),
    '2026-06-21 15:00:00+00', 'scheduled', 'Atlanta'),

  (t_id, 'group', 'Matchday 11', 46,
    (SELECT "id" FROM "teams" WHERE "code" = 'URU' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'SEN' AND "tournament_id" = t_id),
    '2026-06-21 22:00:00+00', 'scheduled', 'Miami'),

  (t_id, 'group', 'Matchday 16', 47,
    (SELECT "id" FROM "teams" WHERE "code" = 'SEN' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'KSA' AND "tournament_id" = t_id),
    '2026-06-26 22:00:00+00', 'scheduled', 'Houston'),

  (t_id, 'group', 'Matchday 16', 48,
    (SELECT "id" FROM "teams" WHERE "code" = 'URU' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'ESP' AND "tournament_id" = t_id),
    '2026-06-27 01:00:00+00', 'scheduled', 'Guadalajara');

  -- === GROUP I (Portugal) ===
  INSERT INTO "matches" ("tournament_id", "stage", "round_label", "match_number", "home_team_id", "away_team_id", "starts_at", "status", "venue") VALUES
  (t_id, 'group', 'Matchday 6', 49,
    (SELECT "id" FROM "teams" WHERE "code" = 'POR' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'GHA' AND "tournament_id" = t_id),
    '2026-06-16 17:00:00+00', 'scheduled', 'New York'),

  (t_id, 'group', 'Matchday 6', 50,
    (SELECT "id" FROM "teams" WHERE "code" = 'NOR' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'AUT' AND "tournament_id" = t_id),
    '2026-06-16 20:00:00+00', 'scheduled', 'Boston'),

  (t_id, 'group', 'Matchday 12', 51,
    (SELECT "id" FROM "teams" WHERE "code" = 'POR' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'NOR' AND "tournament_id" = t_id),
    '2026-06-22 19:00:00+00', 'scheduled', 'Philadelphia'),

  (t_id, 'group', 'Matchday 12', 52,
    (SELECT "id" FROM "teams" WHERE "code" = 'AUT' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'GHA' AND "tournament_id" = t_id),
    '2026-06-22 22:00:00+00', 'scheduled', 'New York'),

  (t_id, 'group', 'Matchday 16', 53,
    (SELECT "id" FROM "teams" WHERE "code" = 'AUT' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'POR' AND "tournament_id" = t_id),
    '2026-06-26 17:00:00+00', 'scheduled', 'Boston'),

  (t_id, 'group', 'Matchday 16', 54,
    (SELECT "id" FROM "teams" WHERE "code" = 'GHA' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'NOR' AND "tournament_id" = t_id),
    '2026-06-26 17:00:00+00', 'scheduled', 'Toronto');

  -- === GROUP J (Argentina) ===
  INSERT INTO "matches" ("tournament_id", "stage", "round_label", "match_number", "home_team_id", "away_team_id", "starts_at", "status", "venue") VALUES
  (t_id, 'group', 'Matchday 6', 55,
    (SELECT "id" FROM "teams" WHERE "code" = 'ARG' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'CMR' AND "tournament_id" = t_id),
    '2026-06-16 23:00:00+00', 'scheduled', 'Kansas City'),

  (t_id, 'group', 'Matchday 6', 56,
    (SELECT "id" FROM "teams" WHERE "code" = 'COL' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'UZB' AND "tournament_id" = t_id),
    '2026-06-17 02:00:00+00', 'scheduled', 'San Francisco'),

  (t_id, 'group', 'Matchday 12', 57,
    (SELECT "id" FROM "teams" WHERE "code" = 'ARG' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'COL' AND "tournament_id" = t_id),
    '2026-06-22 17:00:00+00', 'scheduled', 'Dallas'),

  (t_id, 'group', 'Matchday 12', 58,
    (SELECT "id" FROM "teams" WHERE "code" = 'UZB' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'CMR' AND "tournament_id" = t_id),
    '2026-06-23 01:00:00+00', 'scheduled', 'San Francisco'),

  (t_id, 'group', 'Matchday 17', 59,
    (SELECT "id" FROM "teams" WHERE "code" = 'CMR' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'COL' AND "tournament_id" = t_id),
    '2026-06-28 00:00:00+00', 'scheduled', 'Kansas City'),

  (t_id, 'group', 'Matchday 17', 60,
    (SELECT "id" FROM "teams" WHERE "code" = 'UZB' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'ARG' AND "tournament_id" = t_id),
    '2026-06-28 00:00:00+00', 'scheduled', 'Dallas');

  -- === GROUP K (England) ===
  INSERT INTO "matches" ("tournament_id", "stage", "round_label", "match_number", "home_team_id", "away_team_id", "starts_at", "status", "venue") VALUES
  (t_id, 'group', 'Matchday 7', 61,
    (SELECT "id" FROM "teams" WHERE "code" = 'ENG' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'SCO' AND "tournament_id" = t_id),
    '2026-06-17 17:00:00+00', 'scheduled', 'Houston'),

  (t_id, 'group', 'Matchday 7', 62,
    (SELECT "id" FROM "teams" WHERE "code" = 'POL' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'NGA' AND "tournament_id" = t_id),
    '2026-06-18 00:00:00+00', 'scheduled', 'Mexico City'),

  (t_id, 'group', 'Matchday 13', 63,
    (SELECT "id" FROM "teams" WHERE "code" = 'ENG' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'POL' AND "tournament_id" = t_id),
    '2026-06-23 17:00:00+00', 'scheduled', 'Houston'),

  (t_id, 'group', 'Matchday 13', 64,
    (SELECT "id" FROM "teams" WHERE "code" = 'NGA' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'SCO' AND "tournament_id" = t_id),
    '2026-06-24 00:00:00+00', 'scheduled', 'Guadalajara'),

  (t_id, 'group', 'Matchday 17', 65,
    (SELECT "id" FROM "teams" WHERE "code" = 'NGA' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'ENG' AND "tournament_id" = t_id),
    '2026-06-28 01:30:00+00', 'scheduled', 'Miami'),

  (t_id, 'group', 'Matchday 17', 66,
    (SELECT "id" FROM "teams" WHERE "code" = 'SCO' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'POL' AND "tournament_id" = t_id),
    '2026-06-28 01:30:00+00', 'scheduled', 'Atlanta');

  -- === GROUP L (Netherlands) ===
  INSERT INTO "matches" ("tournament_id", "stage", "round_label", "match_number", "home_team_id", "away_team_id", "starts_at", "status", "venue") VALUES
  (t_id, 'group', 'Matchday 7', 67,
    (SELECT "id" FROM "teams" WHERE "code" = 'NED' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'HUN' AND "tournament_id" = t_id),
    '2026-06-17 20:00:00+00', 'scheduled', 'Dallas'),

  (t_id, 'group', 'Matchday 7', 68,
    (SELECT "id" FROM "teams" WHERE "code" = 'CZE' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'PAN' AND "tournament_id" = t_id),
    '2026-06-17 23:00:00+00', 'scheduled', 'Toronto'),

  (t_id, 'group', 'Matchday 13', 69,
    (SELECT "id" FROM "teams" WHERE "code" = 'NED' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'CZE' AND "tournament_id" = t_id),
    '2026-06-23 18:00:00+00', 'scheduled', 'Boston'),

  (t_id, 'group', 'Matchday 13', 70,
    (SELECT "id" FROM "teams" WHERE "code" = 'PAN' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'HUN' AND "tournament_id" = t_id),
    '2026-06-23 21:00:00+00', 'scheduled', 'Toronto'),

  (t_id, 'group', 'Matchday 17', 71,
    (SELECT "id" FROM "teams" WHERE "code" = 'PAN' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'NED' AND "tournament_id" = t_id),
    '2026-06-28 19:00:00+00', 'scheduled', 'New York'),

  (t_id, 'group', 'Matchday 17', 72,
    (SELECT "id" FROM "teams" WHERE "code" = 'HUN' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'CZE' AND "tournament_id" = t_id),
    '2026-06-28 19:00:00+00', 'scheduled', 'Philadelphia');

  -- === KNOCKOUT STAGES ===
  
  -- Round of 32
  INSERT INTO "matches" ("tournament_id", "stage", "round_label", "match_number", "home_team_id", "away_team_id", "starts_at", "status", "venue") VALUES
  (t_id, 'round_32', 'Round of 32', 73,
    (SELECT "id" FROM "teams" WHERE "code" = 'ARG' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'BRA' AND "tournament_id" = t_id),
    '2026-06-29 19:00:00+00', 'scheduled', 'Los Angeles'),

  (t_id, 'round_32', 'Round of 32', 74,
    (SELECT "id" FROM "teams" WHERE "code" = 'MEX' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'USA' AND "tournament_id" = t_id),
    '2026-06-29 22:00:00+00', 'scheduled', 'Houston');

  -- Quarter-finals
  INSERT INTO "matches" ("tournament_id", "stage", "round_label", "match_number", "home_team_id", "away_team_id", "starts_at", "status", "venue") VALUES
  (t_id, 'quarter', 'Quarter-final', 97,
    (SELECT "id" FROM "teams" WHERE "code" = 'ARG' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'GER' AND "tournament_id" = t_id),
    '2026-07-09 18:00:00+00', 'scheduled', 'Boston');

  -- Semi-finals
  INSERT INTO "matches" ("tournament_id", "stage", "round_label", "match_number", "home_team_id", "away_team_id", "starts_at", "status", "venue") VALUES
  (t_id, 'semi', 'Semi-final', 101,
    (SELECT "id" FROM "teams" WHERE "code" = 'ARG' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'FRA' AND "tournament_id" = t_id),
    '2026-07-14 17:00:00+00', 'scheduled', 'Dallas');

  -- Final
  INSERT INTO "matches" ("tournament_id", "stage", "round_label", "match_number", "home_team_id", "away_team_id", "starts_at", "status", "venue") VALUES
  (t_id, 'final', 'Final', 105,
    (SELECT "id" FROM "teams" WHERE "code" = 'ARG' AND "tournament_id" = t_id),
    (SELECT "id" FROM "teams" WHERE "code" = 'BRA' AND "tournament_id" = t_id),
    '2026-07-19 17:00:00+00', 'scheduled', 'New York');

END $$;

-- Verify counts
SELECT 
  (SELECT count(*) FROM "tournaments") as tournaments,
  (SELECT count(*) FROM "teams" WHERE "tournament_id" = '11111111-1111-1111-1111-111111111111') as teams,
  (SELECT count(*) FROM "matches" WHERE "tournament_id" = '11111111-1111-1111-1111-111111111111') as matches;