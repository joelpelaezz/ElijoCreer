/**
 * Init DB for Vercel Production
 */
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.POSTGRES_URL });

async function main() {
  console.log("🚀 Init DB en Vercel...\n");

  // Schema
  console.log("📦 Creando schema...");
  await pool.query(`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

    CREATE TABLE IF NOT EXISTS groups (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      name text NOT NULL,
      slug text NOT NULL UNIQUE,
      tournament_id uuid REFERENCES tournaments(id) ON DELETE CASCADE,
      invite_code text UNIQUE,
      created_by text,
      created_at timestamp with time zone DEFAULT NOW()
    );

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
  `);
  console.log("✅ Schema creado\n");

  // Tournament
  console.log("📦 Insertando torneo...");
  await pool.query(`
    INSERT INTO tournaments (id, name, slug, year, status, starts_at, ends_at) 
    VALUES ('a0000000-0000-0000-0000-000000000001', 'Copa Mundial de la FIFA 2026', 'mundial-2026', 2026, 'active', '2026-06-11T00:00:00Z', '2026-07-19T23:59:59Z')
    ON CONFLICT (slug) DO NOTHING
  `);
  console.log("✅ Torneo: Mundial 2026\n");

  // Teams (48 con flag)
  console.log("📦 Insertando equipos...");
  const teamsSql = `
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
    ('a0000000-0000-0000-0000-000000000001', 'Panama', 'PAN', 'PAN', '🇵🇦', 'https://flagicons.lipis.dev/flags/4x3/pa.svg')
    ON CONFLICT DO NOTHING
  `;
  await pool.query(teamsSql);
  console.log("✅ 48 equipos con flag_icon\n");

  // Verificar
  const result = await pool.query("SELECT COUNT(*) as total FROM teams");
  console.log(`✅ Total equipos en DB: ${result.rows[0].total}\n`);

  await pool.end();
  console.log("🎉 Init completo!");
}

main().catch(console.error);