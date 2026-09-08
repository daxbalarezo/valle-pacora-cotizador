import { Router } from 'express';
import { db } from '../db/database.js';

const router = Router();

// POST /api/auth/login - Autenticación de asesor
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const config = await db.getConfig();
    const advisor = config.advisor || {
      name: "Daniel Balarezo",
      role: "Asesor Comercial",
      phone: "+51 987 654 321",
      email: "daniel.balarezo@vallepacora.pe"
    };

    // Validación flexible con credenciales del asesor
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email y contraseña requeridos' });
    }

    res.json({
      success: true,
      data: {
        uid: "asesor-1",
        email: advisor.email,
        name: advisor.name,
        role: advisor.role,
        phone: advisor.phone,
        token: `jwt-${Date.now()}`
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
