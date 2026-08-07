import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Download,
  Copy,
  Check,
  Plus,
  Clock,
  Network,
  Trash2,
  Lock,
  RefreshCw,
} from 'lucide-react';
import { Evidence, ChainOfCustody, Relationship, VerificationResult } from '../types';
import { fetchEvidenceById, verifyEvidenceIntegrity, deleteRelationship } from '../lib/api';
import { useLanguage } from '../context/LanguageContext';

interface EvidenceDetailViewProps {
  evidenceId: string;
  onBack: () => void;
  onOpenCustodyModal: (evidenceId: string) => void;
  onOpenRelationshipModal: () => void;
  onSelectEvidence: (evidenceId: string) => void;
  onDeleteEvidence: (evidenceId: string) => void;
}

export const EvidenceDetailView: React.FC<EvidenceDetailViewProps> = ({
  evidenceId,
  onBack,
  onOpenCustodyModal,
  onOpenRelationshipModal,
  onSelectEvidence,
  onDeleteEvidence,
}) => {
  const {
    t,
    getEvidenceTypeLabel,
    getEvidenceStatusLabel,
    getRelationshipLabel,
    getCustodyActionLabel,
    formatBytes,
    formatDate,
  } = useLanguage();

  const [data, setData] = useState<{
    evidence: Evidence;
    custody: ChainOfCustody[];
    relationships: Relationship[];
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const res = await fetchEvidenceById(evidenceId);
      setData(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    setVerificationResult(null);
  }, [evidenceId]);

  const handleVerify = async () => {
    try {
      setIsVerifying(true);
      const res = await verifyEvidenceIntegrity(evidenceId);
      setVerificationResult(res);
      loadData();
    } catch (err: any) {
      alert('Error verifying hash integrity');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDeleteRel = async (relId: string) => {
    if (confirm(t('confirm_delete_rel'))) {
      await deleteRelationship(relId);
      loadData();
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

  if (!data) {
    return (
      <div className="text-center py-12 space-y-3">
        <p className="text-slate-400">{t('no_evidence')}</p>
        <button onClick={onBack} className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs">
          {t('back_to_evidence_list')}
        </button>
      </div>
    );
  }

  const { evidence: ev, custody, relationships } = data;
  const typeInfo = getEvidenceTypeLabel(ev.evidence_type);
  const statusInfo = getEvidenceStatusLabel(ev.status);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-sm font-medium transition"
      >
        <ArrowRight className="w-4 h-4 rtl:rotate-180" />
        <span>{t('back_to_evidence_list')}</span>
      </button>

      {/* Detail Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${typeInfo.color}`}>
                {typeInfo.label}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
              <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 rounded">
                {t('case_number')}: {ev.case_number}
              </span>
            </div>

            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{ev.title}</h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleVerify}
              disabled={isVerifying}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isVerifying ? 'animate-spin' : ''}`} />
              <span>{t('verify_file_integrity')}</span>
            </button>

            <a
              href={`/api/evidence/${ev.id}/download`}
              download
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl transition"
            >
              <Download className="w-4 h-4" />
              <span>{t('download')}</span>
            </a>

            <button
              onClick={() => {
                if (confirm(t('confirm_delete_evidence'))) {
                  onDeleteEvidence(ev.id);
                }
              }}
              className="p-2.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition"
              title={t('delete_evidence')}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Verification Result Notification */}
        {verificationResult && (
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 animate-fade-in ${
              verificationResult.is_valid
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
            }`}
          >
            {verificationResult.is_valid ? (
              <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <ShieldAlert className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1 text-xs">
              <h4 className="font-bold text-sm">
                {verificationResult.is_valid ? t('integrity_confirmed') : t('integrity_violated')}
              </h4>
              <p>{verificationResult.message}</p>
              <div className="font-mono text-[11px] opacity-80 pt-1">
                {t('calculated_hash')} {verificationResult.calculated_sha256}
              </div>
            </div>
          </div>
        )}

        {/* Technical Hashes Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* MD5 */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-500" />
                <span>{t('md5_checksum')}</span>
              </span>
              <button
                onClick={() => handleCopy(ev.file_hash_md5, 'md5')}
                className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                {copiedKey === 'md5' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'md5' ? t('copied') : t('copy')}</span>
              </button>
            </div>
            <p className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100 break-all select-all">
              {ev.file_hash_md5}
            </p>
          </div>

          {/* SHA256 */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>{t('sha256_checksum')}</span>
              </span>
              <button
                onClick={() => handleCopy(ev.file_hash_sha256, 'sha256')}
                className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                {copiedKey === 'sha256' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'sha256' ? t('copied') : t('copy')}</span>
              </button>
            </div>
            <p className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100 break-all select-all">
              {ev.file_hash_sha256}
            </p>
          </div>
        </div>

        {/* Metadata grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-slate-400 block">{t('original_filename')}:</span>
            <span className="font-mono font-semibold text-slate-900 dark:text-slate-200">{ev.filename}</span>
          </div>

          <div>
            <span className="text-slate-400 block">{t('file_size')}:</span>
            <span className="font-semibold text-slate-900 dark:text-slate-200">{formatBytes(ev.file_size)}</span>
          </div>

          <div>
            <span className="text-slate-400 block">{t('source')}:</span>
            <span className="font-semibold text-slate-900 dark:text-slate-200">{ev.source}</span>
          </div>

          <div>
            <span className="text-slate-400 block">{t('collector')}:</span>
            <span className="font-semibold text-slate-900 dark:text-slate-200">{ev.collected_by}</span>
          </div>
        </div>

        {/* Description */}
        {ev.description && (
          <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl">
            <span className="font-bold text-slate-700 dark:text-slate-200 block mb-1">{t('evidence_desc_label')}</span>
            {ev.description}
          </div>
        )}

        {/* Tags */}
        {ev.tags && ev.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-xs text-slate-400">{t('evidence_tags_label')}</span>
            {ev.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Two columns: Custody Timeline & Relationships */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chain of Custody Timeline */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-500" />
              <span>{t('custody_timeline')}</span>
            </h2>

            <button
              onClick={() => onOpenCustodyModal(ev.id)}
              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('add_custody_log')}</span>
            </button>
          </div>

          <div className="relative border-s-2 border-indigo-500/30 ps-6 space-y-6">
            {custody.length === 0 ? (
              <p className="text-xs text-slate-400">{t('no_custody_logs')}</p>
            ) : (
              custody.map((log) => {
                const actionMeta = getCustodyActionLabel(log.action);

                return (
                  <div key={log.id} className="relative group">
                    <div className="absolute -start-[31px] top-0.5 w-4 h-4 rounded-full bg-indigo-600 ring-4 ring-white dark:ring-slate-900" />
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {actionMeta.label}
                        </span>
                        <span className="text-[11px] text-slate-400">{formatDate(log.created_at)}</span>
                      </div>

                      <div className="text-xs text-slate-600 dark:text-slate-300">
                        {t('custody_from')} <span className="font-semibold">{log.from_user}</span> → {t('custody_to')}{' '}
                        <span className="font-semibold">{log.to_user}</span>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400">{log.notes}</p>
                      <div className="text-[10px] text-slate-400 font-medium">
                        {t('custody_location')} {log.location}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Linked Relationships */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Network className="w-5 h-5 text-purple-500" />
              <span>{t('relationships_network')}</span>
            </h2>

            <button
              onClick={onOpenRelationshipModal}
              className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('link_new_relationship')}</span>
            </button>
          </div>

          <div className="space-y-3">
            {relationships.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">{t('no_relationships')}</p>
            ) : (
              relationships.map((rel) => {
                const isSource = rel.source_id === ev.id;
                const otherTitle = isSource ? rel.target_title : rel.source_title;
                const otherId = isSource ? rel.target_id : rel.source_id;
                const relText = getRelationshipLabel(rel.relationship_type);

                return (
                  <div
                    key={rel.id}
                    className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-3"
                  >
                    <div
                      onClick={() => onSelectEvidence(otherId)}
                      className="cursor-pointer space-y-1 flex-1"
                    >
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 rounded text-[10px] font-semibold">
                          {relText}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {t('confidence_level')} {rel.confidence_score}%
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs hover:text-indigo-500 transition">
                        {otherTitle}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{rel.description}</p>
                    </div>

                    <button
                      onClick={() => handleDeleteRel(rel.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950 rounded-lg"
                      title={t('confirm_delete_rel')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
