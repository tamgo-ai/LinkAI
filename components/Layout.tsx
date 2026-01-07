import React from 'react';
import { LayoutDashboard, PenTool, Calendar, User, Menu, X, Settings } from 'lucide-react';
import { ViewState, UserProfile } from '../types';

interface LayoutProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  children: React.ReactNode;
  userProfile?: UserProfile | null;
}

const Layout: React.FC<LayoutProps> = ({ currentView, setView, children, userProfile }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: ViewState.DASHBOARD, label: 'Panel General', icon: LayoutDashboard },
    { id: ViewState.CREATE, label: 'Crear Nuevo Post', icon: PenTool },
    { id: ViewState.SCHEDULE, label: 'Calendario', icon: Calendar },
    { id: ViewState.SETTINGS, label: 'Configuración API', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white p-4 flex justify-between items-center shadow-sm z-20 sticky top-0">
        <div className="flex items-center gap-2 font-bold text-blue-700 text-xl">
          <span className="bg-blue-600 text-white p-1 rounded">Li</span> LinkAI
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed md:sticky top-0 h-screen w-64 bg-white border-r border-gray-200 z-10 transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 hidden md:flex items-center gap-2 font-bold text-blue-700 text-2xl mb-6">
           <span className="bg-blue-600 text-white px-2 py-1 rounded">Li</span> LinkAI
        </div>

        <nav className="flex flex-col gap-2 px-4 mt-4 md:mt-0">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setView(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                ${currentView === item.id 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
              `}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>

        {userProfile && (
          <div className="absolute bottom-0 w-full p-4 border-t border-gray-100">
            <div className="flex items-center gap-3 px-4 py-2">
              <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-blue-100 text-blue-600 font-bold border border-blue-200">
                {userProfile.headshotUrl ? (
                  <img src={userProfile.headshotUrl} alt="User" className="w-full h-full object-cover" />
                ) : (
                  userProfile.name.charAt(0)
                )}
              </div>
              <div className="text-sm">
                <p className="font-medium text-gray-900 line-clamp-1">{userProfile.name}</p>
                <p className="text-gray-500 text-xs line-clamp-1">{userProfile.role}</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;