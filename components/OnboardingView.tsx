import React, { useState } from 'react';
import { UserProfile, PostTone, LanguageOption } from '../types';
import { analyzeProfileForTopics } from '../services/geminiService';
import { ArrowRight, User, Globe, FileText, Check, Plus, Upload, Sparkles, X, Languages } from 'lucide-react';

interface OnboardingViewProps {
  onComplete: (profile: UserProfile) => void;
}

const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [resumePdf, setResumePdf] = useState<string | undefined>(undefined);
  const [resumeName, setResumeName] = useState('');
  const [website, setWebsite] = useState('');
  
  // Settings
  const [language, setLanguage] = useState<LanguageOption>('ES');
  const [tone, setTone] = useState<PostTone>(PostTone.PROFESSIONAL);
  const [headshot, setHeadshot] = useState<string | null>(null);
  
  // Topics State
  const [suggestedTopics, setSuggestedTopics] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [customTopic, setCustomTopic] = useState('');

  // Handlers
  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
        setResumeName(file.name);
        const reader = new FileReader();
        reader.onloadend = () => {
            setResumePdf(reader.result as string);
        };
        reader.readAsDataURL(file);
    } else {
        alert("Por favor sube un archivo PDF válido.");
    }
  };

  const handleHeadshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setHeadshot(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!resumePdf && !website) {
        alert("Necesitamos tu Resume (PDF) o tu Website para analizarte.");
        return;
    }
    setIsLoading(true);
    try {
      const topics = await analyzeProfileForTopics(resumePdf, website);
      setSuggestedTopics(topics);
      setStep(2);
    } catch (e) {
      alert("Error analizando perfil. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTopic = (t: string) => {
    if (selectedTopics.includes(t)) {
      setSelectedTopics(selectedTopics.filter(i => i !== t));
    } else {
      setSelectedTopics([...selectedTopics, t]);
    }
  };

  const addCustomTopic = () => {
    if (customTopic && !selectedTopics.includes(customTopic)) {
      setSelectedTopics([...selectedTopics, customTopic]);
      setCustomTopic('');
    }
  };

  const finishOnboarding = () => {
    const profile: UserProfile = {
      name,
      role,
      resumePdfData: resumePdf,
      website,
      selectedTopics,
      tone,
      language,
      headshotUrl: headshot || undefined
    };
    onComplete(profile);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col md:flex-row">
        
        {/* Sidebar Info */}
        <div className="bg-blue-600 p-8 md:w-1/3 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            <div className="relative z-10">
                <div className="flex items-center gap-2 font-bold text-2xl mb-8">
                    <span className="bg-white text-blue-600 px-2 py-1 rounded">Li</span> LinkAI
                </div>
                <h1 className="text-3xl font-bold mb-4">Onboarding Inteligente</h1>
                <p className="text-blue-100 text-sm">
                   {step === 1 && "Sube tu CV para que la IA extraiga tus pilares de autoridad."}
                   {step === 2 && "Selecciona las áreas macro donde quieres posicionarte."}
                   {step === 3 && "Define tu identidad visual y el idioma de tu audiencia."}
                </p>
            </div>
            <div className="relative z-10 flex gap-2 mt-8">
                <div className={`h-2 w-full rounded-full transition-colors ${step >= 1 ? 'bg-white' : 'bg-blue-800'}`}></div>
                <div className={`h-2 w-full rounded-full transition-colors ${step >= 2 ? 'bg-white' : 'bg-blue-800'}`}></div>
                <div className={`h-2 w-full rounded-full transition-colors ${step >= 3 ? 'bg-white' : 'bg-blue-800'}`}></div>
            </div>
        </div>

        <div className="p-8 md:p-12 md:w-2/3 bg-white">
          
          {/* STEP 1: UPLOAD & IDENTITY */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-2xl font-bold text-gray-900">¿Quién eres profesionalmente?</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Nombre</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Tu nombre" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Rol / Título</label>
                  <input type="text" value={role} onChange={e => setRole(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej: Head of Growth" />
                </div>
              </div>

              {/* PDF UPLOAD */}
              <div className="border-2 border-dashed border-blue-100 rounded-xl p-6 bg-blue-50/50 text-center hover:bg-blue-50 transition-colors relative">
                  <input type="file" accept="application/pdf" onChange={handlePdfUpload} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                  <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2">
                          <FileText size={24} />
                      </div>
                      {resumePdf ? (
                          <div className="flex items-center gap-2 text-blue-800 font-medium">
                              <Check size={16} /> {resumeName}
                          </div>
                      ) : (
                          <>
                            <h3 className="font-bold text-gray-700">Sube tu Resume / CV (PDF)</h3>
                            <p className="text-xs text-gray-500 mt-1">La IA leerá tu experiencia para sacar los temas.</p>
                          </>
                      )}
                  </div>
              </div>

              <div>
                 <label className="block text-xs font-bold uppercase text-gray-500 mb-1 flex items-center gap-2"><Globe size={14}/> Website / LinkedIn URL (Opcional)</label>
                 <input type="text" value={website} onChange={e => setWebsite(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none" placeholder="https://..." />
                 <p className="text-[10px] text-gray-400 mt-1">Usaremos esto para contexto adicional.</p>
              </div>

              <button 
                onClick={handleAnalyze} 
                disabled={!name || (!resumePdf && !website) || isLoading}
                className="w-full mt-4 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
              >
                {isLoading ? <Sparkles className="animate-spin" /> : <Sparkles />}
                {isLoading ? "Analizando Documento..." : "Extraer Pilares de Contenido"}
              </button>
            </div>
          )}

          {/* STEP 2: HIGH LEVEL TOPICS */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
               <div>
                <h2 className="text-2xl font-bold text-gray-900">Tus Territorios de Autoridad</h2>
                <p className="text-gray-500 text-sm mt-1">Hemos desglosado tu perfil en estas macro-áreas. Elige tus favoritas.</p>
              </div>

              <div className="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto p-1">
                {suggestedTopics.map((t, idx) => {
                  const isSelected = selectedTopics.includes(t);
                  return (
                    <button
                      key={idx}
                      onClick={() => toggleTopic(t)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all border shadow-sm
                        ${isSelected 
                          ? 'bg-blue-600 border-blue-600 text-white transform scale-105' 
                          : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'}
                      `}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
              
              <div className="flex gap-2 items-center border-t border-gray-100 pt-4">
                <input 
                  type="text" 
                  value={customTopic}
                  onChange={e => setCustomTopic(e.target.value)}
                  placeholder="Agregar otro pilar (ej: Sostenibilidad)..."
                  className="flex-1 p-2 bg-gray-50 border rounded-lg text-sm outline-none"
                  onKeyDown={e => e.key === 'Enter' && addCustomTopic()}
                />
                <button onClick={addCustomTopic} className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-gray-600"><Plus size={20}/></button>
              </div>

              <div className="flex justify-between mt-8">
                <button onClick={() => setStep(1)} className="text-gray-500 hover:text-gray-900 font-medium text-sm">Atrás</button>
                <button 
                  onClick={() => setStep(3)} 
                  disabled={selectedTopics.length === 0}
                  className="py-3 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-200"
                >
                  Siguiente <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: VISUALS, LANG & TONE */}
          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Configuración de Estilo</h2>
                <p className="text-gray-500 text-sm">Define cómo se verá y leerá tu contenido.</p>
              </div>

              {/* Language Toggle */}
              <div>
                 <label className="block text-xs font-bold uppercase text-gray-500 mb-2 flex items-center gap-2">
                    <Languages size={14}/> Idioma del Contenido
                 </label>
                 <div className="flex bg-gray-100 p-1 rounded-xl w-full">
                    {(['ES', 'EN', 'MIX'] as LanguageOption[]).map((opt) => (
                        <button
                            key={opt}
                            onClick={() => setLanguage(opt)}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${language === opt ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            {opt === 'ES' ? '🇪🇸 Español' : opt === 'EN' ? '🇺🇸 English' : '🌎 Mix/Spanglish'}
                        </button>
                    ))}
                 </div>
              </div>

              {/* Headshot Upload */}
              <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-xl bg-gray-50">
                 <div className="relative group cursor-pointer shrink-0">
                    <div className="w-20 h-20 rounded-xl bg-gray-200 overflow-hidden border-2 border-white shadow-sm flex items-center justify-center">
                        {headshot ? (
                        <img src={headshot} alt="Headshot" className="w-full h-full object-cover" />
                        ) : (
                        <User size={32} className="text-gray-400" />
                        )}
                    </div>
                    <input type="file" accept="image/*" onChange={handleHeadshotUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                 </div>
                 <div>
                    <h4 className="font-bold text-gray-900 text-sm">Foto de Referencia (Headshot)</h4>
                    <p className="text-xs text-gray-500 mt-1 mb-2">
                        La IA usará esta cara para generar fotos "personales" realistas en entornos de oficina o conferencias.
                    </p>
                    {!headshot && <div className="text-[10px] text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block">Recomendado subir foto</div>}
                 </div>
              </div>

              {/* Tone Selection */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Tono Predominante</label>
                <select 
                    value={tone} 
                    onChange={(e) => setTone(e.target.value as PostTone)}
                    className="w-full p-3 bg-white border border-gray-200 rounded-lg outline-none text-sm font-medium"
                >
                    {Object.values(PostTone).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="flex justify-between mt-8">
                <button onClick={() => setStep(2)} className="text-gray-500 hover:text-gray-900 font-medium text-sm">Atrás</button>
                <button 
                  onClick={finishOnboarding} 
                  className="py-3 px-8 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-green-200"
                >
                  <Check size={18} /> Crear Tablero
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default OnboardingView;