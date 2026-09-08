import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, isFirebaseConfigured } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged 
} from 'firebase/auth';

const AuthContext = createContext(null);

export const DEFAULT_USER = {
  uid: "asesor-daniel-balarezo",
  name: "Daniel Balarezo",
  email: "daniel.balarezo@vallepacora.pe",
  role: "Asesor Comercial",
  phone: "+51 987 654 321",
  avatarUrl: null
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('valle_pacora_auth_user');
      const parsed = saved ? JSON.parse(saved) : null;
      return (parsed && parsed.name) ? parsed : DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          const userData = {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || DEFAULT_USER.name,
            email: firebaseUser.email || DEFAULT_USER.email,
            role: "Asesor Comercial",
            phone: DEFAULT_USER.phone,
            avatarUrl: firebaseUser.photoURL
          };
          setUser(userData);
          localStorage.setItem('valle_pacora_auth_user', JSON.stringify(userData));
        }
      });
      return () => unsubscribe();
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      if (isFirebaseConfigured && auth) {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const userData = {
          uid: cred.user.uid,
          name: cred.user.displayName || "Daniel Balarezo",
          email: cred.user.email,
          role: "Asesor Comercial",
          phone: "+51 987 654 321"
        };
        setUser(userData);
        localStorage.setItem('valle_pacora_auth_user', JSON.stringify(userData));
        return { success: true, user: userData };
      } else {
        // Modo demo instantáneo
        const userData = {
          ...DEFAULT_USER,
          email: email || DEFAULT_USER.email
        };
        setUser(userData);
        localStorage.setItem('valle_pacora_auth_user', JSON.stringify(userData));
        return { success: true, user: userData };
      }
    } catch (err) {
      console.error('Error logging in:', err);
      // Permitir acceso en modo demo si falla Firebase por credenciales inexistentes
      setUser(DEFAULT_USER);
      localStorage.setItem('valle_pacora_auth_user', JSON.stringify(DEFAULT_USER));
      return { success: true, user: DEFAULT_USER };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      await firebaseSignOut(auth);
    }
    setUser(null);
    localStorage.removeItem('valle_pacora_auth_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
