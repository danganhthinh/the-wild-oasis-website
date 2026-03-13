import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { getGuest, createGuest } from "./data-service";

const authConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  secret: process.env.AUTH_SECRET,
  callbacks: {
    authorized({ auth, request }) {
      return !!auth?.user;
    },
    async signIn({ user, account, profile }) {
      try {
        // Authenticate with our NestJS Backend
        const authData = await createGuest({
          idToken: account.id_token,
          email: user.email,
          fullName: user.name,
        });
        
        // Attach the token to the user object temporarily so it can be picked up by the jwt/session callbacks
        user.accessToken = authData.access_token;
        user.guestId = authData.guest._id;
        
        return true;
      } catch (e) {
        console.error("Backend Auth Error:", e);
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.guestId = user.guestId;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.accessToken = token.accessToken;
      session.user.guestId = token.guestId;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

export const {
  auth,
  signIn,
  signOut,
  handlers: { GET, POST },
} = NextAuth(authConfig);
