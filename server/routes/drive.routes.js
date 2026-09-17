import express from 'express';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const router = express.Router();

function getGoogleAuth() {
  const scopes = ['https://www.googleapis.com/auth/drive.readonly'];
  const rawCredentials = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

  // Producción (Vercel): la credencial se guarda cifrada como variable de entorno.
  if (rawCredentials) {
    try {
      const credentials = JSON.parse(rawCredentials);
      if (credentials.private_key) {
        credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
      }
      return new google.auth.GoogleAuth({ credentials, scopes });
    } catch {
      const error = new Error('GOOGLE_SERVICE_ACCOUNT_JSON no contiene un JSON de cuenta de servicio válido.');
      error.statusCode = 500;
      throw error;
    }
  }

  // Alternativa útil cuando el proveedor no acepta JSON multilínea como variable.
  if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) {
    return new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n')
      },
      scopes
    });
  }

  // Solo para desarrollo local; este archivo está ignorado por Git y no llega a Vercel.
  const credsPath = path.join(process.cwd(), 'server', 'credentials.json');
  if (fs.existsSync(credsPath)) {
    return new google.auth.GoogleAuth({ keyFile: credsPath, scopes });
  }

  const error = new Error('Faltan las credenciales de Google Drive. Configura GOOGLE_SERVICE_ACCOUNT_JSON en Vercel.');
  error.statusCode = 500;
  throw error;
}

// Ruta para sincronizar con Google Drive
router.post('/sync', async (req, res) => {
  try {
    const { folderId } = req.body; // El ID de la carpeta principal
    if (!folderId) {
      return res.status(400).json({ success: false, message: 'Falta folderId' });
    }

    // Autenticación con Google Drive
    const auth = getGoogleAuth();

    const drive = google.drive({ version: 'v3', auth });

    // Función recursiva para obtener todo el árbol de archivos
    async function scanFolder(id, folderName, pathArray = []) {
      const response = await drive.files.list({
        q: `'${id}' in parents and trashed=false`,
        fields: 'files(id, name, mimeType, webViewLink, iconLink, size, createdTime)',
        orderBy: 'folder, name'
      });

      const files = response.data.files || [];
      const currentPath = [...pathArray, folderName];
      const category = currentPath[1] || 'General';

      let tree = {
        id,
        name: folderName,
        isFolder: true,
        children: []
      };

      let flatDocuments = [];

      for (const file of files) {
        if (file.mimeType === 'application/vnd.google-apps.folder') {
          // Es una subcarpeta
          const subfolderData = await scanFolder(file.id, file.name, currentPath);
          tree.children.push(subfolderData.tree);
          flatDocuments = flatDocuments.concat(subfolderData.flatDocuments);
        } else {
          // Es un archivo
          const ext = file.name.split('.').pop()?.toLowerCase() || '';
          const doc = {
            id: file.id,
            name: file.name,
            type: ext,
            category: category,
            url: file.webViewLink,
            viewUrl: file.webViewLink,
            size: file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Desconocido',
            updatedAt: file.createdTime?.split('T')[0] || new Date().toISOString().split('T')[0],
            isFolder: false,
            parentId: id
          };
          
          tree.children.push(doc);
          flatDocuments.push(doc);
        }
      }

      return { tree, flatDocuments };
    }

    // Escanear la carpeta raíz
    const { tree, flatDocuments } = await scanFolder(folderId, 'Documentos Valle Pacora', []);

    res.json({
      success: true,
      data: {
        tree,
        documents: flatDocuments
      }
    });

  } catch (error) {
    console.error('Error al sincronizar con Drive:', error);
    res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Error de sincronización con Google Drive' });
  }
});

export default router;
