import React, { useState } from 'react';
import {
  FileSearch,
  Search,
  Plus,
  ShieldCheck,
  Download,
  Trash2,
  Copy,
  Check,
  LayoutGrid,
  List,
} from 'lucide-react';
import { Evidence, Case } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface EvidenceViewProps {
  evidences: Evidence[];
  cases: Case[];
  isLoading: boolean;
  onSelectEvidence: (evidenceId: string) => void;
  onOpenUploadModal: () => void;
  onDeleteEvidence: (evidenceId: string) => void;
  onVerifyIntegrity: (evidenceId: string) => void;
}

export const EvidenceView: React.FC<EvidenceViewProps> = ({
  evidences,
  cases,
  isLoading,
  onSelectEvidence,
  onOpenUploadModal,
  onDeleteEvidence,
  onVerifyIntegrity,
}) => {
  const {
    t,
    getEvidenceTypeLabel,
    getEvidenceStatusLabel,
    formatBytes,
    formatDate,
  } = useLanguage();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [caseFilter, setCaseFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const filteredEvidences = evidences.filter((ev) => {
    const matchesSearch =
      ev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.file_hash_md5.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.file_hash_sha256.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.collected_by.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'all' || ev.evidence_type === typeFilter;
    const matchesStatus = statusFilter === 'all' || ev.status === statusFilter;
    const matchesCase = caseFilter === 'all' || ev.case_id === caseFilter;

    return matchesSearch && matchesType && matchesStatus && matchesCase;
  });

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileSearch className="w-6 h-6 text-indigo-500" />
            <span>{t('evidence_view_title')}</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {t('evidence_view_desc')}
          </p>
        </div>

        <button
          onClick={onOpenUploadModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm rounded-xl shadow-lg transition"
        >
          <Plus className="w-4 h-4" />
          <span>{t('btn_upload_evidence')}</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('search_evidence_placeholder')}
              className="w-full ps-10 pe-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow'
                  : 'text-slate-500'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs font-semibold ${
                viewMode === 'cards'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow'
                  : 'text-slate-500'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filters Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Filter Case */}
          <select
            value={caseFilter}
            onChange={(e) => setCaseFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
          >
            <option value="all">{t('filter_all_statuses')}</option>
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.case_number} - {c.title}
              </option>
            ))}
          </select>

          {/* Filter Type */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
          >
            <option value="all">{t('filter_all_types')}</option>
            {['file', 'image', 'log', 'email', 'url', 'network', 'memory', 'database'].map((typeKey) => (
              <option key={typeKey} value={typeKey}>
                {getEvidenceTypeLabel(typeKey as any).label}
              </option>
            ))}
          </select>

          {/* Filter Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
          >
            <option value="all">{t('filter_all_evidence_statuses')}</option>
            {['pending', 'analyzing', 'analyzed', 'verified'].map((stKey) => (
              <option key={stKey} value={stKey}>
                {getEvidenceStatusLabel(stKey as any).label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-400">...</div>
      ) : filteredEvidences.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
          <FileSearch className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">{t('no_evidence')}</h3>
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 font-bold">
                <tr>
                  <th className="p-3.5 text-start">{t('evidence_title')}</th>
                  <th className="p-3.5 text-start">{t('evidence_type')}</th>
                  <th className="p-3.5 text-start">{t('case_number')}</th>
                  <th className="p-3.5 text-start">{t('original_filename')}</th>
                  <th className="p-3.5 text-start">{t('sha256_checksum')}</th>
                  <th className="p-3.5 text-start">{t('case_status_label')}</th>
                  <th className="p-3.5 text-start">{t('created_at')}</th>
                  <th className="p-3.5 text-center">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredEvidences.map((ev) => {
                  const typeInfo = getEvidenceTypeLabel(ev.evidence_type);
                  const statusInfo = getEvidenceStatusLabel(ev.status);

                  return (
                    <tr
                      key={ev.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition cursor-pointer"
                      onClick={() => onSelectEvidence(ev.id)}
                    >
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                        <div className="line-clamp-1">{ev.title}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{t('source')}: {ev.source}</div>
                      </td>

                      <td className="p-3.5">
                        <span className={`px-2.5 py-0.5 rounded text-[11px] font-semibold border ${typeInfo.color}`}>
                          {typeInfo.label}
                        </span>
                      </td>

                      <td className="p-3.5 font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                        {ev.case_number || '-'}
                      </td>

                      <td className="p-3.5 text-slate-600 dark:text-slate-300">
                        <div className="font-mono">{ev.filename}</div>
                        <div className="text-[10px] text-slate-400">{formatBytes(ev.file_size)}</div>
                      </td>

                      <td className="p-3.5 font-mono text-[10px] text-slate-400 max-w-[150px] truncate">
                        <div className="flex items-center gap-1">
                          <span className="truncate">{ev.file_hash_sha256}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyHash(ev.file_hash_sha256);
                            }}
                            className="p-1 hover:text-indigo-400"
                            title={t('copy')}
                          >
                            {copiedHash === ev.file_hash_sha256 ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </td>

                      <td className="p-3.5 text-slate-400 text-[11px]">
                        {formatDate(ev.created_at)}
                      </td>

                      <td className="p-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onVerifyIntegrity(ev.id)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg"
                            title={t('verify_integrity')}
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>

                          <a
                            href={`/api/evidence/${ev.id}/download`}
                            download
                            className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                            title={t('download')}
                          >
                            <Download className="w-4 h-4" />
                          </a>

                          <button
                            onClick={() => {
                              if (confirm(t('confirm_delete_evidence'))) {
                                onDeleteEvidence(ev.id);
                              }
                            }}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg"
                            title={t('delete_evidence')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvidences.map((ev) => {
            const typeInfo = getEvidenceTypeLabel(ev.evidence_type);
            const statusInfo = getEvidenceStatusLabel(ev.status);

            return (
              <div
                key={ev.id}
                onClick={() => onSelectEvidence(ev.id)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-lg transition cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded text-xs font-semibold border ${typeInfo.color}`}>
                      {typeInfo.label}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base hover:text-indigo-500 transition line-clamp-1">
                      {ev.title}
                    </h3>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">
                      {t('case_number')}: {ev.case_number}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1 font-mono text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>{t('original_filename')}:</span>
                      <span className="text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                        {ev.filename}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>{t('file_size')}:</span>
                      <span className="text-slate-800 dark:text-slate-200">{formatBytes(ev.file_size)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>MD5:</span>
                      <span className="text-slate-800 dark:text-slate-200">{ev.file_hash_md5.substring(0, 10)}...</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">{formatDate(ev.created_at)}</span>
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onVerifyIntegrity(ev.id)}
                      className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg"
                      title={t('verify_integrity')}
                    >
                      <ShieldCheck className="w-4 h-4" />
                    </button>
                    <a
                      href={`/api/evidence/${ev.id}/download`}
                      download
                      className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                      title={t('download')}
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
