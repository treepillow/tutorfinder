// Mock data for tutors and students

export const mockTutors = [
  {
    id: "t1",
    name: "Sarah Chen",
    age: 25,
    gender: "Female",
    location: "Orchard, Singapore",
    subjects: [
      { subject: "Mathematics", level: "Secondary 3-4", hourlyRate: "50" },
      { subject: "Physics", level: "Junior College", hourlyRate: "65" },
    ],
    qualification: "Bachelor's Degree",
    availability: {
      Monday: ["14:00-15:00", "15:00-16:00", "16:00-17:00"],
      Wednesday: ["14:00-15:00", "15:00-16:00", "16:00-17:00"],
      Friday: ["14:00-15:00", "15:00-16:00"],
    },
    profileImage: "https://i.pravatar.cc/300?img=5",
  },
  {
    id: "t2",
    name: "David Tan",
    age: 28,
    gender: "Male",
    location: "Tampines, Singapore",
    subjects: [
      { subject: "English", level: "Primary 4-6", hourlyRate: "40" },
      { subject: "English", level: "Secondary 1-2", hourlyRate: "45" },
    ],
    qualification: "Master's Degree",
    availability: {
      Tuesday: ["10:00-11:00", "11:00-12:00", "14:00-15:00"],
      Thursday: ["10:00-11:00", "11:00-12:00", "14:00-15:00"],
      Saturday: ["10:00-11:00", "11:00-12:00", "13:00-14:00"],
    },
    profileImage: "https://i.pravatar.cc/300?img=12",
  },
  {
    id: "t3",
    name: "Emily Wong",
    age: 23,
    gender: "Female",
    location: "Bukit Timah, Singapore",
    subjects: [
      { subject: "Chemistry", level: "Secondary 3-4", hourlyRate: "55" },
      { subject: "Biology", level: "Junior College", hourlyRate: "60" },
    ],
    qualification: "Bachelor's Degree",
    availability: {
      Monday: ["16:00-17:00", "17:00-18:00", "18:00-19:00"],
      Wednesday: ["16:00-17:00", "17:00-18:00"],
      Friday: ["16:00-17:00", "17:00-18:00", "18:00-19:00"],
    },
    profileImage: "https://i.pravatar.cc/300?img=9",
  },
  {
    id: "t4",
    name: "Marcus Lim",
    age: 30,
    gender: "Male",
    location: "Jurong East, Singapore",
    subjects: [
      { subject: "Chinese", level: "Primary 4-6", hourlyRate: "45" },
      { subject: "Chinese", level: "Secondary 1-2", hourlyRate: "50" },
    ],
    qualification: "Bachelor's Degree",
    availability: {
      Tuesday: ["14:00-15:00", "15:00-16:00", "16:00-17:00"],
      Thursday: ["14:00-15:00", "15:00-16:00", "16:00-17:00"],
      Sunday: ["10:00-11:00", "11:00-12:00", "13:00-14:00"],
    },
    profileImage: "https://i.pravatar.cc/300?img=13",
  },
];

export const mockStudents = [
  {
    id: "s1",
    name: "Alex Koh",
    age: 15,
    gender: "Male",
    location: "Bishan, Singapore",
    subjects: [
      { subject: "Mathematics", level: "Secondary 3-4", budget: "50" },
      { subject: "Physics", level: "Secondary 3-4", budget: "55" },
    ],
    profileImage: "https://i.pravatar.cc/300?img=8",
  },
  {
    id: "s2",
    name: "Priya Sharma",
    age: 10,
    gender: "Female",
    location: "Clementi, Singapore",
    subjects: [
      { subject: "English", level: "Primary 4-6", budget: "40" },
      { subject: "Science", level: "Primary 4-6", budget: "40" },
    ],
    profileImage: "https://i.pravatar.cc/300?img=10",
  },
  {
    id: "s3",
    name: "Ryan Lee",
    age: 17,
    gender: "Male",
    location: "Ang Mo Kio, Singapore",
    subjects: [
      { subject: "Chemistry", level: "Junior College", budget: "60" },
      { subject: "Biology", level: "Junior College", budget: "60" },
    ],
    profileImage: "https://i.pravatar.cc/300?img=14",
  },
  {
    id: "s4",
    name: "Sophie Ng",
    age: 12,
    gender: "Female",
    location: "Pasir Ris, Singapore",
    subjects: [
      { subject: "Chinese", level: "Primary 4-6", budget: "45" },
    ],
    profileImage: "https://i.pravatar.cc/300?img=16",
  },
];

// Helper to get mock profiles based on user type
export function getMockProfiles(userType: "student" | "tutor") {
  return userType === "student" ? mockTutors : mockStudents;
}

// Helper to get a profile by ID
export function getProfileById(id: string) {
  const allProfiles = [...mockTutors, ...mockStudents];
  return allProfiles.find(p => p.id === id);
}
