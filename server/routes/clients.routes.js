import { Router } from 'express';
import { db } from '../db/database.js';

const router = Router();

// GET /api/clients - Listar todos los clientes
router.get('/', async (req, res) => {
  try {
    const list = await db.getClients();
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/clients/:id - Obtener cliente por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const client = await db.getClientById(id);
    if (!client) {
      return res.status(404).json({ success: false, error: 'Cliente no encontrado' });
    }
    res.json({ success: true, data: client });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/clients - Crear nuevo cliente
router.post('/', async (req, res) => {
  try {
    const clientData = req.body;
    if (!clientData.name) {
      return res.status(400).json({ success: false, error: 'El nombre del cliente es obligatorio' });
    }
    const created = await db.createClient(clientData);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/clients/:id - Actualizar cliente
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await db.updateClient(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Cliente no encontrado para actualizar' });
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/clients/:id - Eliminar cliente
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await db.deleteClient(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Cliente no encontrado para eliminar' });
    }
    res.json({ success: true, message: 'Cliente eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
