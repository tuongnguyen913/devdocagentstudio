import { eq } from "drizzle-orm";

import { getDb, schema } from "@/db";
import type { User } from "@/db/schema";

export async function findUserByEmail(email: string): Promise<User | null> {
  const db = getDb();
  const results = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email.toLowerCase()))
    .limit(1);

  return results[0] || null;
}
