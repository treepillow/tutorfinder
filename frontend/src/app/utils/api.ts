// Centralized API client for all backend service calls
// v2

const PROFILE_SERVICE = import.meta.env.VITE_PROFILE_SERVICE;
const MATCH_SERVICE = import.meta.env.VITE_MATCH_SERVICE;
const AVAILABILITY_SERVICE = import.meta.env.VITE_AVAILABILITY_SERVICE;
const BOOKING_SERVICE = import.meta.env.VITE_BOOKING_SERVICE;
const PAYMENT_SERVICE = import.meta.env.VITE_PAYMENT_SERVICE;
const NOTIFICATION_SERVICE = import.meta.env.VITE_NOTIFICATION_SERVICE;
const BOOKING_PROCESS_SERVICE = import.meta.env.VITE_BOOKING_PROCESS_SERVICE;
const REVIEW_SERVICE = import.meta.env.VITE_REVIEW_SERVICE;

// ── Warm up services on app load to avoid cold-start delays ──
export function warmUpServices() {
  const services = [PROFILE_SERVICE, MATCH_SERVICE, AVAILABILITY_SERVICE, BOOKING_SERVICE];
  services.forEach((url) => {
    if (url) fetch(`${url}/health`).catch(() => {});
  });
}

// ── Auth helpers ──

export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function setToken(token: string) {
  localStorage.setItem("token", token);
}

export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("currentUser");
}

export function getCurrentUser() {
  const data = localStorage.getItem("currentUser");
  return data ? JSON.parse(data) : null;
}

export function setCurrentUser(user: any) {
  localStorage.setItem("currentUser", JSON.stringify(user));
}

// ── Fetch wrapper ──

async function apiFetch(url: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new ApiError(res.status, body.error || res.statusText);
  }

  return res.json();
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// ── Profile Service ──

