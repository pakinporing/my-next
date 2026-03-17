import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import z from 'zod';
import { requestLogin, requestLogout, requestRefresh } from '@/libs/api/auth';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const { handlers, signIn, auth, signOut } = NextAuth({
  providers: [
    Credentials({
      async authorize(input) {
        const parsed = loginSchema.safeParse(input);
        if (!parsed.success) return null;

        try {
          const {
            user,
            accessToken,
            expiresIn,
            refreshToken,
            refreshExpiresIn
          } = await requestLogin(parsed.data.email, parsed.data.password);
          return {
            id: user.id,
            email: user.email,
            role: 'user',
            image: user.avatarUrl,
            name: `${user.firstName} ${user.lastName}`.trim(),
            accessToken: accessToken,
            accessTokenExpiresAt: Date.now() + expiresIn * 1000,
            refreshToken,
            refreshTokenExpiresAt: Date.now() + refreshExpiresIn * 1000
          };
        } catch {
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = user.role;
        token.accessToken = user.accessToken;
        token.userId = user.id;
        token.userImage = user.image ?? null;
        token.userName = user.name ?? null;
        token.accessTokenExpiresAt = user.accessTokenExpiresAt ?? null;
        token.refreshToken = user.refreshToken ?? null;
        token.refreshTokenExpiresAt = user.refreshTokenExpiresAt ?? null;
        token.refreshError = null;
      }

      if (trigger === 'update' && session?.user) {
        if ('image' in session.user) {
          token.userImage = session.user.image ?? null;
        }
        if ('name' in session.user) {
          token.userName = session.user.name ?? null;
        }
      }

      if (!token.refreshToken) {
        token.refreshError = 'No refresh token available';
        return token;
      }
      console.log('one');
      if (token.accessToken && token.accessTokenExpiresAt) {
        const now = Date.now();
        console.log(
          'first',
          new Date(now),
          new Date(token.accessTokenExpiresAt)
        );
        console.log('two', now, token.accessTokenExpiresAt);
        if (Date.now() < token.accessTokenExpiresAt) {
          return token;
        }

        try {
          const { accessToken, expiresIn, refreshToken, refreshExpiresIn } =
            await requestRefresh(token.refreshToken);

          token.accessToken = accessToken;
          token.accessTokenExpiresAt = Date.now() + expiresIn * 1000;

          if (refreshToken) {
            token.refreshToken = refreshToken;
          }

          if (refreshExpiresIn) {
            token.refreshTokenExpiresAt = Date.now() + refreshExpiresIn * 1000;
          }

          token.refreshError = null;
        } catch (err) {
          token.refreshError = 'Failed to refresh access token';
        }
      }

      return token;
    },
    session({ token, session }) {
      session.user.role = token.role;
      if (token.userId) {
        session.user.id = token.userId;
      }
      if (token.accessToken) {
        session.accessToken = token.accessToken;
      }

      session.refreshError = token.refreshError ?? null;
      if ('image' in session.user) {
        session.user.image = token.userImage ?? session.user.image ?? null;
      }
      if ('name' in session.user) {
        session.user.name = token.userName ?? session.user.name ?? null;
      }
      return session;
    }
  },

  trustHost: true
});
