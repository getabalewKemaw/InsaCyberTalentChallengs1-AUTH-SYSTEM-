import "dotenv/config";
export const config = {
  port: Number(process.env.PORT || 5000),
  databaseUrl: process.env.DATABASE_URL || "",
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    isEnabled: Boolean(
      process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_CLIENT_ID !== "YOUR_GOOGLE_CLIENT_ID"
    ),
  },
};
