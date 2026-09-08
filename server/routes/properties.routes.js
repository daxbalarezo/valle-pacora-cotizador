import { Router } from 'express';
import { db } from '../db/database.js';

const router = Router();

// GET /api/properties - Catálogo oficial de las 2 parcelas agrícolas (Palta Hass y Arándanos)
router.get('/', async (req, res) => {
  try {
    const list = await db.getProperties();
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
