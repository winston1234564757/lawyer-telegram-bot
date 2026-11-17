import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config();

function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Відсутня обов'язкова змінна оточення: ${name}`);
  }
  return value;
}

const projectRoot = process.cwd();

export const config = {
  botToken: getRequiredEnv('BOT_TOKEN'),
  adminChatId: process.env.ADMIN_CHAT_ID?.trim() || null,
  lawyerPhone: process.env.LAWYER_PHONE?.trim() || '+380 63 259 13 92',
  assets: {
    logoPath: path.join(projectRoot, 'IMG_7253.PNG'),
    portraitPath: path.join(projectRoot, 'IMG_4550.PNG'),
  },
  leadsFilePath: path.join(projectRoot, 'data', 'leads.json'),
} as const;
