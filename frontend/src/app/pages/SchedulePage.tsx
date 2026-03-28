import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Calendar, Clock, BookOpen, User } from "lucide-react";
import { getCurrentUser, bookingApi, profileApi, enrichProfile } from "../utils/api";
import { toast } from "sonner";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const HOURS = Array.from({ length: 12 }, (_, i) => i + 10); // 10am to 9pm

export function SchedulePage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const isDragging = useRef(false);
  const dragMode = useRef<"select" | "deselect">("select");

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
      loadSchedule(user);
    }
  }, []);

  const loadSchedule = async (user: any) => {
    setLoading(true);
    try {
      // Get confirmed bookings
      const res = await bookingApi.getByUser(user.id, "Confirmed");
      const bookings = res.bookings || [];

      // Enrich with profile data
      const enriched = await Promise.all(
        bookings.map(async (booking: any) => {
          const otherUserId = user.userType === "student" ? booking.tutor_id : booking.tutee_id;
          let otherProfile: any = {};
          try {
            const p = await profileApi.getProfile(otherUserId);
            otherProfile = enrichProfile(p);
          } catch {
            otherProfile = { name: `User #${otherUserId}` };
          }
          // Convert lesson_date to day of week
          const date = new Date(booking.lesson_date + "T00:00:00");
          const dayName = DAYS[date.getDay() === 0 ? 6 : date.getDay() - 1];

          return {
            ...booking,
            day: dayName,
            date: booking.lesson_date,
            startHour: parseInt(booking.start_time?.split(":")[0] || "0"),
            endHour: parseInt(booking.end_time?.split(":")[0] || "0"),
            subject: otherProfile.subjects?.[0]?.subject || "Lesson",
            level: otherProfile.subjects?.[0]?.level || "",
            tutorName: user.userType === "student" ? otherProfile.name : user.name,
            studentName: user.userType === "tutor" ? otherProfile.name : user.name,
            otherName: otherProfile.name,
            price: otherProfile.subjects?.[0]?.hourlyRate || otherProfile.price_rate || 0,
            slots: [`${booking.start_time?.slice(0, 5)}-${booking.end_time?.slice(0, 5)}`],
          };
        })
      );

      setSchedule(enriched);
    } catch (err: any) {
      console.error("Failed to load schedule:", err);
      toast.error("Failed to load schedule");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const stop = () => { isDragging.current = false; };
    window.addEventListener("mouseup", stop);
    return () => window.removeEventListener("mouseup", stop);
  }, []);

  const applySlot = (key: string) => {
    setSelectedSlots(prev => {
      const next = new Set(prev);
      dragMode.current === "select" ? next.add(key) : next.delete(key);
      return next;
    });
  };

  const getLessonForSlot = (day: string, hour: number) => {
    return schedule.find((lesson) =>
      lesson.day === day && lesson.startHour <= hour && lesson.endHour > hour
    );
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl tracking-tight text-[#2F3B3D] mb-2">
            Schedule
          </h1>
          <p className="text-[#2F3B3D]/70">
            Your weekly schedule at a glance
          </p>
        </div>

        {loading ? (
          <div className="bg-[#EDE9DF] rounded-3xl p-16 text-center">
            <p className="text-[#2F3B3D]/70 animate-pulse">Loading schedule...</p>
          </div>
        ) : (
          <div className="bg-[#EDE9DF] rounded-3xl p-6 overflow-x-auto">
            <div className="min-w-[700px]">
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
                          onMouseDown={() => {
                            if (lesson) { setSelectedLesson(lesson); return; }
                            const key = `${day}-${hour}`;
                            isDragging.current = true;
                            dragMode.current = selectedSlots.has(key) ? "deselect" : "select";
                            applySlot(key);
                          }}
                          onMouseEnter={() => {
                            if (!isDragging.current || lesson) return;
                            applySlot(`${day}-${hour}`);
                          }}
                          className={`p-2 rounded-lg min-h-[36px] transition-colors duration-100 select-none ${
                            lesson
                              ? "bg-[#7C8D8C] text-white hover:bg-[#2F3B3D] cursor-pointer"
                              : selectedSlots.has(`${day}-${hour}`)
                              ? "bg-[#2F3B3D] cursor-pointer"
                              : "bg-[#F5F3EF] hover:bg-[#D6CFBF] cursor-pointer"
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
        )}

        {!loading && schedule.length === 0 && (
          <div className="mt-8 bg-[#EDE9DF] rounded-2xl p-12 text-center">
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
          <DialogContent className="bg-[#F5F3EF] border-[#D6CFBF]">
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
                  <div className="text-[#2F3B3D]">{selectedLesson.otherName}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-[#7C8D8C]" />
                <div>
                  <div className="text-sm text-[#2F3B3D]/70">Subject</div>
                  <div className="text-[#2F3B3D]">{selectedLesson.subject}{selectedLesson.level ? ` - ${selectedLesson.level}` : ""}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-[#7C8D8C]" />
                <div>
                  <div className="text-sm text-[#2F3B3D]/70">Date</div>
                  <div className="text-[#2F3B3D]">
                    {selectedLesson.day} ({new Date(selectedLesson.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })})
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#7C8D8C] mt-1" />
                <div>
                  <div className="text-sm text-[#2F3B3D]/70 mb-2">Time</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedLesson.slots.map((slot: string) => (
                      <span key={slot} className="px-3 py-1 bg-[#EDE9DF] text-[#2F3B3D] rounded-full text-sm">
                        {slot}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {selectedLesson.price > 0 && (
                <div className="bg-[#EDE9DF] p-4 rounded-xl flex items-center justify-between">
                  <span className="text-[#2F3B3D]">Total</span>
                  <span className="text-2xl text-[#7C8D8C]">${selectedLesson.price}</span>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
