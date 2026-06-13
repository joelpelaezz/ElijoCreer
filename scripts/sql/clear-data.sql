-- =============================================
-- clear-data.sql — Borra TODOS los datos de la BD
-- Uso: docker exec -i postgres psql -U n8n_user -d elijocreer < scripts/sql/clear-data.sql
-- =============================================

SET session_replication_role = 'replica';

TRUNCATE TABLE
  prediction_scores,
  prediction_history,
  group_activity,
  group_scoring_rules,
  official_results,
  predictions,
  group_members,
  groups,
  matches,
  teams,
  session,
  account,
  "verificationToken",
  profiles,
  "user",
  tournaments
CASCADE;

SET session_replication_role = 'origin';

-- Verificación
DO $$
DECLARE
  tbl text;
  cnt int;
BEGIN
  FOR tbl IN 
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public' 
    ORDER BY tablename
  LOOP
    EXECUTE format('SELECT count(*) FROM %I', tbl) INTO cnt;
    RAISE NOTICE '  %: % filas', tbl, cnt;
  END LOOP;
END $$;
