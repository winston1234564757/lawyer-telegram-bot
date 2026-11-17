import { Context, SessionFlavor } from 'grammy';

export type PracticeAreaKey =
  | 'civil'
  | 'family'
  | 'labor'
  | 'military'
  | 'other';

export type ConsultationFormat = 'online' | 'in_person';

export type BookingStep =
  | 'idle'
  | 'full_name'
  | 'phone'
  | 'area'
  | 'description'
  | 'format';

export interface BookingDraft {
  fullName?: string;
  phone?: string;
  area?: PracticeAreaKey;
  description?: string;
  format?: ConsultationFormat;
}

export interface SessionData {
  bookingStep: BookingStep;
  bookingDraft: BookingDraft;
}

export type BotContext = Context & SessionFlavor<SessionData>;

export interface ConsultationLead {
  id: string;
  createdAt: string;
  telegramUserId: number;
  telegramUsername?: string;
  fullName: string;
  phone: string;
  area: PracticeAreaKey;
  areaLabel: string;
  description: string;
  format: ConsultationFormat;
  formatLabel: string;
}
