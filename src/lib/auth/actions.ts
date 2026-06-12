import { auth, signIn, signOut } from "./config";

/**
 * Obtiene la sesión actual del servidor.
 * Útil en Server Components y Route Handlers.
 */
export async function getSession() {
  return auth();
}

/**
 * Obtiene el usuario actual desde la sesión.
 */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

/**
 * Inicia sesión con email y contraseña.
 */
export async function loginWithCredentials(email: string, password: string) {
  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    return result;
  } catch (error) {
    console.error("Error en login:", error);
    return { error: "Error al iniciar sesión" };
  }
}

/**
 * Cierra la sesión del usuario.
 */
export async function logout() {
  await signOut({ redirect: false });
}
