import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  primaryKey,
  uuid,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ═══════════════════════════════════════════
//  Auth.js tables (requeridas por el adapter)
// ═══════════════════════════════════════════

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    {
      compoundKey: primaryKey({
        columns: [account.provider, account.providerAccountId],
      }),
    },
  ]
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [
    {
      compositePk: primaryKey({
        columns: [vt.identifier, vt.token],
      }),
    },
  ]
);

// ═══════════════════════════════════════════
//  App tables — ElijoCreer
// ═══════════════════════════════════════════

// Perfiles extendidos de usuario
export const profiles = pgTable("profiles", {
  id: text("id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  displayName: text("display_name").notNull(),
  avatarUrl: text("avatar_url"),
  role: text("role").notNull().default("user"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

// Torneos
export const tournaments = pgTable("tournaments", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  year: integer("year").notNull(),
  status: text("status").notNull().default("draft"),
  startsAt: timestamp("starts_at", { mode: "date" }),
  endsAt: timestamp("ends_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

// Equipos
export const teams = pgTable("teams", {
  id: uuid("id").primaryKey().defaultRandom(),
  tournamentId: uuid("tournament_id")
    .notNull()
    .references(() => tournaments.id),
  name: text("name").notNull(),
  shortName: text("short_name").notNull(),
  code: text("code").notNull(),
  flagIcon: text("flag_icon"),
  crestUrl: text("crest_url"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

// Partidos
export const matches = pgTable(
  "matches",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tournamentId: uuid("tournament_id")
      .notNull()
      .references(() => tournaments.id),
    stage: text("stage").notNull(),
    roundLabel: text("round_label"),
    matchNumber: integer("match_number"),
    homeTeamId: uuid("home_team_id")
      .notNull()
      .references(() => teams.id),
    awayTeamId: uuid("away_team_id")
      .notNull()
      .references(() => teams.id),
    startsAt: timestamp("starts_at", { mode: "date" }).notNull(),
    status: text("status").notNull().default("scheduled"),
    venue: text("venue"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => ({
    tournamentStageMatchIdx: uniqueIndex(
      "matches_tournament_stage_unique_idx"
    ).on(table.tournamentId, table.stage, table.matchNumber),
  })
);

// Resultados oficiales (globales)
export const officialResults = pgTable("official_results", {
  id: uuid("id").primaryKey().defaultRandom(),
  matchId: uuid("match_id")
    .notNull()
    .references(() => matches.id),
  homeScore: integer("home_score").notNull(),
  awayScore: integer("away_score").notNull(),
  loadedBy: text("loaded_by")
    .notNull()
    .references(() => users.id),
  loadedAt: timestamp("loaded_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

// Grupos
export const groups = pgTable("groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug"),
  description: text("description"),
  visibility: text("visibility").notNull().default("private"),
  inviteCode: text("invite_code").notNull().unique(),
  ownerUserId: text("owner_user_id")
    .notNull()
    .references(() => users.id),
  tournamentId: uuid("tournament_id")
    .notNull()
    .references(() => tournaments.id),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

// Miembros del grupo
export const groupMembers = pgTable(
  "group_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    groupId: uuid("group_id")
      .notNull()
      .references(() => groups.id),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    role: text("role").notNull().default("member"),
    joinedAt: timestamp("joined_at", { mode: "date" }).notNull().defaultNow(),
    status: text("status").notNull().default("active"),
  },
  (table) => [
    uniqueIndex("unique_group_user").on(table.groupId, table.userId),
  ]
);

// Reglas de puntaje por grupo
export const groupScoringRules = pgTable("group_scoring_rules", {
  id: uuid("id").primaryKey().defaultRandom(),
  groupId: uuid("group_id")
    .notNull()
    .references(() => groups.id),
  exactScorePoints: integer("exact_score_points").notNull().default(5),
  outcomePoints: integer("outcome_points").notNull().default(3),
  oneTeamScorePoints: integer("one_team_score_points").notNull().default(0),
  bonusPoints: integer("bonus_points").notNull().default(0),
  updatedBy: text("updated_by")
    .notNull()
    .references(() => users.id),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

// Pronósticos
export const predictions = pgTable(
  "predictions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    groupId: uuid("group_id")
      .notNull()
      .references(() => groups.id),
    matchId: uuid("match_id")
      .notNull()
      .references(() => matches.id),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    predictedHomeScore: integer("predicted_home_score").notNull(),
    predictedAwayScore: integer("predicted_away_score").notNull(),
    isLocked: boolean("is_locked").notNull().default(false),
    lockedAt: timestamp("locked_at", { mode: "date" }),
    isLate: boolean("is_late").notNull().default(false),
    lateMinutes: integer("late_minutes"),
    latePenaltyApplied: boolean("late_penalty_applied").notNull().default(true),
    lateExcusedBy: text("late_excused_by"),
    lateExcusedReason: text("late_excused_reason"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("unique_group_match_user").on(
      table.groupId,
      table.matchId,
      table.userId
    ),
  ]
);

// Historial de ediciones de pronósticos
export const predictionHistory = pgTable("prediction_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  predictionId: uuid("prediction_id")
    .notNull()
    .references(() => predictions.id),
  groupId: uuid("group_id")
    .notNull()
    .references(() => groups.id),
  matchId: uuid("match_id")
    .notNull()
    .references(() => matches.id),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  previousHomeScore: integer("previous_home_score"),
  previousAwayScore: integer("previous_away_score"),
  newHomeScore: integer("new_home_score").notNull(),
  newAwayScore: integer("new_away_score").notNull(),
  editedBy: text("edited_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

// Puntajes calculados
export const predictionScores = pgTable("prediction_scores", {
  id: uuid("id").primaryKey().defaultRandom(),
  predictionId: uuid("prediction_id")
    .notNull()
    .references(() => predictions.id),
  groupId: uuid("group_id")
    .notNull()
    .references(() => groups.id),
  matchId: uuid("match_id")
    .notNull()
    .references(() => matches.id),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  pointsAwarded: integer("points_awarded").notNull().default(0),
  hitExactScore: boolean("hit_exact_score").notNull().default(false),
  hitOutcome: boolean("hit_outcome").notNull().default(false),
  hitOneTeamScore: boolean("hit_one_team_score").notNull().default(false),
  bonusAwarded: integer("bonus_awarded").notNull().default(0),
  scoringReason: text("scoring_reason"),
  calculatedAt: timestamp("calculated_at", { mode: "date" })
    .notNull()
    .defaultNow(),
});

// Actividad del grupo (opcional MVP)
export const groupActivity = pgTable("group_activity", {
  id: uuid("id").primaryKey().defaultRandom(),
  groupId: uuid("group_id")
    .notNull()
    .references(() => groups.id),
  userId: text("user_id").references(() => users.id),
  activityType: text("activity_type").notNull(),
  referenceId: uuid("reference_id"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

// Configuración de la app (scoring, late predictions, etc.)
export const appConfig = pgTable("app_config", {
  key: text("key").primaryKey(),
  value: text("value"),
  description: text("description"),
  category: text("category"),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

// NOTA: los índices adicionales se agregan en migrations manuales.
// Drizzle ORM tiene una limitación con columnas json/jsonb en
// versiones recientes, así que evitamos exportar índices desde schema.
