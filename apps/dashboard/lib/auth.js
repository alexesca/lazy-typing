import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from './prisma.js';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: 'Email and Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        const email = String(credentials?.email || '').toLowerCase();
        const password = String(credentials?.password || '');
        if (!email || !password) {
          return null;
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;
        if (user.passwordHash !== password) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name || user.email,
          timezone: user.timezone || 'UTC'
        };
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.timezone = user.timezone || 'UTC';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId;
        session.user.timezone = token.timezone || 'UTC';
      }
      return session;
    }
  }
});
