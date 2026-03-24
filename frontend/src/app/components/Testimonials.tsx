import { Star } from "lucide-react";
import { ImageWithFallback } from "./shared/ImageWithFallback";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Student",
    image: "https://images.unsplash.com/photo-1758600587839-56ba05596c69?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHByb2Zlc3Npb25hbCUyMGhlYWRzaG90JTIwYXNpYW4lMjB3b21hbnxlbnwxfHx8fDE3NzQzNTQwNjl8MA&ixlib=rb-4.1.0&q=80&w=1080",
    content: "I found my perfect Math tutor in just 15 minutes! The swipe interface made it so easy to browse through tutors and find someone who matched my learning style.",
    rating: 5,
  },
  {
    name: "David Tan",
    role: "Tutor",
    image: "https://images.unsplash.com/photo-1701463387028-3947648f1337?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHByb2Zlc3Npb25hbCUyMGhlYWRzaG90JTIwYXNpYW4lMjBtYW58ZW58MXx8fHwxNzc0MzU0MDcwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    content: "As a tutor, this platform has completely transformed how I find students. The scheduling system is brilliant and I love how I can set my own rates for different subjects.",
    rating: 5,
  },
  {
    name: "Emily Wong",
    role: "Student",
    image: "https://images.unsplash.com/photo-1725473823290-8a261fe706a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMHN0dWRlbnQlMjBwb3J0cmFpdCUyMGFzaWFufGVufDF8fHx8MTc3NDM1NDA3MHww&ixlib=rb-4.1.0&q=80&w=1080",
    content: "The verification process gave me confidence that I was working with qualified tutors. My grades have improved significantly since I started using TutorMatch!",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section id="reviews" className="py-32 bg-[#E9D8BB]">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center space-y-4 mb-20">
          <div className="inline-block px-4 py-1 bg-[#FFF2D5] text-[#2F3B3D] text-sm rounded-full">
            Testimonials
          </div>
          <h3 className="text-5xl tracking-tight text-[#2F3B3D]">
            What our community says
          </h3>
          <p className="text-lg text-[#2F3B3D]/70 max-w-2xl mx-auto">
            Join thousands of students and tutors who have found success with TutorMatch
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-[#FFF2D5] p-8 rounded-3xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex gap-1 mb-6">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-[#7C8D8C] text-[#7C8D8C]" />
                ))}
              </div>
              <p className="text-[#2F3B3D]/80 leading-relaxed mb-8">
                "{testimonial.content}"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-[#C9B08E]">
                  <ImageWithFallback
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-[#2F3B3D]">{testimonial.name}</p>
                  <p className="text-sm text-[#2F3B3D]/60">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid md:grid-cols-3 gap-8 text-center">
          <div className="bg-[#FFF2D5] p-8 rounded-3xl">
            <div className="text-5xl text-[#7C8D8C] mb-2">10K+</div>
            <div className="text-[#2F3B3D]/70">Active Users</div>
          </div>
          <div className="bg-[#FFF2D5] p-8 rounded-3xl">
            <div className="text-5xl text-[#7C8D8C] mb-2">50K+</div>
            <div className="text-[#2F3B3D]/70">Successful Matches</div>
          </div>
          <div className="bg-[#FFF2D5] p-8 rounded-3xl">
            <div className="text-5xl text-[#7C8D8C] mb-2">4.9/5</div>
            <div className="text-[#2F3B3D]/70">Average Rating</div>
          </div>
        </div>
      </div>
    </section>
  );
}
