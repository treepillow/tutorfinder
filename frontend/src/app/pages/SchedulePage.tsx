import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Calendar, Clock, BookOpen, User, ChevronLeft, ChevronRight, List, Phone, Mail } from "lucide-react";
import { getCurrentUser, bookingApi, bookingProcessApi, profileApi, paymentApi, availabilityApi, enrichProfile } from "../utils/api";
import { toast } from "sonner";
import { CircleGuyCalendar } from "../components/EmptyState";
import Lottie from "lottie-react";
import circleGuyLoadingData from "../assets/circleGuyLoading.json";
import { useRefreshNavCounts } from "../context/NavCountsContext";

export function SchedulePage() {
  const refreshNavCounts = useRefreshNavCounts();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [view, setView] = useState<"list" | "calendar">("calendar");
  const [calendarDate, setCalendarDate] = useState(new Date());

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
      const res = await bookingApi.getByUser(user.id, "Confirmed");
      const bookings = res.bookings || [];

      // Fetch each unique other-user profile once, then reuse
      const uniqueIds = [...new Set(bookings.map((b: any) =>
        user.userType === "student" ? b.tutor_id : b.tutee_id
      ))] as number[];

      const profileMap: Record<number, any> = {};
      let myProfile: any = null;
      await Promise.all([
        ...uniqueIds.map(async (id) => {
          try {
            const p = await profileApi.getProfile(id);
            profileMap[id] = enrichProfile(p);
          } catch {
            profileMap[id] = { name: `User #${id}` };
          }
        }),
        profileApi.getProfile(user.id).then((p) => { myProfile = enrichProfile(p); }).catch(() => {}),
      ]);

      const enriched = bookings.map((booking: any) => {
        const otherUserId = user.userType === "student" ? booking.tutor_id : booking.tutee_id;
        const otherProfile = profileMap[otherUserId] || { name: `User #${otherUserId}` };
        // Subject/level/price come from the tutor's profile, not the student's
        const infoProfile = user.userType === "tutor" && myProfile ? myProfile : otherProfile;
        return {
          ...booking,
          otherProfile,
          date: booking.lesson_date,
          dateObj: new Date(booking.lesson_date + "T00:00:00"),
          startHour: parseInt(booking.start_time?.split(":")[0] || "0"),
          endHour: parseInt(booking.end_time?.split(":")[0] || "0"),
          subject: infoProfile.subjects?.[0]?.subject || "Lesson",
          level: infoProfile.subjects?.[0]?.level || "",
          tutorName: user.userType === "student" ? otherProfile.name : user.name,
          studentName: user.userType === "tutor" ? otherProfile.name : user.name,
          otherName: otherProfile.name,
          price: infoProfile.subjects?.[0]?.hourlyRate || infoProfile.price_rate || 0,
          slots: [`${booking.start_time?.slice(0, 5)}-${booking.end_time?.slice(0, 5)}`],
        };
      });

      // Sort by date ascending
      enriched.sort((a: any, b: any) => a.dateObj.getTime() - b.dateObj.getTime());
      setSchedule(enriched);
    } catch (err: any) {
      console.error("Failed to load schedule:", err);
      toast.error("Failed to load schedule");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (lesson: any) => {
    setActionLoading(true);
    try {
      // Cancel through OutSystems orchestrator (handles refund, slot update, and status change)
      await bookingProcessApi.cancel(lesson.booking_id, currentUser.userType === "student" ? "tutee" : "tutor");
      toast.success("Booking cancelled and deposit refunded");
      setSelectedLesson(null);
      loadSchedule(currentUser);
      refreshNavCounts();
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel booking");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteBooking = async (lesson: any) => {
    setActionLoading(true);
    try {
      await bookingProcessApi.complete(lesson.booking_id);
      toast.success("Booking marked as completed");
      setSelectedLesson(null);
      loadSchedule(currentUser);
      refreshNavCounts();
    } catch (err: any) {
      toast.error(err.message || "Failed to complete booking");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReportNoShow = async (lesson: any) => {
    setActionLoading(true);
    try {
      const reportedBy = currentUser.userType === "student" ? "tutee" : "tutor";
      const reason = currentUser.userType === "student" ? "Tutor no-show" : "Tutee no-show";
      await bookingProcessApi.reportDispute(lesson.booking_id, reportedBy, reason);
      toast.success("No-show reported. An admin will review the dispute.");
      setSelectedLesson(null);
      loadSchedule(currentUser);
      refreshNavCounts();
    } catch (err: any) {
      toast.error(err.message || "Failed to report no-show");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Calendar helpers ──

  const prevMonth = () => setCalendarDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setCalendarDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const calendarDays = (() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // Shift so Monday = 0
    const startOffset = (firstDay + 6) % 7;
    const cells: (number | null)[] = [
      ...Array(startOffset).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
    // Pad to full weeks
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  })();

  const getLessonsForDay = (day: number | null) => {
    if (!day) return [];
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    return schedule.filter(l => {
      const d = l.dateObj;
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
  };

  const today = new Date();
  const isToday = (day: number) =>
    day === today.getDate() &&
    calendarDate.getMonth() === today.getMonth() &&
    calendarDate.getFullYear() === today.getFullYear();

  const formatDate = (dateObj: Date) =>
    dateObj.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });

  if (!currentUser) return null;

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-4xl tracking-tight text-[#2F3B3D] mb-2">Schedule</h1>
            <p className="text-[#2F3B3D]/70">Your confirmed lessons</p>
          </div>

          {/* View toggle */}
          <div className="flex p-1 bg-[#EDE9DF] rounded-full">
            <button
              onClick={() => setView("list")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                view === "list" ? "bg-[#2F3B3D] text-white shadow" : "text-[#2F3B3D]/60 hover:text-[#2F3B3D]"
              }`}
            >
              <List className="w-4 h-4" />
              List
            </button>
            <button
              onClick={() => setView("calendar")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                view === "calendar" ? "bg-[#2F3B3D] text-white shadow" : "text-[#2F3B3D]/60 hover:text-[#2F3B3D]"
              }`}
            >
              <Calendar className="w-4 h-4" />
              Calendar
            </button>
          </div>
        </div>

        {!loading && view === "list" ? (
          schedule.length === 0 ? (
            <div className="bg-[#EDE9DF] rounded-2xl p-10 text-center flex flex-col items-center">
              <CircleGuyCalendar size={120} />
              <h3 className="text-xl text-[#2F3B3D] font-medium mt-3 mb-1">No lessons scheduled yet</h3>
              <p className="text-[#2F3B3D]/60 text-sm">
                {currentUser.userType === "student"
                  ? "Book lessons with your matched tutors to see them here"
                  : "Accept student requests to see scheduled lessons"}
              </p>
            </div>
          ) : (

          // ── List View ──
          <div className="space-y-3">
            {schedule.map((lesson) => (
              <button
                key={lesson.booking_id}
                onClick={() => setSelectedLesson(lesson)}
                className="w-full text-left bg-[#EDE9DF] hover:bg-[#E3DDD3] rounded-2xl p-5 transition-colors duration-150"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Date badge */}
                    <div className="flex-shrink-0 bg-[#2F3B3D] text-white rounded-xl px-4 py-3 text-center min-w-[56px]">
                      <div className="text-xs font-medium opacity-70 uppercase">
                        {lesson.dateObj.toLocaleDateString("en-US", { month: "short" })}
                      </div>
                      <div className="text-2xl font-semibold leading-none">
                        {lesson.dateObj.getDate()}
                      </div>
                    </div>

                    <div>
                      <div className="text-[#2F3B3D] font-medium">
                        {lesson.subject}{lesson.level ? ` · ${lesson.level}` : ""}
                      </div>
                      <div className="text-[#2F3B3D]/60 text-sm mt-0.5">
                        {currentUser.userType === "student" ? "Tutor" : "Student"}: {lesson.otherName}
                      </div>
                      <div className="flex items-center gap-1 text-[#2F3B3D]/50 text-sm mt-0.5">
                        <Clock className="w-3.5 h-3.5" />
                        {lesson.slots[0]}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[#7C8D8C] font-medium">${lesson.price}</div>
                    <div className="text-[#2F3B3D]/40 text-xs mt-1">
                      {lesson.dateObj.toLocaleDateString("en-US", { weekday: "short" })}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          )
        ) : (

          // ── Calendar View ──
          <div className="bg-[#EDE9DF] rounded-3xl p-6">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-6">
              <button onClick={prevMonth} className="p-2 hover:bg-[#D6CFBF] rounded-full transition-colors">
                <ChevronLeft className="w-5 h-5 text-[#2F3B3D]" />
              </button>
              <h2 className="text-xl font-medium text-[#2F3B3D]">
                {calendarDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </h2>
              <button onClick={nextMonth} className="p-2 hover:bg-[#D6CFBF] rounded-full transition-colors">
                <ChevronRight className="w-5 h-5 text-[#2F3B3D]" />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
                <div key={d} className="text-center text-xs font-medium text-[#2F3B3D]/50 py-2">{d}</div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, i) => {
                const lessons = getLessonsForDay(day);
                return (
                  <div
                    key={i}
                    className={`min-h-[72px] rounded-xl p-1.5 ${
                      day === null
                        ? ""
                        : isToday(day)
                        ? "bg-[#2F3B3D]"
                        : lessons.length > 0
                        ? "bg-[#F5F3EF] cursor-pointer hover:bg-[#E3DDD3] transition-colors"
                        : "bg-[#F5F3EF]/60"
                    }`}
                    onClick={() => lessons.length > 0 && setSelectedLesson(lessons[0])}
                  >
                    {day !== null && (
                      <>
                        <div className={`text-sm font-medium mb-1 ${isToday(day) ? "text-white" : "text-[#2F3B3D]/70"}`}>
                          {day}
                        </div>
                        <div className="space-y-0.5">
                          {lessons.slice(0, 2).map((lesson) => (
                            <div
                              key={lesson.booking_id}
                              className="text-xs px-1.5 py-0.5 bg-[#7C8D8C] text-white rounded-md truncate"
                            >
                              {lesson.subject}
                            </div>
                          ))}
                          {lessons.length > 2 && (
                            <div className="text-xs text-[#7C8D8C] pl-1">+{lessons.length - 2} more</div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Loading overlay */}
      {(loading || actionLoading) && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-sm bg-white/30">
          <Lottie animationData={circleGuyLoadingData} loop autoplay style={{ width: 500, height: 500, transform: 'translateY(-80px)' }} />
        </div>
      )}

      {/* Lesson detail dialog */}
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

              {selectedLesson.otherProfile?.contactNumber && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-[#7C8D8C]" />
                  <div>
                    <div className="text-sm text-[#2F3B3D]/70">Phone</div>
                    <div className="text-[#2F3B3D]">{selectedLesson.otherProfile.contactNumber}</div>
                  </div>
                </div>
              )}

              {selectedLesson.otherProfile?.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-[#7C8D8C]" />
                  <div>
                    <div className="text-sm text-[#2F3B3D]/70">Email</div>
                    <div className="text-[#2F3B3D]">{selectedLesson.otherProfile.email}</div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-[#7C8D8C]" />
                <div>
                  <div className="text-sm text-[#2F3B3D]/70">Subject</div>
                  <div className="text-[#2F3B3D]">
                    {selectedLesson.subject}{selectedLesson.level ? ` - ${selectedLesson.level}` : ""}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-[#7C8D8C]" />
                <div>
                  <div className="text-sm text-[#2F3B3D]/70">Date</div>
                  <div className="text-[#2F3B3D]">{formatDate(selectedLesson.dateObj)}</div>
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

              <div className="flex gap-3">
                <button
                  onClick={() => handleCancelBooking(selectedLesson)}
                  className="flex-1 px-4 py-2 bg-white text-[#2F3B3D] rounded-full border-2 border-[#D6CFBF] hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-300"
                >
                  Cancel Booking
                </button>
                <button
                  onClick={() => handleReportNoShow(selectedLesson)}
                  className="flex-1 px-4 py-2 bg-white text-[#2F3B3D] rounded-full border-2 border-[#D6CFBF] hover:bg-amber-50 hover:border-amber-200 hover:text-amber-600 transition-all duration-300"
                >
                  Report No-Show
                </button>
                <button
                  onClick={() => handleCompleteBooking(selectedLesson)}
                  className="flex-1 px-4 py-2 bg-[#2F3B3D] text-white rounded-full border-2 border-[#2F3B3D] hover:bg-[#7C8D8C] hover:border-[#7C8D8C] transition-all duration-300"
                >
                  Complete Booking
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
