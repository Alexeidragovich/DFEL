import {
  CasePriority,
  CaseStatus,
  EvidenceType,
  EvidenceStatus,
  RelationshipType,
  CustodyAction,
} from '../types';

export const EVIDENCE_TYPE_LABELS: Record<EvidenceType, { label: string; color: string }> = {
  file: { label: 'ملف عام', color: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300' },
  image: { label: 'صورة / فيديو', color: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/40 dark:text-purple-300' },
  log: { label: 'سجل نظام (Log)', color: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300' },
  email: { label: 'بريد إلكتروني', color: 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/40 dark:text-sky-300' },
  url: { label: 'رابط / شبكي', color: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300' },
  network: { label: 'حزم شبكة (PCAP)', color: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300' },
  memory: { label: 'ذاكرة مؤقتة (RAM)', color: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300' },
  database: { label: 'قاعدة بيانات', color: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200 dark:bg-fuchsia-900/40 dark:text-fuchsia-300' },
};

export const CASE_PRIORITY_LABELS: Record<CasePriority, { label: string; color: string }> = {
  low: { label: 'منخفضة', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  medium: { label: 'متوسطة', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' },
  high: { label: 'عالية', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300' },
  critical: { label: 'حرجة للغاية', color: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300' },
};

export const CASE_STATUS_LABELS: Record<CaseStatus, { label: string; color: string }> = {
  open: { label: 'مفتوحة', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300' },
  investigating: { label: 'قيد التحقيق', color: 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300' },
  closed: { label: 'مغلقة', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
};

export const EVIDENCE_STATUS_LABELS: Record<EvidenceStatus, { label: string; color: string }> = {
  pending: { label: 'معلق (Pending)', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  analyzing: { label: 'قيد التحليل الفني', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300' },
  analyzed: { label: 'تم التحليل', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' },
  verified: { label: 'مفحوص ومثبت البصمة', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300' },
};

export const RELATIONSHIP_LABELS: Record<RelationshipType, string> = {
  contains: 'يحتوي على',
  part_of: 'جزء من',
  related_to: 'مرتبط بـ',
  created_by: 'تم إنشاؤه بواسطة',
  sent_from: 'مرسل من',
  sent_to: 'مرسل إلى',
  refers_to: 'يشير إلى',
  has_ip: 'يحتوي عنوان IP',
  has_email: 'يحتوي بريد إلكتروني',
  timestamp_near: 'متزامن زمنياً مع',
  originates_from: 'ينشأ من',
  points_to: 'يوجه إلى',
};

export const CUSTODY_ACTION_LABELS: Record<CustodyAction, { label: string; icon: string }> = {
  collected: { label: 'تم التحريز والجمع', icon: 'Inbox' },
  transferred: { label: 'نقل وتسليم الدليل', icon: 'ArrowRightLeft' },
  analyzed: { label: 'فحص وتحليل فني', icon: 'Microscope' },
  verified: { label: 'التحقق المطابق للبصمة', icon: 'ShieldCheck' },
  stored: { label: 'تخزين مشفر في الخزنة', icon: 'Lock' },
  destroyed: { label: 'إتلاف آمن بأمر قضائي', icon: 'Trash2' },
};

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 بايت';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت', 'تيرابايت'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch (e) {
    return dateString;
  }
}
