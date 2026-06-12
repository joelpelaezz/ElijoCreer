import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { getDb } from "@/lib/db";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  adapter: DrizzleAdapter(getDb()),
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        console.log("📧 authorize called with:", credentials);
        
        const email = credentials?.email as string;
        const password = credentials?.password as string;

        if (!email || !password) {
          console.log("❌ No email/password");
          return null;
        }

        const _db = getDb();
        const user = await _db.query.users.findFirst({
          where: (users, { eq }) => eq(users.email, email),
        });

        if (!user) {
          console.log("❌ User not found");
          return null;
        }

        const account = await _db.query.accounts.findFirst({
          where: (accounts, { eq, and }) =>
            and(eq(accounts.userId, user.id), eq(accounts.provider, "credentials")),
        });

        if (!account?.access_token) {
          console.log("❌ No account");
          return null;
        }

        const isValid = await bcrypt.compare(password, account.access_token);
        console.log("✅ Password valid:", isValid);

        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});