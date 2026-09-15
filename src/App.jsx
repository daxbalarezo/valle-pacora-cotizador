import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import CreateProforma from './pages/CreateProforma';
import Clients from './pages/Clients';
import Templates from './pages/Templates';
import Settings from './pages/Settings';
import Documents from './pages/Documents';
import PublicView from './pages/PublicView';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/p/:token" element={<PublicView />} />
        
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="crear" element={<CreateProforma />} />
          <Route path="clientes" element={<Clients />} />
          <Route path="plantillas" element={<Templates />} />
          <Route path="documentos" element={<Documents />} />
          <Route path="configuracion" element={<Settings />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
