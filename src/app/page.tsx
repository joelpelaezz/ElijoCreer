import Link from "next/link";
import { auth } from "@/lib/auth/config";

export default async function HomePage() {
  const session = await auth();

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

      {/* Preview Section */}
      <section className="max-w-7xl mx-auto px-4 my-16" id="preview">
        <div className="text-center mb-12">
          <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-bold text-[#191c1e]">
            Viví la experiencia
          </h2>
          <p className="text-[#41474f] mt-2">
            Interfaz moderna diseñada para los fans más apasionados.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Prediction Card */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-8 border border-[#e0e3e5] shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <span className="text-sm font-semibold text-[#236391] bg-[#236391]/10 px-3 py-1 rounded-full">
                Próximo Partido
              </span>
              <span className="text-sm font-semibold text-[#41474f]">
                Grupo A • Estadio Azteca
              </span>
            </div>
            <div className="flex justify-around items-center gap-4 mb-8">
              <div className="flex flex-col items-center gap-3">
                <div className="w-20 h-20 rounded-full bg-[#f2f4f6] flex items-center justify-center shadow-lg border-4 border-white text-2xl font-bold text-[#236391]">
                  ARG
                </div>
                <span className="text-lg font-bold text-[#191c1e]">
                  Argentina
                </span>
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
                <div className="w-20 h-20 rounded-full bg-[#f2f4f6] flex items-center justify-center shadow-lg border-4 border-white text-2xl font-bold text-[#236391]">
                  MEX
                </div>
                <span className="text-lg font-bold text-[#191c1e]">
                  México
                </span>
              </div>
            </div>
            <div className="bg-[#f2f4f6] p-4 rounded-2xl flex items-center justify-between">
              <p className="text-[#41474f] text-sm">
                ¿Podés predecir el resultado exacto?
              </p>
              <span className="text-sm font-bold text-[#236391]">
                +5 pts si acertás
              </span>
            </div>
          </div>

          {/* Ranking Snippet + Stats */}
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
              <div className="space-y-4">
                {[
                  { pos: "1", name: "Messi_10", pts: "1,240" },
                  { pos: "2", name: "Vos", pts: "1,180", active: true },
                  { pos: "3", name: "Maria_Fan", pts: "950" },
                ].map((item) => (
                  <div
                    key={item.pos}
                    className={`flex items-center justify-between p-2 rounded-xl transition-colors ${
                      item.active
                        ? "bg-[#d2e4ff]/20 border border-[#a6ccfe]/30"
                        : "hover:bg-[#f7f9fb]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-[#41474f]">
                        {item.pos}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-[#236391]/20 flex items-center justify-center text-xs font-bold text-[#236391]">
                        {item.name[0]}
                      </div>
                      <span className="text-sm font-semibold">{item.name}</span>
                    </div>
                    <span className="text-sm font-bold text-[#236391]">
                      {item.pts} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#236391] rounded-3xl p-6 text-white">
              <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2">
                Tu Nivel de Confianza
              </p>
              <p className="text-3xl font-bold mb-4">Experto</p>
              <div className="relative h-2 bg-white/20 rounded-full mb-2">
                <div className="absolute inset-y-0 left-0 bg-[#e9c349] rounded-full w-[65%]"></div>
              </div>
              <p className="text-sm opacity-90">
                A 240 pts del nivel Legendario
              </p>
            </div>
          </div>
        </div>
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
