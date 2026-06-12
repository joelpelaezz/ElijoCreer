-- Admin notifications table
CREATE TABLE IF NOT EXISTS admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  message TEXT,
  type VARCHAR(50) DEFAULT 'info',
  target_audience VARCHAR(50),
  created_by UUID REFERENCES "user"(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  scheduled_for TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE
);

-- User achievements/trophies table
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "user"(id),
  achievement_key VARCHAR(100) NOT NULL,
  achievement_name VARCHAR(255),
  description TEXT,
  icon VARCHAR(50),
  points INTEGER DEFAULT 0,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_key)
);

-- Achievement definitions
CREATE TABLE IF NOT EXISTS achievements (
  key VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  points INTEGER DEFAULT 0,
  requirement JSONB
);

-- Insert default achievements
INSERT INTO achievements (key, name, description, icon, points) VALUES
  ('first_prediction', 'Primer Pronóstico', 'Hiciste tu primer pronóstico', '🎯', 10),
  ('perfect_score', 'Resultado Exacto', 'Acertaste un resultado exacto', '✅', 25),
  ('top_3', 'Top 3', 'Terminaste en el top 3 de un grupo', '🥉', 50),
  ('streak_5', 'Racha de 5', '5 partidos seguidos con puntos', '🔥', 30),
  ('active_member', 'Miembro Activo', 'Participaste 10+ partidos', '⭐', 20),
  ('group_creator', 'Creador de Grupo', 'Creaste un grupo', '👑', 15)
ON CONFLICT (key) DO NOTHING;

-- Ranking alerts subscription
CREATE TABLE IF NOT EXISTS ranking_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "user"(id),
  group_id UUID NOT NULL REFERENCES groups(id),
  notify_when VARCHAR(20) DEFAULT 'position_change',
  previous_position INTEGER,
  last_notified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "user"(id) UNIQUE,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  reminder_before_match INTEGER DEFAULT 60,
  ranking_alerts BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);