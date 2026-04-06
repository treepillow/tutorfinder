import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Calendar, Clock, BookOpen, User, ChevronLeft, ChevronRight, Phone, Mail, X, AlertCircle, Check } from "lucide-react";
import { getCurrentUser, bookingApi, bookingProcessApi, profileApi, enrichProfile, reviewApi } from "../utils/api";
import { toast } from "sonner";
import { io } from "socket.io-client";
import laptopGuy from "../assets/laptopGuy.png";
import Lottie from "lottie-react";
import circleGuyLoadingData from "../assets/circleGuyLoading.json";
import { useRefreshNavCounts } from "../context/NavCountsContext";

type BookingTab = "upcoming" | "completed" | "disputed";

function IconUpcoming({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" fill={active ? "#d97706" : "none"} stroke={active ? "#d97706" : "currentColor"} strokeWidth="2"/>
      <path d="M12 7v5l3 3" stroke={active ? "white" : "currentColor"} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}
function IconCompleted({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" fill={active ? "#16a34a" : "none"} stroke={active ? "#16a34a" : "currentColor"} strokeWidth="2"/>
      <path d="M8 12l3 3 5-5" stroke={active ? "white" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IconDisputed({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" fill={active ? "#ea580c" : "none"} stroke={active ? "#ea580c" : "currentColor"} strokeWidth="2"/>
      <path d="M12 8v5" stroke={active ? "white" : "currentColor"} strokeWidth="2" strokeLinecap="round"/>
      <circle cx="12" cy="16" r="1" fill={active ? "white" : "currentColor"}/>
    </svg>
  );
}


const TABS: { id: BookingTab; label: string; status: string; Icon: React.ComponentType<{ active: boolean }> }[] = [
  { id: "upcoming",  label: "Upcoming",  status: "Confirmed", Icon: IconUpcoming },
  { id: "completed", label: "Completed", status: "Completed", Icon: IconCompleted },
  { id: "disputed",  label: "Ongoing Disputes",  status: "Disputed",  Icon: IconDisputed },
];

const TAB_INFO: Record<BookingTab, { border: string; text: string }> = {
  upcoming:  { border: "border-[#d97706]", text: "Your confirmed upcoming lessons. Cancel is available up to 1 hour before the lesson starts." },
  completed: { border: "border-[#16a34a]", text: "Lessons that were successfully completed with no issues. Payment has been or will be released to the tutor." },
  disputed:  { border: "border-[#ea580c]", text: "Ongoing disputes awaiting admin review. Once resolved, they will no longer appear here." },
};

export function SchedulePage() {
  const refreshNavCounts = useRefreshNavCounts();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [allLessons, setAllLessons] = useState<any[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [view, setView] = useState<"bookings" | "calendar">("calendar");
  const [bookingTab, setBookingTab] = useState<BookingTab>("upcoming");
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [dayOverflow, setDayOverflow] = useState<{ date: string; lessons: any[] } | null>(null);
  const prevTab = useRef<BookingTab>("upcoming");
  const [ratingLesson, setRatingLesson] = useState<any>(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratedBookings, setRatedBookings] = useState<Set<number>>(new Set());

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) return;
    setCurrentUser(user);
    loadAll(user);

    const socket = io(import.meta.env.VITE_BOOKING_SERVICE, { transports: ["websocket"] });
    socket.on("booking_status_changed", (booking: any) => {
      if (booking.tutor_id === user.id || booking.tutee_id === user.id) {
        loadAll(user, true);
      }
    });
    return () => { socket.disconnect(); };
  }, []);

  const enrichBookings = async (bookings: any[], user: any) => {
    // Fetch all unique other-user profiles (tutor for student, tutee for tutor)
    const otherIds = [...new Set(bookings.map((b: any) =>
      user.userType === "student" ? b.tutor_id : b.tutee_id
    ))] as number[];

    const profileMap: Record<number, any> = {};
    await Promise.all(
      otherIds.map(async (id) => {
        try { profileMap[id] = enrichProfile(await profileApi.getProfile(id)); }
        catch { profileMap[id] = { name: `User #${id}` }; }
      })
    );

    return bookings.map((booking: any) => {
      const otherUserId = user.userType === "student" ? booking.tutor_id : booking.tutee_id;
      const otherProfile = profileMap[otherUserId] || { name: `User #${otherUserId}` };

      // Price: find the matching subject+level entry from the tutor's profile
      const tutorProfile = user.userType === "student" ? otherProfile : null;
      const matchedSubject = tutorProfile?.subjects?.find(
        (s: any) => s.subject === booking.subject && s.level === booking.level
      ) || tutorProfile?.subjects?.[0];
      const price = parseFloat(matchedSubject?.hourlyRate || tutorProfile?.price_rate || "0") || 0;

      return {
        ...booking,
        otherProfile,
        dateObj: new Date(booking.lesson_date + "T00:00:00"),
        // Trust booking record directly — subject/level are stored at booking time
        subject: booking.subject || "Lesson",
        level: booking.level || "",
        otherName: otherProfile.name,
        price,
        slots: [`${booking.start_time?.slice(0, 5)}-${booking.end_time?.slice(0, 5)}`],
      };
    });
  };

  const loadAll = async (user: any, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const statuses = ["Confirmed", "Completed", "Disputed"];
      const results = await Promise.all(
        statuses.map((s) => bookingApi.getByUser(user.id, s).catch(() => ({ bookings: [] })))
      );
      const all: any[] = results.flatMap((r) => r.bookings || []);

      // Deduplicate
      const seen = new Set<number>();
      const unique = all.filter((b) => { if (seen.has(b.booking_id)) return false; seen.add(b.booking_id); return true; });

      const enriched = await enrichBookings(unique, user);
      enriched.sort((a: any, b: any) => a.dateObj.getTime() - b.dateObj.getTime());
      setAllLessons(enriched);
    } catch (err: any) {
      console.error("Failed to load schedule:", err);
      toast.error("Failed to load schedule");
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (tab: BookingTab) => {
    prevTab.current = bookingTab;
    setBookingTab(tab);
  };

  const getLessonTimes = (l: any) => {
    const [startH, startM] = (l.start_time || "0:00").split(":").map(Number);
    const [endH, endM] = (l.end_time || "0:00").split(":").map(Number);
    const start = new Date(l.dateObj); start.setHours(startH, startM, 0, 0);
    const end = new Date(l.dateObj); end.setHours(endH, endM, 0, 0);
    return { start, end };
  };

  const now = new Date();

  const isOngoing = (l: any) => {
    if (l.status !== "Confirmed") return false;
    const { start, end } = getLessonTimes(l);
    return now >= start && now < end;
  };

  const isUpcoming = (l: any) => {
    if (l.status !== "Confirmed") return false;
    const { start } = getLessonTimes(l);
    return now < start;
  };

  const ongoingLessons = allLessons.filter(isOngoing);

  const matchesTab = (l: any, tab: BookingTab) => {
    if (tab === "upcoming")  return isUpcoming(l);
    if (tab === "completed") return l.status === "Completed" && !l.dispute_reason;
    if (tab === "disputed")  return l.status === "Disputed";
    return false;
  };

  const tabLessons = allLessons.filter((l) => matchesTab(l, bookingTab));
  const tabCount = (tab: BookingTab) => allLessons.filter((l) => matchesTab(l, tab)).length;

  const tabOrder = TABS.map((t) => t.id);
  const direction = tabOrder.indexOf(bookingTab) > tabOrder.indexOf(prevTab.current) ? 1 : -1;

  const handleCancelBooking = async (lesson: any) => {
    setActionLoading(true);
    try {
      await bookingProcessApi.cancel(lesson.booking_id, currentUser.userType === "student" ? "tutee" : "tutor");
      toast.success("Booking cancelled and deposit refunded");
      setSelectedLesson(null);
      loadAll(currentUser, true);
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
      loadAll(currentUser, true);
      refreshNavCounts();
    } catch (err: any) {
      toast.error(err.message || "Failed to complete booking");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitRating = async () => {
    if (!ratingLesson || ratingValue === 0) return;
    setRatingLoading(true);
    try {
      await reviewApi.create({
        BookingId: ratingLesson.booking_id,
        TutorId: ratingLesson.tutor_id,
        TuteeId: ratingLesson.tutee_id,
        Rating: ratingValue,
      });
      setRatedBookings((prev) => new Set(prev).add(ratingLesson.booking_id));
      toast.success("Rating submitted!");
      setRatingLesson(null);
      setRatingValue(0);
    } catch {
      toast.error("Failed to submit rating");
    } finally {
      setRatingLoading(false);
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
      loadAll(currentUser, true);
      refreshNavCounts();
    } catch (err: any) {
      toast.error(err.message || "Failed to report no-show");
    } finally {
      setActionLoading(false);
    }
  };

  const getBookingActions = (lesson: any) => {
    if (lesson.status !== "Confirmed") {
      return { canCancel: false, canReportNoShow: false, canComplete: false };
    }
    const { start, end } = getLessonTimes(lesson);
    const cutoffCancel = new Date(start.getTime() - 60 * 60 * 1000);
    return {
      canCancel: now < cutoffCancel,
      canReportNoShow: now >= start,
      canComplete: now >= end && currentUser.userType === "student",
    };
  };

  // ── Calendar helpers ──
  const prevMonth = () => setCalendarDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setCalendarDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const calendarDays = (() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startOffset = (firstDay + 6) % 7;
    const cells: (number | null)[] = [
      ...Array(startOffset).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  })();

  // Calendar shows only Confirmed (upcoming) lessons
  const calendarLessons = allLessons.filter((l) => l.status === "Confirmed");

  const getLessonsForDay = (day: number | null) => {
    if (!day) return [];
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    return calendarLessons.filter(l => {
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

  const emptyMessages: Record<BookingTab, { title: string; sub: string }> = {
    upcoming: {
      title: "No upcoming lessons",
      sub: currentUser.userType === "student"
        ? "Book lessons with your matched tutors to see them here"
        : "Accept student requests to see scheduled lessons",
    },
    completed: { title: "No completed lessons", sub: "Completed lessons will appear here" },
    disputed:  { title: "No disputed lessons",  sub: "Disputed lessons will appear here" },
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-4xl tracking-tight text-[#2F3B3D] mb-2">Schedule</h1>
            <p className="text-[#2F3B3D]/70">Your confirmed lessons</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Ongoing lesson indicator */}
            {ongoingLessons.length > 0 && (
              <button
                onClick={() => setSelectedLesson(ongoingLessons[0])}
                className="flex items-center gap-3 px-4 py-2.5 bg-[#EDE9DF] hover:bg-[#E3DDD3] text-[#2F3B3D] rounded-2xl transition-colors duration-150"
              >
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400"></span>
                </span>
                <div className="flex items-center gap-2">
                  <p className="text-[10px] font-semibold text-green-600 uppercase tracking-wide">Ongoing</p>
                  <span className="text-[#2F3B3D]/20">·</span>
                  <p className="text-xs font-semibold text-[#2F3B3D]">
                    {ongoingLessons[0].subject}{ongoingLessons[0].level ? ` · ${ongoingLessons[0].level}` : ""}
                  </p>
                  <span className="text-[#2F3B3D]/20">·</span>
                  <p className="text-xs text-[#2F3B3D]/50">{ongoingLessons[0].otherName}</p>
                  <span className="text-[#2F3B3D]/20">·</span>
                  <p className="text-xs text-[#2F3B3D]/50">{ongoingLessons[0].slots[0]}</p>
                </div>
              </button>
            )}

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
        </div>

        {/* Bookings sub-tabs — sliding pill style like PaymentsPage */}
        {view === "bookings" && (
          <div className="relative flex p-1.5 bg-[#EDE9DF] rounded-2xl mb-5">
            {/* Sliding pill */}
            <div
              className="absolute top-1.5 bottom-1.5 bg-[#2F3B3D] rounded-xl shadow transition-all duration-300 ease-in-out"
              style={{
                width: `calc(${100 / TABS.length}% - 6px)`,
                left: `calc(${(TABS.findIndex((t) => t.id === bookingTab) / TABS.length) * 100}% + 3px)`,
              }}
            />
            {TABS.map((tab) => {
              const count = tabCount(tab.id);
              const isActive = bookingTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => switchTab(tab.id)}
                  className={`relative z-10 flex-1 py-2.5 rounded-xl text-xs font-medium transition-colors duration-200 flex items-center justify-center gap-1.5 ${
                    isActive ? "text-white" : "text-[#2F3B3D]/50 hover:text-[#2F3B3D]"
                  }`}
                >
                  <tab.Icon active={isActive} />
                  <span>{tab.label}</span>
                  {count > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full leading-none ${
                      isActive ? "bg-white/20 text-white" : "bg-[#D6CFBF] text-[#2F3B3D]/60"
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Tab info */}
        {view === "bookings" && (
          <div className={`border-l-2 pl-3 mb-5 ${TAB_INFO[bookingTab].border}`}>
            <p className="text-xs text-[#2F3B3D]/50">{TAB_INFO[bookingTab].text}</p>
          </div>
        )}


        {/* Pending completion banner */}
        {!loading && (() => {
          const needsCompletion = allLessons.filter((l) => {
            if (l.status !== "Confirmed") return false;
            const { end } = getLessonTimes(l);
            return now >= end;
          });
          if (needsCompletion.length === 0) return null;
          const isStudent = currentUser.userType === "student";
          const count = needsCompletion.length;
          return (
            <div className="mb-5 bg-[#C0392B] rounded-2xl p-5">
              {/* Header row */}
              <div className="flex items-center gap-2 mb-4">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                <p className="text-white font-medium text-sm leading-tight flex-1">
                  {isStudent
                    ? count === 1 ? "1 lesson needs your confirmation" : `${count} lessons need your confirmation`
                    : count === 1 ? "1 lesson is awaiting student confirmation" : `${count} lessons are awaiting student confirmation`}
                </p>
                <p className="text-white/50 text-xs">
                  {isStudent ? "Tap a lesson to confirm" : "Tap to view"}
                </p>
              </div>
              {/* Lesson cards row */}
              <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
                {needsCompletion.map((l) => (
                  <button
                    key={l.booking_id}
                    onClick={() => setSelectedLesson(l)}
                    className="flex-shrink-0 bg-white/10 hover:bg-white/20 active:bg-white/25 rounded-xl px-4 py-3 text-left transition-colors duration-150 min-w-[160px]"
                  >
                    <p className="text-white text-xs font-semibold truncate">{l.subject}{l.level ? ` · ${l.level}` : ""}</p>
                    <p className="text-white/60 text-[11px] mt-0.5 truncate">{l.otherName}</p>
                    <p className="text-white/40 text-[11px] mt-1">{l.slots[0]}</p>
                  </button>
                ))}
              </div>
            </div>
          );
        })()}

        {!loading && view === "bookings" ? (
          <div className="overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false} custom={direction}>
              <motion.div
                key={bookingTab}
                custom={direction}
                initial={{ x: direction * 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: direction * -50, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
              >
                {tabLessons.length === 0 ? (
                  <div className="bg-[#EDE9DF] rounded-2xl p-10 text-center flex flex-col items-center">
                    <img src={laptopGuy} style={{ width: 120, height: 120, objectFit: "contain" }} />
                    <h3 className="text-xl text-[#2F3B3D] font-medium mt-3 mb-1">{emptyMessages[bookingTab].title}</h3>
                    <p className="text-[#2F3B3D]/60 text-sm">{emptyMessages[bookingTab].sub}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tabLessons.map((lesson) => (
                      <button
                        key={lesson.booking_id}
                        onClick={() => setSelectedLesson(lesson)}
                        className="w-full text-left bg-[#EDE9DF] hover:bg-[#E3DDD3] rounded-2xl p-5 transition-colors duration-150"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
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
                          <div className="text-right flex flex-col items-end gap-2">
                            {lesson.status === "Completed" && currentUser.userType === "student" && !ratedBookings.has(lesson.booking_id) && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setRatingLesson(lesson); setRatingValue(0); }}
                                className="text-xs px-3 py-1 bg-[#2F3B3D] text-white rounded-full hover:bg-[#7C8D8C] transition-colors"
                              >
                                Rate Tutor
                              </button>
                            )}
                            {(lesson.status === "Completed" && currentUser.userType === "student" && ratedBookings.has(lesson.booking_id)) && (
                              <span className="text-xs text-green-600 font-medium">Rated ★</span>
                            )}
                            <div className="text-[#7C8D8C] font-medium">${lesson.price}</div>
                            <div className="text-[#2F3B3D]/40 text-xs mt-1">
                              {lesson.dateObj.toLocaleDateString("en-SG", { weekday: "short", timeZone: "Asia/Singapore" })}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        ) : (

          // ── Calendar View ──
          <div className="bg-[#EDE9DF] rounded-3xl p-6">
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

            <div className="grid grid-cols-7 mb-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
                <div key={d} className="text-center text-xs font-medium text-[#2F3B3D]/50 py-2">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, i) => {
                const lessons = getLessonsForDay(day);
                return (
                  <div
                    key={i}
                    className={`min-h-[72px] rounded-xl p-1.5 ${
                      day === null ? "" : isToday(day) ? "bg-[#2F3B3D]" : "bg-[#F5F3EF]/60"
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

      {/* Rating dialog */}
      {ratingLesson && (
        <Dialog open={true} onOpenChange={() => { setRatingLesson(null); setRatingValue(0); }}>
          <DialogContent className="bg-[#F5F3EF] border-[#D6CFBF] max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-xl text-[#2F3B3D]">Rate your tutor</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-[#2F3B3D]/70 text-sm">How was your lesson with <span className="font-medium text-[#2F3B3D]">{ratingLesson.otherName}</span>?</p>
              <div className="flex gap-2 justify-center py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRatingValue(star)}
                    className={`text-4xl transition-transform hover:scale-110 ${star <= ratingValue ? "text-yellow-400" : "text-[#D6CFBF]"}`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <button
                onClick={handleSubmitRating}
                disabled={ratingValue === 0 || ratingLoading}
                className="w-full py-2.5 bg-[#2F3B3D] text-white rounded-full text-sm font-medium disabled:opacity-40 hover:bg-[#7C8D8C] transition-colors"
              >
                {ratingLoading ? "Submitting..." : "Submit Rating"}
              </button>
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
