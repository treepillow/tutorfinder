import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Calendar, Clock, BookOpen, User, ChevronLeft, ChevronRight, Phone, Mail, X, AlertCircle, Check } from "lucide-react";
import { getCurrentUser, bookingApi, bookingProcessApi, profileApi, paymentApi, availabilityApi, enrichProfile } from "../utils/api";
import { toast } from "sonner";
import { io } from "socket.io-client";
import laptopGuy from "../assets/laptopGuy.png";
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
  const [view, setView] = useState<"bookings" | "calendar">("calendar");
  const [bookingTab, setBookingTab] = useState<"upcoming" | "completed" | "disputed">("upcoming");
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [dayOverflow, setDayOverflow] = useState<{ date: string; lessons: any[] } | null>(null);

  const TAB_STATUS: Record<string, string> = {
    upcoming: "Confirmed",
    completed: "Completed",
    disputed: "Disputed",
  };

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) return;
    setCurrentUser(user);
    loadSchedule(user, "upcoming");

    const socket = io(import.meta.env.VITE_BOOKING_SERVICE, { transports: ["websocket"] });
    socket.on("booking_status_changed", (booking: any) => {
      if (booking.tutor_id === user.id || booking.tutee_id === user.id) {
        loadSchedule(user, bookingTab, true);
      }
    });
    return () => { socket.disconnect(); };
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    setSchedule([]);
    loadSchedule(currentUser, bookingTab, true);
  }, [bookingTab]);

  const loadSchedule = async (user: any, tab: string, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const status = TAB_STATUS[tab] || "Confirmed";
      const res = await bookingApi.getByUser(user.id, status);
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
          subject: booking.subject || infoProfile.subjects?.[0]?.subject || "Lesson",
          level: booking.level || infoProfile.subjects?.[0]?.level || "",
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
      loadSchedule(currentUser, bookingTab);
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
      loadSchedule(currentUser, bookingTab);
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
      loadSchedule(currentUser, bookingTab);
      refreshNavCounts();
    } catch (err: any) {
      toast.error(err.message || "Failed to report no-show");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Booking action availability ──
  // canCancel: only before 1hr before start
  // canReportNoShow: during or after the booking slot
  // canComplete: only after the booking slot ends
  const getBookingActions = (lesson: any) => {
    const now = new Date();

    const [startH, startM] = (lesson.start_time || "0:00").split(":").map(Number);
    const [endH, endM] = (lesson.end_time || "0:00").split(":").map(Number);

    const bookingStart = new Date(lesson.dateObj);
    bookingStart.setHours(startH, startM, 0, 0);

    const bookingEnd = new Date(lesson.dateObj);
    bookingEnd.setHours(endH, endM, 0, 0);

    const cutoffCancel = new Date(bookingStart.getTime() - 60 * 60 * 1000); // 1hr before start

    return {
      canCancel: now < cutoffCancel,
      canReportNoShow: now >= bookingStart,
      canComplete: now >= bookingEnd,
    };
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
    dateObj.toLocaleDateString("en-SG", { weekday: "short", month: "short", day: "numeric", year: "numeric", timeZone: "Asia/Singapore" });

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
              onClick={() => setView("calendar")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                view === "calendar" ? "bg-[#2F3B3D] text-white shadow" : "text-[#2F3B3D]/60 hover:text-[#2F3B3D]"
              }`}
            >
              <Calendar className="w-4 h-4" />
              Calendar
            </button>
            <button
              onClick={() => setView("bookings")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                view === "bookings" ? "bg-[#2F3B3D] text-white shadow" : "text-[#2F3B3D]/60 hover:text-[#2F3B3D]"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Bookings
            </button>
          </div>
        </div>

        {/* Bookings sub-tabs */}
        {view === "bookings" && (
          <div className="flex p-1 bg-[#EDE9DF] rounded-full mb-6 w-fit">
            {(["upcoming", "completed", "disputed"] as const).map((tab) => {
              const icons = {
                upcoming: <Clock className="w-4 h-4" />,
                completed: <Check className="w-4 h-4" />,
                disputed: <AlertCircle className="w-4 h-4" />,
              };
              const labels = { upcoming: "Upcoming", completed: "Completed", disputed: "Disputed" };
              const isActive = bookingTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setBookingTab(tab)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive ? "bg-[#2F3B3D] text-white shadow" : "text-[#2F3B3D]/60 hover:text-[#2F3B3D]"
                  }`}
                >
                  {icons[tab]}
                  {labels[tab]}
                  {isActive && schedule.length > 0 && (
                    <span className="ml-1 bg-white/20 text-white text-xs px-1.5 py-0.5 rounded-full leading-none">
                      {schedule.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {!loading && view === "bookings" ? (
          schedule.length === 0 ? (
            <div className="bg-[#EDE9DF] rounded-2xl p-10 text-center flex flex-col items-center">
              <img src={laptopGuy} style={{ width: 120, height: 120, objectFit: "contain" }} />
              <h3 className="text-xl text-[#2F3B3D] font-medium mt-3 mb-1">
                {bookingTab === "upcoming" ? "No upcoming lessons" : bookingTab === "completed" ? "No completed lessons" : "No disputed lessons"}
              </h3>
              <p className="text-[#2F3B3D]/60 text-sm">
                {bookingTab === "upcoming"
                  ? currentUser.userType === "student"
                    ? "Book lessons with your matched tutors to see them here"
                    : "Accept student requests to see scheduled lessons"
                  : bookingTab === "completed"
                  ? "Completed lessons will appear here"
                  : "Disputed lessons will appear here"}
              </p>
            </div>
          ) : (

          // ── Bookings View ──
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
                        {lesson.dateObj.toLocaleDateString("en-SG", { month: "short", timeZone: "Asia/Singapore" })}
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
                      {lesson.dateObj.toLocaleDateString("en-SG", { weekday: "short", timeZone: "Asia/Singapore" })}
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
                {calendarDate.toLocaleDateString("en-SG", { month: "long", year: "numeric", timeZone: "Asia/Singapore" })}
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
                        : "bg-[#F5F3EF]/60"
                    }`}
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
                              onClick={() => setSelectedLesson(lesson)}
                              className="text-xs px-1.5 py-0.5 bg-[#7C8D8C] hover:bg-[#2F3B3D] text-white rounded-md truncate cursor-pointer transition-colors"
                            >
                              {lesson.subject}
                            </div>
                          ))}
                          {lessons.length > 2 && (
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                const dateStr = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day!).toLocaleDateString("en-SG", { weekday: "long", day: "numeric", month: "short", timeZone: "Asia/Singapore" });
                                setDayOverflow({ date: dateStr, lessons });
                              }}
                              className="text-xs text-[#7C8D8C] hover:text-[#2F3B3D] pl-1 cursor-pointer transition-colors font-medium"
                            >
                              +{lessons.length - 2} more
                            </div>
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

      {/* Day overflow dialog */}
      {dayOverflow && (
        <Dialog open={true} onOpenChange={() => setDayOverflow(null)}>
          <DialogContent className="bg-[#F5F3EF] border-[#D6CFBF] max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-xl text-[#2F3B3D]">{dayOverflow.date}</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              {dayOverflow.lessons.map((lesson) => (
                <button
                  key={lesson.booking_id}
                  onClick={() => { setDayOverflow(null); setSelectedLesson(lesson); }}
                  className="w-full text-left bg-[#EDE9DF] hover:bg-[#E3DDD3] rounded-xl px-4 py-3 transition-colors"
                >
                  <div className="text-sm font-medium text-[#2F3B3D]">
                    {lesson.subject}{lesson.level ? ` · ${lesson.level}` : ""}
                  </div>
                  <div className="flex items-center gap-1 text-[#2F3B3D]/50 text-xs mt-0.5">
                    <Clock className="w-3 h-3" />
                    {lesson.slots[0]}
                  </div>
                  <div className="text-[#2F3B3D]/50 text-xs mt-0.5">{lesson.otherName}</div>
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
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

              {(() => {
                const { canCancel, canReportNoShow, canComplete } = getBookingActions(selectedLesson);
                return (
                  <div className="flex flex-col gap-3">
                    {canCancel && (
                      <button
                        onClick={() => handleCancelBooking(selectedLesson)}
                        className="w-full flex items-center justify-center gap-2.5 px-5 py-2.5 bg-white text-red-400 rounded-full border border-red-200 hover:bg-red-50 hover:text-red-500 transition-all duration-300 text-sm"
                      >
                        <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center shrink-0"><X className="w-3 h-3" /></span>
                        Cancel Booking
                      </button>
                    )}
                    <div className="flex gap-3">
                      {canReportNoShow && (
                        <button
                          onClick={() => handleReportNoShow(selectedLesson)}
                          className="flex-1 flex items-center justify-center gap-2.5 px-5 py-2.5 bg-white text-amber-600 rounded-full border border-amber-300 hover:bg-amber-50 hover:text-amber-700 transition-all duration-300 text-sm"
                        >
                          <AlertCircle className="w-4 h-4" />
                          Report No-Show
                        </button>
                      )}
                      {canComplete && (
                        <button
                          onClick={() => handleCompleteBooking(selectedLesson)}
                          className="flex-1 flex items-center justify-center gap-2.5 px-5 py-2.5 bg-[#2F3B3D] text-white rounded-full border-2 border-[#2F3B3D] hover:bg-[#7C8D8C] hover:border-[#7C8D8C] transition-all duration-300 text-sm"
                        >
                          <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center shrink-0"><Check className="w-3 h-3" /></span>
                          Complete Booking
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
