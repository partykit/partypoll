import NextAuth, { type NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";

const AUTH_ENABLED = false;
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID!;
const GITHUB_SECRET = process.env.GITHUB_SECRET!;

if (AUTH_ENABLED && !GITHUB_CLIENT_ID)
  throw new Error("GITHUB_CLIENT_ID not defined in environment");

if (AUTH_ENABLED && !GITHUB_SECRET)
  throw new Error("GITHUB_CLIENT_SECRET not defined in environment");

const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_SECRET,
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    signIn(params) {
      return true;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
