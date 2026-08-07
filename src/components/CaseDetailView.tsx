import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Plus,
  ShieldAlert,
  Clock,
  Layers,
  Network,
  FileCode,
  Download,
  Trash2,
  Edit2,
} from 'lucide-react';
import { Case, Evidence, Relationship, CasePriority, CaseStatus } from '../types';
import { fetchCaseById, updateCase } from '../lib/api';
import { useLanguage } from '../context/LanguageContext';

interface CaseDetailViewProps {
  caseId: string;
  onBack: () => void;
  onSelectEvidence: (evidenceId: string) => void;
  onOpenUploadModalForCase: (caseId: string) => void;
  onOpenRelationshipModal: () => void;
  onDeleteCase: (caseId: string) => void;
  onDeleteEvidence: (evidenceId: string) => void;
}

export const CaseDetailView: React.FC<CaseDetailViewProps> = ({
  caseId,
  onBack,
  onSelectEvidence,
  onOpenUploadModalForCase,
  onOpenRelationshipModal,
  onDeleteCase,
  onDeleteEvidence,
}) => {
  const {
    t,
    getCasePriorityLabel,
    getCaseStatusLabel,
    getEvidenceTypeLabel,
    getEvidenceStatusLabel,
    formatBytes,
    formatDate,
  } = useLanguage();

  const [data, setData] = useState<{
    case: Case;
    evidences: Evidence[];
    relationships: Relationship[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<CaseStatus>('open');
  const [selectedPriority, setSelectedPriority] = useState<CasePriority>('medium');

  const loadData = async () => {
    try {
      setIsLoading(true);
      const res = await fetchCaseById(caseId);
      setData(res);
      setSelectedStatus(res.case.status);
      setSelectedPriority(res.case.priority);
    } catch (err: any) {
      setError(err.message || 'Error loading case details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [caseId]);

  const handleUpdateStatus = async () => {
    try {
      await updateCase(caseId, {
        status: selectedStatus,
        priority: selectedPriority,
      });
      setIsEditingStatus(false);
      loadData();
    } catch (err: any) {
      alert('Failed to update case status');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm">...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-6 text-center space-y-3">
        <ShieldAlert className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-rose-700 dark:text-rose-300">{error}</h3>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-medium"
        >
          {t('back_to_cases')}
        </button>
      </div>
    );
  }

  const { case: c, evidences, relationships } = data;
  const priorityInfo = getCasePriorityLabel(c.priority);
  const statusInfo = getCaseStatusLabel(c.status);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Navigation */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-sm font-medium transition"
      >
        <ArrowRight className="w-4 h-4 rtl:rotate-180" />
        <span>{t('back_to_cases')}</span>
      </button>

      {/* Case Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/80 rounded-xl border border-indigo-200 dark:border-indigo-900/50">
                {c.case_number}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${priorityInfo.color}`}>
                {priorityInfo.label}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>

            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {c.title}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsEditingStatus(!isEditingStatus)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition"
            >
              <Edit2 className="w-4 h-4 text-indigo-400" />
              <span>{t('actions')}</span>
            </button>

            <button
              onClick={() => onOpenUploadModalForCase(c.id)}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold rounded-xl shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              <span>{t('add_evidence_to_case')}</span>
            </button>

            <button
              onClick={() => {
                if (confirm(t('confirm_delete_case'))) {
                  onDeleteCase(c.id);
                }
              }}
              className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition"
              title={t('delete_case')}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Edit Status Box */}
        {isEditingStatus && (
          <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 rounded-xl flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t('case_status_label')}</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as CaseStatus)}
                className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
              >
                <option value="open">{getCaseStatusLabel('open').label}</option>
                <option value="investigating">{getCaseStatusLabel('investigating').label}</option>
                <option value="closed">{getCaseStatusLabel('closed').label}</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t('case_priority_label')}</label>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value as CasePriority)}
                className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
              >
                <option value="low">{getCasePriorityLabel('low').label}</option>
                <option value="medium">{getCasePriorityLabel('medium').label}</option>
                <option value="high">{getCasePriorityLabel('high').label}</option>
                <option value="critical">{getCasePriorityLabel('critical').label}</option>
              </select>
            </div>

            <button
              onClick={handleUpdateStatus}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow"
            >
              {t('upload_submit')}
            </button>
          </div>
        )}

        {/* Description */}
        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-3">
          {c.description || ''}
        </p>

        {/* Info stats */}
        <div className="flex flex-wrap items-center gap-6 text-xs text-slate-500 dark:text-slate-400 pt-2">
          <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
            <Layers className="w-4 h-4 text-indigo-500" />
            <span>{evidences.length} {t('evidence_count')}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Network className="w-4 h-4 text-purple-500" />
            <span>{relationships.length} {t('nav_graph')}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>{t('created_at')}: {formatDate(c.created_at)}</span>
          </span>
        </div>
      </div>

      {/* Evidences List Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileCode className="w-5 h-5 text-indigo-500" />
            <span>{t('linked_evidence')}</span>
          </h2>

          <button
            onClick={() => onOpenUploadModalForCase(c.id)}
            className="text-indigo-600 dark:text-indigo-400 hover:underline text-xs font-semibold flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('btn_upload_evidence')}</span>
          </button>
        </div>

        {evidences.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-3">
            <FileCode className="w-10 h-10 text-slate-400 mx-auto" />
            <p className="text-sm text-slate-500">{t('no_linked_evidence')}</p>
            <button
              onClick={() => onOpenUploadModalForCase(c.id)}
              className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl"
            >
              {t('btn_upload_evidence')}
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {evidences.map((ev) => {
              const typeInfo = getEvidenceTypeLabel(ev.evidence_type);
              const statusEvInfo = getEvidenceStatusLabel(ev.status);

              return (
                <div
                  key={ev.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 p-3 rounded-xl transition"
                >
                  <div
                    onClick={() => onSelectEvidence(ev.id)}
                    className="space-y-1.5 cursor-pointer flex-1"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded text-xs font-semibold border ${typeInfo.color}`}>
                        {typeInfo.label}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${statusEvInfo.color}`}>
                        {statusEvInfo.label}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 dark:text-white text-sm hover:text-indigo-600 transition">
                      {ev.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span>{t('original_filename')}: {ev.filename}</span>
                      <span>•</span>
                      <span>{t('file_size')}: {formatBytes(ev.file_size)}</span>
                      <span>•</span>
                      <span>{t('source')}: {ev.source}</span>
                    </div>

                    <div className="font-mono text-[11px] text-slate-400 truncate max-w-md">
                      SHA256: {ev.file_hash_sha256}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`/api/evidence/${ev.id}/download`}
                      download
                      className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                      title={t('download')}
                    >
                      <Download className="w-4 h-4" />
                    </a>

                    <button
                      onClick={() => onDeleteEvidence(ev.id)}
                      className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition"
                      title={t('delete_evidence')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
