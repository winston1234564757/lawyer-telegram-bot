import { Bot, session } from 'grammy';
import { config } from './config.js';
import { bookingRouter } from './handlers/booking.js';
import { navigationRouter } from './handlers/navigation.js';
import { clearAllFollowUps, scheduleFollowUp } from './services/inactivity.js';
import { BotContext, SessionData } from './types/bot.js';

function createInitialSession(): SessionData {
  return {
    bookingStep: 'idle',
    bookingDraft: {},
  };
}

async function bootstrap(): Promise<void> {
  const bot = new Bot<BotContext>(config.botToken);

  bot.use(
    session({
      initial: createInitialSession,
    }),
  );

  bot.use(async (ctx, next) => {
    if (ctx.chat?.type === 'private') {
      scheduleFollowUp(ctx.api, ctx.chat.id);
    }
    await next();
  });

  bot.use(navigationRouter);
  bot.use(bookingRouter);

  bot.catch((err) => {
    console.error('[bot] Помилка обробки оновлення:', err.error);
  });

  await bot.api.setMyCommands([
    { command: 'start', description: 'Головне меню' },
  ]);

  const shutdown = (): void => {
    console.log('\n[bot] Зупинка бота...');
    clearAllFollowUps();
    void bot.stop();
  };

  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);

  await bot.start({
    onStart: (botInfo) => {
      console.log(`[bot] Запущено @${botInfo.username} (ID: ${botInfo.id})`);
      if (!config.adminChatId) {
        console.warn(
          '[bot] УВАГА: ADMIN_CHAT_ID не вказано в .env. Напишіть боту /myid, щоб отримати Chat ID адвоката.',
        );
      }
    },
  });
}

bootstrap().catch((err: unknown) => {
  console.error('[bot] Фатальна помилка запуску:', err);
  process.exit(1);
});
