// src/components/layout/Sidebar.jsx
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  MessageSquare,
  BarChart3,
  Bot,
  Settings,
  LogOut,
  X,
  ChevronLeft,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/helpers';

const menuItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/surveys', icon: ClipboardList, label: 'Surveys' },
  { path: '/responses', icon: MessageSquare, label: 'Responses' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/ai-assistant', icon: Bot, label: 'AI Assistant' },
];

const bottomMenuItems = [
  { path: '/settings', icon: Settings, label: 'Settings' },
];

const Sidebar = ({ isOpen, onClose, isCollapsed, onToggleCollapse }) => {
  const location = useLocation();
  const { logout, user } = useAuth();

  const NavItem = ({ item }) => {
    const isActive = location.pathname === item.path || 
                     (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

    return (
      <NavLink
        to={item.path}
        onClick={() => window.innerWidth < 1024 && onClose()}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200',
          'hover:bg-primary-50 hover:text-primary-600',
          isActive
            ? 'bg-primary-50 text-primary-600 font-medium'
            : 'text-dark-600',
          isCollapsed && 'justify-center'
        )}
      >
        <item.icon className="w-5 h-5 flex-shrink-0" />
        {!isCollapsed && <span>{item.label}</span>}
      </NavLink>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full bg-white border-r border-light-200 transition-all duration-300',
          'lg:relative lg:z-0',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          isCollapsed ? 'w-20' : 'w-64'
        )}
      >
        {/* Header */}
        <div className={cn(
          'h-16 flex items-center border-b border-light-200 px-4',
          isCollapsed ? 'justify-center' : 'justify-between'
        )}>
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-dark-900">Feedlyze</span>
            </div>
          )}
          
          {/* Collapse Toggle (Desktop) */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg hover:bg-light-100 text-dark-400"
          >
            <ChevronLeft className={cn('w-5 h-5 transition-transform', isCollapsed && 'rotate-180')} />
          </button>

          {/* Close Button (Mobile) */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-light-100 text-dark-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col h-[calc(100%-4rem)] p-4">
          {/* Main Menu */}
          <div className="space-y-1 flex-1">
            {menuItems.map((item) => (
              <NavItem key={item.path} item={item} />
            ))}
          </div>

          {/* Bottom Menu */}
          <div className="space-y-1 pt-4 border-t border-light-200">
            {bottomMenuItems.map((item) => (
              <NavItem key={item.path} item={item} />
            ))}
            
            {/* Logout */}
            <button
              onClick={logout}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200',
                'text-dark-600 hover:bg-danger-50 hover:text-danger-600',
                isCollapsed && 'justify-center'
              )}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span>Logout</span>}
            </button>
          </div>

          {/* User Info */}
          {!isCollapsed && user && (
            <div className="mt-4 p-3 bg-light-50 rounded-lg">
              <p className="text-sm font-medium text-dark-900 truncate">
                {user.business_name}
              </p>
              <p className="text-xs text-dark-500 truncate">{user.email}</p>
            </div>
          )}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
