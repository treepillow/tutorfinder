import { createBrowserRouter, Navigate } from "react-router";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterBasicDetails } from "./pages/RegisterBasicDetails";
import { RegisterTutorDetails } from "./pages/RegisterTutorDetails";
import { RegisterStudentDetails } from "./pages/RegisterStudentDetails";
import { AppLayout } from "./components/AppLayout";
import { DiscoveryPage } from "./pages/DiscoveryPage";
import { MatchedPage } from "./pages/MatchedPage";
import { RequestsPage } from "./pages/RequestsPage";
import { SchedulePage } from "./pages/SchedulePage";
import { ProfilePage } from "./pages/ProfilePage";
import { AdminDisputesPage } from "./pages/AdminDisputesPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { AdminUsersPage } from "./pages/AdminUsersPage";
import { AdminBookingsPage } from "./pages/AdminBookingsPage";
import { AdminPaymentsPage } from "./pages/AdminPaymentsPage";
import { PaymentsPage } from "./pages/PaymentsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <LoginPage />,
  },
  {
    path: "/register/tutor",
    element: <RegisterTutorDetails />,
  },
  {
    path: "/register/student",
    element: <RegisterStudentDetails />,
  },
  {
    path: "/app",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/app/discover" replace />,
      },
      {
        path: "admin",
        element: <Navigate to="/app/admin/dashboard" replace />,
      },
      {
        path: "discover",
        element: <DiscoveryPage />,
      },
      {
        path: "matched",
        element: <MatchedPage />,
      },
      {
        path: "requests",
        element: <RequestsPage />,
      },
      {
        path: "schedule",
        element: <SchedulePage />,
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
      {
        path: "payments",
        element: <PaymentsPage />,
      },
      {
        path: "admin/disputes",
        element: <AdminDisputesPage />,
      },
      {
        path: "admin/dashboard",
        element: <AdminDashboardPage />,
      },
      {
        path: "admin/users",
        element: <AdminUsersPage />,
      },
      {
        path: "admin/bookings",
        element: <AdminBookingsPage />,
      },
      {
        path: "admin/payments",
        element: <AdminPaymentsPage />,
      },
    ],
  },
]);