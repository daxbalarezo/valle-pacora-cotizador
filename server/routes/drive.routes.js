import express from 'express';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Ruta para sincronizar con Google Drive
router.post('/sync', async (req, res) => {
  try {
    const { folderId } = req.body; // El ID de la carpeta principal
    if (!folderId) {
      return res.status(400).json({ success: false, message: 'Falta folderId' });
    }

    const credsPath = path.join(process.cwd(), 'server', 'credentials.json');
    if (!fs.existsSync(credsPath)) {
      return res.status(500).json({ 
        success: false, 
        message: 'No se encontró credentials.json en la carpeta server. Por favor, asegúrate de haberlo descargado de Google Cloud.' 
      });
    }

    // Autenticación con Google Drive
    const auth = new google.auth.GoogleAuth({
      keyFile: credsPath,
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });

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
    res.status(500).json({ success: false, message: error.message || 'Error de sincronización con Google Drive' });
  }
});

export default router;
