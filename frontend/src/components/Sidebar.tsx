import { Star, Users, BookOpen, Calendar, Settings, LogOut } from 'lucide-react';
import type { AuthUser } from '../types';

const GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
  'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
  'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)',
];

interface SidebarProps {
  user: AuthUser | null;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function Sidebar({ user, currentPage, onNavigate, onLogout }: SidebarProps) {
  const gradient = GRADIENTS[(user?.user_id ?? 0) % GRADIENTS.length];
  const initials = (user?.name ?? 'U')
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const navItems = [
    { key: 'discover', label: 'Discover', icon: <Star size={20} /> },
    { key: 'matches', label: 'Matches', icon: <Users size={20} /> },
    { key: 'requests', label: 'Requests', icon: <BookOpen size={20} /> },
    { key: 'schedule', label: 'Schedule', icon: <Calendar size={20} /> },
  ];

  return (
    <aside className="app-sidebar">
      <div className="app-sidebar-logo">
        Tutor<span className="gradient-text">Finder</span>
      </div>

      <nav className="app-sidebar-nav">
        {navItems.map(item => (
          <button
            key={item.key}
            className={`app-sidebar-item ${currentPage === item.key ? 'active' : ''}`}
            onClick={() => onNavigate(item.key)}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="app-sidebar-footer">
        <button
          className={`app-sidebar-item ${currentPage === 'settings' ? 'active' : ''}`}
          onClick={() => onNavigate('settings')}
        >
          <Settings size={20} />
          <span>Settings</span>
        </button>

        <div className="app-sidebar-user">
          <div className="app-sidebar-avatar" style={{ background: gradient }}>
            {initials}
          </div>
          <div className="app-sidebar-user-info">
            <span className="app-sidebar-user-name">{user?.name}</span>
            <span className="app-sidebar-user-role">{user?.role}</span>
          </div>
          <button className="app-sidebar-logout" onClick={onLogout} title="Sign out">
            <LogOut size={16} />
          </button>
        </div>
      </div>

      <style>{`
        .app-sidebar {
          width: 240px;
          background: white;
          border-right: 1px solid rgba(99, 102, 241, 0.1);
          display: flex;
          flex-direction: column;
          padding: var(--space-6);
          box-shadow: 2px 0 20px rgba(0,0,0,0.05);
          flex-shrink: 0;
          height: 100vh;
          position: sticky;
          top: 0;
        }

        .app-sidebar-logo {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--text-dark);
          margin-bottom: var(--space-8);
          padding: var(--space-2) 0;
        }

        .app-sidebar-nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }

        .app-sidebar-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          border: none;
          background: transparent;
          border-radius: var(--radius-lg);
          color: var(--text-light);
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
          width: 100%;
        }

        .app-sidebar-item:hover {
          background: rgba(99, 102, 241, 0.08);
          color: var(--primary);
        }

        .app-sidebar-item.active {
          background: rgba(99, 102, 241, 0.12);
          color: var(--primary);
          font-weight: 600;
        }

        .app-sidebar-footer {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          padding-top: var(--space-4);
          border-top: 1px solid rgba(0,0,0,0.06);
        }

        .app-sidebar-user {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-2) var(--space-2);
          margin-top: var(--space-2);
        }

        .app-sidebar-avatar {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 0.8rem;
          flex-shrink: 0;
        }

        .app-sidebar-user-info {
          flex: 1;
          overflow: hidden;
        }

        .app-sidebar-user-name {
          display: block;
          font-weight: 600;
          font-size: 0.875rem;
          color: var(--text-dark);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .app-sidebar-user-role {
          display: block;
          font-size: 0.75rem;
          color: var(--text-light);
        }

        .app-sidebar-logout {
          background: none;
          border: none;
          color: var(--text-light);
          cursor: pointer;
          padding: var(--space-1);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .app-sidebar-logout:hover {
          color: var(--error);
          background: rgba(239,68,68,0.08);
        }

        @media (max-width: 768px) {
          .app-sidebar { display: none; }
        }
      `}</style>
    </aside>
  );
}
