import React, { useState } from 'react';
import { Sparkles, Image as ImageIcon, Send, Clock, RefreshCw, Wand2, Copy, Check, Lock, Terminal, Search, Globe, ArrowRight, UserCircle2, CalendarDays, Zap, Rocket, Newspaper, LayoutTemplate, Palette, Languages } from 'lucide-react';
import { PostTone, GeneratedContent, Post, ResearchIdea, WeeklyStrategyItem, UserProfile, ContentFormat } from '../types';
import { generatePostText, generateSmartImage, searchTrendingIdeas, generateSmartWeeklyPlan } from '../services/geminiService';

interface CreatePostViewProps {
  onSchedule: (post: Post) => void;
  isLinkedInConnected: boolean;
  userProfile: UserProfile; // Received from App
}

const CreatePostView: React.FC<CreatePostViewProps> = ({ onSchedule, isLinkedInConnected, userProfile }) => {
  const [activeTab, setActiveTab] = useState<'single' | 'autopilot'>('single');
  
  // --- SINGLE POST STATE ---
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState<PostTone>(userProfile.tone);
  const [selectedFormat, setSelectedFormat] = useState<ContentFormat>(ContentFormat.CINEMATIC_PHOTO);
  // NEW: Manual language selection for Mix profiles
  const [manualLanguage, setManualLanguage] = useState<'ES' | 'EN'>('ES'); 
  
  const [isResearching, setIsResearching] = useState(false);
  const [researchIdeas, setResearchIdeas] = useState<ResearchIdea[]>([]);
  const [showResearch, setShowResearch] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isImageGenerating, setIsImageGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showApiModal, setShowApiModal] = useState(false);
  const [apiLog, setApiLog] = useState<string[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);

  // --- AUTO PILOT STATE ---
  const [isPlanning, setIsPlanning] = useState(false);
  const [weeklyStrategy, setWeeklyStrategy] = useState<WeeklyStrategyItem[]>([]);
  const [generatedWeeklyPosts, setGeneratedWeeklyPosts] = useState<Post[]>([]);
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);

  // -------------------------
  // SINGLE POST HANDLERS
  // -------------------------

  const handleResearch = async () => {
    if (!topic) return;
    setIsResearching(true);
    setResearchIdeas([]);
    setShowResearch(true);
    try {
      const ideas = await searchTrendingIdeas(topic);
      setResearchIdeas(ideas);
    } catch (error) {
      console.error(error);
      alert("Error buscando tendencias.");
    } finally {
      setIsResearching(false);
    }
  };

  const handleSelectIdea = (idea: ResearchIdea) => {
    setTopic(idea.title);
    setResearchIdeas([]);
    setShowResearch(false);
    handleGenerate(idea.title);
  };

  const handleGenerate = async (specificTopic?: string) => {
    const finalTopic = specificTopic || topic;
    if (!finalTopic) return;

    setIsGenerating(true);
    setGeneratedContent(null);
    setGeneratedImage(null);

    try {
      // Determine language: If profile is MIX, use the manual selection. Otherwise use profile.
      const targetLang = userProfile.language === 'MIX' ? manualLanguage : userProfile.language;

      const content = await generatePostText(finalTopic, tone, userProfile, undefined, targetLang);
      setGeneratedContent(content);
      
      setIsImageGenerating(true);
      const imageUrl = await generateSmartImage(finalTopic, selectedFormat, userProfile);
      setGeneratedImage(imageUrl);
    } catch (error) {
      alert("Error generating content.");
    } finally {
      setIsGenerating(false);
      setIsImageGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!generatedContent) return;
    const fullText = `${generatedContent.headline}\n\n${generatedContent.body}\n\n${generatedContent.cta}\n\n${generatedContent.hashtags.join(' ')}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleScheduleSingle = () => {
    if (!generatedContent) return;
    const newPost: Post = {
      id: Date.now().toString(),
      topic,
      content: generatedContent,
      imageUrl: generatedImage || undefined,
      format: selectedFormat, // Use selected format
      scheduledDate: new Date(Date.now() + 86400000),
      status: 'scheduled',
      stats: { views: 0, likes: 0, comments: 0 }
    };
    onSchedule(newPost);
  };

  // -------------------------
  // AUTO PILOT HANDLERS
  // -------------------------

  const handleGenerateSmartPlan = async () => {
    setIsPlanning(true);
    setWeeklyStrategy([]);
    setGeneratedWeeklyPosts([]);
    try {
      const strategy = await generateSmartWeeklyPlan(userProfile);
      setWeeklyStrategy(strategy);
    } catch (error) {
      alert("Error al generar el plan inteligente.");
    } finally {
      setIsPlanning(false);
    }
  };

  const handleBulkGenerate = async () => {
    if (weeklyStrategy.length === 0) return;
    setIsBulkGenerating(true);
    setGeneratedWeeklyPosts([]);
    setBulkProgress(0);

    const newPosts: Post[] = [];

    for (let i = 0; i < weeklyStrategy.length; i++) {
      const item = weeklyStrategy[i];
      try {
        // Pass the item.language explicitly from the plan
        const content = await generatePostText(item.topic, item.tone, userProfile, item.newsContext, item.language);
        const imageUrl = await generateSmartImage(item.topic, item.format, userProfile);
        
        const date = new Date();
        date.setDate(date.getDate() + 1 + i);
        date.setHours(10, 0, 0, 0);

        const post: Post = {
          id: `auto-${Date.now()}-${i}`,
          topic: item.topic,
          content: content,
          imageUrl: imageUrl,
          format: item.format,
          scheduledDate: date,
          status: 'draft',
          stats: { views: 0, likes: 0, comments: 0 }
        };

        newPosts.push(post);
        setGeneratedWeeklyPosts([...newPosts]);
        setBulkProgress(i + 1);

      } catch (e) {
        console.error(`Failed to generate day ${i}`, e);
      }
    }

    setIsBulkGenerating(false);
  };

  const handleConfirmWeeklyPlan = () => {
    generatedWeeklyPosts.forEach(post => {
      onSchedule({ ...post, status: 'scheduled' });
    });
    alert("¡Semana completa agendada exitosamente!");
    setWeeklyStrategy([]);
    setGeneratedWeeklyPosts([]);
    setBulkProgress(0);
  };

  // API Sim
  const simulateApiPublish = () => { 
     if (!generatedContent) return;
    setShowApiModal(true);
    setIsPublishing(true);
    setApiLog([]);

    const steps = [
      { msg: "> Iniciando conexión segura con LinkedIn API...", delay: 500 },
      { msg: "> Autenticando token OAuth 2.0: 'AQW...9s8' [OK]", delay: 1200 },
      { msg: "> Preparando payload JSON...", delay: 1800 },
      { msg: `> POST https://api.linkedin.com/v2/ugcPosts`, delay: 2400 },
      { msg: "> Enviando datos (Header + Body)...", delay: 3000 },
      { msg: "> Respuesta del servidor: 201 Created", delay: 4000 },
      { msg: "✅ Publicado exitosamente en el perfil.", delay: 4500 },
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep >= steps.length) {
        clearInterval(interval);
        setIsPublishing(false);
        setTimeout(() => {
           const newPost: Post = {
            id: Date.now().toString(),
            topic,
            content: generatedContent!,
            imageUrl: generatedImage || undefined,
            format: selectedFormat, // Use selected format
            scheduledDate: new Date(),
            status: 'published',
            stats: { views: 0, likes: 0, comments: 0 }
          };
          onSchedule(newPost);
          setShowApiModal(false);
        }, 1500);
        return;
      }
      setApiLog(prev => [...prev, steps[currentStep].msg]);
      currentStep++;
    }, 800);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 relative">
      <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Crear Contenido</h1>
          <p className="text-gray-500">Operando como: <span className="font-semibold text-blue-700">{userProfile.name}</span></p>
        </div>
        
        <div className="bg-gray-200 p-1 rounded-lg flex self-start">
          <button 
            onClick={() => setActiveTab('single')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${activeTab === 'single' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <Sparkles size={16} /> Individual
          </button>
          <button 
            onClick={() => setActiveTab('autopilot')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${activeTab === 'autopilot' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <Zap size={16} /> Estrategia Smart
          </button>
        </div>
      </header>

      {activeTab === 'single' ? (
         // SINGLE MODE
         <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
           <div className="lg:col-span-2 space-y-6">
             <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <label className="block text-sm font-medium text-gray-700 mb-2">Tema / Idea</label>
                {/* Topic Suggestions based on profile */}
                <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
                   {userProfile.selectedTopics.slice(0, 3).map(t => (
                      <button key={t} onClick={() => setTopic(t)} className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded whitespace-nowrap text-gray-600 border border-gray-200">
                        {t}
                      </button>
                   ))}
                </div>
                <textarea 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Escribe un tema o selecciona uno de arriba..." 
                  className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                />
                 {/* Research Button */}
                 <button
                    onClick={handleResearch}
                    disabled={isResearching || !topic}
                    className="w-full mt-2 mb-4 flex items-center justify-center gap-2 py-2 px-3 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors"
                 >
                   {isResearching ? <RefreshCw className="animate-spin" size={14}/> : <Globe size={14}/>}
                   Investigar Noticias
                 </button>
                 
                 {/* Research Results */}
                 {showResearch && researchIdeas.length > 0 && (
                    <div className="space-y-2 mb-4 bg-purple-50 p-2 rounded-lg">
                      {researchIdeas.map((idea, idx) => (
                        <button key={idx} onClick={() => handleSelectIdea(idea)} className="text-left w-full text-xs p-2 hover:bg-white rounded border border-transparent hover:border-purple-200 text-purple-900">
                           • {idea.title}
                        </button>
                      ))}
                    </div>
                 )}

                {/* Language Selector (Only for MIX profiles) */}
                {userProfile.language === 'MIX' && (
                    <div className="border-t border-gray-100 my-4 pt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <Languages size={14}/> Idioma del Post
                        </label>
                        <div className="flex gap-2">
                            <button onClick={() => setManualLanguage('ES')} className={`flex-1 py-2 text-xs font-bold rounded border ${manualLanguage === 'ES' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-gray-200'}`}>Español</button>
                            <button onClick={() => setManualLanguage('EN')} className={`flex-1 py-2 text-xs font-bold rounded border ${manualLanguage === 'EN' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-gray-200'}`}>English</button>
                        </div>
                    </div>
                )}

                {/* Tone Selector */}
                <div className="border-t border-gray-100 my-4 pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tono</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.values(PostTone).map((t) => (
                      <button
                        key={t} onClick={() => setTone(t)}
                        className={`text-xs py-2 px-3 rounded-md border transition-colors text-left ${tone === t ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium' : 'bg-white border-gray-200 text-gray-600'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* IMAGE FORMAT SELECTOR */}
                <div className="border-t border-gray-100 my-4 pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Palette size={14}/> Estilo Visual
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                     {Object.values(ContentFormat).map((fmt) => (
                       <button
                         key={fmt}
                         onClick={() => setSelectedFormat(fmt)}
                         className={`text-xs py-2 px-3 rounded-md border transition-colors text-left flex items-center gap-2
                           ${selectedFormat === fmt ? 'bg-purple-50 border-purple-500 text-purple-800 font-medium' : 'bg-white border-gray-200 text-gray-600'}
                         `}
                       >
                         {selectedFormat === fmt && <Check size={12}/>}
                         {fmt}
                       </button>
                     ))}
                  </div>
                </div>

                <button
                  onClick={() => handleGenerate()}
                  disabled={isGenerating || !topic}
                  className={`mt-2 w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-white font-medium transition-all ${isGenerating || !topic ? 'bg-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg'}`}
                >
                  {isGenerating ? "Generando..." : "Generar Post"}
                </button>
             </div>
           </div>
           
           {/* Preview Column (Similar to before) */}
           <div className="lg:col-span-3">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[500px]">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                   {userProfile.headshotUrl ? (
                     <img src={userProfile.headshotUrl} className="w-10 h-10 rounded-full object-cover" alt="Profile" />
                   ) : (
                     <div className="w-10 h-10 bg-blue-600 rounded-full text-white flex items-center justify-center font-bold text-sm">{userProfile.name.charAt(0)}</div>
                   )}
                   <div>
                     <h3 className="text-sm font-bold text-gray-900">{userProfile.name}</h3>
                     <p className="text-xs text-gray-500">{userProfile.role} • 1d • 🌐</p>
                   </div>
                </div>
                
                {/* Content */}
                <div className="p-4">
                   {isGenerating ? (
                      <div className="space-y-4 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4"/>
                        <div className="h-4 bg-gray-200 rounded w-full"/>
                        <div className="h-4 bg-gray-200 rounded w-full"/>
                      </div>
                   ) : generatedContent ? (
                      <>
                        <div className="font-bold text-gray-900 mb-4 text-base">
                          {generatedContent.headline}
                        </div>
                        <textarea 
                           className="w-full min-h-[150px] p-0 border-0 focus:ring-0 text-sm text-gray-800 resize-none font-sans"
                           value={`${generatedContent.body}\n\n👇 ${generatedContent.cta}\n\n${generatedContent.hashtags.join(' ')}`}
                           readOnly
                        />
                         <div className="mt-4 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 relative min-h-[200px] flex items-center justify-center">
                            {isImageGenerating ? (
                              <div className="flex flex-col items-center text-gray-400">
                                <ImageIcon className="animate-pulse mb-2" />
                                <span className="text-xs">Diseñando imagen ({selectedFormat})...</span>
                              </div>
                            ) : generatedImage && <img src={generatedImage} className="w-full h-auto" />}
                         </div>
                      </>
                   ) : (
                     <div className="h-full py-20 flex flex-col items-center justify-center text-gray-400">
                       <Wand2 size={48} className="opacity-20 mb-4" />
                       <p>Tu post aparecerá aquí</p>
                     </div>
                   )}
                </div>

                {/* Footer Actions */}
                {generatedContent && (
                  <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between">
                     <button onClick={handleCopy} className="text-gray-600 text-sm flex gap-2 items-center"><Copy size={16}/> Copiar</button>
                     <div className="flex gap-2">
                        {isLinkedInConnected && <button onClick={simulateApiPublish} className="px-4 py-2 bg-[#0077b5] text-white rounded-lg text-sm flex gap-2 items-center"><Send size={16}/> Publicar</button>}
                        <button onClick={handleScheduleSingle} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm flex gap-2 items-center"><Clock size={16}/> Programar</button>
                     </div>
                  </div>
                )}
              </div>
           </div>
         </div>
      ) : (
        // AUTO PILOT MODE
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="space-y-6">
              <div className="bg-gradient-to-br from-purple-900 to-indigo-900 p-6 rounded-xl shadow-lg text-white">
                 <h2 className="text-xl font-bold flex items-center gap-2 mb-2"><Zap className="text-yellow-400"/> IA Estratega</h2>
                 <p className="text-sm text-purple-100 opacity-90 mb-6">
                   Analizaré noticias recientes sobre: <strong>{userProfile.selectedTopics.slice(0,3).join(", ")}</strong> y crearé una mezcla de formatos (Carruseles, Historias, Noticias).
                 </p>
                 <button
                   onClick={handleGenerateSmartPlan}
                   disabled={isPlanning}
                   className="w-full py-3 bg-white text-purple-900 rounded-lg font-bold flex justify-center items-center gap-2 hover:bg-gray-100 transition-colors"
                 >
                   {isPlanning ? <RefreshCw className="animate-spin"/> : <Rocket/>}
                   {isPlanning ? "Buscando Noticias y Planificando..." : "Generar Plan Viral"}
                 </button>
              </div>

              {weeklyStrategy.length > 0 && (
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-in fade-in slide-in-from-left-4">
                  <div className="flex items-center gap-3 mb-4 text-gray-800">
                    <CalendarDays size={24} />
                    <h2 className="font-bold">Estrategia Propuesta</h2>
                  </div>
                  <div className="space-y-4">
                    {weeklyStrategy.map((day, idx) => (
                      <div key={idx} className="p-3 rounded-lg border border-gray-100 bg-gray-50 text-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-transparent to-blue-50/50 rounded-bl-full pointer-events-none"></div>
                        <div className="flex justify-between font-bold text-gray-800 mb-1 z-10 relative">
                          <span>{day.day}</span>
                          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
                            {day.format}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 z-10 relative">
                            <span className={`text-[10px] font-bold px-1.5 rounded ${day.language === 'ES' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                {day.language}
                            </span>
                            <p className="text-gray-900 font-medium">{day.topic}</p>
                        </div>
                        {day.newsContext && (
                           <div className="mt-2 text-xs bg-yellow-50 text-yellow-800 p-1.5 rounded border border-yellow-100 flex gap-1 items-start">
                             <Newspaper size={12} className="mt-0.5 shrink-0"/>
                             <span>Tendencia: {day.newsContext}</span>
                           </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={handleBulkGenerate}
                    disabled={isBulkGenerating}
                    className="mt-6 w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm transition-all flex justify-center items-center gap-2 shadow-md"
                  >
                    {isBulkGenerating ? <RefreshCw className="animate-spin" size={16}/> : <Wand2 size={16}/>}
                    {isBulkGenerating ? `Creando Post ${bulkProgress}/5...` : "Ejecutar Producción"}
                  </button>
                </div>
              )}
           </div>

           {/* Results Preview */}
           <div className="lg:col-span-2 space-y-4">
              {generatedWeeklyPosts.length > 0 ? (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="font-bold text-xl">Posts Listos</h2>
                    <button onClick={handleConfirmWeeklyPlan} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-blue-700">Confirmar Semana</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {generatedWeeklyPosts.map((post, idx) => (
                      <div key={idx} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                         <div className="h-40 bg-gray-100 relative">
                            {post.imageUrl && <img src={post.imageUrl} className="w-full h-full object-cover"/>}
                            <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded backdrop-blur-md">
                               {post.format}
                            </div>
                         </div>
                         <div className="p-4 flex-1">
                            <h4 className="font-bold text-sm mb-2 text-gray-900 leading-tight">{post.content.headline}</h4>
                            <p className="text-xs text-gray-500 line-clamp-3">{post.content.body}</p>
                         </div>
                      </div>
                    ))}
                    {isBulkGenerating && bulkProgress < 5 && (
                       <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl h-64 flex items-center justify-center">
                          <RefreshCw className="animate-spin text-gray-300"/>
                       </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 p-8">
                  <LayoutTemplate size={48} className="opacity-20 mb-4"/>
                  <p>Tu calendario visual aparecerá aquí.</p>
                </div>
              )}
           </div>
        </div>
      )}
      
      {/* Modal remains same */}
      {showApiModal && generatedContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
           <div className="bg-[#1e1e1e] rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden font-mono text-sm border border-gray-700 p-6 h-96 overflow-y-auto text-green-400">
             {apiLog.map((log, i) => <div key={i}>{log}</div>)}
           </div>
        </div>
      )}
    </div>
  );
};

export default CreatePostView;