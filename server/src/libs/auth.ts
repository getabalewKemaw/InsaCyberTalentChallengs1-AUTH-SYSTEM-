import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db.js";
import * as schema from "../db/schema.js"
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      enabled: Boolean(
        process.env.GOOGLE_CLIENT_ID &&
          process.env.GOOGLE_CLIENT_SECRET &&
          process.env.GOOGLE_CLIENT_ID !== "YOUR_GOOGLE_CLIENT_ID"
      ),
      clientId: process.env.GOOGLE_CLIENT_ID ||"" ,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ||"",
    },
  },
  trustedOrigins: [
    process.env.CLIENT_URL || "http://localhost:3000"],
});

export default auth;
