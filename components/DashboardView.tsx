import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Eye, ThumbsUp, MessageSquare, TrendingUp } from 'lucide-react';
import StatsCard from './StatsCard';

const data = [
  { name: 'Lun', views: 4000, likes: 240 },
  { name: 'Mar', views: 3000, likes: 139 },
  { name: 'Mie', views: 2000, likes: 980 },
  { name: 'Jue', views: 2780, likes: 390 },
  { name: 'Vie', views: 1890, likes: 480 },
  { name: 'Sab', views: 2390, likes: 380 },
  { name: 'Dom', views: 3490, likes: 430 },
];

const DashboardView: React.FC = () => {
  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Panel General</h1>
        <p className="text-gray-500">Resumen del rendimiento de tu contenido en LinkedIn.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Impresiones Totales" 
          value="45.2K" 
          trend="+12.5%" 
          trendUp={true} 
          icon={Eye} 
          color="bg-blue-500"
        />
        <StatsCard 
          title="Interacciones" 
          value="1,204" 
          trend="+8.2%" 
          trendUp={true} 
          icon={ThumbsUp} 
          color="bg-purple-500"
        />
        <StatsCard 
          title="Comentarios" 
          value="342" 
          trend="-2.4%" 
          trendUp={false} 
          icon={MessageSquare} 
          color="bg-pink-500"
        />
        <StatsCard 
          title="Engagement Rate" 
          value="3.8%" 
          trend="+0.5%" 
          trendUp={true} 
          icon={TrendingUp} 
          color="bg-green-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-80">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Rendimiento Semanal</h3>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="views" stroke="#3b82f6" fillOpacity={1} fill="url(#colorViews)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-80">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Interacciones por Día</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="likes" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
