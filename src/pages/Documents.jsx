import React, { useState, useMemo } from 'react';
import Sidebar from '../components/layout/Sidebar';
import { 
  PORTFOLIO_DOCUMENTS, 
  PORTFOLIO_TREE, 
  CATEGORIES, 
  ROOT_FOLDER_URL 
} from '../data/portfolioDocuments';
import { 
  Search, 
  ExternalLink, 
  Download, 
  Copy, 
  Check, 
  FileText, 
  Map, 
  Building2, 
  Truck, 
  ShieldCheck, 
  MessageCircle,
  Folder,
  FolderOpen,
  ChevronRight,
  ArrowLeft,
  LayoutGrid,
  ListFilter
} from 'lucide-react';

export default function Documents({ onNavigateTab, onNewProforma }) {
  const [viewMode, setViewMode] = useState('explorer'); // 'explorer' | 'list'
  const [folderHistory, setFolderHistory] = useState([PORTFOLIO_TREE]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [copiedId, setCopiedId] = useState(null);

  // Carpeta activa en el explorador
  const currentFolder = folderHistory[folderHistory.length - 1];

  // Navegación en el explorador
  const handleEnterFolder = (folder) => {
    setFolderHistory(prev => [...prev, folder]);
  };

  const handleGoBack = () => {
    if (folderHistory.length > 1) {
      setFolderHistory(prev => prev.slice(0, prev.length - 1));
    }
  };

  const handleJumpBreadcrumb = (index) => {
    setFolderHistory(prev => prev.slice(0, index + 1));
  };

  // Filtrado reactivo para la vista de lista / buscador global
  const filteredDocuments = useMemo(() => {
    return PORTFOLIO_DOCUMENTS.filter(doc => {
      if (selectedCategory !== 'all' && doc.category !== selectedCategory) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = doc.name.toLowerCase().includes(q);
        const matchSub = doc.subCategory.toLowerCase().includes(q);
        const matchPath = doc.path.toLowerCase().includes(q);
        if (!matchName && !matchSub && !matchPath) return false;
      }

      return true;
    });
  }, [searchQuery, selectedCategory]);

  // Copiar link al portapapeles
  const handleCopyLink = (doc) => {
    navigator.clipboard.writeText(doc.viewUrl);
    setCopiedId(doc.id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2500);
  };

  // Compartir por WhatsApp
  const handleShareWhatsApp = (doc) => {
    const text = `Hola, te comparto el documento oficial de *Valle Pacora*:\n📄 *${doc.name}*\n\nPuedes revisarlo directamente aquí:\n${doc.viewUrl}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Icono según tipo de documento
  const getFileIcon = (doc) => {
    if (doc.category === '6.PLANOS' || doc.name.toLowerCase().includes('plano')) {
      return <Map className="w-5 h-5 text-indigo-600" />;
    }
    if (doc.category?.includes('PROVEEDORES') || doc.path?.includes('PROVEEDORES')) {
      return <Truck className="w-5 h-5 text-emerald-600" />;
    }
    if (doc.category?.includes('ROBLE') || doc.category?.includes('CAMPO ITAL') || doc.path?.includes('ROBLE')) {
      return <Building2 className="w-5 h-5 text-blue-600" />;
    }
    if (doc.name.toLowerCase().includes('copia literal') || doc.name.toLowerCase().includes('minuta') || doc.name.toLowerCase().includes('posesion')) {
      return <ShieldCheck className="w-5 h-5 text-amber-600" />;
    }
    return <FileText className="w-5 h-5 text-rose-600" />;
  };

  // Elementos de la carpeta actual
  const currentSubfolders = (currentFolder?.children || []).filter(c => c.isFolder);
  const currentFiles = (currentFolder?.children || []).filter(c => !c.isFolder);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row">
      {/* Sidebar de navegación */}
      <Sidebar 
        currentTab="documentos" 
        onSelectTab={onNavigateTab}
        onNewProforma={onNewProforma}
      />

      {/* Contenedor Principal */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {/* Cabecera Principal */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-[#eef7f2] text-[#0e692e] text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Portafolio Institucional Oficial
              </span>
              <span className="text-xs text-slate-400 font-medium">
                • 74 documentos en 39 carpetas
              </span>
            </div>
            <h1 className="text-2xl font-bold font-display text-slate-900 tracking-tight">
              Portafolio y Documentación Legal
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Estructura oficial de expedientes, planos, contratos y acreditaciones de Valle Pacora.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Toggle de vistas */}
            <div className="flex items-center bg-white border border-slate-200 p-1 rounded-xl shadow-xs">
              <button
                onClick={() => { setViewMode('explorer'); setSearchQuery(''); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'explorer' && !searchQuery
                    ? 'bg-[#0e692e] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Explorador de Carpetas</span>
              </button>

              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'list' || searchQuery
                    ? 'bg-[#0e692e] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span>Todos los Archivos</span>
              </button>
            </div>

            <a
              href={ROOT_FOLDER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 text-xs font-semibold rounded-xl shadow-xs transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              <span>Abrir Drive</span>
            </a>
          </div>
        </header>

        {/* Buscador Global Siempre Visible */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs mb-6">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar en todo el portafolio (ej. plano, ANA, 10 hectáreas, copia literal, RUC)..."
              className="w-full pl-11 pr-24 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0e692e]/20 focus:border-[#0e692e] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-800 font-semibold bg-slate-200 hover:bg-slate-300 px-2.5 py-1 rounded-lg transition-colors"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>

          {/* Si está en modo lista o buscando, mostrar categorías */}
          {(viewMode === 'list' || searchQuery) && (
            <div className="flex items-center gap-2 overflow-x-auto pt-3 mt-3 border-t border-slate-100 text-xs scrollbar-thin">
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.id;
                const count = cat.id === 'all' 
                  ? PORTFOLIO_DOCUMENTS.length 
                  : PORTFOLIO_DOCUMENTS.filter(d => d.category === cat.id).length;

                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-[#0e692e] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* MODO 1: BUSCADOR ACTIVO O VISTA DE TODOS LOS ARCHIVOS */}
        {(searchQuery || viewMode === 'list') ? (
          <div>
            <div className="flex items-center justify-between mb-4 px-1">
              <p className="text-xs text-slate-500 font-medium">
                {searchQuery ? 'Resultados de búsqueda: ' : 'Todos los documentos: '}
                <span className="font-bold text-slate-900">{filteredDocuments.length} archivos</span>
              </p>
            </div>

            {filteredDocuments.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800">No se encontraron documentos</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Intenta buscar con otra palabra clave como "plano", "ANA", "minuta", o selecciona otra categoría.
                </p>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                  className="mt-4 px-4 py-2 bg-[#0e692e] text-white text-xs font-semibold rounded-xl"
                >
                  Restablecer filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredDocuments.map((doc) => (
                  <DocumentCard 
                    key={doc.id} 
                    doc={doc} 
                    isCopied={copiedId === doc.id}
                    onCopy={() => handleCopyLink(doc)}
                    onShare={() => handleShareWhatsApp(doc)}
                    getFileIcon={getFileIcon}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* MODO 2: EXPLORADOR INTERACTIVO DE CARPETAS (IDÉNTICO A GOOGLE DRIVE) */
          <div>
            {/* Barra de Migas de Pan (Breadcrumbs) y Botón Volver */}
            <div className="bg-white px-5 py-3.5 rounded-2xl border border-slate-100 shadow-xs mb-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {folderHistory.length > 1 && (
                  <button
                    onClick={handleGoBack}
                    className="mr-2 p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition-colors flex items-center gap-1 font-semibold"
                    title="Subir un nivel"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Volver</span>
                  </button>
                )}

                {folderHistory.map((f, idx) => {
                  const isCurrent = idx === folderHistory.length - 1;
                  return (
                    <React.Fragment key={f.id + idx}>
                      {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                      <button
                        onClick={() => handleJumpBreadcrumb(idx)}
                        disabled={isCurrent}
                        className={`px-2 py-1 rounded-md font-medium transition-colors ${
                          isCurrent
                            ? 'bg-[#eef7f2] text-[#0e692e] font-bold cursor-default'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        {idx === 0 ? '📁 Inicio' : f.name}
                      </button>
                    </React.Fragment>
                  );
                })}
              </div>

              <span className="text-[11px] text-slate-400 font-medium">
                {currentSubfolders.length} carpetas • {currentFiles.length} archivos
              </span>
            </div>

            {/* SECCIÓN 1: SUB-CARPETAS */}
            {currentSubfolders.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-1 flex items-center gap-1.5">
                  <Folder className="w-3.5 h-3.5 text-amber-500" />
                  <span>Carpetas ({currentSubfolders.length})</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {currentSubfolders.map((folder) => {
                    const totalChildren = folder.children?.length || 0;
                    const folderChildrenCount = folder.children?.filter(c => c.isFolder).length || 0;
                    const fileChildrenCount = folder.children?.filter(c => !c.isFolder).length || 0;

                    return (
                      <div
                        key={folder.id}
                        onClick={() => handleEnterFolder(folder)}
                        className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md hover:border-[#0e692e]/40 transition-all cursor-pointer group flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-amber-50 group-hover:bg-amber-100 flex items-center justify-center shrink-0 transition-colors">
                            <Folder className="w-5 h-5 text-amber-600 fill-amber-500/20" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#0e692e] transition-colors truncate">
                              {folder.name}
                            </h4>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {folderChildrenCount > 0 ? `${folderChildrenCount} carpetas` : ''}
                              {folderChildrenCount > 0 && fileChildrenCount > 0 ? ' • ' : ''}
                              {fileChildrenCount > 0 ? `${fileChildrenCount} archivos` : ''}
                              {totalChildren === 0 ? 'Vacío' : ''}
                            </p>
                          </div>
                        </div>

                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#0e692e] group-hover:translate-x-0.5 transition-all shrink-0" />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SECCIÓN 2: ARCHIVOS DENTRO DE LA CARPETA ACTUAL */}
            {currentFiles.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-500" />
                  <span>Archivos ({currentFiles.length})</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {currentFiles.map((doc) => (
                    <DocumentCard 
                      key={doc.id} 
                      doc={doc} 
                      isCopied={copiedId === doc.id}
                      onCopy={() => handleCopyLink(doc)}
                      onShare={() => handleShareWhatsApp(doc)}
                      getFileIcon={getFileIcon}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Carpeta vacía */}
            {currentSubfolders.length === 0 && currentFiles.length === 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                <FolderOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">Esta carpeta no contiene archivos</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// Sub-componente de Tarjeta de Documento
function DocumentCard({ doc, isCopied, onCopy, onShare, getFileIcon }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs hover:shadow-md hover:border-slate-200 transition-all flex flex-col justify-between group">
      <div className="flex items-start gap-3">
        <div className="p-2.5 bg-slate-50 group-hover:bg-slate-100 rounded-xl shrink-0 transition-colors">
          {getFileIcon(doc)}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug group-hover:text-[#0e692e] transition-colors break-words">
            {doc.name}
          </h4>
          {doc.subCategory && (
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
              {doc.subCategory}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <a
            href={doc.viewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#0e692e] hover:bg-[#0a5224] text-white rounded-lg text-xs font-semibold transition-colors"
          >
            <span>Ver</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <a
            href={doc.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
            title="Descargar archivo"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Descargar</span>
          </a>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onCopy}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              isCopied
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
            }`}
            title="Copiar enlace"
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[11px] font-semibold">¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">Copiar</span>
              </>
            )}
          </button>

          <button
            onClick={onShare}
            className="inline-flex items-center gap-1 p-1.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] rounded-lg transition-colors"
            title="Compartir por WhatsApp al cliente"
          >
            <MessageCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
