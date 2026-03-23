import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { 
  Mail, 
  Lock, 
  User, 
  Phone, 
  FileText, 
  GraduationCap,
  ChevronRight,
  ChevronLeft,
  Check,
  BookOpen,
  MapPin,
  DollarSign,
  Clock
} from 'lucide-react';

interface RegisterPageProps {
  onNavigate: (page: string) => void;
}

const subjects = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology',
  'English', 'History', 'Geography', 'Computer Science',
  'Economics', 'Chinese', 'Malay', 'Tamil', 'Music', 'Art'
];

const levels = ['Primary 1-3', 'Primary 4-6', 'Secondary 1-2', 'Secondary 3-4', 'JC 1-2', 'University'];

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const timeSlots = ['Morning (8am-12pm)', 'Afternoon (12pm-5pm)', 'Evening (5pm-9pm)'];

export function RegisterPage({ onNavigate }: RegisterPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<'tutor' | 'tutee'>('tutee');
  const [isLoading, setIsLoading] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    contact: '',
    blurb: '',
    gender: '',
    selectedSubjects: [] as string[],
    selectedLevels: [] as string[],
    availability: {} as Record<string, string[]>,
    price: '',
    location: ''
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.register-container',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
      );

      gsap.to('.floating-shape', {
        y: -20,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
        stagger: 0.8
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    // Animate step change
    gsap.fromTo('.step-content',
      { x: step === 1 ? 20 : -20, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }
    );
  }, [step]);

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleSubject = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      selectedSubjects: prev.selectedSubjects.includes(subject)
        ? prev.selectedSubjects.filter(s => s !== subject)
        : [...prev.selectedSubjects, subject]
    }));
  };

  const toggleLevel = (level: string) => {
    setFormData(prev => ({
      ...prev,
      selectedLevels: prev.selectedLevels.includes(level)
        ? prev.selectedLevels.filter(l => l !== level)
        : [...prev.selectedLevels, level]
    }));
  };

  const toggleAvailability = (day: string, slot: string) => {
    setFormData(prev => {
      const current = prev.availability[day] || [];
      const updated = current.includes(slot)
        ? current.filter(s => s !== slot)
        : [...current, slot];
      return {
        ...prev,
        availability: { ...prev.availability, [day]: updated }
      };
    });
  };

  const handleNext = async () => {
    if (step === 2) {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsLoading(false);
      onNavigate('dashboard');
    } else {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const progress = (step / 2) * 100;

  return (
    <div ref={containerRef} className="register-page">
      {/* Background Shapes */}
      <div className="floating-shapes">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
      </div>

      <div className="register-container">
        <div className="register-card">
          {/* Header */}
          <div className="register-header">
            <div className="register-logo" onClick={() => onNavigate('landing')}>
              <div className="logo-icon-medium">
                <GraduationCap size={32} />
              </div>
              <span className="logo-text-medium">TutorFinder</span>
            </div>
            
            <div className="step-indicator">
              <div className="step-progress">
                <div className="step-progress-bar" style={{ width: `${progress}%` }}></div>
              </div>
              <div className="step-labels">
                <span className={step >= 1 ? 'active' : ''}>Basic Info</span>
                <span className={step >= 2 ? 'active' : ''}>Preferences</span>
              </div>
            </div>
          </div>

          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="step-content">
              <div className="step-header">
                <h2>Create Your Account</h2>
                <p>Tell us a bit about yourself to get started</p>
              </div>

              {/* Role Selection */}
              <div className="role-selection">
                <label className="form-label">I am a...</label>
                <div className="role-buttons">
                  <button
                    type="button"
                    className={`role-btn ${role === 'tutee' ? 'active' : ''}`}
                    onClick={() => setRole('tutee')}
                  >
                    <BookOpen size={24} />
                    <span>Student</span>
                    <small>Looking for a tutor</small>
                  </button>
                  <button
                    type="button"
                    className={`role-btn ${role === 'tutor' ? 'active' : ''}`}
                    onClick={() => setRole('tutor')}
                  >
                    <GraduationCap size={24} />
                    <span>Tutor</span>
                    <small>Want to teach</small>
                  </button>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <div className="input-wrapper">
                    <User className="input-icon" size={18} />
                    <input
                      type="text"
                      className="form-input input-with-icon"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select
                    className="form-select"
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not">Prefer not to say</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div className="input-wrapper">
                    <Mail className="input-icon" size={18} />
                    <input
                      type="email"
                      className="form-input input-with-icon"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Number</label>
                  <div className="input-wrapper">
                    <Phone className="input-icon" size={18} />
                    <input
                      type="tel"
                      className="form-input input-with-icon"
                      placeholder="Enter phone number"
                      value={formData.contact}
                      onChange={(e) => handleInputChange('contact', e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group full-width">
                  <label className="form-label">About Yourself</label>
                  <div className="input-wrapper">
                    <FileText className="input-icon textarea-icon" size={18} />
                    <textarea
                      className="form-textarea input-with-icon"
                      placeholder={role === 'tutor' ? 'Tell students about your teaching experience...' : 'Tell tutors about your learning goals...'}
                      rows={3}
                      value={formData.blurb}
                      onChange={(e) => handleInputChange('blurb', e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group full-width">
                  <label className="form-label">Password</label>
                  <div className="input-wrapper">
                    <Lock className="input-icon" size={18} />
                    <input
                      type="password"
                      className="form-input input-with-icon"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <button className="btn btn-primary btn-lg step-btn" onClick={handleNext}>
                Continue
                <ChevronRight size={20} />
              </button>
            </div>
          )}

          {/* Step 2: Subject & Availability */}
          {step === 2 && (
            <div className="step-content">
              <div className="step-header">
                <h2>{role === 'tutor' ? 'Your Teaching Preferences' : 'Your Learning Preferences'}</h2>
                <p>Help us match you with the perfect {role === 'tutor' ? 'students' : 'tutor'}</p>
              </div>

              {/* Subjects */}
              <div className="preference-section">
                <label className="form-label">
                  <BookOpen size={18} />
                  {role === 'tutor' ? 'Subjects You Teach' : 'Subjects You Need Help With'}
                </label>
                <div className="tag-grid">
                  {subjects.map(subject => (
                    <button
                      key={subject}
                      type="button"
                      className={`tag-btn ${formData.selectedSubjects.includes(subject) ? 'active' : ''}`}
                      onClick={() => toggleSubject(subject)}
                    >
                      {formData.selectedSubjects.includes(subject) && <Check size={14} />}
                      {subject}
                    </button>
                  ))}
                </div>
              </div>

              {/* Levels */}
              <div className="preference-section">
                <label className="form-label">
                  <GraduationCap size={18} />
                  Education Level
                </label>
                <div className="tag-grid">
                  {levels.map(level => (
                    <button
                      key={level}
                      type="button"
                      className={`tag-btn ${formData.selectedLevels.includes(level) ? 'active' : ''}`}
                      onClick={() => toggleLevel(level)}
                    >
                      {formData.selectedLevels.includes(level) && <Check size={14} />}
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price (for tutors) or Budget (for tutees) */}
              <div className="preference-section">
                <label className="form-label">
                  <DollarSign size={18} />
                  {role === 'tutor' ? 'Hourly Rate (SGD)' : 'Budget per Hour (SGD)'}
                </label>
                <div className="input-wrapper price-input">
                  <span className="currency">$</span>
                  <input
                    type="number"
                    className="form-input"
                    placeholder={role === 'tutor' ? '50' : 'Max budget'}
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                  />
                  <span className="per-hour">/hour</span>
                </div>
              </div>

              {/* Location */}
              <div className="preference-section">
                <label className="form-label">
                  <MapPin size={18} />
                  Location
                </label>
                <div className="input-wrapper">
                  <MapPin className="input-icon" size={18} />
                  <input
                    type="text"
                    className="form-input input-with-icon"
                    placeholder="e.g., Jurong East, Bukit Timah, Online"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                  />
                </div>
              </div>

              {/* Availability */}
              <div className="preference-section">
                <label className="form-label">
                  <Clock size={18} />
                  Your Availability
                </label>
                <div className="availability-grid">
                  {days.map(day => (
                    <div key={day} className="availability-day">
                      <div className="day-label">{day}</div>
                      <div className="time-slots">
                        {timeSlots.map(slot => (
                          <button
                            key={slot}
                            type="button"
                            className={`time-slot ${(formData.availability[day] || []).includes(slot) ? 'active' : ''}`}
                            onClick={() => toggleAvailability(day, slot)}
                          >
                            {(formData.availability[day] || []).includes(slot) && <Check size={12} />}
                            <span>{slot.split(' ')[0]}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="step-actions">
                <button className="btn btn-secondary step-btn" onClick={handleBack}>
                  <ChevronLeft size={20} />
                  Back
                </button>
                <button 
                  className="btn btn-primary btn-lg step-btn" 
                  onClick={handleNext}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="loading-spinner"></span>
                  ) : (
                    <>
                      Complete Registration
                      <Check size={20} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="register-footer">
            <p>
              Already have an account?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('login'); }}>
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .register-page {
          min-height: 100vh;
          padding: 100px var(--space-6) var(--space-12);
          background: linear-gradient(135deg, #fafafa 0%, #f0f4ff 50%, #faf5ff 100%);
          position: relative;
          overflow: hidden;
        }

        .floating-shapes {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
        }

        .floating-shape {
          position: absolute;
          border-radius: 50%;
          opacity: 0.4;
        }

        .shape-1 {
          width: 400px;
          height: 400px;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.1));
          top: -200px;
          right: -100px;
        }

        .shape-2 {
          width: 300px;
          height: 300px;
          background: linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(251, 146, 60, 0.1));
          bottom: -100px;
          left: -100px;
        }

        .shape-3 {
          width: 200px;
          height: 200px;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(52, 211, 153, 0.1));
          top: 50%;
          right: 5%;
        }

        .register-container {
          max-width: 720px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .register-card {
          background: white;
          border-radius: var(--radius-2xl);
          padding: var(--space-8);
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--border-light);
        }

        .register-header {
          margin-bottom: var(--space-8);
        }

        .register-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          margin-bottom: var(--space-6);
          cursor: pointer;
        }

        .logo-icon-medium {
          width: 48px;
          height: 48px;
          background: var(--primary-gradient);
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .logo-text-medium {
          font-size: 1.5rem;
          font-weight: 800;
          background: var(--primary-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .step-indicator {
          margin-top: var(--space-6);
        }

        .step-progress {
          height: 6px;
          background: var(--border-light);
          border-radius: var(--radius-full);
          overflow: hidden;
          margin-bottom: var(--space-3);
        }

        .step-progress-bar {
          height: 100%;
          background: var(--primary-gradient);
          border-radius: var(--radius-full);
          transition: width 0.5s ease;
        }

        .step-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-light);
        }

        .step-labels .active {
          color: var(--primary);
        }

        .step-header {
          text-align: center;
          margin-bottom: var(--space-6);
        }

        .step-header h2 {
          font-size: 1.5rem;
          margin-bottom: var(--space-2);
        }

        .step-header p {
          color: var(--text-light);
        }

        .role-selection {
          margin-bottom: var(--space-6);
        }

        .role-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-4);
          margin-top: var(--space-3);
        }

        .role-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-6);
          background: var(--bg);
          border: 2px solid var(--border);
          border-radius: var(--radius-xl);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .role-btn:hover {
          border-color: var(--primary-light);
        }

        .role-btn.active {
          background: rgba(99, 102, 241, 0.05);
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .role-btn span {
          font-weight: 700;
          color: var(--text-dark);
        }

        .role-btn small {
          font-size: 0.75rem;
          color: var(--text-light);
        }

        .role-btn.active span {
          color: var(--primary);
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-4);
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .textarea-icon {
          top: var(--space-4);
          transform: none;
        }

        .input-with-icon {
          padding-left: var(--space-10);
        }

        .preference-section {
          margin-bottom: var(--space-6);
        }

        .preference-section .form-label {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          margin-bottom: var(--space-3);
        }

        .tag-grid {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
        }

        .tag-btn {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          padding: var(--space-2) var(--space-3);
          background: var(--bg);
          border: 2px solid var(--border);
          border-radius: var(--radius-full);
          font-family: inherit;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .tag-btn:hover {
          border-color: var(--primary-light);
        }

        .tag-btn.active {
          background: var(--primary);
          border-color: var(--primary);
          color: white;
        }

        .price-input {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .price-input .currency,
        .price-input .per-hour {
          font-weight: 600;
          color: var(--text-light);
        }

        .price-input .form-input {
          width: 120px;
          text-align: center;
        }

        .availability-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: var(--space-2);
        }

        .availability-day {
          text-align: center;
        }

        .day-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-light);
          margin-bottom: var(--space-2);
          text-transform: uppercase;
        }

        .time-slots {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }

        .time-slot {
          padding: var(--space-1);
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          font-size: 0.625rem;
          font-weight: 600;
          color: var(--text-light);
          cursor: pointer;
          transition: all var(--transition-fast);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2px;
        }

        .time-slot:hover {
          border-color: var(--primary-light);
        }

        .time-slot.active {
          background: var(--primary);
          border-color: var(--primary);
          color: white;
        }

        .step-btn {
          width: 100%;
          margin-top: var(--space-6);
        }

        .step-actions {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: var(--space-4);
        }

        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .register-footer {
          text-align: center;
          margin-top: var(--space-6);
          padding-top: var(--space-6);
          border-top: 1px solid var(--border-light);
        }

        .register-footer p {
          color: var(--text-light);
        }

        .register-footer a {
          color: var(--primary);
          font-weight: 600;
        }

        @media (max-width: 640px) {
          .form-grid {
            grid-template-columns: 1fr;
          }

          .role-buttons {
            grid-template-columns: 1fr;
          }

          .availability-grid {
            grid-template-columns: repeat(4, 1fr);
          }

          .step-actions {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
