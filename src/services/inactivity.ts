import { Api } from 'grammy';
import { TEXTS } from '../data/content.js';
import { buildContactsKeyboard } from '../keyboards/menus.js';

const INACTIVITY_DELAY_MS = 30 * 60 * 1000; // 30 minutes

interface ChatFollowUpState {
  timer?: ReturnType<typeof setTimeout>;
  hasSubmittedLead: boolean;
  followUpSent: boolean;
}

const chatStates = new Map<number, ChatFollowUpState>();

function getOrCreateState(chatId: number): ChatFollowUpState {
  let state = chatStates.get(chatId);
  if (!state) {
    state = {
      hasSubmittedLead: false,
      followUpSent: false,
    };
    chatStates.set(chatId, state);
  }
  return state;
}

function clearTimer(state: ChatFollowUpState): void {
  if (state.timer) {
    clearTimeout(state.timer);
    state.timer = undefined;
  }
}

export function scheduleFollowUp(api: Api, chatId: number): void {
  const state = getOrCreateState(chatId);

  if (state.hasSubmittedLead || state.followUpSent) {
    return;
  }

  clearTimer(state);

  state.timer = setTimeout(() => {
    void (async () => {
      const current = chatStates.get(chatId);
      if (!current || current.hasSubmittedLead || current.followUpSent) {
        return;
      }

      current.followUpSent = true;
      current.timer = undefined;

      try {
        await api.sendMessage(chatId, TEXTS.inactivityFollowUp, {
          parse_mode: 'HTML',
          reply_markup: buildContactsKeyboard(),
        });
      } catch (err) {
        console.error(
          `[inactivity] Не вдалося надіслати нагадування користувачу ${chatId}:`,
          err,
        );
      }
    })();
  }, INACTIVITY_DELAY_MS);
}

export function markLeadSubmitted(chatId: number): void {
  const state = getOrCreateState(chatId);
  state.hasSubmittedLead = true;
  clearTimer(state);
}

export function clearAllFollowUps(): void {
  for (const state of chatStates.values()) {
    clearTimer(state);
  }
  chatStates.clear();
}
