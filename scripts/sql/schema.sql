-- ============================================
-- SCHEMA — Copa Mundial 2026
-- Uso: psql -U user -d db -f schema.sql
-- ============================================

-- Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TOURNAMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS tournaments (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    slug text NOT NULL UNIQUE,
    year integer,
    status text DEFAULT 'active',
    starts_at timestamp with time zone,
    ends_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT NOW()
);

-- ============================================
-- TEAMS
-- ============================================
CREATE TABLE IF NOT EXISTS teams (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id uuid REFERENCES tournaments(id) ON DELETE CASCADE,
    name text NOT NULL,
    short_name text NOT NULL,
    code text NOT NULL,
    flag_icon text,
    crest_url text,
    created_at timestamp with time zone DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_teams_tournament ON teams(tournament_id);
CREATE INDEX IF NOT EXISTS idx_teams_name ON teams(name);
CREATE INDEX IF NOT EXISTS idx_teams_short_name ON teams(short_name);

-- ============================================
-- MATCHES
-- ============================================
CREATE TABLE IF NOT EXISTS matches (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id uuid REFERENCES tournaments(id) ON DELETE CASCADE,
    stage text NOT NULL,
    round_label text,
    match_number integer,
    home_team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
    away_team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
    home_score integer DEFAULT 0,
    away_score integer DEFAULT 0,
    starts_at timestamp with time zone,
    status text DEFAULT 'scheduled',
    venue text,
    created_at timestamp with time zone DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_matches_tournament ON matches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_matches_stage ON matches(stage);
CREATE INDEX IF NOT EXISTS idx_matches_home_team ON matches(home_team_id);
CREATE INDEX IF NOT EXISTS idx_matches_away_team ON matches(away_team_id);

-- ============================================
-- GROUPS (pronostic groups)
-- ============================================
CREATE TABLE IF NOT EXISTS groups (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    slug text NOT NULL UNIQUE,
    tournament_id uuid REFERENCES tournaments(id) ON DELETE CASCADE,
    invite_code text UNIQUE,
    created_by text,
    created_at timestamp with time zone DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_groups_tournament ON groups(tournament_id);
CREATE INDEX IF NOT EXISTS idx_groups_invite_code ON groups(invite_code);

-- ============================================
-- PREDICTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS predictions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
    match_id uuid REFERENCES matches(id) ON DELETE CASCADE,
    user_id text NOT NULL,
    predicted_home_score integer NOT NULL,
    predicted_away_score integer NOT NULL,
    is_locked boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT NOW(),
    UNIQUE(group_id, match_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_predictions_group ON predictions(group_id);
CREATE INDEX IF NOT EXISTS idx_predictions_match ON predictions(match_id);
CREATE INDEX IF NOT EXISTS idx_predictions_user ON predictions(user_id);

\echo 'Schema cargado correctamente'