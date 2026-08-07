import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  EvidenceType,
  CasePriority,
  CaseStatus,
  EvidenceStatus,
  RelationshipType,
  CustodyAction,
} from '../types';

export type Language = 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
  getEvidenceTypeLabel: (type: EvidenceType) => { label: string; color: string };
  getCasePriorityLabel: (priority: CasePriority) => { label: string; color: string };
  getCaseStatusLabel: (status: CaseStatus) => { label: string; color: string };
  getEvidenceStatusLabel: (status: EvidenceStatus) => { label: string; color: string };
  getRelationshipLabel: (type: RelationshipType) => string;
  getCustodyActionLabel: (action: CustodyAction) => { label: string; icon: string };
  formatBytes: (bytes: number, decimals?: number) => string;
  formatDate: (dateString: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  ar: {
    // Navbar
    app_title: 'خزنة الأدلة والجنائيات الرقمية',
    app_subtitle: 'نظام التحريز الجنائي الرقمي وسلسلة الحفظ',
    nav_dashboard: 'لوحة التحكم',
    nav_cases: 'القضايا الجنائية',
    nav_evidence: 'خزنة الأدلة',
    nav_graph: 'شبكة العلاقات',
    nav_audit: 'التقارير والسجل',
    btn_new_case: 'قضية جديدة',
    btn_upload_evidence: 'تحريز دليل رقمي',
    theme_light: 'الوضع المضيء',
    theme_dark: 'الوضع الداكن',
    lang_toggle: 'English',

    // Dashboard
    banner_compliance: 'خزنة الأدلة رقمية - متطابقة مع معايير ISO/IEC 27037',
    banner_title: 'نظام التحريز والتحقيق الجنائي الرقمي',
    banner_desc:
      'إدارة القضايا الجنائية، حفظ البصمات الرقمية (MD5 & SHA256)، توثيق سلسلة الحفظ، وتتبع شبكة العلاقات المعقدة بين أدلة الاختراق والجرائم الرقمية.',
    stat_total_cases: 'إجمالي القضايا',
    stat_open_cases: 'قضايا مفتوحة',
    stat_collected_evidence: 'الأدلة المحروزة',
    stat_verified_evidence: 'الأدلة المفحوصة',
    stat_verified_desc: 'بصمات موثوقة ومطابقة',
    stat_files_logs: 'ملفات وسجلات',
    recent_evidence_title: 'أحدث الأدلة المحروزة مؤخراً',
    recent_cases_title: 'القضايا النشطة حالياً',
    view_all: 'عرض الكل',
    no_cases: 'لا توجد قضايا مسجلة بعد.',
    no_evidence: 'لا توجد أدلة محروزة بعد.',

    // Cases
    cases_view_title: 'سجل القضايا الجنائية الرقمية',
    cases_view_desc: 'إدارة وتتبع القضايا والتحقيقات الجنائية القائمة والأدلة المرتبطة بكل قضية',
    search_cases_placeholder: 'بحث برقم القضية، العنوان أو الوصف...',
    filter_all_statuses: 'جميع الحالات',
    filter_all_priorities: 'جميع الأولويات',
    case_number: 'رقم القضية',
    evidence_count: 'عدد الأدلة',
    created_at: 'تاريخ الفتح',
    actions: 'الإجراءات',
    view_details: 'عرض التفاصيل',
    delete_case: 'حذف القضية',
    confirm_delete_case: 'هل أنت تأكد من رغبتك في حذف هذه القضية؟',

    // Case Detail
    back_to_cases: 'العودة لقائمة القضايا',
    add_evidence_to_case: 'إضافة دليل جديد لهذه القضية',
    add_relationship: 'ربط علاقة بين دليلين',
    case_description: 'الوصف والملخص الجنائي',
    linked_evidence: 'الأدلة الرقمية المرتبطة بالقضية',
    no_linked_evidence: 'لا توجد أدلة رقمية مرتبطة بهذه القضية حتى الآن.',

    // Evidence Locker
    evidence_view_title: 'خزنة الأدلة الرقمية الجنائية',
    evidence_view_desc: 'تصفح وفحص جميع الملفات والسجلات الجنائية المحروزة وإدارة البصمات التشفيرية',
    search_evidence_placeholder: 'بحث بالعنوان، البصمة (MD5/SHA256) أو اسم الملف...',
    filter_all_types: 'جميع الأنواع',
    filter_all_evidence_statuses: 'جميع الحالات',
    original_filename: 'اسم الملف الأصلي',
    file_size: 'حجم الملف',
    source: 'المصدر',
    collector: 'جامع الدليل',
    verify_integrity: 'التحقق الفوري',
    download: 'تحميل',
    delete_evidence: 'حذف الدليل',
    confirm_delete_evidence: 'هل أنت تأكد من رغبتك في حذف هذا الدليل؟',

    // Evidence Detail
    back_to_evidence_list: 'العودة لقائمة الأدلة',
    verify_file_integrity: 'التحقق الفوري من سلامة الملف',
    integrity_confirmed: 'إثبات سلامة الدليل (Integrity Confirmed)',
    integrity_violated: 'تنبيه انتهاك السلامة الرقمية',
    calculated_hash: 'البصمة المحسوبة حالياً:',
    md5_checksum: 'بصمة MD5 Checksum',
    sha256_checksum: 'بصمة SHA-256 Checksum',
    copy: 'نسخ',
    copied: 'تم النسخ',
    custody_timeline: 'سلسلة الحفظ (Chain of Custody)',
    add_custody_log: 'تسجيل حركة جديدة',
    custody_from: 'من:',
    custody_to: 'إلى:',
    custody_location: 'الموقع:',
    no_custody_logs: 'لا توجد حركات مسجلة لسلسلة الحفظ بعد.',
    relationships_network: 'شبكة العلاقات مع الأدلة الأخرى',
    link_new_relationship: 'ربط علاقة جديدة',
    confidence_level: 'مستوى الثقة:',
    no_relationships: 'لا توجد علاقات مسجلة لهذا الدليل.',
    confirm_delete_rel: 'هل أنت تأكد من رغبتك في حذف رابط العلاقة؟',

    // Graph
    graph_view_title: 'شبكة العلاقات الجنائية (Graph Visualization)',
    graph_view_desc: 'تمثيل بياني تفاعلي يوضح ترابط الأدلة، خطوط الاتصال، ومصادر الهجمات',
    show_all_cases: 'عرض جميع القضايا',
    color_legend: 'مفتاح الألوان:',
    reset_network: 'إعادة ضبط الشبكة',
    selected_node_details: 'تفاصيل العقدة المحددة',
    node_name: 'اسم الدليل:',
    node_type: 'نوع الدليل:',
    node_case: 'القضية:',
    node_md5: 'بصمة MD5:',
    open_evidence_page: 'فتح صفحة تفاصيل الدليل الكاملة',
    click_node_hint: 'اضغط على أي عقدة في الشبكة لعرض تفاصيلها والعلاقات المباشرة بها.',
    loading_graph: 'جاري بناء شبكة العلاقات...',

    // Audit & Reports
    audit_view_title: 'سجل التدقيق وتصدير التقارير الجنائية',
    audit_view_desc: 'توثيق جميع الإجراءات المتخذة على النظام وتصدير السجلات بصيغ معتمدة (CSV & PDF)',
    export_csv: 'تصدير الأدلة كـ CSV',
    audit_log_title: 'سجل التدقيق الأمني (System Audit Log)',
    search_audit_placeholder: 'البحث في السجل...',
    user: 'المستخدم:',
    print_report_title: 'طباعة تقرير القضية',
    select_case_for_report: 'اختر القضية المعنية:',
    print_pdf_btn: 'طباعة / تصدير التقرير الفني',
    no_audit_logs: 'لا توجد سجلات مطابقة.',
    loading_logs: 'جاري تحميل السجلات...',

    // Modals
    upload_modal_title: 'تحريز ورفع دليل رقمي جديد',
    upload_modal_sub: 'حفظ الدليل في الخزنة وحساب البصمات التشفيرية آلياً (MD5 & SHA256)',
    related_case: 'القضية المرتبطة:',
    select_case_option: '-- اختر القضية الجنائية --',
    evidence_title: 'عنوان الدليل:',
    evidence_type: 'نوع الدليل الرقمي:',
    evidence_source_placeholder: 'مثال: خادم SSH الرئيسي IP: 192.168.1.100',
    evidence_collector_placeholder: 'اسم المحقق المسؤول',
    evidence_desc_label: 'الوصف الجنائي والملاحظات:',
    evidence_tags_label: 'العلامات (مفصولة بفواصل):',
    file_picker_label: 'ملف الدليل الأصلي:',
    file_picker_drop: 'اضغط هنا لاختيار الملف أو اسحبه داخل الصندوق',
    file_picker_types: 'يدعم جميع أنواع الملفات (سجلات، صور، ذاكرة، حزم شبكة) حتى 500 ميجابايت',
    upload_submitting: 'جاري حساب البصمات والتحريز...',
    upload_submit: 'حفظ وتحريز الدليل',
    cancel: 'إلغاء',

    new_case_title: 'فتح قضية جنائية رقمية جديدة',
    new_case_sub: 'إنشاء سجل قضية وربط الأدلة التحقيقية',
    case_num_label: 'رقم القضية (تلقائي إن ترك فارغاً):',
    case_title_label: 'عنوان القضية:',
    case_priority_label: 'مستوى الأولوية:',
    case_status_label: 'حالة القضية:',
    case_desc_label: 'الوصف والملخص الجنائي:',
    case_submit: 'فتح القضية',
    case_submitting: 'جاري الفتح...',

    rel_modal_title: 'ربط علاقة بين دليلين رقميين',
    rel_modal_sub: 'تحديد نوع الارتباط والاتجاه ومستوى الثقة',
    source_evidence: 'الدليل المصدر (Source):',
    select_source_opt: '-- اختر الدليل الأول --',
    target_evidence: 'الدليل الهدف (Target):',
    select_target_opt: '-- اختر الدليل الثاني --',
    relationship_type: 'نوع العلاقة والارتباط:',
    confidence_score: 'درجة الثقة الفنية (Confidence Score):',
    rel_desc_label: 'السبب والتفاصيل الفنية:',
    rel_submit: 'إنشاء العلاقة',
    rel_submitting: 'جاري الربط...',

    custody_modal_title: 'تسجيل حظر وسلسلة الحفظ',
    custody_modal_sub: 'تتبع حركات وتسليم وفحص الدليل الرقمي',
    custody_action: 'نوع الإجراء / الحركة:',
    custody_from_label: 'من (المسلم):',
    custody_to_label: 'إلى (المستلم):',
    custody_loc_label: 'موقع الحفظ والتحريز:',
    custody_notes_label: 'ملاحظات وتفاصيل التسليم:',
    custody_submit: 'تسجيل السجل',
    custody_submitting: 'جاري الحفظ...',
  },
  en: {
    // Navbar
    app_title: 'Digital Forensics Evidence Locker',
    app_subtitle: 'Forensic Evidence Acquisition & Chain of Custody System',
    nav_dashboard: 'Dashboard',
    nav_cases: 'Cases',
    nav_evidence: 'Evidence Vault',
    nav_graph: 'Relationship Graph',
    nav_audit: 'Audit & Reports',
    btn_new_case: 'New Case',
    btn_upload_evidence: 'Acquire Evidence',
    theme_light: 'Light Mode',
    theme_dark: 'Dark Mode',
    lang_toggle: 'عربي',

    // Dashboard
    banner_compliance: 'Digital Evidence Vault - ISO/IEC 27037 Compliant',
    banner_title: 'Digital Forensics Acquisition & Investigation System',
    banner_desc:
      'Manage criminal cases, preserve cryptographic hashes (MD5 & SHA256), document chain of custody, and trace complex relationship networks between intrusion evidence and cyber crimes.',
    stat_total_cases: 'Total Cases',
    stat_open_cases: 'Open Cases',
    stat_collected_evidence: 'Acquired Evidence',
    stat_verified_evidence: 'Verified Evidence',
    stat_verified_desc: 'Trusted & verified hashes',
    stat_files_logs: 'Files & Logs',
    recent_evidence_title: 'Recently Acquired Evidence',
    recent_cases_title: 'Active Investigations',
    view_all: 'View All',
    no_cases: 'No cases recorded yet.',
    no_evidence: 'No evidence acquired yet.',

    // Cases
    cases_view_title: 'Digital Forensics Cases',
    cases_view_desc: 'Manage and track ongoing digital investigations and evidence associated with each case.',
    search_cases_placeholder: 'Search by case number, title, or description...',
    filter_all_statuses: 'All Statuses',
    filter_all_priorities: 'All Priorities',
    case_number: 'Case #',
    evidence_count: 'Evidence Count',
    created_at: 'Date Opened',
    actions: 'Actions',
    view_details: 'View Details',
    delete_case: 'Delete Case',
    confirm_delete_case: 'Are you sure you want to delete this case?',

    // Case Detail
    back_to_cases: 'Back to Cases',
    add_evidence_to_case: 'Acquire Evidence for Case',
    add_relationship: 'Link Relationship',
    case_description: 'Case Description & Summary',
    linked_evidence: 'Associated Digital Evidence',
    no_linked_evidence: 'No digital evidence associated with this case yet.',

    // Evidence Locker
    evidence_view_title: 'Digital Evidence Vault',
    evidence_view_desc: 'Browse and inspect all acquired forensic files, logs, and cryptographic hashes.',
    search_evidence_placeholder: 'Search by title, hash (MD5/SHA256), or filename...',
    filter_all_types: 'All Types',
    filter_all_evidence_statuses: 'All Statuses',
    original_filename: 'Original Filename',
    file_size: 'File Size',
    source: 'Source',
    collector: 'Investigator',
    verify_integrity: 'Verify Hash',
    download: 'Download',
    delete_evidence: 'Delete Evidence',
    confirm_delete_evidence: 'Are you sure you want to delete this evidence item?',

    // Evidence Detail
    back_to_evidence_list: 'Back to Evidence Vault',
    verify_file_integrity: 'Verify File Integrity Now',
    integrity_confirmed: 'Integrity Confirmed (Hashes Match)',
    integrity_violated: 'Digital Integrity Breach Alert',
    calculated_hash: 'Currently Calculated Hash:',
    md5_checksum: 'MD5 Checksum',
    sha256_checksum: 'SHA-256 Checksum',
    copy: 'Copy',
    copied: 'Copied',
    custody_timeline: 'Chain of Custody',
    add_custody_log: 'Log Custody Action',
    custody_from: 'From:',
    custody_to: 'To:',
    custody_location: 'Location:',
    no_custody_logs: 'No chain of custody logs recorded yet.',
    relationships_network: 'Relationship Network with Other Evidence',
    link_new_relationship: 'Link New Relationship',
    confidence_level: 'Confidence Level:',
    no_relationships: 'No relationships recorded for this evidence.',
    confirm_delete_rel: 'Are you sure you want to delete this relationship link?',

    // Graph
    graph_view_title: 'Relationship Network (Graph Visualization)',
    graph_view_desc: 'Interactive graph visualization showing evidence linkages, communication lines, and attack origins.',
    show_all_cases: 'Display All Cases',
    color_legend: 'Color Legend:',
    reset_network: 'Reset Graph Layout',
    selected_node_details: 'Selected Node Details',
    node_name: 'Evidence Name:',
    node_type: 'Evidence Type:',
    node_case: 'Case:',
    node_md5: 'MD5 Hash:',
    open_evidence_page: 'Open Full Evidence Page',
    click_node_hint: 'Click any node in the graph to inspect details and direct connections.',
    loading_graph: 'Constructing relationship graph...',

    // Audit & Reports
    audit_view_title: 'Audit Trail & Forensic Reports',
    audit_view_desc: 'Document all system actions and export official evidence records in CSV & PDF formats.',
    export_csv: 'Export Evidence CSV',
    audit_log_title: 'System Audit Log',
    search_audit_placeholder: 'Search audit log...',
    user: 'User:',
    print_report_title: 'Print Case Report',
    select_case_for_report: 'Select Target Case:',
    print_pdf_btn: 'Print / Export Forensic Report',
    no_audit_logs: 'No matching audit records found.',
    loading_logs: 'Loading audit logs...',

    // Modals
    upload_modal_title: 'Acquire & Upload Digital Evidence',
    upload_modal_sub: 'Store evidence securely and calculate cryptographic hashes automatically (MD5 & SHA256)',
    related_case: 'Associated Case:',
    select_case_option: '-- Select Target Case --',
    evidence_title: 'Evidence Title:',
    evidence_type: 'Digital Evidence Type:',
    evidence_source_placeholder: 'e.g. Primary SSH Server IP: 192.168.1.100',
    evidence_collector_placeholder: 'Lead Forensic Investigator',
    evidence_desc_label: 'Forensic Description & Notes:',
    evidence_tags_label: 'Tags (comma separated):',
    file_picker_label: 'Original Evidence File:',
    file_picker_drop: 'Click here or drag file into box to upload',
    file_picker_types: 'Supports all file types (Logs, Images, Memory Dumps, PCAP) up to 500MB',
    upload_submitting: 'Calculating Hashes & Acquiring...',
    upload_submit: 'Acquire & Vault Evidence',
    cancel: 'Cancel',

    new_case_title: 'Open New Digital Investigation Case',
    new_case_sub: 'Create case record and associate forensic evidence',
    case_num_label: 'Case Number (Auto-generated if empty):',
    case_title_label: 'Case Title:',
    case_priority_label: 'Priority Level:',
    case_status_label: 'Case Status:',
    case_desc_label: 'Description & Investigation Summary:',
    case_submit: 'Open Case',
    case_submitting: 'Opening Case...',

    rel_modal_title: 'Link Relationship Between Evidence Items',
    rel_modal_sub: 'Specify relationship type, direction, and confidence score',
    source_evidence: 'Source Evidence:',
    select_source_opt: '-- Select Source Evidence --',
    target_evidence: 'Target Evidence:',
    select_target_opt: '-- Select Target Evidence --',
    relationship_type: 'Relationship Type:',
    confidence_score: 'Technical Confidence Score:',
    rel_desc_label: 'Reason & Technical Details:',
    rel_submit: 'Create Link',
    rel_submitting: 'Linking...',

    custody_modal_title: 'Log Chain of Custody Action',
    custody_modal_sub: 'Track movement, transfer, and inspection of digital evidence',
    custody_action: 'Action / Movement Type:',
    custody_from_label: 'From (Releasing Party):',
    custody_to_label: 'To (Receiving Party):',
    custody_loc_label: 'Vault / Storage Location:',
    custody_notes_label: 'Handover Notes & Observations:',
    custody_submit: 'Record Custody Log',
    custody_submitting: 'Saving...',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('forensics_language');
    if (saved === 'en' || saved === 'ar') return saved;
    return 'ar';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('forensics_language', lang);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || translations['ar'][key] || key;
  };

  const getEvidenceTypeLabel = (type: EvidenceType) => {
    const labels: Record<EvidenceType, Record<Language, string>> = {
      file: { ar: 'ملف عام', en: 'General File' },
      image: { ar: 'صورة / فيديو', en: 'Image / Video' },
      log: { ar: 'سجل نظام (Log)', en: 'System Log' },
      email: { ar: 'بريد إلكتروني', en: 'Email Message' },
      url: { ar: 'رابط / شبكي', en: 'URL / Web Domain' },
      network: { ar: 'حزم شبكة (PCAP)', en: 'Network Capture (PCAP)' },
      memory: { ar: 'ذاكرة مؤقتة (RAM)', en: 'Memory Dump (RAM)' },
      database: { ar: 'قاعدة بيانات', en: 'Database Export' },
    };

    const colors: Record<EvidenceType, string> = {
      file: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300',
      image: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/40 dark:text-purple-300',
      log: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300',
      email: 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/40 dark:text-sky-300',
      url: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300',
      network: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300',
      memory: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300',
      database: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200 dark:bg-fuchsia-900/40 dark:text-fuchsia-300',
    };

    return {
      label: labels[type]?.[language] || type,
      color: colors[type] || 'bg-slate-100 text-slate-800',
    };
  };

  const getCasePriorityLabel = (priority: CasePriority) => {
    const labels: Record<CasePriority, Record<Language, string>> = {
      low: { ar: 'منخفضة', en: 'Low' },
      medium: { ar: 'متوسطة', en: 'Medium' },
      high: { ar: 'عالية', en: 'High' },
      critical: { ar: 'حرجة للغاية', en: 'Critical' },
    };

    const colors: Record<CasePriority, string> = {
      low: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
      medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
      high: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
      critical: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300',
    };

    return {
      label: labels[priority]?.[language] || priority,
      color: colors[priority] || 'bg-slate-100 text-slate-700',
    };
  };

  const getCaseStatusLabel = (status: CaseStatus) => {
    const labels: Record<CaseStatus, Record<Language, string>> = {
      open: { ar: 'مفتوحة', en: 'Open' },
      investigating: { ar: 'قيد التحقيق', en: 'Investigating' },
      closed: { ar: 'مغلقة', en: 'Closed' },
    };

    const colors: Record<CaseStatus, string> = {
      open: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
      investigating: 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300',
      closed: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    };

    return {
      label: labels[status]?.[language] || status,
      color: colors[status] || 'bg-slate-100 text-slate-700',
    };
  };

  const getEvidenceStatusLabel = (status: EvidenceStatus) => {
    const labels: Record<EvidenceStatus, Record<Language, string>> = {
      pending: { ar: 'معلق (Pending)', en: 'Pending' },
      analyzing: { ar: 'قيد التحليل الفني', en: 'Analyzing' },
      analyzed: { ar: 'تم التحليل', en: 'Analyzed' },
      verified: { ar: 'مفحوص ومثبت البصمة', en: 'Verified Hash' },
    };

    const colors: Record<EvidenceStatus, string> = {
      pending: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
      analyzing: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
      analyzed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
      verified: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
    };

    return {
      label: labels[status]?.[language] || status,
      color: colors[status] || 'bg-slate-100 text-slate-700',
    };
  };

  const getRelationshipLabel = (type: RelationshipType) => {
    const labels: Record<RelationshipType, Record<Language, string>> = {
      contains: { ar: 'يحتوي على', en: 'Contains' },
      part_of: { ar: 'جزء من', en: 'Part of' },
      related_to: { ar: 'مرتبط بـ', en: 'Related to' },
      created_by: { ar: 'تم إنشاؤه بواسطة', en: 'Created by' },
      sent_from: { ar: 'مرسل من', en: 'Sent from' },
      sent_to: { ar: 'مرسل إلى', en: 'Sent to' },
      refers_to: { ar: 'يشير إلى', en: 'Refers to' },
      has_ip: { ar: 'يحتوي عنوان IP', en: 'Contains IP' },
      has_email: { ar: 'يحتوي بريد إلكتروني', en: 'Contains Email' },
      timestamp_near: { ar: 'متزامن زمنياً مع', en: 'Time Synchronized With' },
      originates_from: { ar: 'ينشأ من', en: 'Originates from' },
      points_to: { ar: 'يوجه إلى', en: 'Points to' },
    };

    return labels[type]?.[language] || type;
  };

  const getCustodyActionLabel = (action: CustodyAction) => {
    const labels: Record<CustodyAction, Record<Language, string>> = {
      collected: { ar: 'تم التحريز والجمع', en: 'Acquired & Collected' },
      transferred: { ar: 'نقل وتسليم الدليل', en: 'Transferred & Handed Over' },
      analyzed: { ar: 'فحص وتحليل فني', en: 'Forensic Analysis' },
      verified: { ar: 'التحقق المطابق للبصمة', en: 'Hash Verification' },
      stored: { ar: 'تخزين مشفر في الخزنة', en: 'Vault Storage' },
      destroyed: { ar: 'إتلاف آمن بأمر قضائي', en: 'Authorized Destruction' },
    };

    const icons: Record<CustodyAction, string> = {
      collected: 'Inbox',
      transferred: 'ArrowRightLeft',
      analyzed: 'Microscope',
      verified: 'ShieldCheck',
      stored: 'Lock',
      destroyed: 'Trash2',
    };

    return {
      label: labels[action]?.[language] || action,
      icon: icons[action] || 'Clock',
    };
  };

  const formatBytes = (bytes: number, decimals = 2): string => {
    if (bytes === 0) return language === 'ar' ? '0 بايت' : '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes =
      language === 'ar'
        ? ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت', 'تيرابايت']
        : ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    try {
      const d = new Date(dateString);
      return new Intl.DateTimeFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(d);
    } catch (e) {
      return dateString;
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        getEvidenceTypeLabel,
        getCasePriorityLabel,
        getCaseStatusLabel,
        getEvidenceStatusLabel,
        getRelationshipLabel,
        getCustodyActionLabel,
        formatBytes,
        formatDate,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
