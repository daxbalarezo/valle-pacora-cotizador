import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuración de Firebase para Valle Pacora
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAYEIFhDlwqJN1yIzrpwpcAQqLmuivvw2k",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "cotizador-de-valle-pacora.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "cotizador-de-valle-pacora",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "cotizador-de-valle-pacora.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "340305506317",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:340305506317:web:b0ea1fa8e9b89d3eb42544"
};

let app = null;
let auth = null;
let db = null;
let isFirebaseConfigured = false;

if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
    isFirebaseConfigured = true;
    console.log('[Firebase] Inicializado correctamente con Firestore y Auth');
  } catch (err) {
    console.warn('[Firebase] No se pudo inicializar Firebase, operando en modo local:', err);
  }
} else {
  console.info('[Firebase] Variables de Firebase no detectadas. Operando con persistencia local de alto rendimiento.');
}

export { app, auth, db, isFirebaseConfigured };
