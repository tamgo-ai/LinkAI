import React, { useState, useEffect } from 'react';
import { Linkedin, Check, AlertCircle, Key, Lock, Server, ExternalLink, BookOpen, Copy, Save, Globe, RefreshCw } from 'lucide-react';

interface SettingsViewProps {
  isConnected: boolean;
  onConnect: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ isConnected, onConnect }) => {
  // State for Real Credentials
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [redirectUri, setRedirectUri] = useState(''); 
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [showRealConfig, setShowRealConfig] = useState(true);

  // Detect current URL on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Remove trailing slash if present for consistency
      const currentOrigin = window.location.origin.replace(/\/$/, "");
      setRedirectUri(currentOrigin);
    }
  }, []);

  // Generate the real LinkedIn OAuth URL when inputs change
  useEffect(() => {
    if (clientId && redirectUri) {
      const scope = encodeURIComponent('openid profile w_member_social');
      const redirect = encodeURIComponent(redirectUri);
      const url = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirect}&scope=${scope}`;
      setGeneratedUrl(url);
    }
  }, [clientId, redirectUri]);

  return (
    <div className="space-y-6 pb-10">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Configuración "Real" de LinkedIn</h1>
        <p className="text-gray-500">Ingresa tus credenciales de desarrollador para generar el enlace de conexión real.</p>
      </header>

      {/* IMPORTANT: Product Selection Guide */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
        <h3 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
          <AlertCircle className="text-amber-600" size={24} />
          Paso Crucial: Solicitar Productos
        </h3>
        <p className="text-amber-800 text-sm mb-4">
          Para que tu Client ID funcione, debes ir a la pestaña <strong>Products</strong> en tu App de LinkedIn y "Solicitar Acceso" (Request Access) a estos dos productos exactos:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg border border-amber-100 shadow-sm flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded text-blue-700">
               <Globe size={20} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900">1. Share on LinkedIn</h4>
              <p className="text-xs text-gray-600 mt-1">Este producto habilita el permiso <code>w_member_social</code>. Sin esto, la API rechazará tus posts.</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-amber-100 shadow-sm flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded text-blue-700">
               <Key size={20} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900">2. Sign In with LinkedIn using OpenID Connect</h4>
              <p className="text-xs text-gray-600 mt-1">Habilita <code>openid</code> y <code>profile</code>. Necesario para hacer login.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Real Credentials Input */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Key className="text-blue-700" /> Tus Credenciales de Developer
          </h2>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded border border-blue-200">
            Datos locales (No se guardan en servidor)
          </span>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client ID</label>
              <input 
                type="text" 
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="Ej: 78a8s7d6f..."
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">Lo encuentras en la pestaña <strong>Auth</strong>.</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client Secret</label>
              <div className="relative">
                <input 
                  type="password" 
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                  placeholder="Ej: Ws8d7..."
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm pr-10"
                />
                <Lock size={16} className="absolute right-3 top-2.5 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500 mt-1">Necesario para el intercambio de token (Backend).</p>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
             <label className="block text-sm font-bold text-blue-900 mb-1">Authorized Redirect URL (Copia esto en LinkedIn)</label>
             <div className="flex gap-2">
               <input 
                  type="text" 
                  value={redirectUri}
                  onChange={(e) => setRedirectUri(e.target.value)}
                  className="flex-1 p-2 border border-blue-200 rounded text-gray-600 bg-white font-mono text-sm"
                />
                <button 
                  onClick={() => navigator.clipboard.writeText(redirectUri)}
                  className="bg-white border border-blue-200 text-blue-700 px-3 rounded hover:bg-blue-50"
                  title="Copiar URL"
                >
                  <Copy size={16} />
                </button>
             </div>
             <p className="text-xs text-blue-700 mt-2 flex items-center gap-1">
               <AlertCircle size={12} />
               Esta URL se ha detectado automáticamente. Debe coincidir <strong>exactamente</strong> con la que pongas en LinkedIn Developers &gt; Auth.
             </p>
          </div>

          {/* Generated Link Action */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Prueba de Conexión Real</h4>
            
            {!clientId ? (
              <div className="text-sm text-gray-400 italic">Ingresa un Client ID arriba para generar el enlace de prueba.</div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-gray-900 rounded-lg group relative">
                   <p className="font-mono text-xs text-green-400 break-all pr-8 line-clamp-2 hover:line-clamp-none transition-all">
                     {generatedUrl}
                   </p>
                   <button 
                    onClick={() => navigator.clipboard.writeText(generatedUrl)}
                    className="absolute right-2 top-2 text-gray-500 hover:text-white"
                   >
                     <Copy size={16} />
                   </button>
                </div>

                <div className="flex gap-4 items-center">
                  <a 
                    href={generatedUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#0077b5] hover:bg-[#006097] text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-sm"
                  >
                    <Linkedin size={18} /> Probar Login Real
                    <ExternalLink size={14} />
                  </a>
                  <p className="text-xs text-gray-500 max-w-sm">
                    Al hacer clic, irás a LinkedIn real. Si configuraste bien los productos y la URL de redirección, verás la pantalla de permisos.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Simulator Mode Toggle */}
      <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl">
        <div>
          <h4 className="font-medium text-gray-900">Modo Simulación</h4>
          <p className="text-xs text-gray-500">Activa esto si solo quieres ver cómo se ve la interfaz sin conectar una cuenta real.</p>
        </div>
        <button 
          onClick={onConnect}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isConnected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          {isConnected ? 'Simulación Activa' : 'Activar Simulación'}
        </button>
      </div>
    </div>
  );
};

export default SettingsView;