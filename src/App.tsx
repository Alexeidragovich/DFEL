import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { CasesView } from './components/CasesView';
import { CaseDetailView } from './components/CaseDetailView';
import { EvidenceView } from './components/EvidenceView';
import { EvidenceDetailView } from './components/EvidenceDetailView';
import { GraphView } from './components/GraphView';
import { AuditReportsView } from './components/AuditReportsView';

import { UploadEvidenceModal } from './components/UploadEvidenceModal';
import { CaseModal } from './components/CaseModal';
import { RelationshipModal } from './components/RelationshipModal';
import { CustodyModal } from './components/CustodyModal';

import { Case, Evidence, DashboardStats } from './types';
import {
  fetchStats,
  fetchCases,
  fetchEvidences,
  deleteCase,
  deleteEvidence,
  verifyEvidenceIntegrity,
} from './lib/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(null);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [cases, setCases] = useState<Case[]>([]);
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCaseModalOpen, setIsCaseModalOpen] = useState(false);
  const [isRelationshipModalOpen, setIsRelationshipModalOpen] = useState(false);
  const [custodyModalEvidenceId, setCustodyModalEvidenceId] = useState<string | null>(null);
  const [preselectedCaseIdForUpload, setPreselectedCaseIdForUpload] = useState<string | undefined>(
    undefined
  );

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return (
      localStorage.getItem('forensics_theme') === 'dark' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches
    );
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('forensics_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('forensics_theme', 'light');
    }
  }, [isDarkMode]);

  const loadAllData = async () => {
    try {
      setIsLoading(true);
      const [s, cList, eList] = await Promise.all([
        fetchStats(),
        fetchCases(),
        fetchEvidences(),
      ]);
      setStats(s);
      setCases(cList);
      setEvidences(eList);
    } catch (err) {
      console.error('Error loading application data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Handlers
  const handleSelectCase = (caseId: string) => {
    setSelectedCaseId(caseId);
    setSelectedEvidenceId(null);
    setActiveTab('case_detail');
  };

  const handleSelectEvidence = (evidenceId: string) => {
    setSelectedEvidenceId(evidenceId);
    setSelectedCaseId(null);
    setActiveTab('evidence_detail');
  };

  const handleDeleteCase = async (caseId: string) => {
    try {
      await deleteCase(caseId);
      if (selectedCaseId === caseId) {
        setSelectedCaseId(null);
        setActiveTab('cases');
      }
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'فشل حذف القضية');
    }
  };

  const handleDeleteEvidence = async (evidenceId: string) => {
    try {
      await deleteEvidence(evidenceId);
      if (selectedEvidenceId === evidenceId) {
        setSelectedEvidenceId(null);
        setActiveTab('evidence');
      }
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'فشل حذف الدليل');
    }
  };

  const handleVerifyIntegrity = async (evidenceId: string) => {
    try {
      const res = await verifyEvidenceIntegrity(evidenceId);
      alert(res.message);
      loadAllData();
    } catch (err: any) {
      alert('حدث خطأ في عملية التحقق');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200 dir-rtl">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setSelectedCaseId(null);
          setSelectedEvidenceId(null);
          setActiveTab(tab);
        }}
        onOpenUploadModal={() => {
          setPreselectedCaseIdForUpload(undefined);
          setIsUploadModalOpen(true);
        }}
        onOpenCaseModal={() => setIsCaseModalOpen(true)}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            stats={stats}
            isLoading={isLoading}
            onNavigateTab={(tab) => {
              setSelectedCaseId(null);
              setSelectedEvidenceId(null);
              setActiveTab(tab);
            }}
            onSelectCase={handleSelectCase}
            onSelectEvidence={handleSelectEvidence}
            onOpenUploadModal={() => setIsUploadModalOpen(true)}
            onOpenCaseModal={() => setIsCaseModalOpen(true)}
          />
        )}

        {activeTab === 'cases' && (
          <CasesView
            cases={cases}
            isLoading={isLoading}
            onSelectCase={handleSelectCase}
            onOpenCaseModal={() => setIsCaseModalOpen(true)}
            onDeleteCase={handleDeleteCase}
          />
        )}

        {activeTab === 'case_detail' && selectedCaseId && (
          <CaseDetailView
            caseId={selectedCaseId}
            onBack={() => setActiveTab('cases')}
            onSelectEvidence={handleSelectEvidence}
            onOpenUploadModalForCase={(cId) => {
              setPreselectedCaseIdForUpload(cId);
              setIsUploadModalOpen(true);
            }}
            onOpenRelationshipModal={() => setIsRelationshipModalOpen(true)}
            onDeleteCase={handleDeleteCase}
            onDeleteEvidence={handleDeleteEvidence}
          />
        )}

        {activeTab === 'evidence' && (
          <EvidenceView
            evidences={evidences}
            cases={cases}
            isLoading={isLoading}
            onSelectEvidence={handleSelectEvidence}
            onOpenUploadModal={() => {
              setPreselectedCaseIdForUpload(undefined);
              setIsUploadModalOpen(true);
            }}
            onDeleteEvidence={handleDeleteEvidence}
            onVerifyIntegrity={handleVerifyIntegrity}
          />
        )}

        {activeTab === 'evidence_detail' && selectedEvidenceId && (
          <EvidenceDetailView
            evidenceId={selectedEvidenceId}
            onBack={() => setActiveTab('evidence')}
            onOpenCustodyModal={(eId) => setCustodyModalEvidenceId(eId)}
            onOpenRelationshipModal={() => setIsRelationshipModalOpen(true)}
            onSelectEvidence={handleSelectEvidence}
            onDeleteEvidence={handleDeleteEvidence}
          />
        )}

        {activeTab === 'graph' && (
          <GraphView
            onSelectEvidence={handleSelectEvidence}
            onOpenRelationshipModal={() => setIsRelationshipModalOpen(true)}
          />
        )}

        {activeTab === 'audit' && <AuditReportsView />}
      </main>

      {/* Global Modals */}
      <UploadEvidenceModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        cases={cases}
        preselectedCaseId={preselectedCaseIdForUpload}
        onSuccess={loadAllData}
      />

      <CaseModal
        isOpen={isCaseModalOpen}
        onClose={() => setIsCaseModalOpen(false)}
        onSuccess={loadAllData}
      />

      <RelationshipModal
        isOpen={isRelationshipModalOpen}
        onClose={() => setIsRelationshipModalOpen(false)}
        evidences={evidences}
        onSuccess={loadAllData}
      />

      {custodyModalEvidenceId && (
        <CustodyModal
          isOpen={!!custodyModalEvidenceId}
          onClose={() => setCustodyModalEvidenceId(null)}
          evidenceId={custodyModalEvidenceId}
          onSuccess={loadAllData}
        />
      )}
    </div>
  );
}
