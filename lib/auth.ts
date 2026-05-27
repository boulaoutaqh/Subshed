import type { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/db';

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: 'database' },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/gmail.readonly',
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      const account = await prisma.account.findFirst({
        where: { userId: user.id, provider: 'google' },
      });

      if (account) {
        if (account.expires_at && account.expires_at * 1000 < Date.now()) {
          const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            body: new URLSearchParams({
              client_id: process.env.GOOGLE_CLIENT_ID!,
              client_secret: process.env.GOOGLE_CLIENT_SECRET!,
              grant_type: 'refresh_token',
              refresh_token: account.refresh_token!,
            }),
          });
          const tokens = await response.json();
          await prisma.account.update({
            where: { id: account.id },
            data: {
              access_token: tokens.access_token,
              expires_at: Math.floor(Date.now() / 1000 + tokens.expires_in),
            },
          });
          (session as any).accessToken = tokens.access_token;
        } else {
          (session as any).accessToken = account.access_token;
        }
      }

      if (session.user) (session.user as any).id = user.id;
      return session;
    },
  },
  pages: { signIn: '/login' },
};