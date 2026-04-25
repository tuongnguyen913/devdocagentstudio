import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "DevDocs Studio",
  version: packageJson.version,
  copyright: `© ${currentYear}, VPSTech.`,
  meta: {
    title: "DevDocs Studio — Skill Admin Panel",
    description:
      "Admin panel for managing 7 document generation skills: DOCX, PPTX, Excel, UML, Bug & Release, Transfer KN, Feature Track. Powered by Claude AI.",
  },
};
