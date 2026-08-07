import React from 'react';
import {
  Briefcase,
  FileSearch,
  Network,
  ShieldCheck,
  Plus,
  ArrowUpRight,
  AlertOctagon,
  Layers,
  FileCode,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { DashboardStats } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface DashboardViewProps {
  stats: DashboardStats | null;
  isLoading: boolean;
  onNavigateTab: (tab: string) => void;
  onSelectCase: (caseId: string) => void;
  onSelectEvidence: (evidenceId: string) => void;
  onOpenUploadModal: () => void;
  onOpenCaseModal: () => void;
}

const TYPE_COLORS: Record<string, string> = {
  file: '#3B82F6',
  image: '#A855F7',
  log: '#F59E0B',
  email: '#0EA5E9',
  url: '#6366F1',
  network: '#10B981',
  memory: '#F43F5E',
  database: '#D946EF',
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  isLoading,
  onNavigateTab,
  onSelectCase,
  onSelectEvidence,
  onOpenUploadModal,
  onOpenCaseModal,
}) => {
  const {
    t,
    getEvidenceTypeLabel,
    getCasePriorityLabel,
    getCaseStatusLabel,
    getEvidenceStatusLabel,
    formatBytes,
  } = useLanguage();

  if (isLoading || !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm">...</p>
      </div>
    );
  }

  // Chart data formatting
  const evidenceTypeData = Object.entries(stats.evidence_by_type)
    .filter(([_, count]) => (count as number) > 0)
    .map(([type, count]) => ({
      name: getEvidenceTypeLabel(type as any).label,
      value: count,
      color: TYPE_COLORS[type] || '#64748B',
    }));

  const evidenceStatusData = Object.entries(stats.evidence_by_status).map(([status, count]) => ({
    name: getEvidenceStatusLabel(status as any).label,
    count,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{t('banner_compliance')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {t('banner_title')}
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              {t('banner_desc')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenCaseModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm rounded-xl border border-slate-700 transition shadow-lg"
            >
              <Briefcase className="w-4 h-4 text-indigo-400" />
              <span>{t('btn_new_case')}</span>
            </button>
            <button
              onClick={onOpenUploadModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-emerald-950/50 transition transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span>{t('btn_upload_evidence')}</span>
            </button>
          </div>
        </div>

        <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1 */}
        <div
          onClick={() => onNavigateTab('cases')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">{t('stat_total_cases')}</span>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl group-hover:scale-110 transition">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.total_cases}</span>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
              {stats.open_cases} {t('stat_open_cases')}
            </span>
          </div>
        </div>

        {/* Metric 2 */}
        <div
          onClick={() => onNavigateTab('evidence')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">{t('stat_collected_evidence')}</span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-xl group-hover:scale-110 transition">
              <FileSearch className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.total_evidence}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">{t('stat_files_logs')}</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div
          onClick={() => onNavigateTab('evidence')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">{t('stat_verified_evidence')}</span>
            <div className="p-2 bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 rounded-xl group-hover:scale-110 transition">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {stats.verified_evidence}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              {t('stat_verified_desc')}
            </span>
          </div>
        </div>

        {/* Metric 4 */}
        <div
          onClick={() => onNavigateTab('graph')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">{t('nav_graph')}</span>
            <div className="p-2 bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 rounded-xl group-hover:scale-110 transition">
              <Network className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.total_relationships}</span>
            <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">Graph</span>
          </div>
        </div>

        {/* Metric 5 */}
        <div
          onClick={() => onNavigateTab('cases')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">{t('case_priority_label')}</span>
            <div className="p-2 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-xl group-hover:scale-110 transition">
              <AlertOctagon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
              {stats.cases_by_priority.critical}
            </span>
            <span className="text-xs text-rose-500 font-medium">{getCasePriorityLabel('critical').label}</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Evidence Types */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">{t('evidence_type')}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t('stat_files_logs')}</p>
            </div>
            <Layers className="w-5 h-5 text-indigo-500" />
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={evidenceTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name} (${value})`}
                >
                  {evidenceTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>

                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#FFF',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Evidence Statuses */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">{t('stat_verified_evidence')}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t('stat_verified_desc')}</p>
            </div>
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={evidenceStatusData}>
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#FFF',
                  }}
                />
                <Bar dataKey="count" fill="#6366F1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity & Recent Cases */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Evidences */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <FileCode className="w-5 h-5 text-indigo-500" />
              <span>{t('recent_evidence_title')}</span>
            </h3>
            <button
              onClick={() => onNavigateTab('evidence')}
              className="text-indigo-600 dark:text-indigo-400 hover:underline text-xs font-medium flex items-center gap-1"
            >
              <span>{t('view_all')}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {stats.recent_evidences.length === 0 ? (
              <p className="text-center py-6 text-slate-400 text-xs">{t('no_evidence')}</p>
            ) : (
              stats.recent_evidences.map((ev) => {
                const typeInfo = getEvidenceTypeLabel(ev.evidence_type);
                const statusInfo = getEvidenceStatusLabel(ev.status);
                return (
                  <div
                    key={ev.id}
                    onClick={() => onSelectEvidence(ev.id)}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${typeInfo.color}`}>
                        {typeInfo.label}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{ev.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          <span>{ev.case_number}</span>
                          <span>•</span>
                          <span>{formatBytes(ev.file_size)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-start font-mono text-[11px] text-slate-400">
                      <div>MD5: {ev.file_hash_md5.substring(0, 8)}...</div>
                      <div className="text-[10px] text-emerald-500 font-semibold">{statusInfo.label}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Open Cases */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-500" />
              <span>{t('recent_cases_title')}</span>
            </h3>
            <button
              onClick={() => onNavigateTab('cases')}
              className="text-indigo-600 dark:text-indigo-400 hover:underline text-xs font-medium flex items-center gap-1"
            >
              <span>{t('view_all')}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {stats.recent_cases.length === 0 ? (
              <p className="text-center py-6 text-slate-400 text-xs">{t('no_cases')}</p>
            ) : (
              stats.recent_cases.map((c) => {
                const priorityInfo = getCasePriorityLabel(c.priority);
                const statusInfo = getCaseStatusLabel(c.status);
                return (
                  <div
                    key={c.id}
                    onClick={() => onSelectCase(c.id)}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400 font-bold">
                          {c.case_number}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${priorityInfo.color}`}>
                          {priorityInfo.label}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm line-clamp-1">{c.title}</h4>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-slate-400" />
                    </div>
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
