import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  MessageSquare, 
  Settings,
  Bell,
  Search,
  Star,
  MapPin,
  Clock,
  DollarSign,
  BookOpen,
  ChevronRight,
  X,
  Check,
  GraduationCap
} from 'lucide-react';

import type { AuthUser } from '../App';

interface DashboardPageProps {
  onNavigate: (page: string) => void;
  user: AuthUser | null;
  onLogout: () => void;
}

// Mock data for tutors
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
    isVerified: true
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
    isVerified: true
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
    isVerified: true
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
    isVerified: true
  }
];

// Mock data for matches/requests
const mockMatches = [
  {
    id: '1',
    studentName: 'Mary Lim',
    initials: 'ML',
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    subject: 'Mathematics',
    level: 'Secondary 4',
    location: 'Jurong West',
    timing: 'Mon & Wed, 4pm-6pm',
    status: 'pending',
    requestedDate: '2 days ago'
  },
  {
    id: '2',
    studentName: 'John Tan',
    initials: 'JT',
    gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    subject: 'Physics',
    level: 'JC 1',
    location: 'Bishan',
    timing: 'Sat, 10am-12pm',
    status: 'matched',
    requestedDate: '1 week ago'
  }
];

export function DashboardPage({ onNavigate, user, onLogout }: DashboardPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'matched' | 'requests'>('matched');
  const [selectedProfile, setSelectedProfile] = useState<typeof mockTutors[0] | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<typeof mockMatches[0] | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Sidebar animation
      gsap.fromTo('.sidebar',
        { x: -50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
      );

      // Main content animation
      gsap.fromTo('.main-content',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, delay: 0.2, ease: 'power3.out' }
      );

      // Cards stagger animation
      gsap.fromTo('.dashboard-card',
        { y: 40, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.5,
          stagger: 0.1,
          delay: 0.4,
          ease: 'power3.out'
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [activeTab]);

  const handleProfileClick = (profile: typeof mockTutors[0]) => {
    setSelectedProfile(profile);
    setSelectedRequest(null);
    setShowProfileModal(true);
    
    // Animate modal
    gsap.fromTo('.profile-modal',
      { scale: 0.9, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.3, ease: 'power2.out' }
    );
  };

  const closeProfileModal = () => {
    gsap.to('.profile-modal', {
      scale: 0.9,
      opacity: 0,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => {
        setShowProfileModal(false);
        setSelectedProfile(null);
        setSelectedRequest(null);
      }
    });
  };

  const handleRequestClick = (request: typeof mockMatches[0]) => {
    setSelectedRequest(request);
    setSelectedProfile(null);
    setShowProfileModal(true);
    
    // Animate modal
    gsap.fromTo('.profile-modal',
      { scale: 0.9, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.3, ease: 'power2.out' }
    );
  };

  const filteredTutors = mockTutors.filter(tutor =>
    tutor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tutor.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div ref={containerRef} className="dashboard-page">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-icon-small">
            <GraduationCap size={24} />
          </div>
          <span className="logo-text-small">TutorFinder</span>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'matched' ? 'active' : ''}`}
            onClick={() => setActiveTab('matched')}
          >
            <Users size={20} />
            <span>Matched Tutors</span>
            {mockTutors.length > 0 && (
              <span className="nav-badge">{mockTutors.length}</span>
            )}
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            <LayoutDashboard size={20} />
            <span>Requests</span>
            {mockMatches.filter(m => m.status === 'pending').length > 0 && (
              <span className="nav-badge nav-badge-new">
                {mockMatches.filter(m => m.status === 'pending').length}
              </span>
            )}
          </button>

          <button className="nav-item">
            <Calendar size={20} />
            <span>Schedule</span>
          </button>

          <button className="nav-item">
            <MessageSquare size={20} />
            <span>Messages</span>
            <span className="nav-badge nav-badge-new">3</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item">
            <Settings size={20} />
            <span>Settings</span>
          </button>
          <button className="nav-item logout" onClick={onLogout}>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Bar */}
        <header className="top-bar">
          <div className="search-bar">
            <Search size={20} />
            <input
              type="text"
              placeholder={`Search ${activeTab === 'matched' ? 'tutors' : 'requests'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="top-bar-actions">
            <button className="icon-btn">
              <Bell size={20} />
              <span className="notification-dot"></span>
            </button>
            <div className="user-menu">
              <div className="user-avatar" style={{ background: 'var(--primary-gradient)' }}>
                <span>{user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U'}</span>
              </div>
              <div className="user-info">
                <span className="user-name">{user?.name || 'User'}</span>
                <span className="user-role">{user?.role || ''}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="content-area">
          {activeTab === 'matched' ? (
            <>
              <div className="content-header">
                <div>
                  <h1>Your Matched Tutors</h1>
                  <p>Tutors that match your learning preferences</p>
                </div>
                <button className="btn btn-primary">
                  Find More Tutors
                  <ChevronRight size={18} />
                </button>
              </div>

              <div className="tutors-grid">
                {filteredTutors.map((tutor) => (
                  <div 
                    key={tutor.id} 
                    className="tutor-card dashboard-card"
                    onClick={() => handleProfileClick(tutor)}
                  >
                    <div className="tutor-card-header">
                      <div className="tutor-avatar-large" style={{ background: tutor.gradient }}>
                        <span>{tutor.initials}</span>
                      </div>
                      {tutor.isVerified && (
                        <div className="verified-badge">
                          <Check size={12} />
                        </div>
                      )}
                    </div>
                    
                    <div className="tutor-card-body">
                      <h3 className="tutor-name">{tutor.name}</h3>
                      <p className="tutor-subject">
                        <BookOpen size={14} />
                        {tutor.subject}
                      </p>
                      
                      <div className="tutor-meta">
                        <span className="tutor-rating">
                          <Star size={14} fill="#fbbf24" color="#fbbf24" />
                          {tutor.rating}
                          <small>({tutor.reviews})</small>
                        </span>
                        <span className="tutor-price">
                          <DollarSign size={14} />
                          {tutor.price}/hr
                        </span>
                      </div>

                      <div className="tutor-location">
                        <MapPin size={14} />
                        {tutor.location}
                      </div>

                      <div className="tutor-availability">
                        <Clock size={14} />
                        {tutor.availability}
                      </div>
                    </div>

                    <div className="tutor-card-footer">
                      <button className="btn btn-primary btn-sm">
                        View Profile
                      </button>
                      <button className="btn btn-secondary btn-sm">
                        Message
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="content-header">
                <div>
                  <h1>Tutoring Requests</h1>
                  <p>Students looking for tutoring in your subjects</p>
                </div>
              </div>

              <div className="requests-list">
                {mockMatches.map((match) => (
                  <div 
                    key={match.id} 
                    className="request-card dashboard-card"
                    onClick={() => handleRequestClick(match)}
                  >
                    <div className="request-avatar" style={{ background: match.gradient }}>
                      <span>{match.initials}</span>
                    </div>
                    
                    <div className="request-info">
                      <div className="request-header">
                        <h3>{match.studentName}</h3>
                        <span className={`status-badge ${match.status}`}>
                          {match.status === 'pending' ? 'Pending' : 'Matched'}
                        </span>
                      </div>
                      
                      <div className="request-details">
                        <span><BookOpen size={14} /> {match.subject}</span>
                        <span><GraduationCap size={14} /> {match.level}</span>
                        <span><MapPin size={14} /> {match.location}</span>
                        <span><Clock size={14} /> {match.timing}</span>
                      </div>
                      
                      <p className="request-date">Requested {match.requestedDate}</p>
                    </div>

                    <div className="request-actions">
                      {match.status === 'pending' ? (
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
            </>
          )}
        </div>
      </main>

      {/* Profile Modal */}
      {showProfileModal && selectedProfile && (
        <div className="modal-overlay" onClick={closeProfileModal}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeProfileModal}>
              <X size={24} />
            </button>

            {/* Tutor Profile */}
            <div className="profile-header">
              <div 
                className="profile-avatar-xl" 
                style={{ background: selectedProfile.gradient }}
              >
                <span>{selectedProfile.initials}</span>
              </div>
              <div className="profile-title">
                <h2>{selectedProfile.name}</h2>
                <p className="profile-subtitle">
                  {selectedProfile.subject} Tutor
                </p>
                <div className="profile-rating">
                  <Star size={18} fill="#fbbf24" color="#fbbf24" />
                  <span>{selectedProfile.rating}</span>
                  <small>({selectedProfile.reviews} reviews)</small>
                </div>
              </div>
            </div>

            <div className="profile-body">
              <div className="profile-section">
                <h4>About</h4>
                <p>{selectedProfile.bio}</p>
              </div>

              <div className="profile-stats">
                <div className="profile-stat">
                  <DollarSign size={20} />
                  <span className="stat-value">${selectedProfile.price}</span>
                  <span className="stat-label">per hour</span>
                </div>
                <div className="profile-stat">
                  <MapPin size={20} />
                  <span className="stat-value">{selectedProfile.location}</span>
                  <span className="stat-label">location</span>
                </div>
                <div className="profile-stat">
                  <Clock size={20} />
                  <span className="stat-value">{selectedProfile.availability}</span>
                  <span className="stat-label">availability</span>
                </div>
              </div>
            </div>

            <div className="profile-footer">
              <button className="btn btn-primary btn-lg">
                Request Tutoring
              </button>
              <button className="btn btn-secondary btn-lg">
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Modal */}
      {showProfileModal && selectedRequest && (
        <div className="modal-overlay" onClick={closeProfileModal}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeProfileModal}>
              <X size={24} />
            </button>

            {/* Student Request */}
            <div className="profile-header">
              <div 
                className="profile-avatar-xl" 
                style={{ background: selectedRequest.gradient }}
              >
                <span>{selectedRequest.initials}</span>
              </div>
              <div className="profile-title">
                <h2>{selectedRequest.studentName}</h2>
                <p className="profile-subtitle">
                  Looking for {selectedRequest.subject} tutor
                </p>
                <span className={`status-badge large ${selectedRequest.status}`}>
                  {selectedRequest.status === 'pending' ? 'Request Pending' : 'Matched'}
                </span>
              </div>
            </div>

            <div className="profile-body">
              <div className="profile-section">
                <h4>Request Details</h4>
                <div className="detail-list">
                  <div className="detail-item">
                    <BookOpen size={18} />
                    <span>Subject: {selectedRequest.subject}</span>
                  </div>
                  <div className="detail-item">
                    <GraduationCap size={18} />
                    <span>Level: {selectedRequest.level}</span>
                  </div>
                  <div className="detail-item">
                    <MapPin size={18} />
                    <span>Location: {selectedRequest.location}</span>
                  </div>
                  <div className="detail-item">
                    <Clock size={18} />
                    <span>Preferred Time: {selectedRequest.timing}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="profile-footer">
              {selectedRequest.status === 'pending' ? (
                <>
                  <button className="btn btn-primary btn-lg">
                    <Check size={20} />
                    Accept Request
                  </button>
                  <button className="btn btn-secondary btn-lg">
                    Decline
                  </button>
                </>
              ) : (
                <button className="btn btn-primary btn-lg">
                  <MessageSquare size={20} />
                  Message Student
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .dashboard-page {
          display: flex;
          min-height: 100vh;
          background: var(--bg);
          padding-top: 0;
        }

        /* Sidebar */
        .sidebar {
          width: 280px;
          background: white;
          border-right: 1px solid var(--border-light);
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0;
          bottom: 0;
          left: 0;
          z-index: 100;
        }

        .sidebar-header {
          padding: var(--space-6);
          display: flex;
          align-items: center;
          gap: var(--space-3);
          border-bottom: 1px solid var(--border-light);
        }

        .logo-icon-small {
          width: 40px;
          height: 40px;
          background: var(--primary-gradient);
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .logo-text-small {
          font-size: 1.25rem;
          font-weight: 800;
          background: var(--primary-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .sidebar-nav {
          flex: 1;
          padding: var(--space-4);
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-lg);
          font-weight: 600;
          color: var(--text);
          background: none;
          border: none;
          cursor: pointer;
          transition: all var(--transition-fast);
          position: relative;
        }

        .nav-item:hover {
          background: var(--bg);
          color: var(--primary);
        }

        .nav-item.active {
          background: rgba(99, 102, 241, 0.1);
          color: var(--primary);
        }

        .nav-badge {
          margin-left: auto;
          background: var(--text-light);
          color: white;
          font-size: 0.75rem;
          padding: 2px 8px;
          border-radius: var(--radius-full);
        }

        .nav-badge-new {
          background: var(--primary);
        }

        .sidebar-footer {
          padding: var(--space-4);
          border-top: 1px solid var(--border-light);
        }

        .nav-item.logout {
          color: var(--error);
        }

        /* Main Content */
        .main-content {
          flex: 1;
          margin-left: 280px;
          display: flex;
          flex-direction: column;
        }

        /* Top Bar */
        .top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-4) var(--space-6);
          background: white;
          border-bottom: 1px solid var(--border-light);
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .search-bar {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          background: var(--bg);
          border-radius: var(--radius-lg);
          padding: var(--space-3) var(--space-4);
          width: 400px;
          max-width: 100%;
        }

        .search-bar input {
          background: none;
          border: none;
          outline: none;
          flex: 1;
          font-family: inherit;
          font-size: 0.875rem;
        }

        .top-bar-actions {
          display: flex;
          align-items: center;
          gap: var(--space-4);
        }

        .icon-btn {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-lg);
          background: var(--bg);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text);
          cursor: pointer;
          position: relative;
          transition: all var(--transition-fast);
        }

        .icon-btn:hover {
          background: var(--border-light);
          color: var(--primary);
        }

        .notification-dot {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 8px;
          height: 8px;
          background: var(--error);
          border-radius: 50%;
        }

        .user-menu {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          cursor: pointer;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 0.875rem;
        }

        .user-info {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-weight: 700;
          color: var(--text-dark);
          font-size: 0.875rem;
        }

        .user-role {
          font-size: 0.75rem;
          color: var(--text-light);
        }

        /* Content Area */
        .content-area {
          flex: 1;
          padding: var(--space-6);
          overflow-y: auto;
        }

        .content-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--space-6);
        }

        .content-header h1 {
          font-size: 1.75rem;
          margin-bottom: var(--space-1);
        }

        .content-header p {
          color: var(--text-light);
        }

        /* Tutors Grid */
        .tutors-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: var(--space-6);
        }

        .tutor-card {
          background: white;
          border-radius: var(--radius-xl);
          padding: var(--space-6);
          box-shadow: var(--shadow);
          border: 1px solid var(--border-light);
          cursor: pointer;
          transition: all var(--transition);
        }

        .tutor-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
        }

        .tutor-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: var(--space-4);
        }

        .tutor-avatar-large {
          width: 72px;
          height: 72px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 1.25rem;
        }

        .verified-badge {
          width: 24px;
          height: 24px;
          background: var(--success);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          border: 2px solid white;
        }

        .tutor-name {
          font-size: 1.125rem;
          margin-bottom: var(--space-1);
        }

        .tutor-subject {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          color: var(--primary);
          font-weight: 600;
          font-size: 0.875rem;
          margin-bottom: var(--space-3);
        }

        .tutor-meta {
          display: flex;
          gap: var(--space-4);
          margin-bottom: var(--space-3);
        }

        .tutor-rating,
        .tutor-price {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          font-size: 0.875rem;
          font-weight: 600;
        }

        .tutor-rating small {
          color: var(--text-light);
          font-weight: 400;
        }

        .tutor-location,
        .tutor-availability {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: 0.875rem;
          color: var(--text-light);
          margin-bottom: var(--space-1);
        }

        .tutor-card-footer {
          display: flex;
          gap: var(--space-2);
          margin-top: var(--space-4);
          padding-top: var(--space-4);
          border-top: 1px solid var(--border-light);
        }

        /* Requests List */
        .requests-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .request-card {
          display: flex;
          align-items: center;
          gap: var(--space-5);
          background: white;
          border-radius: var(--radius-xl);
          padding: var(--space-5);
          box-shadow: var(--shadow);
          border: 1px solid var(--border-light);
          cursor: pointer;
          transition: all var(--transition);
        }

        .request-card:hover {
          transform: translateX(4px);
          box-shadow: var(--shadow-md);
        }

        .request-avatar {
          width: 64px;
          height: 64px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .request-info {
          flex: 1;
        }

        .request-header {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          margin-bottom: var(--space-2);
        }

        .request-header h3 {
          font-size: 1.125rem;
        }

        .status-badge {
          padding: var(--space-1) var(--space-3);
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .status-badge.pending {
          background: rgba(245, 158, 11, 0.1);
          color: var(--warning);
        }

        .status-badge.matched {
          background: rgba(16, 185, 129, 0.1);
          color: var(--success);
        }

        .status-badge.large {
          padding: var(--space-2) var(--space-4);
          font-size: 0.875rem;
        }

        .request-details {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-4);
          margin-bottom: var(--space-2);
        }

        .request-details span {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          font-size: 0.875rem;
          color: var(--text-light);
        }

        .request-date {
          font-size: 0.75rem;
          color: var(--text-light);
        }

        .request-actions {
          display: flex;
          gap: var(--space-2);
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: var(--space-6);
        }

        .profile-modal {
          background: white;
          border-radius: var(--radius-2xl);
          padding: var(--space-8);
          max-width: 560px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          box-shadow: var(--shadow-lg);
        }

        .modal-close {
          position: absolute;
          top: var(--space-4);
          right: var(--space-4);
          width: 40px;
          height: 40px;
          border-radius: var(--radius-full);
          background: var(--bg);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .modal-close:hover {
          background: var(--border);
          color: var(--text-dark);
        }

        .profile-header {
          display: flex;
          align-items: center;
          gap: var(--space-5);
          margin-bottom: var(--space-6);
          padding-bottom: var(--space-6);
          border-bottom: 1px solid var(--border-light);
        }

        .profile-avatar-xl {
          width: 96px;
          height: 96px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 2rem;
          flex-shrink: 0;
        }

        .profile-title h2 {
          font-size: 1.5rem;
          margin-bottom: var(--space-1);
        }

        .profile-subtitle {
          color: var(--primary);
          font-weight: 600;
          margin-bottom: var(--space-2);
        }

        .profile-rating {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-weight: 700;
        }

        .profile-rating small {
          font-weight: 400;
          color: var(--text-light);
        }

        .profile-section {
          margin-bottom: var(--space-6);
        }

        .profile-section h4 {
          margin-bottom: var(--space-3);
          color: var(--text-dark);
        }

        .profile-section p {
          line-height: 1.7;
          color: var(--text);
        }

        .profile-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-4);
          padding: var(--space-5);
          background: var(--bg);
          border-radius: var(--radius-xl);
          margin-bottom: var(--space-6);
        }

        .profile-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-1);
          color: var(--primary);
        }

        .stat-value {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--text-dark);
        }

        .stat-label {
          font-size: 0.75rem;
          color: var(--text-light);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .detail-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          color: var(--text);
        }

        .profile-footer {
          display: flex;
          gap: var(--space-3);
          padding-top: var(--space-6);
          border-top: 1px solid var(--border-light);
        }

        .profile-footer .btn {
          flex: 1;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .sidebar {
            transform: translateX(-100%);
          }

          .main-content {
            margin-left: 0;
          }

          .tutors-grid {
            grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          }
        }

        @media (max-width: 768px) {
          .content-header {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--space-4);
          }

          .request-card {
            flex-direction: column;
            align-items: flex-start;
          }

          .request-actions {
            width: 100%;
          }

          .search-bar {
            width: 100%;
          }

          .user-info {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
