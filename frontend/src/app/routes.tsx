import { createBrowserRouter, Navigate } from "react-router";
import { LandingPage } from "./pages/LandingPage";
import { RegisterBasicDetails } from "./pages/RegisterBasicDetails";
import { RegisterTutorDetails } from "./pages/RegisterTutorDetails";
import { RegisterStudentDetails } from "./pages/RegisterStudentDetails";
import { AppLayout } from "./components/AppLayout";
import { DiscoveryPage } from "./pages/DiscoveryPage";
import { MatchedPage } from "./pages/MatchedPage";
import { RequestsPage } from "./pages/RequestsPage";
import { SchedulePage } from "./pages/SchedulePage";
import { ProfilePage } from "./pages/ProfilePage";
import { SettingsPage } from "./pages/SettingsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/register",
    element: <RegisterBasicDetails />,
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
        path: "settings",
        element: <SettingsPage />,
      },
    ],
  },
]);