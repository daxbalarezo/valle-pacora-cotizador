import React, { createContext, useContext, useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { generateToken } from '../utils/formatters';

const GlobalContext = createContext();

export function GlobalProvider({ children }) {
  const [proformas, setProformas] = useState(() => storageService.getProformasSync());
  const [clients, setClients] = useState(() => storageService.getClientsSync());
  const [templates, setTemplates] = useState(() => storageService.getTemplatesSync());
  const [config, setConfig] = useState(() => storageService.getConfigSync());
  const [advisors, setAdvisors] = useState(() => storageService.getAdvisorsSync());
  const [properties, setProperties] = useState(() => storageService.getProperties());
  const [loading, setLoading] = useState(false);
  
  const [selectedProforma, setSelectedProforma] = useState(null);

  const refreshData = async () => {
    setLoading(true);
    const list = await storageService.getProformas();
    setProformas(list);
    const clientsList = await storageService.getClients();
    setClients(clientsList);
    const advisorsList = await storageService.getAdvisors();
    setAdvisors(advisorsList);
    setTemplates(storageService.getTemplatesSync());
    setProperties(storageService.getProperties());
    setConfig(storageService.getConfigSync());
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleSaveProforma = async (proformaToSave) => {
    const saved = await storageService.saveProforma(proformaToSave);
    const updatedList = await storageService.getProformas();
    const updatedClients = await storageService.getClients();
    setProformas(updatedList);
    setClients(updatedClients);
    setSelectedProforma(saved);
    return saved;
  };

  const handleDuplicateProforma = async (id) => {
    await storageService.duplicateProforma(id);
    const updated = await storageService.getProformas();
    setProformas(updated);
  };

  const handleChangeStatus = async (id, newStatus) => {
    await storageService.updateStatus(id, newStatus);
    const updated = await storageService.getProformas();
    setProformas(updated);
  };

  const handleDeleteProforma = async (id) => {
    const item = (proformas || []).find(p => p.id === id || p.code === id);
    const label = item ? `${item.code} (${item.client?.name || 'Cliente'})` : id;
    if (window.confirm(`¿Estás seguro de eliminar la proforma ${label}?`)) {
      await storageService.deleteProforma(id);
      const updated = await storageService.getProformas();
      setProformas(updated);
    }
  };

  const handleNewClient = async (clientData) => {
    await storageService.saveClient(clientData);
    setClients(storageService.getClientsSync());
  };

  const handleEditClient = async (clientData) => {
    await storageService.saveClient(clientData);
    setClients(storageService.getClientsSync());
  };

  const handleDeleteClient = async (clientId) => {
    await storageService.deleteClient(clientId);
    setClients(storageService.getClientsSync());
  };

  const handleNewTemplate = async (tplData) => {
    await storageService.saveTemplate(tplData);
    setTemplates(storageService.getTemplatesSync());
  };

  const handleEditTemplate = async (tplData) => {
    await storageService.saveTemplate(tplData);
    setTemplates(storageService.getTemplatesSync());
  };

  const handleDeleteTemplate = async (tplId) => {
    await storageService.deleteTemplate(tplId);
    setTemplates(storageService.getTemplatesSync());
  };

  const handleSaveConfig = async (newConfig) => {
    await storageService.saveConfig(newConfig);
    setConfig(storageService.getConfigSync());
  };

  const value = {
    proformas,
    clients,
    templates,
    config,
    advisors,
    properties,
    loading,
    selectedProforma,
    setSelectedProforma,
    refreshData,
    handleSaveProforma,
    handleDuplicateProforma,
    handleChangeStatus,
    handleDeleteProforma,
    handleNewClient,
    handleEditClient,
    handleDeleteClient,
    handleNewTemplate,
    handleEditTemplate,
    handleDeleteTemplate,
    handleSaveConfig
  };

  return (
    <GlobalContext.Provider value={value}>
      {children}
    </GlobalContext.Provider>
  );
}

export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useGlobalContext must be used within a GlobalProvider');
  }
  return context;
};
