import { config } from "dotenv";
import { getDb, schema } from "./index";
import { STATIC_USERS } from "../lib/auth/users";
import { getAllSkillConfigs } from "../data/skills/all-skills";

config({ path: ".env.local" });

async function seed() {
  const db = getDb();

  console.log("Seeding users...");
  for (const user of STATIC_USERS) {
    await db
      .insert(schema.users)
      .values({
        email: user.email,
        name: user.name,
        role: user.role,
        passwordHash: user.passwordHash,
        avatarUrl: user.avatar,
      })
      .onConflictDoNothing();
  }
  console.log("Users seeded.");

  console.log("Seeding skill configs...");
  const skillConfigs = getAllSkillConfigs();
  for (const skill of skillConfigs) {
    await db
      .insert(schema.skillConfigs)
      .values({
        moduleId: skill.id,
        prompt: skill.prompt,
        active: skill.active,
        version: skill.version,
        schemaVersion: skill.schemaVersion,
      })
      .onConflictDoNothing();
  }
  console.log("Skill configs seeded.");

  console.log("Seeding complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
