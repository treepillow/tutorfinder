// Cute circle-guy empty states used across the app

function CircleGuyBase({ children, size = 120 }: { children: React.ReactNode; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {children}
    </svg>
  );
}

// 🔍 Searching — holding a magnifying glass, one eye big
export function CircleGuySearching({ size = 120 }: { size?: number }) {
  return (
    <CircleGuyBase size={size}>
      <ellipse cx="50" cy="93" rx="20" ry="5" fill="#888" opacity="0.2"/>
      <rect x="31" y="74" width="14" height="15" rx="5" fill="#3b4dbf"/>
      <rect x="55" y="74" width="14" height="15" rx="5" fill="#3b4dbf"/>
      <circle cx="50" cy="46" r="38" fill="#4d7fe8"/>
      <circle cx="38" cy="32" r="14" fill="#6b97f0" opacity="0.35"/>
      {/* Eyes — both normal size, pupils shifted right (looking at glass) */}
      <circle cx="37" cy="43" r="10" fill="white"/>
      <circle cx="63" cy="43" r="10" fill="white"/>
      <circle cx="40" cy="44" r="6" fill="#1a1a2e"/>
      <circle cx="66" cy="44" r="6" fill="#1a1a2e"/>
      <circle cx="42" cy="42" r="2" fill="white"/>
      <circle cx="68" cy="42" r="2" fill="white"/>
      {/* Raised eyebrow left */}
      <path d="M30 34 Q37 30 44 33" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round" fill="none"/>
      {/* Smile — slight */}
      <path d="M41 61 Q50 67 59 61" stroke="#1a1a2e" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* Arm holding magnifying glass */}
      <path d="M78 60 Q88 52 90 44" stroke="#3b4dbf" strokeWidth="8" strokeLinecap="round"/>
      {/* Magnifying glass */}
      <circle cx="90" cy="40" r="7" stroke="#1a1a2e" strokeWidth="3" fill="white"/>
      <line x1="95" y1="45" x2="99" y2="50" stroke="#1a1a2e" strokeWidth="3" strokeLinecap="round"/>
    </CircleGuyBase>
  );
}

// 🎉 Seen everyone — arms up, party eyes
export function CircleGuyParty({ size = 120 }: { size?: number }) {
  return (
    <CircleGuyBase size={size}>
      <ellipse cx="50" cy="93" rx="20" ry="5" fill="#888" opacity="0.2"/>
      <rect x="31" y="74" width="14" height="15" rx="5" fill="#3b4dbf"/>
      <rect x="55" y="74" width="14" height="15" rx="5" fill="#3b4dbf"/>
      {/* Arms up */}
      <path d="M22 65 Q14 50 12 36" stroke="#3b4dbf" strokeWidth="9" strokeLinecap="round"/>
      <path d="M78 65 Q86 50 88 36" stroke="#3b4dbf" strokeWidth="9" strokeLinecap="round"/>
      <circle cx="50" cy="46" r="38" fill="#4d7fe8"/>
      <circle cx="38" cy="32" r="14" fill="#6b97f0" opacity="0.35"/>
      {/* Happy crescent eyes — downturned ^_^ arcs */}
      <path d="M27 46 Q37 38 47 46" stroke="#1a1a2e" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M53 46 Q63 38 73 46" stroke="#1a1a2e" strokeWidth="3" strokeLinecap="round" fill="none"/>
      {/* Rosy cheeks */}
      <circle cx="28" cy="54" r="5" fill="#ff9eb5" opacity="0.45"/>
      <circle cx="72" cy="54" r="5" fill="#ff9eb5" opacity="0.45"/>
      {/* Big grin */}
      <path d="M36 62 Q50 74 64 62" stroke="#1a1a2e" strokeWidth="3" fill="none" strokeLinecap="round"/>
      {/* Confetti bits */}
      <rect x="8"  y="18" width="5" height="8"  rx="2" fill="#FF9800" transform="rotate(-20 8 18)"/>
      <rect x="82" y="14" width="5" height="8"  rx="2" fill="#F44336" transform="rotate(15 82 14)"/>
      <circle cx="18" cy="30" r="3.5" fill="#4CAF50"/>
      <circle cx="80" cy="26" r="3.5" fill="#9C27B0"/>
      <rect x="88" y="30" width="4" height="7" rx="2" fill="#FF4081" transform="rotate(30 88 30)"/>
    </CircleGuyBase>
  );
}

