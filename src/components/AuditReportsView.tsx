import React, { useState, useEffect } from 'react';
import {
  History,
  FileSpreadsheet,
  ShieldCheck,
  Search,
  FileText,
  User,
  Clock,
  Printer,
} from 'lucide-react';
import { AuditLog, Case } from '../types';
import { fetchAuditLogs, fetchCases } from '../lib/api';
import { useLanguage } from '../context/LanguageContext';

export const AuditReportsView: React.FC = () => {
  const { t, formatDate } = useLanguage();

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCaseForReport, setSelectedCaseForReport] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [searchLog, setSearchLog] = useState('');

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [logs, cList] = await Promise.all([fetchAuditLogs(), fetchCases()]);
      setAuditLogs(logs);
      setCases(cList);
      if (cList.length > 0) {
        setSelectedCaseForReport(cList[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredLogs = auditLogs.filter(
    (l) =>
      l.action.toLowerCase().includes(searchLog.toLowerCase()) ||
      l.user.toLowerCase().includes(searchLog.toLowerCase()) ||
      l.details.toLowerCase().includes(searchLog.toLowerCase())
  );

  const selectedCaseObj = cases.find((c) => c.id === selectedCaseForReport);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-6 h-6 text-indigo-500" />
            <span>{t('audit_view_title')}</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {t('audit_view_desc')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/api/reports/evidence/csv"
            download
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-lg transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{t('export_csv')}</span>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Audit Trail */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-500" />
              <span>{t('audit_log_title')}</span>
            </h2>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchLog}
                onChange={(e) => setSearchLog(e.target.value)}
                placeholder={t('search_audit_placeholder')}
                className="w-full ps-9 pe-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[500px] overflow-y-auto pe-1">
            {isLoading ? (
              <p className="text-center py-8 text-slate-400 text-xs">{t('loading_logs')}</p>
            ) : filteredLogs.length === 0 ? (
              <p className="text-center py-8 text-slate-400 text-xs">{t('no_audit_logs')}</p>
            ) : (
              filteredLogs.map((log) => (
                <div key={log.id} className="py-3 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      {log.action}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(log.created_at)}</span>
                    </span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300">{log.details}</p>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{t('user')} {log.user}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Col: Case Report Exporter */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-500" />
            <span>{t('print_report_title')}</span>
          </h2>

          <div className="space-y-3 text-xs">
            <label className="font-bold text-slate-700 dark:text-slate-300 block">
              {t('select_case_for_report')}
            </label>
            <select
              value={selectedCaseForReport}
              onChange={(e) => setSelectedCaseForReport(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            >
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.case_number} - {c.title}
                </option>
              ))}
            </select>

            {selectedCaseObj && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-2 border border-slate-200 dark:border-slate-700">
                <p className="font-bold text-slate-900 dark:text-white">{selectedCaseObj.title}</p>
                <p className="text-slate-500 text-[11px]">{selectedCaseObj.description}</p>
                <div className="text-[10px] text-indigo-400 font-mono">
                  {t('evidence_count')}: {selectedCaseObj.evidence_count || 0}
                </div>
              </div>
            )}

            <button
              onClick={() => window.print()}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow transition flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>{t('print_pdf_btn')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
