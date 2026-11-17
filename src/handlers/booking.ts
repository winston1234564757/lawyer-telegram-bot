import { Composer } from 'grammy';
import crypto from 'node:crypto';
import {
  FORMAT_LABELS,
  PRACTICE_AREA_LABELS,
  TEXTS,
} from '../data/content.js';
import {
  BUTTONS,
  buildBookingAreaKeyboard,
  buildBookingCancelKeyboard,
  buildBookingFormatKeyboard,
  buildMainMenuKeyboard,
  buildPostBookingKeyboard,
  buildSharePhoneKeyboard,
} from '../keyboards/menus.js';
import { submitConsultationLead } from '../services/leads.js';
import { markLeadSubmitted } from '../services/inactivity.js';
import {
  BotContext,
  ConsultationFormat,
  ConsultationLead,
  PracticeAreaKey,
} from '../types/bot.js';
import { resetBookingSession, sendMainMenu } from './navigation.js';

export const bookingRouter = new Composer<BotContext>();

function isValidPhone(input: string): boolean {
  const digits = input.replace(/\D/g, '');
  return digits.length >= 9 && digits.length <= 15;
}

function findPracticeAreaByLabel(text: string): PracticeAreaKey | null {
  const entries = Object.entries(PRACTICE_AREA_LABELS) as [
    PracticeAreaKey,
    string,
  ][];
  const match = entries.find(([, label]) => label === text);
  return match ? match[0] : null;
}

function findFormatByButton(text: string): ConsultationFormat | null {
  if (text === BUTTONS.FORMAT_ONLINE || text === FORMAT_LABELS.online) {
    return 'online';
  }
  if (text === BUTTONS.FORMAT_IN_PERSON || text === FORMAT_LABELS.in_person) {
    return 'in_person';
  }
  return null;
}

async function promptStepFullName(ctx: BotContext): Promise<void> {
  ctx.session.bookingStep = 'full_name';
  ctx.session.bookingDraft = {};

  await ctx.reply(
    '<b>Крок 1 з 5</b>\n\nВведіть, будь ласка, ваше <b>ім’я та прізвище</b>:',
    {
      parse_mode: 'HTML',
      reply_markup: buildBookingCancelKeyboard(),
    },
  );
}

async function promptStepPhone(ctx: BotContext): Promise<void> {
  ctx.session.bookingStep = 'phone';

  await ctx.reply(
    '<b>Крок 2 з 5</b>\n\nЗалиште ваш <b>контактний номер телефону</b> (введіть текстом або натисніть кнопку нижче):',
    {
      parse_mode: 'HTML',
      reply_markup: buildSharePhoneKeyboard(),
    },
  );
}

async function promptStepArea(ctx: BotContext): Promise<void> {
  ctx.session.bookingStep = 'area';

  await ctx.reply(
    '<b>Крок 3 з 5</b>\n\nОберіть <b>напрям юридичного питання</b>:',
    {
      parse_mode: 'HTML',
      reply_markup: buildBookingAreaKeyboard(),
    },
  );
}

async function promptStepDescription(ctx: BotContext): Promise<void> {
  ctx.session.bookingStep = 'description';

  await ctx.reply(
    '<b>Крок 4 з 5</b>\n\nКоротко опишіть <b>суть вашого звернення</b>:',
    {
      parse_mode: 'HTML',
      reply_markup: buildBookingCancelKeyboard(),
    },
  );
}

async function promptStepFormat(ctx: BotContext): Promise<void> {
  ctx.session.bookingStep = 'format';

  await ctx.reply(
    '<b>Крок 5 з 5</b>\n\nОберіть <b>бажаний формат консультації</b>:',
    {
      parse_mode: 'HTML',
      reply_markup: buildBookingFormatKeyboard(),
    },
  );
}

bookingRouter.hears(
  [BUTTONS.BOOKING_START, BUTTONS.BOOKING_NOW],
  async (ctx) => {
    await promptStepFullName(ctx);
  },
);