// 💬 No matches — shy, looking sideways, small blush
export function CircleGuyLonely({ size = 120 }: { size?: number }) {
  return (
    <CircleGuyBase size={size}>
      <ellipse cx="50" cy="93" rx="20" ry="5" fill="#888" opacity="0.2"/>
      <rect x="31" y="74" width="14" height="15" rx="5" fill="#3b4dbf"/>
      <rect x="55" y="74" width="14" height="15" rx="5" fill="#3b4dbf"/>
      <circle cx="50" cy="46" r="38" fill="#4d7fe8"/>
      <circle cx="38" cy="32" r="14" fill="#6b97f0" opacity="0.35"/>
      {/* Eyes looking right */}
      <circle cx="37" cy="43" r="10" fill="white"/>
      <circle cx="63" cy="43" r="10" fill="white"/>
      <circle cx="41" cy="44" r="6" fill="#1a1a2e"/>
      <circle cx="67" cy="44" r="6" fill="#1a1a2e"/>
      {/* Sad-ish mouth */}
      <path d="M41 63 Q50 59 59 63" stroke="#1a1a2e" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* Blush */}
      <circle cx="28" cy="54" r="6" fill="#ff9eb5" opacity="0.5"/>
      <circle cx="72" cy="54" r="6" fill="#ff9eb5" opacity="0.5"/>
      {/* Little sweat drop */}
      <path d="M74 22 Q76 17 78 22 Q78 26 74 26 Z" fill="#7EC8E3" opacity="0.8"/>
    </CircleGuyBase>
  );
}

// 📫 No requests — shrugging, neutral face
export function CircleGuyShrug({ size = 120 }: { size?: number }) {
  return (
    <CircleGuyBase size={size}>
      <ellipse cx="50" cy="93" rx="20" ry="5" fill="#888" opacity="0.2"/>
      <rect x="31" y="74" width="14" height="15" rx="5" fill="#3b4dbf"/>
      <rect x="55" y="74" width="14" height="15" rx="5" fill="#3b4dbf"/>
      {/* Shrug arms — one up, one sideways */}
      <path d="M22 72 Q16 60 20 48" stroke="#3b4dbf" strokeWidth="9" strokeLinecap="round"/>
      <path d="M78 72 Q88 65 86 55" stroke="#3b4dbf" strokeWidth="9" strokeLinecap="round"/>
      <circle cx="50" cy="46" r="38" fill="#4d7fe8"/>
      <circle cx="38" cy="32" r="14" fill="#6b97f0" opacity="0.35"/>
      {/* Dot eyes */}
      <circle cx="37" cy="43" r="6" fill="white"/>
      <circle cx="63" cy="43" r="6" fill="white"/>
      <circle cx="37" cy="43" r="3.5" fill="#1a1a2e"/>
      <circle cx="63" cy="43" r="3.5" fill="#1a1a2e"/>
      {/* Flat mouth */}
      <line x1="40" y1="62" x2="60" y2="62" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Question mark */}
      <text x="84" y="46" fontSize="16" fill="#1a1a2e" opacity="0.5">?</text>
    </CircleGuyBase>
  );
}

