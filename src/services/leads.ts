import { Api } from 'grammy';
import fs from 'node:fs/promises';
import path from 'node:path';
import { config } from '../config.js';
import { ConsultationLead } from '../types/bot.js';
import { escHtml } from '../utils/html.js';

async function saveLeadToFile(lead: ConsultationLead): Promise<void> {
  const dir = path.dirname(config.leadsFilePath);
  await fs.mkdir(dir, { recursive: true });

  let existing: ConsultationLead[] = [];
  try {
    const raw = await fs.readFile(config.leadsFilePath, 'utf-8');
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      existing = parsed as ConsultationLead[];
    }
  } catch {
    // File does not exist yet or is empty; start with a fresh array
  }

  existing.push(lead);
  await fs.writeFile(
    config.leadsFilePath,
    JSON.stringify(existing, null, 2),
    'utf-8',
  );
}

function formatAdminNotification(lead: ConsultationLead): string {
  const usernameLine = lead.telegramUsername
    ? `<b>Telegram:</b> @${escHtml(lead.telegramUsername)} (<code>${lead.telegramUserId}</code>)`
    : `<b>Telegram ID:</b> <code>${lead.telegramUserId}</code>`;

  return [
    '📥 <b>НОВА ЗАЯВКА НА КОНСУЛЬТАЦІЮ</b>',
    '',
    `<b>Клієнт:</b> ${escHtml(lead.fullName)}`,
    `<b>Телефон:</b> <code>${escHtml(lead.phone)}</code>`,
    `<b>Напрям:</b> ${escHtml(lead.areaLabel)}`,
    `<b>Формат:</b> ${escHtml(lead.formatLabel)}`,
    usernameLine,
    '',
    '<b>Суть звернення:</b>',
    escHtml(lead.description),
    '',
    `<i>ID заявки: ${escHtml(lead.id)}</i>`,
  ].join('\n');
}

export async function submitConsultationLead(
  api: Api,
  lead: ConsultationLead,
): Promise<void> {
  await saveLeadToFile(lead);

  if (!config.adminChatId) {
    console.warn(
      `[leads] ADMIN_CHAT_ID не налаштовано. Заявку ${lead.id} збережено лише у ${config.leadsFilePath}`,
    );
    return;
  }

  try {
    await api.sendMessage(config.adminChatId, formatAdminNotification(lead), {
      parse_mode: 'HTML',
    });
  } catch (err) {
    console.error('[leads] Не вдалося надіслати сповіщення адміну:', err);
  }
}
