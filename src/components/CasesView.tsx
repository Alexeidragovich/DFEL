import React, { useState } from 'react';
import {
  Briefcase,
  Search,
  Filter,
  Plus,
  ArrowUpRight,
  Clock,
  Layers,
  Trash2,
} from 'lucide-react';
import { Case } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface CasesViewProps {
  cases: Case[];
  isLoading: boolean;
  onSelectCase: (caseId: string) => void;
  onOpenCaseModal: () => void;
  onDeleteCase: (caseId: string) => void;
}

export const CasesView: React.FC<CasesViewProps> = ({
  cases,
  isLoading,
  onSelectCase,
  onOpenCaseModal,
  onDeleteCase,
}) => {
  const {
    t,
    getCasePriorityLabel,
    getCaseStatusLabel,
    formatDate,
  } = useLanguage();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.case_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || c.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-indigo-500" />
            <span>{t('cases_view_title')}</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {t('cases_view_desc')}
          </p>
        </div>

        <button
          onClick={onOpenCaseModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition transform hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          <span>{t('btn_new_case')}</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('search_cases_placeholder')}
            className="w-full ps-10 pe-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">{t('filter_all_statuses')}</option>
            <option value="open">{getCaseStatusLabel('open').label}</option>
            <option value="investigating">{getCaseStatusLabel('investigating').label}</option>
            <option value="closed">{getCaseStatusLabel('closed').label}</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">{t('filter_all_priorities')}</option>
            <option value="low">{getCasePriorityLabel('low').label}</option>
            <option value="medium">{getCasePriorityLabel('medium').label}</option>
            <option value="high">{getCasePriorityLabel('high').label}</option>
            <option value="critical">{getCasePriorityLabel('critical').label}</option>
          </select>
        </div>
      </div>

      {/* Grid of Cases */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-400">...</div>
      ) : filteredCases.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
          <Briefcase className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">{t('no_cases')}</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCases.map((c) => {
            const priorityInfo = getCasePriorityLabel(c.priority);
            const statusInfo = getCaseStatusLabel(c.status);

            return (
              <div
                key={c.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:border-indigo-500/50 transition flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  {/* Top Tags */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 rounded-lg border border-indigo-200 dark:border-indigo-900/50">
                      {c.case_number}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${priorityInfo.color}`}>
                        {priorityInfo.label}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3
                      onClick={() => onSelectCase(c.id)}
                      className="font-bold text-slate-900 dark:text-white text-base hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition line-clamp-2"
                    >
                      {c.title}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-1.5 line-clamp-3 leading-relaxed">
                      {c.description || ''}
                    </p>
                  </div>
                </div>

                {/* Footer Info */}
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                      <Layers className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{c.evidence_count || 0}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDate(c.created_at)}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(t('confirm_delete_case'))) {
                          onDeleteCase(c.id);
                        }
                      }}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition"
                      title={t('delete_case')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onSelectCase(c.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg transition"
                    >
                      <span>{t('view_details')}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
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
