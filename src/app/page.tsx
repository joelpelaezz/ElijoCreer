import Link from "next/link";
import { auth } from "@/lib/auth/config";
import { getPool } from "@/lib/db";

async function getNextMatch() {
  const pool = getPool();
  const result = await pool.query(`
    SELECT 
      m.id, m.starts_at, m.stage, m.round_label,
      ht.name as home_name, ht.code as home_code, ht.flag_icon as home_flag,
      at.name as away_name, at.code as away_code, at.flag_icon as away_flag
    FROM matches m
    JOIN teams ht ON ht.id = m.home_team_id
    JOIN teams at ON at.id = m.away_team_id
    WHERE m.starts_at > NOW()
    ORDER BY m.starts_at ASC
    LIMIT 1
  `);
  return result.rows[0] || null;
}

async function getStats() {
  const pool = getPool();
  
  const usersResult = await pool.query(`SELECT count(*)::int as c FROM "user"`);
  const groupsResult = await pool.query(`SELECT count(*)::int as c FROM groups`);
  const matchesResult = await pool.query(`SELECT count(*)::int as c FROM matches`);
  
  return {
    users: usersResult.rows[0]?.c || 0,
    groups: groupsResult.rows[0]?.c || 0,
    matches: matchesResult.rows[0]?.c || 0,
  };
}

async function getPublicGroups() {
  const pool = getPool();
  const result = await pool.query(`
    SELECT g.id, g.name, g.slug, g.description, t.name as tournament,
           (SELECT count(*)::int FROM group_members WHERE group_id = g.id) as member_count
    FROM groups g
    LEFT JOIN tournaments t ON t.id = g.tournament_id
    WHERE g.visibility = 'public'
    ORDER BY member_count DESC
    LIMIT 6
  `);
  return result.rows;
}

async function getUserRanking(groupId: string, userId: string) {
  const pool = getPool();
  
  // Get user's total score from predictions
  // Scores are stored in official_results, not on matches directly
  const scoreResult = await pool.query(`
    SELECT COALESCE(SUM(
      CASE 
        WHEN p.predicted_home_score = r.home_score AND p.predicted_away_score = r.away_score THEN 5
        WHEN (p.predicted_home_score > p.predicted_away_score AND r.home_score > r.away_score)
             OR (p.predicted_home_score < p.predicted_away_score AND r.home_score < r.away_score)
             OR (p.predicted_home_score = p.predicted_away_score AND r.home_score = r.away_score) THEN 3
        WHEN p.predicted_home_score = r.home_score OR p.predicted_away_score = r.away_score THEN 1
        ELSE 0
      END
    ), 0) as score
    FROM predictions p
    JOIN matches m ON m.id = p.match_id
    LEFT JOIN official_results r ON r.match_id = m.id
    WHERE p.group_id = $1 AND p.user_id = $2 AND r.home_score IS NOT NULL
  `, [groupId, userId]);
  
  // Get total users in group
  const totalResult = await pool.query(`
    SELECT count(*)::int as c FROM "group_members" WHERE group_id = $1 AND status = 'active'
  `, [groupId]);
  
  return {
    userScore: scoreResult.rows[0]?.score || 0,
    totalUsers: totalResult.rows[0]?.c || 0,
    groupName: "",
  };
}

