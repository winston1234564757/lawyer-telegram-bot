import { Keyboard } from 'grammy';
import { FORMAT_LABELS, PRACTICE_AREA_LABELS } from '../data/content.js';
import { PracticeAreaKey } from '../types/bot.js';

export const BUTTONS = {
  ABOUT: '👨‍⚖️ Про адвоката',
  DIRECTIONS: '⚖️ Напрями діяльності',
  DIRECTIONS_VIEW: '📚 Переглянути напрями діяльності',
  SERVICES: '📑 Юридичні послуги',
  BOOKING_INFO: '📅 Запис на консультацію',
  BOOKING_START: '📅 Розпочати запис',
  BOOKING_NOW: '📅 Записатися на консультацію',
  BOOKING_CANCEL: '❌ Скасувати запис',
  CONTACTS: '📞 Контакти',
  PRICING: '💰 Вартість консультації',
  HOME: '🏠 Головне меню',
  HOME_BACK: '↩️ Головне меню',
  BACK_TO_DIRECTIONS: '↩️ Назад',
  DIR_CIVIL: 'Цивільне право 👈🏻',
  DIR_FAMILY: 'Сімейне право 💁🏻‍♀️',
  DIR_LABOR: 'Трудове право 💼',
  DIR_MILITARY: 'Військове право 🪖',
  FORMAT_ONLINE: `💻 ${FORMAT_LABELS.online}`,
  FORMAT_IN_PERSON: `🤝 ${FORMAT_LABELS.in_person}`,
} as const;

export function buildMainMenuKeyboard(): Keyboard {
  return new Keyboard()
    .text(BUTTONS.ABOUT)
    .row()
    .text(BUTTONS.DIRECTIONS)
    .row()
    .text(BUTTONS.SERVICES)
    .row()
    .text(BUTTONS.BOOKING_INFO)
    .row()
    .text(BUTTONS.PRICING)
    .row()
    .text(BUTTONS.CONTACTS)
    .resized()
    .persistent();
}

export function buildAboutKeyboard(): Keyboard {
  return new Keyboard()
    .text(BUTTONS.DIRECTIONS)
    .row()
    .text(BUTTONS.BOOKING_NOW)
    .row()
    .text(BUTTONS.HOME)
    .resized()
    .persistent();
}

export function buildDirectionsKeyboard(): Keyboard {
  return new Keyboard()
    .text(BUTTONS.DIR_CIVIL)
    .row()
    .text(BUTTONS.DIR_FAMILY)
    .row()
    .text(BUTTONS.DIR_LABOR)
    .row()
    .text(BUTTONS.DIR_MILITARY)
    .row()
    .text(BUTTONS.HOME_BACK)
    .resized()
    .persistent();
}

export function buildDirectionDetailKeyboard(): Keyboard {
  return new Keyboard()
    .text(BUTTONS.BOOKING_NOW)
    .row()
    .text(BUTTONS.BACK_TO_DIRECTIONS)
    .text(BUTTONS.HOME)
    .resized()
    .persistent();
}

export function buildServicesKeyboard(): Keyboard {
  return new Keyboard()
    .text(BUTTONS.BOOKING_INFO)
    .row()
    .text(BUTTONS.DIRECTIONS_VIEW)
    .row()
    .text(BUTTONS.HOME)
    .resized()
    .persistent();
}

export function buildContactsKeyboard(): Keyboard {
  return new Keyboard()
    .text(BUTTONS.BOOKING_NOW)
    .row()
    .text(BUTTONS.HOME)
    .resized()
    .persistent();
}

export function buildBookingIntroKeyboard(): Keyboard {
  return new Keyboard()
    .text(BUTTONS.BOOKING_START)
    .row()
    .text(BUTTONS.HOME)
    .resized()
    .persistent();
}

export function buildBookingCancelKeyboard(): Keyboard {
  return new Keyboard()
    .text(BUTTONS.BOOKING_CANCEL)
    .resized()
    .persistent();
}

export function buildSharePhoneKeyboard(): Keyboard {
  return new Keyboard()
    .requestContact('📱 Поділитися номером телефону')
    .row()
    .text(BUTTONS.BOOKING_CANCEL)
    .resized()
    .persistent();
}

export function buildBookingAreaKeyboard(): Keyboard {
  const areaOrder: PracticeAreaKey[] = [
    'civil',
    'family',
    'labor',
    'military',
    'other',
  ];

  const kb = new Keyboard();
  for (const area of areaOrder) {
    kb.text(PRACTICE_AREA_LABELS[area]).row();
  }
  kb.text(BUTTONS.BOOKING_CANCEL);
  return kb.resized().persistent();
}

export function buildBookingFormatKeyboard(): Keyboard {
  return new Keyboard()
    .text(BUTTONS.FORMAT_ONLINE)
    .text(BUTTONS.FORMAT_IN_PERSON)
    .row()
    .text(BUTTONS.BOOKING_CANCEL)
    .resized()
    .persistent();
}

export function buildPostBookingKeyboard(): Keyboard {
  return new Keyboard()
    .text(BUTTONS.HOME)
    .resized()
    .persistent();
}
