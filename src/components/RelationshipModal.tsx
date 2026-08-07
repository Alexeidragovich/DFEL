import React, { useState } from 'react';
import { X, Network, AlertCircle } from 'lucide-react';
import { Evidence, RelationshipType } from '../types';
import { createRelationship } from '../lib/api';
import { useLanguage } from '../context/LanguageContext';

interface RelationshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  evidences: Evidence[];
  onSuccess: () => void;
}

export const RelationshipModal: React.FC<RelationshipModalProps> = ({
  isOpen,
  onClose,
  evidences,
  onSuccess,
}) => {
  const { t, getRelationshipLabel } = useLanguage();

  const [sourceId, setSourceId] = useState('');
  const [targetId, setTargetId] = useState('');
  const [relationshipType, setRelationshipType] = useState<RelationshipType>('contains');
  const [description, setDescription] = useState('');
  const [confidenceScore, setConfidenceScore] = useState(85);
  const [createdBy, setCreatedBy] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceId || !targetId) {
      setError(t('select_case_for_report'));
      return;
    }
    if (sourceId === targetId) {
      setError('Cannot link evidence to itself');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      await createRelationship({
        source_id: sourceId,
        target_id: targetId,
        relationship_type: relationshipType,
        description,
        confidence_score: Number(confidenceScore),
        created_by: createdBy || 'Forensic Investigator',
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create relationship');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/10 text-purple-500 rounded-2xl border border-purple-500/20">
              <Network className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {t('link_new_relationship')}
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
          {/* Source Evidence */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300 block">
              Source Evidence:
            </label>
            <select
              value={sourceId}
              onChange={(e) => setSourceId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            >
              <option value="">-- Evidence 1 --</option>
              {evidences.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.case_number} - {e.title} ({e.evidence_type})
                </option>
              ))}
            </select>
          </div>

          {/* Relationship Type */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300 block">
              Relationship Type:
            </label>
            <select
              value={relationshipType}
              onChange={(e) => setRelationshipType(e.target.value as RelationshipType)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            >
              {[
                'contains',
                'derived_from',
                'communicated_with',
                'accessed',
                'created_by',
                'executed_on',
                'associated_with',
              ].map((relKey) => (
                <option key={relKey} value={relKey}>
                  {getRelationshipLabel(relKey as any)}
                </option>
              ))}
            </select>
          </div>

          {/* Target Evidence */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300 block">
              Target Evidence:
            </label>
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            >
              <option value="">-- Evidence 2 --</option>
              {evidences
                .filter((e) => e.id !== sourceId)
                .map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.case_number} - {e.title} ({e.evidence_type})
                  </option>
                ))}
            </select>
          </div>

          {/* Confidence slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
              <span>{t('confidence_level')}:</span>
              <span className="text-indigo-500">{confidenceScore}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={confidenceScore}
              onChange={(e) => setConfidenceScore(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300 block">
              {t('evidence_desc_label')}
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
              className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow transition"
            >
              {isSubmitting ? '...' : t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
