import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { users, accounts, profiles } from "@/lib/db/schema";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    // Validaciones
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son requeridos" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    // Verificar si el email ya existe
    const _db = getDb();
    const existingUser = await _db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "El email ya está registrado" },
        { status: 409 }
      );
    }

    // Hash de contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario + account + profile en transacción
    const userId = crypto.randomUUID();

    await _db.insert(users).values({
      id: userId,
      email,
      name: name || email.split("@")[0],
    });

    // Guardar hash en accounts (provider = "credentials")
    await _db.insert(accounts).values({
      userId,
      type: "credentials",
      provider: "credentials",
      providerAccountId: userId,
      access_token: hashedPassword,
    });

    // Crear perfil
    await _db.insert(profiles).values({
      id: userId,
      displayName: name || email.split("@")[0],
      role: "user",
    });

    return NextResponse.json(
      { success: true, userId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error en registro:", error);
    return NextResponse.json(
      { error: "Error al registrar usuario" },
      { status: 500 }
    );
  }
}
