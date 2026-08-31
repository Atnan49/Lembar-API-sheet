import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      segmentTag?: string | null;
      encryptedRefreshToken?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    segmentTag?: string | null;
    encryptedRefreshToken?: string;
  }
}
