import { Composer, InputFile } from 'grammy';
import fs from 'node:fs/promises';
import { config } from '../config.js';
import { TEXTS } from '../data/content.js';
import {
  BUTTONS,
  buildAboutKeyboard,
  buildBookingIntroKeyboard,
  buildContactsKeyboard,
  buildDirectionDetailKeyboard,
  buildDirectionsKeyboard,
  buildMainMenuKeyboard,
  buildServicesKeyboard,
} from '../keyboards/menus.js';
import { BotContext } from '../types/bot.js';

export const navigationRouter = new Composer<BotContext>();

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export function resetBookingSession(ctx: BotContext): void {
  ctx.session.bookingStep = 'idle';
  ctx.session.bookingDraft = {};
}

export async function sendMainMenu(ctx: BotContext): Promise<void> {
  resetBookingSession(ctx);

  const hasLogo = await fileExists(config.assets.logoPath);
  if (hasLogo) {
    await ctx.replyWithPhoto(new InputFile(config.assets.logoPath), {
      caption: TEXTS.welcome,
      parse_mode: 'HTML',
      reply_markup: buildMainMenuKeyboard(),
    });
    return;
  }

  await ctx.reply(TEXTS.welcome, {
    parse_mode: 'HTML',
    reply_markup: buildMainMenuKeyboard(),
  });
}

navigationRouter.command('start', async (ctx) => {
  await sendMainMenu(ctx);
});

navigationRouter.command('myid', async (ctx) => {
  const chatId = ctx.chat?.id;
  if (!chatId) return;
  await ctx.reply(
    `Ваш Telegram Chat ID: <code>${chatId}</code>\n\nДодайте його в <code>.env</code> як <code>ADMIN_CHAT_ID=${chatId}</code>, щоб отримувати заявки на консультацію.`,
    { parse_mode: 'HTML' },
  );
});

navigationRouter.hears([BUTTONS.HOME, BUTTONS.HOME_BACK], async (ctx) => {
  await sendMainMenu(ctx);
});

navigationRouter.hears(BUTTONS.ABOUT, async (ctx) => {
  resetBookingSession(ctx);

  const hasPortrait = await fileExists(config.assets.portraitPath);
  if (hasPortrait) {
    await ctx.replyWithPhoto(new InputFile(config.assets.portraitPath));
  }

  await ctx.reply(TEXTS.about, {
    parse_mode: 'HTML',
    reply_markup: buildAboutKeyboard(),
  });
});

navigationRouter.hears(
  [BUTTONS.DIRECTIONS, BUTTONS.DIRECTIONS_VIEW, BUTTONS.BACK_TO_DIRECTIONS],
  async (ctx) => {
    resetBookingSession(ctx);
    await ctx.reply(TEXTS.directionsOverview, {
      parse_mode: 'HTML',
      reply_markup: buildDirectionsKeyboard(),
    });
  },
);

navigationRouter.hears(BUTTONS.DIR_CIVIL, async (ctx) => {
  resetBookingSession(ctx);
  await ctx.reply(TEXTS.directions.civil, {
    parse_mode: 'HTML',
    reply_markup: buildDirectionDetailKeyboard(),
  });
});

navigationRouter.hears(BUTTONS.DIR_FAMILY, async (ctx) => {
  resetBookingSession(ctx);
  await ctx.reply(TEXTS.directions.family, {
    parse_mode: 'HTML',
    reply_markup: buildDirectionDetailKeyboard(),
  });
});

navigationRouter.hears(BUTTONS.DIR_LABOR, async (ctx) => {
  resetBookingSession(ctx);
  await ctx.reply(TEXTS.directions.labor, {
    parse_mode: 'HTML',
    reply_markup: buildDirectionDetailKeyboard(),
  });
});

navigationRouter.hears(BUTTONS.DIR_MILITARY, async (ctx) => {
  resetBookingSession(ctx);
  await ctx.reply(TEXTS.directions.military, {
    parse_mode: 'HTML',
    reply_markup: buildDirectionDetailKeyboard(),
  });
});

navigationRouter.hears(BUTTONS.SERVICES, async (ctx) => {
  resetBookingSession(ctx);
  await ctx.reply(TEXTS.services, {
    parse_mode: 'HTML',
    reply_markup: buildServicesKeyboard(),
  });
});

navigationRouter.hears(BUTTONS.CONTACTS, async (ctx) => {
  resetBookingSession(ctx);
  await ctx.reply(TEXTS.contacts, {
    parse_mode: 'HTML',
    reply_markup: buildContactsKeyboard(),
  });
});

navigationRouter.hears(BUTTONS.PRICING, async (ctx) => {
  resetBookingSession(ctx);
  await ctx.reply(TEXTS.inactivityFollowUp, {
    parse_mode: 'HTML',
    reply_markup: buildContactsKeyboard(),
  });
});

navigationRouter.hears(BUTTONS.BOOKING_INFO, async (ctx) => {
  resetBookingSession(ctx);
  await ctx.reply(TEXTS.bookingInfo, {
    parse_mode: 'HTML',
    reply_markup: buildBookingIntroKeyboard(),
  });
});
