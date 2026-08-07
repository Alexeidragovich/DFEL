export type CaseStatus = 'open' | 'investigating' | 'closed';
export type CasePriority = 'low' | 'medium' | 'high' | 'critical';

export type EvidenceType =
  | 'file'
  | 'image'
  | 'log'
  | 'email'
  | 'url'
  | 'network'
  | 'memory'
  | 'database';

export type EvidenceStatus = 'pending' | 'analyzing' | 'analyzed' | 'verified';

export type RelationshipType =
  | 'contains'
  | 'part_of'
  | 'related_to'
  | 'created_by'
  | 'sent_from'
  | 'sent_to'
  | 'refers_to'
  | 'has_ip'
  | 'has_email'
  | 'timestamp_near'
  | 'originates_from'
  | 'points_to';

export type CustodyAction =
  | 'collected'
  | 'transferred'
  | 'analyzed'
  | 'verified'
  | 'stored'
  | 'destroyed';

export interface Case {
  id: string;
  case_number: string;
  title: string;
  description: string;
  status: CaseStatus;
  priority: CasePriority;
  created_at: string;
  updated_at: string;
  evidence_count?: number;
}

export interface Evidence {
  id: string;
  case_id: string;
  case_number?: string;
  case_title?: string;
  title: string;
  evidence_type: EvidenceType;
  description: string;
  filename: string;
  file_path: string;
  file_size: number;
  file_hash_md5: string;
  file_hash_sha256: string;
  source: string;
  collected_by: string;
  collected_date: string;
  status: EvidenceStatus;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Relationship {
  id: string;
  source_id: string;
  target_id: string;
  relationship_type: RelationshipType;
  description: string;
  confidence_score: number;
  created_at: string;
  created_by: string;
  source_title?: string;
  target_title?: string;
  source_type?: EvidenceType;
  target_type?: EvidenceType;
}

export interface ChainOfCustody {
  id: string;
  evidence_id: string;
  action: CustodyAction;
  from_user: string;
  to_user: string;
  notes: string;
  location: string;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface AuditLog {
  id: string;
  action: string;
  user: string;
  details: string;
  created_at: string;
}

export interface VerificationResult {
  is_valid: boolean;
  file_exists: boolean;
  stored_md5: string;
  calculated_md5: string;
  stored_sha256: string;
  calculated_sha256: string;
  verified_at: string;
  message: string;
}

export interface DashboardStats {
  total_cases: number;
  open_cases: number;
  total_evidence: number;
  verified_evidence: number;
  total_relationships: number;
  evidence_by_type: Record<EvidenceType, number>;
  evidence_by_status: Record<EvidenceStatus, number>;
  cases_by_priority: Record<CasePriority, number>;
  cases_by_status: Record<CaseStatus, number>;
  recent_evidences: Evidence[];
  recent_cases: Case[];
}
