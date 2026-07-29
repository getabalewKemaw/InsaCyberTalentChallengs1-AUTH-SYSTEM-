import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { haveIBeenPwned } from "better-auth/plugins/haveibeenpwned";
import { db } from "./db.js";
import * as schema from "../db/schema.js";
import { config } from "./env.js";
import { processSessionCreation } from "../services/login-activity.service.js";
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  plugins: [
    haveIBeenPwned({
      customPasswordCompromisedMessage:
        "This password has been exposed in a data breach. Please choose a secure, uncompromised password.",
    }),
  ],
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    storage: "memory",
    customRules: {
      "/sign-in/email": {
        window: 60,
        max: 5,
      },
      "/sign-up/email": {
        window: 60,
        max: 5,
      },
    },
  },
  session: {
    expiresIn: 7 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  socialProviders: {
    google: {
      enabled: config.google.isEnabled,
      clientId: config.google.clientId,
      clientSecret: config.google.clientSecret,
    },
  },
  trustedOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    config.clientUrl,
  ],
  advanced: {
    ipAddress: {
      trustedProxies: ["127.0.0.1", "::1"],
      ipAddressHeaders: ["x-forwarded-for", "x-real-ip"],
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },
  databaseHooks: {
    session: {
      create: {
        after: async (session) => {
          await processSessionCreation(session);
        },
      },
    },
  },
});

export default auth; 
