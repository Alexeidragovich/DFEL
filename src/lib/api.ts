import {
  Case,
  Evidence,
  Relationship,
  ChainOfCustody,
  Tag,
  AuditLog,
  VerificationResult,
  DashboardStats,
  CasePriority,
  CaseStatus,
  EvidenceType,
  EvidenceStatus,
  RelationshipType,
  CustodyAction,
} from '../types';

export async function fetchStats(): Promise<DashboardStats> {
  const res = await fetch('/api/dashboard/stats');
  if (!res.ok) throw new Error('فشل جلب الإحصائيات');
  return res.json();
}

export async function fetchCases(params?: {
  status?: string;
  priority?: string;
  search?: string;
}): Promise<Case[]> {
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  if (params?.priority) query.set('priority', params.priority);
  if (params?.search) query.set('search', params.search);

  const res = await fetch(`/api/cases?${query.toString()}`);
  if (!res.ok) throw new Error('فشل جلب قائمة القضايا');
  return res.json();
}

export async function fetchCaseById(id: string): Promise<{
  case: Case;
  evidences: Evidence[];
  relationships: Relationship[];
}> {
  const res = await fetch(`/api/cases/${id}`);
  if (!res.ok) throw new Error('فشل جلب تفاصيل القضية');
  return res.json();
}

export async function createCase(data: {
  case_number?: string;
  title: string;
  description: string;
  priority: CasePriority;
  status?: CaseStatus;
}): Promise<Case> {
  const res = await fetch('/api/cases', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'فشل إنشاء القضية');
  }
  return res.json();
}

export async function updateCase(
  id: string,
  data: Partial<Pick<Case, 'title' | 'description' | 'status' | 'priority'>>
): Promise<Case> {
  const res = await fetch(`/api/cases/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('فشل تحديث القضية');
  return res.json();
}

export async function deleteCase(id: string): Promise<void> {
  const res = await fetch(`/api/cases/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('فشل حذف القضية');
}

export async function fetchEvidences(params?: {
  case_id?: string;
  evidence_type?: string;
  status?: string;
  search?: string;
  tag?: string;
}): Promise<Evidence[]> {
  const query = new URLSearchParams();
  if (params?.case_id) query.set('case_id', params.case_id);
  if (params?.evidence_type) query.set('evidence_type', params.evidence_type);
  if (params?.status) query.set('status', params.status);
  if (params?.search) query.set('search', params.search);
  if (params?.tag) query.set('tag', params.tag);

  const res = await fetch(`/api/evidence?${query.toString()}`);
  if (!res.ok) throw new Error('فشل جلب قائمة الأدلة');
  return res.json();
}

export async function fetchEvidenceById(id: string): Promise<{
  evidence: Evidence;
  custody: ChainOfCustody[];
  relationships: Relationship[];
}> {
  const res = await fetch(`/api/evidence/${id}`);
  if (!res.ok) throw new Error('فشل جلب تفاصيل الدليل');
  return res.json();
}

export async function uploadEvidence(formData: FormData): Promise<Evidence> {
  const res = await fetch('/api/evidence/upload', {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'فشل رفع الدليل الرقمي');
  }
  return res.json();
}

export async function updateEvidence(
  id: string,
  data: Partial<Pick<Evidence, 'title' | 'description' | 'status' | 'source' | 'tags'>>
): Promise<Evidence> {
  const res = await fetch(`/api/evidence/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('فشل تحديث بيانات الدليل');
  return res.json();
}

export async function deleteEvidence(id: string): Promise<void> {
  const res = await fetch(`/api/evidence/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('فشل حذف الدليل');
}

export async function verifyEvidenceIntegrity(id: string): Promise<VerificationResult> {
  const res = await fetch(`/api/evidence/${id}/verify`, { method: 'POST' });
  if (!res.ok) throw new Error('فشل إجراء التحقق من البصمة الرقمية');
  return res.json();
}

export async function fetchRelationships(params?: {
  case_id?: string;
  evidence_id?: string;
}): Promise<Relationship[]> {
  const query = new URLSearchParams();
  if (params?.case_id) query.set('case_id', params.case_id);
  if (params?.evidence_id) query.set('evidence_id', params.evidence_id);

  const res = await fetch(`/api/relationships?${query.toString()}`);
  if (!res.ok) throw new Error('فشل جلب العلاقات');
  return res.json();
}

export async function createRelationship(data: {
  source_id: string;
  target_id: string;
  relationship_type: RelationshipType;
  description: string;
  confidence_score: number;
  created_by?: string;
}): Promise<Relationship> {
  const res = await fetch('/api/relationships', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'فشل إنشاء العلاقة');
  }
  return res.json();
}

export async function deleteRelationship(id: string): Promise<void> {
  const res = await fetch(`/api/relationships/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('فشل حذف العلاقة');
}

export async function fetchGraphData(case_id?: string): Promise<{
  nodes: Array<{
    id: string;
    label: string;
    type: EvidenceType;
    case_number: string;
    md5: string;
    status: EvidenceStatus;
    filename: string;
  }>;
  edges: Array<{
    id: string;
    from: string;
    to: string;
    label: string;
    description: string;
    confidence: number;
  }>;
}> {
  const query = case_id ? `?case_id=${case_id}` : '';
  const res = await fetch(`/api/relationships/graph${query}`);
  if (!res.ok) throw new Error('فشل جلب بيانات شبكة العلاقات');
  return res.json();
}

export async function addCustodyLog(data: {
  evidence_id: string;
  action: CustodyAction;
  from_user: string;
  to_user: string;
  notes?: string;
  location?: string;
}): Promise<ChainOfCustody> {
  const res = await fetch('/api/custody', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('فشل تسجيل حركة سلسلة الحفظ');
  return res.json();
}

export async function fetchTags(): Promise<Tag[]> {
  const res = await fetch('/api/tags');
  if (!res.ok) throw new Error('فشل جلب العلامات');
  return res.json();
}

export async function fetchAuditLogs(): Promise<AuditLog[]> {
  const res = await fetch('/api/audit-logs');
  if (!res.ok) throw new Error('فشل جلب سجلات التدقيق');
  return res.json();
}
