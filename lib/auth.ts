import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { sqliteDb } from "@/lib/db/sqlite";
import { users, auditLogs } from "@/lib/db/schema";
import { userPeppers } from "@/lib/db/schema/sqlite-secrets";
import logger from "@/lib/logger";
import { isPasswordValid } from "@/lib/validators/auth";

// Helper: log audit event without breaking login if DB is unavailable
async function logAudit(data: typeof auditLogs.$inferInsert) {
  try {
    await db.insert(auditLogs).values(data);
  } catch {
    // Fail-open: login must work even if audit table is down
  }
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "utilisateur" | "administrateur";
      name?: string | null;
      email?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "utilisateur" | "administrateur";
  }
}

export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials, req) {
        const getClientInfo = () => {
          // NextAuth v4 headers type is inconsistent across environments
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const h = (req as any)?.headers || {};
          const getHeader = (name: string): string | undefined => {
            if (typeof h.get === "function") return h.get(name) || undefined;
            return h[name] || h[name.toLowerCase()] || undefined;
          };
          const forwarded = getHeader("x-forwarded-for");
          return {
            ip: forwarded ? forwarded.split(",")[0].trim() : getHeader("x-real-ip") || "unknown",
            userAgent: getHeader("user-agent") || "unknown",
          };
        };

        const { ip, userAgent } = getClientInfo();

        if (!credentials?.email || !credentials?.password) {
          logger.warn({ action: "FAILED_LOGIN", ip }, "Missing credentials");
          return null;
        }

        const email = credentials.email.trim().toLowerCase();
        const password = credentials.password;

        if (email.length > 254 || password.length > 128 || password.length < 1) {
          logger.warn({ action: "FAILED_LOGIN", email, ip }, "Invalid input length");
          return null;
        }

        if (!isPasswordValid(password)) {
          logger.warn({ action: "FAILED_LOGIN", email, ip }, "Password does not meet complexity policy");
          return null;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          logger.warn({ action: "FAILED_LOGIN", email, ip }, "Invalid email format");
          return null;
        }

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (!user) {
          await logAudit({
            action: "FAILED_LOGIN",
            email,
            ipAddress: ip,
            userAgent,
            success: false,
            details: "User not found",
          });
          logger.warn({ action: "FAILED_LOGIN", email, ip }, "User not found");
          return null;
        }

        if (!user.isActive) {
          await logAudit({
            userId: user.id,
            action: "ACCOUNT_DISABLED",
            email: user.email,
            ipAddress: ip,
            userAgent,
            success: false,
            details: "Account is disabled",
          });
          logger.warn({ userId: user.id, action: "ACCOUNT_DISABLED", ip }, "Login on disabled account");
          throw new Error("ACCOUNT_DISABLED");
        }

        // Retrieve unique pepper from segregated SQLite storage
        const [pepperRow] = await sqliteDb
          .select()
          .from(userPeppers)
          .where(eq(userPeppers.userId, user.id))
          .limit(1);

        const pepper = pepperRow?.pepper || '';
        const passwordMatch = await bcrypt.compare(credentials.password + pepper, user.passwordHash);
        if (!passwordMatch) {
          await logAudit({
            userId: user.id,
            action: "FAILED_LOGIN",
            email: user.email,
            ipAddress: ip,
            userAgent,
            success: false,
            details: "Invalid password",
          });
          logger.warn({ userId: user.id, action: "FAILED_LOGIN", ip }, "Invalid password");
          return null;
        }

        await logAudit({
          userId: user.id,
          action: "LOGIN",
          email: user.email,
          ipAddress: ip,
          userAgent,
          success: true,
          details: "Login successful",
        });
        logger.info({ userId: user.id, action: "LOGIN", ip }, "Login successful");

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as unknown as { role: "utilisateur" | "administrateur" }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
};