// 💳 No payments — holding out a credit card
export function CircleGuySleeping({ size = 120 }: { size?: number }) {
  return (
    <CircleGuyBase size={size}>
      <ellipse cx="50" cy="93" rx="20" ry="5" fill="#888" opacity="0.2"/>
      <rect x="31" y="74" width="14" height="15" rx="5" fill="#3b4dbf"/>
      <rect x="55" y="74" width="14" height="15" rx="5" fill="#3b4dbf"/>
      {/* Right arm extended holding card */}
      <path d="M76 66 Q88 58 92 50" stroke="#3b4dbf" strokeWidth="9" strokeLinecap="round"/>
      {/* Credit card */}
      <rect x="82" y="34" width="26" height="17" rx="3" fill="#2952b3"/>
      {/* Card stripe */}
      <rect x="82" y="39" width="26" height="5" fill="#1a1a2e" opacity="0.4"/>
      {/* Card chip */}
      <rect x="85" y="44" width="7" height="5" rx="1" fill="#F5C842"/>
      {/* $ symbol on card */}
      <text x="96" y="50" fontSize="7" fill="white" opacity="0.9">$</text>
      <circle cx="50" cy="46" r="38" fill="#4d7fe8"/>
      <circle cx="38" cy="32" r="14" fill="#6b97f0" opacity="0.35"/>
      {/* Normal eyes */}
      <circle cx="37" cy="43" r="10" fill="white"/>
      <circle cx="63" cy="43" r="10" fill="white"/>
      <circle cx="39" cy="45" r="6" fill="#1a1a2e"/>
      <circle cx="65" cy="45" r="6" fill="#1a1a2e"/>
      <circle cx="41" cy="43" r="2" fill="white"/>
      <circle cx="67" cy="43" r="2" fill="white"/>
      {/* Neutral-friendly smile */}
      <path d="M41 61 Q50 67 59 61" stroke="#1a1a2e" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    </CircleGuyBase>
  );
}

// 📅 No schedule — holding a calendar, hopeful eyes
export function CircleGuyCalendar({ size = 120 }: { size?: number }) {
  return (
    <CircleGuyBase size={size}>
      <ellipse cx="50" cy="93" rx="20" ry="5" fill="#888" opacity="0.2"/>
      <rect x="31" y="74" width="14" height="15" rx="5" fill="#3b4dbf"/>
      <rect x="55" y="74" width="14" height="15" rx="5" fill="#3b4dbf"/>
      {/* Arm holding calendar */}
      <path d="M75 68 Q85 58 84 46" stroke="#3b4dbf" strokeWidth="9" strokeLinecap="round"/>
      {/* Calendar */}
      <rect x="78" y="28" width="20" height="18" rx="3" fill="white" stroke="#1a1a2e" strokeWidth="1.5"/>
      <rect x="78" y="28" width="20" height="6"  rx="3" fill="#7EC8E3"/>
      <rect x="78" y="31" width="20" height="3"  fill="#7EC8E3"/>
      <circle cx="83" cy="38" r="1.5" fill="#1a1a2e"/>
      <circle cx="88" cy="38" r="1.5" fill="#1a1a2e"/>
      <circle cx="93" cy="38" r="1.5" fill="#1a1a2e"/>
      <circle cx="83" cy="43" r="1.5" fill="#1a1a2e"/>
      <circle cx="88" cy="43" r="1.5" fill="#4CAF50"/>
      <line x1="82" y1="27" x2="82" y2="31" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round"/>
      <line x1="94" y1="27" x2="94" y2="31" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="50" cy="46" r="38" fill="#4d7fe8"/>
      <circle cx="38" cy="32" r="14" fill="#6b97f0" opacity="0.35"/>
      {/* Hopeful eyes — slightly upturned */}
      <circle cx="37" cy="43" r="10" fill="white"/>
      <circle cx="63" cy="43" r="10" fill="white"/>
      <circle cx="38" cy="41" r="6" fill="#1a1a2e"/>
      <circle cx="64" cy="41" r="6" fill="#1a1a2e"/>
      <circle cx="40" cy="39" r="2" fill="white"/>
      <circle cx="66" cy="39" r="2" fill="white"/>
      {/* Smile */}
      <path d="M40 60 Q50 68 60 60" stroke="#1a1a2e" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    </CircleGuyBase>
  );
}
