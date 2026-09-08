import { Router } from 'express';
import { db } from '../db/database.js';

const router = Router();

// GET /api/proformas - Listar todas las proformas
router.get('/', async (req, res) => {
  try {
    const list = await db.getProformas();
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/proformas/token/:token - Obtener proforma por token público (para vista cliente)
router.get('/token/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const proforma = await db.getProformaByToken(token);
    if (!proforma) {
      return res.status(404).json({ success: false, error: 'Proforma no encontrada o enlace expirado' });
    }
    res.json({ success: true, data: proforma });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/proformas/:id - Obtener proforma por ID o código
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const proforma = await db.getProformaById(id);
    if (!proforma) {
      return res.status(404).json({ success: false, error: 'Proforma no encontrada' });
    }
    res.json({ success: true, data: proforma });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/proformas - Crear nueva proforma
router.post('/', async (req, res) => {
  try {
    const proformaData = req.body;
    if (!proformaData.client?.name && !proformaData.code) {
      return res.status(400).json({ success: false, error: 'Datos de proforma incompletos' });
    }
    const created = await db.createProforma(proformaData);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/proformas/:id - Actualizar proforma completa
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await db.updateProforma(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Proforma no encontrada para actualizar' });
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/proformas/:id/status - Cambiar estado (borrador, enviada, aprobada, rechazada)
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, error: 'El campo status es obligatorio' });
    }
    const updated = await db.updateProforma(id, { status });
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Proforma no encontrada' });
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/proformas/:id/duplicate - Duplicar proforma
router.post('/:id/duplicate', async (req, res) => {
  try {
    const { id } = req.params;
    const original = await db.getProformaById(id);
    if (!original) {
      return res.status(404).json({ success: false, error: 'Proforma no encontrada para duplicar' });
    }

    const all = await db.getProformas();
    const nextCode = 1040 + all.length + 1;
    const duplicatedData = {
      ...original,
      id: `cot-${nextCode}`,
      code: `#COT-${nextCode}`,
      status: 'borrador',
      createdAt: new Date().toISOString(),
      formattedDate: new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }),
      publicToken: `cot-${nextCode}-${Math.random().toString(36).substring(2, 7)}`
    };

    const created = await db.createProforma(duplicatedData);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/proformas/:id - Eliminar proforma
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await db.deleteProforma(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Proforma no encontrada para eliminar' });
    }
    res.json({ success: true, message: 'Proforma eliminada correctamente' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
