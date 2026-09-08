import { Router } from 'express';
import { db } from '../db/database.js';

const router = Router();

// GET /api/config - Obtener configuración general (membrete Roble Constructora, cuentas BCP/BBVA, asesor, plantilla WA)
router.get('/', async (req, res) => {
  try {
    const config = await db.getConfig();
    res.json({ success: true, data: config });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/config - Actualizar configuración
router.put('/', async (req, res) => {
  try {
    const newConfig = req.body;
    const updated = await db.updateConfig(newConfig);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
