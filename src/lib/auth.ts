import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { getSupabaseAdmin } from "@/lib/db";
import type { UserRole } from "@/types";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    role: UserRole;
    name?: string | null;
  }
  interface Session {
    user: User & { role: UserRole };
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const supabase = getSupabaseAdmin();
        const { data: user, error } = await supabase
          .from("users")
          .select("id, email, password_hash, full_name, role, active")
          .eq("email", String(credentials.email).toLowerCase())
          .single();
        if (error || !user || !user.active) return null;
        const ok = await compare(String(credentials.password), user.password_hash);
        if (!ok) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.full_name,
          role: user.role as UserRole,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.email = user.email;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
});

export function requireAdmin(session: { user?: { role?: string } } | null) {
  return session?.user?.role === "admin";
}

export function requireEmployeeOrAdmin(session: { user?: { role?: string } } | null) {
  const r = session?.user?.role;
  return r === "admin" || r === "employee";
}

export function requireCustomer(session: { user?: { role?: string } } | null) {
  return session?.user?.role === "customer";
}
