import { UserPlus, Search, MessageCircle, GraduationCap } from "lucide-react";
import { ImageWithFallback } from "./shared/ImageWithFallback";

const steps = [
  {
    icon: UserPlus,
    title: "Create Your Profile",
    description: "Sign up as a tutor or student. Add your subjects, availability, and preferences.",
    color: "#7C8D8C",
  },
  {
    icon: Search,
    title: "Discover & Swipe",
    description: "Browse through curated profiles. Swipe right if interested, left to pass.",
    color: "#C9B08E",
  },
  {
    icon: MessageCircle,
    title: "Match & Connect",
    description: "When both parties swipe right, it's a match! Start chatting and coordinate details.",
    color: "#7C8D8C",
  },
  {
    icon: GraduationCap,
    title: "Book & Learn",
    description: "Schedule your sessions, make secure payments, and start your learning journey.",
    color: "#C9B08E",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-32 bg-[#FFF2D5]">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center space-y-4 mb-20">
          <div className="inline-block px-4 py-1 bg-[#E9D8BB] text-[#2F3B3D] text-sm rounded-full">
            How It Works
          </div>
          <h3 className="text-5xl tracking-tight text-[#2F3B3D]">
            Simple steps to success
          </h3>
        </div>

        {/* For Students */}
        <div className="mb-24">
          <h4 className="text-3xl tracking-tight text-[#2F3B3D] mb-12 text-center">
            For Students
          </h4>
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-12">
            <div className="space-y-8">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-6 group">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: step.color }}
                  >
                    <step.icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h5 className="text-xl text-[#2F3B3D] mb-2">
                      {index + 1}. {step.title}
                    </h5>
                    <p className="text-[#2F3B3D]/70 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="relative">
              <div className="aspect-[3/4] rounded-3xl overflow-hidden bg-[#E9D8BB]">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1701627091488-027ddbf45dfc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwc3R1ZHlpbmclMjBjb2ZmZWUlMjBzaG9wfGVufDF8fHx8MTc3NDM1NDA2OXww&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Student studying"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* For Tutors */}
        <div className="bg-[#E9D8BB] rounded-3xl p-12">
          <h4 className="text-3xl tracking-tight text-[#2F3B3D] mb-12 text-center">
            For Tutors
          </h4>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-[#7C8D8C] rounded-2xl flex items-center justify-center mx-auto">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <h5 className="text-lg text-[#2F3B3D]">Set Up Profile</h5>
              <p className="text-sm text-[#2F3B3D]/70">
                List your subjects, credentials, rates, and availability
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-[#C9B08E] rounded-2xl flex items-center justify-center mx-auto">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h5 className="text-lg text-[#2F3B3D]">Review Students</h5>
              <p className="text-sm text-[#2F3B3D]/70">
                Swipe through student profiles that match your expertise
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-[#7C8D8C] rounded-2xl flex items-center justify-center mx-auto">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h5 className="text-lg text-[#2F3B3D]">Accept Requests</h5>
              <p className="text-sm text-[#2F3B3D]/70">
                Receive booking requests and confirm sessions
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-[#C9B08E] rounded-2xl flex items-center justify-center mx-auto">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <h5 className="text-lg text-[#2F3B3D]">Start Teaching</h5>
              <p className="text-sm text-[#2F3B3D]/70">
                Manage your schedule and get paid securely
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