export const profileApi = {
  register(data: {
    name: string;
    email: string;
    password: string;
    phone: string;
    role: "Tutor" | "Student";
    subject?: string;
    price_rate?: number;
    latitude?: number;
    longitude?: number;
    bio?: string;
  }) {
    return apiFetch(`${PROFILE_SERVICE}/profile/register`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  login(email: string, password: string) {
    return apiFetch(`${PROFILE_SERVICE}/profile/login`, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  getProfile(userId: number) {
    return apiFetch(`${PROFILE_SERVICE}/profile/${userId}`);
  },

  updateProfile(userId: number, data: Record<string, any>) {
    return apiFetch(`${PROFILE_SERVICE}/profile/${userId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  getAllProfiles(role?: string) {
    const url = role
      ? `${PROFILE_SERVICE}/profile/all?role=${role}`
      : `${PROFILE_SERVICE}/profile/all`;
    return apiFetch(url);
  },

  search(data: {
    subject?: string;
    min_price?: number;
    max_price?: number;
    radius?: number;
  }) {
    return apiFetch(`${PROFILE_SERVICE}/profile/search`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

// ── Match Service ──

export const matchApi = {
  swipe(swiperId: number, swipedId: number, isLike: boolean) {
    return apiFetch(`${MATCH_SERVICE}/match/swipe`, {
      method: "POST",
      body: JSON.stringify({
        swiper_id: swiperId,
        swiped_id: swipedId,
        is_like: isLike,
      }),
    });
  },

  getMatches(userId: number) {
    return apiFetch(`${MATCH_SERVICE}/match/matches/${userId}`);
  },

  getSwipedIds(userId: number) {
    return apiFetch(`${MATCH_SERVICE}/match/swiped/${userId}`);
  },

  getLikedMe(userId: number) {
    return apiFetch(`${MATCH_SERVICE}/match/liked-me/${userId}`);
  },

  checkStatus(userA: number, userB: number) {
    return apiFetch(
      `${MATCH_SERVICE}/match/status?userA=${userA}&userB=${userB}`
    );
  },

  archiveMatch(matchId: number) {
    return apiFetch(`${MATCH_SERVICE}/match/${matchId}/archive`, {
      method: "PUT",
    });
  },
};

// ── Availability Service ──

export const availabilityApi = {
  addSlot(data: {
    user_id: number;
    date: string;
    start_time: string;
    end_time: string;
  }) {
    return apiFetch(`${AVAILABILITY_SERVICE}/availability`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getSlots(userId: number) {
    return apiFetch(`${AVAILABILITY_SERVICE}/availability/${userId}`);
  },

  getSlot(availabilityId: number) {
    return apiFetch(
      `${AVAILABILITY_SERVICE}/availability/slot/${availabilityId}`
    );
  },

  checkAvailability(availabilityId: number) {
    return apiFetch(`${AVAILABILITY_SERVICE}/availability/check`, {
      method: "POST",
      body: JSON.stringify({ availability_id: availabilityId }),
    });
  },

  updateSlot(availabilityId: number, status: string) {
    return apiFetch(`${AVAILABILITY_SERVICE}/availability/${availabilityId}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  },

  deleteSlot(availabilityId: number) {
    return apiFetch(`${AVAILABILITY_SERVICE}/availability/${availabilityId}`, {
      method: "DELETE",
    });
  },
};

// ── Booking Service ──

export const bookingApi = {
  create(data: {
    tutor_id: number;
    tutee_id: number;
    availability_id: number;
    lesson_date: string;
    start_time: string;
    end_time: string;
    subject?: string;
    level?: string;
  }) {
    return apiFetch(`${BOOKING_SERVICE}/booking`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getBooking(bookingId: number) {
    return apiFetch(`${BOOKING_SERVICE}/booking/${bookingId}`);
  },

  getByUser(userId: number, status?: string) {
    const url = status
      ? `${BOOKING_SERVICE}/booking/user/${userId}?status=${status}`
      : `${BOOKING_SERVICE}/booking/user/${userId}`;
    return apiFetch(url);
  },

  confirm(bookingId: number) {
    return apiFetch(`${BOOKING_SERVICE}/booking/${bookingId}/confirm`, {
      method: "PUT",
    });
  },

  reject(bookingId: number) {
    return apiFetch(`${BOOKING_SERVICE}/booking/${bookingId}/reject`, {
      method: "PUT",
    });
  },

  cancel(bookingId: number) {
    return apiFetch(`${BOOKING_SERVICE}/booking/${bookingId}/cancel`, {
      method: "PUT",
    });
  },

  complete(bookingId: number) {
    return apiFetch(`${BOOKING_SERVICE}/booking/${bookingId}/complete`, {
      method: "PUT",
    });
  },

  getByStatus(status: string) {
    return apiFetch(`${BOOKING_SERVICE}/booking/status/${status}`);
  },

  dispute(bookingId: number) {
    return apiFetch(`${BOOKING_SERVICE}/booking/${bookingId}/dispute`, {
      method: "PUT",
    });
  },

  updateStatus(bookingId: number, status: string) {
    return apiFetch(`${BOOKING_SERVICE}/booking/${bookingId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  },
};

// ── Payment Service ──

export const paymentApi = {
  createIntent(data: {
    booking_id: number;
    tutee_id: number;
    tutor_id: number;
    amount: number;
  }) {
    return apiFetch(`${PAYMENT_SERVICE}/payment/create-intent`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  checkout(data: {
    booking_id: number;
    tutee_id: number;
    tutor_id: number;
    amount: number;
  }) {
    return apiFetch(`${PAYMENT_SERVICE}/payment/checkout`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  completeCheckout(bookingId: number) {
    return apiFetch(`${PAYMENT_SERVICE}/payment/complete-checkout`, {
      method: "POST",
      body: JSON.stringify({ booking_id: bookingId }),
    });
  },

  capture(data: {
    booking_id: number;
    stripe_payment_intent_id: string;
  }) {
    return apiFetch(`${PAYMENT_SERVICE}/payment/capture`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  release(paymentId: number) {
    return apiFetch(`${PAYMENT_SERVICE}/payment/${paymentId}/release`, {
      method: "POST",
    });
  },

  refund(paymentId: number) {
    return apiFetch(`${PAYMENT_SERVICE}/payment/${paymentId}/refund`, {
      method: "POST",
    });
  },

  getByBooking(bookingId: number) {
    return apiFetch(`${PAYMENT_SERVICE}/payment/booking/${bookingId}`);
  },
};

// ── Booking Process Service (OutSystems) ──

export const bookingProcessApi = {
  initiate(data: {
    tutee_id: number;
    tutor_id: number;
    availability_id: number;
    lesson_date: string;
    start_time: string;
    end_time: string;
    amount: string;
    subject?: string;
    level?: string;
  }) {
    return apiFetch(`${BOOKING_PROCESS_SERVICE}/initiate`, {
      method: "POST",
      body: JSON.stringify({
        TuteeId: data.tutee_id,
        TutorId: data.tutor_id,
        AvailabilityId: data.availability_id,
        LessonDate: data.lesson_date,
        StartTime: data.start_time,
        EndTime: data.end_time,
        Amount: data.amount,
        Subject: data.subject,
        Level: data.level,
      }),
    });
  },

  confirm(bookingId: number) {
    return apiFetch(`${BOOKING_PROCESS_SERVICE}/confirm`, {
      method: "POST",
      body: JSON.stringify({ BookingId: bookingId }),
    });
  },

  reject(bookingId: number) {
    return apiFetch(`${BOOKING_PROCESS_SERVICE}/reject`, {
      method: "POST",
      body: JSON.stringify({ BookingId: bookingId }),
    });
  },

  completePayment(bookingId: number) {
    return apiFetch(`${BOOKING_PROCESS_SERVICE}/complete-payment`, {
      method: "POST",
      body: JSON.stringify({ BookingId: bookingId }),
    });
  },

  paymentCaptured(bookingId: number, stripePaymentIntentId: string) {
    return apiFetch(`${BOOKING_PROCESS_SERVICE}/payment-captured`, {
      method: "POST",
      body: JSON.stringify({
        BookingId: bookingId,
        StripePaymentIntentId: stripePaymentIntentId,
      }),
    });
  },

  complete(bookingId: number) {
    return apiFetch(`${BOOKING_PROCESS_SERVICE}/complete`, {
      method: "POST",
      body: JSON.stringify({ BookingId: bookingId }),
    });
  },

  cancel(bookingId: number, initiatedBy: "tutee" | "tutor") {
    return apiFetch(`${BOOKING_PROCESS_SERVICE}/cancel`, {
      method: "POST",
      body: JSON.stringify({
        BookingId: bookingId,
        InitiatedBy: initiatedBy,
      }),
    });
  },

  reportDispute(bookingId: number, reportedBy: string, reason: string) {
    return apiFetch(`${BOOKING_PROCESS_SERVICE}/ReportDispute`, {
      method: "POST",
      body: JSON.stringify({
        BookingId: bookingId,
        ReportedBy: reportedBy,
        Reason: reason,
      }),
    });
  },

  resolveDispute(bookingId: number, resolution: "refund" | "release") {
    return apiFetch(`${BOOKING_PROCESS_SERVICE}/ResolveDispute`, {
      method: "POST",
      body: JSON.stringify({
        BookingId: bookingId,
        Resolution: resolution,
      }),
    });
  },
};

// ── Review Service (OutSystems) ──

export const reviewApi = {
  create(data: { BookingId: number; TutorId: number; TuteeId: number; Rating: number }) {
    return fetch(`${REVIEW_SERVICE}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) => r.json());
  },

  getByTutor(tutorId: number) {
    return fetch(`${REVIEW_SERVICE}/review/tutor/${tutorId}`).then((r) => r.json());
  },

  getByTutee(tuteeId: number) {
    return fetch(`${REVIEW_SERVICE}/review/tutee/${tuteeId}`).then((r) => r.json());
  },
};

// ── Notification Service ──

export const notificationApi = {
  getByUser(userId: number) {
    return apiFetch(`${NOTIFICATION_SERVICE}/notify/user/${userId}`);
  },
};

// ── Profile data helpers ──
// The backend stores a single `subject` and `price_rate` but the frontend
// uses arrays of subjects with levels and rates. We bridge this by storing
// the full structured data as JSON in the `bio` field.

export interface SubjectEntry {
  subject: string;
  level: string;
  hourlyRate?: string;
  budget?: string;
}

export interface ProfileExtra {
  subjects?: SubjectEntry[];
  qualification?: string;
  location?: string;
  gender?: string;
  birthday?: string;
  contactNumber?: string;
}

export function encodeProfileExtra(extra: ProfileExtra): string {
  return JSON.stringify(extra);
}

export function decodeProfileExtra(bio: string | null): ProfileExtra {
  if (!bio) return {};
  try {
    return JSON.parse(bio);
  } catch {
    return {};
  }
}

// Convert day-of-week availability (e.g. { Monday: ["14:00-15:00"] })
// into actual date-based slots in the Availability Service for the next 4 weeks.
export async function syncAvailabilityToBackend(
  userId: number,
  availability: Record<string, string[]>
) {
  const dayMap: Record<string, number> = {
    Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4,
    Friday: 5, Saturday: 6, Sunday: 0,
  };

  const today = new Date();
  const slots: { date: string; start_time: string; end_time: string }[] = [];
  const seenSlotKeys = new Set<string>();

  // Generate slots for the next 2 weeks
  for (let week = 0; week < 2; week++) {
    for (const [dayName, timeSlots] of Object.entries(availability)) {
      const targetDay = dayMap[dayName];
      if (targetDay === undefined || !timeSlots?.length) continue;

      const date = new Date(today);
      date.setDate(today.getDate() + ((targetDay - today.getDay() + 7) % 7) + week * 7);

      const todayDateStr = today.toISOString().split("T")[0];
      const dateDateStr = date.toISOString().split("T")[0];
      if (dateDateStr < todayDateStr && week === 0) {
        date.setDate(date.getDate() + 7);
      }

      const dateStr = date.toISOString().split("T")[0];

      for (const timeSlot of timeSlots) {
        const [startStr, endStr] = timeSlot.split("-");
        if (!startStr || !endStr) continue;

        const startTime = startStr.includes(":") && startStr.split(":").length === 2
          ? startStr + ":00" : startStr;
        const endTime = endStr.includes(":") && endStr.split(":").length === 2
          ? endStr + ":00" : endStr;

        const key = `${dateStr}|${startTime}|${endTime}`;
        if (seenSlotKeys.has(key)) continue;
        seenSlotKeys.add(key);
        slots.push({ date: dateStr, start_time: startTime, end_time: endTime });
      }
    }
  }

  // Fetch existing slots
  const res = await availabilityApi.getSlots(userId);
  const existingSlots = res.availability || [];

  // Deduplicate existing Available slots — keep the first occurrence, delete the rest
  const seenExisting = new Map<string, any>();
  const duplicatesToDelete: any[] = [];
  for (const s of existingSlots) {
    const key = `${s.date}|${s.start_time}|${s.end_time}`;
    if (s.status === "Available") {
      if (seenExisting.has(key)) {
        duplicatesToDelete.push(s);
      } else {
        seenExisting.set(key, s);
      }
    }
  }
  await Promise.allSettled(
    duplicatesToDelete.map((s: any) => availabilityApi.deleteSlot(s.availability_id))
  );

  // Rebuild existingMap after dedup
  const existingMap = seenExisting;

  // Only create slots that don't already exist
  const slotsToCreate = slots.filter(
    (slot) => !existingMap.has(`${slot.date}|${slot.start_time}|${slot.end_time}`)
  );

  await Promise.all(
    slotsToCreate.map((slot) => availabilityApi.addSlot({ user_id: userId, ...slot }))
  );

  // Delete old Available slots that aren't in the new set
  const newSlotDates = new Set(slots.map((s) => `${s.date}|${s.start_time}|${s.end_time}`));
  const toDelete = [...existingMap.values()].filter(
    (s: any) => s.status === "Available" &&
      !newSlotDates.has(`${s.date}|${s.start_time}|${s.end_time}`)
  );
  await Promise.allSettled(
    toDelete.map((s: any) => availabilityApi.deleteSlot(s.availability_id))
  );

  console.log(`Created ${slotsToCreate.length} new slots, kept ${slots.length - slotsToCreate.length} existing`);
  return slots.length;
}

// Enrich a backend profile with decoded bio data for frontend display
export function enrichProfile(backendProfile: any): any {
  const extra = decodeProfileExtra(backendProfile.bio);

  let age: number | undefined;
  if (extra.birthday) {
    const dob = new Date(extra.birthday);
    const today = new Date();
    age = today.getFullYear() - dob.getFullYear();
    if (today < new Date(today.getFullYear(), dob.getMonth(), dob.getDate())) {
      age -= 1;
    }
  }

  return {
    ...backendProfile,
    id: backendProfile.user_id,
    userType: backendProfile.role?.toLowerCase() === "admin" ? "admin" : backendProfile.role?.toLowerCase() === "tutor" ? "tutor" : "student",
    name: backendProfile.name,
    subjects: extra.subjects || [],
    qualification: extra.qualification,
    location: extra.location || "Singapore",
    gender: extra.gender,
    birthday: extra.birthday,
    age,
    contactNumber: backendProfile.phone || extra.contactNumber,
    email: backendProfile.email,
  };
}
