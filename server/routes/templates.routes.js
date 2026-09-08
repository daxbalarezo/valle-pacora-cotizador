import { Router } from 'express';
import { db } from '../db/database.js';

const router = Router();

// GET /api/templates - Listar plantillas de cotización (Palta y Arándano)
router.get('/', async (req, res) => {
  try {
    const list = await db.getTemplates();
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/templates - Crear plantilla
router.post('/', async (req, res) => {
  try {
    const tplData = req.body;
    if (!tplData.title) {
      return res.status(400).json({ success: false, error: 'El título de la plantilla es obligatorio' });
    }
    const created = await db.createTemplate(tplData);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/templates/:id - Actualizar plantilla
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await db.updateTemplate(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Plantilla no encontrada para actualizar' });
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/templates/:id - Eliminar plantilla
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await db.deleteTemplate(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Plantilla no encontrada para eliminar' });
    }
    res.json({ success: true, message: 'Plantilla eliminada correctamente' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
