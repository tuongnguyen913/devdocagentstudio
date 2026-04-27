import { config } from "dotenv";
import { getDb, schema } from "./index";
import { getAllSkillConfigs } from "../data/skills/all-skills";
import * as bcrypt from "bcryptjs";

config({ path: ".env.local" });

const DUMMY_ADMIN_PASSWORD = bcrypt.hashSync("admin123", 10);
const STATIC_USERS = [
  {
    email: "admin@devdocs.studio",
    name: "Admin User",
    role: "admin",
    passwordHash: DUMMY_ADMIN_PASSWORD,
    avatar: "https://github.com/shadcn.png",
  }
];

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
