import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Calendar, Clock, BookOpen, User } from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const HOURS = Array.from({ length: 12 }, (_, i) => i + 10); // 10am to 9pm

export function SchedulePage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem("currentUser");
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }

    // Load accepted requests as scheduled lessons
    const allRequests = JSON.parse(localStorage.getItem("requests") || "[]");
    const acceptedLessons = allRequests.filter((r: any) => r.status === "accepted");
    setSchedule(acceptedLessons);
  }, []);

  const getLessonForSlot = (day: string, hour: number) => {
    const timeSlot = `${hour}:00-${hour + 1}:00`;
    return schedule.find((lesson) => 
      lesson.day === day && lesson.slots.includes(timeSlot)
    );
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl tracking-tight text-[#2F3B3D] mb-2">
            Schedule
          </h1>
          <p className="text-[#2F3B3D]/70">
            Your weekly schedule at a glance
          </p>
        </div>

        <div className="bg-[#E9D8BB] rounded-3xl p-6 overflow-x-auto">
          <div className="min-w-[1000px]">
            <div className="grid grid-cols-8 gap-2">
              {/* Header */}
              <div className="p-3"></div>
              {DAYS.map((day) => (
                <div key={day} className="p-3 text-center text-[#2F3B3D]">
                  {day}
                </div>
              ))}

              {/* Time Slots */}
              {HOURS.map((hour) => (
                <>
                  <div key={`label-${hour}`} className="p-3 text-[#2F3B3D]/70 text-sm flex items-center justify-center">
                    {hour}:00
                  </div>
                  {DAYS.map((day) => {
                    const lesson = getLessonForSlot(day, hour);
                    return (
                      <button
                        key={`${day}-${hour}`}
                        onClick={() => lesson && setSelectedLesson(lesson)}
                        className={`p-3 rounded-lg min-h-[60px] transition-all duration-200 ${
                          lesson
                            ? "bg-[#7C8D8C] text-white hover:bg-[#2F3B3D] cursor-pointer"
                            : "bg-[#FFF2D5] hover:bg-white"
                        }`}
                      >
                        {lesson && (
                          <div className="text-xs">
                            <div className="truncate">{lesson.subject}</div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </>
              ))}
            </div>
          </div>
        </div>

        {schedule.length === 0 && (
          <div className="mt-8 bg-[#E9D8BB] rounded-2xl p-12 text-center">
            <div className="text-5xl mb-3">📅</div>
            <h3 className="text-xl text-[#2F3B3D] mb-2">No lessons scheduled yet</h3>
            <p className="text-[#2F3B3D]/70">
              {currentUser.userType === "student" 
                ? "Book lessons with your matched tutors to see them here"
                : "Accept student requests to see scheduled lessons"}
            </p>
          </div>
        )}
      </div>

      {selectedLesson && (
        <Dialog open={true} onOpenChange={() => setSelectedLesson(null)}>
          <DialogContent className="bg-[#FFF2D5] border-[#C9B08E]">
            <DialogHeader>
              <DialogTitle className="text-2xl text-[#2F3B3D]">Lesson Details</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-[#7C8D8C]" />
                <div>
                  <div className="text-sm text-[#2F3B3D]/70">
                    {currentUser.userType === "student" ? "Tutor" : "Student"}
                  </div>
                  <div className="text-[#2F3B3D]">{selectedLesson.tutorName || "Student"}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-[#7C8D8C]" />
                <div>
                  <div className="text-sm text-[#2F3B3D]/70">Subject</div>
                  <div className="text-[#2F3B3D]">{selectedLesson.subject} - {selectedLesson.level}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-[#7C8D8C]" />
                <div>
                  <div className="text-sm text-[#2F3B3D]/70">Day</div>
                  <div className="text-[#2F3B3D]">{selectedLesson.day}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#7C8D8C] mt-1" />
                <div>
                  <div className="text-sm text-[#2F3B3D]/70 mb-2">Time Slots</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedLesson.slots.map((slot: string) => (
                      <span key={slot} className="px-3 py-1 bg-[#E9D8BB] text-[#2F3B3D] rounded-full text-sm">
                        {slot}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-[#E9D8BB] p-4 rounded-xl flex items-center justify-between">
                <span className="text-[#2F3B3D]">Total</span>
                <span className="text-2xl text-[#7C8D8C]">${selectedLesson.price}</span>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
