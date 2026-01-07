import React from 'react';
import { Calendar as CalendarIcon, MoreHorizontal, CheckCircle2, CircleDashed } from 'lucide-react';
import { Post } from '../types';

interface ScheduleViewProps {
  posts: Post[];
}

const ScheduleView: React.FC<ScheduleViewProps> = ({ posts }) => {
  return (
    <div className="space-y-6">
      <header className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendario de Contenido</h1>
          <p className="text-gray-500">Administra tus publicaciones programadas y el historial.</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-1 flex">
          <button className="px-3 py-1 text-sm font-medium bg-gray-100 rounded text-gray-900">Lista</button>
          <button className="px-3 py-1 text-sm font-medium text-gray-500 hover:bg-gray-50 rounded">Mes</button>
        </div>
      </header>

      {posts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CalendarIcon size={32} />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No hay posts programados</h3>
          <p className="text-gray-500 mt-1">Ve a la sección "Crear Nuevo Post" para comenzar tu estrategia.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="p-4 font-medium w-1/2">Contenido</th>
                <th className="p-4 font-medium">Fecha</th>
                <th className="p-4 font-medium">Estado</th>
                <th className="p-4 font-medium">Estadísticas</th>
                <th className="p-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="p-4 align-top">
                    <div className="flex gap-4">
                      {post.imageUrl ? (
                        <img src={post.imageUrl} alt="" className="w-20 h-20 rounded-lg object-cover bg-gray-100 shadow-sm shrink-0" />
                      ) : (
                        <div className="w-20 h-20 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 font-bold text-xs shrink-0 border border-blue-100">
                          TXT
                        </div>
                      )}
                      <div className="space-y-1">
                        <p className="font-bold text-gray-900 text-base leading-snug">{post.content.headline}</p>
                        <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">{post.content.body}</p>
                        <div className="flex gap-2 pt-1">
                            {post.content.hashtags.slice(0, 3).map(tag => (
                                <span key={tag} className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{tag}</span>
                            ))}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-600 align-top pt-5">
                    <div className="font-medium text-gray-900">{post.scheduledDate.toLocaleDateString()}</div>
                    <div className="text-xs text-gray-400">10:00 AM</div>
                  </td>
                  <td className="p-4 align-top pt-5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
                      ${post.status === 'published' ? 'bg-green-50 text-green-700 border-green-200' : 
                        post.status === 'scheduled' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-700 border-gray-200'
                      }
                    `}>
                      {post.status === 'published' ? <CheckCircle2 size={12} /> : <CircleDashed size={12} />}
                      {post.status === 'published' ? 'Publicado' : post.status === 'scheduled' ? 'Programado' : 'Borrador'}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-600 align-top pt-5">
                    {post.status === 'published' && post.stats ? (
                      <div className="flex flex-col gap-1 text-xs">
                        <span className="flex justify-between w-24">Views: <strong>{post.stats.views.toLocaleString()}</strong></span>
                        <span className="flex justify-between w-24">Likes: <strong>{post.stats.likes}</strong></span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs italic">Pendiente</span>
                    )}
                  </td>
                  <td className="p-4 text-right align-top pt-5">
                    <button className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors">
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ScheduleView;