export default async function HomePage() {
  const session = await auth();
  const nextMatch = await getNextMatch();
  const stats = await getStats();
  const publicGroups = await getPublicGroups();
  
  let userRanking = null;
  if (session?.user?.id) {
    const pool = getPool();
    const userGroups = await pool.query(`
      SELECT gm.group_id, g.name as group_name 
      FROM "group_members" gm
      JOIN groups g ON g.id = gm.group_id
      WHERE gm.user_id = $1 AND gm.status = 'active'
      LIMIT 1
    `, [session.user.id]);
    
    if (userGroups.rows.length > 0) {
      userRanking = await getUserRanking(userGroups.rows[0].group_id, session.user.id);
      userRanking.groupName = userGroups.rows[0].group_name;
    }
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative mx-4 mt-8 rounded-3xl overflow-hidden hero-gradient text-white p-8 md:p-16 flex flex-col md:flex-row items-center gap-12 min-h-[500px]">
        <div className="flex-1 z-10 space-y-6 text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
            <span className="w-2 h-2 rounded-full bg-[#e9c349] live-pulse"></span>
            <span className="uppercase tracking-widest text-xs font-bold">
              Road to 2026
            </span>
          </div>
          <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-extrabold leading-tight">
            La gloria se predice, <br />
            <span className="text-[#e9c349]">el orgullo se comparte.</span>
          </h1>
          <p className="text-lg opacity-90 max-w-xl mx-auto md:mx-0">
            La plataforma social de predicciones del Mundial 2026. Creá grupos con
            amigos, cargá tus pronósticos y subí en el ranking.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center md:justify-start">
            {session?.user ? (
              <Link
                href="/dashboard"
                className="bg-white text-[#236391] font-bold px-8 py-4 rounded-xl shadow-lg hover:bg-blue-50 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                Ir al Dashboard
                <span className="material-symbols-outlined text-xl">
                  arrow_forward
                </span>
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="bg-white text-[#236391] font-bold px-8 py-4 rounded-xl shadow-lg hover:bg-blue-50 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  Crear Cuenta
                  <span className="material-symbols-outlined text-xl">
                    arrow_forward
                  </span>
                </Link>
                <Link
                  href="/login"
                  className="border-2 border-white/30 text-white font-bold px-8 py-4 rounded-xl hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  Iniciar Sesión
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="flex-1 relative w-full h-[300px] md:h-[450px]">
          <div className="absolute inset-0 bg-gradient-to-t from-[#001d32] to-transparent z-10 md:hidden"></div>
          <div className="w-full h-full rounded-2xl bg-gradient-to-br from-[#236391]/30 to-[#001d32]/50 flex items-center justify-center">
            <span className="material-symbols-outlined text-8xl text-white/30">
              sports_soccer
            </span>
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="max-w-7xl mx-auto px-4 -mt-6 relative z-20">
        <div className="bg-white rounded-2xl shadow-lg border border-[#e0e3e5] p-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-[#236391]">{stats.users}</p>
              <p className="text-sm text-[#41474f]">Usuarios</p>
            </div>
            <div className="border-l border-[#e0e3e5]">
              <p className="text-3xl font-bold text-[#236391]">{stats.groups}</p>
              <p className="text-sm text-[#41474f]">Grupos</p>
            </div>
            <div className="border-l border-[#e0e3e5]">
              <p className="text-3xl font-bold text-[#236391]">{stats.matches}</p>
              <p className="text-sm text-[#41474f]">Partidos</p>
            </div>
          </div>
        </div>
      </section>

      {/* Public Groups */}
      {publicGroups.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 my-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[#191c1e]">
              Grupos Públicos
            </h2>
            <p className="text-[#41474f] mt-1">
              Unite a un grupo y empezá a competir
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {publicGroups.map((group: any) => (
              <Link
                key={group.id}
                href={`/groups/${group.id}`}
                className="bg-white p-5 rounded-2xl border border-[#e0e3e5] hover:border-[#236391] hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-[#191c1e] group-hover:text-[#236391] transition-colors">
                      {group.name}
                    </h3>
                    {group.description && (
                      <p className="text-sm text-[#41474f] mt-1 line-clamp-2">
                        {group.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-3 text-xs text-[#737a8c]">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">person</span>
                        {group.member_count} miembros
                      </span>
                      {group.tournament && (
                        <span className="bg-[#f2f4f6] px-2 py-0.5 rounded-full">
                          {group.tournament}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[#236391]">arrow_forward</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 my-16" id="features">
        <div className="text-center mb-12">
          <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-bold text-[#191c1e]">
            ¿Cómo funciona?
          </h2>
          <p className="text-[#41474f] mt-2">
            Tres pasos para convertirte en el campeón de tu grupo.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#e0e3e5] hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 bg-[#236391]/10 rounded-xl flex items-center justify-center mb-6 text-[#236391] group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-3xl">groups</span>
            </div>
            <h3 className="text-xl font-bold text-[#191c1e] mb-2">
              Creá tu grupo
            </h3>
            <p className="text-[#41474f]">
              Armá un grupo privado con amigos o unite a una liga pública. La
              competencia es mejor cuando es social.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#e0e3e5] hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 bg-[#ffe088]/30 rounded-xl flex items-center justify-center mb-6 text-[#735c00] group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-3xl">
                edit_note
              </span>
            </div>
            <h3 className="text-xl font-bold text-[#191c1e] mb-2">
              Predicí los resultados
            </h3>
            <p className="text-[#41474f]">
              Cargá tus pronósticos antes de cada partido. Ganá puntos por
              resultado exacto o por acertar el ganador.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#e0e3e5] hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 bg-[#a6ccfe]/30 rounded-xl flex items-center justify-center mb-6 text-[#39618c] group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-3xl">
                leaderboard
              </span>
            </div>
            <h3 className="text-xl font-bold text-[#191c1e] mb-2">
              Ganá el ranking
            </h3>
            <p className="text-[#41474f]">
              Escalá posiciones en el ranking de tu grupo. Demostrá quién conoce
              más del fútbol.
            </p>
          </div>
        </div>
      </section>

      {/* Preview Section - Dynamic */}
      <section className="max-w-7xl mx-auto px-4 my-16" id="preview">
        <div className="text-center mb-12">
          <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-bold text-[#191c1e]">
            {nextMatch ? "Próximo Partido" : "Viví la experiencia"}
          </h2>
          <p className="text-[#41474f] mt-2">
            {nextMatch 
              ? `Fecha: ${new Date(nextMatch.starts_at).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'America/Argentina/Buenos_Aires' })}`
              : "Interfaz moderna diseñada para los fans más apasionados."
            }
          </p>
        </div>
        
        {nextMatch ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Next Match Card */}
            <div className="lg:col-span-8 bg-white rounded-3xl p-8 border border-[#e0e3e5] shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <span className="text-sm font-semibold text-[#236391] bg-[#236391]/10 px-3 py-1 rounded-full">
                  Próximo Partido
                </span>
                <span className="text-sm font-semibold text-[#41474f]">
                  {nextMatch.stage === 'group' ? 'Fase de Grupos' : nextMatch.stage.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <div className="flex justify-around items-center gap-4 mb-8">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-20 h-20 rounded-full bg-[#f2f4f6] flex items-center justify-center shadow-lg border-4 border-white text-4xl">
                    {nextMatch.home_flag || '🇦🇷'}
                  </div>
                  <span className="text-lg font-bold text-[#191c1e]">
                    {nextMatch.home_name}
                  </span>
                  <span className="text-sm text-[#41474f]">{nextMatch.home_code}</span>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-20 bg-[#f7f9fb] rounded-xl border border-[#74acdf] flex items-center justify-center text-3xl font-bold text-[#191c1e]">
                    ?
                  </div>
                  <span className="text-2xl font-bold text-[#c1c7d0]">:</span>
                  <div className="w-16 h-20 bg-[#f7f9fb] rounded-xl border border-[#c1c7d0] flex items-center justify-center text-3xl font-bold text-[#191c1e]">
                    ?
                  </div>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-20 h-20 rounded-full bg-[#f2f4f6] flex items-center justify-center shadow-lg border-4 border-white text-4xl">
                    {nextMatch.away_flag || '🇲🇽'}
                  </div>
                  <span className="text-lg font-bold text-[#191c1e]">
                    {nextMatch.away_name}
                  </span>
                  <span className="text-sm text-[#41474f]">{nextMatch.away_code}</span>
                </div>
              </div>
              <div className="bg-[#f2f4f6] p-4 rounded-2xl flex items-center justify-between">
                <p className="text-[#41474f] text-sm">
                  {new Date(nextMatch.starts_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs
                </p>
                <span className="text-sm font-bold text-[#236391]">
                  +5 pts si acertás el exacto
                </span>
              </div>
            </div>

            {/* User Ranking or Login Prompt */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {session?.user && userRanking ? (
                <div className="flex-1 bg-white rounded-3xl p-6 border border-[#e0e3e5] shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-[#191c1e]">
                      Tu Progreso
                    </h3>
                    <span className="material-symbols-outlined text-[#735c00]">
                      trending_up
                    </span>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-[#f2f4f6] p-4 rounded-xl">
                      <p className="text-sm text-[#41474f] mb-1">Tu grupo</p>
                      <p className="text-xl font-bold text-[#191c1e]">{userRanking.groupName}</p>
                    </div>
                    <div className="bg-[#236391] p-4 rounded-xl text-white">
                      <p className="text-sm opacity-70 mb-1">Puntos acumulados</p>
                      <p className="text-3xl font-bold">{userRanking.userScore}</p>
                    </div>
                    <Link 
                      href="/dashboard"
                      className="block text-center text-[#236391] text-sm font-medium hover:underline"
                    >
                      Ver ranking completo →
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="flex-1 bg-white rounded-3xl p-6 border border-[#e0e3e5] shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-[#191c1e]">
                      Ranking Amigos
                    </h3>
                    <span className="material-symbols-outlined text-[#735c00]">
                      workspace_premium
                    </span>
                  </div>
                  <p className="text-[#41474f] text-sm mb-4">
                    Iniciá sesión para ver tu posición en el ranking
                  </p>
                  <Link 
                    href="/login"
                    className="block text-center bg-[#236391] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#236391]/90 transition-colors"
                  >
                    Iniciar Sesión
                  </Link>
                </div>
              )}
              
              <div className="bg-[#236391] rounded-3xl p-6 text-white">
                <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2">
                  {session ? "Tu Nivel" : " Unite a la competencia"}
                </p>
                {session ? (
                  <>
                    <p className="text-3xl font-bold mb-4">
                      {userRanking && userRanking.userScore > 100 ? 'Experto' : 
                       userRanking && userRanking.userScore > 50 ? 'Intermedio' : 'Novato'}
                    </p>
                    <div className="relative h-2 bg-white/20 rounded-full mb-2">
                      <div 
                        className="absolute inset-y-0 left-0 bg-[#e9c349] rounded-full" 
                        style={{ width: `${Math.min(100, (userRanking?.userScore || 0) / 2) }%` }}
                      ></div>
                    </div>
                    <p className="text-sm opacity-90">
                      {userRanking?.userScore || 0} puntos
                    </p>
                  </>
                ) : (
                  <p className="text-lg opacity-90">
                    Registrate y empezá a competir con tus amigos
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Placeholder when no matches */}
            <div className="lg:col-span-8 bg-white rounded-3xl p-8 border border-[#e0e3e5] shadow-sm">
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-6xl text-[#c1c7d0] mb-4">
                  sports_soccer
                </span>
                <p className="text-[#41474f]">
                  Los partidos del Mundial 2026 estarán disponibles pronto
                </p>
              </div>
            </div>
            
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="flex-1 bg-white rounded-3xl p-6 border border-[#e0e3e5] shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-[#191c1e]">
                    Ranking Amigos
                  </h3>
                  <span className="material-symbols-outlined text-[#735c00]">
                    workspace_premium
                  </span>
                </div>
                <p className="text-[#41474f] text-sm">
                  Unite a la competencia
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 my-16">
        <div className="bg-[#e6e8ea] rounded-[40px] p-8 md:p-16 text-center">
          <h2 className="text-[clamp(1.5rem,3vw,2.5rem)] font-extrabold text-[#191c1e] mb-6">
            ¿Listo para demostrar tu fe?
          </h2>
          <p className="text-lg text-[#41474f] max-w-2xl mx-auto mb-10">
            Unite a miles de aficionados que ya están armando sus grupos. No te
            quedes fuera del mayor evento social del 2026.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {session?.user ? (
              <Link
                href="/dashboard"
                className="bg-[#236391] text-white font-bold px-10 py-5 rounded-2xl shadow-xl hover:bg-[#236391]/90 hover:-translate-y-1 transition-all active:scale-95"
              >
                Ir al Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="bg-[#236391] text-white font-bold px-10 py-5 rounded-2xl shadow-xl hover:bg-[#236391]/90 hover:-translate-y-1 transition-all active:scale-95"
                >
                  Crear Cuenta Gratis
                </Link>
                <Link
                  href="/login"
                  className="bg-white text-[#236391] font-bold px-10 py-5 rounded-2xl shadow-md border border-[#c1c7d0] hover:bg-[#f7f9fb] transition-all active:scale-95"
                >
                  Iniciar Sesión
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 mt-16 border-t border-[#e0e3e5]">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <h4 className="text-xl font-bold text-[#236391]">ElijoCreer</h4>
            <p className="text-sm text-[#41474f]">
              La red social definitiva para fanáticos del fútbol y maestros de
              las predicciones.
            </p>
          </div>
          <div className="space-y-4">
            <h5 className="text-sm font-bold uppercase text-[#191c1e]">
              Plataforma
            </h5>
            <ul className="space-y-2 text-sm text-[#41474f]">
              <li>
                <Link href="/dashboard" className="hover:text-[#236391]">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-[#236391]">
                  Ingresar
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h5 className="text-sm font-bold uppercase text-[#191c1e]">
              Legal
            </h5>
            <ul className="space-y-2 text-sm text-[#41474f]">
              <li>
                <span className="cursor-default">Términos y Condiciones</span>
              </li>
              <li>
                <span className="cursor-default">Privacidad</span>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h5 className="text-sm font-bold uppercase text-[#191c1e]">
              Contacto
            </h5>
            <p className="text-sm text-[#41474f]">
              Seguinos en redes para estar al tanto de las novedades.
            </p>
          </div>
        </div>
        <div className="text-center mt-12 pt-8 border-t border-[#e0e3e5] text-sm text-[#41474f]">
          © 2026 ElijoCreer. Todos los derechos reservados.
        </div>
      </footer>
    </>
  );
}