import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
});

export const {  signUp, signOut, useSession } = authClient;

export const signIn = async () => {
  const data = await authClient.signIn.social({
    provider: "google",
  });
};