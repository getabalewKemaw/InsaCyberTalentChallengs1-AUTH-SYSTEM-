import { eq } from "drizzle-orm";
import { db } from "../config/db.js";
import * as schema from "../db/schema.js";

export async function findUserById(id: string) {
  const [usr] = await db
    .select()
    .from(schema.user)
    .where(eq(schema.user.id, id))
    .limit(1);
  return usr || null;
}

export async function findUserByEmail(email: string) {
  const [usr] = await db
    .select()
    .from(schema.user)
    .where(eq(schema.user.email, email))
    .limit(1);
  return usr || null;
}
