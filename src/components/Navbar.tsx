import React from 'react';
import {
  ShieldAlert,
  Briefcase,
  FileSearch,
  Network,
  History,
  Plus,
  Moon,
  Sun,
  Globe,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenUploadModal: () => void;
  onOpenCaseModal: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenUploadModal,
  onOpenCaseModal,
  isDarkMode,
  setIsDarkMode,
}) => {
  const { t, language, toggleLanguage } = useLanguage();

  const navItems = [
    { id: 'dashboard', label: t('nav_dashboard'), icon: ShieldAlert },
    { id: 'cases', label: t('nav_cases'), icon: Briefcase },
    { id: 'evidence', label: t('nav_evidence'), icon: FileSearch },
    { id: 'graph', label: t('nav_graph'), icon: Network },
    { id: 'audit', label: t('nav_audit'), icon: History },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-slate-100 border-b border-slate-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo / Title */}
          <div
            className="flex items-center gap-3 cursor-pointer shrink-0"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="p-2.5 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-xl shadow-lg ring-1 ring-white/20">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base sm:text-lg tracking-tight">
                  {t('app_title')}
                </span>
                <span className="hidden lg:inline-block text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                  v2.4 Pro
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                {t('app_subtitle')}
              </p>
            </div>
          </div>

          {/* Nav Tabs (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs xl:text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600/90 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              id="btn-quick-new-case"
              onClick={onOpenCaseModal}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-400" />
              <span>{t('btn_new_case')}</span>
            </button>

            <button
              id="btn-quick-upload-evidence"
              onClick={onOpenUploadModal}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-md shadow-emerald-900/30 transition transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span>{t('btn_upload_evidence')}</span>
            </button>

            {/* Language Toggle Button */}
            <button
              id="btn-toggle-language"
              onClick={toggleLanguage}
              title={language === 'ar' ? 'Switch to English' : 'التحويل للغة العربية'}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 rounded-lg transition"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span>{t('lang_toggle')}</span>
            </button>

            {/* Dark Mode Toggle Button */}
            <button
              id="btn-toggle-dark-mode"
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={isDarkMode ? t('theme_light') : t('theme_dark')}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-300" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Tab Navigation */}
      <div className="lg:hidden bg-slate-900/95 border-t border-slate-800/80 px-2 py-1.5 flex justify-around overflow-x-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
                isActive ? 'text-indigo-400 font-bold' : 'text-slate-400'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
