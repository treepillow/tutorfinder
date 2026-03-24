import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Search, Star, MapPin, Clock, DollarSign, BookOpen, X, Check, Bell } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import type { AuthUser } from '../types';

interface MatchesPageProps {
  user: AuthUser | null;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const mockTutors = [
  {
    id: '1',
    name: 'Dr. Sarah Chen',
    initials: 'SC',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    subject: 'Mathematics',
    rating: 4.9,
    reviews: 128,
    price: 65,
    location: 'Jurong East',
    availability: 'Mon, Wed, Fri',
    bio: 'PhD in Mathematics from NUS with 10+ years of teaching experience. Specialized in H2 Math and Olympiad training.',
    isVerified: true,
  },
  {
    id: '2',
    name: 'Mr. Ahmad Rahman',
    initials: 'AR',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    subject: 'Physics',
    rating: 4.8,
    reviews: 95,
    price: 55,
    location: 'Tampines',
    availability: 'Tue, Thu, Sat',
    bio: 'Former MOE teacher with 15 years of experience. Specializes in O Level and A Level Physics.',
    isVerified: true,
  },
  {
    id: '3',
    name: 'Ms. Emily Wong',
    initials: 'EW',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    subject: 'English',
    rating: 5.0,
    reviews: 156,
    price: 60,
    location: 'Bukit Timah',
    availability: 'Mon-Fri',
    bio: 'Master in English Literature from Oxford. Specializes in creative writing and literature analysis.',
    isVerified: true,
  },
  {
    id: '4',
    name: 'Mr. Rajesh Kumar',
    initials: 'RK',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    subject: 'Chemistry',
    rating: 4.7,
    reviews: 82,
    price: 50,
    location: 'Online',
    availability: 'Weekends',
    bio: 'Chemistry PhD with industrial experience. Makes complex concepts simple and fun.',
    isVerified: true,
  },
];

export function MatchesPage({ user, onNavigate, onLogout }: MatchesPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedProfile, setSelectedProfile] = useState<typeof mockTutors[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.match-card',
        { y: 40, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.1, delay: 0.1, ease: 'power3.out' }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const filtered = mockTutors.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div ref={containerRef} className="page-layout">
      <Sidebar user={user} currentPage="matches" onNavigate={onNavigate} onLogout={onLogout} />

      <main className="page-main">
        {/* Top bar */}
        <header className="page-topbar">
          <div className="page-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search matches..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="page-topbar-actions">
            <button className="topbar-icon-btn">
              <Bell size={20} />
            </button>
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
              <h1>Your Matches</h1>
              <p>{user?.role === 'Student' ? 'Tutors who matched with you' : 'Students who matched with you'}</p>
            </div>
            <button className="btn btn-primary" onClick={() => onNavigate('discover')}>
              Discover More
            </button>
          </div>

          <div className="matches-grid">
            {filtered.map(tutor => (
              <div
                key={tutor.id}
                className="match-card"
                onClick={() => setSelectedProfile(tutor)}
              >
                <div className="match-card-header">
                  <div className="match-avatar" style={{ background: tutor.gradient }}>
                    {tutor.initials}
                  </div>
                  {tutor.isVerified && (
                    <div className="verified-badge"><Check size={12} /></div>
                  )}
                </div>
                <div className="match-card-body">
                  <h3>{tutor.name}</h3>
                  <p className="match-subject"><BookOpen size={14} />{tutor.subject}</p>
                  <div className="match-meta">
                    <span><Star size={14} fill="#fbbf24" color="#fbbf24" />{tutor.rating} <small>({tutor.reviews})</small></span>
                    <span><DollarSign size={14} />{tutor.price}/hr</span>
                  </div>
                  <div className="match-location"><MapPin size={14} />{tutor.location}</div>
                  <div className="match-availability"><Clock size={14} />{tutor.availability}</div>
                </div>
                <div className="match-card-footer">
                  <button className="btn btn-primary btn-sm">View Profile</button>
                  <button className="btn btn-secondary btn-sm">Message</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Profile Modal */}
      {selectedProfile && (
        <div className="modal-overlay" onClick={() => setSelectedProfile(null)}>
          <div className="profile-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedProfile(null)}>
              <X size={24} />
            </button>
            <div className="modal-header">
              <div className="modal-avatar" style={{ background: selectedProfile.gradient }}>
                {selectedProfile.initials}
              </div>
              <div>
                <h2>{selectedProfile.name}</h2>
                <p className="modal-subject">{selectedProfile.subject} Tutor</p>
                <div className="modal-rating">
                  <Star size={16} fill="#fbbf24" color="#fbbf24" />
                  <span>{selectedProfile.rating}</span>
                  <small>({selectedProfile.reviews} reviews)</small>
                </div>
              </div>
            </div>
            <div className="modal-body">
              <h4>About</h4>
              <p>{selectedProfile.bio}</p>
              <div className="modal-stats">
                <div className="modal-stat">
                  <DollarSign size={18} />
                  <span className="stat-val">${selectedProfile.price}</span>
                  <span className="stat-lbl">per hour</span>
                </div>
                <div className="modal-stat">
                  <MapPin size={18} />
                  <span className="stat-val">{selectedProfile.location}</span>
                  <span className="stat-lbl">location</span>
                </div>
                <div className="modal-stat">
                  <Clock size={18} />
                  <span className="stat-val">{selectedProfile.availability}</span>
                  <span className="stat-lbl">availability</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary btn-lg">Request Tutoring</button>
              <button className="btn btn-secondary btn-lg">Send Message</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .page-layout { display: flex; height: 100vh; background: linear-gradient(135deg, #fafafa 0%, #f0f4ff 50%, #faf5ff 100%); overflow: hidden; }
        .page-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
        .page-topbar { display: flex; align-items: center; justify-content: space-between; padding: var(--space-4) var(--space-6); background: white; border-bottom: 1px solid rgba(99,102,241,0.1); flex-shrink: 0; }
        .page-search { display: flex; align-items: center; gap: var(--space-3); background: var(--bg); border-radius: var(--radius-lg); padding: var(--space-3) var(--space-4); width: 360px; }
        .page-search input { background: none; border: none; outline: none; flex: 1; font-family: inherit; font-size: 0.875rem; }
        .page-topbar-actions { display: flex; align-items: center; gap: var(--space-4); }
        .topbar-icon-btn { width: 38px; height: 38px; border-radius: var(--radius-lg); background: var(--bg); border: none; display: flex; align-items: center; justify-content: center; color: var(--text); cursor: pointer; }
        .topbar-user { display: flex; align-items: center; gap: var(--space-2); }
        .topbar-avatar { width: 36px; height: 36px; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 0.8rem; }
        .topbar-name { font-weight: 600; font-size: 0.875rem; color: var(--text-dark); }
        .page-content { flex: 1; padding: var(--space-6); overflow-y: auto; }
        .page-heading { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-6); }
        .page-heading h1 { font-size: 1.75rem; margin-bottom: var(--space-1); }
        .page-heading p { color: var(--text-light); }
        .matches-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--space-5); }
        .match-card { background: white; border-radius: var(--radius-xl); padding: var(--space-5); box-shadow: 0 2px 16px rgba(0,0,0,0.07); border: 1px solid rgba(99,102,241,0.08); cursor: pointer; transition: all 0.2s; }
        .match-card:hover { transform: translateY(-4px); box-shadow: 0 8px 30px rgba(99,102,241,0.15); }
        .match-card-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: var(--space-4); }
        .match-avatar { width: 68px; height: 68px; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 1.25rem; }
        .verified-badge { width: 22px; height: 22px; background: var(--success); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; border: 2px solid white; }
        .match-card-body h3 { font-size: 1.1rem; margin-bottom: var(--space-1); }
        .match-subject { display: flex; align-items: center; gap: var(--space-1); color: var(--primary); font-weight: 600; font-size: 0.875rem; margin-bottom: var(--space-3); }
        .match-meta { display: flex; gap: var(--space-4); margin-bottom: var(--space-2); font-size: 0.875rem; font-weight: 600; }
        .match-meta span { display: flex; align-items: center; gap: 4px; }
        .match-meta small { color: var(--text-light); font-weight: 400; }
        .match-location, .match-availability { display: flex; align-items: center; gap: var(--space-2); font-size: 0.875rem; color: var(--text-light); margin-bottom: var(--space-1); }
        .match-card-footer { display: flex; gap: var(--space-2); margin-top: var(--space-4); padding-top: var(--space-4); border-top: 1px solid rgba(0,0,0,0.06); }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: var(--space-6); }
        .profile-modal { background: white; border-radius: var(--radius-2xl); padding: var(--space-8); max-width: 520px; width: 100%; max-height: 90vh; overflow-y: auto; position: relative; box-shadow: 0 40px 100px rgba(0,0,0,0.2); }
        .modal-close { position: absolute; top: var(--space-4); right: var(--space-4); width: 38px; height: 38px; border-radius: var(--radius-full); background: var(--bg); border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text); }
        .modal-close:hover { background: var(--border-light); }
        .modal-header { display: flex; align-items: center; gap: var(--space-5); margin-bottom: var(--space-6); padding-bottom: var(--space-6); border-bottom: 1px solid rgba(0,0,0,0.06); }
        .modal-avatar { width: 88px; height: 88px; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 1.75rem; flex-shrink: 0; }
        .modal-header h2 { font-size: 1.4rem; margin-bottom: var(--space-1); }
        .modal-subject { color: var(--primary); font-weight: 600; margin-bottom: var(--space-2); }
        .modal-rating { display: flex; align-items: center; gap: var(--space-2); font-weight: 700; }
        .modal-rating small { font-weight: 400; color: var(--text-light); }
        .modal-body h4 { margin-bottom: var(--space-3); }
        .modal-body p { line-height: 1.7; color: var(--text); margin-bottom: var(--space-6); }
        .modal-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-4); background: var(--bg); border-radius: var(--radius-xl); padding: var(--space-5); margin-bottom: var(--space-6); }
        .modal-stat { display: flex; flex-direction: column; align-items: center; gap: 4px; color: var(--primary); }
        .stat-val { font-size: 1rem; font-weight: 700; color: var(--text-dark); }
        .stat-lbl { font-size: 0.7rem; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.05em; }
        .modal-footer { display: flex; gap: var(--space-3); padding-top: var(--space-5); border-top: 1px solid rgba(0,0,0,0.06); }
        .modal-footer .btn { flex: 1; }
      `}</style>
    </div>
  );
}
