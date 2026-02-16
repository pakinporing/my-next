import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import VK from 'next-auth/providers/vk';
import z from 'zod';

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1)
});

export const { handlers, signIn, auth, signOut } = NextAuth({
  providers: [
    Credentials({
      authorize(input) {
        console.log(input);
        // validate
        const data = loginSchema.parse(input);
        // assume user => a@mail.com, password => 123456
        // const user = await prisma.user.findUnique({ where: email: data.email })
        // if (!user) return null
        if (data.email !== 'pakinpor@gmail.com') return null;
        // const isMatch = await bcrypt.compare(data.password, user.password)
        if (data.password !== 'ppp') return null;
        // throw error or return null ==> login failed
        // return User type { id?: string; email?:string, image?:string, name?:string } ===> success
        return {
          email: data.email,
          role: 'admin',
          image: 'imagesssss',
          name: 'pakin'
        };
      }
    }),
    Google,
    GitHub,
    VK
  ],
  callbacks: {
    jwt({ token, user, trigger }) {
      // this callback run when
      // 1. login success (trigger = 'signIn') (user = return from authorized)
      // 2. when auth is called (await auth()), api/auth/session (trigger = undefined) (user = undefined)
      console.log('jwt callback token:', token);
      console.log('jwt callback user:', user);
      console.log('jwt callback trigger:', trigger);
      if (user) {
        token.role = user.role;
      }

      return token;
    },
    session({ token, session }) {
      console.log('session callback token:', token);
      session.user.role = token.role;
      return session;
    }
  }
});

// User
// export interface DefaultUser {
//   id?: string
//   name?: string | null
//   email?: string | null
//   image?: string | null
// }

// AdapterUser
// export interface AdapterUser extends User {
//   /** A unique identifier for the user. */
//   id: string
//   /** The user's email address. */
//   email: string
//   /**
//    * Whether the user has verified their email address via an [Email provider](https://authjs.dev/getting-started/authentication/email).
//    * It is `null` if the user has not signed in with the Email provider yet, or the date of the first successful signin.
//    */
//   emailVerified: Date | null
// }

// JWT
// export interface JWT extends Record<string, unknown>, DefaultJWT {}

//
// export interface DefaultJWT extends Record<string, unknown> {
//   name?: string | null
//   email?: string | null
//   picture?: string | null
//   sub?: string
//   iat?: number
//   exp?: number
//   jti?: string
// }
