import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Bell, BookOpen, MapPin, Clock, Check, X, GraduationCap, MessageSquare } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import type { AuthUser } from '../types';

interface RequestsPageProps {
  user: AuthUser | null;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const mockRequests = [
  {
    id: '1',
    studentName: 'Mary Lim',
    initials: 'ML',
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    subject: 'Mathematics',
    level: 'Secondary 4',
    location: 'Jurong West',
    timing: 'Mon & Wed, 4pm–6pm',
    status: 'pending',
    requestedDate: '2 days ago',
  },
  {
    id: '2',
    studentName: 'John Tan',
    initials: 'JT',
    gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    subject: 'Physics',
    level: 'JC 1',
    location: 'Bishan',
    timing: 'Sat, 10am–12pm',
    status: 'matched',
    requestedDate: '1 week ago',
  },
];

export function RequestsPage({ user, onNavigate, onLogout }: RequestsPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedRequest, setSelectedRequest] = useState<typeof mockRequests[0] | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.request-item',
        { x: -30, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.4, stagger: 0.1, delay: 0.1, ease: 'power3.out' }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="page-layout">
      <Sidebar user={user} currentPage="requests" onNavigate={onNavigate} onLogout={onLogout} />

      <main className="page-main">
        {/* Top bar */}
        <header className="page-topbar">
          <h2 className="topbar-title">Requests</h2>
          <div className="page-topbar-actions">
            <button className="topbar-icon-btn"><Bell size={20} /></button>
            <div className="topbar-user">
              <div className="topbar-avatar" style={{ background: 'var(--primary-gradient)' }}>
                {user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U'}
              </div>
              <span className="topbar-name">{user?.name}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="page-content">
          <div className="page-heading">
            <div>
              <h1>Tutoring Requests</h1>
              <p>{user?.role === 'Tutor' ? 'Students requesting your sessions' : 'Your pending session requests'}</p>
            </div>
          </div>

          <div className="requests-list">
            {mockRequests.map(req => (
              <div
                key={req.id}
                className="request-item"
                onClick={() => setSelectedRequest(req)}
              >
                <div className="request-avatar" style={{ background: req.gradient }}>
                  {req.initials}
                </div>
                <div className="request-info">
                  <div className="request-row">
                    <h3>{req.studentName}</h3>
                    <span className={`status-badge ${req.status}`}>
                      {req.status === 'pending' ? 'Pending' : 'Matched'}
                    </span>
                  </div>
                  <div className="request-details">
                    <span><BookOpen size={14} />{req.subject}</span>
                    <span><GraduationCap size={14} />{req.level}</span>
                    <span><MapPin size={14} />{req.location}</span>
                    <span><Clock size={14} />{req.timing}</span>
                  </div>
                  <p className="request-date">Requested {req.requestedDate}</p>
                </div>
                <div className="request-actions" onClick={e => e.stopPropagation()}>
                  {req.status === 'pending' ? (
                    <>
                      <button className="btn btn-primary btn-sm">Accept</button>
                      <button className="btn btn-ghost btn-sm">Decline</button>
                    </>
                  ) : (
                    <button className="btn btn-secondary btn-sm">View Details</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Request Modal */}
      {selectedRequest && (
        <div className="modal-overlay" onClick={() => setSelectedRequest(null)}>
          <div className="profile-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedRequest(null)}>
              <X size={24} />
            </button>
            <div className="modal-header">
              <div className="modal-avatar" style={{ background: selectedRequest.gradient }}>
                {selectedRequest.initials}
              </div>
              <div>
                <h2>{selectedRequest.studentName}</h2>
                <p className="modal-subject">Looking for {selectedRequest.subject} tutor</p>
                <span className={`status-badge ${selectedRequest.status}`}>
                  {selectedRequest.status === 'pending' ? 'Request Pending' : 'Matched'}
                </span>
              </div>
            </div>
            <div className="modal-body">
              <h4>Request Details</h4>
              <div className="detail-list">
                <div className="detail-item"><BookOpen size={18} /><span>Subject: {selectedRequest.subject}</span></div>
                <div className="detail-item"><GraduationCap size={18} /><span>Level: {selectedRequest.level}</span></div>
                <div className="detail-item"><MapPin size={18} /><span>Location: {selectedRequest.location}</span></div>
                <div className="detail-item"><Clock size={18} /><span>Preferred Time: {selectedRequest.timing}</span></div>
              </div>
            </div>
            <div className="modal-footer">
              {selectedRequest.status === 'pending' ? (
                <>
                  <button className="btn btn-primary btn-lg"><Check size={18} />Accept</button>
                  <button className="btn btn-secondary btn-lg">Decline</button>
                </>
              ) : (
                <button className="btn btn-primary btn-lg"><MessageSquare size={18} />Message</button>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .page-layout { display: flex; height: 100vh; background: linear-gradient(135deg, #fafafa 0%, #f0f4ff 50%, #faf5ff 100%); overflow: hidden; }
        .page-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
        .page-topbar { display: flex; align-items: center; justify-content: space-between; padding: var(--space-4) var(--space-6); background: white; border-bottom: 1px solid rgba(99,102,241,0.1); flex-shrink: 0; }
        .topbar-title { font-size: 1rem; font-weight: 700; color: var(--text-dark); }
        .page-topbar-actions { display: flex; align-items: center; gap: var(--space-4); }
        .topbar-icon-btn { width: 38px; height: 38px; border-radius: var(--radius-lg); background: var(--bg); border: none; display: flex; align-items: center; justify-content: center; color: var(--text); cursor: pointer; }
        .topbar-user { display: flex; align-items: center; gap: var(--space-2); }
        .topbar-avatar { width: 36px; height: 36px; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 0.8rem; }
        .topbar-name { font-weight: 600; font-size: 0.875rem; color: var(--text-dark); }
        .page-content { flex: 1; padding: var(--space-6); overflow-y: auto; }
        .page-heading { margin-bottom: var(--space-6); }
        .page-heading h1 { font-size: 1.75rem; margin-bottom: var(--space-1); }
        .page-heading p { color: var(--text-light); }
        .requests-list { display: flex; flex-direction: column; gap: var(--space-4); }
        .request-item { display: flex; align-items: center; gap: var(--space-5); background: white; border-radius: var(--radius-xl); padding: var(--space-5); box-shadow: 0 2px 16px rgba(0,0,0,0.07); border: 1px solid rgba(99,102,241,0.08); cursor: pointer; transition: all 0.2s; }
        .request-item:hover { transform: translateX(4px); box-shadow: 0 4px 24px rgba(99,102,241,0.12); }
        .request-avatar { width: 60px; height: 60px; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 1.1rem; flex-shrink: 0; }
        .request-info { flex: 1; }
        .request-row { display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-2); }
        .request-row h3 { font-size: 1.05rem; }
        .request-details { display: flex; flex-wrap: wrap; gap: var(--space-4); margin-bottom: var(--space-2); }
        .request-details span { display: flex; align-items: center; gap: 4px; font-size: 0.875rem; color: var(--text-light); }
        .request-date { font-size: 0.75rem; color: var(--text-light); }
        .request-actions { display: flex; gap: var(--space-2); flex-shrink: 0; }
        .status-badge { padding: 3px 10px; border-radius: var(--radius-full); font-size: 0.72rem; font-weight: 700; text-transform: uppercase; }
        .status-badge.pending { background: rgba(245,158,11,0.1); color: var(--warning); }
        .status-badge.matched { background: rgba(16,185,129,0.1); color: var(--success); }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: var(--space-6); }
        .profile-modal { background: white; border-radius: var(--radius-2xl); padding: var(--space-8); max-width: 480px; width: 100%; max-height: 90vh; overflow-y: auto; position: relative; box-shadow: 0 40px 100px rgba(0,0,0,0.2); }
        .modal-close { position: absolute; top: var(--space-4); right: var(--space-4); width: 38px; height: 38px; border-radius: var(--radius-full); background: var(--bg); border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text); }
        .modal-header { display: flex; align-items: center; gap: var(--space-5); margin-bottom: var(--space-6); padding-bottom: var(--space-6); border-bottom: 1px solid rgba(0,0,0,0.06); }
        .modal-avatar { width: 80px; height: 80px; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 1.5rem; flex-shrink: 0; }
        .modal-header h2 { font-size: 1.4rem; margin-bottom: var(--space-1); }
        .modal-subject { color: var(--primary); font-weight: 600; margin-bottom: var(--space-2); font-size: 0.9rem; }
        .modal-body h4 { margin-bottom: var(--space-4); }
        .detail-list { display: flex; flex-direction: column; gap: var(--space-3); margin-bottom: var(--space-6); }
        .detail-item { display: flex; align-items: center; gap: var(--space-3); color: var(--text); font-size: 0.95rem; }
        .modal-footer { display: flex; gap: var(--space-3); padding-top: var(--space-5); border-top: 1px solid rgba(0,0,0,0.06); }
        .modal-footer .btn { flex: 1; }
      `}</style>
    </div>
  );
}
