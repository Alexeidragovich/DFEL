import express from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.js';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Storage directory setup for Multer
const STORAGE_DIR = path.join(process.cwd(), 'storage', 'evidence');
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, STORAGE_DIR);
  },
  filename: (req, file, cb) => {
    // Unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const safeBaseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_\-]/g, '_');
    cb(null, `${safeBaseName}_${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB max file size
});

// Serve uploaded evidence files static route with security
app.use('/storage/evidence', express.static(STORAGE_DIR));

// API ROUTES

// Dashboard Stats
app.get('/api/dashboard/stats', (req, res) => {
  try {
    const stats = db.getDashboardStats();
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Cases CRUD
app.get('/api/cases', (req, res) => {
  try {
    const { status, priority, search } = req.query;
    const cases = db.getCases({
      status: status as string,
      priority: priority as string,
      search: search as string,
    });
    res.json(cases);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/cases/:id', (req, res) => {
  try {
    const caseItem = db.getCaseById(req.params.id);
    if (!caseItem) {
      return res.status(404).json({ error: 'القضية غير موجودة' });
    }
    const evidences = db.getEvidences({ case_id: req.params.id });
    const relationships = db.getRelationships(req.params.id);

    res.json({
      case: caseItem,
      evidences,
      relationships,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/cases', (req, res) => {
  try {
    const { title, description, priority, status, case_number } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'عنوان القضية مطلوب' });
    }
    const newCase = db.createCase({
      title,
      description,
      priority,
      status,
      case_number,
    });
    res.status(201).json(newCase);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/cases/:id', (req, res) => {
  try {
    const updated = db.updateCase(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'القضية غير موجودة' });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/cases/:id', (req, res) => {
  try {
    const deleted = db.deleteCase(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'القضية غير موجودة' });
    }
    res.json({ success: true, message: 'تم حذف القضية بجميع أدلتها بنجاح' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Evidence CRUD & Upload
app.get('/api/evidence', (req, res) => {
  try {
    const { case_id, evidence_type, status, search, tag } = req.query;
    const list = db.getEvidences({
      case_id: case_id as string,
      evidence_type: evidence_type as string,
      status: status as string,
      search: search as string,
      tag: tag as string,
    });
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/evidence/upload', upload.single('file'), (req, res) => {
  try {
    const { case_id, title, evidence_type, description, source, collected_by, tags, status } =
      req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'يرجى اختيار ملف الدليل الرقمي للرفع' });
    }
    if (!case_id) {
      return res.status(400).json({ error: 'يرجى اختيار القضية المرتبطة بالدليل' });
    }
    if (!title) {
      return res.status(400).json({ error: 'عنوان الدليل مطلوب' });
    }

    const fileBuffer = fs.readFileSync(req.file.path);
    let parsedTags: string[] = [];
    if (typeof tags === 'string') {
      parsedTags = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
    } else if (Array.isArray(tags)) {
      parsedTags = tags;
    }

    const relPath = path.relative(process.cwd(), req.file.path);

    const newEvidence = db.addEvidence(
      {
        filename: req.file.originalname,
        path: relPath,
        size: req.file.size,
        buffer: fileBuffer,
      },
      {
        case_id,
        title,
        evidence_type,
        description,
        source,
        collected_by,
        tags: parsedTags,
        status,
      }
    );

    res.status(201).json(newEvidence);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/evidence/:id', (req, res) => {
  try {
    const ev = db.getEvidenceById(req.params.id);
    if (!ev) {
      return res.status(404).json({ error: 'الدليل غير موجود' });
    }
    const custody = db.getCustodyLogs(req.params.id);
    const relationships = db.getRelationships(undefined, req.params.id);

    res.json({
      evidence: ev,
      custody,
      relationships,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/evidence/:id', (req, res) => {
  try {
    const updated = db.updateEvidence(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'الدليل غير موجود' });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/evidence/:id', (req, res) => {
  try {
    const deleted = db.deleteEvidence(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'الدليل غير موجود' });
    }
    res.json({ success: true, message: 'تم حذف الدليل والملف بنجاح' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Verify Evidence Integrity
app.post('/api/evidence/:id/verify', (req, res) => {
  try {
    const result = db.verifyEvidenceIntegrity(req.params.id);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Download Evidence File
app.get('/api/evidence/:id/download', (req, res) => {
  try {
    const ev = db.getEvidenceById(req.params.id);
    if (!ev) {
      return res.status(404).send('الدليل غير موجود');
    }
    const absPath = path.isAbsolute(ev.file_path)
      ? ev.file_path
      : path.join(process.cwd(), ev.file_path);

    if (!fs.existsSync(absPath)) {
      return res.status(404).send('ملف الدليل غير موجود على التخزين');
    }

    res.download(absPath, ev.filename);
  } catch (err: any) {
    res.status(500).send(err.message);
  }
});

// Relationships
app.get('/api/relationships', (req, res) => {
  try {
    const { case_id, evidence_id } = req.query;
    const rels = db.getRelationships(case_id as string, evidence_id as string);
    res.json(rels);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/relationships', (req, res) => {
  try {
    const { source_id, target_id, relationship_type, description, confidence_score, created_by } =
      req.body;

    if (!source_id || !target_id) {
      return res.status(400).json({ error: 'يرجى تحديد الدليل المصدر والدليل الهدف' });
    }
    if (source_id === target_id) {
      return res.status(400).json({ error: 'لا يمكن ربط الدليل بنفسه' });
    }

    const newRel = db.createRelationship({
      source_id,
      target_id,
      relationship_type,
      description,
      confidence_score,
      created_by,
    });

    res.status(201).json(newRel);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/relationships/:id', (req, res) => {
  try {
    const deleted = db.deleteRelationship(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'العلاقة غير موجودة' });
    }
    res.json({ success: true, message: 'تم حذف العلاقة' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Graph Endpoint for Vis.js
app.get('/api/relationships/graph', (req, res) => {
  try {
    const { case_id } = req.query;
    const evidences = db.getEvidences(case_id ? { case_id: case_id as string } : undefined);
    const relationships = db.getRelationships(case_id as string);

    const nodes = evidences.map((e) => ({
      id: e.id,
      label: e.title,
      type: e.evidence_type,
      case_number: e.case_number,
      md5: e.file_hash_md5,
      status: e.status,
      filename: e.filename,
    }));

    const edges = relationships.map((r) => ({
      id: r.id,
      from: r.source_id,
      to: r.target_id,
      label: r.relationship_type,
      description: r.description,
      confidence: r.confidence_score,
    }));

    res.json({ nodes, edges });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Chain of Custody
app.get('/api/custody/:evidence_id', (req, res) => {
  try {
    const custody = db.getCustodyLogs(req.params.evidence_id);
    res.json(custody);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/custody', (req, res) => {
  try {
    const { evidence_id, action, from_user, to_user, notes, location } = req.body;
    if (!evidence_id || !action || !from_user || !to_user) {
      return res.status(400).json({ error: 'جميع الحقول الأساسية مطلوبة' });
    }

    const log = db.addCustodyLog({
      evidence_id,
      action,
      from_user,
      to_user,
      notes,
      location,
    });

    res.status(201).json(log);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Tags & Audit Logs
app.get('/api/tags', (req, res) => {
  try {
    res.json(db.getTags());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/audit-logs', (req, res) => {
  try {
    res.json(db.getAuditLogs());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Reports CSV Exporter
app.get('/api/reports/evidence/csv', (req, res) => {
  try {
    const evidences = db.getEvidences();
    const headers = [
      'ID',
      'Case Number',
      'Title',
      'Type',
      'Filename',
      'Size (Bytes)',
      'MD5 Hash',
      'SHA256 Hash',
      'Source',
      'Collector',
      'Status',
      'Collected Date',
    ];

    const rows = evidences.map((e) => [
      `"${e.id}"`,
      `"${e.case_number || ''}"`,
      `"${e.title.replace(/"/g, '""')}"`,
      `"${e.evidence_type}"`,
      `"${e.filename.replace(/"/g, '""')}"`,
      e.file_size,
      `"${e.file_hash_md5}"`,
      `"${e.file_hash_sha256}"`,
      `"${e.source.replace(/"/g, '""')}"`,
      `"${e.collected_by.replace(/"/g, '""')}"`,
      `"${e.status}"`,
      `"${e.collected_date}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=forensics_evidence_export_${Date.now()}.csv`
    );
    res.send(csvContent);
  } catch (err: any) {
    res.status(500).send(err.message);
  }
});

// Start Server / Vite integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Digital Forensics Evidence Locker running on http://localhost:${PORT}`);
  });
}

startServer();
