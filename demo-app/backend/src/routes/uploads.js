const router  = require('express').Router();
const multer  = require('multer');
const path    = require('path');
const pool    = require('../db/pool');
const auth    = require('../middleware/auth');

// ─── Multer Storage ───────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, '/app/uploads'),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext    = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const extOk   = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimeOk  = allowed.test(file.mimetype);
  if (extOk && mimeOk) return cb(null, true);
  cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// ─── POST /api/uploads ────────────────────────────────────────
router.post('/', auth, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Image file is required' });
  }

  const { description } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO uploads (user_id, filename, original_name, description, file_size)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        req.user.id,
        req.file.filename,
        req.file.originalname,
        description || '',
        req.file.size,
      ]
    );
    res.status(201).json({ upload: result.rows[0] });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── GET /api/uploads ─────────────────────────────────────────
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.filename, u.original_name, u.description, u.file_size, u.created_at
       FROM uploads u
       WHERE u.user_id = $1
       ORDER BY u.created_at DESC`,
      [req.user.id]
    );
    res.json({ uploads: result.rows });
  } catch (err) {
    console.error('Fetch uploads error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── DELETE /api/uploads/:id ──────────────────────────────────
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM uploads WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Upload not found' });
    }
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
