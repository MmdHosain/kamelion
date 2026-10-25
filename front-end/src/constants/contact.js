// src/constants/contact.js
/**
 * Single source of truth for clinic contact details.
 * Falls back to default '021-88888888' if environment variable is not defined.
 */

const RAW_PHONE = import.meta.env.VITE_CLINIC_PHONE || '021-88888888';

// Cleaned digits for tel: links (e.g., '02188888888')
export const CLINIC_PHONE_TEL = RAW_PHONE.replace(/[^\d+]/g, '');

// Human-readable formatted display (e.g., '021 - 8888 8888')
export const CLINIC_PHONE_DISPLAY = RAW_PHONE.includes(' - ')
  ? RAW_PHONE
  : RAW_PHONE.replace(/^(\d{3})-?(\d{4})(\d{4})$/, '$1 - $2 $3');

export const CLINIC_ADDRESS =
  'تهران، میدان ونک، خیابان ولیعصر، نرسیده به توانیر، کلینیک فوق‌تخصصی جراحی پستان';
