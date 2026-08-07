import React, { useState } from 'react';
import { X, Clock, AlertCircle } from 'lucide-react';
import { CustodyAction } from '../types';
import { addCustodyLog } from '../lib/api';
import { useLanguage } from '../context/LanguageContext';

interface CustodyModalProps {
  isOpen: boolean;
  onClose: () => void;
  evidenceId: string;
  onSuccess: () => void;
}

export const CustodyModal: React.FC<CustodyModalProps> = ({
  isOpen,
  onClose,
  evidenceId,
  onSuccess,
}) => {
  const { t, getCustodyActionLabel } = useLanguage();

  const [action, setAction] = useState<CustodyAction>('transferred');
  const [fromUser, setFromUser] = useState('');
  const [toUser, setToUser] = useState('');
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromUser || !toUser) {
      setError('From and To fields are required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      await addCustodyLog({
        evidence_id: evidenceId,
        action,
        from_user: fromUser,
        to_user: toUser,
        notes,
        location: location || 'Evidence Locker',
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add custody log');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-500 rounded-2xl border border-indigo-500/20">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {t('add_custody_log')}
              </h2>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Action type */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300 block">
              Action:
            </label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value as CustodyAction)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            >
              {[
                'collected',
                'transferred',
                'analyzed',
                'stored',
                'checked_out',
                'checked_in',
                'disposed',
              ].map((actKey) => (
                <option key={actKey} value={actKey}>
                  {getCustodyActionLabel(actKey as any).label}
                </option>
              ))}
            </select>
          </div>

          {/* From / To */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">
                {t('custody_from')}:
              </label>
              <input
                type="text"
                value={fromUser}
                onChange={(e) => setFromUser(e.target.value)}
                placeholder="Investigator"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">
                {t('custody_to')}:
              </label>
              <input
                type="text"
                value={toUser}
                onChange={(e) => setToUser(e.target.value)}
                placeholder="Forensic Lab"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300 block">
              {t('custody_location')}:
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Locker Room 102"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300 block">
              {t('evidence_desc_label')}
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow transition"
            >
              {isSubmitting ? '...' : t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
