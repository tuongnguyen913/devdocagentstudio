import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';
// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

import { setSkillPrompt, setSkillActive } from '../lib/services/kv-store';
import { SkillModuleId } from '../data/skills';

const DOCS_DIR = path.resolve(__dirname, '../../../docs');

const SKILL_FILES: Record<SkillModuleId, string> = {
  'docx': 'SKILL-1.DOCX.md',
  'pptx': 'SKILL-2.PTTX.md',
  'excel': 'SKILL-3.Excel-XLSX.md',
  'uml': 'SKILL-4.UML-Diagram.md',
  'bug-release': 'SKILL-5.Bug-Release.md',
  'transfer': 'SKILL-6.TransferKN.md',
  'feature': 'SKILL-7.Feature-Track.md',
};

async function seed() {
  console.log('Seeding skills data...');
  
  for (const [moduleId, fileName] of Object.entries(SKILL_FILES)) {
    const filePath = path.join(DOCS_DIR, fileName);
    
    if (!fs.existsSync(filePath)) {
      console.warn(`[WARN] File not found: ${filePath}`);
      continue;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Upsert prompt to DB
      await setSkillPrompt(moduleId as SkillModuleId, content);
      
      // Ensure it's active
      await setSkillActive(moduleId as SkillModuleId, true);
      
      console.log(`[SUCCESS] Seeded ${moduleId} from ${fileName}`);
    } catch (err) {
      console.error(`[ERROR] Failed to seed ${moduleId}:`, err);
    }
  }

  console.log('Seeding complete.');
  process.exit(0);
}

seed();
