declare module "next-auth/react" {
  export {
    useSession,
    SessionProvider,
    signIn,
    signOut,
  } from "@/lib/auth-client";
}

declare module "next-auth" {
  export type { SessionData as Session } from "@/lib/auth-client";
  export class AuthError extends Error {
    code: string;
  }
}
