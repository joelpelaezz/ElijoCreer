-- Migration: Create prediction_history table
-- Created: 2026-06-11
-- Context: Schema defined in src/lib/db/schema.ts but table not created in DB

-- Historial de ediciones de pronósticos
CREATE TABLE IF NOT EXISTS prediction_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prediction_id UUID NOT NULL REFERENCES predictions(id),
    group_id UUID NOT NULL REFERENCES groups(id),
    match_id UUID NOT NULL REFERENCES matches(id),
    user_id TEXT NOT NULL REFERENCES \"user\"(id),
    previous_home_score INTEGER,
    previous_away_score INTEGER,
    new_home_score INTEGER NOT NULL,
    new_away_score INTEGER NOT NULL,
    edited_by TEXT NOT NULL REFERENCES \"user\"(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Índices para optimizar queries
CREATE INDEX IF NOT EXISTS idx_prediction_history_prediction_id ON prediction_history(prediction_id);
CREATE INDEX IF NOT EXISTS idx_prediction_history_user_id ON prediction_history(user_id);
CREATE INDEX IF NOT EXISTS idx_prediction_history_created_at ON prediction_history(created_at DESC);

-- Comment para documentación
COMMENT ON TABLE prediction_history IS 'Historial de ediciones de pronósticos - tracking de cambios';