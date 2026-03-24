import { Heart, Calendar, Shield, Zap } from "lucide-react";

const features = [
  {
    icon: Heart,
    title: "Intuitive Matching",
    description: "Swipe through profiles just like modern dating apps. Left to skip, right to match. It's that simple.",
  },
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description: "Seamlessly coordinate availability with integrated scheduling. Book lessons at times that work for everyone.",
  },
  {
    icon: Shield,
    title: "Verified Profiles",
    description: "All tutors are verified with their educational credentials. Learn with confidence and peace of mind.",
  },
  {
    icon: Zap,
    title: "Instant Connections",
    description: "Get matched instantly when both parties swipe right. Start your learning journey without delays.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-32 bg-[#E9D8BB]">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center space-y-4 mb-20">
          <div className="inline-block px-4 py-1 bg-[#FFF2D5] text-[#2F3B3D] text-sm rounded-full">
            Key Features
          </div>
          <h3 className="text-5xl tracking-tight text-[#2F3B3D]">
            Everything you need to succeed
          </h3>
          <p className="text-lg text-[#2F3B3D]/70 max-w-2xl mx-auto">
            Powerful features designed to make finding and booking tutors effortless
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-[#FFF2D5] p-8 rounded-3xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="w-14 h-14 bg-[#7C8D8C] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#2F3B3D] transition-colors duration-300">
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h4 className="text-xl text-[#2F3B3D] mb-3">
                {feature.title}
              </h4>
              <p className="text-[#2F3B3D]/70 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