bookingRouter.hears(BUTTONS.BOOKING_CANCEL, async (ctx) => {
  resetBookingSession(ctx);
  await ctx.reply('Запис на консультацію скасовано.');
  await sendMainMenu(ctx);
});

bookingRouter.on('message:contact', async (ctx) => {
  if (ctx.session.bookingStep !== 'phone') return;

  ctx.session.bookingDraft.phone = ctx.message.contact.phone_number;
  await promptStepArea(ctx);
});

bookingRouter.on('message:text', async (ctx) => {
  const step = ctx.session.bookingStep;
  const text = ctx.message.text.trim();

  if (step === 'idle') {
    await ctx.reply(
      'Скористайтеся, будь ласка, кнопками меню нижче або натисніть /start.',
      { reply_markup: buildMainMenuKeyboard() },
    );
    return;
  }

  if (step === 'full_name') {
    if (text.length < 2) {
      await ctx.reply(
        'Будь ласка, введіть коректне ім’я та прізвище (мінімум 2 символи).',
        { reply_markup: buildBookingCancelKeyboard() },
      );
      return;
    }

    ctx.session.bookingDraft.fullName = text;
    await promptStepPhone(ctx);
    return;
  }

  if (step === 'phone') {
    if (!isValidPhone(text)) {
      await ctx.reply(
        'Будь ласка, введіть коректний номер телефону (наприклад, +380632591392) або натисніть кнопку «📱 Поділитися номером телефону».',
        { reply_markup: buildSharePhoneKeyboard() },
      );
      return;
    }

    ctx.session.bookingDraft.phone = text;
    await promptStepArea(ctx);
    return;
  }

  if (step === 'area') {
    const areaKey = findPracticeAreaByLabel(text);
    if (!areaKey) {
      await ctx.reply(
        'Будь ласка, оберіть напрям за допомогою кнопок на клавіатурі нижче.',
        { reply_markup: buildBookingAreaKeyboard() },
      );
      return;
    }

    ctx.session.bookingDraft.area = areaKey;
    await promptStepDescription(ctx);
    return;
  }

  if (step === 'description') {
    if (text.length < 5) {
      await ctx.reply(
        'Будь ласка, опишіть суть звернення трохи детальніше (мінімум 5 символів).',
        { reply_markup: buildBookingCancelKeyboard() },
      );
      return;
    }

    ctx.session.bookingDraft.description = text;
    await promptStepFormat(ctx);
    return;
  }

  if (step === 'format') {
    const formatKey = findFormatByButton(text);
    if (!formatKey) {
      await ctx.reply(
        'Будь ласка, оберіть формат консультації за допомогою кнопок на клавіатурі нижче.',
        { reply_markup: buildBookingFormatKeyboard() },
      );
      return;
    }

    ctx.session.bookingDraft.format = formatKey;

    const { fullName, phone, area, description } = ctx.session.bookingDraft;
    if (!fullName || !phone || !area || !description) {
      resetBookingSession(ctx);
      await ctx.reply(
        'Сталася помилка даних анкети. Спробуйте розпочати запис заново.',
      );
      await sendMainMenu(ctx);
      return;
    }

    const user = ctx.from;
    const lead: ConsultationLead = {
      id: crypto.randomUUID().slice(0, 8),
      createdAt: new Date().toISOString(),
      telegramUserId: user.id,
      telegramUsername: user.username,
      fullName,
      phone,
      area,
      areaLabel: PRACTICE_AREA_LABELS[area],
      description,
      format: formatKey,
      formatLabel: FORMAT_LABELS[formatKey],
    };

    await submitConsultationLead(ctx.api, lead);
    if (ctx.chat?.id) {
      markLeadSubmitted(ctx.chat.id);
    }
    resetBookingSession(ctx);

    await ctx.reply(TEXTS.bookingSuccess, {
      parse_mode: 'HTML',
      reply_markup: buildPostBookingKeyboard(),
    });
  }
});
